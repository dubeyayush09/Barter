import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../../hooks/useTask';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, CheckCircle, User, AlertCircle } from 'lucide-react';
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '../../config/constants';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchTask, assignTask, completeTask, requestTask } = useTask();
  const [task, setTask] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      console.log("this is id ",id)
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setLoading(true);
      const taskData = await fetchTask(id);
      // console.log("we are at task detail",taskData);
      setTask(taskData);
    } catch (err) {
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };
 

  const handleAssignTask = async (userId) => {
    try {
      await assignTask(id, userId);
      await loadTask();
    } catch (err) {
      setError(err.message || 'Failed to assign task');
    }
  };

  const handleCompleteTask = async () => {
    try {
      await completeTask(id);
      await loadTask();
    } catch (err) {
      setError(err.message || 'Failed to complete task');
    }
  };

  const handleRequestTask = async () => {
    try {
      await requestTask(id);
      await loadTask();
    } catch (err) {
      setError(err.message || 'Failed to request task');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            {error || 'Task not found'}
          </h2>
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const isCreator = task[0].createdBy._id === user?._id;
  const isAssigned = task[0].assignedTo?._id === user?._id;
  const hasRequested = task[0].requestedBy?.some(requester => requester._id === user?._id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/tasks")}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white rounded-md hover:bg-neutral-50 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tasks
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {task[0].title}
              </h1>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${
                    TASK_STATUS_COLORS[task.status]
                  }-100 text-${TASK_STATUS_COLORS[task.status]}-800`}
                >
                  {TASK_STATUS_LABELS[task[0].status]}
                </span>
                <span className="text-lg font-bold text-primary-600">
                  {task[0].credits} credits
                </span>
              </div>
            </div>
            {task[0].status === "open" && !isCreator && !hasRequested && (
              <button
                onClick={handleRequestTask}
                className="px-4 py-2 text-sm font-medium text-black bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Request Task
              </button>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-neutral-700">{task[0].description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center text-neutral-600">
                <User className="w-5 h-5 mr-2" />
                <span>Posted by {task[0].createdBy.name}</span>
              </div>
              {task[0].deadline && (
                <div className="flex items-center text-neutral-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>
                    Due {new Date(task[0].deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              {task[0].estimatedTime && (
                <div className="flex items-center text-neutral-600">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Estimated {task[0].estimatedTime} hours</span>
                </div>
              )}
            </div>

            {task[0].skills && task[0].skills.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task[0].skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isCreator &&
            task[0].status === "open" &&
            task[0].requestedBy &&
            task[0].requestedBy.length > 0 && (
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">
                  Task Requests
                </h3>
                <div className="space-y-4">
                  {task[0].requestedBy.map((requester) => (
                    <div
                      key={requester._id}
                      className="flex items-center justify-between bg-neutral-500 p-4 rounded-lg"
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            requester.avatar ||
                            "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                          }
                          alt={requester.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-50">
                            {requester.name}
                          </p>
                          <p className="text-sm text-neutral-900">
                            {requester.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAssignTask(requester)}
                          className="px-4 py-2 text-sm font-medium text-black bg-primary-600 rounded-md hover:bg-primary-700"
                        >
                          Assign Task
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {task[0].status === "assigned" && (
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={
                      task[0].assignedTo.avatar ||
                      "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt={task[0].assignedTo.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-900">
                      Assigned to {task[0].assignedTo.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {task[0].assignedTo.email}
                    </p>
                  </div>
                </div>
                {isAssigned && (
                  <button
                    onClick={handleCompleteTask}
                    className="px-4 py-2 text-sm font-medium text-black bg-success-600 rounded-md hover:bg-success-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Mark as Complete
                  </button>
                )}
                {isCreator &&
                  task[0].completionConfirmation.performer === true && (
                    <button
                      onClick={handleCompleteTask}
                      className="px-4 py-2 text-sm font-medium text-black bg-success-600 rounded-md hover:bg-success-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                      Mark as Complete
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
export default TaskDetails;