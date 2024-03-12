import {HomeIcon, SunIcon} from '@radix-ui/react-icons';
import {useQuery} from '@tanstack/react-query';
import {createFileRoute} from '@tanstack/react-router';
import {queries} from '@ui/api/queries';
import {Spinner} from '@ui/components/shared/spinner';
import {Separator} from '@ui/components/shared/ui/separator';

const PullRequestPage = () => {
  const {owner, repoName, pull} = Route.useParams();

  const {data: pullRequest, isLoading} = useQuery({
    ...queries.github.pr(owner, repoName, Number(pull)),
    enabled: !!owner && !!repoName && !!pull,
  });

  if (isLoading) {
    return <Spinner withWrapper />;
  }

  return (
    <div>
      <div className="flex items-center gap-5">
        <SunIcon />
        <div>
          <div className="flex items-center gap-5">
            <h3 className="text-lg font-bold">
              <a href={pullRequest?.html_url} target="__blank">
                PR #{pullRequest?.number}
              </a>{' '}
              - {pullRequest?.title}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground font-light">
            by{' '}
            <a
              href={`https://github.com/${pullRequest?.user.login}`}
              target="__blank"
            >
              {pullRequest?.user?.login}
            </a>
          </p>
        </div>
      </div>

      <Separator className="my-10" />

      <h2 className="text-lg font-semibold flex items-center gap-5">
        <HomeIcon />
        Ephermal Environments
      </h2>
    </div>
  );
};

export const Route = createFileRoute(
  '/_protected/_dashboard-layout/dashboard/repo/$owner/$repoName/pulls/$pull',
)({
  component: PullRequestPage,
});
