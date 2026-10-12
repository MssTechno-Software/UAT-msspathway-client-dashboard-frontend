// Display the next scheduled interview or an empty state when no session exists.
const NextSessionCard = ({ session, onStart }) => {
    // Show a message when there is no upcoming interview.
    if (!session)
        return (

            <div className="bg-white rounded-xl border border-[#D5DDE8] shadow p-5">

                <h3 className="font-semibold mb-4">
                    Next Session
                </h3>

                <p className="text-gray-500">
                    No Upcoming Interview
                </p>

            </div>

        );

    return (

        <div className="bg-white rounded-xl border border-[#D5DDE8] shadow p-5">

            <h3 className="font-semibold text-lg">
                Next Session
            </h3>

            <div className="mt-5">

                <h4 className="font-bold text-black text-[16px] truncate">
                    {session.title}
                </h4>

                <p className="text-gray-500">
                    {session.company_name}
                </p>

                {/* Display the scheduled interview date and time. */}
                <p className="mt-3 text-sm">
                    📅{" "}
                    {new Date(
                        session.scheduled_at
                    ).toLocaleDateString()}
                </p>

                <p className="text-sm mt-1">
                    ⏰{" "}
                    {new Date(
                        session.scheduled_at
                    ).toLocaleTimeString()}
                </p>
                
                <button
                    className="mt-6 w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 cursor-pointer"
                    onClick={() => onStart(session)}
                >
                    {session.interview_source === "realtime" ||
                        session.interview_type === "in_person" ||
                        session.title?.toLowerCase().includes("in person")
                        ? "JOIN MEETING"
                        : "START"}
                </button>
                

            </div>

        </div>

    );
};

export default NextSessionCard;