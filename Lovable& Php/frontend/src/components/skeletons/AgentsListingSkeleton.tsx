import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AgentCardSkeleton from './AgentCardSkeleton';

const AgentsListingSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-muted/30">
        <div className="container-content py-20 sm:py-24">
          {/* Header */}
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-3" />
            <Skeleton className="h-4 w-96 max-w-full mx-auto" />
          </div>
          
          {/* Filters Section */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
          
          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
          
          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <AgentCardSkeleton count={8} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AgentsListingSkeleton;
