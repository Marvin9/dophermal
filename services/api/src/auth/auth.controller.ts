import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {GithubService} from 'src/github/github.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly githubService: GithubService) {}

  @UseGuards(AuthGuard('github'))
  @Get('login')
  async login() {}

  @Get('callback')
  async callback(@Query('code') code) {
    if (code) {
      const accessToken = await this.githubService.getGithubAccessToken(code);
      await this.githubService.getUserFromAccessToken(accessToken);
    }
  }
}
