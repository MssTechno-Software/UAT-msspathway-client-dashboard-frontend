
import { FiFileText } from "react-icons/fi";

function CompanyCard({ data }) {
    const stages = ["Call", "Mail", "L1", "L2", "Offer"];

    const stageLabels = {
        Call: "CALL",
        Mail: "MAIL",
        L1: "L1",
        L2: "L2",
        Offer: "OFFER"
    };

    const stageData = data?.stages || [];

    const assignmentStage = stageData.find(
        (item) => item.stage === "Assignment"
    );

    const getStatusColor = (status) => {
        if (status === "Cleared") return "bg-green-100 text-green-700";
        if (status === "Pending") return "bg-yellow-100 text-yellow-700";
        if (status === "Rejected") return "bg-red-100 text-red-700";
        if (status === "Skipped") return "bg-gray-100 text-gray-500";
        return "bg-gray-100 text-gray-500";
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">

            {/* HEADER */}
            <div className="flex justify-between items-start mb-5">

                <div>
                    <h3 className="font-semibold text-2xl text-black">
                        {data?.company || "No Company"}
                    </h3>

                    <p className="text-sm text-gray-400 mt-1">
                        Created {data?.created_date || "-"}
                    </p>
                </div>

                {/* ASSIGNMENT STATUS */}
                {assignmentStage && assignmentStage.status !== "Skipped" && (
                    <div className="relative group flex items-center gap-1">

                        <FiFileText
                            size={14}
                            className="text-gray-400"
                        />

                        <span
                            className={`text-[10px] px-2 py-1 rounded-full font-medium ${getStatusColor(
                                assignmentStage.status
                            )}`}
                        >
                            {assignmentStage.status}
                        </span>

                        <div className="
                            absolute right-0 top-7
                            bg-black text-white text-[10px]
                            px-2 py-1 rounded
                            opacity-0 invisible
                            group-hover:opacity-100
                            group-hover:visible
                            whitespace-nowrap
                            z-50
                        ">
                            Assignment Date: {assignmentStage.date}
                        </div>
                    </div>
                )}
            </div>

            {/* PROGRESS BAR */}
            <div className="flex gap-3 mb-6 mt-4">
                {(() => {
                    const STAGES = ["Call", "Mail", "L1", "L2", "Offer"];

                    const stageMap = {};

                    const progressStages = stageData.filter(
                        (item) => item.stage !== "Assignment"
                    );

                    progressStages.forEach((item) => {
                        stageMap[item.stage] = item;
                    });

                    const latestStage =
                        progressStages[progressStages.length - 1];

                    const latestIndex = STAGES.indexOf(latestStage?.stage);

                    return STAGES.map((stage, index) => {
                        const item = stageMap[stage];

                        let color = "bg-gray-200";

                        if (item) {
                            if (item.status === "Rejected") {
                                color = "bg-red-500";
                            }
                            else if (item.status === "Pending") {
                                color = "bg-yellow-500";
                            }
                            else if (item.status === "Cleared") {
                                color = "bg-green-500";
                            }
                            else if (item.status === "Skipped") {
                                color = "bg-gray-400";
                            }
                        }
                        else if (index < latestIndex) {
                            color = "bg-gray-400";
                        }

                        return (
                            <div
                                key={stage}
                                className={`h-2 flex-1 rounded-full ${color}`}
                            />
                        );
                    });
                })()}
            </div>

            {/* STAGE DETAILS */}
            <div className="grid grid-cols-5 gap-3 text-xs text-gray-500 mt-2">

                {stages.map((stage) => {
                    const item = stageData.find(
                        (s) => s.stage === stage
                    );

                    const latestStage = stageData[stageData.length - 1];
                    const latestIndex = stages.indexOf(latestStage?.stage);
                    const currentIndex = stages.indexOf(stage);

                    const displayItem =
                        item ||
                        (currentIndex < latestIndex
                            ? { status: "Skipped", date: "-" }
                            : null);

                    return (
                        <div key={stage}>
                            <p className="uppercase text-xs tracking-wide">
                                {stageLabels[stage]}
                            </p>

                            <p className="text-[10px] text-gray-400 mt-1">
                                {displayItem?.date || "-"}
                            </p>

                            {displayItem?.status && (
                                <span
                                    className={`text-[10px] px-2 py-1 rounded-full mt-2 inline-block font-medium ${getStatusColor(
                                        displayItem.status
                                    )}`}
                                >
                                    {displayItem.status}
                                </span>
                            )}
                        </div>
                    );
                })}

            </div>
        </div>
    );
}

export default CompanyCard;
