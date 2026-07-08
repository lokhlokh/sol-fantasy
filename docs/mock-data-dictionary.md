# Mock 데이터 사전

모든 데이터는 synthetic mock 데이터입니다.

## 팀

`src/data/teams.ts`에는 KBO 스타일 10개 mock 팀이 있습니다. 프로토타입 이해를 돕기 위한 이름이며 실제 운영 데이터가 아닙니다.

## 선수

`src/data/players.ts`는 250명의 mock 선수를 생성합니다.

- 팀당 25명
- 실제 선수명 미사용
- 팀별 필수 포지션 분포 보장
- 가격 1~15성
- 최근감 0~100
- 예상 점수 0~30
- 히든젬 후보가 충분하도록 3성 이하 선수 포함

## 시뮬레이션

`src/engine/simulator.ts`는 seed 기반 deterministic random을 사용합니다. 같은 seed는 같은 타자 기록, 마운드 결과, AI 점수, 미니리그 순위를 반환합니다.
