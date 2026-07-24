import type { Player } from "@/types/domain";

type PlayerPortraitProps = {
  player: Player;
  teamColor: string;
  size?: "sm" | "lg";
};

const facePortraits = Array.from(
  { length: 12 },
  (_, index) => `/mock-player-faces/faces/face-${String(index + 1).padStart(2, "0")}.png`
);
const uniformedPortraits = Array.from(
  { length: 12 },
  (_, index) => `/mock-player-faces/uniformed/{TEAM_ID}/face-${String(index + 1).padStart(2, "0")}.png`
);
const uniformedTeamIds = new Set(["KIA", "LG", "DOOSAN", "SAMSUNG", "SSG", "LOTTE", "HANWHA", "NC", "KIWOOM", "KT"]);

function hashText(value: string) {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function PlayerPortrait({ player, teamColor, size = "lg" }: PlayerPortraitProps) {
  const hash = hashText(player.id);
  const accentColors = ["#f4b63f", "#ffffff", "#b9d8ff", "#d7f5df"];
  const accent = accentColors[hash % accentColors.length];
  const battingSide = hash % 2 === 0 ? "R" : "L";
  const facePortrait = facePortraits[hash % facePortraits.length];
  const uniformedPortrait = uniformedPortraits[hash % uniformedPortraits.length].replace("{TEAM_ID}", player.teamId);
  const faceClipId = `mock-face-${player.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const compact = size === "sm";
  const initials = player.name.replace(/\s/g, "").slice(0, 3);
  const portraitFrameClass = compact
    ? "h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
    : "overflow-hidden rounded-lg border border-slate-200 bg-slate-100";

  if (uniformedTeamIds.has(player.teamId)) {
    return (
      <div className={portraitFrameClass}>
        <img
          src={uniformedPortrait}
          alt={`${player.name} 모의 선수 사진`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={portraitFrameClass}>
      <svg viewBox="0 0 240 300" role="img" aria-label={`${player.name} 모의 선수 사진`} className="h-full w-full">
        <defs>
          <clipPath id={faceClipId}>
            <ellipse cx="120" cy="140" rx="58" ry="67" />
          </clipPath>
        </defs>
        <rect width="240" height="300" fill="#f8fafc" />
        <rect width="240" height="110" fill={teamColor} />
        <circle cx="202" cy="42" r="26" fill={accent} opacity="0.32" />
        <circle cx="42" cy="74" r="18" fill="#ffffff" opacity="0.22" />
        <path d="M45 260 C68 198 172 198 195 260 L205 300 H35 Z" fill={teamColor} />
        <path d="M76 224 C86 196 154 196 164 224 L176 300 H64 Z" fill="#ffffff" opacity="0.92" />
        <path d="M82 226 L120 270 L158 226" fill="none" stroke={teamColor} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        <ellipse cx="120" cy="140" rx="58" ry="67" fill="#fffaf4" />
        <image
          href={facePortrait}
          x="60"
          y="60"
          width="120"
          height="160"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${faceClipId})`}
        />
        <path d="M74 102 C84 70 155 65 168 103 L160 111 C136 101 103 101 80 111 Z" fill={teamColor} />
        <rect x="91" y="89" width="58" height="18" rx="9" fill={accent} opacity="0.9" />
        <rect x="178" y="116" width="9" height="108" rx="4" fill="#7c4a22" transform={`rotate(${battingSide === "R" ? 20 : -20} 182 170)`} opacity="0.85" />
        <text x="120" y="294" textAnchor="middle" fontSize="22" fontWeight="900" fill="#172033">
          {compact ? player.teamId : initials}
        </text>
      </svg>
    </div>
  );
}
