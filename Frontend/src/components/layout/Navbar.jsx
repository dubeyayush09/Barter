import React, { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Menu,
  X,
  Bell,
  MessageSquare,
  LogOut,
  User,
  Home,
  ClipboardList,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import NotificationDropdown from "../notification/NotificationDropDown";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  // console.log(localStorage.getItem("userOfCreata"))
  const savedUser = JSON.parse(localStorage.getItem("userOfCreata"));
  // console.log("we are at navbar ",userwa)
  // const userId = savedUser._id;
  

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/tasks", label: "Tasks", icon: <ClipboardList size={20} /> },
    { to: "/friends", label: "Connections", icon: <Users size={20} /> },
    { to: `/chat`, label: "Messages", icon: <MessageSquare size={20} /> },
    { to: "/credits", label: "Credits", icon: <Wallet size={20} /> },
  ];

  const isActiveLink = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className="bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-primary-500"
                >
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" />
                  <path d="M12 22v-2" />
                  <path d="m17 20.66-1-1.73" />
                  <path d="M11 10.27 7 3.34" />
                  <path d="m20.66 17-1.73-1" />
                  <path d="m3.34 7 1.73 1" />
                  <path d="M14 12h8" />
                  <path d="M2 12h2" />
                  <path d="m20.66 7-1.73 1" />
                  <path d="m3.34 17 1.73-1" />
                  <path d="m17 3.34-1 1.73" />
                  <path d="m7 20.66 1-1.73" />
                </svg>
                <span className="ml-2 text-xl font-bold text-primary-500">
                  XChangeUp
                </span>
              </Link>
            </div>
          </div>

          {isAuthenticated && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 flex items-center text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActiveLink(link.to)
                      ? "text-primary-500 bg-primary-50"
                      : "text-neutral-600 hover:text-primary-500 hover:bg-neutral-50"
                  }`}
                >
                  {link.icon}
                  <span className="ml-1">{link.label}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <div className="relative ml-3">
                  <button
                    onClick={toggleNotifications}
                    className="p-2 rounded-full text-neutral-600 hover:text-primary-500 hover:bg-neutral-50 relative"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-error-500 text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </div>

                <Link
                  to="/chat"
                  className="ml-2 p-2 rounded-full text-neutral-600 hover:text-primary-500 hover:bg-neutral-50"
                >
                  <MessageSquare size={20} />
                </Link>

                <div className="ml-3 relative">
                  <Link to="/profile" className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full border-2 border-neutral-200 object-cover"
                      src={
                        user?.avatar ||
                        "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      }
                      alt={user?.name || "Profile"}
                    />
                  </Link>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-4 p-2 rounded-full text-neutral-600 hover:text-error-500 hover:bg-neutral-50"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-black bg-primary-500 hover:bg-primary-600 rounded-md shadow-sm transition-colors duration-150"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-black bg-primary-500 hover:bg-primary-600 rounded-md shadow-sm transition-colors duration-150"
                >
                  Sign up
                </Link>
              </div>
            )}

            <div className="flex sm:hidden ml-3">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-neutral-600 hover:text-primary-500 hover:bg-neutral-50"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && isAuthenticated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    isActiveLink(link.to)
                      ? "bg-primary-50 text-primary-500"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-primary-500"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              ))}

              <Link
                to="/profile"
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  isActiveLink("/profile")
                    ? "bg-primary-50 text-primary-500"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-primary-500"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                <span className="ml-2">Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-neutral-600 hover:bg-neutral-50 hover:text-error-500 flex items-center"
              >
                <LogOut size={20} />
                <span className="ml-2">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
