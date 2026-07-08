"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { teams } from "@/data/teams";
import { useLocalGameState } from "@/store/useLocalGameState";
import type { TeamId } from "@/types/domain";

const teamDisplayNames: Record<TeamId, string> = {
  KIA: "KIA 모의 타이거즈",
  LG: "LG 모의 트윈스",
  DOOSAN: "두산 모의 베어스",
  SAMSUNG: "삼성 모의 라이온즈",
  SSG: "SSG 모의 랜더스",
  LOTTE: "롯데 모의 자이언츠",
  HANWHA: "한화 모의 이글스",
  NC: "NC 모의 다이노스",
  KIWOOM: "키움 모의 히어로즈",
  KT: "KT 모의 위즈",
};

function SettingCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-3">
        <h2 className="font-black text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
      <span>
        <span className="block text-sm font-black text-ink">{label}</span>
        <span className="mt-1 block text-xs font-semibold text-slate-500">{description}</span>
      </span>
      <input className="h-5 w-5 accent-blue-600" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export default function AdminPage() {
  const { state, setFantasyTeamName, setManagerNickname, setSeasonTeamId, setSolTransactionToday, reset } = useLocalGameState();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const fantasyTeamName = state.fantasyTeamName ?? "AI킬러";
  const managerNickname = state.managerNickname ?? "홍길동";
  const seasonTeamId = state.seasonTeamId ?? "LG";
  const selectedTeam = teams.find((team) => team.id === seasonTeamId);

  return (
    <AppShell title="내 구단 설정">
      <div className="space-y-4">
        <section className="rounded-lg bg-ink p-4 text-white">
          <p className="text-xs font-black text-blue-200">MY DUGOUT</p>
          <h2 className="mt-1 text-2xl font-black">{fantasyTeamName}</h2>
          <p className="mt-2 text-sm font-semibold text-slate-200">
            단장 {managerNickname} · 시즌팀 {teamDisplayNames[seasonTeamId]}
          </p>
        </section>

        <SettingCard title="구단 프로필" description="덕아웃, 리그 랭킹, 공유 화면에 노출되는 이름입니다.">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-bold text-slate-600">구단명</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm font-bold"
                value={fantasyTeamName}
                maxLength={12}
                onChange={(event) => {
                  setSaved(false);
                  setFantasyTeamName(event.target.value);
                }}
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-600">단장 닉네임</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 p-3 text-sm font-bold"
                value={managerNickname}
                maxLength={10}
                onChange={(event) => {
                  setSaved(false);
                  setManagerNickname(event.target.value);
                }}
              />
            </label>
            <button type="button" onClick={() => setSaved(true)} className="w-full rounded-md bg-sol p-3 text-sm font-black text-white">
              저장
            </button>
            {saved && <p className="rounded-md bg-blue-50 p-2 text-center text-xs font-black text-sol">구단 프로필이 저장되었습니다.</p>}
          </div>
        </SettingCard>

        <SettingCard title="시즌팀 관리" description="레전드 카드, 시즌팀별 랭킹, 일부 보상 문구의 기준이 되는 팀입니다.">
          <div className="space-y-3">
            <select
              className="w-full rounded-md border border-slate-300 p-3 text-sm font-bold"
              value={seasonTeamId}
              onChange={(event) => setSeasonTeamId(event.target.value as TeamId)}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {teamDisplayNames[team.id]}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 rounded-md bg-slate-50 p-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: selectedTeam?.color ?? "#111827" }}>
                {selectedTeam?.shortName ?? seasonTeamId}
              </span>
              <p className="text-sm font-bold text-slate-600">현재 선택한 시즌팀은 {teamDisplayNames[seasonTeamId]}입니다.</p>
            </div>
          </div>
        </SettingCard>

        <SettingCard title="SOL 거래 혜택" description="오늘 SOL 거래가 있으면 작전 2를 추가로 선택할 수 있습니다.">
          <ToggleRow
            label="오늘 SOL 거래 완료"
            description={state.hasSolTransactionToday ? "작전 2 선택권이 열려 있습니다." : "거래가 없으면 작전 2를 선택할 수 없습니다."}
            checked={Boolean(state.hasSolTransactionToday)}
            onChange={setSolTransactionToday}
          />
        </SettingCard>

        <SettingCard title="알림 설정" description="라인업 마감, 히든젬 추천, 보상권 진입 상황을 놓치지 않도록 알려드립니다.">
          <div className="space-y-2">
            <ToggleRow label="게임 알림 받기" description="라인업 마감과 결과 공개 알림을 받습니다." checked={pushEnabled} onChange={setPushEnabled} />
            <ToggleRow label="혜택 소식 받기" description="Super SOL, 신한투자증권, 신한라이프 연계 혜택을 받습니다." checked={marketingEnabled} onChange={setMarketingEnabled} />
          </div>
        </SettingCard>

        <SettingCard title="체험 데이터" description="목업 시연을 다시 시작해야 할 때만 사용합니다.">
          <button type="button" onClick={reset} className="w-full rounded-md border border-red-200 bg-red-50 p-3 text-sm font-black text-red-700">
            체험 데이터 초기화
          </button>
        </SettingCard>
      </div>
    </AppShell>
  );
}
