import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showHeader = true,
  headerTitle,
  showBackButton = false,
  onBackClick,
  className = "",
}) => {
  return (
    <div className={`min-h-screen bg-background ${className} flex justify-center`}>
      <div className="w-full max-w-md mx-auto">
        {showHeader && (
          <header className="bg-gradient-primary text-primary-foreground px-6 py-4 shadow-custom-md sticky top-0 z-50">
            <div className="flex items-center justify-between">
              {showBackButton && (
                <button
                  onClick={onBackClick}
                  className="p-2 hover:bg-primary-light/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h1 className="text-xl font-bold flex-1 text-center">{headerTitle || "FoodBargain"}</h1>
              {showBackButton && <div className="w-10" />} {/* Spacer for center alignment */}
            </div>
          </header>
        )}
        <main className="flex-1 pb-safe">
          {children}
        </main>
      </div>
    </div>
  );
};