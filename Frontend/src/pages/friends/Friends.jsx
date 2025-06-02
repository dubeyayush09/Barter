import React, { useState, useEffect } from "react";
import axios from "axios";
import {API_URL} from "../../config/constants"
import { Search, UserPlus, Check, X, Users } from "lucide-react";

const Friends = () => {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/friends`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFriends(response.data);
    } catch (err) {
      setError("Failed to fetch friends");
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/friends/requests`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setFriendRequests(response.data);
    } catch (err) {
      setError("Failed to fetch friend requests");
    }
  };

  const searchUsers = async () => {
    if (!searchTerm) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/users/search?q=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUsers(response.data);
    } catch (err) {
      setError("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(
        `${API_URL}/api/friends/request/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Remove user from search results
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      setError("Failed to send friend request");
    }
  };

  const handleFriendRequest = async (requestId, status) => {
    try {
      await axios.put(
        `${API_URL}/api/friends/request/${requestId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Refresh friend requests and friends list
      fetchFriendRequests();
      if (status === "accepted") {
        fetchFriends();
      }
    } catch (err) {
      setError(`Failed to ${status} friend request`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Friends</h1>

        {/* Search Users */}
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchUsers()}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          <button
            onClick={searchUsers}
            className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-white bg-primary-600 rounded-r-md hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Search Results */}
      {users.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Search Results
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <img
                    src={
                      user.avatar ||
                      "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => sendFriendRequest(user._id)}
                  className="ml-4 p-2 text-primary-600 hover:bg-primary-50 rounded-full"
                >
                  <UserPlus className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Friend Requests
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {friendRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center mb-4">
                  <img
                    src={
                      request.requester.avatar ||
                      "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt={request.requester.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {request.requester.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.requester.email}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleFriendRequest(request._id, "rejected")}
                    className="p-2 text-error-500 hover:bg-error-50 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleFriendRequest(request._id, "accepted")}
                    className="p-2 text-success-500 hover:bg-success-50 rounded-full"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Friends</h2>
        {friends.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No friends yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start by searching for users and sending friend requests.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => {
              const friendUser =
                friend.requester._id === localStorage.getItem("userId")
                  ? friend.recipient
                  : friend.requester;

              return (
                <div
                  key={friend._id}
                  className="bg-white rounded-lg shadow p-4"
                >
                  <div className="flex items-center">
                    <img
                      src={
                        friendUser.avatar ||
                        "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      }
                      alt={friendUser.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {friendUser.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {friendUser.email}
                      </p>
                    </div>
                    <div
                      className={`ml-auto w-3 h-3 rounded-full ${
                        friendUser.status === "online"
                          ? "bg-success-500"
                          : "bg-gray-300"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-error-50 border-l-4 border-error-500 p-4">
          <p className="text-error-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Friends;
