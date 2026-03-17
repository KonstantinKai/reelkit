interface AnimatedLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedLogo({ className, style }: AnimatedLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      style={style}
      role="img"
      aria-label="ReelKit logo"
    >
      <defs>
        <linearGradient
          id="rk-alogo-grad"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="rk-alogo-shimmer-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <clipPath id="rk-alogo-clip">
          <rect width="40" height="40" rx="10" />
        </clipPath>
      </defs>

      <style>{`
        /*
         * Full looping cycle (6s):
         *   0–8%   trails enter (staggered)
         *   9–21%  chevron draws
         *  21–67%  hold (bob + shimmer)
         *  67–80%  everything exits
         *  80–100% pause
         */

        /* Trail 1 — enters first */
        .rk-alogo-t1 { animation: rk-alogo-t1 6s ease-in-out infinite; }
        @keyframes rk-alogo-t1 {
          0%       { opacity: 0; transform: translateY(-6px); }
          8%       { opacity: 0.25; transform: translateY(0); }
          67%      { opacity: 0.25; transform: translateY(0); }
          75%      { opacity: 0; transform: translateY(6px); }
          100%     { opacity: 0; }
        }

        /* Trail 2 — enters 0.15s later */
        .rk-alogo-t2 { animation: rk-alogo-t2 6s ease-in-out infinite; }
        @keyframes rk-alogo-t2 {
          0%, 3%   { opacity: 0; transform: translateY(-6px); }
          11%      { opacity: 0.4; transform: translateY(0); }
          70%      { opacity: 0.4; transform: translateY(0); }
          78%      { opacity: 0; transform: translateY(6px); }
          100%     { opacity: 0; }
        }

        /* Trail 3 — enters 0.3s later */
        .rk-alogo-t3 { animation: rk-alogo-t3 6s ease-in-out infinite; }
        @keyframes rk-alogo-t3 {
          0%, 5%   { opacity: 0; transform: translateY(-6px); }
          13%      { opacity: 0.55; transform: translateY(0); }
          72%      { opacity: 0.55; transform: translateY(0); }
          80%      { opacity: 0; transform: translateY(6px); }
          100%     { opacity: 0; }
        }

        /* Chevron stroke draw + hold + undraw */
        .rk-alogo-chevron { animation: rk-alogo-chevron 6s ease-in-out infinite; }
        @keyframes rk-alogo-chevron {
          0%, 9%   { stroke-dashoffset: 1; opacity: 0; transform: translateY(0); }
          12%      { opacity: 1; }
          21%      { stroke-dashoffset: 0; opacity: 1; transform: translateY(0); }
          67%      { stroke-dashoffset: 0; opacity: 1; transform: translateY(0); }
          76%      { stroke-dashoffset: 1; opacity: 0; transform: translateY(6px); }
          100%     { stroke-dashoffset: 1; opacity: 0; transform: translateY(6px); }
        }

        /* Chevron bob — runs continuously, invisible when chevron is hidden */
        .rk-alogo-bob { animation: rk-alogo-bob 2.5s ease-in-out infinite; }
        @keyframes rk-alogo-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(1.5px); }
        }

        /* Background shimmer — sweeps during hold phase */
        .rk-alogo-shimmer { animation: rk-alogo-shimmer 6s ease-in-out infinite; }
        @keyframes rk-alogo-shimmer {
          0%, 30%  { transform: translateX(0); }
          50%      { transform: translateX(60px); }
          100%     { transform: translateX(60px); }
        }
      `}</style>

      {/* Background + shimmer (clipped to rounded rect) */}
      <g clipPath="url(#rk-alogo-clip)">
        <rect width="40" height="40" rx="10" fill="url(#rk-alogo-grad)" />
        <rect
          className="rk-alogo-shimmer"
          x="-20"
          y="0"
          width="16"
          height="40"
          fill="url(#rk-alogo-shimmer-fill)"
        />
      </g>

      {/* Motion trails */}
      <rect
        className="rk-alogo-t1"
        x="14"
        y="7"
        width="12"
        height="2"
        rx="1"
        fill="white"
        opacity="0"
      />
      <rect
        className="rk-alogo-t2"
        x="12"
        y="12"
        width="16"
        height="2"
        rx="1"
        fill="white"
        opacity="0"
      />
      <rect
        className="rk-alogo-t3"
        x="10"
        y="17"
        width="20"
        height="2.5"
        rx="1.25"
        fill="white"
        opacity="0"
      />

      {/* Chevron with bob wrapper */}
      <g className="rk-alogo-bob">
        <path
          className="rk-alogo-chevron"
          d="M10 24 L20 34 L30 24"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1}
          opacity="0"
        />
      </g>
    </svg>
  );
}
