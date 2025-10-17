import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MobileLayout } from '@/components/MobileLayout';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Bell, Clock, CheckCircle, AlertCircle, Gift, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  dealId?: number;
}

export const NotificationsList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getToken } = useClerkAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [page] = useState(1);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await notificationService.getNotifications(
        page,
        20,
        filter === 'unread',
        token || undefined
      );
      setNotifications(response.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const markAsRead = async (id: number) => {
    try {
      const token = await getToken();
      await notificationService.markAsRead(id, token || undefined);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getToken();
      await notificationService.markAllAsRead(token || undefined);
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      toast({
        title: "All notifications marked as read",
        description: `${unreadCount} notifications marked as read`,
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deal_expiring':
      case 'new_deal':
        return <Gift className="w-5 h-5 text-green-500" />;
      case 'favorite_restaurant':
        return <Utensils className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => (
    <div
      className={`bg-card rounded-xl p-4 shadow-custom-sm mb-3 transition-all hover:shadow-custom-md cursor-pointer ${
        !notification.isRead ? 'border-l-4 border-l-primary' : ''
      }`}
      onClick={() => {
        if (!notification.isRead) {
          markAsRead(notification.id);
        }
        // Navigate to deal detail if dealId is present
        if (notification.dealId) {
          navigate(`/deals/${notification.dealId}`);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
              {notification.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(notification.createdAt)}
              </span>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </div>
          </div>
          
          <p className={`text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
            {notification.message}
          </p>
          
          {notification.dealId && (
            <div className="mt-2">
              <span className="text-xs text-primary font-medium">Tap to view deal →</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md mx-auto">
        <MobileLayout
          showHeader={true}
          headerTitle="Notifications"
          showBackButton={true}
          onBackClick={() => navigate('/')}
        >
          <div className="px-6 py-4 pb-20">
            {/* Header Stats */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Your Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              {(['all', 'unread'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    filter === tab
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'all' ? 'All' : 'Unread'}
                  {tab === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div>
                {filteredNotifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {filter === 'unread' 
                    ? 'All your notifications have been read!' 
                    : 'New notifications will appear here when you have them.'
                  }
                </p>
                <Button onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            )}
          </div>
        </MobileLayout>
        <BottomNavigation />
      </div>
    </div>
  );
};