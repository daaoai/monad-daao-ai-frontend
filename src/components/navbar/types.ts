import { ReactNode } from 'react';

export interface NavLink {
  name: string;
  href: string;
  icon: ReactNode;
  external?: boolean;
}
