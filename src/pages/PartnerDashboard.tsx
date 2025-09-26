import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Plus, Store, TrendingUp, Eye, Edit, Trash2, Users, DollarSign, Loader2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { partnerService, type Restaurant as ServiceRestaurant, type Deal as ServiceDeal } from '@/services/partnerService';
import { formatDateShort, getCurrentDateString } from '@/utils/dateUtils';

// Local interfaces for UI-specific data
interface Restaurant {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  totalDeals: number;
  activeDeals: number;
  rating: number;
}

interface Deal {
  id: number;
  title: string;
  restaurant: string;
  status: 'active' | 'expired' | 'draft';
  startDate: string;
  endDate: string;
}

export const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'deals'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
        const response = await partnerService.getRestaurants(token);
        if (response.success && response.data) {
          // Transform service data to UI format
          const transformedRestaurants: Restaurant[] = response.data.map((restaurant: ServiceRestaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            address: `${restaurant.streetAddress || ''} ${restaurant.city || ''}`.trim() || 'No address',
            isActive: restaurant.isActive,
            totalDeals: restaurant.totalDeals,
            activeDeals: restaurant.activeDeals,
            rating: restaurant.rating,
          }));
          setRestaurants(transformedRestaurants);
        } else {
          console.error('Failed to fetch restaurants:', response.error);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        toast({
          title: "Error",
          description: "Failed to load restaurants. Please try again.",
          variant: "destructive",
        });
      }
    };

    const fetchDeals = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        
        const response = await partnerService.getDeals(token);
        if (response.success && response.data) {
          // Transform service data to UI format
          const transformedDeals: Deal[] = response.data.map((deal: ServiceDeal) => ({
            id: deal.id,
            title: deal.title,
            restaurant: deal.restaurant.name,
            discountPercentage: 0, // TODO: This should come from backend
            status: deal.status as 'active' | 'expired' | 'draft',
            startDate: deal.startDate,
            endDate: deal.endDate,
          }));
          setDeals(transformedDeals);
        } else {
          console.error('Failed to fetch deals:', response.error);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: "Error",
          description: "Failed to load deals. Please try again.",
          variant: "destructive",
        });
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchRestaurants(), fetchDeals()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [getToken, toast]);

  const activeDealsCount = deals.filter(deal => deal.status === 'active').length;

  // Helper function to check if a deal can be activated
  const canActivateDeal = (deal: Deal): boolean => {
    if (deal.status !== 'draft') return false;
    
    const today = getCurrentDateString();
    return today >= deal.startDate && today <= deal.endDate;
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ReactNode; 
    trend?: string;
    color?: string;
  }> = ({ title, value, icon, trend, color = "primary" }) => (
    <div className="bg-card rounded-xl p-4 shadow-custom-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}/10`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs text-success font-medium">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );

  const handleActivateDeal = async (dealId: number) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await partnerService.updateDealStatus(dealId, 'active', token);
      if (response.success) {
        // Update the deal status in the local state
        setDeals(prev => prev.map(deal => 
          deal.id === dealId 
            ? { ...deal, status: 'active' as const }
            : deal
        ));
        toast({
          title: "Success",
          description: "Deal activated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to activate deal.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error activating deal:', error);
      toast({
        title: "Error",
        description: "Failed to activate deal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await partnerService.deleteDeal(dealId, token);
      if (response.success) {
        setDeals(prev => prev.filter(deal => deal.id !== dealId));
        toast({
          title: "Success",
          description: "Deal deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete deal.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast({
        title: "Error",
        description: "Failed to delete deal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const DealCard: React.FC<{ deal: Deal }> = ({ deal }) => (
    <div className={`bg-card rounded-xl p-4 shadow-custom-sm mb-3 ${
      canActivateDeal(deal) ? 'ring-2 ring-primary/20 border-primary/20' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{deal.title}</h3>
            {canActivateDeal(deal) && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                Ready to Activate
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{deal.restaurant}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          deal.status === 'active' 
            ? 'bg-success/10 text-success' 
            : deal.status === 'expired'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted text-muted-foreground'
        }`}>
          {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
        </span>
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
        <span>Ends: {formatDateShort(deal.endDate)}</span>
        <span>Started: {formatDateShort(deal.startDate)}</span>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => navigate(`/partner/deals/${deal.id}`)}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => navigate(`/partner/deals/${deal.id}/edit`)}
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        {canActivateDeal(deal) && (
          <Button 
            variant="default" 
            size="sm"
            onClick={() => handleActivateDeal(deal.id)}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-1" />
            Activate
          </Button>
        )}
        {deal.status === 'draft' && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => handleDeleteDeal(deal.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Active Deals"
          value={activeDealsCount.toString()}
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
          color="accent"
        />
        <StatCard
          title="Revenue"
          value="$0"
          icon={<DollarSign className="w-5 h-5 text-secondary" />}
          color="secondary"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="default" 
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/partner/deals/create')}
          >
            <Plus className="w-6 h-6" />
            Create Deal
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex-col gap-2"
            onClick={() => navigate('/partner/restaurant/create')}
          >
            <Store className="w-6 h-6" />
            Add Restaurant
          </Button>
        </div>
      </div>

      {/* Recent Deals */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Recent Deals</h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setActiveTab('deals')}
          >
            View All
          </Button>
        </div>
        {deals.length > 0 ? (
          deals.slice(0, 2).map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))
        ) : (
          <div className="bg-card rounded-xl p-6 shadow-custom-sm text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-semibold mb-2">No deals yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first deal to start attracting customers
            </p>
            <Button 
              variant="default"
              onClick={() => navigate('/partner/deals/create')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Create Your First Deal
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderRestaurants = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Restaurants</h3>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => navigate('/partner/restaurant/create')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {restaurants.length > 0 ? (
        restaurants.map(restaurant => (
          <div key={restaurant.id} className="bg-card rounded-xl p-4 shadow-custom-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold">{restaurant.name}</h4>
                <p className="text-sm text-muted-foreground">{restaurant.address}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                restaurant.isActive 
                  ? 'bg-success/10 text-success' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {restaurant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-lg font-bold">
                  {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{restaurant.activeDeals}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{restaurant.totalDeals}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate(`/partner/restaurants/${restaurant.id}/manage`)}
              >
                Manage
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate(`/partner/restaurants/${restaurant.id}/menu`)}
              >
                View Menu
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-card rounded-xl p-6 shadow-custom-sm text-center">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-semibold mb-2">No restaurants yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first restaurant to start managing your business
          </p>
          <Button 
            variant="default"
            onClick={() => navigate('/partner/restaurant/create')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Your First Restaurant
          </Button>
        </div>
      )}
    </div>
  );

  const renderDeals = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">All Deals</h3>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => navigate('/partner/deals/create')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Create
        </Button>
      </div>

      {deals.length > 0 ? (
        deals.map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))
      ) : (
        <div className="bg-card rounded-xl p-6 shadow-custom-sm text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-semibold mb-2">No deals created</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create deals to attract customers and boost your business
          </p>
          <Button 
            variant="default"
            onClick={() => navigate('/partner/deals/create')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Your First Deal
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <MobileLayout
        showHeader={true}
        headerTitle="Partner Dashboard"
        showBackButton={false}
      >
        <div className="px-mobile py-4 pb-20">
          {/* Tab Navigation */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            {[
              { key: 'overview' as const, label: 'Overview' },
              { key: 'restaurants' as const, label: 'Restaurants' },
              { key: 'deals' as const, label: 'Deals' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-background text-foreground shadow-custom-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'restaurants' && renderRestaurants()}
              {activeTab === 'deals' && renderDeals()}
            </>
          )}
        </div>
      </MobileLayout>
      <BottomNavigation />
    </>
  );
};