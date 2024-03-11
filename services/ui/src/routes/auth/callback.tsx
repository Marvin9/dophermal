import {GitHubLogoIcon} from '@radix-ui/react-icons';
import {useMutation} from '@tanstack/react-query';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {dophermalAxios} from '@ui/api/base';
import {setBearer} from '@ui/lib/auth';
import {useEffect, useRef} from 'react';

const Callback = () => {
  const navigate = useNavigate();
  const {code} = Route.useSearch();
  const consumedCode = useRef(false);

  const {mutate: generateTokenFromAuthCode} = useMutation({
    mutationFn: (code: string) =>
      dophermalAxios
        .get(`/auth/callback?code=${code}`)
        .then((res) => res.data.accessToken as string)
        .then((token) => {
          if (!token) {
            throw new Error(
              'Cannot get access token. Please try to connect again',
            );
          }

          setBearer(token);

          navigate({from: '/auth/callback', to: '/'});
        }),
  });

  useEffect(() => {
    if (consumedCode.current) {
      return;
    }

    if (code) {
      consumedCode.current = true;
      generateTokenFromAuthCode(code);
    }
  }, [code]);

  return (
    <div className="flex items-center justify-center w-screen h-screen text-3xl bg-card-foreground text-white">
      <GitHubLogoIcon className="mr-5" style={{transform: 'scale(2)'}} />
      Connecting your Github Account...
    </div>
  );
};

export const Route = createFileRoute('/auth/callback')({
  component: Callback,
  validateSearch: (search: Record<string, string>): {code: string} => ({
    code: search['code'] || '',
  }),
});
