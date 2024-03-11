import {Module} from '@nestjs/common';
import {SqsService} from './sqs.service';
import {ContainerImageService} from 'src/container-image/container-image.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ContainerImage} from 'src/container-image/container-image.entity';
import {
  DeleteMessageCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import {Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {EventEmitter2, OnEvent} from '@nestjs/event-emitter';
import {PollContainerStatusUpdateEvent, StatusQueueDto, events} from './events';

@Module({
  imports: [TypeOrmModule.forFeature([ContainerImage])],
  providers: [SqsService, ContainerImageService],
})
export class SqsModule {
  private readonly logger = new Logger(SqsService.name);
  private sqsClient: SQSClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly containerImageSvc: ContainerImageService,
  ) {
    if (configService.get('sqs.disable')) {
      this.logger.log('sqs is disabled');
      return;
    }

    this.sqsClient = new SQSClient({
      region: configService.get('aws.region'),
      credentials: {
        accessKeyId: configService.get('aws.accessKeyId'),
        secretAccessKey: configService.get('aws.accessKeySecret'),
        sessionToken: configService.get('aws.sessionToken'),
      },
    });

    this.sqsClient
      .send(
        new GetQueueUrlCommand({
          QueueName: this.configService.get('sqs.statusQueue'),
        }),
      )
      .then((output) => output.QueueUrl)
      .then((queueUrl) => {
        const pollContainerStatusUpdateEvent =
          new PollContainerStatusUpdateEvent();

        pollContainerStatusUpdateEvent.queueUrl = queueUrl;

        eventEmitter.emit(
          events['poll.container-status-update'],
          pollContainerStatusUpdateEvent,
        );
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  @OnEvent(events['poll.container-status-update'])
  async containerStatusUpdateEvent(payload: PollContainerStatusUpdateEvent) {
    if (!payload?.queueUrl) {
      this.logger.error('could not get queue URL. not listening to queue');
      return;
    }

    this.logger.debug('waiting for container status update');

    const messageReceived = await this.sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: payload.queueUrl,
        WaitTimeSeconds: 20,
      }),
    );

    for (const message of messageReceived?.Messages || []) {
      this.sqsClient
        .send(
          new DeleteMessageCommand({
            QueueUrl: payload.queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          }),
        )
        .catch((err) => {
          this.logger.error('error deleting message from sqs', err);
        });

      const body = JSON.parse(message?.Body) as StatusQueueDto;

      if (body?.containerName) {
        this.containerImageSvc
          .updateImageStatus(
            body.containerName,
            body.status,
            body.hostPort ? Number(body.hostPort) : null,
          )
          .catch((err) => {
            this.logger.debug(body);
            this.logger.error('error updating image status', err);
          });
      }
    }

    this.eventEmitter.emit(events['poll.container-status-update'], payload);
  }
}
