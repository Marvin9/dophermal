import {Controller, Get} from '@nestjs/common';
import {request} from '@octokit/request';
import {JWTExtractDto} from 'src/auth/jwt-dto.dto';
import {JWTExtractData} from 'src/auth/jwt.decorator';

@Controller('github')
export class GithubController {
  constructor() {}

  @Get('repos')
  async getRepos(@JWTExtractData() userData: JWTExtractDto) {
    const {data} = await request(`GET /users/{username}/repos`, {
      headers: {
        authorization: `token ${userData.githubAccessToken}`,
      },
      username: userData.username,
      type: 'all',
    });

    return data?.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
    }));
  }
}
