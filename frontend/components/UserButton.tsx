'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { IoMdLogOut } from 'react-icons/io';
import { FaRegUser } from 'react-icons/fa6';
import { BiCategoryAlt } from 'react-icons/bi';
import { LuGamepad2 } from 'react-icons/lu';

export default function UserButton() {
  const { user, isLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sky-200 px-5 py-2">
        <div className="w-5 h-5 border-2 border-sky-200 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Link 
        href="/login" 
        className="flex items-center gap-2 text-sky-200 px-5 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105"
      >
        <span>Se connecter</span>
      </Link>
    );
  }

  return (
    <div className="relative cursor-pointer">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 text-sky-200 px-5 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105"
      >
        <FaRegUser className="w-5 h-5" />
        <span>Bienvenue {user.firstName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop pour fermer au clic */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-20 border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            
            <Link
              href="/propose/game"
              className="flex items-center gap-3 px-4 py-2 text-sm text-sky-500 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <LuGamepad2 className="text-3xl" />
              Proposer un jeu
            </Link>

                        <Link
              href="/propose/category"
              className="flex items-center gap-3 px-4 py-2 text-sm text-sky-400 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <BiCategoryAlt className="text-3xl" />
              Proposer une catégorie
            </Link>

            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-grqy-400 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <IoMdLogOut className="text-3xl" />
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  );
}
