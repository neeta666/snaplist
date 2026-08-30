import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import symbolMark from "../assets/snaplist-symbol.png";
import wordmark from "../assets/snaplist-wordmark.png";
import samplePhoto from "../assets/auth-sample-photo.jpeg";

const INK = "#1E1B29";
const NAVY = "#172554";
const INK_MUTED = "#6B647D";
const VIOLET = "#7C3AED";
const PINK = "#EC4899";
const NEUTRAL_BG = "#F1EFE8";

const PANEL_BACKGROUND = [
  "radial-gradient(ellipse at 104% -8%, rgba(236,72,153,0.58) 0%, rgba(217,70,239,0.44) 20%, rgba(124,58,237,0.32) 38%, transparent 61%)",
  "radial-gradient(ellipse at -8% 108%, rgba(79,70,229,0.92) 0%, rgba(109,40,217,0.72) 25%, rgba(139,92,246,0.46) 43%, transparent 65%)",
  "radial-gradient(ellipse at 76% 82%, rgba(244,114,182,0.34) 0%, rgba(232,121,249,0.20) 28%, transparent 55%)",
  "linear-gradient(112deg, #F1E9FF 0%, #E9DEFF 42%, #E5D7FC 68%, #E9D9FA 100%)",
].join(", ");

function SparkleIcon({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" />
    </svg>
  );
}

