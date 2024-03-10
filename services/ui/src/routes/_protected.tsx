import {createFileRoute, Outlet, Navigate} from '@tanstack/react-router';
import {useUserStore} from '@ui/state/user';

const DashboardProtection = () => {
  const authenticated = useUserStore((state) => state.authenticated);

  if (!authenticated) {
    return <Navigate to="/auth/login" />;
  }

  return <Outlet />;
};

export const Route = createFileRoute('/_protected')({
  component: DashboardProtection,
});
