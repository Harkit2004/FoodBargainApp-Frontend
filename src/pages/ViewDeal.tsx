import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Edit, Trash2, Loader2, Calendar, MapPin, Tag, Users, DollarSign } from 'lucide-react';
import { partnerService, Deal } from '@/services/partnerService';
import { formatDateLong } from '@/utils/dateUtils';

export const ViewDeal: React.FC = () => {
  const navigate = useNavigate();
  const { dealId } = useParams<{ dealId: string }>();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!dealId) return;
      
      try {
        const token = await getToken();
        if (!token) return;

        setIsLoading(true);
        const response = await partnerService.getDeal(parseInt(dealId), token);

        if (response.success) {
          setDeal(response.data);
        } else {
          throw new Error(response.error || 'Failed to fetch deal');
        }
      } catch (error) {
        console.error('Error fetching deal:', error);
        toast({
          title: "Error",
          description: "Failed to load deal details. Please try again.",
          variant: "destructive",
        });
        navigate('/partner');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeal();
  }, [dealId, getToken, toast, navigate]);

  const handleDeleteDeal = async () => {
    if (!dealId || !deal) return;

    try {
      setIsDeleting(true);
      const token = await getToken();
      if (!token) return;

      const response = await partnerService.deleteDeal(parseInt(dealId), token);
      if (response.success) {
        toast({
          title: "Success",
          description: "Deal deleted successfully.",
        });
        navigate('/partner');
      } else {
        throw new Error(response.error || 'Failed to delete deal');
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete deal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'expired':
        return 'bg-destructive/10 text-destructive';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'archived':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };



  const InfoCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    className?: string;
  }> = ({ title, value, icon, className = "" }) => (
    <div className={`bg-card rounded-xl p-4 shadow-custom-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Deal Details"
        showBackButton={true}
        onBackClick={() => navigate('/partner')}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading deal details...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!deal) {
    return (
      <MobileLayout
        showHeader={true}
        headerTitle="Deal Details"
        showBackButton={true}
        onBackClick={() => navigate('/partner')}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Deal Not Found</h3>
            <p className="text-muted-foreground">
              The deal you're looking for doesn't exist or you don't have permission to access it.
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Deal Details"
      showBackButton={true}
      onBackClick={() => navigate('/partner')}
    >
      <div className="px-mobile py-4 pb-20">
        {/* Deal Header */}
        <div className="bg-card rounded-xl p-6 shadow-custom-sm mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{deal.title}</h1>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{deal.restaurant.name}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deal.status)}`}>
              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
            </span>
          </div>

          {deal.description && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{deal.description}</p>
            </div>
          )}
        </div>

        {/* Deal Information */}
        <div className="space-y-4 mb-6">
          <InfoCard
            title="Start Date"
            value={formatDateLong(deal.startDate)}
            icon={<Calendar className="w-5 h-5 text-primary" />}
          />
          <InfoCard
            title="End Date"
            value={formatDateLong(deal.endDate)}
            icon={<Calendar className="w-5 h-5 text-primary" />}
          />
          <InfoCard
            title="Restaurant Location"
            value={`${deal.restaurant.streetAddress || ''} ${deal.restaurant.city || ''} ${deal.restaurant.province || ''}`.trim() || 'No address provided'}
            icon={<MapPin className="w-5 h-5 text-primary" />}
          />
        </div>

        {/* Cuisines */}
        {deal.cuisines && deal.cuisines.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-custom-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Cuisines</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {deal.cuisines.map((cuisine) => (
                <span 
                  key={cuisine.id}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {cuisine.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Preferences */}
        {deal.dietaryPreferences && deal.dietaryPreferences.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-custom-sm mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Dietary Preferences</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {deal.dietaryPreferences.map((preference) => (
                <span 
                  key={preference.id}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                >
                  {preference.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/partner/deals/${deal.id}/edit`)}
            className="flex-1"
            disabled={isDeleting}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Deal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteDeal}
            disabled={isDeleting || deal.status !== 'draft'}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Deal
              </>
            )}
          </Button>
        </div>

        {deal.status !== 'draft' && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Only draft deals can be deleted
          </p>
        )}
      </div>
    </MobileLayout>
  );
};