function CheckIcon({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PencilIcon({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function StepBadge({ number, label }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm">
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white"
        style={{ background: VIOLET }}
      >
        {number}
      </span>

      <span
        className="whitespace-nowrap text-[10px] font-medium sm:text-xs"
        style={{ color: INK }}
      >
        {label}
      </span>
    </div>
  );
}

export default function AuthWelcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);

  const next = searchParams.get("next") === "register" ? "register" : "login";

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const handleDesktopViewport = (event) => {
      if (event.matches) {
        navigate(next === "register" ? "/register" : "/login", {
          replace: true,
        });
      }
    };

    if (desktopQuery.matches) {
      navigate(next === "register" ? "/register" : "/login", {
        replace: true,
      });
      return;
    }

    desktopQuery.addEventListener("change", handleDesktopViewport);

    return () => {
      desktopQuery.removeEventListener("change", handleDesktopViewport);
    };
  }, [navigate, next]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % 3);
    }, 1600);

    return () => window.clearInterval(interval);
  }, []);

  const handleContinue = () => {
    navigate(next === "register" ? "/register" : "/login");
  };

  const getStepClasses = (step) => {
    if (step === activeStep) {
      return "translate-x-0 opacity-100";
    }

    if (step < activeStep || (activeStep === 0 && step === 2)) {
      return "-translate-x-10 opacity-0";
    }

    return "translate-x-10 opacity-0";
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:hidden"
      style={{ background: PANEL_BACKGROUND }}
    >
      <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border-[24px] border-violet-500/15" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[18px] border-pink-400/20" />

      <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full border border-white/55" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full border border-white/45" />

      <SparkleIcon className="absolute right-[9%] top-[22%] h-5 w-5 text-white/80" />
      <SparkleIcon className="absolute left-[8%] bottom-[22%] h-4 w-4 text-white/75" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col sm:min-h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-2.5">
          <img src={symbolMark} alt="" className="h-11 w-11 sm:h-13 sm:w-13" />

          <img
            src={wordmark}
            alt="SnapList"
            className="h-12 translate-y-0.5 sm:h-14"
          />
        </div>

        <div className="mt-7 sm:mt-10">
          <h1 className="text-[3.5rem] font-bold leading-[0.98] sm:text-[4rem]">
            <span className="block" style={{ color: NAVY }}>
              Snap it.
            </span>

            <span className="block">
              <span style={{ color: VIOLET }}>List</span>{" "}
              <span style={{ color: PINK }}>it.</span>
            </span>

            <span className="block" style={{ color: NAVY }}>
              Sell it.
            </span>
          </h1>

          <p
            className="mt-4 max-w-sm text-sm leading-relaxed sm:text-base"
            style={{ color: "#4B3F67" }}
          >
            Turn a product photo into a polished listing in seconds.
          </p>
        </div>

        <div className="relative mx-auto mt-8 h-[190px] w-full max-w-[360px] sm:mt-10 sm:h-[220px] sm:max-w-[440px]">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${getStepClasses(
              0,
            )}`}
          >
            <div className="relative w-[195px] -rotate-3 rounded-2xl bg-white p-2.5 shadow-lg sm:w-[220px] sm:p-3">
              <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2">
                <StepBadge number="1" label="Your photo" />
              </div>

              <div
                className="aspect-[4/3] overflow-hidden rounded-xl"
                style={{ background: NEUTRAL_BG }}
              >
                <img
                  src={samplePhoto}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${getStepClasses(
              1,
            )}`}
          >
            <div className="relative flex flex-col items-center">
              <div className="mb-3">
                <StepBadge number="2" label="AI magic" />
              </div>

              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-white/70 sm:h-24 sm:w-24">
                <span
                  className="flex h-17 w-17 items-center justify-center rounded-full text-white shadow-md sm:h-16 sm:w-16"
                  style={{
                    background: `linear-gradient(135deg, ${VIOLET}, ${PINK})`,
                  }}
                >
                  <div className="relative h-9 w-9 sm:h-9 sm:w-9">
                    <SparkleIcon className="absolute left-0 top-0 h-7 w-7" />
                    <SparkleIcon className="absolute right-0 top-0 h-4 w-4 opacity-90" />
                  </div>
                </span>
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${getStepClasses(
              2,
            )}`}
          >
            <div
              className="relative w-[230px] rotate-2 rounded-2xl border-[8px] border-white p-3 shadow-lg sm:w-[260px] sm:border-[9px] sm:p-3.5"
              style={{ background: NEUTRAL_BG }}
            >
              <div className="absolute -top-5 left-1/2 z-20 -translate-x-1/2">
                <StepBadge number="3" label="AI generated listing" />
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-medium text-green-700 sm:text-[10px]">
                  <CheckIcon className="h-2.5 w-2.5" />
                  Suggested listing
                </div>

                <PencilIcon
                  className="h-3.5 w-3.5 shrink-0"
                  style={{ color: INK_MUTED }}
                />
              </div>

              <p
                className="mt-2 text-[11px] font-semibold leading-tight sm:text-xs"
                style={{ color: INK }}
              >
                Sony Alpha a7 III mirrorless camera
              </p>

              <p
                className="mt-1 text-[9px] leading-snug sm:text-[10px]"
                style={{ color: INK_MUTED }}
              >
                Full-frame mirrorless camera with 28–70mm lens
              </p>

              <div className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[9px] sm:text-[10px]"
                    style={{ color: INK_MUTED }}
                  >
                    Category
                  </span>

                  <span
                    className="rounded-full bg-white px-2 py-0.5 text-[9px] font-medium sm:text-[10px]"
                    style={{ color: VIOLET }}
                  >
                    Photography
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[9px] sm:text-[10px]"
                    style={{ color: INK_MUTED }}
                  >
                    Condition
                  </span>

                  <span
                    className="rounded-full bg-white px-2 py-0.5 text-[9px] font-medium sm:text-[10px]"
                    style={{ color: VIOLET }}
                  >
                    Like new
                  </span>
                </div>
              </div>

              <div
                className="mt-2 text-[9px] sm:text-[10px]"
                style={{ color: INK_MUTED }}
              >
                Price range
              </div>

              <p className="text-[11px] font-semibold text-green-600 sm:text-xs">
                ₹1,35,000 – ₹1,50,000
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-md transition-transform active:scale-[0.99] sm:mx-auto sm:block sm:max-w-md sm:text-base"
            style={{
              background: "linear-gradient(90deg, #6D28D9 0%, #EC4899 100%)",
              boxShadow: "0 10px 28px rgba(124, 58, 237, 0.28)",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
