import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config/api";

// Define sidebar menu items and the routes associated with each section.
const menuItems = [
  {
    icon: "person",
    label: "My Profile",
    path: "/profile",
    routes: ["/profile"],
  },
  {
    icon: "home",
    label: "Dashboard",
    path: "/client-dashboard",
    routes: ["/client-dashboard"],
  },
  {
    icon: "video_chat",
    label: "Interview Modes",
    path: "/interview-modes",
    routes: [
      "/interview-modes",
      "/self-introduction",
      "/feedback",
      "/theory-topic",
      "/sub-topic",
      "/theory-interview-start-module",
      "/theory-interview",
      "/theory-feedback",
    ],
  },
  {
    icon: "calendar_today",
    label: "Scheduled for you",
    path: "/scheduled-Interview",
    routes: [
      "/scheduled-Interview",
      "/scheduled-Interview-mode",
      "/scheduled-AI-Interview",
      "/scheduled-Interview-feedback",
    ],
  },
  {
    icon: "fact_check",
    label: "Scorecards",
    path: "/scorecards",
    routes: [
      "/scorecards",
      "/Interview-Performance-Report",
    ],
  },
];

function Sidebar({ openSidebar, setOpenSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Check whether the current URL belongs to a menu item's route list.
  const isMenuActive = (item) => {
    const currentPath = location.pathname;

    return item.routes.some(
      (route) =>
        currentPath === route ||
        currentPath.startsWith(`${route}/`)
    );
  };

  const handleLogout = async () => {
    try {
      // Retrieve the authentication token for the logout request.
      const token = localStorage.getItem("token");

      // Notify the backend that the current user is logging out.
      const response = await axios.post(
        `${BASE_URL}/auth/logout`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Logout Success:", response.data);
    } catch (error) {
      // Log the API error if the logout request fails.
      console.error(
        "Logout Error:",
        error.response?.data || error.message
      );
    } finally {
      // Clear the stored authentication and user details after logout.
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("employee_id");
      localStorage.removeItem("role");

      // Redirect the user to the login page.
      navigate("/login");
    }
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen
        bg-[#230804] text-white flex flex-col
        p-4 gap-2
        transition-all duration-300
        ${openSidebar ? "w-64" : "w-20"}
      `}
    >
      {/* Toggle between the expanded and collapsed sidebar layouts. */}
      <button
        onClick={() => setOpenSidebar(!openSidebar)}
        className="
          absolute top-5 -right-4
          w-8 h-8 rounded-full
          bg-green-800 text-white
          flex items-center justify-center
          shadow-lg cursor-pointer
        "
      >
        {openSidebar ? (
          <ChevronLeft size={20} />
        ) : (
          <ChevronRight size={20} />
        )}
      </button>

      {/* Display the company logo and sidebar heading. */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          <img
            src="/title_mss_logo.png"
            alt="logo"
            className="w-10 h-10 object-contain rounded shrink-0"
          />

          {openSidebar && (
            <div>
              <h2 className="text-[20px] leading-7 font-bold text-white">
                MSS Techno
              </h2>

              <p className="text-[12px] leading-4 tracking-wider text-white/60">
                Client Dashboard
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Render navigation links and highlight the active menu section. */}
      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={() => {
              const active = isMenuActive(item);

              return `
                w-full flex items-center
                ${openSidebar ? "justify-start gap-3" : "justify-center"}
                px-4 py-3 rounded-xl
                text-[12px] tracking-wider transition-all
                ${
                  active
                    ? "bg-green-800 text-white font-bold"
                    : "text-white/80 hover:bg-white/10"
                }
              `;
            }}
          >
            <span className="material-symbols-outlined shrink-0 text-[24px] leading-none">
              {item.icon}
            </span>

            {openSidebar && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Display logout and application version information. */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center justify-center
            px-4 py-3 rounded-xl
            bg-green-800 hover:bg-green-700
            text-[12px] leading-4 uppercase tracking-wider
            font-bold transition-all duration-150
            active:scale-95 cursor-pointer
          "
        >
          <span className="material-symbols-outlined shrink-0 text-[12px] leading-none">
            logout
          </span>

          {openSidebar && <span>Logout</span>}
        </button>

        <p className="mt-4 text-sm text-white/60 text-center">
          &copy; {new Date().getFullYear()} version 1.0.0
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;