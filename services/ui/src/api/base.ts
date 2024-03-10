import {getBearer} from '@ui/lib/auth';
import config from '@ui/lib/config';
import axios from 'axios';

export const dophermalAxios = axios.create({
  baseURL: config.DOPHERMAL_API,
});

dophermalAxios.interceptors.request.use((config) => {
  const bearer = getBearer();

  if (bearer) {
    config.headers.Authorization = `Bearer ${bearer}`;
  }

  return config;
});
