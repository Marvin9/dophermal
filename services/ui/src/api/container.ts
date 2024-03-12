import {createQueryKeys} from '@lukemorales/query-key-factory';
import {dophermalAxios} from './base';
import {ContainerImage} from '@ui/dto';

export const container = createQueryKeys('container', {
  listByPullRequest: (repo: string, pr: number) => ({
    queryKey: [repo, pr],
    queryFn: () =>
      dophermalAxios
        .get(`/container-image/repo/${repo}/pr/${pr}`)
        .then((res) => res.data as Array<ContainerImage>),
  }),
});
