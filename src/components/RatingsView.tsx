import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { ratingService, Rating, RatingAggregate } from '@/services/ratingService';
import { Loader2, MessageSquare, User, Clock, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RatingsViewProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'restaurant' | 'menu_item' | 'deal';
  targetId: number;
  targetName: string;
}

export const RatingsView: React.FC<RatingsViewProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName
}) => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [aggregate, setAggregate] = useState<RatingAggregate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadRatings = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await ratingService.getRatings(
        targetType,
        targetId,
        { page, limit: 10 },
        token || undefined
      );

      if (response.success && response.data) {
        if (page === 1) {
          setRatings(response.data.ratings);
        } else {
          setRatings(prev => [...prev, ...response.data.ratings]);
        }
        setAggregate(response.data.aggregate);
        setHasNextPage(response.data.pagination.hasNextPage);
        setCurrentPage(page);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to load ratings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast({
        title: "Error",
        description: "Failed to load ratings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [targetType, targetId, getToken, toast]);

  useEffect(() => {
    if (isOpen) {
      loadRatings(1);
    }
  }, [isOpen, loadRatings]);

  const loadMoreRatings = () => {
    if (!isLoading && hasNextPage) {
      loadRatings(currentPage + 1);
    }
  };

  const getTargetTypeDisplay = () => {
    switch (targetType) {
      case 'restaurant':
        return 'Restaurant';
      case 'menu_item':
        return 'Menu Item';
      case 'deal':
        return 'Deal';
      default:
        return 'Item';
    }
  };

  const RatingCard: React.FC<{ rating: Rating }> = ({ rating }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">{rating.user.displayName}</p>
            <div className="flex items-center gap-2">
              <StarRating rating={rating.rating} readOnly size="sm" />
              <span className="text-xs text-muted-foreground">
                {rating.rating}/5
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}
        </div>
      </div>
      
      {rating.comment && (
        <p className="text-sm text-muted-foreground pl-10">
          {rating.comment}
        </p>
      )}
    </div>
  );

  const RatingDistribution: React.FC<{ aggregate: RatingAggregate }> = ({ aggregate }) => (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((starCount) => {
        const distribution = aggregate.distribution.find(d => d.rating === starCount);
        const count = distribution?.count || 0;
        const percentage = aggregate.totalCount > 0 ? (count / aggregate.totalCount) * 100 : 0;
        
        return (
          <div key={starCount} className="flex items-center gap-2 text-sm">
            <span className="w-3">{starCount}</span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-xs text-muted-foreground text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {getTargetTypeDisplay()} Reviews
          </DialogTitle>
          <DialogDescription>
            Reviews for <strong>{targetName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Rating Summary */}
          {aggregate && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{aggregate.averageRating.toFixed(1)}</div>
                  <StarRating rating={aggregate.averageRating} readOnly size="sm" />
                  <div className="text-sm text-muted-foreground mt-1">
                    {aggregate.totalCount} review{aggregate.totalCount !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <RatingDistribution aggregate={aggregate} />
                </div>
              </div>
            </div>
          )}

          {/* Individual Ratings */}
          <div className="space-y-4">
            {isLoading && ratings.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading reviews...</span>
              </div>
            ) : ratings.length > 0 ? (
              <>
                {ratings.map((rating) => (
                  <RatingCard key={rating.id} rating={rating} />
                ))}
                
                {hasNextPage && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={loadMoreRatings}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Reviews'
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">
                  Be the first to share your experience!
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};