# Full OLL · Full PLL

기존 2-look OLL·PLL은 유지하고 별도 컬렉션으로 제공합니다. 학습 방향은 U 노랑 / D 흰색 / F 초록 / R 주황입니다.

## Full OLL · 57개

F2L 완료 상태에서 시작하여 한 공식으로 윗면 전체를 노랑으로 만듭니다. 마지막 층 조각의 위치는 아직 맞지 않아도 됩니다.

- 노랑 엣지 4개: 이미 십자가가 있는 7개.
- 노랑 엣지 2개: T·사각·C·W·P·I·피시·나이트·비대칭·L·번개형과 코너 방향 완성형.
- 노랑 엣지 0개: 점형 8개.

여기서 엣지 개수는 U를 향한 노랑 엣지 스티커 수입니다. 목록의 OLL 번호는 외부 자료에서 찾아볼 수 있는 통상적인 케이스 번호입니다. F2L의 과거 앱 내부 번호와는 다릅니다.

첫 두 층과 중앙 34칸은 protected, 마지막 층 조각 20칸은 focus로 표시합니다. 이번 목표와 보존 부분을 모두 표시하므로 모든 칸에 실제 색이 나옵니다.

## Full PLL · 21개

윗면 방향이 모두 맞은 상태에서 시작하여 한 공식으로 큐브를 완성합니다.

| 분류 | 케이스 |
|---|---|
| 엣지만 이동 | Ua, Ub, H, Z |
| 코너만 이동 | Aa, Ab, E |
| 인접 코너 교환 | T, J, R, F 계열 |
| 대각 코너 교환 | Y, V, N 계열 |
| G형 | Ga, Gb, Gc, Gd |

각 배열과 공식은 화면의 기준 면에 맞춰져 있습니다. 실제 큐브에서는 U 정렬과 전체 방향을 맞춰 같은 배치를 만든 뒤 사용합니다. 공식에는 필요한 마지막 U 정렬이 포함돼 있습니다.

이동하는 조각의 모든 스티커는 focus, 나머지는 protected로 표시합니다. 첫 두 층과 윗면 방향은 종료 후 유지됩니다.

## 자료와 데이터

공식과 통상적인 케이스 번호·이름은 Feliks Zemdegs·Andy Klise의 [CubeSkills OLL Algorithms](https://www.cubeskills.com/uploads/pdf/tutorials/oll-algorithms.pdf)와 [PLL Algorithms](https://www.cubeskills.com/uploads/pdf/tutorials/pll-algorithms.pdf)를 참고했습니다. 설명과 목록 계층은 앱용으로 정리했습니다. 자료의 이미지는 복사하지 않았으며 상태는 큐브 회전으로 생성했습니다.

- OLL 원본: data/oll/cases.json
- PLL 원본: data/pll/cases.json
- 생성 파일: 각 폴더의 cases.bundle.js
- 수정 후 번들 생성: node tools/build-case-bundle.cjs
- 검사: node tools/check-full-last-layer.cjs

2회전의 프라임 표기는 같은 180도이므로 2로 통일했습니다. 일부 공식의 전체 회전은 끝에 기준 면을 복구하는 회전을 포함합니다. 원래 자료의 대괄호 U 정렬도 실행 공식에 포함했습니다.

## 검증 범위

57개 OLL과 21개 PLL에 대해 다음을 확인합니다.

- 첫 두 층의 시작 전제 및 종료 후 보존.
- OLL 윗면 방향 완성과 PLL 큐브 완성.
- 윗면 회전을 고려한 케이스 중복 없음.
- 완료 상태와 정렬 변형까지 포함하여 OLL 216가지 방향과 PLL 288가지 위치 배열을 빠짐없이 포함.
- 재생, 이전·다음 수, 모든 수 되돌리기와 문제 상태로 초기화.
- 마지막 층 위치가 다른 OLL 변형에서도 같은 방향 패턴과 목표 유지.

완료 상태는 목록에 별도 케이스로 추가하지 않습니다. 2-look PLL의 Ua·Ub 이름과 공식도 위 참고 자료의 명칭에 맞췄습니다.
