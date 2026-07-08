# SOL 판타지야구 Mock

모바일 우선으로 만든 플레이 가능한 판타지야구 mock 프로토타입입니다.

시즌팀 선택 -> 라인업 구성 -> 히든젬 / 작전 카드 / 오늘의 마운드 선택 -> 경기 결과 시뮬레이션 -> 결과 확인 -> 친구 미니리그 -> 한솥밥 카드 성장 흐름을 보여줍니다.

이 프로젝트는 mock 전용입니다. 실제 SuperSOL, 카카오, KBO 피드, 고객 데이터, 선수 이미지, 분석 도구, 운영 credential에 연결하지 않습니다.

## 실행

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

## 기술 스택

- Next.js, React, TypeScript
- Tailwind CSS
- Vitest
- `localStorage` 기반 로컬 상태
- `src/data`의 synthetic mock 데이터

## 주요 화면

- `/` 홈 대시보드
- `/team-select` 시즌팀 선택
- `/lineup` 8명 라인업 구성
- `/strategy` 작전 카드와 오늘의 마운드 선택
- `/result` 경기 결과와 AI 감독 비교
- `/mini-league` 친구 순위와 카카오 공유 mock 미리보기
- `/cards` 한솥밥 카드 성장
- `/admin` mock 데이터, seed, 룰, localStorage 상태 확인
