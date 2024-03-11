import {useUserStore} from '@ui/state/user';
import config from './config';
import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {queries} from '@ui/api/queries';

export const getBearer = () => sessionStorage.getItem(config.bearerTokenKey);

export const setBearer = (token: string) =>
  sessionStorage.setItem(config.bearerTokenKey, token);

export const removeBearer = () =>
  sessionStorage.removeItem(config.bearerTokenKey);

export const useManageAuth = () => {
  const [authenticated, login] = useUserStore((state) => [
    state.authenticated,
    state.login,
  ]);

  const {data: user, isLoading} = useQuery(
    queries.auth.info(getBearer() || ''),
  );

  useEffect(() => {
    if (user) {
      login(user);
    }
  }, [user, login]);

  return {authenticated, isLoading};
};
