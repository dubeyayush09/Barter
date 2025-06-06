import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";
import { MessageSquare, Send, Search } from "lucide-react";

const Chat = () => {
  const { id } = useParams();
  const { socket } = useSocket();import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSocket } from "../../hooks/useSocket";
import { useAuth } from "../../hooks/useAuth";
import { MessageSquare, Send, Search } from "lucide-react";

  const Chat = () => {
    const { id } = useParams();
    const { socket } = useSocket();
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const messagesEndRef = useRef(null);
    const [localMessages, setLocalMessages] = useState([]);

    useEffect(() => {
      if (socket) {
        // Listen for incoming messages
        socket.on("receiveMessage", (newMessage) => {
          const senderId =
            typeof newMessage.sender === "object"
              ? newMessage.sender._id
              : newMessage.sender;

          if (senderId !== user._id) {
            setMessages((prev) => [...prev, newMessage]);
          }
          console.log("msg at receive message",senderId)
          scrollToBottom();
        });
        // Listen for chat updates
        socket.on("chatUpdated", (updatedChat) => {
          setChats((prev) =>
            prev.map((chat) =>
              chat._id === updatedChat._id ? updatedChat : chat
            )
          );
        });

        // Listen for new chats
        socket.on("newChat", (chat) => {
          setChats((prev) => [...prev, chat]);
        });

        // Clean up listeners
        return () => {
          socket.off("receiveMessage");
          socket.off("chatUpdated");
          socket.off("newChat");
        };
      }
    }, [socket]);

    useEffect(() => {
      if (socket && id) {
        // Join chat room
        socket.emit("joinChat", id);

        // Get chat history
        socket.emit("getChatHistory", id, (response) => {
          if (response.success) {
            setMessages(response.messages);
            setCurrentChat(response.chat);
            scrollToBottom();
          }
        });

        return () => {
          socket.emit("leaveChat", id);
        };
      }
    }, [socket, id]);

    useEffect(() => {
      if (socket) {
        // Get user's chats
        socket.emit("getChats", (response) => {
          if (response.success) {
            setChats(response.chats);
          }
        });
      }
    }, [socket]);

    useEffect(() => {
      if (!socket) return;

      socket.on("userStatusUpdate", ({ userId, isOnline }) => {
        setChats((prevChats) =>
          prevChats.map((chat) => ({
            ...chat,
            participants: chat.participants.map((p) =>
              p._id === userId ? { ...p, isOnline } : p
            ),
          }))
        );
      });

      return () => {
        socket.off("userStatusUpdate");
      };
    }, [socket]);
    

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = (e) => {
      e.preventDefault();
      if (!message.trim() || !socket || !currentChat) return;

      // Create a temporary message for immediate display
      const tempMessage = {
        _id: Date.now().toString(),
        content: message,
        sender:{_id:user._id},
        createdAt: new Date().toISOString(),
        isLocal: true,
      };

      // Add to local messages immediately
      setLocalMessages((prev) => [...prev, tempMessage]);

      const messageData = {
        chatId: currentChat._id,
        content: message,
        sender: user._id,
      };

      // Clear input immediately
      setMessage("");

      socket.emit("sendMessage", messageData, (response) => {
        console.log("message sent ",messageData)
        if (response.success) {
          // Remove temporary message and add confirmed message
          setLocalMessages((prev) =>
            prev.filter((msg) => msg._id !== tempMessage._id)
          );
          console.log("response is ",response.message)
          // console.log("user id is ",user._id)
          setMessages((prev) => [...prev, response.message]);
          scrollToBottom();
        }
      });
    };

  const searchUsers = () => {
    if (!searchTerm || !socket) return;

    socket.emit("searchUsers", searchTerm, (response) => {
      if (response.success) {
        setSearchResults(response.users);
      }
    });
  };

  const startChat = (userId) => {
    if (!socket) return;

    socket.emit("startChat", userId, (response) => {
      if (response.success) {
        const newChat=response.chat;
        setChats((prev) => {
          const exists=prev.find((c)=>c._id===newChat._id);
          if(exists) return prev;
          return [...prev,newChat];})
        setSearchResults([]);
        setSearchTerm("");
      }
    });
  };

  const isCurrentUserMessage = (sender) => {
    const senderId = typeof sender === "object" ? sender._id : sender;
    // if(senderId===user?._id)
    // {
    //   console.log("dono barabr hai")
    // }
    return senderId === user?._id;
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Search Results
              </h3>
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => startChat(user._id)}
                >
                  <img
                    src={
                      user.avatar ||
                      "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat List */}
          <div className="overflow-y-auto h-full">
            {chats.map((chat) => {
              const otherUser = chat.participants.find(
                (p) => p._id !== user?._id
              );
              const lastMessage = chat.messages[chat.messages.length - 1];

              return (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${
                    chat._id === id ? "bg-gray-200" : ""
                  }`}
                >
                  <img
                    src={
                      otherUser?.avatar ||
                      "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt={otherUser?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherUser?.name}
                    </p>
                    {lastMessage && (
                      <p className="text-xs text-black-900 truncate">
                        {lastMessage.sender === user?._id ? "You: " : ""}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="ml-2 bg-primary-500 text-black font-bold  text-xs font-medium px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center sticky top-0 bg-white z-10">
                <img
                  src={
                    currentChat.participants.find((p) => p._id !== user?._id)
                      ?.avatar ||
                    "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  }
                  alt="User avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {
                      currentChat.participants.find((p) => p._id !== user?._id)
                        ?.name
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentChat?.participants?.find((p) => p._id !== user._id) // find the other user
                      ?.status === "online"
                      ? "Active"
                      : "Offline"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {[...messages].map((msg, index) => {
                  // console.log("Current user ID:", user?._id);
                  // console.log(
                  //   "Message sender ID:",
                  //   msg?.sender?._id || msg?.sender || "undefined"
                  // );

                  return (
                    <div
                      key={msg._id || index}
                      className={`flex mb-4 ${
                        isCurrentUserMessage(msg.sender)
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUserMessage(msg.sender)
                            ? "bg-blue-500 text-black ml-auto"
                            : "bg-green-500 text-gray-900 mr-auto"
                        } ${msg.isLocal ? "opacity-70" : ""}`}
                      >
                        <p className="text-sm break-words">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t border-gray-200"
              >
                <div className="flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-primary-500 text-gray-900"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-500 text-black rounded-r-lg hover:bg-primary-600 focus:outline-none"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-500">
                  Select a chat or start a new conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const [localMessages, setLocalMessages] = useState([]);

  useEffect(() => {
    if (socket) {
      // Listen for incoming messages
      socket.on("receiveMessage", (newMessage) => {
        // setMessages((prev) => [...prev, newMessage]);
        console.log("message received from server ",newMessage);
        console.log("set message contains  ",messages);
        scrollToBottom();
      });

      // Listen for chat updates
      socket.on("chatUpdated", (updatedChat) => {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === updatedChat._id ? updatedChat : chat
          )
        );
      });

      // Listen for new chats
      socket.on("newChat", (chat) => {
        setChats((prev) => [...prev, chat]);
      });

      // Clean up listeners
      return () => {
        socket.off("receiveMessage");
        socket.off("chatUpdated");
        socket.off("newChat");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket && id) {
      // Join chat room
      socket.emit("joinChat", id);

      // Get chat history
      socket.emit("getChatHistory", id, (response) => {
        if (response.success) {
          setMessages(response.messages);
          setCurrentChat(response.chat);
          scrollToBottom();
        }
      });

      return () => {
        socket.emit("leaveChat", id);
      };
    }
  }, [socket, id]);

  useEffect(() => {
    if (socket) {
      // Get user's chats
      socket.emit("getChats", (response) => {
        if (response.success) {
          setChats(response.chats);
        }
      });
    }
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket || !currentChat) return;

    // Create a temporary message for immediate display
    const tempMessage = {
      _id: Date.now().toString(),
      content: message,
      sender: user._id,
      createdAt: new Date().toISOString(),
      isLocal: true,
    };

    // Add to local messages immediately
    setLocalMessages((prev) => [...prev, tempMessage]);

    const messageData = {
      chatId: currentChat._id,
      content: message,
      sender: user._id,
    };

    // Clear input immediately
    setMessage("");

    socket.emit("sendMessage", messageData, (response) => {
      console.log("message sent ",messageData)
      if (response.success) {
        // Remove temporary message and add confirmed message
        setLocalMessages((prev) =>
          prev.filter((msg) => msg._id !== tempMessage._id)
        );
        setMessages((prev) => [...prev, response.message]);
        scrollToBottom();
      }
    });
  };

  const searchUsers = () => {
    if (!searchTerm || !socket) return;

    socket.emit("searchUsers", searchTerm, (response) => {
      if (response.success) {
        setSearchResults(response.users);
      }
    });
  };

  const startChat = (userId) => {
    if (!socket) return;

    socket.emit("startChat", userId, (response) => {
      if (response.success) {
        const newChat=response.chat;
        setChats((prev) => {
          const exists=prev.find((c)=>c._id===newChat._id);
          if(exists) return prev;
          return [...prev,newChat];})
        setSearchResults([]);
        setSearchTerm("");
      }
    });
  };

  const isCurrentUserMessage = (senderId) => {
    return senderId === user?._id;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Chat List Sidebar */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Search Results
              </h3>
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => startChat(user._id)}
                >
                  <img
                    src={
                      user.avatar ||
                      "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat List */}
          <div className="overflow-y-auto h-full">
            {chats.map((chat) => {
              const otherUser = chat.participants.find(
                (p) => p._id !== user?._id
              );
              const lastMessage = chat.messages[chat.messages.length - 1];

              return (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${
                    chat._id === id ? "bg-gray-50" : ""
                  }`}
                >
                  <img
                    src={
                      otherUser?.avatar ||
                      "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    }
                    alt={otherUser?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {otherUser?.name}
                    </p>
                    {lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {lastMessage.sender === user?._id ? "You: " : ""}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="ml-2 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <img
                  src={
                    currentChat.participants.find((p) => p._id !== user?._id)
                      ?.avatar ||
                    "https://images.pexels.com/photos/7148384/pexels-photo-7148384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  }
                  alt="User avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {
                      currentChat.participants.find((p) => p._id !== user?._id)
                        ?.name
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {
                      currentChat.participants.find((p) => p._id !== user?._id)
                        ?.status
                    }
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {[...messages, ...localMessages].map((msg, index) => {
                    // console.log("Current user ID:", user?._id);
                    // console.log("Message sender ID:", msg.sender);

                  return (
                  
                  <div
                    key={msg._id || index}
                    className={`flex mb-4 ${
                      isCurrentUserMessage(msg.sender._id)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUserMessage(msg.sender._id)
                          ? "bg-primary-500 text-black ml-auto"
                          : "bg-gray-100 text-gray-900 mr-auto"
                      } ${msg.isLocal ? "opacity-70" : ""}`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-75">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )})}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t border-gray-200"
              >
                <div className="flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-primary-500 text-gray-900"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-500 text-white rounded-r-lg hover:bg-primary-600 focus:outline-none"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-500">
                  Select a chat or start a new conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
