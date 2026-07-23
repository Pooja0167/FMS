import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createReview, fetchDemoForm } from "../../store/slices/login/reviewSlice";
import { fetchDemoStatus, updateDemoForm } from "../../store/slices/login/demoFormSlice";

import logo from "../../assets/logo.png";
import coffee from "../../assets/coffee.png";
import happy from "../../assets/happy.png";
import unhappy from "../../assets/unhappy.png";
import tea from "../../assets/kulhad-tea.png";
import leaf from "../../assets/leaf.png";
import queenbee from "../../assets/queenbee.png";
import coffeeMachineVideo from "../../assets/coffeeMachineVideo.mp4";
import { FiX } from "react-icons/fi";

const IDLE_TO_AMBIENT_MS = 200000;
const THANKYOU_AUTO_RESET_MS = 200000;
const DEMO_CLOSED_CODE = "DEMO_CLOSED";

const HAPPY_MESSAGES = [
  "Brewed to perfection. Thanks for the love!",
  "You just made our beans dance.",
  "That's the good stuff — thank you!",
];

const UNHAPPY_MESSAGES = [
  "Noted. We'll steep on it and do better.",
  "Thanks for the honest sip of truth.",
  "Heard, loud and clear. Back to the drawing board.",
];

// Responsive SVG sizes across Mobile, Tablet, and Desktop
const BIG_ICON = "w-28 h-28 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48";
const SMALL_ICON = "w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36";

