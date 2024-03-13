import {HomeIcon} from '@radix-ui/react-icons';
import {useQuery} from '@tanstack/react-query';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {queryClient} from '@ui/api/client';
import {queries} from '@ui/api/queries';
import {EphermalEnvironmentList} from '@ui/components/ephermal-environment-list';
import {Spinner} from '@ui/components/shared/spinner';
import {ContainerImage} from '@ui/dto';
import {getBearer} from '@ui/lib/auth';
import config from '@ui/lib/config';
import {PushPRContainersStatusUpdateEvent} from '@ui/lib/events';
import {withRouteSearchValidation} from '@ui/lib/utils';
import {EventSourcePolyfill, MessageEvent} from 'event-source-polyfill';
import {useEffect} from 'react';

const useManageContainerImages = () => {
  const navigate = useNavigate();

  const {selectedEphermalId} = Route.useSearch();

  const {data: containerImages, isLoading: containerImagesLoading} = useQuery(
    queries.container.list(),
  );

  const setSelectedEphermal = (id: string) => {
    navigate({
      search: {
        selectedEphermalId: id,
      },
    });
  };

  useEffect(() => {
    if (!selectedEphermalId) {
      return;
    }

    const watchPRContainerStatus = new EventSourcePolyfill(
      `${config.DOPHERMAL_API}/container-image/${selectedEphermalId}/watch`,
      {
        headers: {
          Authorization: `Bearer ${getBearer()}`,
        },
      },
    );

    const handler = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as PushPRContainersStatusUpdateEvent;

      queryClient.setQueryData(
        queries.container.list().queryKey,
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
  }, [selectedEphermalId]);

  return {
    containerImages,
    containerImagesLoading,
    selectedEphermalId,
    setSelectedEphermal,
  };
};

const Ephermals = () => {
  const {
    containerImages,
    containerImagesLoading,
    selectedEphermalId,
    setSelectedEphermal,
  } = useManageContainerImages();

  if (containerImagesLoading) {
    return <Spinner withWrapper />;
  }

  return (
    <>
      <h1 className="text-2xl font-semibold flex items-center gap-4">
        <HomeIcon className="scale-125" />
        Your Existing Ephermal Environments
      </h1>

      <EphermalEnvironmentList
        ephermalEnv={containerImages || []}
        onSelectEphermal={setSelectedEphermal}
        selectedEphermalId={selectedEphermalId || ''}
        showParentLink
      />
    </>
  );
};

export const Route = createFileRoute(
  '/_protected/_dashboard-layout/dashboard/ephermals',
)({
  component: Ephermals,
  validateSearch: withRouteSearchValidation.selectedEphermalId,
});
