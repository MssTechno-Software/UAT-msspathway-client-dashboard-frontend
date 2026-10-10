function AnalyticsPanel({ analytics = [] }) {
  const hasAnalytics = Array.isArray(analytics) && analytics.length > 0;

  return (
    <div className="bg-white border border-[#dee2e6] p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 shrink-0 bg-[#eff4ff] rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-[#3b6934]">
            bar_chart
          </span>
        </div>

        <h2 className="text-[20px] leading-7 font-bold text-[#230804]">
          Performance Analytics
        </h2>
      </div>

      {hasAnalytics ? (
        <div className="flex flex-col justify-between flex-1">
          {analytics.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-3">
                <span className="uppercase text-[10px] tracking-wider font-bold text-[#6c757d]">
                  {item.mode_label}
                </span>
                <span className="font-bold text-[#230804] text-sm">
                  {item.avg_performance}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#e9ecef] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2d5a27] rounded-full"
                  style={{
                    width: `${Math.min(
                      Math.max(Number(item.avg_performance) || 0, 0),
                      100
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Attempts : {item.attempts}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#f8f9fa] border border-[#dee2e6] flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[#6c757d] text-[24px]">
              analytics
            </span>
          </div>

          <h3 className="text-[16px] font-semibold text-[#230804]">
            No performance data yet
          </h3>

          <p className="mt-1 max-w-[260px] text-[14px] leading-5 text-[#6c757d]">
            Complete your first interview to start seeing your performance
            analytics.
          </p>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPanel;