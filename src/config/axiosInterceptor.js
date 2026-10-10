import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event("session-expired"));
    }
    return Promise.reject(error);
  }
);