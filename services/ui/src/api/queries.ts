import {mergeQueryKeys} from '@lukemorales/query-key-factory';
import {auth} from './auth';
import {github} from './github';

export const queries = mergeQueryKeys(auth, github);
