# GitHub → Cloudflare 자동 배포

- 저장소: https://github.com/kim-cheolhyeon/cube-studio
- 운영 주소: https://cube-studio.pages.dev
- 배포 방식: Cloudflare Pages의 GitHub 직접 연결
- 프로덕션 브랜치: main
- 빌드 명령: node tools/build-site.cjs
- 빌드 출력 디렉터리: dist
- 루트 디렉터리: 저장소 루트

사용자가 GitHub 업로드 또는 배포를 요청할 때만 main에 변경사항을 올립니다. 로컬 수정만으로는 공개 사이트가 바뀌지 않습니다.

## 확인 후 업로드

```text
node tools/check-f2l.cjs
node tools/check-modes.cjs
node tools/check-oll2.cjs
node tools/check-pll2.cjs
node tools/check-full-last-layer.cjs
node tools/build-site.cjs
```

main에 올리면 Cloudflare가 자동으로 빌드하고 배포합니다. ZIP 업로드, GitHub Actions 배포, GitHub Secrets의 Cloudflare 토큰은 이 방식에 필요하지 않습니다.

빌드는 JSON으로부터 데이터 번들을 생성하고 JavaScript 문법을 검사한 뒤 index.html·src·data·assets만 dist에 모읍니다. 문서와 개발 도구는 웹에 업로드하지 않습니다.

배포 상태는 Cloudflare의 cube-studio 프로젝트 → 배포에서 확인합니다. 빌드 실패 시 로그를 확인하고 새 배포 성공 전에는 기존 사이트가 유지됩니다.
