import {HomeIcon, PlusCircledIcon, SunIcon} from '@radix-ui/react-icons';
import {useMutation, useQuery} from '@tanstack/react-query';
import {createFileRoute} from '@tanstack/react-router';
import {dophermalAxios} from '@ui/api/base';
import {queries} from '@ui/api/queries';
import {CreateEphermalEnvironment} from '@ui/components/create-ephermal-environment';
import {Spinner} from '@ui/components/shared/spinner';
import {Button} from '@ui/components/shared/ui/button';
import {Separator} from '@ui/components/shared/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@ui/components/shared/ui/sheet';
import {ContainerConfig, ContainerImage} from '@ui/dto';
import {useDisclosure} from '@ui/lib/hooks';
import {EphermalEnvironmentList} from '@ui/components/ephermal-environment-list';
import {queryClient} from '@ui/api/client';
import {useToast} from '@ui/components/shared/ui/use-toast';

const PullRequestPage = () => {
  const {owner, repoName, pull} = Route.useParams();

  const {toast} = useToast();

  const {data: pullRequest, isLoading} = useQuery({
    ...queries.github.pr(owner, repoName, Number(pull)),
    enabled: !!owner && !!repoName && !!pull,
  });

  const {open, onOpen, onClose, toggle} = useDisclosure();

  const {mutate: createEphermalEnv, isPending: createEphermalEnvPending} =
    useMutation({
      mutationFn: async (
        vars: Pick<
          ContainerImage,
          'pullImageUrl' | 'pullRequestNumber' | 'githubRepoName'
        > &
          Pick<ContainerConfig, 'port' | 'keyValueEnv'>,
      ) => {
        const {data} = await dophermalAxios.post('/container-config', {
          port: vars.port,
          keyValueEnv: vars.keyValueEnv,
        });

        const containerConfig = data as ContainerConfig;

        return dophermalAxios
          .post('/container-image', {
            pullImageUrl: vars.pullImageUrl,
            pullRequestNumber: vars.pullRequestNumber,
            githubRepoName: vars.githubRepoName,
            containerConfigurationId: containerConfig.id,
          })
          .then((res) => res.data);
      },
      onSuccess: (data) => {
        toast({
          title: `New ephermal created successfully`,
        });
        queryClient.setQueryData(
          queries.container.listByPullRequest(repoName, Number(pull)).queryKey,
          (old: ContainerImage[]) => {
            if (Array.isArray(old)) {
              return [data, ...old];
            }

            return [data];
          },
        );
      },
    });

  if (isLoading) {
    return <Spinner withWrapper />;
  }

  return (
    <div className="h-full">
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
              href={`https://github.com/${pullRequest?.user?.login}`}
              target="__blank"
            >
              {pullRequest?.user?.login}
            </a>
          </p>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex items-center">
        <h2 className="text-lg font-semibold flex items-center gap-5">
          <HomeIcon />
          Ephermal Environments
        </h2>
        <Sheet open={open} onOpenChange={toggle}>
          <SheetTrigger asChild onClick={onOpen}>
            <Button className="ml-auto" disabled={createEphermalEnvPending}>
              {createEphermalEnvPending ? (
                <Spinner />
              ) : (
                <PlusCircledIcon className="mr-2" />
              )}{' '}
              Create New Ephermal
            </Button>
          </SheetTrigger>

          <SheetContent>
            <SheetHeader>
              <SheetTitle>✨ Create New Ephermal</SheetTitle>
            </SheetHeader>

            <Separator className="my-5" />

            <div className="mt-5">
              <CreateEphermalEnvironment
                onSubmit={(eph) => {
                  onClose();
                  createEphermalEnv({
                    githubRepoName: repoName,
                    pullRequestNumber: Number(pull),
                    port: eph.port,
                    pullImageUrl: eph.pullImageUrl,
                    keyValueEnv: eph.keyValueEnv,
                  });
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <EphermalEnvironmentList />
    </div>
  );
};

export const Route = createFileRoute(
  '/_protected/_dashboard-layout/dashboard/repo/$owner/$repoName/pulls/$pull',
)({
  component: PullRequestPage,
});
