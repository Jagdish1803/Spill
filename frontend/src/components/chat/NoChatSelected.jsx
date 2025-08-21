import { MessageSquare, Plus } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

const NoChatSelected = () => {
  const { startNewChat } = useChatStore(); // optional action if you have it

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md text-center space-y-6">
        {/* Icon with animation */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center animate-bounce-slow">
            <MessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Heading + text */}
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome to <span className="text-blue-600">Spill</span>
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a conversation from the sidebar to start chatting with your
            friends and colleagues.
          </p>
        </div>

        {/* Optional CTA */}
        <div className="pt-4">
          <button
            onClick={startNewChat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors touch-target"
          >
            <Plus className="w-4 h-4" />
            Start New Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
