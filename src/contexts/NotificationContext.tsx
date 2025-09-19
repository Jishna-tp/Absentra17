import React, { createContext, useContext, useState, useEffect } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('absentra_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const withDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(withDates);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('absentra_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Listen for system events to create notifications
  useEffect(() => {
    const handleLeaveRequestEvent = (event: CustomEvent) => {
      const { type, title, message } = event.detail;
      addNotification({
        title,
        message,
        type: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success'
      });
    };

    // Listen for toast events and convert them to notifications
    window.addEventListener('showToast', handleLeaveRequestEvent as EventListener);

    return () => {
      window.removeEventListener('showToast', handleLeaveRequestEvent as EventListener);
    };
  }, []);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50 notifications
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Add some sample notifications on first load
  useEffect(() => {
    const hasInitialized = localStorage.getItem('absentra_notifications_initialized');
    if (!hasInitialized) {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          title: 'Welcome to Absentra',
          message: 'Your account has been set up successfully. You can now submit leave requests and manage your profile.',
          type: 'success',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false
        },
        {
          id: '2',
          title: 'System Maintenance Scheduled',
          message: 'The system will undergo maintenance on Sunday from 2:00 AM to 4:00 AM. Please plan accordingly.',
          type: 'info',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: false
        },
        {
          id: '3',
          title: 'Holiday Reminder',
          message: 'Christmas Day is coming up on December 25th. The office will be closed.',
          type: 'info',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          read: true
        }
      ];
      
      setNotifications(sampleNotifications);
      localStorage.setItem('absentra_notifications_initialized', 'true');
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};