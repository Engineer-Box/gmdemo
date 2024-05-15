export const timeAgo = (isoDate: string): string => {
  try {
    const now = new Date();
    const pastDate = new Date(isoDate);
    const diffInSeconds = Math.floor(
      (now.getTime() - pastDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "A few seconds ago";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else if (diffInSeconds <= 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return "Over a week ago";
    }
  } catch (error) {
    return "In the past";
  }
};
