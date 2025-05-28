// API endpoints
export const API_URL = "http://localhost:5000";
export const SOCKET_URL = "http://localhost:5000";

// Default skill options
export const SKILL_OPTIONS = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Copywriting",
  "Translation",
  "Digital Marketing",
  "Social Media Management",
  "Video Editing",
  "Photography",
  "Audio Production",
  "Data Analysis",
  "Accounting",
  "Legal Assistance",
  "Virtual Assistant",
  "Customer Service",
  "Project Management",
  "Teaching/Tutoring",
  "Consulting",
];

// User status options
export const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "success" },
  { value: "busy", label: "Busy", color: "error" },
  { value: "away", label: "Away", color: "warning" },
  { value: "offline", label: "Offline", color: "neutral" },
];

// Task status options
export const TASK_STATUS = {
  OPEN: "open",
  ASSIGNED: "assigned",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
};

// Task status colors
export const TASK_STATUS_COLORS = {
  open: "primary",
  assigned: "secondary",
  completed: "success",
  cancelled: "neutral",
  disputed: "error",
};

// Task status labels
export const TASK_STATUS_LABELS = {
  open: "Open",
  assigned: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

// Default avatar URL
export const DEFAULT_AVATAR =
  "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