export default function Feedback() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const demoId = location.state?.demoId ?? null;

  const [stage, setStage] = useState("idle"); // idle | ambient | choose | userinfo | thankyou
  const [mood, setMood] = useState(null);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [thankYouMsg, setThankYouMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const idleTimerRef = useRef(null);
  const resetTimerRef = useRef(null);

  const { demoforms } = useSelector((state) => state.review || {});
  const { demostatus } = useSelector((state) => state.demoForms || {});

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closingDemo, setClosingDemo] = useState(false);
  const [closeError, setCloseError] = useState("");

  useEffect(() => {
    dispatch(fetchDemoForm());
    dispatch(fetchDemoStatus());
  }, [dispatch]);

  const selectedDemo = useMemo(
    () => demoforms?.find((d) => String(d.id) === String(demoId)) || null,
    [demoforms, demoId]
  );

  const handleCloseDemo = async () => {
    if (!demoId) {
      setShowCloseConfirm(false);
      return;
    }

    const closedStatus = demostatus?.find((s) => s.code === DEMO_CLOSED_CODE);
    if (!closedStatus) {
      console.error(`Status with code "${DEMO_CLOSED_CODE}" not found.`);
      setCloseError("Could not close the demo — status not found.");
      return;
    }

    setClosingDemo(true);
    setCloseError("");
    try {
      await dispatch(
        updateDemoForm({
          id: demoId,
          formData: { ...selectedDemo, demo_status: closedStatus.id },
        })
      ).unwrap();
      setShowCloseConfirm(false);
      navigate("/customer/feedback/form");
    } catch (err) {
      console.error("Failed to close demo:", err);
      setCloseError("Something went wrong while closing the demo. Please try again.");
    } finally {
      setClosingDemo(false);
    }
  };

  useEffect(() => {
    clearTimeout(idleTimerRef.current);
    if (stage === "idle") {
      idleTimerRef.current = setTimeout(() => setStage("ambient"), IDLE_TO_AMBIENT_MS);
    }
    return () => clearTimeout(idleTimerRef.current);
  }, [stage]);

  useEffect(() => () => clearTimeout(resetTimerRef.current), []);

  const wake = () => {
    if (stage === "ambient") setStage("idle");
  };

  const toggleMood = (m) => setMood((prev) => (prev === m ? null : m));
  const toggleDrink = (d) => setSelectedDrink((prev) => (prev === d ? null : d));

  const finish = async () => {
    const pool = mood === "happy" ? HAPPY_MESSAGES : UNHAPPY_MESSAGES;
    setThankYouMsg(pool[Math.floor(Math.random() * pool.length)]);

    const payload = {
      demo: demoId,
      mood: mood === "happy" ? "Happy" : "Unhappy",
      beverages: selectedDrink || "",
      comments: comment || "",
      name: name || "",
      employee_code: empId || "",
    };

    setSubmitting(true);
    try {
      await dispatch(createReview(payload)).unwrap();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }

    setStage("thankyou");
    clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(resetAll, THANKYOU_AUTO_RESET_MS);
  };

  const resetAll = () => {
    setStage("idle");
    setMood(null);
    setSelectedDrink(null);
    setComment("");
    setName("");
    setEmpId("");
    setThankYouMsg("");
  };

  const sharedStyles = (
    <style>{`
      html, body { margin: 0; padding: 0; background: #000; width: 100%; height: 100%; }
      @keyframes emoti-fade {
        0%   { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );

  // ---------------- Ambient Stage ----------------
  if (stage === "ambient") {
    return (
      <div
        className="min-h-screen h-screen w-full bg-black flex flex-col justify-between select-none overflow-hidden"
        onClick={wake}
        onMouseMove={wake}
      >
        {sharedStyles}
        <div className="flex-1 w-full p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-hidden">
          <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-white">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src={coffeeMachineVideo} type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

            <div className="absolute inset-x-0 bottom-0 pb-12 sm:pb-16 md:pb-20 pt-16 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-20 text-center px-4">
              <h2 className="text-white text-2xl sm:text-4xl md:text-5xl font-bold tracking-wide animate-pulse">
                Touch Anywhere
              </h2>
              <p className="text-amber-400 text-sm sm:text-lg md:text-xl mt-2 font-medium">
                Share your feedback
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ---------------- Interactive Stages ----------------
  return (
    <div className="min-h-screen h-screen w-full bg-black flex flex-col justify-between select-none overflow-hidden">
      {sharedStyles}

      {/* Main Responsive Outer Container */}
      <div className="flex-1 w-full p-2 sm:p-4 md:p-6 flex items-center justify-center overflow-y-auto">
        <div className="relative w-full max-w-4xl h-full max-h-[92vh] md:max-h-[850px] rounded-2xl shadow-2xl px-4 py-4 sm:px-8 sm:py-6 md:px-12 md:py-8 flex flex-col justify-between overflow-y-auto md:overflow-hidden bg-white">
          
          {/* Side Leaves (Scales down on mobile, full size on desktop) */}
          <img
            src={leaf}
            alt="Left Leaf"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 sm:w-20 md:w-28 lg:w-36 h-auto z-0 pointer-events-none opacity-80"
          />
          <img
            src={leaf}
            alt="Right Leaf"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 sm:w-20 md:w-28 lg:w-36 h-auto z-0 pointer-events-none opacity-80 scale-x-[-1]"
          />

          {/* Header Area */}
          <div className="relative w-full flex items-center justify-center shrink-0 min-h-[50px] sm:min-h-[70px]">
            {/* Logo Wrapper */}
            <div className="relative inline-block z-30">
              <img
                src={leaf}
                alt="Top Leaf"
                className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 w-5 sm:w-7 md:w-9 h-auto z-40 pointer-events-none"
              />
              <img
                src={logo}
                alt="Emoti Cup Logo"
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-contain drop-shadow-md"
              />
            </div>

            {/* Close Demo Button */}
            <div className="absolute right-0 top-0 z-40">
              <button
                onClick={() => {
                  setCloseError("");
                  setShowCloseConfirm(true);
                }}
                className="flex items-center gap-1 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 text-xs font-semibold px-2.5 py-1.5 rounded-full shadow-md border border-gray-200 transition"
                title="Close this Feedback"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Dynamic Stage Body */}
          <div
            key={stage}
            style={{ animation: "emoti-fade .3s ease" }}
            className="relative z-10 flex-1 flex flex-col justify-center items-center my-2 sm:my-4"
          >
            {/* STAGE: IDLE (Mood Picker) */}
            {stage === "idle" && (
              <div className="flex flex-col items-center w-full">
                <p className="text-center text-xs sm:text-base md:text-lg uppercase tracking-wider text-gray-800 font-bold mb-4 sm:mb-6 md:mb-8">
                  How was your Emoticup?
                </p>

                <div className="flex justify-center items-center gap-4 sm:gap-8 md:gap-12 mb-6 sm:mb-8">
                  <div
                    className={`transition-all duration-300 ${
                      mood && mood !== "happy" ? "opacity-40 scale-90" : "opacity-100 scale-100"
                    }`}
                  >
                    <MoodButton
                      label="Happy"
                      image={happy}
                      tone="amber"
                      imageSize={mood && mood !== "happy" ? SMALL_ICON : BIG_ICON}
                      onClick={() => toggleMood("happy")}
                    />
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      mood && mood !== "unhappy" ? "opacity-40 scale-90" : "opacity-100 scale-100"
                    }`}
                  >
                    <MoodButton
                      label="Unhappy"
                      image={unhappy}
                      tone="gray"
                      imageSize={mood && mood !== "unhappy" ? SMALL_ICON : BIG_ICON}
                      onClick={() => toggleMood("unhappy")}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStage("choose")}
                  disabled={!mood}
                  className={`w-32 sm:w-44 py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-base transition shadow-md ${
                    mood
                      ? "bg-amber-400 hover:bg-amber-500 text-black cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            )}

            {/* STAGE: CHOOSE (Beverage) */}
            {stage === "choose" && (
              <div className="flex flex-col items-center w-full max-w-xs sm:max-w-md">
                <p className="text-center text-xs sm:text-base uppercase tracking-wider text-gray-800 font-bold mb-3 sm:mb-6">
                  What Have You Had?
                </p>

                <div className="flex justify-center items-center gap-4 sm:gap-8 mb-4 sm:mb-6">
                  <div
                    className={`transition-all duration-300 ${
                      selectedDrink && selectedDrink !== "tea" ? "opacity-40 scale-90" : "opacity-100 scale-100"
                    }`}
                  >
                    <MoodButton
                      label="Tea"
                      image={tea}
                      tone="amber"
                      imageSize={selectedDrink && selectedDrink !== "tea" ? SMALL_ICON : BIG_ICON}
                      onClick={() => toggleDrink("tea")}
                    />
                  </div>
                  <div
                    className={`transition-all duration-300 ${
                      selectedDrink && selectedDrink !== "coffee" ? "opacity-40 scale-90" : "opacity-100 scale-100"
                    }`}
                  >
                    <MoodButton
                      label="Coffee"
                      image={coffee}
                      tone="gray"
                      imageSize={selectedDrink && selectedDrink !== "coffee" ? SMALL_ICON : BIG_ICON}
                      onClick={() => toggleDrink("coffee")}
                    />
                  </div>
                </div>

                {selectedDrink && (
                  <div className="w-full mt-1 sm:mt-2">
                    <p className="text-left text-[11px] sm:text-xs uppercase tracking-wider text-gray-700 font-bold mb-1">
                      Comments
                    </p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      placeholder={mood === "happy" ? "Anything you loved? (optional)" : "What went wrong?"}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/90 shadow-inner resize-none"
                    />
                  </div>
                )}

                <div className="w-full flex justify-between gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setStage("idle")}
                    className="flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setStage("userinfo")}
                    disabled={!selectedDrink}
                    className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition shadow-sm ${
                      selectedDrink
                        ? "bg-amber-400 hover:bg-amber-500 text-black cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* STAGE: USERINFO */}
            {stage === "userinfo" && (
              <div className="flex flex-col items-center w-full max-w-xs sm:max-w-md">
                <p className="text-center text-xs sm:text-base uppercase tracking-wider text-gray-800 font-bold mb-3 sm:mb-4">
                  Happy to know that
                </p>

                <div className="w-full flex flex-col gap-2 sm:gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] sm:text-xs font-semibold text-gray-700">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/90"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] sm:text-xs font-semibold text-gray-700">Employee ID</label>
                    <input
                      type="text"
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      placeholder="Enter Employee ID"
                      className="w-full border border-gray-300 rounded-lg p-2 sm:p-2.5 text-xs sm:text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white/90"
                    />
                  </div>
                </div>

                <div className="w-full flex justify-between gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setStage("choose")}
                    className="flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={finish}
                    disabled={submitting}
                    className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition shadow-sm ${
                      submitting
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-amber-400 hover:bg-amber-500 text-black cursor-pointer"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Skip & Submit"}
                  </button>
                </div>

                <p className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-red-500">
                  We do not collect your data — your privacy is fully secured.
                </p>
              </div>
            )}

            {/* STAGE: THANK YOU */}
            {stage === "thankyou" && (
              <div className="flex flex-col items-center text-center py-2 sm:py-4">
                <div className="mb-2 sm:mb-3 flex justify-center">
                  <img
                    src={queenbee}
                    alt="Queen Bee"
                    className="w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain"
                  />
                </div>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900">Thank you!</h3>
                <p className="text-xs sm:text-base text-gray-600 mt-2 max-w-xs sm:max-w-sm">
                  {thankYouMsg}
                </p>
                <button
                  onClick={resetAll}
                  className="mt-4 sm:mt-6 text-xs sm:text-sm uppercase tracking-widest font-bold text-amber-500 hover:text-amber-600 transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm p-5 sm:p-6 text-center">
            <p className="text-sm sm:text-base font-bold text-gray-800 mb-2">Close this demo?</p>
            <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to close the demo feedbacks? No further reviews can be
              submitted for this demo after this.
            </p>

            {closeError && (
              <p className="text-xs text-red-500 mb-4">{closeError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseConfirm(false)}
                disabled={closingDemo}
                className="flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseDemo}
                disabled={closingDemo}
                className="flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
              >
                {closingDemo ? "Closing..." : "Close Demo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="shrink-0 w-full bg-[#1f2937] px-4 py-2.5 sm:py-3 text-center sm:text-left">
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 max-w-6xl mx-auto">
        <span>Copyright All Rights Reserved © {new Date().getFullYear()} emoticup.com</span>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href="#" className="hover:text-white transition">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:text-white transition">Terms of Use</a>
          <span>|</span>
          <a href="#" className="hover:text-white transition">Refund Policy</a>
        </div>
      </div>
    </footer>
  );
}

function MoodButton({ label, image, tone, onClick, imageSize = "w-24 h-24" }) {
  // SVG Text Curved Arc Setup
  const R = 58;
  const CX = 75, CY = 75;
  const ringColor = tone === "amber" ? "#f59e0b" : "#9ca3af";
  const textColor = tone === "amber" ? "#b45309" : "#6b7280";

  const upper = label.toUpperCase();
  const len = upper.length;

  const sweep = Math.min(210, 70 + len * 14);
  const start = -90 - sweep / 2;
  const end = -90 + sweep / 2;
  const toRad = (d) => (d * Math.PI) / 180;
  const x1 = CX + R * Math.cos(toRad(start));
  const y1 = CY + R * Math.sin(toRad(start));
  const x2 = CX + R * Math.cos(toRad(end));
  const y2 = CY + R * Math.sin(toRad(end));
  const pathId = `ring-${label.toLowerCase()}`;

  let fontSize = 11;
  let letterSpacing = 1.8;
  if (len > 4) {
    fontSize = 9.5;
    letterSpacing = 1;
  }
  if (len > 6) {
    fontSize = 8.5;
    letterSpacing = 0.5;
  }

  return (
    <button onClick={onClick} className="flex flex-col items-center focus:outline-none group">
      <div className={`relative ${imageSize} transition-transform duration-300 group-active:scale-95`}>
        <svg viewBox="0 0 150 150" className="w-full h-full">
          <defs>
            <path id={pathId} d={`M ${x1},${y1} A ${R},${R} 0 0 1 ${x2},${y2}`} fill="none" />
          </defs>
          <circle cx={CX} cy={CY} r={R} fill="#ffffff" stroke={ringColor} strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r={R - 7} fill="none" stroke="#e5e7eb" strokeWidth="1" />
          <text fill={textColor} fontSize={fontSize} fontWeight="700" letterSpacing={letterSpacing}>
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {upper}
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
          <img src={image} alt={label} className="w-full h-full object-contain" />
        </div>
      </div>
    </button>
  );
}