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
import {useEffect, useRef} from 'react';

const DashboardLayout = () => {
  const navigate = useNavigate();

  const {user, logout} = useUserStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  const navigationRef = useRef<HTMLElement>();
  const bodyRef = useRef<HTMLElement>();

  useEffect(() => {
    if (navigationRef.current && bodyRef.current) {
      bodyRef.current.style.height = `${bodyRef.current.getBoundingClientRect().height - navigationRef.current.getBoundingClientRect().height / 2}px`;
    }
  }, []);

  return (
    <div className={styles.container}>
      <nav
        className={styles.navContainer}
        ref={(node) => {
          if (node) {
            navigationRef.current = node;
          }
        }}
      >
        <div className={clsx('container', styles.nav)}>
          <img
            src="/dophermal-logo.png"
            alt="dophermal logo"
            className={styles.navLogo}
            onClick={() => navigate({to: '/dashboard/repos'})}
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
          <Link
            key="repos"
            to="/dashboard/repos"
            activeProps={{className: styles.linkActive}}
            className={styles.link}
          >
            <Button variant="outline" className="w-full">
              <ListBulletIcon className="mr-2" />
              Repositories
            </Button>
          </Link>

          <Link
            key="activeEphermals"
            to="/dashboard/ephermals"
            activeProps={{className: styles.linkActive}}
            className={styles.link}
          >
            <Button variant="outline" className="w-full">
              🐳 <span className="ml-2">Ephermals</span>
            </Button>
          </Link>
        </div>
        <Separator orientation="vertical" />
        <section
          className={styles.body}
          ref={(node) => {
            if (node) {
              bodyRef.current = node;
            }
          }}
        >
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_protected/_dashboard-layout')({
  component: DashboardLayout,
});
