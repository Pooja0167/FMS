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
import mobileLeaf from "../../assets/mobile.png"; // Dynamic mobile template import
import queenbee from "../../assets/queenbee.png";
import coffeeMachineVideo from "../../assets/coffeeMachineVideo.mp4";
import { FiX, FiArrowLeft, FiArrowRight } from "react-icons/fi";

// Desktop PNG Images
import q1 from "../../assets/q1.png";
import q2 from "../../assets/q2.png";
import q3 from "../../assets/q3.png";
import q4 from "../../assets/q4.png";
import q5 from "../../assets/q5.png";

// Mobile PNG Images
import m1 from "../../assets/m1.png";
import m2 from "../../assets/m2.png";
import m3 from "../../assets/m3.png";

// Starting slideshow arrays
const DESKTOP_SLIDESHOW_IMAGES = [q4, q2, q3, q1, q5];
const MOBILE_SLIDESHOW_IMAGES = [m1, m2, m3];

const IMAGE_DURATION_MS = 2500; // Time per slide

// Array of CSS animation classes to cycle through
const ANIMATION_CLASSES = [
  "animate-slide-left",
  "animate-slide-right",
  "animate-zoom-in",
];

const IDLE_TO_AMBIENT_MS = 30000;
const THANKYOU_AUTO_RESET_MS = 30000;
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

