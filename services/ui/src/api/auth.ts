import {createQueryKeys} from '@lukemorales/query-key-factory';
import {dophermalAxios} from './base';
import {User} from '@ui/dto';

export const auth = createQueryKeys('auth', {
  info: () => ({
    queryKey: ['user-by-token'],
    queryFn: dophermalAxios.get<User>('/auth/info'),
  }),
});
