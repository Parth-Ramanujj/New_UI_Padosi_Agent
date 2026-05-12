import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentCardSkeletonProps {
  count?: number;
}

const AgentCardSkeleton = ({ count = 1 }: AgentCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden border border-border/40 bg-card rounded-xl">
          <CardContent className="p-0">
            {/* Cover Image Skeleton */}
            <Skeleton className="h-24 sm:h-28 w-full rounded-none" />
            
            {/* Content Section */}
            <div className="p-3 sm:p-4 -mt-8 sm:-mt-10 relative">
              {/* Avatar Skeleton */}
              <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-card mb-2" />
              
              {/* Name and Badges */}
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              
              {/* Location */}
              <Skeleton className="h-3 w-24 mb-3" />
              
              {/* Specializations */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-18 rounded-full" />
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Skeleton className="h-12 rounded-lg" />
                <Skeleton className="h-12 rounded-lg" />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default AgentCardSkeleton;
