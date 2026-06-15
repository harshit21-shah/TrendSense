import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[TrendSense] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 ring-1 ring-rose-500/20 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300 mb-1">Something went wrong</p>
            <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
