import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FiDownload, FiEye, FiEdit, FiUpload, FiLoader } from "react-icons/fi";
import BASE_URL from "../config/api";

function MyProfile() {
  // Identify the client whose profile data and documents must be loaded.
  const client_id = localStorage.getItem("client_id");
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [links, setLinks] = useState([]);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "",
    onConfirm: null
  });

  // Reuse the current token when sending authenticated API requests.
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  // Load the current client details from the backend.
  const fetchClient = useCallback(async () => {
    console.log("Fetching client ID:", client_id);
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/clients/clients/${client_id}`,
        getAuthHeaders()
      );
      console.log("CLIENT DATA:", res.data);
      setClient(res.data);
    } catch (err) {
      console.error("API ERROR:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [client_id, getAuthHeaders]);

  // Load client details when a client ID is available, and skip a queued call after cleanup.
  useEffect(() => {
    let cancelled = false;
    if (client_id) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          fetchClient();
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [client_id, fetchClient]);

  /*fetch documents*/
  // Retrieve the client's document list for the Document Repository section.
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/documents/clients/${client_id}/documents`,
        getAuthHeaders()
      );
      console.log("Documents API Response:", res.data);
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  }, [client_id, getAuthHeaders]);

  useEffect(() => {
    let cancelled = false;
    if (client_id) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          fetchDocuments();
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [client_id, fetchDocuments]);

  /*fetch link*/
  // Retrieve the external/source links associated with this client.
  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/clients/clients/${client_id}/source-links`,
        getAuthHeaders()
      );
      console.log("Links API Response:", res.data);
      setLinks(res.data.source_links || []);
    } catch (err) {
      console.error("Error fetching links:", err);
    } finally {
      setLoading(false);
    }
  }, [client_id, getAuthHeaders]);

  useEffect(() => {
    let cancelled = false;
    if (client_id) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          fetchLinks();
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [client_id, fetchLinks]);

  /*fetch profile photo*/
  // Request the profile picture as a blob so the browser can preview it.
  const fetchProfilePhotoView = useCallback(async () => {
    console.log("Fetching profile photo for client ID:", client_id);
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture-view`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );
      console.log("Profile View Response:", res.data);
      // Create a browser URL from the downloaded image blob for display.
      const imageURL = URL.createObjectURL(res.data);
      setProfileUrl(imageURL);
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Profile photo fetch failed:", err);
      }
      setProfileUrl("");
    } finally {
      setLoading(false);
    }
  }, [client_id]);
  useEffect(() => {
    let cancelled = false;
    if (client_id) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          fetchProfilePhotoView();
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [client_id, fetchProfilePhotoView]);

  // Keep the page in its existing loading state until client details arrive.
  if (!client) {
    return <div className="p-6">Loading client details...</div>;
  }

  /*view document*/
  // Open the selected document using the URL returned by the backend.
  // Request a temporary view URL for the selected document and open it in a new tab.
  const handleView = async (doc) => {
    console.log("Viewing document:", doc);
    try {
      setLoading(true);
      console.log("VIEW FILE ID:", doc.file_id);
      const res = await axios.get(
        `${BASE_URL}/documents/files/view`,
        {
          params: { file_id: doc.file_id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Document View response received:", res.data);
      // Use the URL supplied by the backend rather than the local file metadata.
      const viewUrl = res.data.view_url;
      window.open(viewUrl, "_blank");
      setPopup({
        show: true,
        message: "Document opened in new tab",
        type: "success"
      });
      fetchDocuments();
    } catch (err) {
      console.error("View error:", err.response?.data || err.message);
      setPopup({
        show: true,
        message: "Failed to open document",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /*download document*/
  // Request a download URL and trigger the browser download for the selected document.
  const handleDownload = async (doc) => {
    console.log("Downloading document:", doc);
    try {
      setLoading(true);
      console.log("DOWNLOAD FILE ID:", doc.file_id);
      const res = await axios.get(
        `${BASE_URL}/documents/files/download`,
        {
          params: { file_id: doc.file_id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Download response received:", res.data);
      // Create a temporary link to start downloading with the original file name.
      const downloadUrl = res.data.download_url;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", doc.original_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setPopup({
        show: true,
        message: "Download started",
        type: "success"
      });
      fetchDocuments();
    } catch (err) {
      console.error("Download error:", err.response?.data || err.message);
      setPopup({
        show: true,
        message: "Failed to download document",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Validate the selected image before saving it for upload.
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Accept only the image extensions supported by the existing upload flow.
    const allowed = ["png", "jpg", "jpeg"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setPopup({
        show: true,
        message: "Invalid file type",
        type: "error"
      });
      return;
    }
    // Keep the selected file for upload and create a local preview for the modal.
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };
  const profileImage = profileUrl;

  // Build fallback initials from the first letters of the client name.
  const initials = `${client?.client_name
    ?.split(" ")[0]
    ?.charAt(0) || ""}${client?.client_name
      ?.split(" ")[1]
      ?.charAt(0) || ""}`.toUpperCase();

  /*add or update profile photo*/
  // Send the selected image as multipart form data.
  const handleUploadProfile = async () => {
    console.log("Uploading profile photo:", profileFile);
    if (!profileFile) {
      setPopup({
        show: true,
        message: "Please select an image",
        type: "error"
      });
      return;
    }
    try {
      setLoading(true);
      // FormData sends the file in the format expected by the upload endpoint.
      const formData = new FormData();
      formData.append("file", profileFile);
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("Uploading profile photo for client ID:", client_id);
      const res = await axios.post(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Profile photo upload response:", res.data);
      // Clear the selected file and preview after a successful upload.
      setProfileFile(null);
      setProfilePreview("");
      fetchProfilePhotoView();
      setShowPhotoModal(false);
      fetchProfilePhotoView();
      setPopup({
        show: true,
        message: "Profile photo uploaded successfully",
        type: "success"
      });
    } catch (err) {
      console.error("Upload error:", err.response?.data);
      setPopup({
        show: true,
        message: "Upload failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  /*delete profile photo*/
  // Delete the current profile picture through the backend endpoint.
  const handleDeleteProfile = async () => {
    console.log("Deleting profile photo for client ID:", client_id);
    try {
      setLoading(true);
      console.log("Delete request sent for profile photo:", profileUrl);
      const res = await axios.delete(
        `${BASE_URL}/documents/clients/${client_id}/profile-picture`,
        {
          ...getAuthHeaders(),
          params: { gcs_path: profileUrl }
        }
      );
      console.log("Profile photo delete response:", res.data);
      // Clear the displayed image after the delete request succeeds.
      setProfileUrl("");
      setPopup({
        show: true,
        message: "Profile photo deleted successfully",
        type: "success"
      });
      setShowPhotoModal(false);
      fetchProfilePhotoView();
    } catch (err) {
      console.error("Delete error:", err.response?.data);
      setPopup({
        show: true,
        message: "Delete failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      {/* Show a blocking loader while profile or document operations are running. */}
      {/* FULL SCREEN LOADER */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 z-9999 flex items-center justify-center">
          <div className="p-6 flex flex-col items-center gap-3">
            <FiLoader className="animate-spin text-4xl text-green-800" />
            <p className="text-gray-800 font-medium">
              Please wait...
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {/* PROFILE IMAGE */}
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow"
              />
            ) : (
              <div
                className="
                  w-24 h-24 sm:w-28 sm:h-28
                  rounded-full bg-gray-100 text-black-600
                  flex items-center justify-center
                  text-4xl font-bold
                  shadow
                "
              >
                {initials}
              </div>
            )}
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer"
            >
              {profileUrl ? <FiEdit /> : <FiUpload />}
            </button>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
              {client.client_name || "No Name"}
            </h1>
            <p className="text-base sm:text-lg font-bold mt-1">
              {client.professional_role || "No Role"}
            </p>
          </div>
        </div>
      </div>

      {/* Present the client details returned by the profile API. */}
      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">EMAIL</p>
          <p className="font-semibold break-all">
            {client.email || "No Email"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">MOBILE</p>
          <p className="font-semibold">
            {client.mobile || "No Mobile"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">AADHAAR NUMBER</p>
          <p className="font-semibold break-all">
            {client.aadhaar_number || "No AADHAR Number"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">LOCATION</p>
          <p className="font-semibold break-all">
            {client.location || "No Location"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">TECHNOLOGY STACKS</p>
          <p className="font-semibold break-all">
            {client.technology || "No Technology Stacks"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm min-w-0 overflow-hidden">
          <p className="text-xs text-gray-400">ASSIGNED TO</p>
          <p className="font-semibold">
            {client.employee_id ? `${client.employee_id} - ${client.employee_name}` : "No Assigned Employee"}
          </p>
        </div>
        {/* START DATE */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-400">START DATE</p>
          <p className="font-semibold">
            {client.start_date
              ? new Date(client.start_date).toLocaleDateString()
              : "No Start Date"}
          </p>
        </div>
        {/* END DATE */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-400">END DATE</p>
          <p className="font-semibold">
            {client.end_date &&
              !isNaN(new Date(client.end_date))
              ? new Date(client.end_date).toLocaleDateString()
              : "Currently In Process"}
          </p>
        </div>
      </div>

      {/* Render each document with actions to view or download it. */}
      {/* DOCUMENTS */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="p-4 sm:p-6 bg-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Document Repository
            </h2>
            <p className="text-sm text-gray-400">
              Verified compliance documents and professional records
            </p>
          </div>
        </div>
        {/* DOCUMENTS LIST */}
        {documents?.length ? (
          documents.map((doc, i) => {
            const fileName = doc.original_name || "document";
            const fileType = fileName.split(".").pop().toUpperCase();
            return (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50 transition"
              >
                {/* Left Side*/}
                <div className="flex items-start sm:items-center gap-4 w-full">
                  <div className="w-10 h-10 bg-green-800 text-green-800 flex items-center justify-center rounded-lg">
                    📄
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {fileName}
                    </p>
                    <p className="text-sm text-gray-400 flex flex-wrap items-center gap-2">
                      {fileType} •{" "}
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString()
                        : "Recently added"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500 self-end sm:self-auto">
                  <FiEye
                    className="cursor-pointer hover:text-green-700"
                    onClick={() => handleView(doc)}
                  />
                  <FiDownload
                    className="cursor-pointer hover:text-green-700"
                    onClick={() => handleDownload(doc)}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-6 text-gray-400">No documents available</p>
        )}
      </div>

      {/* List external resources and source links provided for the client. */}
      {/* LINKS */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="p-4 sm:p-6 bg-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Important Links
            </h2>
            <p className="text-sm text-gray-400">
              External resources and client-related links
            </p>
          </div>
        </div>
        {/* LINKS LIST */}
        {links?.length ? (
          links.map((link, i) => {
            let name = link.link_type || "Untitled";
            let url = link.link || "#";

         return (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50"
              >
                <div className="min-w-0 w-full">
                  <p
                    className="text-md font-semibold text-gray-800 break-all whitespace-normal"
                    title={name}
                  >
                    {name.length > 100 ? `${name.substring(0, 100)}...` : name}
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-green-700 underline break-all"
                  >
                    {url}
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <p className="p-6 text-gray-400">No links available</p>
        )}
      </div>

      {/* Open the profile-photo modal for selecting, previewing, uploading, or deleting an image. */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-96 shadow-xl relative">
            <h2 className="text-lg font-semibold mb-4 text-center">
              Upload Profile Photo
            </h2>
            {/* CLICK AREA */}
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                id="profileUpload"
                className="hidden"
                onChange={handleProfileChange}
              />
              <label htmlFor="profileUpload" className="cursor-pointer">
                <p className="text-gray-500">Click here to add photo</p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, JPEG supported
                </p>
              </label>
            </div>
            {/* PREVIEW */}
            {profilePreview && (
              <img
                src={profilePreview}
                className="w-24 h-24 rounded-full mx-auto mt-4 object-cover"
              />
            )}
            {/* ACTIONS */}
            <div className="flex justify-between mt-6">
              {/* DELETE BUTTON */}
              {profileUrl && (
                <button
                  onClick={handleDeleteProfile}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
                >
                  Delete
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    setShowPhotoModal(false);
                    setProfileFile(null);
                    setProfilePreview("");
                    const input = document.getElementById("profileUpload");
                    if (input) input.value = "";
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadProfile}
                  className="px-4 py-2 bg-green-800 text-white rounded-lg cursor-pointer"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Display success, error, or confirmation feedback through the shared popup state. */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-50 px-2">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <p className={`text-lg font-semibold mb-4
                ${popup.type === "success" && "text-green-600"}
                ${popup.type === "error" && "text-red-600"}
                ${popup.type === "confirm" && "text-gray-800"}
            `}>
              {popup.message}
            </p>
            {/* BUTTONS */}
            <div className="flex justify-center gap-3">
              {popup.type === "confirm" ? (
                <>
                  <button
                    onClick={async () => {
                      await popup.onConfirm();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setPopup({ show: false })}
                    className="px-4 py-2 bg-gray-300 rounded border border-gray-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setPopup({ show: false })}
                  className="px-4 py-2 bg-green-800 text-white rounded-2xl hover:bg-green-700 cursor-pointer"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default MyProfile;
