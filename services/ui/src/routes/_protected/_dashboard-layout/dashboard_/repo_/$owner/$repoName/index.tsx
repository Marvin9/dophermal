import {useQuery} from '@tanstack/react-query';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {queries} from '@ui/api/queries';

import {Spinner} from '@ui/components/shared/spinner';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@ui/components/shared/ui/card';
import {cn} from '@ui/lib/utils';
import {CaretRightIcon} from '@radix-ui/react-icons';
import {NotFound} from '@ui/components/shared/not-found';

const Repo = () => {
  const navigate = useNavigate();
  const {repoName, owner} = Route.useParams();

  const {data: repoData, isLoading: repoDataLoading} = useQuery({
    ...queries.github.repo(owner, repoName),
    enabled: !!repoName,
  });

  const {data: repoPr, isLoading: repoPrLoading} = useQuery({
    ...queries.github.prs(owner, repoName),
    enabled: !!repoName,
    placeholderData: [],
  });

  if (repoDataLoading || repoPrLoading) {
    return <Spinner withWrapper />;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">{repoData?.full_name}</h2>
      <div className={cn('mt-10')}>
        {repoPr?.length == 0 && (
          <NotFound text="No open PR found in this repository" />
        )}
        {repoPr?.map((pr) => (
          <Card
            key={pr.id}
            className={cn('my-5 hover:bg-accent relative cursor-pointer')}
            onClick={() =>
              navigate({
                to: '/dashboard/repo/$owner/$repoName/pulls/$pull',
                params: {
                  owner,
                  repoName,
                  pull: pr.number + '',
                },
              })
            }
          >
            <CardHeader>
              <CardTitle>{pr.title}</CardTitle>
              <CardDescription>by {pr.user.login}</CardDescription>
            </CardHeader>
            <CardFooter>
              <p className="text-sm font-light">created at {pr.created_at}</p>
            </CardFooter>
            <div className="scale-[400%] absolute right-10 bottom-[45%]">
              <CaretRightIcon />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const Route = createFileRoute(
  '/_protected/_dashboard-layout/dashboard/repo/$owner/$repoName/',
)({
  component: Repo,
});
