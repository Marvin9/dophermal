import type {CONTAINER_IMAGE_STATUS} from 'src/container-image/container-image.entity';

export const events = {
  'poll.container-status-update': 'poll.container-status-update',
};

export class PollContainerStatusUpdateEvent {
  queueUrl: string;
}

export class StatusQueueDto {
  containerName: string;
  status: CONTAINER_IMAGE_STATUS;
  hostPort: string;
}
