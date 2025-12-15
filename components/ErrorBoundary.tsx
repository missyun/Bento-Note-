
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">出错了</h2>
        <p className="text-gray-600 mb-6 text-sm">
          应用程序遇到了一些问题。我们会持续改进稳定性。
        </p>
        <div className="bg-red-50 p-3 rounded text-left mb-6 overflow-auto max-h-32">
          <code className="text-xs text-red-600 font-mono">{error.message}</code>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
        >
          <RefreshCcw size={18} /> 尝试恢复
        </button>
      </div>
    </div>
  );
};

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;