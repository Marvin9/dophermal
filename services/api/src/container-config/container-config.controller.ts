import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {JWTUser} from 'src/auth/jwt.decorator';
import {
  ContainerConfigDto,
  RepoLevelContainerConfigDto,
} from './container-config.dto';
import {ContainerConfigService} from './container-config.service';
import {User} from 'src/user/user.entity';

@Controller('container-config')
export class ContainerConfigController {
  constructor(private containerConfigService: ContainerConfigService) {}

  @Post()
  createConfig(
    @JWTUser() user: User,
    @Body() containerConfigDto: ContainerConfigDto,
  ) {
    return this.containerConfigService.createConfig(containerConfigDto, user);
  }

  @Get()
  listConfig(@JWTUser() user: User) {
    return this.containerConfigService.listConfig(user);
  }

  @Post('repo')
  createRepoConfig(
    @JWTUser() user: User,
    @Body() repoLevelContainerConfigDto: RepoLevelContainerConfigDto,
  ) {
    return this.containerConfigService.createRepoConfig(
      repoLevelContainerConfigDto,
      user,
    );
  }

  @Get('repo/:repoId')
  listRepoConfig(@JWTUser() user: User, @Param('repoId') repoId: string) {
    return this.containerConfigService.listRepoConfig(user, repoId);
  }
}
