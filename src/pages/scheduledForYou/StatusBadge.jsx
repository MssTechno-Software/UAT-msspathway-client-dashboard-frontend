const StatusBadge = ({ status }) => {
  const getColor = () => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";

      case "scheduled":
        return "bg-yellow-100 text-yellow-700";

      case "in_progress":
      case "in progress":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      case "skipped":
        return "bg-gray-200 text-gray-600";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getColor()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;