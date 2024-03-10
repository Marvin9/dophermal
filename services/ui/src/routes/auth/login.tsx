import {createFileRoute} from '@tanstack/react-router';
import {Button} from '@ui/components/shared/ui/button';

const Login = () => {
  return (
    <>
      <Button>Hello</Button>
    </>
  );
};

export const Route = createFileRoute('/auth/login')({
  component: Login,
});
