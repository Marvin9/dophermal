import {createQueryKeys} from '@lukemorales/query-key-factory';
import {dophermalAxios} from './base';
import {GithubRepo} from '@ui/dto';

export const github = createQueryKeys('github', {
  repos: () => ({
    queryKey: ['list'],
    queryFn: () =>
      dophermalAxios
        .get('/github/repos')
        .then((res) => res.data as Array<GithubRepo>),
  }),
});
