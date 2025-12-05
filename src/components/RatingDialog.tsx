import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@clerk/clerk-react';
import { ratingService, CreateRatingData, UpdateRatingData } from '@/services/ratingService';
import { tagService, ReviewTag } from '@/services/tagService';
import { Loader2, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'restaurant' | 'menu_item' | 'deal';
  targetId: number;
  targetName: string;
  existingRating?: {
    id: number;
    rating: number;
    comment?: string;
    tags?: Array<{ id: number; name: string; isCustom: boolean }>;
  };
  onRatingSubmitted?: () => void;
}

export const RatingDialog: React.FC<RatingDialogProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  existingRating,
  onRatingSubmitted
}) => {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<ReviewTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setComment(existingRating.comment || '');
      if (existingRating.tags) {
        setSelectedTags(existingRating.tags.map(t => t.id));
      } else {
        setSelectedTags([]);
      }
    } else {
      setRating(0);
      setComment('');
      setSelectedTags([]);
    }
  }, [existingRating, isOpen]);

  useEffect(() => {
    const fetchTags = async () => {
      const response = await tagService.getTags();
      if (response.success && response.data) {
        setAvailableTags(response.data);
      }
    };
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreatingTag(true);
    try {
      const token = await getToken();
      const response = await tagService.createTag(newTagName.trim(), token || '');
      if (response.success && response.data) {
        setAvailableTags(prev => [response.data!, ...prev]);
        setSelectedTags(prev => [...prev, response.data!.id]);
        setNewTagName('');
        toast({
          title: "Tag created",
          description: "Your custom tag has been added.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create tag",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();

      let response;
      if (existingRating) {
        // Update existing rating
        const updateData: UpdateRatingData = {
          rating,
          comment: comment.trim() || undefined,
          tags: selectedTags
        };
        response = await ratingService.updateRating(existingRating.id, updateData, token || undefined);
      } else {
        // Create new rating
        const createData: CreateRatingData = {
          targetType,
          targetId,
          rating,
          comment: comment.trim() || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined
        };
        response = await ratingService.createRating(createData, token || undefined);
      }

      if (response.success) {
        toast({
          title: existingRating ? "Rating updated" : "Rating submitted",
          description: `Your rating for ${targetName} has been ${existingRating ? 'updated' : 'submitted'}.`,
        });
        onRatingSubmitted?.();
        onClose();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to submit rating. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getTargetTypeDisplay = () => {
    switch (targetType) {
      case 'restaurant':
        return 'restaurant';
      case 'menu_item':
        return 'menu item';
      case 'deal':
        return 'deal';
      default:
        return 'item';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingRating ? 'Update Rating' : 'Rate this ' + getTargetTypeDisplay()}
          </DialogTitle>
          <DialogDescription>
            How would you rate <strong>{targetName}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div className="flex justify-center">
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
          </div>

          {/* Rating Description */}
          {rating > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Review Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCreateTag}
                disabled={isCreatingTag || !newTagName.trim()}
              >
                {isCreatingTag ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comment (Optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating < 1}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existingRating ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};