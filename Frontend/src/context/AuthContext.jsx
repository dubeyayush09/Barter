import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/constants";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const res = await axios.get(`${API_URL}/api/auth/me`);

        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error loading user:", err);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      // console.log("we are at authcontext this is res ",res);
      // console.log("we are at authcontext this is data",res.data);
      // console.log("we are at authcontext this is user",res.data.user);
      localStorage.setItem("userOfCreata", JSON.stringify(res.data.user));
    //  console.log(res.data.token)
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;

      const userRes = await axios.get(`${API_URL}/api/auth/me`);

      setUser(userRes.data);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;

      const userRes = await axios.get(`${API_URL}/api/auth/me`);

      setUser(userRes.data);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userOfCreata")
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.put(`${API_URL}/api/users/profile`, userData);

      setUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
