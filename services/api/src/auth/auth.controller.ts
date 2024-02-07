import {Controller, Get, Query, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {GithubService} from 'src/github/github.service';
import {UserService} from 'src/user/user.service';
import {AuthService} from './auth.service';
import {PublicRoute} from 'src/shared/public-route';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly githubService: GithubService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('github'))
  @PublicRoute()
  @Get('login')
  async login() {}

  @Get('callback')
  @PublicRoute()
  async callback(@Query('code') code) {
    if (code) {
      const accessToken = await this.githubService.getGithubAccessToken(code);
      const user = await this.githubService.getUserFromAccessToken(accessToken);

      const userExists = await this.userService.findOne({id: user?.id});

      const newOrExistingUser = userExists || {
        id: user.id,
        email: user.email,
        username: user.name,
      };

      if (!userExists) {
        await this.userService.insert(newOrExistingUser);
      }

      return this.authService.login(newOrExistingUser, accessToken);
    }
  }
}
