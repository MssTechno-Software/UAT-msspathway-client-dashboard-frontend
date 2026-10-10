import { FiArrowRight } from "react-icons/fi";
function ModeCard({ icon, title, description, onBeginAssessment }) {
  return (
    <div className="group border border-[#d5c2bf] rounded-xl p-8 bg-white min-h-110 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all">
      <div>
        <div className="w-14 h-14 bg-[#eff4ff] rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[#2d5a27]">
          {icon}
        </div>

        <h3 className="text-[32px] leading-tight font-bold text-[#2d5a27] mb-4">
          {title}
        </h3>

        <p className="text-lg text-[#2d5a27] leading-relaxed">
          {description}
        </p>
      </div>

      <button
        onClick={onBeginAssessment}
        className="mt-8 bg-[#2d5a27] hover:bg-[#23501e] text-white rounded-full py-4 font-bold flex items-center justify-center gap-2 cursor-pointer">
        BEGIN ASSESSMENT
        <FiArrowRight />
      </button>
    </div>
  );
}
export default ModeCard;