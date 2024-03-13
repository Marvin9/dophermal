import {HomeIcon, PlusCircledIcon, SunIcon} from '@radix-ui/react-icons';
import {useMutation, useQuery} from '@tanstack/react-query';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {dophermalAxios} from '@ui/api/base';
import {queries} from '@ui/api/queries';
import {CreateEphermalEnvironment} from '@ui/components/create-ephermal-environment';
import {Spinner} from '@ui/components/shared/spinner';
import {Button} from '@ui/components/shared/ui/button';
import {Separator} from '@ui/components/shared/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@ui/components/shared/ui/sheet';
import {ContainerConfig, ContainerImage} from '@ui/dto';
import {useDisclosure} from '@ui/lib/hooks';
import {EphermalEnvironmentList} from '@ui/components/ephermal-environment-list';
import {queryClient} from '@ui/api/client';
import {useToast} from '@ui/components/shared/ui/use-toast';
import {useEffect} from 'react';
import config from '@ui/lib/config';
import {EventSourcePolyfill, MessageEvent} from 'event-source-polyfill';
import {getBearer} from '@ui/lib/auth';
import {PushPRContainersStatusUpdateEvent} from '@ui/lib/events';
import {withRouteSearchValidation} from '@ui/lib/utils';

const useManageContainerImages = () => {
  const navigate = useNavigate();

  const {selectedEphermalId} = Route.useSearch();
  const {repoName, pull} = Route.useParams();

  const {data: ephermalEnv, isLoading: ephermalEnvLoading} = useQuery({
    ...queries.container.listByPullRequest(repoName, Number(pull)),
    enabled: !!repoName && !!Number(pull),
  });

  const setSelectedEphermal = (id: string) => {
    navigate({
      search: {
        selectedEphermalId: id,
      },
    });
  };

  useEffect(() => {
    const watchPRContainerStatus = new EventSourcePolyfill(
      `${config.DOPHERMAL_API}/container-image/repo/${repoName}/pr/${pull}/watch`,
      {
        headers: {
          Authorization: `Bearer ${getBearer()}`,
        },
      },
    );

    const handler = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as PushPRContainersStatusUpdateEvent;

      queryClient.setQueryData(
        queries.container.listByPullRequest(repoName, Number(pull)).queryKey,
        (currentData: ContainerImage[]) => {
          const updatedData = [...currentData];

          return updatedData.map((image) => {
            return {
              ...image,
              status:
                data.containerImageId === image.id ? data.status : image.status,
            };
          });
        },
      );
    };

    watchPRContainerStatus.addEventListener('message', handler);

    return () => watchPRContainerStatus.close();
  }, [repoName, pull]);

  return {
    ephermalEnv,
    ephermalEnvLoading,
    selectedEphermalId,
    setSelectedEphermal,
  };
};

const PullRequestPage = () => {
  const {owner, repoName, pull} = Route.useParams();

  const {toast} = useToast();

  const {data: pullRequest, isLoading} = useQuery({
    ...queries.github.pr(owner, repoName, Number(pull)),
    enabled: !!owner && !!repoName && !!pull,
  });

  const {open, onOpen, onClose, toggle} = useDisclosure();

  const {mutate: createEphermalEnv, isPending: createEphermalEnvPending} =
    useMutation({
      mutationFn: async (
        vars: Pick<
          ContainerImage,
          'pullImageUrl' | 'pullRequestNumber' | 'githubRepoName'
        > &
          Pick<ContainerConfig, 'port' | 'keyValueEnv'>,
      ) => {
        const {data} = await dophermalAxios.post('/container-config', {
          port: vars.port,
          keyValueEnv: vars.keyValueEnv,
        });

        const containerConfig = data as ContainerConfig;

        return dophermalAxios
          .post('/container-image', {
            pullImageUrl: vars.pullImageUrl,
            pullRequestNumber: vars.pullRequestNumber,
            githubRepoName: vars.githubRepoName,
            containerConfigurationId: containerConfig.id,
          })
          .then((res) => res.data);
      },
      onSuccess: (data) => {
        toast({
          title: `New ephermal created successfully`,
        });

        const updater = (old: ContainerImage[]) => {
          if (Array.isArray(old)) {
            return [data, ...old];
          }

          return [data];
        };

        queryClient.setQueryData(
          queries.container.listByPullRequest(repoName, Number(pull)).queryKey,
          updater,
        );

        queryClient.setQueryData(queries.container.list().queryKey, updater);
      },
    });

  const {
    ephermalEnv,
    ephermalEnvLoading,
    selectedEphermalId,
    setSelectedEphermal,
  } = useManageContainerImages();

  if (isLoading) {
    return <Spinner withWrapper />;
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-5">
        <SunIcon />
        <div>
          <div className="flex items-center gap-5">
            <h3 className="text-lg font-bold">
              <a href={pullRequest?.html_url} target="__blank">
                PR #{pullRequest?.number}
              </a>{' '}
              - {pullRequest?.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground font-light">
            by{' '}
            <a
              href={`https://github.com/${pullRequest?.user?.login}`}
              target="__blank"
            >
              {pullRequest?.user?.login}
            </a>
          </p>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex items-center">
        <h2 className="text-lg font-semibold flex items-center gap-5">
          <HomeIcon />
          Ephermal Environments
        </h2>
        <Sheet open={open} onOpenChange={toggle}>
          <SheetTrigger asChild onClick={onOpen}>
            <Button className="ml-auto" disabled={createEphermalEnvPending}>
              {createEphermalEnvPending ? (
                <Spinner />
              ) : (
                <PlusCircledIcon className="mr-2" />
              )}{' '}
              Create New Ephermal
            </Button>
          </SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>✨ Create New Ephermal</SheetTitle>
            </SheetHeader>

            <Separator className="my-5" />

            <div className="mt-5">
              <CreateEphermalEnvironment
                repeat={
                  ephermalEnv?.length
                    ? {
                        keyValueEnv:
                          ephermalEnv[0]?.containerConfig?.keyValueEnv,
                        port: ephermalEnv[0]?.containerConfig?.port,
                        pullImageUrl: ephermalEnv[0]?.pullImageUrl,
                      }
                    : undefined
                }
                onSubmit={(eph) => {
                  onClose();
                  createEphermalEnv({
                    githubRepoName: repoName,
                    pullRequestNumber: Number(pull),
                    port: eph.port,
                    pullImageUrl: eph.pullImageUrl,
                    keyValueEnv: eph.keyValueEnv,
                  });
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {ephermalEnvLoading && <Spinner withWrapper />}
      {!ephermalEnvLoading && (
        <EphermalEnvironmentList
          ephermalEnv={ephermalEnv || []}
          selectedEphermalId={selectedEphermalId || ''}
          onSelectEphermal={setSelectedEphermal}
        />
      )}
    </div>
  );
};

export const Route = createFileRoute(
  '/_protected/_dashboard-layout/dashboard/repo/$owner/$repoName/pulls/$pull',
)({
  component: PullRequestPage,
  validateSearch: withRouteSearchValidation.selectedEphermalId,
});
