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
        <div role="alert" className="p-3 rounded-card border border-bad/35 bg-bad/10 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-bad shrink-0" />
          <span className="flex-1">Couldn't show {what}. The saved data may be malformed; retry, or run the analysis again.</span>
          <button onClick={this.reset} className="px-3 min-h-[40px] md:min-h-[32px] rounded-control border border-bad/40 hover:bg-bad/10">
            Retry
          </button>
        </div>
      );
    }

    return (
      <div role="alert" className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-bad mx-auto" />
          <h2 className="text-lg font-semibold">Something went wrong in {what}</h2>
          <p className="text-sm text-ink-2 break-words">{error.message}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={this.reset} className="px-4 min-h-[44px] md:min-h-[38px] rounded-control border border-line text-sm flex items-center gap-1.5 hover:bg-ink/5">
              <RotateCcw className="w-4 h-4" /> Try again
            </button>
            <button onClick={() => window.location.reload()} className="px-4 min-h-[44px] md:min-h-[38px] rounded-control border border-line text-sm hover:bg-ink/5">
              Reload app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
