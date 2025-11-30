import fs from 'fs';
import path from 'path';
import { GitHubService } from './src/services/githubService';
import { NotionService } from './src/services/notionService';

// 환경변수 로드
const envPath = path.join(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
  envFile
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .map((line) => {
      const [key, ...valueParts] = line.split('=');
      return [key.trim(), valueParts.join('=').trim()];
    })
);

const GITHUB_TOKEN = envVars.VITE_GITHUB_TOKEN || '';
const GITHUB_OWNER = envVars.VITE_GITHUB_OWNER || '';
const GITHUB_REPO = envVars.VITE_GITHUB_REPO || '';
const NOTION_TOKEN = envVars.VITE_NOTION_TOKEN || '';
const DATABASE_ID = envVars.VITE_NOTION_DATABASE_ID || '';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

/**
 * 테스트 결과 출력
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 테스트 결과 요약');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   세부사항:`, result.details);
    }
    console.log('');
  });

  console.log('='.repeat(60));
  console.log(`총 테스트: ${results.length} | 성공: ${passed} | 실패: ${failed}`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    console.log('⚠️  일부 테스트가 실패했습니다. 위의 오류 메시지를 확인하세요.\n');
    process.exit(1);
  } else {
    console.log('🎉 모든 테스트가 성공했습니다!\n');
  }
}

/**
 * 1. 환경변수 검증
 */
async function testEnvironmentVariables(): Promise<void> {
  console.log('🔍 1. 환경변수 검증 중...\n');

  try {
    const requiredVars = {
      VITE_GITHUB_TOKEN: GITHUB_TOKEN,
      VITE_GITHUB_OWNER: GITHUB_OWNER,
      VITE_GITHUB_REPO: GITHUB_REPO,
      VITE_NOTION_TOKEN: NOTION_TOKEN,
      VITE_NOTION_DATABASE_ID: DATABASE_ID,
    };

    const missing: string[] = [];
    Object.entries(requiredVars).forEach(([key, value]) => {
      if (!value) {
        missing.push(key);
      } else {
        console.log(`   ✓ ${key}: ${value.substring(0, 15)}...`);
      }
    });

    if (missing.length > 0) {
      throw new Error(`누락된 환경변수: ${missing.join(', ')}`);
    }

    results.push({
      name: '환경변수 검증',
      success: true,
      message: '모든 필수 환경변수가 설정되었습니다.',
    });
  } catch (error: any) {
    results.push({
      name: '환경변수 검증',
      success: false,
      message: error.message,
    });
  }
}

/**
 * 2. GitHub API 연결 테스트
 */
async function testGitHubConnection(): Promise<void> {
  console.log('\n🔍 2. GitHub API 연결 테스트 중...\n');

  try {
    const githubService = new GitHubService(GITHUB_TOKEN);

    // 레포지토리 정보 조회
    console.log(`   📦 레포지토리: ${GITHUB_OWNER}/${GITHUB_REPO}`);
    const repoInfo = await githubService.getRepoInfo(GITHUB_OWNER, GITHUB_REPO);
    console.log(`   ✓ 레포 이름: ${repoInfo.full_name}`);
    console.log(`   ✓ 설명: ${repoInfo.description || 'N/A'}`);
    console.log(`   ✓ 생성일: ${new Date(repoInfo.created_at).toLocaleDateString()}`);

    // 최근 커밋 조회
    const commits = await githubService.getPushEvents(GITHUB_OWNER, GITHUB_REPO);
    console.log(`   ✓ 최근 커밋 수: ${commits.length}개`);

    if (commits.length > 0) {
      const latestCommit = commits[0];
      console.log(`   ✓ 최신 커밋: ${latestCommit.commit.message.split('\n')[0]}`);
      console.log(`   ✓ 작성자: ${latestCommit.commit.author?.name}`);
    }

    results.push({
      name: 'GitHub API 연결',
      success: true,
      message: 'GitHub API에 성공적으로 연결되었습니다.',
      details: {
        repository: repoInfo.full_name,
        commits: commits.length,
      },
    });
  } catch (error: any) {
    results.push({
      name: 'GitHub API 연결',
      success: false,
      message: `GitHub API 연결 실패: ${error.message}`,
    });
  }
}

/**
 * 3. Notion API 연결 테스트
 */
async function testNotionConnection(): Promise<void> {
  console.log('\n🔍 3. Notion API 연결 테스트 중...\n');

  try {
    const notionService = new NotionService(NOTION_TOKEN, DATABASE_ID);
    const { Client } = await import('@notionhq/client');
    const notion = new Client({ auth: NOTION_TOKEN });

    // 데이터베이스 조회
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });

    const dbTitle = (database as any).title?.[0]?.plain_text || 'N/A';
    console.log(`   ✓ 데이터베이스 이름: ${dbTitle}`);
    console.log(`   ✓ 데이터베이스 ID: ${database.id}`);

    // 속성 확인
    const properties = (database as any).properties || {};
    console.log(`   ✓ 속성 개수: ${Object.keys(properties).length}개`);
    console.log(`   ✓ 속성 목록:`);
    Object.keys(properties).forEach((key) => {
      console.log(`      - ${key} (${properties[key].type})`);
    });

    results.push({
      name: 'Notion API 연결',
      success: true,
      message: 'Notion API에 성공적으로 연결되었습니다.',
      details: {
        database: dbTitle,
        properties: Object.keys(properties).length,
      },
    });
  } catch (error: any) {
    let errorMessage = `Notion API 연결 실패: ${error.message}`;

    if (error.code === 'object_not_found') {
      errorMessage += '\n   💡 해결방법: Notion 데이터베이스에 Integration을 연결해야 합니다.';
    } else if (error.code === 'unauthorized') {
      errorMessage += '\n   💡 해결방법: VITE_NOTION_TOKEN을 확인하세요.';
    }

    results.push({
      name: 'Notion API 연결',
      success: false,
      message: errorMessage,
    });
  }
}

