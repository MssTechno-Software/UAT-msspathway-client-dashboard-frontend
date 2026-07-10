import React from "react";

const NextSessionCard = ({ session, onStart }) => {

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
                    {session.interview_source === "realtime"
                        ? "JOIN MEETING"
                        : "START"}
                </button>

            </div>

        </div>

    );
};

export default NextSessionCard;