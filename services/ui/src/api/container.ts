import {createQueryKeys} from '@lukemorales/query-key-factory';
import {dophermalAxios} from './base';
import {CONTAINER_IMAGE_STATUS, ContainerImage} from '@ui/dto';

export const container = createQueryKeys('container', {
  list: () => ({
    queryKey: ['all'],
    queryFn: () =>
      dophermalAxios
        .get('/container-image')
        .then((res) => res.data as Array<ContainerImage>),
  }),
  listByPullRequest: (repo: string, pr: number) => ({
    queryKey: [repo, pr],
    queryFn: () =>
      dophermalAxios
        .get(`/container-image/repo/${repo}/pr/${pr}`)
        .then((res) => res.data as Array<ContainerImage>),
  }),
  logs: (
    containerImageId: string,
    containerStatus: CONTAINER_IMAGE_STATUS,
  ) => ({
    queryKey: [containerImageId, containerStatus],
    queryFn: () =>
      dophermalAxios
        .get(`/container-image/${containerImageId}/s3-logs`)
        .then((res) => res.data as string),
  }),
});
