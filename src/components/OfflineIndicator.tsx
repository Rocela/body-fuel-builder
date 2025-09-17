import { useOffline } from '@/hooks/useOffline';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 z-50">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4" />
        You're offline - some features may be limited
      </div>
    </div>
  );
};