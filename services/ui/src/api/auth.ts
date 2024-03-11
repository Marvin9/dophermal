import {createQueryKeys} from '@lukemorales/query-key-factory';
import {dophermalAxios} from './base';
import {OAuth2GithubConf, User} from '@ui/dto';

export const auth = createQueryKeys('auth', {
  info: (opts?: {token?: string}) => ({
    queryKey: ['user-by-token', opts?.token],
    queryFn: () =>
      dophermalAxios.get('/auth/info').then((res) => res.data as User),
  }),
  oauth2Github: () => ({
    queryKey: ['client'],
    queryFn: () =>
      dophermalAxios
        .get('/auth/oauth2/github')
        .then((res) => res.data as OAuth2GithubConf),
  }),
});
