'use client';

import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { Edit, Trash2 } from "lucide-react";
import { apiGet, API_ENDPOINTS } from "@/config/api";

export default function AdminUsersPage() {
  interface User {
    id: number;
    username: string;
    email: string;
    identity: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const roleMapping: Record<string, string> = {
    all: "all",
    ETUDIANT: "student",
    MANAGER: "manager",
    ADMINISTRATEUR: "ADMINISTRATEUR",
    PROFESSEUR: "professor",
  };

  const debounceSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 500),
    []
  );

  useEffect(() => {
    debounceSearch(searchTerm);
  }, [searchTerm, debounceSearch]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const backendRole = filter === "all" ? "" : roleMapping[filter];
        let url = `${API_ENDPOINTS.USERS}?page=${page - 1}&size=10`;
        if (backendRole) {
          url += `&role=${encodeURIComponent(backendRole)}`;
        }
        if (debouncedSearchTerm) {
          url += `&searchTerm=${encodeURIComponent(debouncedSearchTerm)}`;
        }

        const data = await apiGet(url, token);
        setUsers(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        setError(err.message || "Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filter, page, debouncedSearchTerm, token]);

  const handleFilter = (role: string) => {
    setFilter(role);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600">Gestion des comptes utilisateurs du système</p>
      </div>

      {/* Search & Role Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs bg-white border-gray-300 text-gray-800 focus:ring-blue-500"
        />
        <div className="flex flex-wrap gap-2">
          {Object.keys(roleMapping).map((role) => (
            <Button
              key={role}
              variant={filter === role ? "default" : "outline"}
              onClick={() => handleFilter(role)}
              className={`capitalize ${
                filter === role
                  ? "bg-blue-600 text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {role === "all" ? "All" : roleMapping[role]}
            </Button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* User Table */}
      {!loading && users.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm font-bold text-gray-600">Username</TableHead>
                <TableHead className="text-sm font-bold text-gray-600">Email</TableHead>
                <TableHead className="text-sm font-bold text-gray-600">Role</TableHead>
                <TableHead className="text-sm font-bold text-gray-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{roleMapping[user.identity] || user.identity}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="text-sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* No Users Found */}
      {!loading && users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No users found</p>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1 || loading}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Previous
        </Button>
        <p className="text-gray-600">
          Page {page} of {totalPages}
        </p>
        <Button
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages || loading}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Next
        </Button>
      </div>
    </div>
  );
}