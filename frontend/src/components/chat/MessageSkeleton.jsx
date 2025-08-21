const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {skeletonMessages.map((_, idx) => {
        const isOwn = idx % 2 === 0;
        const bubbleWidth = [180, 200, 220, 240][idx % 4];

        return (
          <div
            key={idx}
            className={`flex items-end gap-3 ${isOwn ? "flex-row" : "flex-row-reverse"}`}
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-300/60 dark:bg-gray-700/60 animate-pulse" />

            {/* Message bubble */}
            <div className="flex flex-col space-y-2">
              {/* Username/time line */}
              <div className="h-3 w-16 rounded bg-gray-300/50 dark:bg-gray-700/50 animate-pulse" />
              {/* Main bubble */}
              <div
                className={`h-16 rounded-2xl bg-gray-300/70 dark:bg-gray-700/70 animate-pulse`}
                style={{ width: `${bubbleWidth}px` }}
              />
              {/* Optional read status */}
              {isOwn && <div className="h-2 w-8 rounded bg-gray-300/50 dark:bg-gray-700/50 animate-pulse" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;
