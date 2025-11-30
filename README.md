# GitHub-Notion 동기화 웹앱

Claude Code를 활용하여 개발한 GitHub 커밋 정보를 Notion 데이터베이스에 자동으로 동기화하는 React 웹 애플리케이션입니다.

## 프로젝트 소개

이 프로젝트는 GitHub 레포지토리의 커밋 정보를 자동으로 수집하여 Notion 데이터베이스에 동기화하는 웹 애플리케이션입니다. MCP(Model Context Protocol) 기반의 워크플로우를 통해 데이터 변환 및 동기화를 자동화합니다.

### 주요 기능

- **GitHub 커밋 조회**: GitHub API를 통한 레포지토리 커밋 정보 조회
- **Notion 페이지 생성**: Notion API를 통한 데이터베이스 페이지 자동 생성
- **MCP 워크플로우**: 자동화된 데이터 변환 및 동기화 프로세스
- **필터링 옵션**: 브랜치, 작성자, 날짜 범위 기반 커밋 필터링
- **전자문서 발급 연동**: 정부24 발급 API와 연동하여 주요 민원 서류를 요청

## 기술 스택

- **프론트엔드**: React 18 + TypeScript + Vite
- **스타일링**: CSS Modules
- **API 클라이언트**:
  - `@octokit/rest` - GitHub API
  - `@notionhq/client` - Notion API
- **개발 도구**: ESLint, TypeScript

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- GitHub Personal Access Token
- Notion Integration Token
- Notion Database ID

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/kseongbin/webapp-with-claude-code.git
cd webapp-with-claude-code
```

2. **의존성 설치**
```bash
npm install
```

3. **환경변수 설정**
```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 값을 입력하세요:
```env
VITE_GITHUB_TOKEN=your_github_personal_access_token
VITE_NOTION_TOKEN=your_notion_integration_token
VITE_NOTION_DATABASE_ID=your_notion_database_id
VITE_GOV24_API_BASE_URL=https://api.gov24.go.kr/v1
VITE_GOV24_API_KEY=your_gov24_api_key
```

4. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

5. **프로덕션 빌드**
```bash
npm run build
npm run preview
```

## API 설정 가이드

### GitHub Personal Access Token 발급

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 필요한 권한 선택: `repo` (전체 저장소 접근)
4. 생성된 토큰을 `.env` 파일의 `VITE_GITHUB_TOKEN`에 입력

### Notion Integration 설정

1. [Notion Integrations](https://www.notion.so/my-integrations) 페이지 접속
2. "New integration" 클릭하여 새 integration 생성
3. 생성된 토큰을 `.env` 파일의 `VITE_NOTION_TOKEN`에 입력
4. 대상 Notion 데이터베이스를 integration에 연결:
   - 데이터베이스 페이지에서 "Share" 클릭
   - "Add connections"에서 생성한 integration 선택
5. 데이터베이스 URL에서 ID 추출하여 `VITE_NOTION_DATABASE_ID`에 입력

### Notion 데이터베이스 스키마

다음 속성을 가진 Notion 데이터베이스를 생성하세요:

| 속성명 | 타입 | 설명 |
|--------|------|------|
| Title | 제목 | 커밋 메시지 |
| Author | 텍스트 | 커밋 작성자 |
| Date | 날짜 | 커밋 날짜 |
| SHA | 텍스트 | 커밋 해시 |
| URL | URL | GitHub 커밋 링크 |

### 정부24 문서 발급 API 설정

새롭게 추가된 전자문서 발급 기능을 사용하려면 정부24 또는 관련 행정 API 게이트웨이에서 발급받은 키를 설정해야 합니다.

```env
VITE_GOV24_API_BASE_URL=https://api.gov24.go.kr/v1    # 기관에서 안내한 베이스 URL
VITE_GOV24_API_KEY=your_gov24_api_key                 # 발급받은 인증 키
```

> **주의**: 실제 정부24 API는 사용자 인증이나 공동인증서 연동 등 추가 절차가 필요할 수 있습니다. 본 애플리케이션은 프런트엔드 연동 예시를 제공하며, 민감한 키는 서버에서 프록시 처리하는 것을 권장합니다.

## 프로젝트 구조

```
├── src/
│   ├── services/           # API 서비스 레이어
│   │   ├── githubService.ts    # GitHub API 클라이언트
│   │   └── notionService.ts    # Notion API 클라이언트
│   ├── config/             # 설정 파일
│   │   └── mcpConfig.ts        # MCP 워크플로우 설정
│   ├── utils/              # 유틸리티 함수
│   │   └── markdownToNotion.ts # Markdown to Notion 변환
│   ├── components/         # React 컴포넌트
│   ├── types/              # TypeScript 타입 정의
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── main.tsx            # 앱 진입점
├── scripts/                # 유틸리티 스크립트
│   ├── sync-claude-md.ts       # Notion 동기화 스크립트
│   ├── test-notion-connection.ts   # Notion 연결 테스트
│   ├── test-commit-sync.ts     # 커밋 동기화 테스트
│   └── test-integration.ts     # 통합 테스트
├── public/                 # 정적 파일
├── CLAUDE.md              # Claude Code 가이드
└── README.md              # 프로젝트 문서
```

## 사용 방법

1. 웹 애플리케이션에 접속
2. GitHub 레포지토리 정보 입력 (owner/repo)
3. 동기화할 커밋 필터 조건 설정 (선택사항)
4. "동기화 시작" 버튼 클릭
5. Notion 데이터베이스에서 동기화된 커밋 정보 확인

## 개발 정보

### Claude Code 활용

이 프로젝트는 [Claude Code](https://claude.com/code)를 활용하여 개발되었습니다:

- **AI 기반 코드 생성**: 서비스 레이어 및 API 통합 코드 자동 생성
- **타입 안전성**: TypeScript 타입 정의 및 타입 체크 자동화
- **코드 리팩토링**: 코드 품질 개선 및 최적화
- **문서화**: 프로젝트 문서 및 주석 작성
- **디버깅 지원**: 에러 분석 및 해결 방안 제시

### 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# ESLint 실행
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit

# Notion 동기화 스크립트
npm run sync:notion

# 테스트 스크립트
npm run test:notion        # Notion 연결 테스트
npm run test:commit        # 커밋 동기화 테스트
npm run test:integration   # 통합 테스트
```

## 보안 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- API 토큰은 클라이언트 사이드에 노출되므로, 프로덕션 환경에서는 백엔드 프록시 사용을 권장합니다
- GitHub 토큰의 권한을 필요한 최소한으로 제한하세요
- Notion Integration의 접근 권한을 필요한 데이터베이스로만 제한하세요

## 라이선스

MIT License

## 기여

이슈 및 풀 리퀘스트는 언제나 환영합니다!

## 문의

프로젝트에 대한 문의사항은 [Issues](https://github.com/kseongbin/webapp-with-claude-code/issues) 페이지에 남겨주세요.
