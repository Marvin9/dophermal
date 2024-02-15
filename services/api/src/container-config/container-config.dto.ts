export class ContainerConfigDto {
  port: number;
  keyValueEnv: Record<string, string>;
}

export class RepoLevelContainerConfigDto {
  id: string;
  config: ContainerConfigDto;
}
