import {createQueryKeys} from '@lukemorales/query-key-factory';
import {dophermalAxios} from './base';
import {GithubPullRequest, GithubRepo} from '@ui/dto';

export const github = createQueryKeys('github', {
  repos: () => ({
    queryKey: ['list'],
    queryFn: () =>
      dophermalAxios
        .get('/github/repos')
        .then((res) => res.data as Array<GithubRepo>),
  }),
  repo: (owner: string, name: string) => ({
    queryKey: [owner, name],
    queryFn: () =>
      dophermalAxios
        .get(`/github/repos/${owner}/${name}`)
        .then((res) => res.data as GithubRepo),
  }),
  prs: (owner: string, repo: string) => ({
    queryKey: [owner, repo],
    queryFn: () =>
      dophermalAxios
        .get(`/github/repos/${owner}/${repo}/pulls`)
        .then((res) => res.data as Array<GithubPullRequest>),
  }),
  pr: (owner: string, repo: string, pr: number) => ({
    queryKey: [owner, repo, pr],
    queryFn: () =>
      dophermalAxios
        .get(`/github/repos/${owner}/${repo}/pulls/${pr}`)
        .then((res) => res.data as GithubPullRequest),
  }),
});
