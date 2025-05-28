import React, {useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTask } from "../../hooks/useTask";
import { ArrowLeft, Calendar, Clock, CheckCircle } from "lucide-react";

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchTask, updateTaskStatus } = useTask();
  const [task,setTask]=useState(null);

  useEffect(() => {
    const getTask = async () => {
      try {
        const fetched = await fetchTask(id);
        console.log("This is at task detail",fetched)
        setTask(fetched);
        // console.log("task fetched in task detail",task)
      } catch (error) {
        console.error("Failed to fetch task", error);
      }
    };

    if(id) getTask();

    

   
  }, [id, fetchTask]);

  useEffect(() => {
    console.log("Updated task in state:", task);
  }, [task]);
  

  

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Task not found
          </h2>
         
          <button
            onClick={() => navigate("/tasks")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/tasks")}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tasks
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{task[0].title}</h1>

        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            <span>{new Date(task[0].deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            {/* <span>{task?.estimatedTime} hours</span> */}
          </div> 
         <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              task[0].status === "completed"
                ? "bg-green-100 text-green-800"
                : task[0].status === "in_progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {/* {task?.status.replace("_", " ").charAt(0).toUpperCase() +
              task?.status.slice(1)} */}
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-700">{task[0].description}</p>
        </div>

        {task[0].status !== "completed" && (
          <button
            onClick={() => updateTaskStatus(id, "completed")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Complete
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
