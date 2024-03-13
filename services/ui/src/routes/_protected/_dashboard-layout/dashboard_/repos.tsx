import {useQuery} from '@tanstack/react-query';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {queries} from '@ui/api/queries';
import {ReactNode, useMemo, useState} from 'react';

import styles from './repos.module.less';
import {Spinner} from '@ui/components/shared/spinner';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@ui/components/shared/ui/alert';
import {errorToString} from '@ui/lib/utils';
import clsx from 'clsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/components/shared/ui/card';
import {Button} from '@ui/components/shared/ui/button';
import {PlusIcon} from '@radix-ui/react-icons';
import {Input} from '@ui/components/shared/ui/input';

const Dashboard = () => {
  const navigate = useNavigate();

  const {data: repos, isLoading, error} = useQuery(queries.github.repos());

  const [search, setSearch] = useState('');

  const filteredRepos = useMemo(() => {
    return search
      ? repos?.filter((repo) => repo.full_name?.includes(search))
      : repos;
  }, [search, repos]);

  const Info = (
    <h3 className="text-md font-light">select from your Github repositories</h3>
  );

  let Repos: ReactNode;

  if (isLoading) {
    Repos = <Spinner withWrapper wrapperClassName="scale-150" />;
  } else if (error) {
    Repos = (
      <Alert variant="destructive">
        <AlertTitle>Error Fetching Repos</AlertTitle>
        <AlertDescription>{errorToString(error)}</AlertDescription>
      </Alert>
    );
  } else if (repos?.length) {
    Repos = (
      <>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search repo"
        />
        {filteredRepos?.map((repo, idx) => (
          <Card key={idx} className={styles.repo}>
            <CardHeader>
              <CardTitle>{repo.name}</CardTitle>
              <CardDescription>{repo.full_name}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                variant="outline"
                onClick={() => {
                  const [owner, repoName] = repo.full_name.split('/');
                  navigate({
                    to: '/dashboard/repo/$owner/$repoName',
                    params: {owner, repoName},
                  });
                }}
              >
                <PlusIcon className="mr-2" />
                Select
              </Button>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  return (
    <>
      {Info}
      <div className={clsx(styles.repos, 'my-5')}>{Repos}</div>
    </>
  );
};

export const Route = createFileRoute(
  '/_protected/_dashboard-layout/dashboard/repos',
)({
  component: Dashboard,
});
