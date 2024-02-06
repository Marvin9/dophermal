import {Injectable} from '@nestjs/common';
import {firstValueFrom} from 'rxjs';
import {HttpService} from '@nestjs/axios';
import {request} from '@octokit/request';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class GithubService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getGithubAccessToken(authorizationCode: string) {
    const {data} = await firstValueFrom(
      this.httpService.post(
        `https://github.com/login/oauth/access_token?client_id=${this.configService.get('github.client_id')}&client_secret=${this.configService.get('github.client_secret')}&code=${authorizationCode}`,
      ),
    );

    return new URLSearchParams(data as string).get('access_token');
  }

  async getUserFromAccessToken(accessToken: string) {
    const {data} = await request('GET /user', {
      headers: {
        authorization: `token ${accessToken}`,
      },
    });
    return data;
  }
}
