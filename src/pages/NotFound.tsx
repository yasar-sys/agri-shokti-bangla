import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="mobile-container flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">৪০৪</h1>
        <p className="mb-6 text-xl text-muted-foreground">পাতা খুঁজে পাওয়া যায়নি</p>
        <Link 
          to="/home" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          হোমে ফিরে যান
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
