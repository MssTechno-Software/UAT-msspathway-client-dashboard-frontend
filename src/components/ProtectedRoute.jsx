import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children, allowedRoles }) {
  // Retrieve the authentication token and user role from local storage.
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Track whether the current session has expired.
  const [sessionExpired, setSessionExpired] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Skip token validation when no token is available.
    if (!token) return;

    let cancelled = false;

    Promise.resolve().then(() => {
      // Prevent validation from continuing if the effect has been cleaned up.
      if (cancelled) return;

      try {
        // Decode the JWT payload and retrieve its expiration timestamp.
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiry = payload.exp * 1000;
        const currentTime = Date.now();

        // Clear stored session data when the token has expired.
        if (currentTime > expiry) {
          localStorage.clear();
          setSessionExpired(true);
        }
      } catch {
        // Handle invalid tokens by clearing stored session data.
        console.log("Invalid token");
        localStorage.clear();
        setSessionExpired(true);
      }
    });
    // Mark the effect as cancelled when the component unmounts or the token changes.
    return () => {
      cancelled = true;
    };
  }, [token]);
  useEffect(() => {
    // Handle session expiration events triggered elsewhere in the application.
    const handleSessionExpired = () => {
      localStorage.clear();
      setSessionExpired(true);
    };
    // Listen for session expiration events across the application.
    window.addEventListener("session-expired", handleSessionExpired);
    // Remove the event listener when the component unmounts.
    return () => {
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  // Redirect unauthenticated users to the login page.
  if (!token && !sessionExpired) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users whose role is not included in the allowed roles.
  if (
    !sessionExpired &&
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}

      {/* Display the session-expired popup when the session becomes invalid. */}
      {sessionExpired && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-[99999]">
          <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Session Expired
            </h3>

            <p className="text-gray-600 text-sm">
              Your session has expired. Please login again.
            </p>

            <button
              // Close the popup and navigate to the login page.
              onClick={() => {
                setSessionExpired(false);
                navigate("/login");
              }}
              className="mt-5 px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm cursor-pointer"
            >
              Login Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProtectedRoute;