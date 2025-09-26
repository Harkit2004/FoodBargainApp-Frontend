# 🍽️ FoodBargain App - Frontend

A modern, mobile-first React application for discovering and managing restaurant deals. Built with TypeScript, Tailwind CSS, and shadcn/ui for a beautiful, responsive user experience.

## 🌟 Features

### User Experience
- **🎨 Beautiful UI**: Modern gradient designs with neon effects and smooth transitions
- **📱 Mobile-First**: Fully responsive design optimized for mobile devices
- **🔍 Deal Discovery**: Browse and search active restaurant deals
- **❤️ Favorites System**: Save and manage favorite deals and restaurants  
- **📍 Location-Based**: Find deals near your current location
- **🏷️ Smart Filtering**: Filter by cuisine type, dietary preferences, and more
- **⭐ Rating System**: Rate and review restaurants, menu items, and deals
- **🔔 Real-time Updates**: Live deal status and availability updates

### Partner Dashboard
- **🏪 Restaurant Management**: Complete CRUD operations for restaurant profiles
- **📋 Menu Builder**: Create and organize menu sections with items and pricing
- **🎯 Deal Creator**: Design promotional deals with date ranges and targeting
- **📊 Analytics**: View restaurant metrics, deal counts, and ratings
- **🚀 Smart Activation**: Date-based deal activation system
- **👥 Customer Insights**: Monitor customer feedback and ratings

### Technical Highlights
- **⚡ Lightning Fast**: Vite-powered development with hot module replacement
- **🔒 Secure Authentication**: Clerk integration with role-based access control
- **🎯 Type Safety**: Full TypeScript coverage with strict mode
- **🌍 Timezone Safe**: Proper date handling across different timezones
- **💰 Precision Math**: Accurate financial calculations for pricing
- **📡 API Integration**: Comprehensive service layer with error handling

## 🛠️ Technology Stack

- **⚛️ React 18** - Modern React with hooks and concurrent features
- **📘 TypeScript** - Type-safe development with strict mode
- **⚡ Vite** - Fast build tool with instant HMR
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🧩 shadcn/ui** - Beautiful, accessible component library
- **🔐 Clerk** - Modern authentication with social logins
- **🧭 React Router** - Client-side routing with nested routes
- **🎉 Lucide Icons** - Beautiful, customizable icon library
- **🍞 React Hot Toast** - Elegant toast notifications

## 📋 Prerequisites

- **Node.js 18+** and npm
- **FoodBargain Backend** running on http://localhost:8000
- **Clerk Account** with configured application

## ⚙️ Installation

1. **Navigate to frontend directory**
   ```bash
   cd FoodBargainApp-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:8000/api

   # Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

   # App Configuration
   VITE_APP_NAME="FoodBargain"
   VITE_APP_VERSION="1.0.0"
   ```

