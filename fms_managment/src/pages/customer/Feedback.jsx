import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createReview, fetchDemoForm } from "../../store/slices/login/reviewSlice";
// NOTE: same slice CreateReviewform.jsx uses to start a demo — adjust the path
// if demoFormSlice lives somewhere else in your project.
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
const THANKYOU_AUTO_RESET_MS = 2000; // 30 sec, then back to start
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

const BIG_ICON = "w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52";
const SMALL_ICON = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32";

export default function Feedback() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // NOTE: the demo being reviewed is passed in via navigation state from the
  // demo-selection screen, e.g. navigate("/customer/feedback", { state: { demoId: selectedDemoId } }).
  const demoId = location.state?.demoId ?? null;

  const [stage, setStage] = useState("idle"); // idle | ambient | choose | userinfo | thankyou
  const [mood, setMood] = useState(null); // "happy" | "unhappy" | null
  const [selectedDrink, setSelectedDrink] = useState(null); // "tea" | "coffee" | null
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [thankYouMsg, setThankYouMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const idleTimerRef = useRef(null);
  const resetTimerRef = useRef(null);

  // ---------------- Close-demo (kiosk end-of-shift) state ----------------
  const { demoforms } = useSelector((state) => state.review || {});
  // NOTE: "demoForms" is the slice `name` in demoFormSlice.js — update this key
  // if your store mounts it under a different name.
  const { demostatus } = useSelector((state) => state.demoForms || {});

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closingDemo, setClosingDemo] = useState(false);
  const [closeError, setCloseError] = useState("");

  useEffect(() => {
    dispatch(fetchDemoForm());
    dispatch(fetchDemoStatus());
  }, [dispatch]);

  // Full demo record for the current demoId, needed because the PUT to
  // updateDemoForm expects the whole resource (same approach as CreateReviewform).
  const selectedDemo = useMemo(
    () => demoforms?.find((d) => String(d.id) === String(demoId)) || null,
    [demoforms, demoId],
  );

  const handleCloseDemo = async () => {
    if (!demoId) {
      setShowCloseConfirm(false);
      return;
    }

    const closedStatus = demostatus?.find((s) => s.code === DEMO_CLOSED_CODE);
    if (!closedStatus) {
      console.error(`Status with code "${DEMO_CLOSED_CODE}" not found in demostatus list.`);
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
        }),
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

  // Tapping the same mood/drink again deselects it; tapping the other one switches.
  const toggleMood = (m) => setMood((prev) => (prev === m ? null : m));
  const toggleDrink = (d) => setSelectedDrink((prev) => (prev === d ? null : d));

  // Final step -> submit the review to the API, show thank you,
  // then start the auto-reset timer back to the idle mood picker.
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
      // Kiosk still shows the thank-you screen even if the network call fails,
      // so a guest is never stuck — but log it so it can be diagnosed.
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
      html, body { margin: 0; padding: 0; background: #000; overflow: hidden; }
      @keyframes emoti-fade {
        0%   { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );

  // ---------------- Ambient stage: video fills the same kiosk template, logo moved to a corner ----------------
  if (stage === "ambient") {
    return (
      <div className="fixed inset-0 bg-black flex flex-col select-none overflow-hidden" onClick={wake} onMouseMove={wake}>
        {sharedStyles}
        <div className="flex-1 min-h-0 flex items-center justify-center pt-1 pl-1.5 pr-1.5 sm:pt-1.5 sm:pl-2 sm:pr-2 md:pt-2 md:pl-2.5 md:pr-2.5 lg:pt-2 lg:pl-3 lg:pr-3 pb-0 overflow-hidden">
          <div className="w-full h-full flex items-stretch justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
            <div className="flex-1 h-full flex items-stretch justify-center">
              <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-white">
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src={coffeeMachineVideo} type="video/mp4" />
                </video>

                {/* Subtle top-to-bottom darkening so the logo and text stay legible over any footage */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60" />

                {/* Logo — larger, sitting directly on the video with no backdrop */}
                {/* <div className="absolute top-0 left-5 sm:top-1 sm:left-7 z-20">
                  <img
                    src={logo}
                    alt="Emoti Cup Logo"
                    className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-10 lg:w-52 lg:h-52 object-contain drop-shadow-lg"
                  />
                </div> */}

                <div className="absolute inset-x-0 bottom-0 pb-10 sm:pb-14 pt-16 bg-gradient-to-t from-black/70 via-black/25 to-transparent z-20 text-center">
                  <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide animate-pulse">
                    Touch Anywhere
                  </h2>
                  <p className="text-amber-400 text-sm sm:text-base mt-2">Share your feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col select-none overflow-hidden">
      {sharedStyles}

      <div className="flex-1 min-h-0 flex items-center justify-center pt-1 pl-1.5 pr-1.5 sm:pt-1.5 sm:pl-2 sm:pr-2 md:pt-2 md:pl-2.5 md:pr-2.5 lg:pt-2 lg:pl-3 lg:pr-3 pb-0 overflow-hidden">
        <div className="w-full h-full flex items-stretch justify-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
          <div className="flex-1 h-full flex items-stretch justify-center">
            <div
              className="relative w-full h-full rounded-2xl shadow-2xl px-5 pt-3 pb-8 sm:px-8 sm:pt-4 sm:pb-10 md:px-10 md:pt-5 md:pb-12 lg:px-14 lg:pt-6 lg:pb-14 flex flex-col overflow-hidden"
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
                  className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain"
                />
              </div>

              {/* Close Demo — small button, top-right corner */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40">
                <button
                  onClick={() => {
                    setCloseError("");
                    setShowCloseConfirm(true);
                  }}
                  className="flex items-center gap-1 bg-white/85 hover:bg-white text-gray-600 hover:text-red-600 text-[10px] sm:text-[11px] font-semibold px-2.5 py-1.5 rounded-full shadow-sm border border-gray-200 transition"
                  title="Close this Feedback"
                >
                  <FiX size={13} />
                  
                </button>
              </div>

              {/* key={stage} forces a remount on every stage change so the fade replays */}
              <div
                key={stage}
                style={{ animation: "emoti-fade .3s ease" }}
                className="relative z-10 flex-1 flex flex-col justify-center pt-8 sm:pt-10 md:pt-12 lg:pt-16"
              >
                {/* ---------------- STAGE: idle — mood picker ---------------- */}
                {stage === "idle" && (
                  <div className="flex flex-col items-center">
                    <p className="text-center text-[20px] sm:text-xs lg:text-sm uppercase tracking-widest text-gray-700 font-bold mb-4 sm:mb-6 lg:mb-10">
                      How was your Emoticup?
                    </p>

                    <div className="flex justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-16 mb-6 sm:mb-8">
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
                      className={`w-40 py-2.5 rounded-lg font-bold text-sm transition shadow-sm ${
                        mood
                          ? "bg-amber-400 hover:bg-amber-500 text-black"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* ---------------- STAGE: choose — tea / coffee ---------------- */}
                {stage === "choose" && (
                  <div className="flex flex-col items-center w-full">
                    <p className="text-center text-[10px] sm:text-xs lg:text-sm uppercase tracking-widest text-gray-700 font-bold mb-4 sm:mb-6 lg:mb-8">
                      What Have You Had
                    </p>

                    <div className="flex justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-16">
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
                      <div className="w-full max-w-[340px] sm:max-w-sm lg:max-w-md mt-4">
                        <p className="text-left text-[10px] sm:text-xs lg:text-sm uppercase tracking-widest text-gray-700 font-bold mb-1">
                          Comments
                        </p>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={2}
                          placeholder={mood === "happy" ? "Anything you loved? (optional)" : "What went wrong?"}
                          className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm lg:text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none h-[64px]"
                        />
                      </div>
                    )}

                    <div className="w-full max-w-[340px] sm:max-w-sm lg:max-w-md flex justify-between gap-3 mt-5">
                      <button
                        onClick={() => setStage("idle")}
                        className="flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => setStage("userinfo")}
                        disabled={!selectedDrink}
                        className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition shadow-sm ${
                          selectedDrink
                            ? "bg-amber-400 hover:bg-amber-500 text-black"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {/* ---------------- STAGE: userinfo — Name + Employee ID ---------------- */}
                {stage === "userinfo" && (
                  <div className="flex flex-col items-center w-full">
                    <p className="text-center text-[10px] sm:text-xs lg:text-sm uppercase tracking-widest text-gray-700 font-bold mb-3 sm:mb-4 lg:mb-6">
                      Happy to Know that
                    </p>

                    <div className="w-full max-w-[340px] sm:max-w-sm lg:max-w-md flex flex-col gap-4">
                      <div className="flex flex-col">
                        <label className="mb-1.5 text-sm lg:text-base font-semibold text-gray-700">Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm lg:text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1.5 text-sm lg:text-base font-semibold text-gray-700">
                          Employee ID
                        </label>
                        <input
                          type="text"
                          value={empId}
                          onChange={(e) => setEmpId(e.target.value)}
                          placeholder="Enter Employee ID"
                          className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-sm lg:text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    <div className="w-full max-w-[340px] sm:max-w-sm lg:max-w-md flex justify-between gap-3 mt-6">
                      <button
                        onClick={() => setStage("choose")}
                        className="flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-600 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={finish}
                        disabled={submitting}
                        className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition shadow-sm ${
                          submitting
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-amber-400 hover:bg-amber-500 text-black"
                        }`}
                      >
                        {submitting ? "Submitting..." : "Skip & Submit"}
                      </button>
                    </div>

                    <p className="mt-4 text-center text-[10px] sm:text-[11px] lg:text-xs text-red-500 max-w-[300px] sm:max-w-sm">
                      We do not collect your data — your privacy is fully secured.
                    </p>
                  </div>
                )}

                {/* ---------------- STAGE: thank you ---------------- */}
                {stage === "thankyou" && (
                  <div className="flex flex-col items-center text-center py-4 sm:py-6">
                    <div className="mb-3 lg:mb-5 flex justify-center">
                      <img
                        src={queenbee}
                        alt="Queen Bee"
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-3xl font-extrabold">Thank you!</h3>
                    <p className="text-sm lg:text-base text-gray-500 mt-2 max-w-[230px] lg:max-w-[320px]">
                      {thankYouMsg}
                    </p>
                    <button
                      onClick={resetAll}
                      className="mt-5 sm:mt-6 lg:mt-8 text-[10px] sm:text-[11px] lg:text-xs uppercase tracking-widest font-semibold text-amber-500 hover:text-amber-600"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Close-demo confirmation popup ---------------- */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xs p-5 text-center">
            <p className="text-sm font-semibold text-gray-800 mb-1">Close this demo?</p>
            <p className="text-xs text-gray-500 mb-4">
              Are you sure you want to close the demo feedbacks? No further reviews can be
              submitted for this demo after this.
            </p>

            {closeError && (
              <p className="text-xs text-red-500 mb-3">{closeError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowCloseConfirm(false)}
                disabled={closingDemo}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseDemo}
                disabled={closingDemo}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
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
    <footer className="shrink-0 w-full bg-[#1f2937] px-4 sm:px-6 md:px-8 py-2.5 sm:py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-gray-300">
        <span>Copyright All Rights Reserved © {new Date().getFullYear()} emoticup.com</span>
        <span className="text-gray-500 hidden sm:inline">&nbsp;&nbsp;</span>
        <a href="#" className="hover:text-white transition">Privacy Policy</a>
        <span className="text-gray-500">|</span>
        <a href="#" className="hover:text-white transition">Terms of Use</a>
        <span className="text-gray-500">|</span>
        <a href="#" className="hover:text-white transition">Refund Policy</a>
      </div>
    </footer>
  );
}

function MoodButton({ label, image, tone, onClick, imageSize = "w-24 h-24" }) {
  const R = 62;
  const CX = 75, CY = 70;
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

  let fontSize = 11.5;
  let letterSpacing = 2;
  if (len > 4) {
    fontSize = 10;
    letterSpacing = 1.2;
  }
  if (len > 6) {
    fontSize = 8.8;
    letterSpacing = 0.6;
  }
  if (len > 8) {
    fontSize = 7.8;
    letterSpacing = 0.2;
  }

  return (
    <button onClick={onClick} className="flex flex-col items-center focus:outline-none group">
      <div className={`relative ${imageSize} transition-transform duration-300 group-active:scale-95`}>
        <svg viewBox="0 0 150 150" className="w-full h-full">
          <defs>
            <path id={pathId} d={`M ${x1},${y1} A ${R},${R} 0 0 1 ${x2},${y2}`} fill="none" />
          </defs>
          <circle cx={CX} cy={CY} r={R} fill="#ffffff" stroke={ringColor} strokeWidth="2.5" />
          <circle cx={CX} cy={CY} r={R - 8} fill="none" stroke="#e5e7eb" strokeWidth="1" />
          <text fill={textColor} fontSize={fontSize} fontWeight="700" letterSpacing={letterSpacing}>
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {upper}
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={image} alt={label} className="w-full h-full object-cover" />
        </div>
      </div>
    </button>
  );
}