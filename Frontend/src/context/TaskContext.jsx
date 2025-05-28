import React, {useCallback, createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config/constants";
import { useAuth } from "../hooks/useAuth";

export const TaskContext = createContext({
  tasks: [],
  userTasks: [],
  assignedTasks: [],
  loading: false,
  error: null,
  fetchTasks: async () => {},
  fetchTask: async () => ({}),
  createTask: async () => ({}),
  updateTask: async () => ({}),
  deleteTask: async () => {},
  requestTask: async () => {},
  completeTask: async () => {},
  cancelTask: async () => {},
  disputeTask: async () => {},
});

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      // console.log(tasks)
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      // console.log("Fetching tasks from server...");

     
    // console.log("Requesting all tasks...");
    const allTasksRes = await axios.get(`${API_URL}/api/tasks`);
    // console.log("All tasks fetched.");

    // console.log("Requesting user tasks...");
    // const userTasksRes = await axios.get(`${API_URL}/api/tasks/user`);
    // console.log("User tasks fetched.");

    // console.log("Requesting assigned tasks...");
    const assignedTasksRes = await axios.get(`${API_URL}/api/tasks/assigned`);
    // console.log("Assigned tasks fetched.");

    // console.log("Task fetched...");

      setTasks(allTasksRes.data);
      // setUserTasks(userTasksRes.data);
      setAssignedTasks(assignedTasksRes.data);

      console.log(tasks)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchTask = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/api/tasks/created/${id}`);
      // console.log("this is at task context",res.data)
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch task");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      // console.log("we are creating task")

      const res = await axios.post(`${API_URL}/api/tasks`, taskData);
      //  console.log(res.data)
      setTasks((prev) => [...prev, res.data]);
      // console.log("task saved")
      setUserTasks((prev) => [...prev, res.data]);

      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.put(`${API_URL}/api/tasks/${id}`, taskData);
      const updatedTask = res.data;

      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setUserTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setAssignedTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );

      return updatedTask;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(`${API_URL}/api/tasks/${id}`);

      setTasks((prev) => prev.filter((task) => task._id !== id));
      setUserTasks((prev) => prev.filter((task) => task._id !== id));
      setAssignedTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestTask = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/api/tasks/${id}/request`);
      const updatedTask = res.data;

      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setAssignedTasks((prev) => [...prev, updatedTask]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/api/tasks/${id}/complete`);
      const updatedTask = res.data;

      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setUserTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setAssignedTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelTask = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/api/tasks/${id}/cancel`);
      const updatedTask = res.data;

      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setUserTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setAssignedTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disputeTask = async (id, reason) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/api/tasks/${id}/dispute`, {
        reason,
      });
      const updatedTask = res.data;

      setTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setUserTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
      setAssignedTasks((prev) =>
        prev.map((task) => (task._id === id ? updatedTask : task))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispute task");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        userTasks,
        assignedTasks,
        loading,
        error,
        fetchTasks,
        fetchTask,
        createTask,
        updateTask,
        deleteTask,
        requestTask,
        completeTask,
        cancelTask,
        disputeTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
