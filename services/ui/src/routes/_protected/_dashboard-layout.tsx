import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
} from '@tanstack/react-router';

import styles from './dashboard-layout.module.less';
import clsx from 'clsx';
import {Button} from '@ui/components/shared/ui/button';
import {useUserStore} from '@ui/state/user';
import {Avatar, AvatarImage} from '@ui/components/shared/ui/avatar';
import {Separator} from '@ui/components/shared/ui/separator';
import {ListBulletIcon} from '@radix-ui/react-icons';

const DashboardLayout = () => {
  const navigate = useNavigate();

  const {user, logout} = useUserStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  return (
    <div className={styles.container}>
      <nav className={styles.navContainer}>
        <div className={clsx('container', styles.nav)}>
          <img
            src="/dophermal-logo.png"
            alt="dophermal logo"
            className={styles.navLogo}
            onClick={() => navigate({to: '/dashboard'})}
          />

          <div className={styles.navUserDetails}>
            <Avatar>
              <AvatarImage
                src={`https://github.com/${user?.username}.png`}
                alt={`@${user?.username}`}
              />
            </Avatar>
            <h4 className="text-lg font-light">{user?.username}</h4>
          </div>

          <Button onClick={() => logout()} variant="secondary">
            Logout
          </Button>
        </div>
      </nav>

      <Separator />

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <Button variant="outline">
            <Link
              key="repos"
              to="/dashboard"
              activeProps={{className: styles.linkActive}}
              className={styles.link}
            >
              <ListBulletIcon />
              Repositories
            </Link>
          </Button>
        </div>
        <Separator orientation="vertical" />
        <section className={styles.body}>
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_protected/_dashboard-layout')({
  component: DashboardLayout,
});
