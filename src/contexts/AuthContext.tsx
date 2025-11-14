import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { apiService } from '@/services/api';

interface User {
  id: string;
  clerkUserId: string;
  email: string;
  displayName: string;
  isPartner?: boolean;
  isAdmin?: boolean;
  location?: string;
  phone?: string;
  cuisinePreferences?: number[];
  dietaryPreferences?: number[];
}

interface RegistrationData {
  displayName: string;
  location: string;
  phone?: string;
  cuisinePreferences: number[];
  dietaryPreferences: number[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkBackendAuth: () => Promise<void>;
  completeRegistration: (userData: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownAdminLanding, setHasShownAdminLanding] = useState(false);
  const { isSignedIn, user: clerkUser, isLoaded } = useUser();
  const { getToken, signOut } = useClerkAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user exists in our backend after Clerk authentication
  const checkBackendAuth = useCallback(async () => {
    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get JWT token from Clerk
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }

      // Check if user exists in our backend
      const response = await apiService.post<{ user: User }>('/auth/login', {
        clerkUserId: clerkUser.id
      }, token);

      if (response.success && response.data) {
        // User exists in backend, set user data
        setUser(response.data.user);
      } else if (response.requiresRegistration) {
        // User needs to complete registration in our backend
        setUser(null);
        navigate('/register', { 
          state: { 
            clerkUserId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName
          } 
        });
      } else {
        console.error('Backend auth failed:', response.error);
        setUser(null);
      }
    } catch (error) {
      console.error('Backend auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, clerkUser, getToken, navigate]);

  // Complete user registration in backend
  const completeRegistration = async (userData: RegistrationData) => {
    if (!clerkUser) {
      throw new Error('No Clerk user found');
    }

    try {
      const registrationData = {
        clerkUserId: clerkUser.id,
        displayName: userData.displayName || `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
        location: userData.location,
        phone: userData.phone,
        cuisinePreferences: userData.cuisinePreferences || [],
        dietaryPreferences: userData.dietaryPreferences || [],
      };

      const token = await getToken();
      const response = await apiService.post<{ user: User }>('/auth/register', registrationData, token);

      if (response.success && response.data) {
        setUser(response.data.user);
        navigate('/');
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Logout from both Clerk and our app
  const logout = async () => {
    try {
      // Sign out from Clerk
      await signOut();
      
  // Clear our user state
  setUser(null);
  setHasShownAdminLanding(false);
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check backend auth when Clerk auth state changes
  useEffect(() => {
    if (isLoaded) {
      checkBackendAuth();
    }
  }, [isLoaded, checkBackendAuth]);

  useEffect(() => {
    if (!isSignedIn) {
      if (hasShownAdminLanding) {
        setHasShownAdminLanding(false);
      }
      return;
    }

    if (user?.isAdmin) {
      if (!hasShownAdminLanding) {
        if (location.pathname !== '/admin/console') {
          navigate('/admin/console', {
            replace: location.pathname === '/admin/login' || location.pathname === '/login',
          });
        }
        setHasShownAdminLanding(true);
      }
    } else if (hasShownAdminLanding) {
      setHasShownAdminLanding(false);
    }
  }, [isSignedIn, user?.isAdmin, hasShownAdminLanding, location.pathname, navigate]);

  const value = {
    user,
    isAuthenticated: !!user && !!isSignedIn,
    isLoading: !isLoaded || isLoading,
    checkBackendAuth,
    completeRegistration,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};