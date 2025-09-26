import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { Profile } from "./pages/Profile";
import { ProfileEdit } from "./pages/ProfileEdit";
import { ProfileSettings } from "./pages/ProfileSettings";
import { ProfileNotifications } from "./pages/ProfileNotifications";
import { Favorites } from "./pages/Favorites";
import { NotificationsList } from "./pages/NotificationsList";
import { DealDetail } from "./pages/DealDetail";
import { Restaurants } from "./pages/Restaurants";
import { RestaurantDetail } from "./pages/RestaurantDetail";
import { PartnerDashboard } from "./pages/PartnerDashboard";
import { CreateDeal } from "./pages/CreateDeal";
import { CreateRestaurant } from "./pages/CreateRestaurant";
import { PartnerRegistration } from "./pages/PartnerRegistration";
import { RestaurantMenu } from "./pages/RestaurantMenu";
import { CreateMenuSection } from "./pages/CreateMenuSection";
import { EditMenuSection } from "./pages/EditMenuSection";
import { CreateMenuItem } from "./pages/CreateMenuItem";
import { EditMenuItem } from "./pages/EditMenuItem";
import { EditRestaurant } from "./pages/EditRestaurant";
import { ViewDeal } from "./pages/ViewDeal";
import { EditDeal } from "./pages/EditDeal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

const App = () => (
  <ClerkProvider 
    publishableKey={clerkPubKey}
    signInUrl="/login"
    signUpUrl="/register"
    signInFallbackRedirectUrl="/"
    signUpFallbackRedirectUrl="/register"
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/search" element={<Search />} />
              <Route path="/partner" element={<ProtectedRoute requirePartner={true}><PartnerDashboard /></ProtectedRoute>} />
              <Route path="/partner/register" element={<ProtectedRoute><PartnerRegistration /></ProtectedRoute>} />
              <Route path="/partner/deals/create" element={<ProtectedRoute requirePartner={true}><CreateDeal /></ProtectedRoute>} />
              <Route path="/partner/deals/:dealId" element={<ProtectedRoute requirePartner={true}><ViewDeal /></ProtectedRoute>} />
              <Route path="/partner/deals/:dealId/edit" element={<ProtectedRoute requirePartner={true}><EditDeal /></ProtectedRoute>} />
              <Route path="/partner/restaurant/create" element={<ProtectedRoute requirePartner={true}><CreateRestaurant /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
              <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              <Route path="/profile/notifications" element={<ProtectedRoute><ProfileNotifications /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsList /></ProtectedRoute>} />
              <Route path="/deals/:dealId" element={<ProtectedRoute><DealDetail /></ProtectedRoute>} />
              <Route path="/restaurants" element={<ProtectedRoute><Restaurants /></ProtectedRoute>} />
              <Route path="/restaurants/:id" element={<ProtectedRoute><RestaurantDetail /></ProtectedRoute>} />
              <Route path="/partner/restaurants/:restaurantId/menu" element={<ProtectedRoute requirePartner={true}><RestaurantMenu /></ProtectedRoute>} />
              <Route path="/partner/restaurants/:restaurantId/menu/sections/create" element={<ProtectedRoute requirePartner={true}><CreateMenuSection /></ProtectedRoute>} />
              <Route path="/partner/restaurants/:restaurantId/menu/sections/:sectionId/edit" element={<ProtectedRoute requirePartner={true}><EditMenuSection /></ProtectedRoute>} />
              <Route path="/partner/restaurants/:restaurantId/menu/items/create" element={<ProtectedRoute requirePartner={true}><CreateMenuItem /></ProtectedRoute>} />
              <Route path="/partner/restaurants/:restaurantId/menu/items/:itemId/edit" element={<ProtectedRoute requirePartner={true}><EditMenuItem /></ProtectedRoute>} />
              <Route path="/partner/restaurants/:restaurantId/manage" element={<ProtectedRoute requirePartner={true}><EditRestaurant /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
