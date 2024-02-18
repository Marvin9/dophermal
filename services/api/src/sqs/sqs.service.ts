import {
  GetQueueUrlCommand,
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {EventEmitter2} from '@nestjs/event-emitter';
import {ContainerImageService} from 'src/container-image/container-image.service';
import {ContainerConfigDto} from 'src/container-config/container-config.dto';
import {SendContainerStartCommandDto, SendContainerStopCommandDto} from './dto';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private sqsClient: SQSClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly containerImageSvc: ContainerImageService,
  ) {
    this.sqsClient = new SQSClient({
      region: configService.get('aws.region'),
      credentials: {
        accessKeyId: configService.get('aws.accessKeyId'),
        secretAccessKey: configService.get('aws.accessKeySecret'),
        sessionToken: configService.get('aws.sessionToken'),
      },
    });
  }

  getQueueUrl(queueName: string) {
    return this.sqsClient
      .send(
        new GetQueueUrlCommand({
          QueueName: queueName,
        }),
      )
      .then((output) => output.QueueUrl);
  }

  async sendContainerStartCommand(
    id: string,
    pullImage: string,
    containerConfig: ContainerConfigDto,
  ) {
    const controllerQueueUrl = await this.getQueueUrl(
      this.configService.get('sqs.controllerQueue'),
    );

    const payload = new SendContainerStartCommandDto();

    payload.command = 'CREATE';
    payload.createContainerPayload = {
      id,
      pullImage,
      containerConfig,
    };

    return this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: controllerQueueUrl,
        MessageBody: JSON.stringify(payload),
      }),
    );
  }

  async sendContainerStopCommand(
    // note that the id (uuid of ContainerImage entity) is equal to container name we are supposed to give to controller
    id: string,
  ) {
    const controllerQueue = await this.getQueueUrl(
      this.configService.get('sqs.controllerQueue'),
    );

    const payload = new SendContainerStopCommandDto();

    payload.command = 'REMOVE';
    payload.removeContainerPayload = {
      containerName: id,
    };

    return this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: controllerQueue,
        // check controller/queue/dto.go ControllerQueueOnReceiveDto
        MessageBody: JSON.stringify(payload),
      }),
    );
  }
}
