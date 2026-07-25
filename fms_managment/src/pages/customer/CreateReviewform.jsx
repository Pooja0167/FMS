import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./../../store/slices/login/authSlice";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import { fetchDemoForm } from "../../store/slices/login/reviewSlice";
import { fetchDemoStatus, updateDemoForm } from "../../store/slices/login/demoFormSlice";

import logo from "../../assets/logo.png";
import leaf from "../../assets/leaf.png";
import mobileLeaf from "../../assets/mobile.png"; // Dynamic mobile template import

const DEMO_STARTED_CODE = "DEMO_STARTED";

export default function CreateReviewform() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { demoforms } = useSelector((state) => state.review || {});
  const { demostatus } = useSelector((state) => state.demoForms || {});

  const [selectedDemoId, setSelectedDemoId] = useState("");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [starting, setStarting] = useState(false);

  // Responsive state for mobile screen check
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  // Handle screen resize to switch template dynamically
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch demo list + demo status list on mount
  useEffect(() => {
    dispatch(fetchDemoForm());
    dispatch(fetchDemoStatus());
  }, [dispatch]);

  // Handle demo selection
  const handleDemoChange = (e) => {
    const demoId = e.target.value;
    setSelectedDemoId(demoId);
    const foundDemo = demoforms?.find((item) => String(item.id) === String(demoId));
    setSelectedDemo(foundDemo || null);
  };

  // Find the status record by its code, never by a hardcoded id.
  const handleDrive = async () => {
    if (!selectedDemoId) return;

    const startedStatus = demostatus?.find((s) => s.code === DEMO_STARTED_CODE);
    if (!startedStatus) {
      console.error(`Status with code "${DEMO_STARTED_CODE}" not found in demostatus list.`);
      return;
    }

    setStarting(true);
    try {
      await dispatch(
        updateDemoForm({
          id: selectedDemoId,
          formData: { ...selectedDemo, demo_status: startedStatus.id },
        })
      ).unwrap();

      navigate("/customer/feedback", { state: { demoId: selectedDemoId } });
    } catch (err) {
      console.error("Failed to start demo:", err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col select-none overflow-hidden h-screen w-screen">
      <style>{`
        html, body { margin: 0; padding: 0; background: #000; overflow: hidden; height: 100vh; width: 100vw; }
        @keyframes emoti-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      <div className="flex-1 min-h-0 flex items-center justify-center p-1.5 sm:p-2 md:p-2.5 lg:p-3 overflow-hidden">
        <div className="w-full h-full flex items-stretch justify-center">
          {/* Main Card Container with Dynamic Mobile/Desktop Background */}
          <div
            className="relative w-full h-full rounded-2xl shadow-2xl px-5 pt-4 pb-8 sm:px-8 sm:pt-6 sm:pb-10 md:px-10 md:pt-8 md:pb-12 lg:px-14 lg:pt-10 lg:pb-14 flex flex-col overflow-hidden"
            style={{
              backgroundImage: `url(${isMobile ? mobileLeaf : leaf})`,
              backgroundSize: "100% 100%", // Ensures template borders fit cleanly
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Logo */}
            <div className="absolute top-20 sm:top-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
              <img
                src={logo}
                alt="Emoti Cup Logo"
                className="w-36 h-24 sm:w-44 sm:h-28 md:w-52 md:h-32 lg:w-60 lg:h-36 object-contain"
              />
            </div>

            {/* Profile / Logout */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40">
              <ProfileMenu />
            </div>

            {/* Demo Selection Area */}
            <div className="relative z-10 flex-1 flex flex-col justify-center pt-8 sm:pt-12 md:pt-16">
              <div
                style={{ animation: "emoti-pop .35s ease" }}
                className="flex flex-col items-center w-full max-w-xs sm:max-w-sm mx-auto px-2"
              >
                <p className="text-center text-xs uppercase tracking-widest text-black font-bold mb-3">
                  Select Demo Details
                </p>

                {/* Compact Dropdown Select */}
                <select
                  value={selectedDemoId}
                  onChange={handleDemoChange}
                  className="w-full max-w-[260px] sm:max-w-[300px] border-2 border-amber-400 rounded-lg py-1.5 px-3 text-xs sm:text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3 shadow-sm font-medium"
                >
                  <option value="">-- Choose Demo Name --</option>
                  {demoforms &&
                    demoforms.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.demo_name || `Demo #${d.id}`}
                      </option>
                    ))}
                </select>

                {/* Compact Fetched Details Box */}
                {selectedDemo && (
                  <div className="w-full max-w-[260px] sm:max-w-[300px] bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-black space-y-1 mb-3 shadow-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Date:</span>
                      <span className="font-medium text-black">{selectedDemo.demo_date || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Customer:</span>
                      <span className="font-medium text-black truncate max-w-[120px] text-right">
                        {selectedDemo.contact_person_name1 || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Start Time:</span>
                      <span className="font-medium text-black">{selectedDemo.demo_start || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">End Time:</span>
                      <span className="font-medium text-black">{selectedDemo.demo_end || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-600">Location:</span>
                      <span className="font-medium text-black truncate max-w-[120px] text-right">
                        {selectedDemo.address_line1 || "N/A"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Compact Drive Button */}
                <button
                  disabled={!selectedDemoId || starting}
                  onClick={handleDrive}
                  className={`w-full max-w-[160px] py-1.5 rounded-lg font-bold text-xs sm:text-sm transition shadow-sm ${
                    selectedDemoId && !starting
                      ? "bg-amber-400 hover:bg-amber-500 text-black active:scale-95"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {starting ? "Starting..." : "Drive"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userName = user?.username || Cookies.get("username") || "User";
  const initial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-white/90 hover:bg-white rounded-full pl-1 pr-3 py-1 shadow-sm border border-gray-200 transition"
      >
        <span className="w-6 h-6 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center">
          {initial}
        </span>
        <span className="text-[11px] font-semibold text-gray-700 max-w-[80px] truncate">
          {userName}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            <button
              onClick={() => {
                setOpen(false);
                setConfirmingLogout(true);
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
            >
              Log Out
            </button>
          </div>
        </>
      )}

      {/* Compact Logout Confirmation Modal */}
      {confirmingLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[220px] sm:max-w-[240px] p-4 text-center border border-gray-100">
            <p className="text-xs font-bold text-black mb-1">Log out?</p>
            <p className="text-[11px] text-gray-500 mb-3">
              Are you sure you want to exit?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingLogout(false)}
                className="flex-1 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-black transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-1 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-500 text-black transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="shrink-0 w-full bg-[#0b1320] px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-xs text-gray-300">
        <span>Copyright All Rights Reserved © {new Date().getFullYear()} emoticup.com</span>
        <span className="text-gray-500">|</span>
        <a href="#" className="hover:text-white">
          Privacy Policy
        </a>
        <span className="text-gray-500">|</span>
        <a href="#" className="hover:text-white">
          Terms of Use
        </a>
      </div>
    </footer>
  );
}