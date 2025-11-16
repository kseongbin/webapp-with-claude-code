import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getPushEvents(owner: string, repo: string, page: number = 1) {
    try {
      const response = await this.octokit.repos.listCommits({
        owner,
        repo,
        page,
        per_page: 10,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching push events:', error);
      throw error;
    }
  }

  async getCommitDetails(owner: string, repo: string, sha: string) {
    try {
      const response = await this.octokit.repos.getCommit({
        owner,
        repo,
        ref: sha,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching commit details:', error);
      throw error;
    }
  }

  async getRepoInfo(owner: string, repo: string) {
    try {
      const response = await this.octokit.repos.get({
        owner,
        repo,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching repo info:', error);
      throw error;
    }
  }
}
