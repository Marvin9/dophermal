import {mergeQueryKeys} from '@lukemorales/query-key-factory';
import {auth} from './auth';
import {github} from './github';
import {container} from './container';

export const queries = mergeQueryKeys(auth, github, container);
