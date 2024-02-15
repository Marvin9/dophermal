import {Body, Controller, Post} from '@nestjs/common';
import {JWTExtractDto} from 'src/auth/jwt-dto.dto';
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
    @JWTUser() jwt: JWTExtractDto,
    @Body() containerConfigDto: ContainerConfigDto,
  ) {
    const user = new User();

    user.id = jwt.id;
    user.email = jwt.email;
    user.username = jwt.username;

    return this.containerConfigService.createConfig(containerConfigDto, user);
  }

  @Post('repo')
  createRepoConfig(
    @JWTUser() jwt: JWTExtractDto,
    @Body() repoLevelContainerConfigDto: RepoLevelContainerConfigDto,
  ) {
    const user = new User();

    user.id = jwt.id;
    user.email = jwt.email;
    user.username = jwt.username;

    return this.containerConfigService.createRepoConfig(
      repoLevelContainerConfigDto,
      user,
    );
  }
}
