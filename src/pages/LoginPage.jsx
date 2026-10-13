import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import axios from "axios";
import BASE_URL from "../config/api";

function Login() {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [invalidPopup, setInvalidPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Check whether the entered email matches the existing accepted format.
  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._]+@gmail\.com$/;
    return emailRegex.test(value);
  };

  // Validate required fields and set the corresponding field-level errors.
  const handleSignIn = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    if (!email) {
      setEmailError("Please enter email");
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Error in email account");
      valid = false;
    }
    if (!password) {
      setPasswordError("Please enter password");
      valid = false;
    }
    if (!valid) return false;
    return true;
  };

  // api

  // Submit the login request only after the form validation succeeds.
  const loginHandler = async (e) => {
    e.preventDefault();
    const isValid = handleSignIn();
    if (!isValid) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
          email: email,
          password: password,
        }
      );

      // Read the client ID from the supported backend response structures.
      const client_id =
        response.data.client_id ||
        response.data.user?.client_id ||
        response.data.data?.client_id;

      // Check the supported response fields for the access token.
      const accessToken =
        response.data.access_token ||
        response.data.token ||
        response.data.jwt ||
        response.data.data?.access_token;

      // Retrieve the refresh token when the backend provides one.
      const refreshToken =
        response.data.refresh_token ||
        response.data.data?.refresh_token;

      // Read the user role from the supported backend response structures.
      const role =
        response.data.role ||
        response.data.user?.role ||
        response.data.data?.role;

      // Normalize the role received from the backend.
      const formattedRole =
        typeof role === "string" ? role.toLowerCase().trim() : "";


      // Allow only client accounts to proceed with login.
      if (!accessToken || formattedRole !== "client") {
        // Clear authentication data when the response is invalid or the role is not allowed.
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
        localStorage.removeItem("client_id");
        localStorage.removeItem("user_id");
        localStorage.removeItem("employee_id");

        setErrorMessage(
          !accessToken
            ? "Login response is missing the access token."
            : formattedRole !== "client"
              ? "Only client accounts can log in here."
              : "Login response is missing required authentication data."
        );

        setInvalidPopup(true);
        return;
      }
      // Clear previous authentication data after validating the response.
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
      localStorage.removeItem("client_id");
      localStorage.removeItem("user_id");
      localStorage.removeItem("employee_id");

      // Store the new authentication data.
      localStorage.setItem("token", accessToken);
      localStorage.setItem("role", formattedRole);

      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      if (client_id != null) {
        localStorage.setItem("client_id", String(client_id));
      }

      // Navigate after storing
      setPageLoading(true);
      setTimeout(() => {
        // Redirect according to the normalized role after a short loading delay.
        if (formattedRole === "client") {
          navigate("/client-dashboard");
        } else {
          navigate("/login");
        }
      }, 500);
    } catch (error) {
      let message = "Login failed";

      // Backend response handling
      // Extract a useful error message from the backend response when available.
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          message = error.response.data;
        } else if (error.response.data.detail) {
          message = error.response.data.detail;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      setErrorMessage(message);
      setInvalidPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
        {/* WATERMARK BACKGROUND */}
        <div
          className="
          fixed
          inset-0
          z-0
          opacity-40
          pointer-events-none
          bg-center
          bg-no-repeat
          bg-contain
        "
          style={{
            backgroundImage: "url('./watermark.webp')",
            backgroundSize: "650px",
          }}
        />

        {/* ROUND TEXT BACKGROUND */}
        <div
          className="
            hidden
            md:flex
            fixed
            inset-0
            z-0
            items-center
            justify-center
            pointer-events-none
          "
        >
          <img
            src="./textMSS.webp"
            alt="Round Text"
            className="
              w-[120vmin]
              h-[120vmin]
              object-contain
              opacity-90
            "
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          {/* LOGO */}
          <img
            src="./logo.webp"
            alt="Company Logo"
            className="
              w-40
              sm:w-40
              md:w-40
              lg:w-40
              xl:w-40
              mb-4
              object-contain
            "
          />

          {/* LOGIN CARD */}
          <form
            onSubmit={loginHandler}
            className="
            w-full
            max-w-sm
            bg-white/95
            backdrop-blur-sm
            rounded-xl
            shadow-2xl
            p-6
            sm:p-8
          "
          >
            {/* Email */}
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              EMAIL ID
            </label>
            <div className={`flex items-center border rounded-lg mt-1 mb-3 px-3 ${emailError ? "border-red-500" : "border-gray-300"
              }`}>
              <FiMail className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                className="w-full py-2 outline-none text-sm"
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-xs text-left">
                {emailError}
              </p>
            )}

            {/* Password */}
            <label className="text-sm font-semibold text-gray-700 tracking-wide">
              PASSWORD
            </label>
            <div className={`flex items-center border rounded-lg mt-1 mb-1 px-3 ${passwordError ? "border-red-500" : "border-gray-300"
              }`}>
              <FiLock className="text-gray-400 mr-2 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                className="w-full py-2 outline-none text-sm appearance-none"
              />

              {/* Toggle password visibility without changing the entered value. */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-500 ml-2 cursor-pointer focus:outline-none"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-xs text-left">
                {passwordError}
              </p>
            )}

            {/* Open the existing password-reset access information popup. */}
            <p
              className="text-left text-sm text-green-600 cursor-pointer hover:underline mb-6"
              onClick={() => setShowPopup(true)}
            >
              Forgot password?
            </p>

            {/* Prevent duplicate submissions while login or navigation is in progress. */}
            <button
              type="submit"
              disabled={loading || pageLoading}
              className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Forgot Password Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-2 text-red-600">
                Access Denied
              </h3>
              <p className="text-gray-600 text-sm">
                You don’t have access to reset the password.
                Please contact the admin.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="mt-5 px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <FiLoader className="animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "OK"
                )}
              </button>
            </div>
          </div>
        )}
        {/* Invalid Credentials Popup */}
        {invalidPopup && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div className="bg-white w-full max-w-xs sm:max-w-[320px] p-5 sm:p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-lg font-semibold mb-2 text-red-600">
                Login Failed
              </h3>
              <p className="text-gray-600 text-sm wrap-break-word">
                {errorMessage}
              </p>
              <button
                onClick={() => setInvalidPopup(false)}
                className="mt-5 px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 text-sm cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Login;