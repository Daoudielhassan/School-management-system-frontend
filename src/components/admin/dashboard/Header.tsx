import { Bell, Menu, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-[#0A192F] border-b border-[#1E2D3D]">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="text-gray-400 hover:text-white focus:outline-none md:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="relative ml-4 md:ml-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-[#1E2D3D] border-none text-gray-300 focus:ring-[#00D4FF] focus:border-[#00D4FF] w-full sm:w-64" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white focus:outline-none relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#FF6B6B] ring-2 ring-[#0A192F]"></span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <img src="/placeholder.svg?height=32&width=32" alt="Avatar" className="rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1E2D3D] border-[#2A3747] text-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#2A3747]" />
              <DropdownMenuItem className="hover:bg-[#2A3747] cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#2A3747] cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2A3747]" />
              <DropdownMenuItem className="hover:bg-[#2A3747] cursor-pointer">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;