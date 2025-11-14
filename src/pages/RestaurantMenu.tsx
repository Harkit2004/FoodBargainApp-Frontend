import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { RatingsView } from '@/components/RatingsView';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Plus, Edit, Trash2, Loader2, ChefHat, DollarSign, MessageSquareWarning } from 'lucide-react';
import { partnerService, Restaurant as RestaurantData } from '@/services/partnerService';
import { menuService, MenuSection, MenuItem } from '@/services/menuService';
import { commentReportsService, type CommentReportStatus } from '@/services/commentReportsService';
import { type Rating } from '@/services/ratingService';

export const RestaurantMenu: React.FC = () => {
  const navigate = useNavigate();
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [menuSections, setMenuSections] = useState<MenuSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingsViewOpen, setRatingsViewOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedRatingForReport, setSelectedRatingForReport] = useState<Rating | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isCheckingReportStatus, setIsCheckingReportStatus] = useState(false);
  const [ratingReportStatuses, setRatingReportStatuses] = useState<Record<number, CommentReportStatus>>({});
  const [reportStatusError, setReportStatusError] = useState<string | null>(null);

  const restaurantIdNumber = restaurantId ? parseInt(restaurantId, 10) : null;

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      if (!restaurantIdNumber) return;
      
      try {
        const token = await getToken();
        if (!token) return;

        setIsLoading(true);
        
        // Fetch restaurant details using partnerService
        const restaurantResponse = await partnerService.getRestaurant(restaurantIdNumber, token);
        if (restaurantResponse.success) {
          setRestaurant(restaurantResponse.data);
        } else {
          throw new Error(restaurantResponse.error || 'Failed to fetch restaurant details');
        }

        // Fetch menu sections and items using menuService
  const menuResponse = await menuService.getMenuSections(restaurantIdNumber, token);
        if (menuResponse.success) {
          setMenuSections(menuResponse.data || []);
        } else {
          console.warn('Failed to fetch menu sections:', menuResponse.error);
        }
      } catch (error) {
        console.error('Error fetching restaurant menu:', error);
        toast({
          title: "Error",
          description: "Failed to load restaurant menu. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantAndMenu();
  }, [restaurantIdNumber, getToken, toast]);

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  const handleDeleteItem = async (itemId: number, sectionId: number) => {
    if (!restaurantIdNumber) return;
    
    try {
      const token = await getToken();
      if (!token) return;

      const response = await menuService.deleteMenuItem(restaurantIdNumber, itemId, token);

      if (response.success) {
        // Update local state to remove the item
        setMenuSections(prev => 
          prev.map(section => 
            section.id === sectionId 
              ? { ...section, items: section.items?.filter(item => item.id !== itemId) || [] }
              : section
          )
        );
        toast({
          title: "Success",
          description: "Menu item deleted successfully.",
        });
      } else {
        throw new Error(response.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!restaurantIdNumber) return;
    
    try {
      const token = await getToken();
      if (!token) return;

      const response = await menuService.deleteMenuSection(restaurantIdNumber, sectionId, token);

      if (response.success) {
        // Update local state to remove the section
        setMenuSections(prev => prev.filter(section => section.id !== sectionId));
        toast({
          title: "Success",
          description: "Menu section deleted successfully.",
        });
      } else {
        throw new Error(response.error || 'Failed to delete menu section');
      }
    } catch (error) {
      console.error('Error deleting menu section:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete menu section. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateRatingReportStatus = (status: CommentReportStatus) => {
    setRatingReportStatuses((prev) => ({
      ...prev,
      [status.ratingId]: status,
    }));
  };

  const checkRatingReportStatus = async (ratingId: number) => {
    try {
      setIsCheckingReportStatus(true);
      const token = await getToken();
      if (!token) return;

      const response = await commentReportsService.checkReport(ratingId, token);
      if (response.success && response.data) {
        updateRatingReportStatus(response.data);
        setReportStatusError(null);
      } else if (response.error) {
        setReportStatusError(response.error);
      }
    } catch (error) {
      console.error('Error checking comment report status:', error);
      setReportStatusError("Unable to verify existing reports right now.");
    } finally {
      setIsCheckingReportStatus(false);
    }
  };

  const handleStartReport = async (rating: Rating) => {
    setSelectedRatingForReport(rating);
    setReportReason('');
    setReportDialogOpen(true);
    setReportStatusError(null);

    if (!ratingReportStatuses[rating.id]) {
      await checkRatingReportStatus(rating.id);
    }
  };

  const handleSubmitCommentReport = async () => {
    if (!selectedRatingForReport) return;

    const trimmedReason = reportReason.trim();
    if (trimmedReason.length === 0) {
      toast({
        title: 'Reason required',
        description: 'Please share why this comment should be reviewed.',
        variant: 'destructive',
      });
      return;
    }

    const existingStatus = ratingReportStatuses[selectedRatingForReport.id];
    if (existingStatus?.hasReported) {
      toast({
        title: 'Already reported',
        description: existingStatus.jiraTicketId
          ? `Ticket ${existingStatus.jiraTicketId} is already in review.`
          : 'This comment has already been escalated.',
        variant: 'default',
      });
      return;
    }

    try {
      setIsSubmittingReport(true);
      const token = await getToken();
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in again to submit a report.',
          variant: 'destructive',
        });
        return;
      }

      const response = await commentReportsService.submitReport(
        { ratingId: selectedRatingForReport.id, reason: trimmedReason },
        token
      );

      if (response.success && response.data) {
        toast({
          title: 'Report submitted',
          description: response.data.jiraTicketId
            ? `Ticket ${response.data.jiraTicketId} has been opened with Trust & Safety.`
            : 'Thanks! Our team will review this comment shortly.',
        });

        updateRatingReportStatus({
          hasReported: true,
          ratingId: selectedRatingForReport.id,
          jiraTicketId: response.data.jiraTicketId ?? null,
          createdAt: response.data.createdAt ?? new Date().toISOString(),
          metadata: undefined,
        });

  closeReportDialog();
      } else {
        toast({
          title: 'Unable to submit report',
          description: response.error || 'Please try again in a moment.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting comment report:', error);
      toast({
        title: 'Unable to submit report',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const closeReportDialog = () => {
    setReportDialogOpen(false);
    setSelectedRatingForReport(null);
    setReportReason('');
    setReportStatusError(null);
  };

  const selectedRatingStatus = selectedRatingForReport
    ? ratingReportStatuses[selectedRatingForReport.id]
    : undefined;

  if (isLoading) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Restaurant Menu"
        showBackButton={true}
        onBackClick={() => navigate('/partner')}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading menu...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showHeader={true}
      headerTitle={restaurant?.name || "Restaurant Menu"}
      showBackButton={true}
      onBackClick={() => navigate('/partner')}
    >
      <div className="px-mobile py-4 pb-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{restaurant?.name}</h1>
          {restaurant?.description && (
            <p className="text-muted-foreground">{restaurant.description}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            variant="default" 
            className="h-16 flex-col gap-2"
            onClick={() => navigate(`/partner/restaurants/${restaurantId}/menu/sections/create`)}
          >
            <Plus className="w-5 h-5" />
            Add Section
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => navigate(`/partner/restaurants/${restaurantId}/menu/items/create`)}
          >
            <ChefHat className="w-5 h-5" />
            Add Item
          </Button>
        </div>

        <div className="mb-6">
          <Button
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-2"
            disabled={!restaurantIdNumber}
            onClick={() => setRatingsViewOpen(true)}
          >
            <MessageSquareWarning className="w-4 h-4" />
            View Reviews & Report Comments
          </Button>
        </div>

        {/* Menu Sections */}
        {menuSections.length > 0 ? (
          <div className="space-y-6">
            {menuSections.map((section) => (
              <div key={section.id} className="bg-card rounded-xl p-4 shadow-custom-sm">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/partner/restaurants/${restaurantId}/menu/sections/${section.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Menu Items */}
                {section.items && section.items.length > 0 ? (
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between p-3 bg-background rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{item.name}</h3>
                            {!item.isAvailable && (
                              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                                Unavailable
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-success" />
                            <span className="font-semibold text-success">{formatPrice(item.priceCents)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/partner/restaurants/${restaurantId}/menu/items/${item.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id, section.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No items in this section yet</p>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/partner/restaurants/${restaurantId}/menu/items/create?sectionId=${section.id}`)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-8 shadow-custom-sm text-center">
            <ChefHat className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Menu Sections</h3>
            <p className="text-muted-foreground mb-6">
              Start building your menu by creating your first section
            </p>
            <Button
              variant="default"
              onClick={() => navigate(`/partner/restaurants/${restaurantId}/menu/sections/create`)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Section
            </Button>
          </div>
        )}
      </div>

      {restaurantIdNumber && (
        <RatingsView
          isOpen={ratingsViewOpen}
          onClose={() => setRatingsViewOpen(false)}
          targetType="restaurant"
          targetId={restaurantIdNumber}
          targetName={restaurant?.name || 'Restaurant'}
          enableCommentReports
          onReportComment={handleStartReport}
          reportedStatuses={ratingReportStatuses}
        />
      )}

      <Dialog
        open={reportDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setReportDialogOpen(true);
          } else {
            closeReportDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report user comment</DialogTitle>
            <DialogDescription>
              Flag unreasonable or inappropriate comments for FoodBargain admins to review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRatingForReport && (
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p className="font-semibold">{selectedRatingForReport.user.displayName}</p>
                <p className="text-muted-foreground">
                  {selectedRatingForReport.comment || 'No comment provided.'}
                </p>
                <p className="text-xs text-muted-foreground">Rated {selectedRatingForReport.rating}/5</p>
              </div>
            )}

            {selectedRatingStatus?.hasReported && (
              <p className="text-sm text-muted-foreground">
                This comment has already been reported
                {selectedRatingStatus.jiraTicketId ? ` (Ticket ${selectedRatingStatus.jiraTicketId})` : ''}.
              </p>
            )}

            {reportStatusError && (
              <p className="text-sm text-destructive">{reportStatusError}</p>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="report-reason">
                Reason for report
              </label>
              <Textarea
                id="report-reason"
                placeholder="Share why this comment should be reviewed"
                rows={4}
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                disabled={isSubmittingReport || selectedRatingStatus?.hasReported}
              />
              {isCheckingReportStatus && (
                <p className="text-xs text-muted-foreground">Checking existing reports...</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeReportDialog}
              disabled={isSubmittingReport}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmitCommentReport}
              disabled={
                isSubmittingReport ||
                isCheckingReportStatus ||
                selectedRatingStatus?.hasReported === true
              }
            >
              {isSubmittingReport ? 'Submitting...' : 'Submit report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};