import {createRootRoute, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/router-devtools';
import {Toaster} from '@ui/components/shared/ui/toaster';

const Root = () => {
  return (
    <>
      <Outlet />
      <Toaster />
      {/* TODO */}
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({
  component: Root,
});
