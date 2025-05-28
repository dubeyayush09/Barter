import React from "react";
import { useTask } from "../../hooks/useTask";

function Tasks() {
  const { tasks } = useTask();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <a
          href="/tasks/create"
          className="bg-primary-500 hover:bg-primary-600 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Create New Task
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks
          // .filter((task) => task != null)
          .map((task) => (
            <div key={task._id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {task.title}
              </h3>
              <p className="text-gray-600 mb-4">{task.description}</p>
              <div className="flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {task.status}
                </span>
                <a
                  href={`/tasks/${task._id}`}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}

        {(!tasks || tasks.length === 0) && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              No tasks found. Create your first task to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;
