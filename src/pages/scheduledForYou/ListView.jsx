import React from "react";
import StatusBadge from "./StatusBadge";
import Pagination from "./Pagination";

const ListView = ({
  interviews = [],
  pagination = {},
  onPageChange,
  onPageSizeChange,
  onStartInterview,
}) => {
  const getInterviewStyle = (item) => {
    if (item.interview_source === "realtime") {
      return {
        row: "bg-blue-50 hover:bg-blue-100",
        border: "border-l-[6px] border-blue-600",
        title: "text-blue-800",
      };
    }

    return {
      row: "bg-slate-100 hover:bg-slate-200",
      border: "border-l-[6px] border-slate-600",
      title: "text-slate-700",
    };
  };
  return (
    <div className="bg-white shadow border border-gray-200 rounded-lg">

      <div className="flex justify-between items-center p-6 border-b border-gray-200">

        <div>
          <h2 className="text-[20px] font-bold text-[#230804]">
            Active Schedule
          </h2>
        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-gray-50">

            <tr className="text-[12px] font-semibold uppercase tracking-widest text-[#514441]">

              <th className="px-6 py-4 text-left">Interview Type</th>

              <th className="px-6 py-4 text-left">Duration</th>

              <th className="px-6 py-4 text-left">Deadline Date</th>

              <th className="px-6 py-4 text-left">Status</th>

              <th className="px-6 py-4 text-left">Actions</th>

            </tr>

          </thead>

          <tbody>

            {!Array.isArray(interviews) || interviews.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-500"
                >
                  No Interviews Found
                </td>
              </tr>

            ) : (
              Array.isArray(interviews) &&
              interviews.map((item, index) => {
                const style = getInterviewStyle(item);

                return (
                  <tr
                    key={`${item.interview_id}-${index}`}
                    className={`${style.row} border-t border-gray-200 transition-all hover:brightness-100`}
                  >
                    <td className={`px-6 py-6 ${style.border}`}>
                      <h3
                        className={`text-[12px] font-extrabold uppercase tracking-wide ${style.title}`}
                      >
                        {item.title}
                      </h3>

                      <p className="text-[14px] text-[#514441]">
                        {item.company_name || item.mode || item.interview_source}
                      </p>
                    </td>

                    <td className="px-6 py-6 text-[14px] text-[#0b1c30]">
                      {item.duration_minutes} mins
                    </td>

                    <td className="px-6 py-6">
                      {item.deadline_date}
                    </td>

                    <td className="px-6 py-6">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-6 py-6">
                      <button
                        onClick={() => onStartInterview(item)}
                        disabled={item.status.toLowerCase() === "completed"}
                        className={`px-5 py-2 rounded text-white text-[11px] font-semibold transition
                          ${item.status.toLowerCase() === "completed"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-700 hover:bg-green-800"
                          }`}
                      >
                        {item.interview_source === "realtime"
                          ? "JOIN MEETING"
                          : "START INTERVIEW"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}

          </tbody>

        </table>

      </div>

      <div className="p-5 border-t border-gray-200">

        <Pagination
          page={pagination?.page || 1}
          totalPages={pagination?.total_pages || 1}
          pageSize={pagination?.page_size || 10}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />

      </div>

    </div>
  );
};

export default ListView;