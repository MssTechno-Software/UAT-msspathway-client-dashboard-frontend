// Reusable dashboard card for displaying interview and performance statistics.
function StatCard({ title, value, message, type = "interviews" }) {
  return (
    <div
      className={`
        bg-white border border-[#dee2e6] shadow-sm p-8
        ${type === "performance" ? "border-l-4 border-l-[#2d5a27]" : ""}
      `}
    >
      <div className="flex items-start gap-6">
        <div
          className={`
            w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center
            ${type === "performance" ? "bg-[#eff4ff]" : "bg-green-50"}
          `}
        >
          {/* Display the icon based on the card type. */}
          {type === "performance" ? (
            <span
              className="material-symbols-outlined text-[#3b6934] text-[36px] leading-none"
            >
              monitoring
            </span>
          ) : (
            <span
              className="material-symbols-outlined text-[#2d5a27] text-[36px] leading-none"
            >
              work
            </span>
          )}
        </div>
        <div className="flex flex-col">
          {/* Display the statistic title and its value. */}
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#6c757d]">
            {title}
          </span>

          <h2
            className={`
              text-[64px] leading-18
              font-light
              ${type === "performance" ? "text-[#3b6934]" : "text-[#230804]"}
            `}
          >
            {value}
          </h2>

          {/* Display the supporting message below the statistic. */}
          <p
            className="
              mt-2
              text-[14px]
              leading-5
              font-semibold
              text-[#3b6934]
            "
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StatCard;