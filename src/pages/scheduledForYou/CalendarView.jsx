import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import NextSessionCard from "./NextSessionCard";
import TimelineCard from "./TimelineCard";
import React, { useEffect, useMemo, useRef, useState } from "react";

const CalendarView = ({
    scheduledInterviews,
    nextSession,
    todayTimeline,
    onStartInterview,
}) => {

    const calendarRef = useRef();

    const [currentTitle, setCurrentTitle] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            const api = calendarRef.current?.getApi();
            if (api) {
                setCurrentTitle(api.view.title);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);
    const updateTitle = () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            setCurrentTitle(calendarApi.view.title);
        }
    };

    const handlePrev = () => {
        const api = calendarRef.current.getApi();
        api.prev();
        updateTitle();
    };

    const handleNext = () => {
        const api = calendarRef.current.getApi();
        api.next();
        updateTitle();
    };

    const handleToday = () => {
        const api = calendarRef.current.getApi();
        api.today();
        updateTitle();
    };

    const changeView = (view) => {
        const api = calendarRef.current.getApi();
        api.changeView(view);
        updateTitle();
    };

    const events = useMemo(() => {
        if (!scheduledInterviews) return [];

        let interviews = [];

        if (Array.isArray(scheduledInterviews)) {
            interviews = scheduledInterviews;
        } else {
            interviews = Object.values(scheduledInterviews).flat();
        }

        return interviews.map((item) => ({
            id: item.interview_id,
            title: item.title,
            start: item.scheduled_at,
            end: item.scheduled_at,

            // Disable completed interviews
            editable: item.status !== "completed",
            extendedProps: {
                ...item,
                isCompleted: item.status === "completed",
            },
        }));
    }, [scheduledInterviews]);

    const renderEvent = (eventInfo) => {

        const interview = eventInfo.event.extendedProps;
        const isRealtime = interview.interview_source === "realtime";
        const isCompleted = interview.isCompleted;
        return (
            <div
                className={`rounded-md p-1 border-l-4 ${isCompleted
                    ? "border-gray-400 cursor-not-allowed"
                    : isRealtime
                        ? "bg-blue-100 border-blue-500 cursor-pointer"
                        : "bg-slate-100 border-slate-500 cursor-pointer"
                    }`}
            >
                <div className={`font-semibold truncate ${isRealtime ? "text-blue-800" : "text-slate-700"}`}>
                    {interview.title}
                </div>
                <div className="text-gray-500 truncate">
                    {interview.company_name ||
                        interview.interview_source}
                </div>

                <div className="text-blue-700 text-[10px]">

                    {new Date(interview.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
                {isCompleted && (
                    <div className="text-[10px] font-semibold text-red-600 mt-1">
                        Completed
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Calendar */}
            <div className="col-span-9 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">

                    {/* Left */}
                    <div className="flex items-center gap-2">
                        {/* Month Dropdown */}
                        <div className="flex items-center border border-[#D5DDE8] rounded overflow-hidden bg-white">

                            <button
                                onClick={handlePrev}
                                className="w-8 h-8 flex items-center justify-center border-r border-[#D5DDE8] hover:bg-gray-100 cursor-pointer"
                            >
                                ❮
                            </button>

                            <button
                                className="px-4 h-8 text-[12px] font-semibold text-[#514441] flex items-center gap-2"
                            >
                                {currentTitle}
                            </button>

                            <button
                                onClick={handleNext}
                                className="w-8 h-8 flex items-center justify-center border-l border-[#D5DDE8] hover:bg-gray-100 cursor-pointer"
                            >
                                ❯
                            </button>
                        </div>

                        {/* Today */}
                        <button
                            onClick={handleToday}
                            className="px-4 h-8 border border-[#D5DDE8] rounded bg-white hover:bg-gray-100 text-[12px] font-semibold text-[#514441] cursor-pointer"
                        >
                            Today
                        </button>
                    </div>

                    {/* Right */}
                    <div className="flex border border-[#D5DDE8] rounded overflow-hidden">
                        <button
                            onClick={() => changeView("timeGridWeek")}
                            className="px-4 h-8 text-[12px] font-semibold bg-white border-r border-[#D5DDE8] cursor-pointer hover:bg-gray-100"
                        >
                            Week
                        </button>
                        <button
                            onClick={() => changeView("dayGridMonth")}
                            className="px-4 h-8 text-[12px] font-semibold bg-[#F7F8FB] cursor-pointer hover:bg-gray-100"
                        >
                            Month
                        </button>
                    </div>
                </div>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[
                        dayGridPlugin,
                        timeGridPlugin,
                        interactionPlugin,
                    ]}
                    initialView="dayGridMonth"
                    initialDate={new Date()}
                    headerToolbar={false}
                    datesSet={() => {
                        const api = calendarRef.current?.getApi();
                        if (api) {
                            setCurrentTitle(api.view.title);
                        }
                    }}
                    events={events}
                    eventContent={renderEvent}
                    height="auto"
                    eventClick={(info) => {
                        const interview = info.event.extendedProps;
                        if (interview.isCompleted) {
                            return;
                        }
                        onStartInterview(interview);
                    }}
                />
            </div>

            {/* Sidebar */}

            <div className="col-span-3 space-y-5">

                <NextSessionCard
                    session={nextSession}
                    onStart={onStartInterview}
                />

                <TimelineCard
                    timeline={todayTimeline}
                />

            </div>

        </div>

    );
};

export default CalendarView;