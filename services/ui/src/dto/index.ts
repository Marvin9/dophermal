export type User = {
  id: number;
  email: string;
  username: string;
};

export type OAuth2GithubConf = {
  clientID: string;
  scope: string[];
};

export type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
};

export type GithubPullRequest = {
  id: number;
  html_url: string;
  number: number;
  title: string;
  user: {
    login: string;
  };
  created_at: string;
};

export enum CONTAINER_IMAGE_STATUS {
  INITIATED = 'INITIATED',
  IN_PROGRESS = 'IN_PROGRESS',
  RUNNING = 'RUNNING',
  ERROR = 'ERROR',
  TERMINATING_IN_PROGRESS = 'TERMINATING_IN_PROGRESS',
  TERMINATED = 'TERMINATED',
  UNKNOWN = 'UNKNOWN',
}

export type ContainerConfig = {
  id: string;
  port: number;
  keyValueEnv: Record<string, string>;
  createdBy: User;
};

export type ContainerImage = {
  id: string;
  pullImageUrl: string;
  pullRequestNumber: number;
  githubRepoName: string;
  createdBy: User;
  status: CONTAINER_IMAGE_STATUS;
  createdAt: string;
  updatedAt: string;
  containerConfig: ContainerConfig;
};
