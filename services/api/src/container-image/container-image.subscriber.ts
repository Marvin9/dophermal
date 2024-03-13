import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import {ContainerImage} from './container-image.entity';
import {EventEmitter2} from '@nestjs/event-emitter';
import {PushPRContainersStatusUpdateEvent, events} from './events';
import {Logger} from '@nestjs/common';

@EventSubscriber()
export class ContainerImageStatusSubscriber
  implements EntitySubscriberInterface<ContainerImage>
{
  private readonly logger = new Logger(ContainerImageStatusSubscriber.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return ContainerImage;
  }

  afterUpdate(event: UpdateEvent<ContainerImage>): void | Promise<any> {
    this.logger.debug('UPDATED ENTITY STATUS');
    this.logger.debug(event.entity);

    const payload = new PushPRContainersStatusUpdateEvent();
    payload.status = event.entity.status;
    payload.containerImageId = event.entity.id;

    this.eventEmitter.emit(
      events['push.pr-container-status-update'](
        event.databaseEntity.githubRepoName,
        event.databaseEntity.pullRequestNumber,
      ),
      payload,
    );
  }
}
