
import axios from "axios";

let sessionHandled = false;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Do not treat invalid login credentials as session expiry.
    const isLoginRequest = requestUrl.includes("/auth/login");

    // Handle unauthorized responses only once per session.
    if (
      status === 401 &&
      !isLoginRequest &&
      !sessionHandled
    ) {
      sessionHandled = true;
      window.dispatchEvent(new Event("session-expired"));
    }
    return Promise.reject(error);
  }
);
