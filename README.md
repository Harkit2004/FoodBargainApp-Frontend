# FoodBargain App - Frontend

A modern, mobile-first React application for discovering and managing restaurant deals. Built with TypeScript, Tailwind CSS, and shadcn/ui for a beautiful, responsive user experience.

## Features

### User Experience
- **Beautiful UI**: Modern gradient designs with neon effects and smooth transitions.
- **Mobile-First**: Fully responsive design optimized for mobile devices.
- **Deal Discovery**: Browse and search active restaurant deals.
- **Favorites System**: Save and manage favorite deals and restaurants.
- **Location-Based**: Find deals near your current location.
- **Smart Filtering**: Filter by cuisine type, dietary preferences, and more.
- **Rating System**: Rate and review restaurants, menu items, and deals.
- **Review Filtering**: Filter reviews by tags (e.g., "Great Value", "Tasty") to quickly find relevant feedback.
- **Real-time Updates**: Live deal status and availability updates.
- **Dark Mode**: Fully integrated dark mode with seamless switching.

### Partner Dashboard
- **Restaurant Management**: Complete CRUD operations for restaurant profiles.
- **Menu Builder**: Create and organize menu sections with items and pricing.
- **Deal Creator**: Design promotional deals with date ranges and targeting.
- **Analytics**: View restaurant metrics, deal counts, and ratings.
- **Smart Activation**: Date-based deal activation system.
- **Customer Insights**: Monitor customer feedback and ratings.

### Admin Console
- **User Management**: View and manage user accounts.
- **Content Moderation**: Review and moderate reported comments and deals.
- **Tag Management**: Create and delete global review tags.
- **Banning System**: Ban users who violate platform policies.

### Technical Highlights
- **Lightning Fast**: Vite-powered development with hot module replacement.
- **Secure Authentication**: Clerk integration with role-based access control.
- **Type Safety**: Full TypeScript coverage with strict mode.
- **Timezone Safe**: Proper date handling across different timezones.
- **Precision Math**: Accurate financial calculations for pricing.
- **API Integration**: Comprehensive service layer with error handling.

## Technology Stack

- **React 18**: Modern React with hooks and concurrent features.
- **TypeScript**: Type-safe development with strict mode.
- **Vite**: Fast build tool with instant HMR.
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Beautiful, accessible component library.
- **Clerk**: Modern authentication with social logins.
- **React Router**: Client-side routing with nested routes.
- **Lucide Icons**: Beautiful, customizable icon library.
- **React Hot Toast**: Elegant toast notifications.

## Prerequisites

- **Node.js 18+** and npm
- **FoodBargain Backend** running on http://localhost:8000
- **Clerk Account** with configured application

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd FoodBargainApp-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with your configuration:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:8000/api

   # Clerk Authentication
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

   # Image Uploads (Vercel Blob)
   VITE_BLOB_READ_WRITE_TOKEN=rw_your_vercel_blob_token_here

   # App Configuration
   VITE_APP_NAME="FoodBargain"
   VITE_APP_VERSION="1.0.0"
   ```

4. **Clerk Setup**
   - Create a Clerk application at clerk.com.
   - Configure authentication methods (email/password, Google, etc.).
   - Copy your Publishable Key to `.env`.
   - Set up redirect URLs for your domain.

## Running the Application

### Development Mode
```bash
npm run dev
```
Access the app at: http://localhost:8080

### Production Build
```bash
npm run build
```

## Project Structure

```
src/
├── assets/         # Static assets (images, fonts)
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries
├── pages/          # Application pages/routes
├── services/       # API service layer
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```