4. **Clerk Setup**
   - Create a Clerk application at [clerk.com](https://clerk.com)
   - Configure authentication methods (email/password, Google, etc.)
   - Copy your Publishable Key to `.env`
   - Set up redirect URLs for your domain

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Access the app at: http://localhost:8080

### Production Build
```bash
npm run build
npm run preview
```

### Linting and Formatting
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
npm run type-check    # TypeScript type checking
```

## 📁 Project Structure

```
src/
├── assets/                 # Static assets (images, fonts)
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── BottomNavigation.tsx
│   ├── LocationPicker.tsx
│   ├── MobileLayout.tsx
│   ├── ProtectedRoute.tsx
│   └── RatingDialog.tsx
├── contexts/             # React context providers
│   ├── AuthContext.tsx
│   └── FavoritesContext.tsx
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                 # Utility libraries
└── pages/               # Application pages/routes
├── services/            # API service layer
├── utils/              # Utility functions
│   ├── dateUtils.ts
│   └── priceUtils.ts
├── App.tsx             # Main application component
├── index.css           # Global styles
└── main.tsx           # Application entry point
```

## 🎨 Styling System

### Tailwind CSS Configuration
The app uses a custom Tailwind configuration with:
- **Dark Theme**: Comprehensive dark mode color palette
- **Gradient Effects**: Beautiful gradient backgrounds and buttons
- **Responsive Design**: Mobile-first breakpoints
- **Custom Shadows**: Enhanced depth with custom shadow utilities
- **Neon Effects**: Special neon button variants for CTAs

### Component Library
Built on **shadcn/ui** providing:
- **Consistent Design**: Unified component system
- **Accessibility**: ARIA compliant components
- **Customizable**: Easy theme customization
- **Type Safety**: Full TypeScript support

### Key Design Elements
```css
/* Gradient backgrounds */
bg-gradient-to-br from-gray-900 via-black to-gray-900

/* Neon button effects */
.btn-neon {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #10b981);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* Custom shadows */
shadow-custom-sm /* Enhanced small shadows */
```

## 🧭 Routing Structure

```typescript
// Main application routes
/                          # Home page with deal discovery
/login                     # User authentication
/register                  # User registration
/profile                   # User profile management
/favorites                 # User's favorite deals
/deals/:id                 # Deal detail view
/restaurants/:id           # Restaurant detail view
/search                    # Advanced search functionality
/notifications             # User notifications

// Partner routes (protected)
/partner                   # Partner dashboard
/partner/register          # Partner registration
/partner/deals/create      # Create new deal
/partner/deals/:id         # View deal details
/partner/deals/:id/edit    # Edit deal
/partner/restaurants/create # Create restaurant
/partner/restaurants/:id/menu # Restaurant menu management
```

## 🔐 Authentication Flow

### Clerk Integration
```typescript
// AuthContext.tsx - Authentication state management
const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}>({
  isAuthenticated: false,
  user: null,
  loading: true,
});

// Usage in components
const { isAuthenticated, user } = useAuth();
const { getToken } = useClerkAuth();

// API calls with authentication
const token = await getToken();
const response = await api.get('/protected-endpoint', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Route Protection
```typescript
// ProtectedRoute component
<ProtectedRoute>
  <PartnerDashboard />
</ProtectedRoute>
```

## 📡 API Integration

### Service Layer Architecture
```typescript
// services/apiService.ts - Base API client
class ApiService {
  async request<T>(endpoint: string, options: RequestInit, token?: string): Promise<ApiResponse<T>>
  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>>
  async post<T>(endpoint: string, data: unknown, token?: string): Promise<ApiResponse<T>>
  // ... other HTTP methods
}

// services/dealsService.ts - Domain-specific service
class DealsService {
  async getDeals(params?: GetDealsParams, token?: string): Promise<ApiResponse<Deal[]>>
  async getDealById(dealId: number, token?: string): Promise<ApiResponse<Deal>>
  async favoriteDeal(dealId: number, token?: string): Promise<ApiResponse<void>>
  // ... other deal operations
}
```

### Error Handling
```typescript
// Comprehensive error handling with user feedback
try {
  const response = await dealsService.getDeals();
  if (response.success) {
    setDeals(response.data);
  } else {
    throw new Error(response.error);
  }
} catch (error) {
  toast({
    title: "Error",
    description: "Failed to load deals. Please try again.",
    variant: "destructive",
  });
}
```

## 🛠️ Utility Functions

### Date Utilities
```typescript
// utils/dateUtils.ts - Timezone-safe date handling
export const formatDate = (dateString: string): string => {
  // Parse date parts directly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```

### Price Utilities
```typescript
// utils/priceUtils.ts - Precision-safe currency operations
export const priceToCents = (priceString: string): number => {
  // Use string manipulation to avoid floating-point precision issues
  const dollarsParts = priceString.split('.');
  const dollars = parseInt(dollarsParts[0] || '0');
  const cents = dollarsParts[1] ? parseInt(dollarsParts[1].padEnd(2, '0').substring(0, 2)) : 0;
  return dollars * 100 + cents;
};
```

## 🎨 Component Examples

### Deal Card Component
```typescript
const DealCard: React.FC<{ deal: Deal }> = ({ deal }) => (
  <div className="bg-card rounded-xl p-4 shadow-custom-sm">
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-semibold">{deal.title}</h3>
      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(deal.status)}`}>
        {deal.status}
      </span>
    </div>
    <p className="text-muted-foreground mb-3">{deal.description}</p>
    <div className="flex gap-2">
      <Button onClick={() => navigate(`/deals/${deal.id}`)}>View Deal</Button>
      <Button variant="outline" onClick={() => toggleFavorite(deal.id)}>
        <Heart className={deal.isBookmarked ? 'fill-red-500' : ''} />
      </Button>
    </div>
  </div>
);
```

### Mobile Layout Wrapper
```typescript
const MobileLayout: React.FC<{
  showHeader?: boolean;
  headerTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  children: React.ReactNode;
}> = ({ showHeader, headerTitle, showBackButton, onBackClick, children }) => (
  <div className="min-h-screen bg-background max-w-md mx-auto">
    {showHeader && (
      <header className="bg-card shadow-sm p-4">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={onBackClick}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h1 className="font-semibold">{headerTitle}</h1>
        </div>
      </header>
    )}
    <main className="flex-1">{children}</main>
  </div>
);
```

## 🧪 Testing

### Testing Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

### Example Test
```typescript
// components/DealCard.test.tsx
import { render, screen } from '@testing-library/react';
import { DealCard } from './DealCard';

