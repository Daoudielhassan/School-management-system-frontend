import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash"; // ✅ Import debounce
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  type RoleType = "manager" | "student" | "professor" | "administrator" | "all";
  const [filter, setFilter] = useState<RoleType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // New state for debounced search
  const [totalPages, setTotalPages] = useState(1);

  const roleMapping: Record<string, string> = {
    ETUDIANT: "student",
    MANAGER: "MANAGER",
    ADMINISTRATEUR: "administrator",
    PROFESSEUR: "professor",
    all: "all",
  };

  // Debounced function for setting search term
  const debounceSearch = useCallback(
      debounce((term: string) => {
        setDebouncedSearchTerm(term);
      }, 500), // Adjust debounce delay as needed
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
        let backendRole = filter === "all" ? "" : roleMapping[filter];
        let url = `http://localhost:8080/api/users?page=${page - 1}&size=10`;
        if (backendRole) {
          url += `&role=${encodeURIComponent(backendRole)}`;
        }
        if (debouncedSearchTerm) {
          url += `&searchTerm=${encodeURIComponent(debouncedSearchTerm)}`;
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
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, filter, debouncedSearchTerm]); // Use debouncedSearchTerm instead of searchTerm

  const displayRoleName = (role: RoleType) => {
    switch (role) {
      case "manager":
        return "Managers";
      case "student":
        return "Étudiants";
      case "professor":
        return "Professeurs";
      case "administrator":
        return "Administrateurs";
      case "all":
        return "Tous les Utilisateurs";
      default:
        return role;
    }
  };

  return (
      <Card className="bg-[#FFFFFF] border-[#9D1F15] shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-black">
                Gestion des Utilisateurs
              </CardTitle>
              <CardDescription className="text-gray-800">
                Gérer les utilisateurs du système
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"/>
                <input
                    type="text"
                    placeholder="Rechercher des utilisateurs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 rounded-lg bg-white border  border-y-blue-950 text-BLACK focus:border-blue-950 "
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-[#2A3747] hover:shadow-[#9D1F15]/10 hover:text-[#00246B]">
                    Filtre <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1E2D3D] border-[#2A3747] text-white">
                  <DropdownMenuLabel>Filtrer par Rôle</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2A3747]" />
                  {(Object.keys(roleMapping) as RoleType[]).map((key) => (
                      <DropdownMenuItem
                          key={key}
                          onClick={() => setFilter(key)}
                          className="hover:bg-[#2A3747] cursor-pointer"
                      >
                        {displayRoleName(key)}
                      </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
              <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-4">
                <p>{error}</p>
                <Button
                    onClick={() => {
                      setError(null);
                      setPage(page);
                    }}
                    variant="outline"
                    className="mt-2 border-red-400 text-red-300 hover:bg-red-500/20"
                >
                  Réessayer
                </Button>
              </div>
          )}

          {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D4FF]"></div>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.length > 0 ? (
                    users.map((user) => <UserCard key={user.id} user={user} />)
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      Aucun utilisateur trouvé
                    </div>
                )}
              </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-4">
          <Button
              variant="outline"
              className="border-[#2A3747] hover:bg-[#2A3747] hover:text-[#00D4FF]"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
          >
            Précédent
          </Button>
          <span className="text-white">Page {page} sur {totalPages}</span>
          <Button
              variant="outline"
              className="border-[#2A3747] hover:bg-[#2A3747] hover:text-[#00D4FF]"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
          >
            Suivant
          </Button>
        </CardFooter>
      </Card>
  );
};

export default UserManagementCard;