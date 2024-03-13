import {DotFilledIcon} from '@radix-ui/react-icons';
import {CONTAINER_IMAGE_STATUS} from '@ui/dto';
import {cn} from '@ui/lib/utils';

export const StatusDot = ({
  status,
  className,
}: {
  status: CONTAINER_IMAGE_STATUS;
  className?: string;
}) => (
  <DotFilledIcon
    className={cn(
      'scale-150',
      {
        'text-green-600': status === CONTAINER_IMAGE_STATUS.RUNNING,
        'text-yellow-600':
          status === CONTAINER_IMAGE_STATUS.INITIATED ||
          status === CONTAINER_IMAGE_STATUS.IN_PROGRESS ||
          status === CONTAINER_IMAGE_STATUS.TERMINATING_IN_PROGRESS,
        'text-red-600':
          status === CONTAINER_IMAGE_STATUS.ERROR ||
          status === CONTAINER_IMAGE_STATUS.TERMINATED,
      },
      className,
    )}
  />
);
