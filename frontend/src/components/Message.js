import React, { useEffect, useState, createContext, useContext, useRef } from 'react';
import './Message.css';

// Create and export the context
export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [currentMessage, setCurrentMessage] = useState(null); // Single message instead of array
  const timeoutRef = useRef(null);
  // Track last message to avoid showing duplicates in quick succession
  const lastMessageRef = useRef({ text: '', time: 0 });

  const showMessage = (newMessage, newType = 'info') => {
    // console.log('Showing message:', newMessage, newType);
    // Prevent duplicate messages within 3 seconds
    const now = Date.now();
    if (lastMessageRef.current.text === newMessage && now - lastMessageRef.current.time < 3000) {
      // console.log('Duplicate message prevented by provider:', newMessage);
      return;
    }

    // Update last shown message
    lastMessageRef.current = { text: newMessage, time: now };

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the new message (replaces any existing one)
    setCurrentMessage({
      id: Date.now(),
      text: newMessage,
      type: newType
    });
  };

  const clearMessage = () => {
    setCurrentMessage(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Auto-clear message after duration
  useEffect(() => {
    if (currentMessage) {
      timeoutRef.current = setTimeout(() => {
        clearMessage();
      }, 5000); // 5 seconds
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentMessage]);

  return (
    <MessageContext.Provider value={{ showMessage, clearMessage }}>
      {children}
      {/* Message container - only shows one message */}
      {currentMessage && (
        <div className="message-container">
          <Message 
            key={currentMessage.id}
            type={currentMessage.type} 
            message={currentMessage.text} 
            onClose={clearMessage}
            autoClose={false} // We handle auto-close at provider level
          />
        </div>
      )}
    </MessageContext.Provider>
  );
};

// Hook to use messages in components
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

// Message component
const Message = ({ 
  type = 'info', 
  message, 
  onClose,
  showIcon = true,
  className = ''
}) => {
  const [isExiting, setIsExiting] = useState(false);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Match animation duration
  };

  return (
    <div className={`message message-${type} ${className} ${isExiting ? 'message-exit' : ''}`}>
      {showIcon && <span className="message-icon">{getIcon()}</span>}
      <span className="message-text">{message}</span>
      {onClose && (
        <button className="message-close" onClick={handleClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Message;