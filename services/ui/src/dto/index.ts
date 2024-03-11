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
