import {createFileRoute, Outlet, Navigate} from '@tanstack/react-router';
import {Spinner} from '@ui/components/shared/spinner';
import {useManageAuth} from '@ui/lib/auth';

const DashboardProtection = () => {
  const {authenticated, isLoading} = useManageAuth();

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/auth/login" />;
  }

  return <Outlet />;
};

export const Route = createFileRoute('/_protected')({
  component: DashboardProtection,
});
