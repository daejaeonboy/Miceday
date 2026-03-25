# 카페24 + 가비아 배포 가이드

## 목적

가비아에서 구매한 도메인을 카페24 호스팅에 연결하고, 이 프로젝트의 정적 빌드 결과물을 카페24에 업로드해 실제 사이트를 오픈한다.

## 현재 프로젝트 기준 배포 방식

- 프런트엔드: `Vite` 정적 빌드
- 정적 산출물: `dist/`
- 외부 연동:
  - 데이터: Supabase
  - 인증: Firebase Auth
  - 메일 fallback: Firebase Function

즉, 카페24에는 **정적 파일만 업로드**하면 되고, 외부 서비스는 계속 그대로 사용한다.

## 1. 로컬에서 배포 파일 만들기

프로젝트 루트에서 아래 순서로 실행한다.

```powershell
copy .env.production.example .env.production
cmd /c npm run build
```

PowerShell 실행 정책 때문에 `npm run build`가 막히는 경우가 있어, 이 프로젝트에서는 `cmd /c npm run build`로 실행하는 편이 안전하다.

빌드가 끝나면 `dist/` 폴더가 생성된다.

## 2. 카페24에 업로드할 파일

카페24 FTP 또는 파일관리자로 `dist/` **폴더 자체가 아니라 내부 파일들**을 웹 루트에 업로드한다.

예시:

- `dist/index.html`
- `dist/assets/...`
- `dist/robots.txt`
- `dist/sitemap.xml`
- `dist/.htaccess`

일반적으로 업로드 대상 경로는 카페24의 `public_html` 또는 대표 도메인 문서 루트다.

## 3. SPA 라우팅 설정

이 사이트는 React SPA라서 `/company`, `/products`, `/quote-request` 같은 직접 접근 주소가 있다.

이를 위해 루트에 `.htaccess`가 반드시 있어야 한다.

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

빌드 후 `dist/.htaccess`가 보이지 않으면, `public/.htaccess`를 카페24 웹 루트에 수동 업로드한다.

## 4. 가비아에서 도메인 연결

가비아 DNS 관리에서, 카페24가 제공한 호스팅 IP 또는 연결값으로 DNS를 설정한다.

일반적인 패턴은 아래 둘 중 하나다.

### A 레코드 방식

- `@` -> 카페24 호스팅 IP
- `www` -> 카페24 호스팅 IP 또는 `@`로 포워딩/별칭

### CNAME 방식

- `www` -> 카페24가 안내한 호스트명

정확한 값은 **카페24 호스팅 관리자 > 기본정보/도메인 연결 정보**에 나온 값을 기준으로 넣어야 한다.

## 5. 카페24에서 도메인 연결

카페24 관리자에서 해당 도메인을 추가하고, 대표 도메인 또는 연결 도메인으로 지정한다.

확인할 항목:

- 도메인 연결 상태
- 웹 루트가 업로드한 파일 위치와 일치하는지
- SSL 신청 또는 HTTPS 적용 여부

## 6. 배포 후 확인

아래 주소를 직접 열어 확인한다.

- `https://도메인/`
- `https://도메인/company`
- `https://도메인/privacy`
- `https://도메인/quote-request`

추가 확인:

- 새로고침해도 404가 나지 않는지
- 상품 목록이 정상 로드되는지
- 견적문의 등록이 정상 저장되는지

## 주의사항

### 메일 fallback

카페24에는 Firebase Hosting rewrite가 없으므로, 메일 fallback은 Firebase Function 절대 URL을 직접 호출하도록 변경해 두었다.

### 관리자 전용 외부 API

일부 관리자 기능은 `VITE_API_URL`이 필요할 수 있다.

해당 기능을 계속 사용할 계획이면 `.env.production`에 아래 값을 추가해야 한다.

```env
VITE_API_URL=https://관리자용-API-도메인
```

이 값이 없으면 공개 사이트는 열려도, 특정 관리자 기능은 실패할 수 있다.
