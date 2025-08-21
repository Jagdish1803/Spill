const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-pulse">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`flex items-end gap-3 ${
            idx % 2 === 0 ? "flex-row" : "flex-row-reverse"
          }`}
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gray-300/60 dark:bg-gray-700/60" />

          {/* Message bubble */}
          <div className="flex flex-col space-y-2">
            {/* Small line (like username / time) */}
            <div className="h-3 w-16 rounded bg-gray-300/50 dark:bg-gray-700/50" />
            {/* Main bubble */}
            <div className="h-16 w-[220px] rounded-2xl bg-gray-300/70 dark:bg-gray-700/70" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
