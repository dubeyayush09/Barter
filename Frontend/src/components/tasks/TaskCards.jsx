import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Tag, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "../../config/constants";
import { useAuth } from "../../hooks/useAuth";
import { useTask } from "../../hooks/useTask";

const TaskCard = ({ task }) => {
  // console.log("wer are at taskcard ",  task)
  const { user } = useAuth();
  const { requestTask } = useTask();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateDescription = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  const hasRequested = task.requestedBy?.some(
    (requester) => requester._id === user?._id
  );
  const isCreator = task.createdBy._id === user?._id;

  const handleRequestTask = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await requestTask(task._id);
    } catch (error) {
      console.error("Failed to request task:", error);
    }
  };

  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${
              TASK_STATUS_COLORS[task.status]
            }-100 text-${TASK_STATUS_COLORS[task.status]}-800`}
          >
            {TASK_STATUS_LABELS[task.status]}
          </span>
          <span className="text-lg font-bold text-primary-600">
            {task.credits} credits
          </span>
        </div>

        <Link to={`/tasks/${task._id}`}>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2 hover:text-primary-600 transition-colors duration-150">
            {task.title}
          </h3>
        </Link>

        <p className="text-neutral-600 text-sm mb-4">
          {truncateDescription(task.description)}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-neutral-500">
            <User size={16} className="mr-2" />
            <span>Posted by {task.createdBy.name}</span>
          </div>

          {task.deadline && (
            <div className="flex items-center text-sm text-neutral-500">
              <Calendar size={16} className="mr-2" />
              <span>Due {formatDate(task.deadline)}</span>
            </div>
          )}

          {task.skills && task.skills.length > 0 && (
            <div className="flex items-center text-sm text-neutral-500">
              <Tag size={16} className="mr-2 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {task.skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {task.skills.length > 3 && (
                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 text-xs">
                    +{task.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 flex justify-between items-center">
        <Link
          to={`/tasks/${task._id}`}
          className="text-primary-600 font-medium text-sm hover:text-primary-700"
        >
          View Details
        </Link>

        {task.status === "open" && !isCreator && !task.assignedTo && (
          <button
            onClick={handleRequestTask}
            disabled={hasRequested}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              hasRequested
                ? "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                : "bg-primary-600 text-black hover:bg-primary-700"
            }`}
          >
            {hasRequested ? "Requested" : "Request Task"}
          </button>
        )}

        {task.status === "open" &&
          task.requestedBy?.length > 0 &&
          isCreator && (
            <div className="flex items-center text-sm text-neutral-600">
              <AlertCircle size={16} className="mr-1" />
              {task.requestedBy.length} request
              {task.requestedBy.length !== 1 ? "s" : ""}
            </div>
          )}
      </div>
    </motion.div>
  );
};

export default TaskCard;
