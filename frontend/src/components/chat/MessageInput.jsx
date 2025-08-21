import { useRef, useState, useEffect, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Image, Send, X, Paperclip } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, isSendingMessage, selectedUser, sendTypingIndicator } = useChatStore();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to process image");
      setIsUploading(false);
    }
  }, []);

  const removeImage = useCallback(() => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);
    adjustTextareaHeight();
    
    if (selectedUser && newText.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(selectedUser._id, true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && selectedUser) {
        setIsTyping(false);
        sendTypingIndicator(selectedUser._id, false);
      }
    }, 1000);
  }, [selectedUser, isTyping, sendTypingIndicator, adjustTextareaHeight]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    const messageText = text.trim();
    if (!messageText && !imagePreview) return;

    // Stop typing indicator
    if (isTyping && selectedUser) {
      setIsTyping(false);
      sendTypingIndicator(selectedUser._id, false);
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      await sendMessage({
        text: messageText,
        image: imagePreview,
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  }, [text, imagePreview, isTyping, selectedUser, sendMessage, sendTypingIndicator]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  }, [handleSendMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping && selectedUser) {
        sendTypingIndicator(selectedUser._id, false);
      }
    };
  }, [isTyping, selectedUser, sendTypingIndicator]);

  // Focus textarea when selectedUser changes
  useEffect(() => {
    if (selectedUser && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedUser]);

  const canSend = (text.trim() || imagePreview) && !isSendingMessage && !isUploading;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={removeImage}
              disabled={isSendingMessage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50"
              type="button"
              aria-label="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {isUploading && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Processing image...
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 flex items-end gap-2">
          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mobile-input"
              placeholder="Type a message..."
              value={text}
              onChange={handleTextChange}
              onKeyPress={handleKeyPress}
              disabled={isSendingMessage || isUploading}
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Character count for long messages */}
            {text.length > 1000 && (
              <div className="absolute bottom-1 right-12 text-xs text-gray-400">
                {text.length}/2000
              </div>
            )}
          </div>

          {/* File Input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isSendingMessage || isUploading}
          />

          {/* Attachment Button */}
          <button
            type="button"
            className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSendingMessage || isUploading}
            aria-label="Attach image"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Image className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target flex-shrink-0"
          disabled={!canSend}
          aria-label="Send message"
        >
          {isSendingMessage ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;