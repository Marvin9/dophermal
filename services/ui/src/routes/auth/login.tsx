import {Navigate, createFileRoute} from '@tanstack/react-router';

import styles from './styles.module.less';
import {Button} from '@ui/components/shared/ui/button';
import {GitHubLogoIcon} from '@radix-ui/react-icons';
import {useQuery} from '@tanstack/react-query';
import {queries} from '@ui/api/queries';
import {Spinner} from '@ui/components/shared/spinner';
import {cn} from '@ui/lib/utils';
import {useManageAuth} from '@ui/lib/auth';

const Login = () => {
  const {authenticated} = useManageAuth();

  const {data: githubOAuth2Conf, isLoading: loadingGithubOauth2Conf} = useQuery(
    queries.auth.oauth2Github(),
  );

  const connectGithub = () => {
    if (!githubOAuth2Conf) {
      throw new Error(
        `Cannot connect Github, missing Github Oauth2 provider details`,
      );
    }

    const url = new URL('https://github.com/login/oauth/authorize');

    const searchParams = new URLSearchParams();

    searchParams.set('redirect_uri', `${window.location.origin}/auth/callback`);
    searchParams.set('response_type', 'code');
    searchParams.set('client_id', githubOAuth2Conf.clientID);
    for (const scope of githubOAuth2Conf.scope) {
      searchParams.append('scope', scope);
    }

    url.search = searchParams.toString();

    window.location.href = url.toString();
  };

  if (authenticated) {
    return <Navigate to="/dashboard/repos" />;
  }

  return (
    <div className={cn(styles.container)}>
      <div className={styles.left}>
        <img src="/dophermal-logo.png" className={styles.logo} />
        <div>
          <h2 className="text-3xl font-light">dophermal</h2>
          <p className="text-sm font-light">
            ephermal environments of your docker image
          </p>
        </div>
      </div>
      <div className={styles.right}>
        {loadingGithubOauth2Conf ? (
          <Spinner />
        ) : (
          <Button onClick={() => connectGithub()}>
            <GitHubLogoIcon className="mr-2" />
            Connect your Github Account
          </Button>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/auth/login')({
  component: Login,
});
