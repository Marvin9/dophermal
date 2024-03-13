import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const errorToString = (err: unknown) => {
  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === 'string') {
    return err;
  }

  return JSON.stringify(err);
};

export const omit = <T>(obj: T, keys: (keyof T)[]) => {
  console.log(obj);
  const newObj = {...obj};

  for (const key of keys) {
    delete newObj[key as keyof T];
  }

  console.log(newObj);

  return newObj;
};
