const STATUS_CLASS_MESSAGES = Object.freeze({
  1: "Your request is being processed. Please wait.",
  2: "Your request was completed successfully.",
  3: "We couldn't open the requested page. Please try again.",
  4: "We couldn't complete your request. Please check your details and try again.",
  5: "Something went wrong on our server. Please try again later.",
});
export const getHttpStatusMessage = (status) => {
  if (
    !Number.isInteger(status) ||
    status < 100 ||
    status > 599
  ) {
    return "Something went wrong. Please try again.";
  }

  const statusClass = Math.floor(status / 100);

  return STATUS_CLASS_MESSAGES[statusClass];
};

export const getApiErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again."
) => {
  // Handle request timeout errors.
  if (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT"
  ) {
    return "The request took too long. Please try again.";
  }

  const status = error?.response?.status;

  // Handle network errors.
  if (!Number.isInteger(status)) {
    if (error?.request) {
      return "Unable to connect. Please check your internet connection and try again.";
    }

    return fallbackMessage;
  }

  // Preserve the existing session-expiry behavior for 401.
  if (status === 401) {
    return "Your session may have expired. Please sign in again.";
  }

  // Successful HTTP responses should not be treated as errors.
  if (status >= 200 && status < 300) {
    return fallbackMessage;
  }

  return getHttpStatusMessage(status);
};
