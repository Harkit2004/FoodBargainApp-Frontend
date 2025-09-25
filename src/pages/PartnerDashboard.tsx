import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Plus, Store, TrendingUp, Eye, Edit, Trash2, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  isActive: boolean;
  totalDeals: number;
  activeDeals: number;
  rating: number;
  totalViews: number;
}

interface Deal {
  id: number;
  title: string;
  restaurant: string;
  discountPercentage: number;
  status: 'active' | 'expired' | 'draft';
  views: number;
  claims: number;
  startDate: string;
  endDate: string;
}

const mockRestaurants: Restaurant[] = [
  {
    id: 1,
    name: "Mario's Pizzeria",
    address: "123 Main St, Toronto",
    isActive: true,
    totalDeals: 5,
    activeDeals: 3,
    rating: 4.8,
    totalViews: 1250
  }
];

const mockDeals: Deal[] = [
  {
    id: 1,
    title: "50% Off All Pizzas",
    restaurant: "Mario's Pizzeria",
    discountPercentage: 50,
    status: 'active',
    views: 324,
    claims: 42,
    startDate: "2024-01-15",
    endDate: "2024-01-25"
  },
  {
    id: 2,
    title: "Buy 2 Get 1 Free Pasta",
    restaurant: "Mario's Pizzeria",
    discountPercentage: 33,
    status: 'active',
    views: 189,
    claims: 28,
    startDate: "2024-01-10",
    endDate: "2024-01-30"
  }
];

export const PartnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants] = useState<Restaurant[]>(mockRestaurants);
  const [deals] = useState<Deal[]>(mockDeals);
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'deals'>('overview');

  const totalViews = deals.reduce((sum, deal) => sum + deal.views, 0);
  const totalClaims = deals.reduce((sum, deal) => sum + deal.claims, 0);
  const activeDealsCount = deals.filter(deal => deal.status === 'active').length;

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

  const DealCard: React.FC<{ deal: Deal }> = ({ deal }) => (
    <div className="bg-card rounded-xl p-4 shadow-custom-sm mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{deal.title}</h3>
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
      
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{deal.discountPercentage}%</p>
          <p className="text-xs text-muted-foreground">Discount</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">{deal.views}</p>
          <p className="text-xs text-muted-foreground">Views</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-success">{deal.claims}</p>
          <p className="text-xs text-muted-foreground">Claims</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
        <span>Ends: {new Date(deal.endDate).toLocaleDateString()}</span>
        <span>Started: {new Date(deal.startDate).toLocaleDateString()}</span>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button variant="destructive" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Total Views"
          value={totalViews.toString()}
          icon={<Eye className="w-5 h-5 text-primary" />}
          trend="+12%"
        />
        <StatCard
          title="Total Claims"
          value={totalClaims.toString()}
          icon={<Users className="w-5 h-5 text-success" />}
          trend="+8%"
          color="success"
        />
        <StatCard
          title="Active Deals"
          value={activeDealsCount.toString()}
          icon={<TrendingUp className="w-5 h-5 text-accent" />}
          color="accent"
        />
        <StatCard
          title="Revenue"
          value="$2,450"
          icon={<DollarSign className="w-5 h-5 text-secondary" />}
          trend="+15%"
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
            onClick={() => navigate('/partner/restaurants/create')}
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
        {deals.slice(0, 2).map(deal => (
          <DealCard key={deal.id} deal={deal} />
        ))}
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
          onClick={() => navigate('/partner/restaurants/create')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {restaurants.map(restaurant => (
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
              <p className="text-lg font-bold">{restaurant.rating}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{restaurant.activeDeals}</p>
              <p className="text-xs text-muted-foreground">Active Deals</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{restaurant.totalViews}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Manage
            </Button>
            <Button variant="default" size="sm" className="flex-1">
              View Menu
            </Button>
          </div>
        </div>
      ))}
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

      {deals.map(deal => (
        <DealCard key={deal.id} deal={deal} />
      ))}
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
              { key: 'overview', label: 'Overview' },
              { key: 'restaurants', label: 'Restaurants' },
              { key: 'deals', label: 'Deals' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
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

          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'restaurants' && renderRestaurants()}
          {activeTab === 'deals' && renderDeals()}
        </div>
      </MobileLayout>
      <BottomNavigation />
    </>
  );
};