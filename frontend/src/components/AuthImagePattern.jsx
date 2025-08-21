import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  // Message animation variants
  const messageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.6, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-12 min-h-screen">
      <div className="max-w-4xl text-center space-y-12 relative">
        
        {/* Animated Chat Bubbles */}
        <div className="space-y-6 text-left max-w-sm mx-auto">
          {[
            { text: "Hey! 👋 Welcome to Spill.", side: "left" },
            { text: "Chat in real-time with your friends 🚀", side: "right" },
            { text: "", side: "left", typing: true }, // typing bubble
          ].map((msg, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={messageVariants}
              className={`flex ${msg.side === "right" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl shadow-lg ${
                  msg.side === "right"
                    ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {msg.typing ? (
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></span>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Title + Subtitle */}
        <div className="space-y-4">
          <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            {title}
          </h2>
          <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
