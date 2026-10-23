# GitHub → Cloudflare 자동 배포

이 cube-studio 폴더 자체를 GitHub 저장소의 최상위로 올립니다. 상위 작업 폴더 전체를 올리지 않습니다.

## 최초 연결

1. GitHub 저장소를 만들고 이 폴더의 코드를 main 브랜치에 올립니다. 숨김 폴더 .github도 포함합니다.
2. Cloudflare의 기존 Pages 프로젝트 이름이 cube-studio인지 확인합니다. 기존 프로젝트의 프로덕션 브랜치가 main인지 확인하고, 다르면 main으로 설정합니다.
3. Cloudflare 프로필의 API Tokens에서 사용자 지정 토큰을 만듭니다. Account → Cloudflare Pages → Edit 권한을 주고 해당 계정으로 범위를 제한합니다.
4. GitHub 저장소 Settings → Secrets and variables → Actions → New repository secret에서 아래 두 값을 저장합니다.

| 이름 | 값 |
|---|---|
| CLOUDFLARE_API_TOKEN | 생성한 Cloudflare API 토큰 |
| CLOUDFLARE_ACCOUNT_ID | 기존 Pages 프로젝트가 속한 계정 ID |

토큰은 소스 파일이나 채팅에 붙여 넣지 않습니다. 계정 ID는 Cloudflare 대시보드 주소의 계정 식별자에서도 확인할 수 있습니다.

5. GitHub Actions → Deploy Cube Studio → Run workflow를 실행합니다. 이후 main에 변경사항을 올리면 자동 배포됩니다.

## 동작

JSON으로부터 번들을 다시 생성하고 JavaScript 문법을 확인한 뒤, index.html·src·data만 dist로 모아 기존 cube-studio 프로젝트에 배포합니다. GitHub 설정 파일과 문서, 개발 도구는 웹에 업로드하지 않습니다. 주소는 https://cube-studio.pages.dev 를 유지합니다.

로컬 준비 확인: `node tools/build-site.cjs`. 이 명령만으로는 공개 사이트가 변경되지 않습니다.

실패하면 GitHub Actions의 해당 실행 로그를 확인합니다. 비밀 값이 없는 상태의 첫 실행은 배포되지 않습니다.

공식 참고: https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
