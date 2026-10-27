import { Contact, TeamMember } from '@/types';
import { ALL_96_CONTACTS } from '@/data/mockContacts';

export const INITIAL_CONTACTS: Contact[] = ALL_96_CONTACTS;

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Jabir MDN (you)',
    email: 'jabir@ziqx.cc',
    title: 'Sales Lead',
    access: 'Admin',
    status: 'Active',
    initials: 'JM',
    avatarBg: '#f5c61b',
    avatarColor: '#1a1a18',
  },
  {
    id: 'tm2',
    name: 'Aswin Krishnan',
    email: 'aswin@ziqx.cc',
    title: 'Sales Executive',
    access: 'Agent',
    status: 'Active',
    initials: 'AK',
    avatarBg: '#e4eefb',
    avatarColor: '#1e60b5',
  },
  {
    id: 'tm3',
    name: 'Nimisha Raj',
    email: 'nimisha@ziqx.cc',
    title: 'Account Manager',
    access: 'Manager',
    status: 'Active',
    initials: 'NR',
    avatarBg: '#fbe5ec',
    avatarColor: '#ba2755',
  },
  {
    id: 'tm4',
    name: 'Rahul Nair',
    email: 'rahul@ziqx.cc',
    title: 'Sales Executive',
    access: 'Agent',
    status: 'Invited',
    initials: 'RN',
    avatarBg: '#ddf3e5',
    avatarColor: '#0b5c46',
  },
];
