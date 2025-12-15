
import { WebDavConfig } from "../types";

// Define the shape of our exposed Electron API
interface ElectronAPI {
  webdavRequest: (data: any) => Promise<any>;
  openDirectory: () => Promise<string | null>;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export class WebDavClient {
  private config: WebDavConfig;
  private authHeader: string;

  constructor(config: WebDavConfig) {
    this.config = config;
    this.authHeader = 'Basic ' + btoa(unescape(encodeURIComponent(`${config.username}:${config.password}`)));
  }

  private getUrl(filename: string): string {
    const baseUrl = this.config.url.endsWith('/') ? this.config.url : `${this.config.url}/`;
    return `${baseUrl}${filename}`;
  }

  private async request(url: string, options: { method: string, headers: Record<string, string>, body?: string }): Promise<{ ok: boolean, status: number, text: string, headers: any }> {
    // 1. Electron IPC Proxy
    if (window.electronAPI?.isElectron) {
      try {
        const result = await window.electronAPI.webdavRequest({
          url,
          method: options.method,
          headers: options.headers,
          body: options.body
        });
        if (result.error) throw new Error(result.error);
        return result;
      } catch (e) {
        throw e;
      }
    } 
    // 2. Browser Fallback (For Docker/Web)
    else {
      try {
        const response = await fetch(url, {
          method: options.method,
          headers: options.headers,
          body: options.body
        });
        const text = await response.text();
        return {
          ok: response.ok,
          status: response.status,
          text,
          headers: response.headers
        };
      } catch (e: any) {
        if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
           throw new Error('WebDAV 连接失败: 请确保 NAS 允许跨域 (CORS) 或使用 HTTPS。');
        }
        throw e;
      }
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.request(this.config.url, {
        method: 'PROPFIND',
        headers: { 'Authorization': this.authHeader, 'Depth': '0' }
      });
      return response.status === 207 || response.status === 200;
    } catch (e) { return false; }
  }

  async uploadFile(filename: string, data: string): Promise<boolean> {
    try {
      const response = await this.request(this.getUrl(filename), {
        method: 'PUT',
        headers: { 'Authorization': this.authHeader, 'Content-Type': 'application/json' },
        body: data
      });
      return response.ok || response.status === 201 || response.status === 204;
    } catch (e) { return false; }
  }

  async downloadFile(filename: string): Promise<string | null> {
    try {
      const response = await this.request(this.getUrl(filename), {
        method: 'GET',
        headers: { 'Authorization': this.authHeader }
      });
      if (!response.ok) return null;
      return response.text;
    } catch (e) { return null; }
  }

  async getFileLastModified(filename: string): Promise<Date | null> {
    try {
      const response = await this.request(this.getUrl(filename), {
        method: 'PROPFIND',
        headers: { 'Authorization': this.authHeader, 'Depth': '0' }
      });
      if (!response.ok) return null;
      const match = response.text.match(/<.*?getlastmodified>(.*?)<\/.*?getlastmodified>/i);
      return match && match[1] ? new Date(match[1]) : null;
    } catch (e) { return null; }
  }
}