test('renders deal information correctly', () => {
  const mockDeal = {
    id: 1,
    title: 'Test Deal',
    description: 'Test Description',
    status: 'active' as const,
    // ... other required fields
  };

  render(<DealCard deal={mockDeal} />);
  
  expect(screen.getByText('Test Deal')).toBeInTheDocument();
  expect(screen.getByText('Test Description')).toBeInTheDocument();
});
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

The build outputs to `dist/` directory with:
- Optimized JavaScript bundles
- CSS with unused styles removed
- Compressed assets
- Service worker for caching (if configured)

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build command: npm run build
# Publish directory: dist
```

#### Railway
```dockerfile
# Dockerfile for Railway deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
```

### Environment Variables for Production
```env
VITE_API_URL=https://your-backend-api.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
VITE_APP_NAME="FoodBargain"
```

## 🔧 Configuration Files

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Tailwind Configuration
```javascript
// tailwind.config.ts
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      animation: {
        "fade-in-scale": "fadeInScale 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

## 🤝 Contributing

### Development Guidelines
1. **TypeScript**: All new code must be properly typed
2. **Components**: Use functional components with hooks
3. **Styling**: Follow Tailwind CSS utilities, avoid custom CSS
4. **Testing**: Add tests for new components and utilities
5. **Accessibility**: Ensure components are accessible (ARIA, keyboard navigation)

### Code Style
- Use ESLint and Prettier configurations
- Follow React hooks rules
- Use semantic HTML elements
- Implement proper error boundaries

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes with proper TypeScript types
3. Add/update tests as needed
4. Run linting and type checking
5. Update documentation if needed
6. Submit PR with clear description

## 📚 Additional Resources

- [**React Documentation**](https://react.dev/) - React 18 features and hooks
- [**TypeScript Handbook**](https://www.typescriptlang.org/docs/) - TypeScript best practices
- [**Tailwind CSS**](https://tailwindcss.com/docs) - Utility-first CSS framework
- [**shadcn/ui**](https://ui.shadcn.com/) - Component library documentation
- [**Clerk Documentation**](https://clerk.com/docs) - Authentication integration guide
- [**Vite Guide**](https://vitejs.dev/guide/) - Build tool configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using modern React and TypeScript**