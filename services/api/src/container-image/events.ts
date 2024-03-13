import {CONTAINER_IMAGE_STATUS} from './container-image.entity';

export const events = {
  'push.container-status-update': (id: string) =>
    `push.container-status-update-${id}`,
  'push.pr-container-status-update': (repo: string, pr: number) =>
    `push.pr-container-status-update-${repo}-${pr}`,
};

export class PushContainerStatusUpdateEvent {
  status: CONTAINER_IMAGE_STATUS;
}

export class PushPRContainersStatusUpdateEvent {
  containerImageId: string;
  status: CONTAINER_IMAGE_STATUS;
}
