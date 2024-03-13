import dayjs from 'dayjs';
import {useMutation, useQuery} from '@tanstack/react-query';
import {queries} from '@ui/api/queries';
import {Spinner} from './shared/spinner';
import NoDataIcon from '@ui/assets/no-data.svg';
import ContainerIcon from '@ui/assets/container.svg';
import {Card, CardDescription, CardHeader, CardTitle} from './shared/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './shared/ui/tooltip';
import clsx from 'clsx';
import {Badge} from './shared/ui/badge';
import {TrashIcon, UpdateIcon} from '@radix-ui/react-icons';
import {CONTAINER_IMAGE_STATUS, ContainerImage} from '@ui/dto';
import {Separator} from './shared/ui/separator';
import {dophermalAxios} from '@ui/api/base';
import {Popover, PopoverContent, PopoverTrigger} from './shared/ui/popover';
import {Button} from './shared/ui/button';
import {useToast} from './shared/ui/use-toast';
import {StatusDot} from './shared/status-dot';
import {useUserStore} from '@ui/state/user';
import {Link} from '@tanstack/react-router';

export type EphermalEnvironmentListProps = {
  ephermalEnv: ContainerImage[];
  selectedEphermalId: string;
  onSelectEphermal(id: string): void;
  showParentLink?: boolean;
};

export const EphermalEnvironmentList = (
  props: EphermalEnvironmentListProps,
) => {
  const {user} = useUserStore();
  const {toast} = useToast();

  const ephermalEnv = props.ephermalEnv;

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

  const selectedEphermal = props.selectedEphermalId;

  const selectedEphermalPayload = ephermalEnv?.find(
    (env) => env?.id === selectedEphermal,
  );

  let shouldShowLogs = true;

  switch (selectedEphermalPayload?.status) {
    case CONTAINER_IMAGE_STATUS.IN_PROGRESS:
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
    ...queries.container.logs(
      selectedEphermalPayload?.id || '',
      selectedEphermalPayload?.status || CONTAINER_IMAGE_STATUS.UNKNOWN,
    ),
    enabled: !!selectedEphermalPayload?.id && shouldShowLogs,
    placeholderData: (oldData) => oldData || '',
  });

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
            onClick={() => props.onSelectEphermal(environment.id)}
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

      <Separator orientation="vertical" className="h-full" />

      {!!selectedEphermalPayload?.id && (
        <div className="w-full h-fit">
          <div className="flex items-center w-full">
            <div>
              <h3 className="text-xl font-light">
                🐳 &nbsp;&nbsp; {selectedEphermalPayload?.pullImageUrl}
              </h3>
              <h5 className="mt-2 text-sm">{selectedEphermalPayload?.id}</h5>
              {props.showParentLink && (
                <>
                  <h3 className="text-xs mt-2">
                    <b>Repo</b>: {selectedEphermalPayload.githubRepoName}
                  </h3>
                  <h3 className="text-xs mt-1">
                    <b>PR</b>:{' '}
                    <Link
                      className="underline text-blue-600"
                      target="__blank"
                      to="/dashboard/repo/$owner/$repoName/pulls/$pull"
                      params={{
                        owner: user?.username || '',
                        repoName: selectedEphermalPayload.githubRepoName,
                        pull: selectedEphermalPayload.pullRequestNumber + '',
                      }}
                      search={{
                        selectedEphermalId: selectedEphermalPayload.id,
                      }}
                    >
                      {selectedEphermalPayload.pullRequestNumber}
                    </Link>
                  </h3>
                </>
              )}
              <h5 className="text-xs font-light mt-2">
                Last update{' '}
                {dayjs(selectedEphermalPayload?.updatedAt).fromNow()}
              </h5>
              <Badge className={'mt-5'} variant="outline">
                <StatusDot
                  status={selectedEphermalPayload?.status}
                  className="mr-1"
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

          <div className="flex w-full">
            <Button
              size="sm"
              className="mt-2 ml-auto"
              onClick={() => refreshLogs()}
              disabled={refetchingLogs && !shouldShowLogs}
            >
              {refetchingLogs ? <Spinner /> : <UpdateIcon className="mr-2" />}
              Refresh Logs
            </Button>
          </div>
          {!selectedEphermalLogs && !isSelectedEphermalLogsLoading && (
            <div className="flex w-full mt-20 items-center justify-center text-center">
              <div>
                <img src={NoDataIcon} alt="no data" className="w-32" />
                <span className="text-xs font-light">No logs found...</span>
              </div>
            </div>
          )}
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
