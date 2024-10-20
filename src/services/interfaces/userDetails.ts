import {Address} from './address';
import { Role } from './role';
import {User} from './user';
import {Validation} from './validation';

export interface UserDetails {
  validation: Validation | null;
  address: Address | null;
  role: Role | null;
  user: User | null;
}
