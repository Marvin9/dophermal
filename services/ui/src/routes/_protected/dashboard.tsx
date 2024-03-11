import {createFileRoute} from '@tanstack/react-router';

const Dashboard = () => {
  return <div>Hello dashboard</div>;
};

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
});
