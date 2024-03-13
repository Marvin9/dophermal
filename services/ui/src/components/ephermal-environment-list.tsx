import dayjs from 'dayjs';
import {useMutation, useQuery} from '@tanstack/react-query';
import {queries} from '@ui/api/queries';
import {Route} from '@ui/routes/_protected/_dashboard-layout/dashboard/repo_/$owner/$repoName/pulls/$pull';
import {Spinner} from './shared/spinner';
import ContainerIcon from '@ui/assets/container.svg';
import {Card, CardDescription, CardHeader, CardTitle} from './shared/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './shared/ui/tooltip';
import {useEffect, useState} from 'react';
import clsx from 'clsx';
import {Badge} from './shared/ui/badge';
import {DotFilledIcon, TrashIcon, UpdateIcon} from '@radix-ui/react-icons';
import {CONTAINER_IMAGE_STATUS, ContainerImage} from '@ui/dto';
import config from '@ui/lib/config';
import {getBearer} from '@ui/lib/auth';
import {EventSourcePolyfill, MessageEvent} from 'event-source-polyfill';
import {PushPRContainersStatusUpdateEvent} from '@ui/lib/events';
import {queryClient} from '@ui/api/client';
import {Separator} from './shared/ui/separator';
import {dophermalAxios} from '@ui/api/base';
import {Popover, PopoverContent, PopoverTrigger} from './shared/ui/popover';
import {Button} from './shared/ui/button';
import {useToast} from './shared/ui/use-toast';

export const EphermalEnvironmentList = () => {
  const {repoName, pull} = Route.useParams();

  const {toast} = useToast();

  const {data: ephermalEnv, isLoading: ephermalEnvLoading} = useQuery({
    ...queries.container.listByPullRequest(repoName, Number(pull)),
    enabled: !!repoName && !!Number(pull),
  });

  const {mutate: deleteContainerImage, isPending: pendingDeleteContainerImage} =
    useMutation({
      mutationFn: async (containerId: string) => {
        return dophermalAxios.delete(`/container-image/${containerId}`);
      },
      onSuccess: () => {
        toast({
          title: 'Terminating ephermal preview',
        });
      },
    });

  const [selectedEphermal, setSelectedEphermal] = useState<string | null>();

  const selectedEphermalPayload = ephermalEnv?.find(
    (env) => env?.id === selectedEphermal,
  );

  let shouldShowLogs = true;

  switch (selectedEphermalPayload?.status) {
    case CONTAINER_IMAGE_STATUS.RUNNING:
    case CONTAINER_IMAGE_STATUS.INITIATED:
      shouldShowLogs = false;
  }

  const {
    data: selectedEphermalLogs,
    isLoading: isSelectedEphermalLogsLoading,
    error: ephermalLogsError,
    refetch: refreshLogs,
    isRefetching: refetchingLogs,
  } = useQuery({
    ...queries.container.logsUrl(selectedEphermalPayload?.id || ''),
    enabled: !!selectedEphermalPayload?.id && shouldShowLogs,
    placeholderData: '',
  });

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

  if (ephermalEnvLoading) {
    return <Spinner withWrapper />;
  }

  if (!ephermalEnv?.length) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <div>
          <img src={ContainerIcon} alt="container" className="w-96" />
          <h4 className="text-center mt-10 font-light text-lg">
            No ephermal found.
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mt-10 gap-10 h-full">
      <div className="w-4/12">
        {ephermalEnv.map((environment) => (
          <Card
            key={environment.id}
            className={clsx(
              {
                'border-card-foreground': selectedEphermal === environment.id,
              },
              'cursor-pointer mb-5',
            )}
            onClick={() => setSelectedEphermal(environment.id)}
          >
            <CardHeader>
              <CardTitle>Id: {environment.id}</CardTitle>
              <CardDescription>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p>created {dayjs(environment.createdAt).fromNow()}</p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start">
                      {environment.createdAt}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Separator orientation="vertical" />
      {!!selectedEphermalPayload?.id && (
        <div className="w-full">
          <div className="flex items-center w-full">
            <div>
              <h3 className="text-xl font-light">
                🐳 &nbsp;&nbsp;{selectedEphermalPayload?.id}
              </h3>
              <Badge className={'mt-5'}>
                <DotFilledIcon
                  className={clsx('scale-150 mr-1', {
                    'text-green-600':
                      selectedEphermalPayload.status ===
                      CONTAINER_IMAGE_STATUS.RUNNING,
                    'text-yellow-600':
                      selectedEphermalPayload.status ===
                        CONTAINER_IMAGE_STATUS.INITIATED ||
                      selectedEphermalPayload.status ===
                        CONTAINER_IMAGE_STATUS.IN_PROGRESS ||
                      selectedEphermalPayload.status ===
                        CONTAINER_IMAGE_STATUS.TERMINATING_IN_PROGRESS,
                    'text-red-600':
                      selectedEphermalPayload.status ===
                        CONTAINER_IMAGE_STATUS.ERROR ||
                      selectedEphermalPayload.status ===
                        CONTAINER_IMAGE_STATUS.TERMINATED,
                  })}
                />
                {selectedEphermalPayload.status?.toLowerCase()}
              </Badge>
            </div>

            {selectedEphermalPayload.status ===
              CONTAINER_IMAGE_STATUS.RUNNING && (
              <Popover>
                <PopoverTrigger className="ml-auto">
                  <TrashIcon className="text-red-600 scale-150" />
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm">
                    This action will terminate ephermal environment. You cannot
                    restart once terminated.
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-4"
                    onClick={() =>
                      deleteContainerImage(selectedEphermalPayload.id)
                    }
                  >
                    {pendingDeleteContainerImage && (
                      <Spinner className="mr-2" />
                    )}
                    Terminate
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <Button
            size="sm"
            className="mt-2"
            onClick={() => refreshLogs()}
            disabled={refetchingLogs}
          >
            {refetchingLogs ? <Spinner /> : <UpdateIcon className="mr-2" />}
            Refresh Logs
          </Button>
          {!isSelectedEphermalLogsLoading &&
            !ephermalLogsError &&
            !!selectedEphermalLogs && (
              <div className="bg-card-foreground text-accent p-5 rounded-sm text-xs font-light mt-5 font-mono">
                {selectedEphermalLogs?.split('\n').map((line, idx) => (
                  <p key={idx} className="my-1">
                    {line}
                  </p>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
};
