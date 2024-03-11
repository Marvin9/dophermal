export type User = {
  id: number;
  email: string;
  username: string;
};

export type OAuth2GithubConf = {
  clientID: string;
  scope: string[];
};
