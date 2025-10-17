import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { RatingDialog } from '@/components/RatingDialog';
import { RatingsView } from '@/components/RatingsView';
import { StarRating } from '@/components/ui/star-rating';
import { 
  Heart,
  MapPin, 
  Calendar,
  Share,
  ExternalLink,
  Utensils,
  DollarSign,
  Loader2,
  Star,
  MessageSquare
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { dealsService, Deal } from '@/services/dealsService';
import { partnerService } from '@/services/partnerService';
import { ratingService, MyRating } from '@/services/ratingService';
import { formatDateLong } from '@/utils/dateUtils';
import heroImage from '@/assets/hero-food.jpg';

// Using the Deal interface from dealsService

export const DealDetail: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingsViewOpen, setRatingsViewOpen] = useState(false);
  const [userRating, setUserRating] = useState<MyRating | null>(null);
  const [ratingStats, setRatingStats] = useState<{ averageRating: number; totalCount: number } | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!dealId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get token for authenticated requests (optional - deals might be public)
        const token = await getToken();
        
        // Try to get the deal - first attempt through general deals endpoint
        let response = await dealsService.getDealById(parseInt(dealId), token);
        
        // If that fails and we have a token, try the partner endpoint as a fallback
        if (!response.success && token) {
          try {
            const partnerResponse = await partnerService.getDeal(parseInt(dealId), token);
            if (partnerResponse.success && partnerResponse.data) {
              // Convert partner deal to the expected format
              response = {
                success: true,
                data: {
                  ...partnerResponse.data,
                  partner: { id: 0, businessName: '' }, // Add missing partner field
                  isBookmarked: false // Default value
                }
              };
            }
          } catch (partnerError) {
            console.log('Partner endpoint also failed, using original error');
          }
        }
        
        if (response.success && response.data) {
          setDeal(response.data);
        } else {
          console.error('Failed to fetch deal:', response.error);
          toast({
            title: "Error",
            description: "Failed to load deal details. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
        toast({
          title: "Error",
          description: "Failed to load deal details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeal();
  }, [dealId, getToken, toast]);

  // Load ratings data
  useEffect(() => {
    const loadRatingsData = async () => {
      if (!dealId) return;

      try {
        const token = await getToken();
        const dealIdNum = parseInt(dealId);

        // Get rating statistics
        const statsResponse = await ratingService.getRatingStats('deal', dealIdNum, token || undefined);
        if (statsResponse.success && statsResponse.data) {
          setRatingStats(statsResponse.data);
        }

        // Check if user has already rated
        const userRatingCheck = await ratingService.hasUserRated('deal', dealIdNum, token || undefined);
        if (userRatingCheck.hasRated && userRatingCheck.rating) {
          setUserRating(userRatingCheck.rating);
        }
      } catch (error) {
        console.error('Error loading ratings data:', error);
      }
    };

    loadRatingsData();
  }, [dealId, getToken]);

  const handleRatingSubmitted = async () => {
    // Reload ratings data after submission
    if (!dealId) return;

    try {
      const token = await getToken();
      const dealIdNum = parseInt(dealId);

      // Refresh rating statistics
      const statsResponse = await ratingService.getRatingStats('deal', dealIdNum, token || undefined);
      if (statsResponse.success && statsResponse.data) {
        setRatingStats(statsResponse.data);
      }

      // Refresh user rating
      const userRatingCheck = await ratingService.hasUserRated('deal', dealIdNum, token || undefined);
      if (userRatingCheck.hasRated && userRatingCheck.rating) {
        setUserRating(userRatingCheck.rating);
      }
    } catch (error) {
      console.error('Error reloading ratings data:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!deal) return;
    
    try {
      const token = await getToken();
      
      if (deal.isBookmarked) {
        const response = await dealsService.unfavoriteDeal(deal.id, token);
        if (response.success) {
          setDeal(prev => prev ? { ...prev, isBookmarked: false } : null);
          toast({
            title: "Removed from favorites",
            description: "Deal removed from your favorites",
          });
        }
      } else {
        const response = await dealsService.favoriteDeal(deal.id, token);
        if (response.success) {
          setDeal(prev => prev ? { ...prev, isBookmarked: true } : null);
          toast({
            title: "Added to favorites",
            description: "Deal added to your favorites",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isExpired = (deal: Deal) => {
    return deal.status === 'expired' || new Date(deal.endDate) < new Date();
  };

  const handleShare = async () => {
    if (!deal) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: deal.title,
          text: deal.description || '',
          url: window.location.href,
        });
        toast({
          title: 'Shared successfully',
          description: 'Deal has been shared',
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          description: 'Deal link has been copied to clipboard',
        });
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-md mx-auto">
          <MobileLayout showHeader={true} headerTitle="Deal Details" showBackButton={true}>
            <div className="px-6 py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading deal details...</p>
            </div>
          </MobileLayout>
          <BottomNavigation />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex justify-center">
        <div className="w-full max-w-md mx-auto">
          <MobileLayout showHeader={true} headerTitle="Deal Not Found" showBackButton={true}>
            <div className="px-6 py-12 text-center">
              <DollarSign className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Deal Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The deal you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </MobileLayout>
          <BottomNavigation />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout
          showHeader={true}
          headerTitle="Deal Details"
          showBackButton={true}
          onBackClick={() => navigate('/')}
        >
          <div className="pb-20">
            {/* Hero Image */}
            <div className="relative">
              <img 
                src={heroImage} 
                alt={deal.title}
                className="w-full h-48 object-cover"
              />

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleBookmark}
                  className="p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                >
                  <Heart 
                    className={`w-5 h-5 ${deal.isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                >
                  <Share className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isExpired(deal) 
                    ? 'bg-red-500/20 text-red-500' 
                    : 'bg-green-500/20 text-green-500'
                }`}>
                  {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="px-6 py-4">
              {/* Deal Title */}
              <div className="mb-4">
                <h1 className="text-2xl font-bold mb-2">{deal.title}</h1>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p className="text-muted-foreground leading-relaxed">{deal.description}</p>
              </div>

              {/* Cuisine and Dietary Tags */}
              {((deal.cuisines && deal.cuisines.length > 0) || (deal.dietaryPreferences && deal.dietaryPreferences.length > 0)) && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {deal.cuisines?.map((cuisine) => (
                      <span
                        key={`cuisine-${cuisine.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      >
                        {cuisine.name}
                      </span>
                    ))}
                    {deal.dietaryPreferences?.map((dietary) => (
                      <span
                        key={`dietary-${dietary.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30"
                      >
                        {dietary.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Restaurant Info */}
              <div className="bg-card rounded-xl p-4 shadow-custom-sm mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{deal.restaurant.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[deal.restaurant.streetAddress, deal.restaurant.city, deal.restaurant.province]
                        .filter(Boolean)
                        .join(', ') || 'Address not available'}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => navigate(`/restaurants/${deal.restaurant.id}`)}
                >
                  <Utensils className="w-4 h-4 mr-1" />
                  View Restaurant
                </Button>
              </div>

              {/* Deal Validity */}
              <div className="bg-card rounded-xl p-4 shadow-custom-sm mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Deal Validity
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{formatDateLong(deal.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">{formatDateLong(deal.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Ratings Section */}
              <div className="bg-card rounded-xl p-4 shadow-custom-sm mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Ratings & Reviews
                </h3>
                
                {ratingStats && ratingStats.totalCount > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold">{ratingStats.averageRating.toFixed(1)}</div>
                        <div>
                          <StarRating rating={ratingStats.averageRating} readOnly size="sm" />
                          <p className="text-sm text-muted-foreground mt-1">
                            {ratingStats.totalCount} review{ratingStats.totalCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRatingsViewOpen(true)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        View Reviews
                      </Button>
                    </div>

                    <Button
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={() => setRatingDialogOpen(true)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {userRating ? 'Update Your Rating' : 'Rate This Deal'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-3">No reviews yet</p>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setRatingDialogOpen(true)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Be the First to Review
                    </Button>
                  </div>
                )}

                {userRating && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Your rating:</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={userRating.rating} readOnly size="sm" />
                      <span className="text-sm font-medium">{userRating.rating}/5</span>
                    </div>
                    {userRating.comment && (
                      <p className="text-sm text-muted-foreground mt-2">"{userRating.comment}"</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  disabled={isExpired(deal)}
                  onClick={() => {
                    toast({
                      title: "Deal Activated!",
                      description: "Show this to the restaurant to redeem your deal.",
                    });
                  }}
                >
                  {isExpired(deal) ? 'Deal Expired' : 'Use This Deal'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/restaurants/${deal.restaurant.id}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Restaurant Menu
                </Button>
              </div>
            </div>
          </div>
        </MobileLayout>
        <BottomNavigation />

        {/* Rating Dialogs */}
        <RatingDialog
          isOpen={ratingDialogOpen}
          onClose={() => setRatingDialogOpen(false)}
          targetType="deal"
          targetId={deal.id}
          targetName={deal.title}
          existingRating={userRating ? {
            id: userRating.id,
            rating: userRating.rating,
            comment: userRating.comment || undefined
          } : undefined}
          onRatingSubmitted={handleRatingSubmitted}
        />

        <RatingsView
          isOpen={ratingsViewOpen}
          onClose={() => setRatingsViewOpen(false)}
          targetType="deal"
          targetId={deal.id}
          targetName={deal.title}
        />
      </div>
    </div>
  );
};