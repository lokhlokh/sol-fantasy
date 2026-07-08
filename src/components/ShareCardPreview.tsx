export function ShareCardPreview({ score, nickname }: { score: number; nickname: string }) {
  return (
    <div className="rounded-lg border-4 border-ink bg-gold p-5 text-ink">
      <p className="text-xs font-black uppercase">카카오 공유 Mock 미리보기</p>
      <h3 className="mt-2 text-2xl font-black">{nickname}</h3>
      <p className="mt-6 text-5xl font-black">{score}</p>
      <p className="mt-2 font-bold">오늘의 판타지 야구 점수</p>
    </div>
  );
}
