import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AgentProfileSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <div className="flex-grow">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24">
          {/* Cover Page Skeleton */}
          <Skeleton className="h-32 sm:h-44 md:h-52 lg:h-60 w-full rounded-t-xl sm:rounded-t-2xl" />
          
          {/* Info Section */}
          <Card className="bg-card shadow-xl border-0 rounded-t-none rounded-b-xl sm:rounded-b-2xl relative">
            <CardContent className="p-3 sm:p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-3 md:gap-8">
                {/* Left Side: Avatar */}
                <div className="flex flex-col items-center md:items-start -mt-16 sm:-mt-24 md:-mt-28">
                  <Skeleton className="h-24 w-24 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full border-4 border-card" />
                  
                  {/* Social Links */}
                  <div className="flex gap-2 mt-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
                
                {/* Right Side: Info */}
                <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
                  {/* Name and Badges */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <Skeleton className="h-7 sm:h-8 w-48" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  
                  {/* Location */}
                  <Skeleton className="h-4 w-32 mx-auto md:mx-0 mb-3" />
                  
                  {/* Bio */}
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-3 w-full max-w-md mx-auto md:mx-0" />
                    <Skeleton className="h-3 w-3/4 max-w-sm mx-auto md:mx-0" />
                  </div>
                  
                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                  
                  {/* Contact Buttons */}
                  <div className="flex gap-3 justify-center md:justify-start">
                    <Skeleton className="h-10 w-32 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Sections */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-28 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AgentProfileSkeleton;
