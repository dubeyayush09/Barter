import React from "react";

function Credits() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Credits</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Development Team
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>Lead Developer: John Doe</li>
            <li>UI/UX Designer: Jane Smith</li>
            <li>Backend Developer: Mike Johnson</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Technologies Used
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>React</li>
            <li>Tailwind CSS</li>
            <li>Node.js</li>
            <li>Socket.IO</li>
            <li>Vite</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Special Thanks
          </h2>
          <p className="text-gray-600">
            We would like to thank our beta testers and early adopters for their
            valuable feedback and support in making this project better.
          </p>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-600">
        <p>© 2025 Task Management App. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Credits;
