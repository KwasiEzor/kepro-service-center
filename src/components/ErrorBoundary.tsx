import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  readonly props!: Props;
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center gradient-bg px-6">
          <div className="glass p-12 rounded-[40px] max-w-lg text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-text-primary">Something Went Wrong</h1>
            <p className="text-text-secondary mb-8">
              Unexpected error occurred. Refresh page or contact support.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-brand-red text-white rounded-full font-bold hover:scale-105 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
