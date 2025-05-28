import React, { createContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/constants";
import { useAuth } from "../hooks/useAuth";

export const SocketContext = createContext({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem("token"),
        },
        transports: ["websocket", "polling"],
        autoConnect: true,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });

      setSocket(newSocket);
      socketRef.current = newSocket;

      return () => {
        if (newSocket) {
          newSocket.disconnect();
          setIsConnected(false);
        }
      };
    } else if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
      setSocket(null);
    }
  }, [isAuthenticated, user?._id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
