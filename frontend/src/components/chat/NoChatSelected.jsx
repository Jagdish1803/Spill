import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md text-center space-y-6">
        {/* Icon with subtle bounce */}
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
      </div>
    </div>
  );
};

export default NoChatSelected;
