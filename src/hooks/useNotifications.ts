import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { mockNotifications } from '../mockData';

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate fetching notifications
    setNotifications(mockNotifications.filter(n => n.userId === userId));
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  return { notifications, markAsRead };
}