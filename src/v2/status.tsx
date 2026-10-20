import { Loader2, RotateCw } from 'lucide-react';
import { Button } from '../components/ui';

export const Failed = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div role="alert" className="p-3 rounded-card border border-bad/40 bg-bad/10 space-y-2">
    <p className="text-sm break-words">{message}</p>
    <Button size="sm" icon={<RotateCw className="w-4 h-4" aria-hidden />} onClick={onRetry}>Retry</Button>
  </div>
);

export const Loading = ({ label }: { label: string }) => (
  <p className="flex items-center gap-2 text-sm text-ink-2" role="status">
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />{label}
  </p>
);
