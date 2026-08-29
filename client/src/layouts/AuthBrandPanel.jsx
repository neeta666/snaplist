import symbolMark from '../assets/snaplist-symbol.png';
import wordmark from '../assets/snaplist-wordmark.png';
import samplePhoto from '../assets/auth-sample-photo.jpeg';

// Every color below is a fixed literal value, not a theme token — this
// panel must render identically regardless of data-theme.
const INK = '#1E1B29';
const NAVY = '#172554';
const INK_MUTED = '#6B647D';
const VIOLET = '#7C3AED';
const PINK = '#EC4899';
const NEUTRAL_BG = '#F1EFE8';
const CARD_BORDER = '#E9E1F7';

const PANEL_BACKGROUND = [
  'radial-gradient(ellipse at 104% -8%, rgba(236,72,153,0.58) 0%, rgba(217,70,239,0.44) 20%, rgba(124,58,237,0.32) 38%, transparent 61%)',
  'radial-gradient(ellipse at -8% 108%, rgba(79,70,229,0.92) 0%, rgba(109,40,217,0.72) 25%, rgba(139,92,246,0.46) 43%, transparent 65%)',
  'radial-gradient(ellipse at 76% 82%, rgba(244,114,182,0.34) 0%, rgba(232,121,249,0.20) 28%, transparent 55%)',
  'linear-gradient(112deg, #F1E9FF 0%, #E9DEFF 42%, #E5D7FC 68%, #E9D9FA 100%)',
].join(', ');

function SparkleIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 2c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" />
    </svg>
  );
}

function CameraIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 8h3l2-2h6l2 2h3v11H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function CheckIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ArrowIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function PencilIcon({ className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
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
      <span className="text-xs font-medium" style={{ color: INK }}>
        {label}
      </span>
    </div>
  );
}

