import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto animate-fade-in">
          {/* Large 404 */}
          <div className="relative mb-6">
            <h1 className="text-[120px] sm:text-[160px] font-black text-primary/10 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 p-5 rounded-full">
                <Search className="h-10 w-10 sm:h-14 sm:w-14 text-primary" />
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8 text-sm sm:text-base leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2 font-semibold">
              <Link to="/">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/agents">
                <Search className="h-4 w-4" />
                Find PadosiAgent
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
