import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/constants";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotification: async () => {},
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket) {
      socket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        socket.off("notification");
      };
    }
  }, [socket]);

  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_URL}/api/notifications`);
      setNotifications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await axios.put(`${API_URL}/api/notifications/${id}/read`);

      setNotifications((notifications) =>
        notifications.map((notification) =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to mark notification as read"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.put(`${API_URL}/api/notifications/read-all`);

      setNotifications((notifications) =>
        notifications.map((notification) => ({ ...notification, read: true }))
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearNotification = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`${API_URL}/api/notifications/${id}`);

      setNotifications((notifications) =>
        notifications.filter((notification) => notification._id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