export default function AuthBrandPanel() {
  return (
    <div
      className="relative flex h-[320px] flex-col overflow-hidden px-6 py-6 md:h-full md:px-14 md:py-10"
      style={{ background: PANEL_BACKGROUND }}
    >
      {/* Top-right broad bands/arcs — mostly off-canvas, matching the mockup */}
      <div className="pointer-events-none absolute -top-[21rem] -right-[19rem] hidden h-[45rem] w-[45rem] rounded-full border-[42px] border-violet-500/20 md:block" />
      <div className="pointer-events-none absolute -top-[18rem] -right-[16rem] hidden h-[39rem] w-[39rem] rounded-full border-[38px] border-pink-400/28 md:block" />
      <div className="pointer-events-none absolute -top-[14rem] -right-[12rem] hidden h-[32rem] w-[32rem] rounded-full border border-white/55 md:block" />
      <div className="pointer-events-none absolute -top-[11rem] -right-[9rem] hidden h-[27rem] w-[27rem] rounded-full border border-white/35 md:block" />

      {/* Bottom-left concentric rings over the blue-violet corner */}
      <div className="pointer-events-none absolute -bottom-[17rem] -left-[17rem] hidden h-[39rem] w-[39rem] rounded-full border border-white/58 md:block" />
      <div className="pointer-events-none absolute -bottom-[14rem] -left-[14rem] hidden h-[34rem] w-[34rem] rounded-full border border-white/52 md:block" />
      <div className="pointer-events-none absolute -bottom-[11rem] -left-[11rem] hidden h-[29rem] w-[29rem] rounded-full border border-white/46 md:block" />
      <div className="pointer-events-none absolute -bottom-[8rem] -left-[8rem] hidden h-[24rem] w-[24rem] rounded-full border border-white/40 md:block" />

      {/* Localized dot clusters only — no full-panel dot grid */}
      <div
        className="pointer-events-none absolute left-[50%] top-[17%] hidden h-24 w-24 opacity-65 md:block"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.95) 1.6px, transparent 1.8px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div
        className="pointer-events-none absolute left-[45%] top-[34%] hidden h-16 w-16 opacity-55 md:block"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.7px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div
        className="pointer-events-none absolute left-[2%] bottom-[25%] hidden h-20 w-20 opacity-55 md:block"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.7px)',
          backgroundSize: '18px 18px',
        }}
      />
      <div
        className="pointer-events-none absolute left-[50%] bottom-[4%] hidden h-24 w-24 opacity-60 md:block"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.95) 1.6px, transparent 1.8px)',
          backgroundSize: '18px 18px',
        }}
      />

      <SparkleIcon className="absolute left-[43%] top-[10%] hidden h-6 w-6 text-white/85 md:block" />
      <SparkleIcon className="absolute right-[12%] top-[34%] hidden h-7 w-7 text-white/85 md:block" />
      <SparkleIcon className="absolute left-[37%] bottom-[15%] hidden h-6 w-6 text-white/80 md:block" />


      {/* Compact mobile-only decorative treatment */}
      <div className="pointer-events-none absolute -top-28 -right-24 h-64 w-64 rounded-full border-[22px] border-violet-500/15 md:hidden" />
      <div className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full border-[18px] border-pink-400/20 md:hidden" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full border border-white/55 md:hidden" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full border border-white/45 md:hidden" />
      <div
        className="pointer-events-none absolute right-[12%] top-[18%] h-16 w-16 opacity-55 md:hidden"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.95) 1.5px, transparent 1.7px)',
          backgroundSize: '16px 16px',
        }}
      />
      <SparkleIcon className="absolute right-[9%] top-[42%] h-5 w-5 text-white/80 md:hidden" />
      <SparkleIcon className="absolute left-[9%] bottom-[12%] h-4 w-4 text-white/75 md:hidden" />

      <div className="relative flex items-center gap-2.5 md:gap-3">
        <img src={symbolMark} alt="" className="h-11 w-11 md:h-16 md:w-16" />
        <img src={wordmark} alt="SnapList" className="h-12 translate-y-0.5 md:h-[4.5rem] md:translate-y-1" />
      </div>

      <div className="relative mt-5 md:mt-8">
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          <span className="block" style={{ color: NAVY }}>Snap it.</span>
          <span className="block">
            <span style={{ color: VIOLET }}>List</span>{' '}
            <span style={{ color: PINK }}>it.</span>
          </span>
          <span className="block" style={{ color: NAVY }}>Sell it.</span>
        </h1>
        <p className="mt-3 max-w-[19rem] text-sm leading-relaxed md:mt-4 md:max-w-none md:whitespace-nowrap md:leading-normal" style={{ color: '#4B3F67' }}>
          Turn a product photo into a polished listing in seconds.
        </p>
      </div>

      <div className="relative mt-10 hidden flex-1 md:block">
        <div
          className="pointer-events-none absolute left-60 right-56 top-32 border-t-2 border-dashed"
          style={{ borderColor: 'rgba(255, 255, 255, 0.72)' }}
        />
        <div className="absolute left-0 top-4 w-64 -rotate-6 rounded-2xl bg-white p-3 shadow-lg">
          <div className="absolute -top-3 left-3 z-10">
            <StepBadge number="1" label="Your photo" />
          </div>
          <div
            className="h-44 w-full overflow-hidden rounded-xl"
            style={{ background: NEUTRAL_BG }}
          >
            <img src={samplePhoto} alt="" className="h-full w-full object-contain" />
          </div>
          <span
            className="absolute -bottom-3 -left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow"
            style={{ color: VIOLET }}
          >
            <CameraIcon className="h-4 w-4" />
          </span>
        </div>

        <div className="absolute left-[44%] top-7 flex flex-col items-center">
          <StepBadge number="2" label="AI magic" />
          <div className="relative mt-3 flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-white/60">
            <span
              className="flex h-20 w-20 items-center justify-center rounded-full text-white"
              style={{ background: `linear-gradient(135deg, ${VIOLET}, ${PINK})` }}
            >
              <div className="relative h-10 w-10">
                <SparkleIcon className="absolute left-1 top-1 h-7 w-7" />
                <SparkleIcon className="absolute right-0 top-0 h-4 w-4 opacity-90" />
                <SparkleIcon className="absolute bottom-0 left-0 h-3.5 w-3.5 opacity-80" />
              </div>
            </span>
          </div>
          <ArrowIcon className="mt-2 h-4 w-4" style={{ color: INK_MUTED }} />
        </div>

        <div
          className="absolute right-0 -top-2 w-60 rotate-3 rounded-2xl border-[12px] border-white p-4 shadow-lg"
          style={{ background: NEUTRAL_BG, borderRadius: '1.35rem' }}
        >
          <div className="absolute -top-6 left-3 z-10">
            <StepBadge number="3" label="AI generated listing" />
          </div>
          <PencilIcon className="absolute right-3 top-3 h-3.5 w-3.5" style={{ color: INK_MUTED }} />

          <div className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
            <CheckIcon className="h-2.5 w-2.5" />
            Suggested listing
          </div>

          <p className="mt-2 text-sm font-semibold leading-snug" style={{ color: INK }}>
            Sony Alpha a7 III mirrorless camera
          </p>
          <p className="mt-1 text-xs leading-snug" style={{ color: INK_MUTED }}>
            Full-frame mirrorless camera with 28–70mm lens
          </p>

          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span style={{ color: INK_MUTED }}>Category</span>
            <span className="rounded-full bg-white px-2 py-0.5 font-medium" style={{ color: VIOLET }}>
              Photography
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span style={{ color: INK_MUTED }}>Condition</span>
            <span className="rounded-full bg-white px-2 py-0.5 font-medium" style={{ color: VIOLET }}>
              Like new
            </span>
          </div>

          <div className="mt-2.5 text-xs" style={{ color: INK_MUTED }}>
            Price range
          </div>
          <p className="text-sm font-semibold text-green-600">₹1,35,000 – ₹1,50,000</p>
        </div>
      </div>
    </div>
  );
}