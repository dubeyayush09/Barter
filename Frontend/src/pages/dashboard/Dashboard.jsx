import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTask } from "../../hooks/useTask";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Users,
  Activity,
} from "lucide-react";
import TaskCard from "../../components/tasks/TaskCards";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "../../config/constants";

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, userTasks, assignedTasks, loading, fetchTasks } = useTask();
  const [stats, setStats] = useState({
    openTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    earnedCredits: 0,
    spentCredits: 0,
  });

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Calculate stats when tasks update
  useEffect(() => {
    const openTasks = tasks.filter((task) => task.status === "open").length;
    const inProgressTasks = [...userTasks, ...assignedTasks].filter(
      (task) => task.status === "assigned"
    ).length;
    const completedTasks = [...userTasks, ...assignedTasks].filter(
      (task) => task.status === "completed"
    ).length;

    // Calculate credits earned from completed tasks that were assigned to the user
    const earnedCredits = assignedTasks
      .filter((task) => task.status === "completed")
      .reduce((total, task) => total + task.credits, 0);

    // Calculate credits spent on tasks created by the user that were completed
    const spentCredits = userTasks
      .filter((task) => task.status === "completed")
      .reduce((total, task) => total + task.credits, 0);

    setStats({
      openTasks,
      inProgressTasks,
      completedTasks,
      earnedCredits,
      spentCredits,
    });
  }, [tasks, userTasks, assignedTasks]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Render skeletons while loading
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-neutral-200 rounded-lg"></div>
            <div className="h-32 bg-neutral-200 rounded-lg"></div>
            <div className="h-32 bg-neutral-200 rounded-lg"></div>
          </div>
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-neutral-200 rounded-lg"></div>
            <div className="h-48 bg-neutral-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-neutral-600">
          Your current credit balance:{" "}
          <span className="font-semibold text-primary-600">
            {user?.creditBalance || 0} credits
          </span>
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
      >
        <motion.div
          variants={item}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 text-sm font-medium">
                Available Tasks
              </p>
              <h3 className="text-3xl font-bold mt-2 text-neutral-900">
                {stats.openTasks}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Tasks you can apply for
              </p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full text-primary-600">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/tasks"
              className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center"
            >
              View all tasks
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 text-sm font-medium">
                In Progress
              </p>
              <h3 className="text-3xl font-bold mt-2 text-neutral-900">
                {stats.inProgressTasks}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Tasks currently in progress
              </p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full text-secondary-600">
              <Activity size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/tasks"
              className="text-secondary-600 text-sm font-medium hover:text-secondary-700 flex items-center"
            >
              Manage in-progress tasks
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 text-sm font-medium">
                Credit Activity
              </p>
              <h3 className="text-3xl font-bold mt-2 text-neutral-900">
                {stats.earnedCredits - stats.spentCredits > 0 ? "+" : ""}
                {stats.earnedCredits - stats.spentCredits}
              </h3>
              <p className="mt-2 text-sm text-neutral-600">
                Net credits from completed tasks
              </p>
            </div>
            <div className="bg-accent-100 p-3 rounded-full text-accent-600">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/credits"
              className="text-accent-600 text-sm font-medium hover:text-accent-700 flex items-center"
            >
              View credit history
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Create task CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 text-black mb-10"
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold mb-2">
              Need help with something?
            </h2>
            <p className="text-white text-opacity-80">
              Create a task and find someone with the right skills
            </p>
          </div>
          <Link
            to="/tasks/create"
            className="bg-white text-black-600 px-5 py-2 rounded-md shadow-sm font-medium hover:bg-primary-50 transition duration-150 flex items-center"
          >
            <PlusCircle size={18} className="mr-2" />
            Create a Task
          </Link>
        </div>
      </motion.div>

      {/* Recent tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Recent Tasks</h2>
          <Link
            to="/tasks"
            className="text-primary-600 text-sm font-medium hover:text-primary-700"
          >
            View all tasks
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-primary-500 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No tasks available
            </h3>
            <p className="text-neutral-600 mb-6">
              There are no tasks available at the moment
            </p>
            <Link
              to="/tasks/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-primary-600 hover:bg-primary-700"
            >
              <PlusCircle size={16} className="mr-2" />
              Create a Task
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.slice(0, 6).map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Your tasks & assigned tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Your Tasks</h2>
            <Link
              to="/tasks/create"
              className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center"
            >
              <PlusCircle size={16} className="mr-1" />
              Create Task
            </Link>
          </div>

          {userTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-neutral-600">
                You haven't created any tasks yet
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-neutral-200">
                {userTasks.slice(0, 5).map((task) => (
                  <li key={task._id} className="hover:bg-neutral-50">
                    <Link to={`/tasks/${task._id}`} className="block p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-neutral-900 truncate">
                            {task.title}
                          </h3>
                          <div className="mt-1 flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${
                                TASK_STATUS_COLORS[task.status]
                              }-100 text-${
                                TASK_STATUS_COLORS[task.status]
                              }-800`}
                            >
                              {TASK_STATUS_LABELS[task.status]}
                            </span>
                            <span className="ml-2 text-xs text-neutral-500">
                              {task.credits} credits
                            </span>
                          </div>
                        </div>
                        {task.status === "open" && !task.assignedTo && (
                          <Clock size={16} className="text-primary-500" />
                        )}
                        {task.status === "assigned" && (
                          <Activity size={16} className="text-secondary-500" />
                        )}
                        {task.status === "completed" && (
                          <CheckCircle size={16} className="text-success-500" />
                        )}
                        {task.status === "disputed" && (
                          <AlertTriangle size={16} className="text-error-500" />
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {userTasks.length > 5 && (
                <div className="bg-neutral-50 px-4 py-3 text-right">
                  <Link
                    to="/tasks"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </Link>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-neutral-900">
              Assigned to You
            </h2>
            <Link
              to="/tasks"
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              Find Tasks
            </Link>
          </div>

          {assignedTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-neutral-600">
                You don't have any assigned tasks yet
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-neutral-200">
                {assignedTasks.slice(0, 5).map((task) => (
                  <li key={task._id} className="hover:bg-neutral-50">
                    <Link to={`/tasks/${task._id}`} className="block p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-neutral-900 truncate">
                            {task.title}
                          </h3>
                          <div className="mt-1 flex items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${
                                TASK_STATUS_COLORS[task.status]
                              }-100 text-${
                                TASK_STATUS_COLORS[task.status]
                              }-800`}
                            >
                              {TASK_STATUS_LABELS[task.status]}
                            </span>
                            <span className="ml-2 text-xs text-neutral-500">
                              {task.credits} credits
                            </span>
                          </div>
                        </div>
                        {task.status === "assigned" && (
                          <Activity size={16} className="text-secondary-500" />
                        )}
                        {task.status === "completed" && (
                          <CheckCircle size={16} className="text-success-500" />
                        )}
                        {task.status === "disputed" && (
                          <AlertTriangle size={16} className="text-error-500" />
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {assignedTasks.length > 5 && (
                <div className="bg-neutral-50 px-4 py-3 text-right">
                  <Link
                    to="/tasks"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </Link>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
