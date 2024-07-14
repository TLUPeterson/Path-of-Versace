import './globals.css';

import Link from 'next/link';
import { Logo, SettingsIcon, UsersIcon, VercelLogo } from '@/components/icons';
import { NavItem } from './nav-item';


export const metadata = {
  title: 'Pobb pricer',
  description:
    'Get an estimate price of Pobb items.'
};


export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body>
        <div className="grid min-h-screen w-full">
          <div className="flex flex-col w-full">
            <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">

              <NavItem href="/">
                <UsersIcon className="h-4 w-4" />
                Home
              </NavItem>
              <NavItem href="/builder">
                <SettingsIcon className="h-4 w-4" />
                Builder
              </NavItem>
            </header>
            <div className="flex-1 overflow-auto py-2">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}