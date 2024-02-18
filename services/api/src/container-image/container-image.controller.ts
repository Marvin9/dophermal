import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {ContainerImageService} from './container-image.service';
import {JWTUser} from 'src/auth/jwt.decorator';
import {ContainerImageDto} from './container-image.dto';
import {User} from 'src/user/user.entity';
import {SqsService} from 'src/sqs/sqs.service';

@Controller('container-image')
export class ContainerImageController {
  constructor(
    private containerImageService: ContainerImageService,
    private readonly sqsSvc: SqsService,
  ) {}

  @Get()
  async list(@JWTUser() user: User) {
    return this.containerImageService.listByUser(user);
  }

  @Get('repo/:repo')
  async listByRepo(@JWTUser() user: User, @Param('repo') repo: string) {
    return this.containerImageService.listByRepo(user, repo);
  }

  @Get('/image/:id')
  async getById(@JWTUser() user: User, @Param('id') containerImageId: string) {
    return this.containerImageService.getByImageId(user, containerImageId);
  }

  @Get('repo/:repo/pr/:pr')
  async getByPullRequest(
    @JWTUser() user: User,
    @Param('repo') repo: string,
    @Param('pr') prNumber: number,
  ) {
    return this.containerImageService.getByPullRequest(user, repo, prNumber);
  }

  @Post()
  async create(
    @JWTUser() user: User,
    @Body() containerImage: ContainerImageDto,
  ) {
    const isPullRequestActive =
      await this.containerImageService.isPullRequestActive(
        containerImage.githubRepoName,
        containerImage.pullRequestNumber,
        user,
      );

    if (isPullRequestActive) {
      throw new HttpException(
        `${containerImage.githubRepoName}/${containerImage.pullRequestNumber} has already attached container image`,
        HttpStatus.CONFLICT,
      );
    }

    const newContainerImage = await this.containerImageService.createImage(
      containerImage,
      user,
    );

    this.sqsSvc.sendContainerStartCommand(
      newContainerImage.id,
      newContainerImage.pullImageUrl,
      newContainerImage.containerConfig,
    );

    return newContainerImage;
  }
}
