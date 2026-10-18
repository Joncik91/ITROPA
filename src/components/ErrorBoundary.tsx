import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Short name of the region, shown in the fallback ("the tree view"). */
  label?: string;
  /** Changing this value resets the boundary (e.g. the id of the item being shown). */
  resetKey?: unknown;
  /** Render a compact inline fallback instead of a full-page one. */
  inline?: boolean;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Contains render-time crashes (typically from unexpected AI output) to the region that
 * failed, instead of unmounting the whole app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  private reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const what = this.props.label ?? "this view";
    if (this.props.inline) {
      return (
        <div role="alert" className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="flex-1">Couldn't display {what}. The data may be malformed.</span>
          <button onClick={this.reset} className="px-2 py-1 rounded border border-red-500/40 hover:bg-red-500/20">
            Retry
          </button>
        </div>
      );
    }

    return (
      <div role="alert" className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-semibold">Something went wrong in {what}</h2>
          <p className="text-sm opacity-70 break-words">{error.message}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={this.reset} className="px-3 py-1.5 rounded-lg border border-gray-500/50 text-sm flex items-center gap-1.5 hover:bg-gray-500/20">
              <RotateCcw className="w-4 h-4" /> Try again
            </button>
            <button onClick={() => window.location.reload()} className="px-3 py-1.5 rounded-lg border border-gray-500/50 text-sm hover:bg-gray-500/20">
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
