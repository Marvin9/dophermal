import {ContainerConfigDto} from 'src/container-config/container-config.dto';

export class SendContainerStartCommandDto {
  command: 'CREATE';
  createContainerPayload: {
    id: string;
    pullImage: string;
    containerConfig: ContainerConfigDto;
  };
}

export class SendContainerStopCommandDto {
  command: 'REMOVE';
  removeContainerPayload: {
    containerName: string;
  };
}
