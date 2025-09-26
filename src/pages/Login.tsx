import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { MobileLayout } from '@/components/MobileLayout';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout
      showHeader={true}
      headerTitle="Sign In"
      showBackButton={true}
      onBackClick={() => navigate('/')}
    >
      <div className="px-mobile py-6 min-h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back!</h2>
            <p className="text-muted-foreground">Sign in to your FoodBargain account</p>
          </div>

          {/* Clerk SignIn Component */}
          <div className="w-full max-w-md mx-auto">
            <SignIn 
              routing="virtual"
              redirectUrl="/"
              signUpUrl="/register"
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25',
                  card: 'shadow-none border-0 bg-gray-800/50 backdrop-blur-sm',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formFieldInput: 'bg-gray-700 border-gray-600 text-white focus:border-blue-500',
                  formFieldLabel: 'text-gray-300',
                  identityPreviewText: 'text-gray-300',
                  identityPreviewEditButton: 'text-blue-400 hover:text-blue-300',
                  footerActionText: 'text-gray-400',
                  footerActionLink: 'text-blue-400 hover:text-blue-300',
                  dividerText: 'text-gray-400',
                  dividerLine: 'bg-gray-600',
                  socialButtonsBlockButton: 'border-gray-600 bg-gray-700 text-white hover:bg-gray-600',
                  otpCodeFieldInput: 'bg-gray-700 border-gray-600 text-white',
                }
              }}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary font-medium hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};