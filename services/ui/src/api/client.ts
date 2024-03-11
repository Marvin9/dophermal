import {MutationCache, QueryCache, QueryClient} from '@tanstack/react-query';
import {toast} from '@ui/components/shared/ui/use-toast';
import {errorToString} from '@ui/lib/utils';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const meta = new ReactQueryMeta(query?.meta);
      if (!meta.ignoreErrorToast)
        toast({
          title: 'API Error',
          description: errorToString(error),
          variant: 'destructive',
        });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) =>
      toast({
        title: 'API Error',
        description: errorToString(error),
        variant: 'destructive',
      }),
  }),
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export class ReactQueryMeta {
  ignoreErrorToast?: boolean;

  constructor(meta?: Record<string, unknown>) {
    this.ignoreErrorToast = Boolean(meta?.ignoreErrorToast);
  }

  withOptIgnoreErrorToast(value: boolean) {
    this.ignoreErrorToast = value;
    return this;
  }

  build() {
    return {
      ignoreErrorToast: this.ignoreErrorToast,
    };
  }
}
