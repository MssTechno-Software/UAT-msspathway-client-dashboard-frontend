import { useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
function BeginAssessmentModal({ open,  onProceed, loading }) {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => navigate("/interview-modes")}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-135 overflow-hidden shadow-2xl border border-[#d5c2bf]">
        <div className="p-10">
          <h2 className="text-[24px] font-bold text-[#0B1C30] mb-8">
            Ready to Begin Your Self-Introduction?
          </h2>

          <div className="border border-[#d5c2bf] rounded-lg p-5 bg-[#f8f9ff] flex gap-4">
            <span className="material-symbols-outlined text-[#3B6934]">
              info
            </span>

            <p className="text-[#514441] leading-8">
              Please ensure your microphone is active and you are
              in a quiet environment. Once you start, the AI
              interviewer will begin the self-introduction.
            </p>
          </div>
        </div>

        <div className="border-t border-[#d5c2bf] p-6 flex justify-end gap-4">
          <button
            onClick={() => navigate("/interview-modes")}
            className="uppercase text-[#514441] font-medium px-6 py-3 border border-[#d5c2bf] rounded-lg hover:bg-[#f8f9ff] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={onProceed}
            disabled={loading}
            className="bg-[#3B6934] text-white px-8 py-3 rounded-lg uppercase font-semibold hover:bg-[#2d5a27] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <FiLoader className="animate-spin" />
                Loading...
              </span>
            ) : (
              "Proceed To Interview"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BeginAssessmentModal;