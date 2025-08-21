import { useRef, useState, useEffect, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CHAR_LIMIT = 2000;

const MessageInput = () => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, isSendingMessage, selectedUser, sendTypingIndicator } =
    useChatStore();

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // max 5 lines
    }
  }, []);

  const handleFiles = useCallback((files) => {
    for (let file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Image must be < 5MB");
        continue;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type");
        continue;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleImageChange = useCallback(
    (e) => handleFiles(e.target.files),
    [handleFiles]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = useCallback((idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleTextChange = useCallback(
    (e) => {
      const newText = e.target.value;
      if (newText.length <= MAX_CHAR_LIMIT) setText(newText);
      adjustTextareaHeight();

      if (selectedUser && newText.trim() && !isTyping) {
        setIsTyping(true);
        sendTypingIndicator(selectedUser._id, true);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping && selectedUser) {
          setIsTyping(false);
          sendTypingIndicator(selectedUser._id, false);
        }
      }, 1000);
    },
    [selectedUser, isTyping, sendTypingIndicator, adjustTextareaHeight]
  );

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      const messageText = text.trim();
      if (!messageText && images.length === 0) return;

      if (isTyping && selectedUser) {
        setIsTyping(false);
        sendTypingIndicator(selectedUser._id, false);
        clearTimeout(typingTimeoutRef.current);
      }

      try {
        await sendMessage({
          text: messageText,
          images,
        });
        setText("");
        setImages([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      } catch (err) {
        console.error("Send failed:", err);
        toast.error("Failed to send");
      }
    },
    [text, images, isTyping, selectedUser, sendMessage, sendTypingIndicator]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping && selectedUser) {
        sendTypingIndicator(selectedUser._id, false);
      }
    };
  }, [isTyping, selectedUser, sendTypingIndicator]);

  useEffect(() => {
    if (selectedUser && textareaRef.current) textareaRef.current.focus();
  }, [selectedUser]);

  const canSend =
    (text.trim() || images.length > 0) &&
    !isSendingMessage &&
    !isUploading;

  return (
    <div
      className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700 transition-all"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mb-3 flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Preview ${i + 1}`}
                className="w-20 h-20 object-cover rounded-xl border shadow-sm transition-transform group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className="w-full px-4 py-3 pr-12 border rounded-2xl resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            disabled={isSendingMessage || isUploading}
            rows={1}
            style={{ minHeight: "48px", maxHeight: "120px" }}
          />
          {text.length > 1500 && (
            <div
              className="absolute bottom-1 right-3 text-xs text-gray-400"
              aria-describedby="char-limit"
            >
              {text.length}/{MAX_CHAR_LIMIT}
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
          multiple
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-gray-500 hover:text-blue-600 rounded-xl transition"
          title="Attach Image"
        >
          <Image className="w-5 h-5" />
        </button>

        <button
          type="submit"
          className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 shadow-md"
          title="Send Message"
          disabled={!canSend}
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
