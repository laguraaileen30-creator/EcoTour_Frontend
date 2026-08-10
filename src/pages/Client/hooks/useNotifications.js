import { useState, useEffect } from 'react';
import { getNotifications } from '../services/notificationService';

export default function useNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Reservation Approved', time: '2 hours ago', read: false },
    { id: 2, text: 'Payment Received', time: '1 day ago', read: false },
    { id: 3, text: 'New Announcement', time: '3 days ago', read: true },
  ]);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return { notifications, unreadCount, markAsRead };
}