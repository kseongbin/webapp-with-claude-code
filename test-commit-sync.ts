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

async function testCommitSync() {
  console.log('🚀 GitHub 커밋 → Notion 동기화 테스트\n');
  console.log('='.repeat(60));

  try {
    // GitHub에서 최신 커밋 조회
    console.log('\n1️⃣ GitHub에서 최신 커밋 조회 중...');
    const githubService = new GitHubService(GITHUB_TOKEN);
    const commits = await githubService.getPushEvents(GITHUB_OWNER, GITHUB_REPO, 1);

    if (commits.length === 0) {
      console.log('❌ 커밋이 없습니다.');
      return;
    }

    const latestCommit = commits[0];
    console.log(`✅ 최신 커밋 발견: ${latestCommit.commit.message.split('\n')[0]}`);
    console.log(`   작성자: ${latestCommit.commit.author?.name}`);
    console.log(`   날짜: ${new Date(latestCommit.commit.author?.date || '').toLocaleString('ko-KR')}`);

    // 커밋 상세 정보 조회
    console.log('\n2️⃣ 커밋 상세 정보 조회 중...');
    const commitDetails = await githubService.getCommitDetails(
      GITHUB_OWNER,
      GITHUB_REPO,
      latestCommit.sha
    );

    const files = commitDetails.files?.map((file) => file.filename) || [];
    console.log(`✅ 변경된 파일 수: ${files.length}개`);

    // Notion에 커밋 페이지 생성
    console.log('\n3️⃣ Notion에 커밋 페이지 생성 중...');
    const notionService = new NotionService(NOTION_TOKEN, DATABASE_ID);

    const commitData = {
      title: latestCommit.commit.message.split('\n')[0],
      message: latestCommit.commit.message,
      author: latestCommit.commit.author?.name || 'Unknown',
      date: latestCommit.commit.author?.date || new Date().toISOString(),
      sha: latestCommit.sha,
      url: latestCommit.html_url,
      files: files,
    };

    const result = await notionService.createCommitPage(commitData);
    console.log('✅ Notion 페이지 생성 완료!');
    console.log(`   페이지 ID: ${result.id}`);
    console.log(`   페이지 URL: https://notion.so/${result.id.replace(/-/g, '')}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 동기화 성공!\n');
    console.log('💡 Notion에서 확인해보세요:');
    console.log(`   - 데이터베이스: GitHub Commits`);
    console.log(`   - 페이지 제목: ${new Date(commitData.date).toLocaleDateString('ko-KR')} - ${commitData.title}`);
    console.log('\n📋 페이지 구성:');
    console.log('   📅 커밋 날짜');
    console.log('   👤 작성자');
    console.log('   📝 커밋 내용');
    console.log('   💡 커밋 이유 (본문이 있는 경우)');
    console.log('   📁 변경된 파일 목록');
    console.log('   🔗 GitHub 링크\n');

  } catch (error: any) {
    console.error('\n❌ 동기화 실패:', error.message);
    if (error.body) {
      console.error('상세 오류:', JSON.stringify(error.body, null, 2));
    }
    process.exit(1);
  }
}

testCommitSync();
