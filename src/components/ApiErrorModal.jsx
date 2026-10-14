
import { FiAlertCircle, FiX } from "react-icons/fi";

function ApiErrorModal({
  title = "Something Went Wrong",
  message,
  onRetry,
  onClose,
}) {
  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="api-error-title"
      aria-describedby="api-error-message"
    >
      <div className="relative w-full max-w-sm rounded-xl bg-white px-5 py-5 shadow-xl">
        {/* Close icon at the top-right corner. */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close error popup"
            className="absolute right-2 top-2 rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <FiX className="text-lg" />
          </button>
        )}

        {/* Small red error icon. */}
        <div className="mb-3 flex justify-center pt-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
            <FiAlertCircle className="text-2xl text-red-600" />
          </div>
        </div>

        <h2
          id="api-error-title"
          className="text-center text-lg font-semibold text-red-600"
        >
          {title}
        </h2>

        <p
          id="api-error-message"
          className="mt-2 text-center text-sm leading-5 text-gray-600"
        >
          {message}
        </p>

        {/* Keep the existing retry action compact and centered. */}
        {onRetry && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onRetry}
              className="min-w-20 cursor-pointer rounded-lg bg-green-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Show OK when there is no retry action. */}
        {!onRetry && onClose && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="min-w-20 cursor-pointer rounded-lg bg-green-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ApiErrorModal;
