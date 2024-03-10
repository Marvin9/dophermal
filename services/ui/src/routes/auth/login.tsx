import {createFileRoute} from '@tanstack/react-router';

const Login = () => {
  return <>Login</>;
};

export const Route = createFileRoute('/auth/login')({
  component: Login,
});
