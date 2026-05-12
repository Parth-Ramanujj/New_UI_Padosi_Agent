import { Skeleton } from '@/components/ui/skeleton';

const ProtectedRouteSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Logo placeholder */}
        <Skeleton className="h-12 w-12 rounded-full" />
        
        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        
        {/* Loading bar */}
        <div className="w-48 mt-2">
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary/60 rounded-full animate-pulse origin-left" 
                 style={{ 
                   animation: 'loading-bar 1.5s ease-in-out infinite',
                   width: '60%'
                 }} 
            />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading-bar {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ProtectedRouteSkeleton;
