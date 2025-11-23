"use client";

import { PaginatedUsersResponse, User } from "@/types/UserType";
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiEdit,
  FiTrash2,
  FiMail,
  FiUser,
} from "react-icons/fi";
import Cookies from "js-cookie";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState<PaginatedUsersResponse["meta"]>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const token = Cookies.get("authToken");

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const data: PaginatedUsersResponse = await response.json();
      setUsers(data.data);
      setMeta(data.meta);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userToDelete.id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete user");

      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const getRoleBadgeColors = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="bg-white shadow-sm mb-5">
        <div className="px-8 py-4">
          <h2 className="text-2xl font-bold text-gray-800">Utilisateurs</h2>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex gap-4 mb-6 items-center">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom, pseudo ou email..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Rôles
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Inscription
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-500"
                >
                  Chargement...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <FiUser className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">Aucun utilisateur trouvé</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {/* User Info */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </span>
                      {user.nickname && (
                        <span className="text-sm text-slate-500">
                          @{user.nickname}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiMail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="px-4 py-4">
                    <div className="flex gap-2 flex-wrap">
                      {user.roles.map((role: any) => (
                        <span
                          key={role}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColors(
                            role
                          )}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isVerified
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.isVerified ? "Vérifié" : "Non vérifié"}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === user.id ? null : user.id)
                        }
                        className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-600"
                      >
                        <FiMoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuId === user.id && (
                        <>
                          {/* Backdrop */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />

                          {/* Menu */}
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-20">
                            <Link
                              href={`/admin/users/${user.id}/edit`}
                              className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-md"
                            >
                              <FiEdit className="w-4 h-4" />
                              Modifier
                            </Link>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                setUserToDelete(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-md"
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Supprimer
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
          <div className="text-sm text-slate-500">
            Affichage de {(page - 1) * limit + 1} à{" "}
            {Math.min(page * limit, meta.total)} sur {meta.total} résultats
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
              Précédent
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Confirmer la suppression
              </h3>
              <p className="text-sm text-slate-500">
                Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                <strong>
                  {userToDelete?.firstName} {userToDelete?.lastName}
                </strong>{" "}
                ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
