import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, X, Bell } from "lucide-react";
import { useNotification } from "../../hooks/useNotification";
import { AnimatePresence, motion } from "framer-motion";

const NotificationDropdown = ({ onClose }) => {
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
  } = useNotification();

  // Add event listener to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        !target.closest(".notification-dropdown") &&
        !target.closest('button[aria-label="Notifications"]')
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "task":
        return (
          <div className="bg-primary-100 p-2 rounded-full text-primary-500">
            <Bell size={16} />
          </div>
        );
      case "friend":
        return (
          <div className="bg-secondary-100 p-2 rounded-full text-secondary-500">
            <Bell size={16} />
          </div>
        );
      case "credit":
        return (
          <div className="bg-accent-100 p-2 rounded-full text-accent-500">
            <Bell size={16} />
          </div>
        );
      default:
        return (
          <div className="bg-neutral-100 p-2 rounded-full text-neutral-500">
            <Bell size={16} />
          </div>
        );
    }
  };

  // Handle marking a notification as read
  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  // Handle clearing a notification
  const handleClearNotification = (id) => {
    clearNotification(id);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-20 notification-dropdown">
      <div className="px-4 py-2 border-b border-neutral-100 flex justify-between items-center">
        <h3 className="text-sm font-semibold">Notifications</h3>
        <button
          onClick={markAllAsRead}
          className="text-xs text-primary-500 hover:text-primary-600"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-3 text-sm text-neutral-500 text-center"
            >
              No notifications
            </motion.div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`px-4 py-3 hover:bg-neutral-50 flex items-start ${
                  !notification.read ? "bg-primary-50" : ""
                }`}
              >
                <div className="mr-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    {notification.relatedTo ? (
                      <Link
                        to={`/${notification.type}s/${notification.relatedTo}`}
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="text-neutral-700 hover:text-primary-500"
                      >
                        {notification.message}
                      </Link>
                    ) : (
                      <span className="text-neutral-700">
                        {notification.message}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="ml-2 flex flex-col space-y-1">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="text-primary-500 hover:text-primary-600 p-1"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleClearNotification(notification._id)}
                    className="text-neutral-400 hover:text-error-500 p-1"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationDropdown;
