import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "./../../store/slices/login/authSlice"
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import { fetchDemoForm } from "../../store/slices/login/reviewSlice";
import { fetchDemoStatus, updateDemoForm } from "../../store/slices/login/demoFormSlice";

import logo from "../../assets/logo.png";
import leaf from "../../assets/leaf.png";


const DEMO_STARTED_CODE = "DEMO_STARTED";

export default function CreateReviewform() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { demoforms } = useSelector((state) => state.review || {});
  // NOTE: "demoForms" is the slice `name` in demoFormSlice.js — update this key if your
  // store mounts it under a different name (e.g. combineReducers({ demoForms: ... })).
  const { demostatus } = useSelector((state) => state.demoForms || {});

  const [selectedDemoId, setSelectedDemoId] = useState("");
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [starting, setStarting] = useState(false);

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
      // NOTE: this endpoint is a PUT, which usually expects the full resource
      // rather than a partial patch — spreading selectedDemo keeps its other
      // fields intact and only overrides demo_status. If your backend supports
      // PATCH instead, you can drop the spread and send just { demo_status }.
      await dispatch(
        updateDemoForm({
          id: selectedDemoId,
          formData: { ...selectedDemo, demo_status: startedStatus.id },
        }),
      ).unwrap();

    navigate("/customer/feedback", { state: { demoId: selectedDemoId } });
    } catch (err) {
      console.error("Failed to start demo:", err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col select-none overflow-hidden">
      <style>{`
        html, body { margin: 0; padding: 0; background: #000; overflow: hidden; }
        @keyframes emoti-pop {
          0%   { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      <div className="flex-1 min-h-0 flex items-center justify-center pt-1.5 pl-1.5 pr-1.5 sm:pt-2 sm:pl-2 sm:pr-2 md:pt-2.5 md:pl-2.5 md:pr-2.5 lg:pt-3 lg:pl-3 lg:pr-3 pb-0 overflow-hidden">
        <div className="w-full h-full flex items-stretch justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
          <div className="flex-1 h-full flex items-stretch justify-center">
            {/* Main Card Container */}
            <div
              className="relative w-full h-full rounded-2xl shadow-2xl px-5 pt-4 pb-8 sm:px-8 sm:pt-6 sm:pb-10 md:px-10 md:pt-8 md:pb-12 lg:px-14 lg:pt-10 lg:pb-14 flex flex-col overflow-hidden"
              style={{
                backgroundImage: `url(${leaf})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {/* Logo */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                <img
                  src={logo}
                  alt="Emoti Cup Logo"
                  className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain"
                />
              </div>

              {/* Profile / Logout */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40">
                <ProfileMenu />
              </div>

              {/* Demo Selection */}
              <div className="relative z-10 flex-1 flex flex-col justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-24">
                <div
                  style={{ animation: "emoti-pop .35s ease" }}
                  className="flex flex-col items-center w-full max-w-lg mx-auto"
                >
                  <p className="text-center text-xs sm:text-sm lg:text-base uppercase tracking-widest text-gray-700 font-bold mb-4">
                    Select Demo Details
                  </p>

                  <select
                    value={selectedDemoId}
                    onChange={handleDemoChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 mb-4"
                  >
                    <option value="">-- Choose Demo Name --</option>
                    {demoforms &&
                      demoforms.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.demo_name || `Demo #${d.id}`}
                        </option>
                      ))}
                  </select>

                  {/* Fetched Details Display */}
                  {selectedDemo && (
                    <div className="w-full bg-white/80 backdrop-blur-sm border border-amber-200 rounded-xl p-4 text-xs sm:text-sm text-gray-700 space-y-2 mb-4 shadow-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold text-amber-800">Date:</span>
                        <span>{selectedDemo.demo_date || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-amber-800">Customer:</span>
                        <span>{selectedDemo.contact_person_name1 || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-amber-800">Start Time:</span>
                        <span>{selectedDemo.demo_start || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-amber-800">End Time:</span>
                        <span>{selectedDemo.demo_end || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-amber-800">Location:</span>
                        <span className="text-right">{selectedDemo.address_line1 || "N/A"}</span>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!selectedDemoId || starting}
                    onClick={handleDrive}
                    className={`w-full py-2.5 rounded-lg font-bold text-sm lg:text-base transition shadow-sm ${
                      selectedDemoId && !starting
                        ? "bg-amber-400 hover:bg-amber-500 text-black"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {starting ? "Starting..." : "Drive"}
                  </button>
                </div>
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
        className="flex items-center gap-1.5 bg-white/85 hover:bg-white rounded-full pl-1 pr-2.5 py-1 shadow-sm border border-gray-200 transition"
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
          {/* Click-away overlay */}
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

      {confirmingLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xs p-5 text-center">
            <p className="text-sm font-semibold text-gray-800 mb-1">Log out?</p>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to exit this page?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingLogout(false)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition"
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
    <footer className="shrink-0 w-full bg-[#1f2937] px-4 py-2.5">
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