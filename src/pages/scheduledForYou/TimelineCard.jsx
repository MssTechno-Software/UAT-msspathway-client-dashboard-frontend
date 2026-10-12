// Display today's scheduled interviews along with their time and status.
const TimelineCard = ({ timeline }) => {
    return (

        <div className="bg-white rounded-xl border border-gray-200 shadow p-5">

            <h3 className="font-semibold mb-5">
                Today's Timeline
            </h3>

            <div className="space-y-4">

                {/* Show an empty-state message when there are no interviews today. */}
                {timeline.length === 0 && (

                    <p className="text-gray-500">
                        No Interviews Today
                    </p>

                )}

                {/* Render each interview with its time, title, source, and status. */}
                {timeline.map((item) => (

                    <div
                        key={item.interview_id}
                        className="border-l-4 border-green-600 pl-4"
                    >
                        <div className="text-xs text-gray-500">
                            {item.time}
                        </div>

                        <div className="font-semibold">
                            {item.title}
                        </div>

                        <div className="text-xs text-gray-500">
                            {item.interview_source}
                        </div>

                        {/* Apply badge colors according to the interview status. */}
                        <span
                            className={`inline-block mt-2 px-2 py-1 rounded-full text-xs
                            ${
                                item.status.toLowerCase() ===
                                "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                            }`}
                        >
                            {item.status}
                        </span>
                    </div>
                ))}
            </div>

        </div>

    );
};

export default TimelineCard;