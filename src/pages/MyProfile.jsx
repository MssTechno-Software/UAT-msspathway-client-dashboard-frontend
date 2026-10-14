import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FiDownload, FiEye, FiEdit, FiUpload, FiLoader } from "react-icons/fi";
import BASE_URL from "../config/api";
import { getApiErrorMessage } from "../utils/apiErrorHandler";
import ApiErrorModal from "../components/ApiErrorModal";
import { getAccessToken, getClientId } from "../services/authSession";

// Keep section errors near the section that owns the request.
const createLocalApiError = (error, title, fallbackMessage, onRetry) => {
    // Preserve the existing 401 session-expiry flow.
    if (error?.response?.status === 401)
        return null;
    return {
        title,
        message: getApiErrorMessage(error, fallbackMessage),
        onRetry,
    };
};

function MyProfile() {
    // Identify the client whose profile data and documents must be loaded.
    const client_id = getClientId();
    const [client, setClient] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [links, setLinks] = useState([]);
    const [profileFile, setProfileFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState("");
    const [profileUrl, setProfileUrl] = useState("");
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // Keep loading states separate so one section does not block the page.
    const [actionLoading, setActionLoading] = useState(false);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [linksLoading, setLinksLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);

    // Only the main client profile request uses the main error popup.
    const [pageError, setPageError] = useState(null);
    const [showPageErrorModal, setShowPageErrorModal] = useState(true);

    // Keep other API errors close to their respective sections.
    const [documentsError, setDocumentsError] = useState(null);
    const [linksError, setLinksError] = useState(null);
    const [photoError, setPhotoError] = useState(null);

    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "",
        onConfirm: null,
    });

    // Retry counters trigger the corresponding existing request effect.
    const [clientRetryCount, setClientRetryCount] = useState(0);
    const [documentsRetryCount, setDocumentsRetryCount] = useState(0);
    const [linksRetryCount, setLinksRetryCount] = useState(0);
    const [photoRetryCount, setPhotoRetryCount] = useState(0);

    // Read the authentication token from the current tab's session.
    const getAuthHeaders = useCallback(() => {
        const token = getAccessToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }, []);

    // Load the essential client profile for the whole page.
    const fetchClient = useCallback(async () => {
        try {
            setPageError(null);
            const res = await axios.get(
                `${BASE_URL}/clients/clients/${client_id}`,
                getAuthHeaders()
            );
            setClient(res.data);
        }
        catch (err) {
            const errorDetails = createLocalApiError(
                err,
                "Unable to Load Profile",
                "Unable to load client details. Please try again.",
                () => {
                    setPageError(null);
                    setShowPageErrorModal(true);
                    setClientRetryCount((prev) => prev + 1);
                }
            );
            setPageError(errorDetails);
            if (errorDetails) {
                setShowPageErrorModal(true);
            }
        }
    }, [client_id, getAuthHeaders]);

    // Load essential profile details when a client ID is available.
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
    }, [client_id, fetchClient, clientRetryCount]);

    /* Fetch documents */
    // Document errors stay inside the Document Repository section.
    const fetchDocuments = useCallback(async () => {
        try {
            setDocumentsLoading(true);
            setDocumentsError(null);
            const res = await axios.get(
                `${BASE_URL}/documents/clients/${client_id}/documents`,
                getAuthHeaders()
            );
            setDocuments(res.data.documents || []);
        }
        catch (err) {
            setDocumentsError(
                createLocalApiError(
                    err,
                    "Unable to Load Documents",
                    "Unable to load your documents. Please try again.",
                    () => setDocumentsRetryCount((prev) => prev + 1)
                )
            );
        }
        finally {
            setDocumentsLoading(false);
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
    }, [client_id, fetchDocuments, documentsRetryCount]);

    /* Fetch Important Links */
    // Link errors stay inside the Important Links section.
    const fetchLinks = useCallback(async () => {
        try {
            setLinksLoading(true);
            setLinksError(null);
            const res = await axios.get(
                `${BASE_URL}/clients/clients/${client_id}/source-links`,
                getAuthHeaders()
            );
            setLinks(res.data.source_links || []);
        }
        catch (err) {
            setLinksError(
                createLocalApiError(
                    err,
                    "Unable to Load Important Links",
                    "Unable to load your links. Please try again.",
                    () => setLinksRetryCount((prev) => prev + 1)
                )
            );
        }
        finally {
            setLinksLoading(false);
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
    }, [client_id, fetchLinks, linksRetryCount]);

    /* Fetch profile photo */
    // A profile-photo failure must not block unrelated sections.
    const fetchProfilePhotoView = useCallback(async () => {
        try {
            setPhotoLoading(true);
            setPhotoError(null);
            const res = await axios.get(
                `${BASE_URL}/documents/clients/${client_id}/profile-picture-view`,
                {
                    ...getAuthHeaders(),
                    responseType: "blob",
                }
            );
            // Create a browser URL from the downloaded image blob.
            const imageURL = URL.createObjectURL(res.data);
            setProfileUrl(imageURL);
        }
        catch (err) {
            // A missing photo is valid and should not show an error.
            if (err.response?.status === 404) {
                setPhotoError(null);
            }
            else {
                setPhotoError(
                    createLocalApiError(
                        err,
                        "Unable to Load Profile Photo",
                        "Unable to load your profile photo. Please try again.",
                        () => setPhotoRetryCount((prev) => prev + 1)
                    )
                );
            }
            setProfileUrl("");
        }
        finally {
            setPhotoLoading(false);
        }
    }, [client_id, getAuthHeaders]);

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
    }, [client_id, fetchProfilePhotoView, photoRetryCount]);

    // Show the main popup only if the essential profile cannot load.
    if (!client) {
        return (
            <>
                {!pageError && (
                    <div className="min-h-screen bg-white flex items-center justify-center p-6">
                        <p className="text-gray-600">
                            Loading client details...
                        </p>
                    </div>
                )}

                {pageError && !showPageErrorModal && (
                    <div className="min-h-screen bg-white flex items-center justify-center p-6">
                        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Profile Unavailable
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                {pageError.message}
                            </p>

                            {pageError.onRetry && (
                                <button
                                    type="button"
                                    onClick={pageError.onRetry}
                                    className="mt-6 w-full rounded-xl bg-green-800 px-5 py-3 font-medium text-white hover:bg-green-900"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <ApiErrorModal
                    title={pageError?.title}
                    message={
                        showPageErrorModal ? pageError?.message : null
                    }
                    onRetry={pageError?.onRetry}
                    onClose={() => setShowPageErrorModal(false)}
                />
            </>
        );
    }

    /* View document */
    // Open the selected document using the URL returned by the backend.
    const handleView = async (doc) => {
        try {
            setActionLoading(true);
            setDocumentsError(null);
            const res = await axios.get(
                `${BASE_URL}/documents/files/view`,
                {
                    params: {
                        file_id: doc.file_id,
                    },
                    ...getAuthHeaders(),
                }
            );
            const viewUrl = res.data.view_url;
            window.open(viewUrl, "_blank");
            setPopup({
                show: true,
                message: "Document opened in new tab",
                type: "success",
            });
            fetchDocuments();
        }
        catch (err) {
            setDocumentsError(
                createLocalApiError(
                    err,
                    "Unable to Open Document",
                    "Unable to open this document. Please try again.",
                    () => handleView(doc)
                )
            );
        }
        finally {
            setActionLoading(false);
        }
    };

    /* Download document */
    // Request a download URL and trigger the browser download.
    const handleDownload = async (doc) => {
        try {
            setActionLoading(true);
            setDocumentsError(null);
            const res = await axios.get(
                `${BASE_URL}/documents/files/download`,
                {
                    params: {
                        file_id: doc.file_id,
                    },
                    ...getAuthHeaders(),
                }
            );
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
                type: "success",
            });
            fetchDocuments();
        }
        catch (err) {
            setDocumentsError(
                createLocalApiError(
                    err,
                    "Unable to Download Document",
                    "Unable to download this document. Please try again.",
                    () => handleDownload(doc)
                )
            );
        }
        finally {
            setActionLoading(false);
        }
    };

    // Validate the selected image before saving it for upload.
    const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (!file)
            return;
        const allowed = ["png", "jpg", "jpeg"];
        const ext = file.name.split(".").pop().toLowerCase();
        if (!allowed.includes(ext)) {
            setPhotoError({
                title: "Invalid File Type",
                message: "Please choose a JPG, JPEG, or PNG image.",
                onRetry: null,
            });
            return;
        }
        setPhotoError(null);
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

    /* Add or update profile photo */
    // Upload errors stay with the profile photo controls.
    const handleUploadProfile = async () => {
        if (!profileFile) {
            setPhotoError({
                title: "No Image Selected",
                message: "Please select an image before uploading.",
                onRetry: null,
            });
            return;
        }
        try {
            setActionLoading(true);
            setPhotoError(null);
            const formData = new FormData();
            formData.append("file", profileFile);
            await axios.post(
                `${BASE_URL}/documents/clients/${client_id}/profile-picture`,
                formData,
                getAuthHeaders()
            );
            setProfileFile(null);
            setProfilePreview("");
            setShowPhotoModal(false);
            setPopup({
                show: true,
                message: "Profile photo uploaded successfully",
                type: "success",
            });
        }
        catch (err) {
            setPhotoError(
                createLocalApiError(
                    err,
                    "Unable to Upload Photo",
                    "Unable to upload your profile photo. Please try again.",
                    () => handleUploadProfile()
                )
            );
        }
        finally {
            setActionLoading(false);
        }
    };

    /* Delete profile photo */
    // Delete the current profile picture through the backend endpoint.
    const handleDeleteProfile = async () => {
        try {
            setActionLoading(true);
            setPhotoError(null);
            await axios.delete(
                `${BASE_URL}/documents/clients/${client_id}/profile-picture`,
                {
                    ...getAuthHeaders(),
                    params: {
                        gcs_path: profileUrl,
                    },
                }
            );
            setProfileUrl("");
            setPopup({
                show: true,
                message: "Profile photo deleted successfully",
                type: "success",
            });
            setShowPhotoModal(false);
            fetchProfilePhotoView();
        }
        catch (err) {
            setPhotoError(
                createLocalApiError(
                    err,
                    "Unable to Delete Photo",
                    "Unable to delete your profile photo. Please try again.",
                    () => handleDeleteProfile()
                )
            );
        }
        finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white min-h-screen">
            {/* Show progress during an explicit document or photo action. */}
            {actionLoading && (
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
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0">
                        <div className="relative h-full w-full overflow-hidden rounded-full">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="h-full w-full object-cover shadow"
                                />
                            ) : (
                                <div className="
                                     flex h-full w-full items-center justify-center
                                     rounded-full bg-gray-100 text-black-600
                                     text-4xl font-bold shadow
                                     ">
                                    {initials}
                                </div>
                            )}

                            {/* Keep the loading overlay inside the image circle. */}
                            {photoLoading && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-full bg-white/80 text-xs text-gray-600">
                                    <FiLoader className="mb-1 animate-spin text-lg text-green-800" />
                                    <span>Loading photo...</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowPhotoModal(true)}
                            className="absolute bottom-0 right-0 z-20 rounded-full bg-white p-2 shadow cursor-pointer"
                        >
                            {profileUrl ? <FiEdit /> : <FiUpload />}
                        </button>
                    </div>

                    {!showPhotoModal && photoError && (
                        <div
                            className="mt-2 max-w-xs rounded-lg border border-gray-200 bg-gray-50 p-3"
                            role="alert"
                        >
                            <p className="text-sm font-semibold text-gray-800">
                                {photoError.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                                {photoError.message}
                            </p>
                            {photoError.onRetry && (
                                <button
                                    type="button"
                                    onClick={photoError.onRetry}
                                    className="mt-2 text-sm font-medium text-green-800 underline"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    )}

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

            {/* CLIENT DETAILS */}
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
                        {client.employee_id
                            ? `${client.employee_id} - ${client.employee_name}`
                            : "No Assigned Employee"}
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

            {/* DOCUMENT REPOSITORY */}
            <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
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

                {/* Document-level loading and error display. */}
                {documentsLoading && (
                    <p className="p-4 text-sm text-gray-500" role="status">
                        Loading documents...
                    </p>
                )}

                {documentsError && (
                    <div
                        className="m-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                        role="alert"
                    >
                        <p className="font-semibold text-gray-800">
                            {documentsError.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                            {documentsError.message}
                        </p>
                        {documentsError.onRetry && (
                            <button
                                type="button"
                                onClick={documentsError.onRetry}
                                className="mt-3 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}

                {!documentsLoading &&
                    !documentsError &&
                    documents.length === 0 && (
                        <p className="p-6 text-gray-400">
                            No documents available
                        </p>
                    )}

                {documents.map((doc, i) => {
                    const fileName = doc.original_name || "document";
                    const fileType = fileName.split(".").pop().toUpperCase();
                    return (
                        <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-gray-100 last:border-none hover:bg-gray-50 transition"
                        >
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
                })}
            </div>

            {/* IMPORTANT LINKS */}
            <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
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

                {/* Links-level loading and error display. */}
                {linksLoading && (
                    <p className="p-4 text-sm text-gray-500" role="status">
                        Loading important links...
                    </p>
                )}

                {linksError && (
                    <div
                        className="m-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                        role="alert"
                    >
                        <p className="font-semibold text-gray-800">
                            {linksError.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                            {linksError.message}
                        </p>
                        {linksError.onRetry && (
                            <button
                                type="button"
                                onClick={linksError.onRetry}
                                className="mt-3 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}

                {!linksLoading && !linksError && links.length === 0 && (
                    <p className="p-6 text-gray-400">
                        No links available
                    </p>
                )}

                {links.map((link, i) => {
                    const name = link.link_type || "Untitled";
                    const url = link.link || "#";
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
                                    {name.length > 100
                                        ? `${name.substring(0, 100)}...`
                                        : name}
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
                })}
            </div>

            {/* PROFILE PHOTO MODAL */}
            {showPhotoModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-96 shadow-xl relative">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Upload Profile Photo
                        </h2>

                        <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center cursor-pointer hover:bg-gray-50">
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png"
                                id="profileUpload"
                                className="hidden"
                                onChange={handleProfileChange}
                            />
                            <label htmlFor="profileUpload" className="cursor-pointer">
                                <p className="text-gray-500">
                                    Click here to add photo
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    JPG, PNG, JPEG supported
                                </p>
                            </label>
                        </div>

                        {profilePreview && (
                            <img
                                src={profilePreview}
                                alt="Profile preview"
                                className="w-24 h-24 rounded-full mx-auto mt-4 object-cover"
                            />
                        )}

                        {/* Photo errors stay inside the photo modal. */}
                        {photoError && (
                            <div
                                className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3"
                                role="alert"
                            >
                                <p className="text-sm font-semibold text-gray-800">
                                    {photoError.title}
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    {photoError.message}
                                </p>
                                {photoError.onRetry && (
                                    <button
                                        type="button"
                                        onClick={photoError.onRetry}
                                        className="mt-2 text-sm font-medium text-green-800 underline"
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between mt-6">
                            {profileUrl && (
                                <button
                                    type="button"
                                    onClick={handleDeleteProfile}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer"
                                >
                                    Delete
                                </button>
                            )}

                            <div className="flex gap-2 ml-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPhotoModal(false);
                                        setProfileFile(null);
                                        setProfilePreview("");
                                        const input = document.getElementById("profileUpload");
                                        if (input)
                                            input.value = "";
                                    }}
                                    className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
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

            {/* Preserve the existing success and confirmation popup. */}
            {popup.show && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-40 z-50 px-2">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
                        <p
                            className={`text-lg font-semibold mb-4
                                ${popup.type === "success" && "text-green-600"}
                                ${popup.type === "error" && "text-red-600"}
                                ${popup.type === "confirm" && "text-gray-800"}
                            `}
                        >
                            {popup.message}
                        </p>

                        <div className="flex justify-center gap-3">
                            {popup.type === "confirm" ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            await popup.onConfirm();
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
                                    >
                                        Yes
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPopup({ show: false })}
                                        className="px-4 py-2 bg-gray-300 rounded border border-gray-300 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
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