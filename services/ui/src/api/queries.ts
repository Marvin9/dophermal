import {mergeQueryKeys} from '@lukemorales/query-key-factory';
import {auth} from './auth';

export const queries = mergeQueryKeys(auth);
