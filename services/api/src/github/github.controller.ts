import {Controller, Get, Logger, Param} from '@nestjs/common';
import {request} from '@octokit/request';
import {JWTExtractDto} from 'src/auth/jwt-dto.dto';
import {JWTExtractData} from 'src/auth/jwt.decorator';
import {GithubPullRequest, GithubRepo} from './github.entity';

@Controller('github')
export class GithubController {
  private logger = new Logger(GithubController.name);
  constructor() {}

  @Get('repos')
  async getRepos(@JWTExtractData() userData: JWTExtractDto) {
    const {data} = await request(`GET /user/repos`, {
      headers: {
        authorization: `token ${userData.githubAccessToken}`,
      },
      username: userData.username,
      type: 'all',
      sort: 'created',
      per_page: 10,
    });

    const filteredRepo: typeof data = [];

    for (const repo of data) {
      try {
        const {data: lang} = await request(
          'GET /repos/{owner}/{repo}/languages',
          {
            headers: {
              authorization: `token ${userData.githubAccessToken}`,
            },
            owner: repo.owner.login,
            repo: repo.name,
          },
        );

        if (Boolean(lang.Dockerfile)) {
          filteredRepo.push(repo);
        }
      } catch (e) {
        this.logger.error(`getting language of repo ${repo.full_name}:\n${e}`);
      }
    }

    return filteredRepo.map((repo) => {
      const repoDto = new GithubRepo();

      repoDto.id = repo.id;
      repoDto.name = repo.name;
      repoDto.full_name = repo.full_name;
      repoDto.html_url = repo.html_url;

      return repoDto;
    });
  }

  @Get('repos/:owner/:name')
  async getRepo(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('name') repoName: string,
    @Param('owner') owner: string,
  ) {
    const {data} = await request('GET /repos/{owner}/{repo}', {
      headers: {
        authorization: `token ${userData.githubAccessToken}`,
      },
      owner,
      repo: repoName,
    });

    const repoDto = new GithubRepo();

    repoDto.id = data.id;
    repoDto.full_name = data.full_name;
    repoDto.html_url = data.html_url;
    repoDto.name = data.name;

    return repoDto;
  }

  @Get('repos/:owner/:name/pulls')
  async getRepoPullRequests(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('name') repoName: string,
    @Param('owner') owner: string,
  ) {
    const {data} = await request('GET /repos/{owner}/{repo}/pulls', {
      headers: {
        authorization: `token ${userData.githubAccessToken}`,
      },
      owner,
      repo: repoName,
      sort: 'created',
    });

    return data.map((pr) => {
      const prDto = new GithubPullRequest();

      prDto.id = pr.id;
      prDto.created_at = pr.created_at;
      prDto.html_url = pr.html_url;
      prDto.number = pr.number;
      prDto.title = pr.title;
      prDto.user = pr.user;

      return prDto;
    });
  }

  @Get('repos/:owner/:name/pulls/:pull')
  async getPullRequest(
    @JWTExtractData() userData: JWTExtractDto,
    @Param('owner') owner: string,
    @Param('name') repo: string,
    @Param('pull') pull: number,
  ) {
    const {data} = await request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}',
      {
        headers: {
          authorization: `token ${userData.githubAccessToken}`,
        },
        owner,
        repo,
        pull_number: pull,
      },
    );

    const prDto = new GithubPullRequest();

    prDto.id = data.id;
    prDto.created_at = data.created_at;
    prDto.html_url = data.html_url;
    prDto.number = data.number;
    prDto.title = data.title;
    prDto.user = data.user;

    return prDto;
  }
}
