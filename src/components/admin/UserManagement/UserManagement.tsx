import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash"; // Ensure lodash is installed (npm i lodash)
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
import UserCard from "./UserCard";

const UserManagementCard = () => {
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

  const roleMapping: Record<string, string> = {
    all: "all",
    ETUDIANT: "student",
    MANAGER: "manager",
    ADMINISTRATEUR: "administrator",
    PROFESSEUR: "professor",
  };

  // Debounced function to avoid excessive API calls
  const debounceSearch = useCallback(
      debounce((term: string) => {
        setDebouncedSearchTerm(term);
      }, 500), // Wait for 500ms before applying the search term
      []
  );

  // Update the debounced search term whenever the `searchTerm` changes
  useEffect(() => {
    debounceSearch(searchTerm);
  }, [searchTerm, debounceSearch]);

  // Fetch users from the backend whenever filter, page, or debounced search term changes
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null); // Reset error during fetch
      try {
        const backendRole = filter === "all" ? "" : roleMapping[filter];
        let url = `http://localhost:8080/api/users?page=${page - 1}&size=10`;
        if (backendRole) {
          url += `&role=${encodeURIComponent(backendRole)}`;
        }
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
        }

        console.log(`Calling API: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Server responded with ${response.status}: ${errorText}`);
          throw new Error(`Failed to fetch users (Status: ${response.status})`);
        }

        const data = await response.json();
        console.log("Received data:", data);

        setUsers(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filter, page, debouncedSearchTerm]);

  // Handle filter selection
  const handleFilter = (role: string) => {
    setFilter(role);
    setPage(1); // Reset page to 1 whenever the filter changes
  };

  // Render
  return (
      <main className="flex-1 overflow-y-auto p-6 bg-[#0A192F]">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>

          {/* Search & Role Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs bg-[#1E2D3D] border-none text-gray-300 focus:ring-[#00D4FF]"
            />
            <div className="flex flex-wrap gap-2">
              {Object.keys(roleMapping).map((role) => (
                  <Button
                      key={role}
                      variant={filter === role ? "default" : "outline"}
                      onClick={() => handleFilter(role)}
                      className={`capitalize ${
                          filter === role
                              ? "bg-[#00D4FF] text-[#0A192F]"
                              : "border-gray-600 text-gray-400 hover:bg-[#1E2D3D] hover:text-white"
                      }`}
                  >
                    {role === "all" ? "All" : roleMapping[role]}
                  </Button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
                <p>{error}</p>
              </div>
          )}

          {/* User Table */}
          {!loading && users.length > 0 && (
              <Table className="bg-[#1E2D3D] text-gray-300">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm font-bold text-gray-400">Username</TableHead>
                    <TableHead className="text-sm font-bold text-gray-400">Email</TableHead>
                    <TableHead className="text-sm font-bold text-gray-400">Role</TableHead>
                    <TableHead className="text-sm font-bold text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{roleMapping[user.identity]}</TableCell>
                        <TableCell className="flex items-center gap-4">
                          <Button variant="default" className="text-sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="destructive" className="text-sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}

          {/* No Users Found */}
          {!loading && users.length === 0 && (
              <p className="text-center text-gray-400">No users found</p>
          )}

          {/* Loading Indicator */}
          {loading && (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00D4FF]"></div>
              </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <Button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
                className="bg-[#1E2D3D] text-white hover:bg-gray-700"
            >
              Previous
            </Button>
            <p className="text-gray-400">
              Page {page} of {totalPages}
            </p>
            <Button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages || loading}
                className="bg-[#1E2D3D] text-white hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      </main>
  );
};

export default UserManagementCard;