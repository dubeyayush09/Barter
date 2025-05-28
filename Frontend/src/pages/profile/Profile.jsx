import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";
import {
  Edit2,
  MapPin,
  Calendar,
  Mail,
  Link as LinkIcon,
  Award,
  Star,
  Clock,
} from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
    avatar: user?.avatar || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || "",
        skills: user.skills,
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleChange = (
    e
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white shadow rounded-lg overflow-hidden"
      >
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

        {/* Profile Header */}
        <div className="relative px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="relative -mt-20 mb-4 sm:mb-0">
              <img
                src={
                  user?.avatar ||
                  "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                }
                alt={user?.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              {!id && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors duration-200"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            <div className="ml-0 sm:ml-6 text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-neutral-900">
                {user?.name}
              </h1>
              <p className="text-neutral-600 mt-1">
                {user?.bio || "No bio yet"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {user?.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex flex-col items-center bg-neutral-50 rounded-lg p-4">
                <span className="text-2xl font-bold text-primary-600">
                  {user?.creditBalance}
                </span>
                <span className="text-sm text-neutral-600">Credits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        {isEditing ? (
          <div className="p-6 border-t border-neutral-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-neutral-700"
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 border-t border-neutral-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats */}
              <div className="bg-neutral-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Statistics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center text-primary-600 mb-2">
                      <Award size={20} />
                      <span className="ml-2 text-sm font-medium">
                        Completed Tasks
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-neutral-900">
                      24
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center text-secondary-600 mb-2">
                      <Star size={20} />
                      <span className="ml-2 text-sm font-medium">
                        Average Rating
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-neutral-900">
                      4.8
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center text-accent-600 mb-2">
                      <Clock size={20} />
                      <span className="ml-2 text-sm font-medium">
                        Response Time
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-neutral-900">
                      2h
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center text-primary-600 mb-2">
                      <Award size={20} />
                      <span className="ml-2 text-sm font-medium">
                        Success Rate
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-neutral-900">
                      98%
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-neutral-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="text-neutral-500 w-5 h-5" />
                    <span className="ml-3 text-neutral-600">{user?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="text-neutral-500 w-5 h-5" />
                    <span className="ml-3 text-neutral-600">
                      San Francisco, CA
                    </span>
                  </div>
                  <div className="flex items-center">
                    <LinkIcon className="text-neutral-500 w-5 h-5" />
                    <a
                      href="#"
                      className="ml-3 text-primary-600 hover:text-primary-700"
                    >
                      portfolio.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
