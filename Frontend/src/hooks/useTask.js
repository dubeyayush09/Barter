import { useContext } from "react";
import { TaskContext } from "../context/TaskContext";

export const useTask = () => {
  return useContext(TaskContext);
};
