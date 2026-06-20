export function VehicleIcons() {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <svg width="30" height="30" viewBox="0 0 36 36">
        <circle cx="10" cy="26" r="6" fill="none" stroke="#346739" strokeWidth="2.5" />
        <circle cx="26" cy="26" r="6" fill="none" stroke="#346739" strokeWidth="2.5" />
        <path
          d="M10 26 L16 14 L22 14 L26 26 M16 14 L13 9 L9 9 M16 14 L20 20"
          fill="none"
          stroke="#346739"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-medium text-[#34673966]">+</span>
      <svg width="30" height="30" viewBox="0 0 36 36">
        <circle cx="9" cy="27" r="6" fill="none" stroke="#346739" strokeWidth="2.5" />
        <circle cx="27" cy="27" r="6" fill="none" stroke="#346739" strokeWidth="2.5" />
        <path
          d="M9 27 L14 27 L19 13 L25 13 M19 19 L27 19 L27 27 M14 27 L19 19"
          fill="none"
          stroke="#346739"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-medium text-[#34673966]">+</span>
      <svg width="30" height="30" viewBox="0 0 36 36">
        <rect x="6" y="16" width="24" height="9" rx="3" fill="none" stroke="#346739" strokeWidth="2.5" />
        <path d="M9 16 L12 10 L24 10 L27 16" fill="none" stroke="#346739" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="11" cy="27" r="3" fill="none" stroke="#346739" strokeWidth="2.5" />
        <circle cx="25" cy="27" r="3" fill="none" stroke="#346739" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

export function ClothesIcons() {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <svg width="26" height="30" viewBox="0 0 36 36">
        <path
          d="M13 7 L9 11 L9 15 L13 13 L13 28 L23 28 L23 13 L27 15 L27 11 L23 7 L20 9 L16 9 Z"
          fill="none"
          stroke="#663362"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm font-medium text-[#66336266]">×</span>
      <svg width="20" height="30" viewBox="0 0 28 36">
        <path
          d="M6 6 L22 6 L21 29 L15 29 L14 16 L13 29 L7 29 Z"
          fill="none"
          stroke="#663362"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function BadgeIcons() {
  const Badge = ({ label, dim }: { label: string; dim?: boolean }) => (
    <svg width="28" height="28" viewBox="0 0 36 36" className={dim ? "opacity-70" : ""}>
      <circle cx="18" cy="11" r="6" fill="none" stroke="#346739" strokeWidth="2.5" />
      <path
        d="M11 18 L8 28 L18 24 L28 28 L25 18"
        fill="none"
        stroke="#346739"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text x="18" y="14" textAnchor="middle" fontSize="8" fill="#346739" fontWeight="500">
        {label}
      </text>
    </svg>
  );

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Badge label="K" />
      <Badge label="S" dim />
    </div>
  );
}

export function ToggleButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border-[1.5px] px-4 py-1.5 text-sm font-medium transition-colors"
      style={{
        borderColor: "#663362",
        backgroundColor: active ? "#663362" : "#ffffff",
        color: active ? "#ffffff" : "#663362",
      }}
    >
      {label}
    </button>
  );
}

export function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 9.5 L7.5 13 L14 5.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


// section refleksi
export function LightbulbIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      className="mt-0.5 flex-shrink-0"
      aria-hidden="true"
    >
      <circle cx="13" cy="10" r="7" fill="none" stroke="#ffffff" strokeWidth={2} />
      <path d="M9.5 16 L16.5 16" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
      <path d="M10.5 19 L15.5 19" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
      <path
        d="M13 7.5 L13 11 M10.7 9 L11.8 10.3 M15.3 9 L14.2 10.3"
        stroke="#ffffff"
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </svg>
  );
}

export const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
 
export const IconLightbulb = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);
 
export const IconHelpCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4M12 8h.01"></path>
  </svg>
);
 
export const IconTable = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 3H5a2 2 0 0 0-2 2v4m0 0H3m3 0v8m0 0H5m4 0h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-4m0 0V3m0 0H9"></path>
  </svg>
);
 
export const IconGrid = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);
 
export const IconBranch = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="6" y1="3" x2="6" y2="15"></line>
    <circle cx="18" cy="6" r="3"></circle>
    <circle cx="6" cy="18" r="3"></circle>
    <path d="M18 9a9 9 0 0 1-9 9"></path>
  </svg>
);