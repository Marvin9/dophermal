import config from './config';

export const getBearer = () => sessionStorage.getItem(config.bearerTokenKey);

export const setBearer = (token: string) =>
  sessionStorage.setItem(config.bearerTokenKey, token);

export const removeBearer = () =>
  sessionStorage.removeItem(config.bearerTokenKey);
