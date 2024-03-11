import {MutationCache, QueryCache, QueryClient} from '@tanstack/react-query';
import {toast} from '@ui/components/shared/ui/use-toast';
import {errorToString} from '@ui/lib/utils';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) =>
      toast({
        title: 'API Error',
        description: errorToString(error),
        variant: 'destructive',
      }),
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
