import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {GithubService} from 'src/github/github.service';
import {UserService} from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly githubService: GithubService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AuthGuard('github'))
  @Get('login')
  async login() {}

  @Get('callback')
  async callback(@Query('code') code) {
    if (code) {
      const accessToken = await this.githubService.getGithubAccessToken(code);
      const user = await this.githubService.getUserFromAccessToken(accessToken);

      const userExists = await this.userService.findOne({id: user?.id});

      if (!userExists) {
        await this.userService.insert({
          id: user.id,
          email: user.email,
          username: user.name,
        });
      }
    }
  }
}