// Balanced beverage/mood icon sizes
const BIG_ICON = "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36";
const SMALL_ICON = "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28";

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

  // Responsive state for mobile screen check
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  // Dynamic slides depending on screen size
  const slideshowImages = isMobile
    ? MOBILE_SLIDESHOW_IMAGES
    : DESKTOP_SLIDESHOW_IMAGES;

  // State for tracking media in ambient mode
  const [mediaIndex, setMediaIndex] = useState(0);

  const idleTimerRef = useRef(null);
  const resetTimerRef = useRef(null);

  const { demoforms } = useSelector((state) => state.review || {});
  const { demostatus } = useSelector((state) => state.demoForms || {});

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closingDemo, setClosingDemo] = useState(false);
  const [closeError, setCloseError] = useState("");

  // Handle screen resize to switch images responsiveness automatically
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchDemoForm());
    dispatch(fetchDemoStatus());
  }, [dispatch]);

  const selectedDemo = useMemo(
    () => demoforms?.find((d) => String(d.id) === String(demoId)) || null,
    [demoforms, demoId]
  );

  const handleCloseDemo = async () => {
    // If demoId is missing (frequently the case on mobile web reloads/direct links)
    if (!demoId) {
      setShowCloseConfirm(false);
      navigate("/customer/feedback/form");
      return;
    }

    const closedStatus = demostatus?.find((s) => s.code === DEMO_CLOSED_CODE);
    if (!closedStatus) {
      console.error(`Status with code "${DEMO_CLOSED_CODE}" not found in demostatus list.`);
      // If status isn't loaded yet, navigate away anyway so user isn't stuck
      setShowCloseConfirm(false);
      navigate("/customer/feedback/form");
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
    } catch (err) {
      console.error("Failed to close demo:", err);
    } finally {
      setClosingDemo(false);
      setShowCloseConfirm(false);
      // Guarantee redirect to first page regardless of API success/failure on mobile
      navigate("/customer/feedback/form");
    }
  };

  useEffect(() => {
    clearTimeout(idleTimerRef.current);
    if (stage === "idle") {
      idleTimerRef.current = setTimeout(() => {
        setMediaIndex(0);
        setStage("ambient");
      }, IDLE_TO_AMBIENT_MS);
    }
    return () => clearTimeout(idleTimerRef.current);
  }, [stage]);

  // Handle slideshow timer for ambient mode
  useEffect(() => {
    if (stage !== "ambient") return;

    if (mediaIndex < slideshowImages.length) {
      const timer = setTimeout(() => {
        setMediaIndex((prevIndex) => prevIndex + 1);
      }, IMAGE_DURATION_MS);

      return () => clearTimeout(timer);
    }
  }, [stage, mediaIndex, slideshowImages.length]);

  useEffect(() => () => clearTimeout(resetTimerRef.current), []);

  const wake = () => {
    if (stage === "ambient") {
      setStage("idle");
      setMediaIndex(0);
    }
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
    setMediaIndex(0);
  };

  const sharedStyles = (
    <style>{`
      html, body { margin: 0; padding: 0; background: #000; overflow: hidden; height: 100vh; width: 100vw; }
      
      @keyframes emoti-fade {
        0%   { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      /* Custom Slideshow Keyframes */
      @keyframes slideLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      @keyframes slideRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      @keyframes zoomIn {
        from { transform: scale(0.85); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      .animate-slide-left {
        animation: slideLeft 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      }

      .animate-slide-right {
        animation: slideRight 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      }

      .animate-zoom-in {
        animation: zoomIn 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      }
    `}</style>
  );

  // ---------------- Ambient stage (Full screen slideshow + Video loop) ----------------
  if (stage === "ambient") {
    const isShowingImage = mediaIndex < slideshowImages.length;
    const currentAnimation = ANIMATION_CLASSES[mediaIndex % ANIMATION_CLASSES.length];

    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col justify-between select-none overflow-hidden h-screen w-screen"
        onClick={wake}
        onMouseMove={wake}
      >
        {sharedStyles}

        {/* Absolute Media Area - Edge-to-Edge Fullscreen Responsive Coverage */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black flex items-center justify-center">
          {isShowingImage ? (
            <img
              key={`${isMobile ? "mob" : "desk"}-${mediaIndex}`}
              src={slideshowImages[mediaIndex]}
              alt={`Slide ${mediaIndex + 1}`}
              className={`w-full h-full object-cover object-center ${currentAnimation}`}
            />
          ) : (
            <video
              autoPlay
              muted
              playsInline
              onEnded={() => setMediaIndex(0)}
              className="w-full h-full object-cover object-center"
            >
              <source src={coffeeMachineVideo} type="video/mp4" />
            </video>
          )}

          {/* Subtle Dark Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>

        {/* Floating Call to Action */}
        <div className="absolute inset-x-0 bottom-12 pb-8 pt-12 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-20 text-center px-4 pointer-events-none">
          <h2 className="text-white text-sm sm:text-lg lg:text-xl font-bold tracking-wide animate-pulse">
            Touch Anywhere
          </h2>
          <p className="text-amber-400 text-[10px] sm:text-xs mt-0.5 font-medium">
            Share your feedback
          </p>
        </div>

        {/* Footer overlaid on top of ambient media */}
        <div className="relative z-20 mt-auto">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col select-none overflow-hidden h-screen w-screen">
      {sharedStyles}

      <div className="flex-1 min-h-0 flex items-center justify-center p-1.5 sm:p-3 md:p-4 overflow-hidden">
        <div className="w-full h-full flex items-stretch justify-center overflow-hidden">
          <div
            className="relative w-full h-full rounded-2xl shadow-2xl px-4 pt-36 xs:pt-40 sm:pt-48 md:pt-56 pb-4 flex flex-col overflow-hidden"
            style={{
              backgroundImage: `url(${isMobile ? mobileLeaf : leaf})`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Logo Header */}
            <div className="absolute top-30 sm:top-30 md:top-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
              <img
                src={logo}
                alt="Emoti Cup Logo"
                className="w-36 h-36 xs:w-44 xs:h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 lg:w-64 lg:h-64 object-contain drop-shadow-md"
              />
            </div>

            {/* Close Demo Button */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40">
              <button
                onClick={() => {
                  setCloseError("");
                  setShowCloseConfirm(true);
                }}
                className="flex items-center gap-1 bg-white/85 hover:bg-white text-gray-600 hover:text-red-600 text-[10px] sm:text-xs font-semibold p-1.5 sm:px-2.5 sm:py-1.5 rounded-full shadow-md border border-gray-200 transition"
                title="Close this Feedback"
              >
                <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Main Interactive Stage Area */}
            <div
              key={stage}
              style={{ animation: "emoti-fade .3s ease" }}
              className="relative z-10 flex-1 flex flex-col justify-center items-center w-full max-w-xl mx-auto my-auto overflow-hidden"
            >
              {/* ---------------- STAGE: idle — mood picker ---------------- */}
              {stage === "idle" && (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <p className="text-center text-xs sm:text-sm md:text-base uppercase tracking-widest text-gray-800 font-bold mb-3 sm:mb-4">
                    How was your Emoticup?
                  </p>

                  <div className="flex justify-center items-center gap-6 sm:gap-10 mb-4 sm:mb-6 w-full">
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
                    className={`flex items-center justify-center gap-2 w-36 sm:w-44 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition shadow-md ${
                      mood
                        ? "bg-amber-400 hover:bg-amber-500 text-black active:scale-95"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <span>Next</span>
                    <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ---------------- STAGE: choose — tea / coffee ---------------- */}
              {stage === "choose" && (
                <div className="flex flex-col items-center justify-center w-full px-2 h-full gap-2 sm:gap-4">
                  <p className="text-center text-xs sm:text-sm md:text-base uppercase tracking-widest text-gray-800 font-bold">
                    What Have You Had
                  </p>

                  {/* Drink Options */}
                  <div className="flex justify-center items-center gap-6 sm:gap-10 w-full">
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

                  {/* Comment Dialog */}
                  {selectedDrink && (
                    <div className="w-full max-w-[200px] sm:max-w-md">
                      <p className="text-left text-[9px] sm:text-xs uppercase tracking-widest text-gray-700 font-bold mb-0.5 sm:mb-1">
                        Comments
                      </p>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        placeholder={
                          mood === "happy" ? "Anything you loved? (optional)" : "What went wrong?"
                        }
                        className="w-full border border-gray-300 rounded sm:rounded-lg p-1 sm:p-2 text-[9px] sm:text-xs text-black placeholder-gray-400 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-amber-400 bg-white/90 shadow-inner resize-none"
                      />
                    </div>
                  )}

                  {/* Bottom Navigation Buttons */}
                  <div className="w-full max-w-[200px] sm:max-w-md flex justify-between items-center gap-1.5 sm:gap-3 mt-1 sm:mt-2">
                    <button
                      onClick={() => setStage("idle")}
                      className="flex items-center justify-center gap-0.5 flex-1 py-0.5 sm:py-2.5 rounded sm:rounded-lg text-[9px] sm:text-xs font-semibold text-gray-700 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition active:scale-95 h-6 sm:h-auto"
                    >
                      <FiArrowLeft className="w-1.5 h-1.5 sm:w-3.5 sm:h-3.5" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() => setStage("userinfo")}
                      disabled={!selectedDrink}
                      className={`flex items-center justify-center gap-0.5 flex-1 py-0.5 sm:py-2.5 rounded sm:rounded-lg text-[9px] sm:text-xs font-bold transition shadow-md active:scale-95 h-6 sm:h-auto ${
                        selectedDrink
                          ? "bg-amber-400 hover:bg-amber-500 text-black"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <span>Next</span>
                      <FiArrowRight className="w-1.5 h-1.5 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------- STAGE: userinfo ---------------- */}
              {stage === "userinfo" && (
                <div className="flex flex-col items-center justify-center w-full px-2 h-full -mt-32 sm:mt-0">
                  <p className="text-center text-[10px] sm:text-sm md:text-base uppercase tracking-widest text-gray-800 font-bold mb-1.5 sm:mb-4">
                    Happy to Know You
                  </p>

                  <div className="w-full max-w-[200px] sm:max-w-md flex flex-col gap-1 sm:gap-3">
                    <div className="flex flex-col">
                      <label className="mb-0.5 sm:mb-1 text-[9px] sm:text-xs font-semibold text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full border border-gray-300 rounded sm:rounded-lg py-0 px-1.5 sm:p-2 text-[9px] sm:text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-amber-400 bg-white/90 shadow-inner h-6 sm:h-auto"
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="mb-0.5 sm:mb-1 text-[9px] sm:text-xs font-semibold text-gray-700">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={empId}
                        onChange={(e) => setEmpId(e.target.value)}
                        placeholder="Enter Employee ID"
                        className="w-full border border-gray-300 rounded sm:rounded-lg py-0 px-1.5 sm:p-2 text-[9px] sm:text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 sm:focus:ring-2 focus:ring-amber-400 bg-white/90 shadow-inner h-6 sm:h-auto"
                      />
                    </div>
                  </div>

                  <div className="w-full max-w-[200px] sm:max-w-md flex justify-between items-center gap-1.5 sm:gap-3 mt-2 sm:mt-5">
                    <button
                      onClick={() => setStage("choose")}
                      className="flex items-center justify-center gap-0.5 flex-1 py-0.5 sm:py-2.5 rounded sm:rounded-lg text-[9px] sm:text-xs font-semibold text-gray-700 border border-gray-300 bg-gray-50 hover:bg-gray-100 transition active:scale-95 h-6 sm:h-auto"
                    >
                      <FiArrowLeft className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={finish}
                      disabled={submitting}
                      className={`flex items-center justify-center gap-0.5 flex-1 py-0.5 sm:py-2.5 rounded sm:rounded-lg text-[9px] sm:text-xs font-bold transition shadow-md active:scale-95 h-6 sm:h-auto ${
                        submitting
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-amber-400 hover:bg-amber-500 text-black"
                      }`}
                    >
                      <span>{submitting ? "Submitting..." : "Skip & Submit"}</span>
                      <FiArrowRight className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5" />
                    </button>
                  </div>

                  <p className="mt-1.5 sm:mt-3 text-center text-[8px] sm:text-[10px] text-red-500 max-w-[200px] sm:max-w-xs">
                    We do not collect your personal data — your privacy is fully secured.
                  </p>
                </div>
              )}

              {/* ---------------- STAGE: thank you ---------------- */}
              {stage === "thankyou" && (
                <div className="flex flex-col items-center justify-center text-center px-4 py-2 h-full -mt-36 sm:mt-0">
                  <div className="mb-1.5 sm:mb-2 flex justify-center">
                    <img
                      src={queenbee}
                      alt="Queen Bee"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                    />
                  </div>
                  <h3 className="text-sm sm:text-2xl font-extrabold text-gray-800">
                    Thank you!
                  </h3>
                  <p className="text-[10px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1 max-w-[200px] sm:max-w-md">
                    {thankYouMsg}
                  </p>
                  <button
                    onClick={resetAll}
                    className="mt-2.5 sm:mt-4 text-[10px] sm:text-sm uppercase tracking-widest font-bold text-amber-600 hover:text-amber-700 active:scale-95"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close Demo Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-[200px] sm:max-w-xs p-3 sm:p-5 text-center">
            <p className="text-[11px] sm:text-base font-semibold text-gray-800 mb-0.5 sm:mb-1">
              Close this feedback?
            </p>
            <p className="text-[9px] sm:text-xs text-gray-500 mb-2.5 sm:mb-4 leading-tight">
              Are you sure you want to close the demo feedbacks? No further reviews can be submitted for this demo after this.
            </p>

            {closeError && (
              <p className="text-[9px] sm:text-xs text-amber-500 mb-2 sm:mb-3">
                {closeError}
              </p>
            )}

            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowCloseConfirm(false)}
                disabled={closingDemo}
                className="flex-1 py-1 sm:py-2 h-6 sm:h-auto rounded sm:rounded-lg text-[9px] sm:text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseDemo}
                disabled={closingDemo}
                className="flex-1 py-1 sm:py-2 h-6 sm:h-auto rounded sm:rounded-lg text-[9px] sm:text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50"
              >
                {closingDemo ? "Closing..." : "Close FeedBack"}
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
    <footer className="shrink-0 w-full px-3 sm:px-6 py-1.5 sm:py-2 text-center">
      <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-xs text-gray-300">
        <span>Copyright All Rights Reserved © {new Date().getFullYear()} emoticup.com</span>
        <span className="text-gray-500 hidden sm:inline">|</span>
        <a href="#" className="hover:text-white transition">Privacy Policy</a>
        <span className="text-gray-500">|</span>
        <a href="#" className="hover:text-white transition">Terms of Use</a>
        <span className="text-gray-500">|</span>
        <a href="#" className="hover:text-white transition">Refund Policy</a>
      </div>
    </footer>
  );
}

function MoodButton({ label, image, tone, onClick, imageSize = "w-32 h-32" }) {
  const textColor = tone === "amber" ? "#b45309" : "#6b7280";
  const upper = label.toUpperCase();
  const pathId = `curved-text-${label.toLowerCase()}`;

  return (
    <button onClick={onClick} className="flex flex-col items-center focus:outline-none group">
      <div className={`relative ${imageSize} transition-transform duration-300 group-active:scale-95 flex items-center justify-center`}>
        {/* Curved Header Text fitted directly onto the top edge */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        >
          <defs>
            <path id={pathId} d="M 30,115 A 70,70 0 0,1 170,115" fill="none" />
          </defs>
          <text fill={textColor} fontSize="16" fontWeight="800" letterSpacing="1.5">
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              {upper}
            </textPath>
          </text>
        </svg>

        {/* Emoji / Beverage Image */}
        <div className="w-full h-full flex items-center justify-center p-0">
          <img src={image} alt={label} className="w-full h-full object-contain" />
        </div>
      </div>
    </button>
  );
}