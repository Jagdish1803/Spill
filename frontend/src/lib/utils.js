export const formatMessageTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";

  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  });
};

export const formatLastSeen = (date) => {
  if (!date) return "Unknown";
  const d = new Date(date);
  if (isNaN(d)) return "Unknown";

  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = diffMins / 60;
  const diffDays = diffHours / 24;

  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)} hr${Math.floor(diffHours) > 1 ? "s" : ""} ago`;
  } else if (diffDays < 2) {
    return "Yesterday";
  } else {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};
