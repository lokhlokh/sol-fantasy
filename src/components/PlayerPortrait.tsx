import type { Player } from "@/types/domain";

type PlayerPortraitProps = {
  player: Player;
  teamColor: string;
  size?: "sm" | "lg";
};

function hashText(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function PlayerPortrait({ player, teamColor, size = "lg" }: PlayerPortraitProps) {
  const hash = hashText(player.id);
  const skinTones = ["#f3c29b", "#e9aa7d", "#d89562", "#c98455"];
  const hairColors = ["#25211d", "#3a2a20", "#5b3a29", "#1f2937"];
  const accentColors = ["#f4b63f", "#ffffff", "#b9d8ff", "#d7f5df"];
  const skin = skinTones[hash % skinTones.length];
  const hair = hairColors[hash % hairColors.length];
  const accent = accentColors[hash % accentColors.length];
  const battingSide = hash % 2 === 0 ? "R" : "L";
  const compact = size === "sm";
  const initials = player.name.replace(/\s/g, "").slice(0, 3);

  return (
    <div className={compact ? "h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100" : "overflow-hidden rounded-lg border border-slate-200 bg-slate-100"}>
      <svg viewBox="0 0 240 300" role="img" aria-label={`${player.name} 모의 선수 사진`} className="h-full w-full">
        <rect width="240" height="300" fill="#f8fafc" />
        <rect width="240" height="110" fill={teamColor} />
        <circle cx="202" cy="42" r="26" fill={accent} opacity="0.32" />
        <circle cx="42" cy="74" r="18" fill="#ffffff" opacity="0.22" />
        <path d="M45 260 C68 198 172 198 195 260 L205 300 H35 Z" fill={teamColor} />
        <path d="M76 224 C86 196 154 196 164 224 L176 300 H64 Z" fill="#ffffff" opacity="0.92" />
        <path d="M82 226 L120 270 L158 226" fill="none" stroke={teamColor} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        <circle cx="120" cy="138" r="56" fill={skin} />
        <path d="M69 132 C74 84 100 65 138 77 C163 85 177 108 172 137 C150 124 108 121 69 132 Z" fill={hair} />
        <path d="M74 102 C84 70 155 65 168 103 L160 111 C136 101 103 101 80 111 Z" fill={teamColor} />
        <rect x="91" y="89" width="58" height="18" rx="9" fill={accent} opacity="0.9" />
        <circle cx="99" cy="142" r="5" fill="#172033" />
        <circle cx="141" cy="142" r="5" fill="#172033" />
        <path d="M102 166 C112 175 130 175 140 166" fill="none" stroke="#172033" strokeWidth="5" strokeLinecap="round" />
        <rect x="178" y="116" width="9" height="108" rx="4" fill="#7c4a22" transform={`rotate(${battingSide === "R" ? 20 : -20} 182 170)`} opacity="0.85" />
        <text x="120" y="294" textAnchor="middle" fontSize="22" fontWeight="900" fill="#172033">
          {compact ? player.teamId : initials}
        </text>
      </svg>
    </div>
  );
}
