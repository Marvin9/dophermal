import {CONTAINER_IMAGE_STATUS} from '@ui/dto';

export const events = {
  'push.container-status-update': (id: string) =>
    `push.container-status-update-${id}`,
  'push.pr-container-status-update': (repo: string, pr: number) =>
    `push.pr-container-status-update-${repo}-${pr}`,
};

export interface PushContainerStatusUpdateEvent {
  status: CONTAINER_IMAGE_STATUS;
}

export interface PushPRContainersStatusUpdateEvent {
  containerImageId: string;
  status: CONTAINER_IMAGE_STATUS;
  port: number;
}
