import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import {GetObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {ContainerImageService} from './container-image.service';
import {JWTUser} from 'src/auth/jwt.decorator';
import {ContainerImageDto} from './container-image.dto';
import {User} from 'src/user/user.entity';
import {SqsService} from 'src/sqs/sqs.service';
import {ContainerConfigService} from 'src/container-config/container-config.service';
import {CONTAINER_IMAGE_STATUS} from './container-image.entity';
import {Observable, fromEvent, map} from 'rxjs';
import {EventEmitter2} from '@nestjs/event-emitter';
import {
  PushContainerStatusUpdateEvent,
  PushPRContainersStatusUpdateEvent,
  events,
} from './events';
import {ConfigService} from '@nestjs/config';

@Controller('container-image')
export class ContainerImageController {
  private s3Client: S3Client;
  private logger = new Logger(ContainerImageController.name);
  constructor(
    private containerImageService: ContainerImageService,
    private containerConfigService: ContainerConfigService,
    private readonly sqsSvc: SqsService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: configService.get('aws.region'),
      credentials: {
        accessKeyId: configService.get('aws.accessKeyId'),
        secretAccessKey: configService.get('aws.accessKeySecret'),
        sessionToken: configService.get('aws.sessionToken'),
      },
    });
  }

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

  @Sse(':id/watch')
  async watchContainerImageStatus(
    @JWTUser() userData: User,
    @Param('id') id: string,
  ): Promise<Observable<MessageEvent>> {
    // check if user is authorized
    const canAccess = await this.containerImageService.ownershipCheck(
      userData,
      id,
    );

    if (!canAccess) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return fromEvent(
      this.eventEmitter,
      events['push.container-status-update'](id),
    ).pipe(
      map((data: PushContainerStatusUpdateEvent) => {
        this.logger.debug(`sending to connection ${JSON.stringify(data)}`);
        return {data} as MessageEvent;
      }),
    );
  }

  @Sse('/repo/:repo/pr/:pr/watch')
  async watchContainerImagesStatus(
    @JWTUser() userData: User,
    @Param('repo') repo: string,
    @Param('pr') pr: number,
  ): Promise<Observable<MessageEvent>> {
    // check if user is authorized
    const canAccess =
      await this.containerImageService.pullRequestOwnershipCheck(
        userData,
        repo,
        pr,
      );

    if (!canAccess) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return fromEvent(
      this.eventEmitter,
      events['push.pr-container-status-update'](repo, pr),
    ).pipe(
      map((data: PushPRContainersStatusUpdateEvent) => {
        this.logger.debug(`sending to connection ${JSON.stringify(data)}`);
        return {data} as MessageEvent;
      }),
    );
  }

  @Get(':id/s3-logs')
  async getLogsUrl(
    @JWTUser() user: User,
    @Param('id') containerImageId: string,
  ) {
    const ownershipCheck = await this.containerImageService.ownershipCheck(
      user,
      containerImageId,
    );

    if (!ownershipCheck) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    let logs = '';
    try {
      const getCommand = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.configService.get('s3.bucketName'),
          Key: `logs/${containerImageId}`,
        }),
      );

      logs = await getCommand.Body.transformToString();
    } catch (e) {}

    return logs;
  }
}
