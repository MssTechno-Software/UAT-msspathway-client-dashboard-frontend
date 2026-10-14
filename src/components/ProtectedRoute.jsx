import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  clearAuthSession,
  getAccessToken,
  getUserRole,
} from "../services/authSession";

function ProtectedRoute({ children, allowedRoles }) {
  // Read authentication details from the current tab's session.
  const token = getAccessToken();
  const role = getUserRole();

  // Track whether the current session has expired.
  const [sessionExpired, setSessionExpired] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    // Skip token validation when no token is available.
    if (!token) return;

    let cancelled = false;
    let timeoutId;

     const expireSession = () => {
      if (cancelled) return;

      clearAuthSession();
      setSessionExpired(true);
    };

    Promise.resolve().then(() => {
      // Prevent validation from continuing if the effect has been cleaned up.
      if (cancelled) return;

      try {
        // Decode the JWT payload and retrieve its expiration timestamp.
        const tokenParts = token.split(".");

        if (tokenParts.length !== 3) {
          throw new Error("Invalid token format");
        }

        // Handle Base64URL encoding used by JWT payloads.
        const base64Payload = tokenParts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/");

        const payload = JSON.parse(atob(base64Payload));

        // Validate the expiration timestamp before using it.
        if (
          typeof payload.exp !== "number" ||
          !Number.isFinite(payload.exp)
        ) {
          throw new Error("Token expiry is missing");
        }

        const expiry = payload.exp * 1000;

        // Check token expiry and schedule the next check.
        const checkExpiry = () => {
          if (cancelled) return;

          const remainingTime = expiry - Date.now();

          if (remainingTime <= 0) {
            expireSession();
            return;
          }

          // Handle long-lived tokens and browser timer limits.
          timeoutId = setTimeout(
            checkExpiry,
            Math.min(remainingTime, 2147483647)
          );
        };

        checkExpiry();
      } catch {
        // Handle invalid tokens by clearing authentication data.
        expireSession();
      }
    });

    // Clean up the timer when the component unmounts or the token changes.
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [token]);

  useEffect(() => {
    // Handle session expiration events triggered elsewhere in the application.
    const handleSessionExpired = () => {
      clearAuthSession();
      setSessionExpired(true);
    };

    // Listen for session expiration events across the application.
    window.addEventListener("session-expired", handleSessionExpired);

    // Remove the event listener when the component unmounts.
    return () => {
      window.removeEventListener(
        "session-expired",
        handleSessionExpired
      );
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
      {!sessionExpired && children}

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
                navigate("/login", { replace: true });
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
