"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { RefObject, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoMdLogOut } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { BiCategoryAlt } from "react-icons/bi";
import { LuGamepad2 } from "react-icons/lu";
import { useParams } from "next/navigation";
import { Locale } from "@/i18n.config";
import { useClickOutside } from "@/hooks/useClickOutside";

export default function UserButton({ dict }: { dict: any }) {
  const { user, isLoading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";

  useClickOutside(dropdownRef as RefObject<HTMLElement>, () => setIsDropdownOpen(false));

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isDropdownOpen]);

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
        href={`/${locale}/login`}
        className="flex items-center gap-2 text-sky-200 px-5 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105"
      >
        <span>{dict.header.login}</span>
      </Link>
    );
  }

  return (
    <div className="relative cursor-pointer" ref={wrapperRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 text-sky-200 px-5 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg transform hover:scale-105"
        id="user-menu-button"
      >
        <FaRegUser className="w-5 h-5" />
        <span className="capitalize">
          {dict.user.welcome} {user.firstName}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && typeof window !== 'undefined' && buttonRect && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-90"
            onClick={() => setIsDropdownOpen(false)}
          />

          <div 
            ref={dropdownRef}
            className="fixed w-56 bg-white rounded-lg shadow-xl py-2 z-100 border border-gray-200"
            style={{
              top: `${buttonRect.bottom + 8}px`,
              left: `${buttonRect.right - 224}px`
            }}
          >
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                {user.nickname}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            <Link
              href={`/${locale}/user/games/propose`}
              className="flex items-center gap-3 px-4 py-2 text-sm text-sky-500 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <LuGamepad2 className="text-3xl" />
              {dict.user.proposeGame}
            </Link>

            <Link
              href={`/${locale}/user/category/propose`}
              className="flex items-center gap-3 px-4 py-2 text-sm text-sky-400 hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <BiCategoryAlt className="text-3xl" />
              {dict.user.proposeCategory}
            </Link>

            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-400 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <IoMdLogOut className="text-3xl" />
              {dict.user.logout}
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
