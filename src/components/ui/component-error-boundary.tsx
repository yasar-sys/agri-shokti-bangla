import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'Unknown Component';
    
    logger.error(`Error in ${componentName}`, error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });

    this.props.onError?.(error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && this.props.resetKeys !== prevProps.resetKeys) {
      this.handleReset();
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const componentName = this.props.componentName || 'এই অংশ';

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">কিছু ভুল হয়েছে</h3>
              <p className="text-sm text-muted-foreground">
                {componentName}টি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="text-left p-4 bg-muted rounded-md max-h-40 overflow-auto">
                <p className="text-xs font-mono text-destructive">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="text-xs mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                পুনরায় চেষ্টা করুন
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                হোম পেজে যান
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ComponentErrorBoundary componentName={componentName} fallback={fallback}>
        <Component {...props} />
      </ComponentErrorBoundary>
    );
  };
}

// Async error boundary for handling async errors
export function AsyncErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      setError(new Error(event.reason));
      logger.error('Unhandled promise rejection', event.reason);
    };

    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, []);

  if (error) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[300px] p-6">
        <div className="max-w-md space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">লোডিং ব্যর্থ</h3>
            <p className="text-sm text-muted-foreground">
              ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।
            </p>
          </div>
          <Button onClick={() => setError(null)} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            পুনরায় চেষ্টা করুন
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
