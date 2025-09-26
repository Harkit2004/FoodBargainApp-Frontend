import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated (you would implement this with Clerk)
    const isAuthenticated = false; // Replace with actual auth check
    
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/welcome');
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="text-center text-primary-foreground">
        <div className="animate-spin w-8 h-8 border-2 border-primary-foreground border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg">Loading FoodieDeals...</p>
      </div>
    </div>
  );
};

export default Index;
