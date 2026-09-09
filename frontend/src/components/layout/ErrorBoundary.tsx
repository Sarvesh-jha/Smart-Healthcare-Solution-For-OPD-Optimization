import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "../common/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                We've encountered an unexpected error. Don't worry, your health data is safe. 
                Please try refreshing the page or return home.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-700 hover:to-teal-600 text-white h-12 rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="w-full border-gray-200 text-gray-700 h-12 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 p-4 bg-slate-900 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-400">{this.state.error.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children || (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            The page you are looking for does not exist or has been moved.
          </p>
          <Button 
            onClick={() => window.location.href = "/"}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl shadow-md"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
}
