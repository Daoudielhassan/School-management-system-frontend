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
import { useAuth } from "@/context/AuthContext";
import { Edit, Trash2 } from "lucide-react";

const UserManagement = () => {
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
        if (!token) {
          setLoading(false);
          return;
        }

        const backendRole = filter === "all" ? "" : roleMapping[filter];
        let url = `http://localhost:8080/api/users?page=${page - 1}&size=10`;
        if (backendRole) {
          url += `&role=${encodeURIComponent(backendRole)}`;
        }
        if (debouncedSearchTerm) {
          url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
        }

        console.log(`Calling API: ${url}`);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
  }, [filter, page, debouncedSearchTerm, token]);

  // Handle filter selection
  const handleFilter = (role: string) => {
    setFilter(role);
    setPage(1); // Reset page to 1 whenever the filter changes
  };

  // Render
  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage system users</p>
          </div>
        </div>

        {/* Search & Role Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-300 focus:ring-blue-500"
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
                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {role === "all" ? "All" : roleMapping[role]}
                </Button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg">
              <p>{error}</p>
            </div>
        )}

        {/* User Table */}
        {!loading && users.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm font-bold text-gray-600 dark:text-gray-300">Username</TableHead>
                    <TableHead className="text-sm font-bold text-gray-600 dark:text-gray-300">Email</TableHead>
                    <TableHead className="text-sm font-bold text-gray-600 dark:text-gray-300">Role</TableHead>
                    <TableHead className="text-sm font-bold text-gray-600 dark:text-gray-300">Actions</TableHead>
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
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Previous
          </Button>
          <p className="text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <Button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Next
          </Button>
        </div>
      </div>
  );
};

export default UserManagement;