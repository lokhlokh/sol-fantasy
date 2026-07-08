"use client";

import { useEffect, useState, type ReactNode } from "react";

const accessKey = "sol-fantasy-mock-access";
const reportPassword = "1111";

export function PasswordGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setUnlocked(window.localStorage.getItem(accessKey) === "granted");
    setReady(true);
  }, []);

  const submit = () => {
    if (password === reportPassword) {
      window.localStorage.setItem(accessKey, "granted");
      setUnlocked(true);
      setError("");
      return;
    }

    setError("비밀번호를 다시 확인해 주세요.");
    setPassword("");
  };

  if (!ready) return null;
  if (unlocked) return children;

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center bg-slate-50 px-5">
      <section className="w-full rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sol">SOL 판타지야구 Mock</p>
        <h1 className="mt-2 text-2xl font-black text-ink">보고용 목업 입장</h1>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
          내부 공유용 목업입니다. 전달받은 비밀번호를 입력해 주세요.
        </p>
        <label className="mt-5 block">
          <span className="text-sm font-bold text-slate-600">비밀번호</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 p-3 text-center text-xl font-black tracking-[0.35em] text-ink"
            inputMode="numeric"
            maxLength={4}
            type="password"
            value={password}
            onChange={(event) => {
              setError("");
              setPassword(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            autoFocus
          />
        </label>
        {error && <p className="mt-2 rounded-md bg-red-50 p-2 text-center text-sm font-bold text-red-700">{error}</p>}
        <button type="button" onClick={submit} className="mt-4 w-full rounded-md bg-sol p-3 text-sm font-black text-white">
          입장하기
        </button>
      </section>
    </main>
  );
}
