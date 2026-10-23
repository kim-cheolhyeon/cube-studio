# Cube Studio

3×3×3 큐브 학습과 키보드 실전 연습 앱입니다. 로컬에서는 index.html을 브라우저로 열면 됩니다. 설치나 서버가 필요하지 않습니다.

운영 사이트: https://cube-studio.pages.dev

## 현재 기능

- 시작 화면은 학습이며 초급 해법과 F2L 목록은 접힌 상태입니다.
- 초급 해법 109개, F2L 41개를 제공합니다.
- F2L은 완성 페어·같은 윗색·다른 윗색·바닥색 위 기본형을 좌우로 구분합니다.
- 일반 F2L 케이스는 기본형 도달까지만, 완성 페어 외 기본형은 완성 페어 도달까지만 재생합니다. 완성 페어 기본형만 삽입까지 수행합니다.
- 풀이 재생·일시정지·속도 조절·이전 수·다음 수·문제 상태로 초기화를 지원합니다.
- 큐브 드래그 관찰, 방향 복귀 선택, 보존 조각과 목표 페어 색 표시, 이미지·JSON 내보내기를 지원합니다.
- 실전은 20수 셔플 후 첫 조작부터 시간을 재고 완성하면 조작과 타이머를 멈춥니다. 키보드 조작과 튜토리얼을 제공합니다.
- 자유조작 탭은 숨겨져 있습니다. 실전의 셔플 전 대기 상태에서 test0000을 입력하면 진입합니다. 입력란·튜토리얼·진행 중인 도전에서는 동작하지 않습니다.

## 파일 구조

```text
cube-studio/
├─ index.html                 화면과 스타일
├─ src/                       큐브·학습·실전·내보내기 코드
├─ data/
│  ├─ beginner/               초급 109개 케이스
│  └─ f2l/                    F2L 41개 케이스
├─ docs/
│  ├─ JSON-format.md          데이터와 색 표시 규칙
│  ├─ F2L.md                  F2L 기본형과 연결 규칙
│  ├─ beginner-guide.md       초급 단계 설명
│  └─ deployment.md           GitHub·Cloudflare 배포
└─ tools/
   ├─ build-case-bundle.cjs   JSON → 자동 불러오기용 번들
   ├─ build-site.cjs          문법 검사와 dist 생성
   ├─ check-f2l.cjs           도착 상태·보존 조각·풀이 이동 검사
   └─ check-modes.cjs         시작 모드·숨김 자유조작 진입 검사
```

각 data 하위 폴더의 cases.json이 원본이고 cases.bundle.js는 생성 파일입니다. 파일 하나는 해법 컬렉션 전체이며 목록의 폴더 계층은 categoryPath로 정의합니다. 케이스 이름은 표시용, id는 고유 연결용입니다.

## 수정과 확인

JSON 수정 후 node tools/build-case-bundle.cjs를 실행하고 index.html을 새로고침합니다. 생성 파일을 직접 편집하지 않습니다.

```text
node tools/check-f2l.cjs
node tools/check-modes.cjs
node tools/build-site.cjs
```

검사는 화면 렌더링 없이 큐브 상태와 조작 흐름을 확인합니다. 화면 배치는 브라우저에서 별도로 확인합니다.

## 배포

GitHub main에 올린 변경사항은 Cloudflare Pages가 자동 배포합니다. 로컬 작업은 사용자 요청이 있을 때만 업로드합니다. 설정은 docs/deployment.md를 참고하세요.
