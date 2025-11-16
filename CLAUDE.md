# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GitHub-Notion Sync는 GitHub 커밋 정보를 자동으로 Notion 데이터베이스에 동기화하는 React 웹 애플리케이션입니다.

**핵심 기능:**
- GitHub API를 통한 커밋 정보 조회
- Notion API를 통한 페이지 자동 생성
- MCP(Model Context Protocol) 기반 워크플로우 자동화

## Development Commands

### 초기 설정
```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 실제 API 토큰 값을 입력하세요
```

### 개발 서버
```bash
# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

### 코드 품질
```bash
# ESLint 실행
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit
```

## Architecture

### 프로젝트 구조
```
src/
├── components/      # React 컴포넌트
├── services/        # API 서비스 레이어
│   ├── githubService.ts   # GitHub API 클라이언트
│   └── notionService.ts   # Notion API 클라이언트
├── config/          # 설정 파일
│   └── mcpConfig.ts       # MCP 워크플로우 설정
├── types/           # TypeScript 타입 정의
└── utils/           # 유틸리티 함수
```

### 서비스 레이어 패턴

**GitHubService** ([src/services/githubService.ts](src/services/githubService.ts))
- `@octokit/rest` 기반 GitHub API 클라이언트
- 커밋 목록 조회, 커밋 상세 정보, 레포지토리 정보 제공
- Personal Access Token 기반 인증

**NotionService** ([src/services/notionService.ts](src/services/notionService.ts))
- `@notionhq/client` 기반 Notion API 클라이언트
- 데이터베이스 페이지 생성 및 커밋 정보 포맷팅
- Integration Token 기반 인증

### MCP 워크플로우 설정

[src/config/mcpConfig.ts](src/config/mcpConfig.ts)에서 GitHub → Notion 데이터 변환 로직 정의:
- `defaultWorkflow.transform`: 커밋 데이터를 Notion 페이지 형식으로 변환
- 필터링 옵션: 브랜치, 작성자, 날짜 범위 기반 필터

## API 인증 설정

### GitHub Personal Access Token
1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 필요한 권한: `repo` (전체 저장소 접근)
3. `.env` 파일에 `VITE_GITHUB_TOKEN` 설정

### Notion Integration Token
1. [Notion Integrations](https://www.notion.so/my-integrations) 페이지에서 새 integration 생성
2. 대상 데이터베이스를 integration에 연결 (Share → Add connections)
3. `.env` 파일에 `VITE_NOTION_TOKEN` 및 `VITE_NOTION_DATABASE_ID` 설정

### Notion 데이터베이스 스키마

NotionService가 올바르게 작동하려면 다음 속성을 가진 데이터베이스가 필요합니다:
- **Title** (제목 타입)
- **Author** (텍스트 타입)
- **Date** (날짜 타입)
- **SHA** (텍스트 타입)
- **URL** (URL 타입)

## 환경변수

모든 환경변수는 Vite의 `VITE_` 접두사를 사용하여 클라이언트 사이드에서 접근 가능합니다:

```typescript
const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
const notionToken = import.meta.env.VITE_NOTION_TOKEN;
```

## 개발 시 주의사항

### API 토큰 보안
- `.env` 파일은 절대 커밋하지 않습니다 (`.gitignore`에 포함됨)
- API 토큰은 클라이언트 사이드에 노출되므로, 프로덕션에서는 백엔드 프록시 사용 권장

### 서비스 클래스 사용 패턴
```typescript
import { GitHubService } from './services/githubService';
import { NotionService } from './services/notionService';

const githubService = new GitHubService(import.meta.env.VITE_GITHUB_TOKEN);
const notionService = new NotionService(
  import.meta.env.VITE_NOTION_TOKEN,
  import.meta.env.VITE_NOTION_DATABASE_ID
);

// GitHub 커밋 조회
const commits = await githubService.getPushEvents('owner', 'repo');

// Notion 페이지 생성
await notionService.createCommitPage(transformedData);
```

### TypeScript 설정
- `tsconfig.app.json`: 애플리케이션 코드용 설정
- `tsconfig.node.json`: Vite 설정 파일용 설정
- 엄격한 타입 체크 활성화됨 (`strict: true`)
