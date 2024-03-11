import {create} from 'zustand';
import {User} from '@ui/dto';
import {removeBearer} from '@ui/lib/auth';

interface UserState {
  authenticated: boolean;
  user: User | null;

  login(user: User): void;
  logout(): void;
}

export const useUserStore = create<UserState>()((set) => ({
  authenticated: false,
  user: null,

  login: (user) =>
    set(() => {
      return {
        authenticated: true,
        user,
      };
    }),

  logout: () =>
    set(() => {
      removeBearer();
      return {authenticated: false, user: null};
    }),
}));