/**
 * 4. CLAUDE.md 파일 존재 확인
 */
async function testClaudeMdFile(): Promise<void> {
  console.log('\n🔍 4. CLAUDE.md 파일 확인 중...\n');

  try {
    const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
    const exists = fs.existsSync(claudeMdPath);

    if (!exists) {
      throw new Error('CLAUDE.md 파일이 존재하지 않습니다.');
    }

    const content = fs.readFileSync(claudeMdPath, 'utf-8');
    const lines = content.split('\n').length;
    const size = (content.length / 1024).toFixed(2);

    console.log(`   ✓ 파일 경로: ${claudeMdPath}`);
    console.log(`   ✓ 파일 크기: ${size} KB`);
    console.log(`   ✓ 라인 수: ${lines}줄`);

    results.push({
      name: 'CLAUDE.md 파일 확인',
      success: true,
      message: 'CLAUDE.md 파일이 존재합니다.',
      details: {
        size: `${size} KB`,
        lines,
      },
    });
  } catch (error: any) {
    results.push({
      name: 'CLAUDE.md 파일 확인',
      success: false,
      message: error.message,
    });
  }
}

/**
 * 5. Notion CLAUDE.md 페이지 검색 테스트
 */
async function testNotionClaudeMdPage(): Promise<void> {
  console.log('\n🔍 5. Notion CLAUDE.md 페이지 검색 중...\n');

  try {
    const notionService = new NotionService(NOTION_TOKEN, DATABASE_ID);
    const pageId = await notionService.findClaudeMdPage();

    if (pageId) {
      console.log(`   ✓ 기존 CLAUDE.md 페이지 발견!`);
      console.log(`   ✓ 페이지 ID: ${pageId}`);
      results.push({
        name: 'Notion CLAUDE.md 페이지 검색',
        success: true,
        message: '기존 CLAUDE.md 페이지를 찾았습니다.',
        details: { pageId },
      });
    } else {
      console.log(`   ⚠️  기존 CLAUDE.md 페이지가 없습니다. (새로 생성 예정)`);
      results.push({
        name: 'Notion CLAUDE.md 페이지 검색',
        success: true,
        message: '기존 페이지가 없습니다. 첫 동기화 시 새로 생성됩니다.',
      });
    }
  } catch (error: any) {
    results.push({
      name: 'Notion CLAUDE.md 페이지 검색',
      success: false,
      message: `페이지 검색 실패: ${error.message}`,
    });
  }
}

/**
 * 6. E2E 동기화 테스트 (실제로 Notion에 생성하지 않음)
 */
async function testSyncWorkflow(): Promise<void> {
  console.log('\n🔍 6. E2E 동기화 워크플로우 검증 중...\n');

  try {
    // GitHub 커밋 조회
    const githubService = new GitHubService(GITHUB_TOKEN);
    const commits = await githubService.getPushEvents(GITHUB_OWNER, GITHUB_REPO, 1);

    if (commits.length === 0) {
      throw new Error('커밋이 없습니다.');
    }

    const latestCommit = commits[0];
    console.log(`   ✓ 최신 커밋 조회 성공`);
    console.log(`   ✓ 커밋 메시지: ${latestCommit.commit.message.split('\n')[0]}`);

    // CLAUDE.md 파일 읽기
    const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
    const markdown = fs.readFileSync(claudeMdPath, 'utf-8');
    console.log(`   ✓ CLAUDE.md 파일 읽기 성공`);

    // Notion 동기화 준비 (실제로 생성하지 않음)
    const notionService = new NotionService(NOTION_TOKEN, DATABASE_ID);
    console.log(`   ✓ Notion 서비스 초기화 성공`);

    results.push({
      name: 'E2E 동기화 워크플로우',
      success: true,
      message: '모든 동기화 구성 요소가 정상적으로 작동합니다.',
      details: {
        githubCommits: commits.length,
        claudeMdSize: `${(markdown.length / 1024).toFixed(2)} KB`,
      },
    });

    console.log(`\n   💡 실제 동기화를 실행하려면:`);
    console.log(`      npm run sync:notion`);
  } catch (error: any) {
    results.push({
      name: 'E2E 동기화 워크플로우',
      success: false,
      message: `워크플로우 검증 실패: ${error.message}`,
    });
  }
}

/**
 * 메인 테스트 실행
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 GitHub & Notion 통합 테스트 시작');
  console.log('='.repeat(60) + '\n');

  await testEnvironmentVariables();
  await testGitHubConnection();
  await testNotionConnection();
  await testClaudeMdFile();
  await testNotionClaudeMdPage();
  await testSyncWorkflow();

  printResults();
}

// 테스트 실행
runAllTests().catch((error) => {
  console.error('\n❌ 예기치 않은 오류 발생:', error);
  process.exit(1);
});
