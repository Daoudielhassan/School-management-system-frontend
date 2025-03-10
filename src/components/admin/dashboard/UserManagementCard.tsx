import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import UserCard from "./UserCard"; // Import the UserCard component

const UserManagementCard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [totalPages, setTotalPages] = useState(1);

  // Fetch users when the page or filter changes
  useEffect(() => {
    const fetchUsers = async (page: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/users?page=${page}&size=10`
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.content); // Assuming 'content' contains the user list
        setTotalPages(data.totalPages); // Assuming 'totalPages' gives the number of pages
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers(page);
  }, [page]);

  return (
    <Card className="bg-[#1E2D3D] border-[#2A3747] shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-white">User Management</CardTitle>
            <CardDescription className="text-gray-400">Manage system users</CardDescription>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#2A3747] hover:bg-[#2A3747] hover:text-[#00D4FF]">
                  Filter <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1E2D3D] border-[#2A3747] text-white">
                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#2A3747]" />
                <DropdownMenuItem onClick={() => setFilter("all")} className="hover:bg-[#2A3747] cursor-pointer">All Users</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("student")} className="hover:bg-[#2A3747] cursor-pointer">Students</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("professor")} className="hover:bg-[#2A3747] cursor-pointer">Professors</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("manager")} className="hover:bg-[#2A3747] cursor-pointer">Managers</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("admin")} className="hover:bg-[#2A3747] cursor-pointer">Admins</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            users.map((user, index) => (
              <UserCard key={index} user={user} />
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t border-[#2A3747] pt-4">
        <div className="flex justify-between items-center w-full">
          <Button
            variant="outline"
            className="border-[#2A3747] hover:bg-[#2A3747] hover:text-[#00D4FF]"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Previous
          </Button>
          <div className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            className="border-[#2A3747] hover:bg-[#2A3747] hover:text-[#00D4FF]"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default UserManagementCard;
