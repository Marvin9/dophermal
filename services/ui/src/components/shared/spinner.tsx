import {cn} from '@ui/lib/utils';

export const Spinner = ({
  className,
  withWrapper,
  wrapperClassName,
}: {
  className?: string;
  withWrapper?: boolean;
  wrapperClassName?: string;
}) => {
  const Icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );

  if (withWrapper) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full w-full',
          wrapperClassName,
        )}
      >
        {Icon}
      </div>
    );
  }

  return Icon;
};
