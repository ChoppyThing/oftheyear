'use client';

import { ReactNode } from 'react';
import { FiHome, FiUsers, FiGrid, FiCheckCircle, FiSettings, FiLogOut } from 'react-icons/fi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProvider, useUser } from '@/contexts/UserContext';
import AdminGuard from '@/components/admin/AdminGuard';
import { LuGamepad2 } from 'react-icons/lu';
import { IoIosStats } from 'react-icons/io';

const menuItems = [
  { href: '/admin', icon: FiHome, label: 'Dashboard' },
  { href: '/admin/games', icon: LuGamepad2, label: 'Jeux' },
  { href: '/admin/category', icon: FiGrid, label: 'Categories' },
  { href: '/admin/category-stats', icon: IoIosStats, label: 'Categories Stats' },
  { href: '/admin/validation', icon: FiCheckCircle, label: 'Validation' },
  { href: '/admin/users', icon: FiUsers, label: 'Utilisateurs' },
  { href: '/admin/settings', icon: FiSettings, label: 'Paramètres' },
];

function SidebarItem({ href, icon: Icon, label }: any) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { user, logout } = useUser();

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem key={item.href} {...item} />
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="font-bold">{user?.nickname?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{user?.nickname}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiLogOut size={18} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <AdminGuard>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminGuard>
    </UserProvider>
  );
}
