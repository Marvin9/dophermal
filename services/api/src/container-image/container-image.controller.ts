import {
  Body,
  Controller,
  Delete,
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
import {ContainerConfigService} from 'src/container-config/container-config.service';
import {CONTAINER_IMAGE_STATUS} from './container-image.entity';

@Controller('container-image')
export class ContainerImageController {
  constructor(
    private containerImageService: ContainerImageService,
    private containerConfigService: ContainerConfigService,
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

  @Get('/:id')
  async getById(@JWTUser() user: User, @Param('id') containerImageId: string) {
    return this.containerImageService.getByImageId(user, containerImageId);
  }

  @Get('repo/:repo/pr/:pr')
  async listByPullRequest(
    @JWTUser() user: User,
    @Param('repo') repo: string,
    @Param('pr') prNumber: number,
  ) {
    return this.containerImageService.getByPullRequest(user, repo, prNumber);
  }

  @Delete('repo/:repo/pr/:pr')
  async deleteByPullRequest(
    @JWTUser() user: User,
    @Param('repo') repo: string,
    @Param('pr') prNumber: number,
  ) {
    const containerImage = await this.containerImageService.getByPullRequest(
      user,
      repo,
      prNumber,
    );

    if (!containerImage?.length) {
      throw new HttpException(
        `image does not exist on repo ${repo} and for PR ${prNumber}`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.containerImageService.batchUpdateImageStatus(
      containerImage.map((img) => img.id),
      CONTAINER_IMAGE_STATUS.TERMINATING_IN_PROGRESS,
    );

    for (const img of containerImage) {
      this.sqsSvc.sendContainerStopCommand(img.id);
    }
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

    const containerConfig = await this.containerConfigService.getConfigById(
      user,
      containerImage?.containerConfigurationId,
    );

    if (!containerConfig) {
      throw new HttpException(
        `Container config ${containerImage?.containerConfigurationId} does not exist please create it first`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const newContainerImage = await this.containerImageService.createImage(
      containerImage,
      user,
    );

    newContainerImage.containerConfig = containerConfig;

    this.sqsSvc.sendContainerStartCommand(
      newContainerImage.id,
      newContainerImage.pullImageUrl,
      newContainerImage.containerConfig,
    );

    return newContainerImage;
  }

  @Delete('/:id')
  async delete(@JWTUser() user: User, @Param('id') containerImageId: string) {
    const containerImage = await this.containerImageService.getByImageId(
      user,
      containerImageId,
    );

    if (!containerImage) {
      throw new HttpException(`image does not exists`, HttpStatus.BAD_REQUEST);
    }

    if (containerImage?.status !== CONTAINER_IMAGE_STATUS.RUNNING) {
      throw new HttpException(
        `image not running but is in ${containerImage?.status} state`,
        HttpStatus.CONFLICT,
      );
    }

    await this.containerImageService.updateImageStatus(
      containerImageId,
      CONTAINER_IMAGE_STATUS.TERMINATING_IN_PROGRESS,
    );

    this.sqsSvc.sendContainerStopCommand(containerImageId);
  }
}
