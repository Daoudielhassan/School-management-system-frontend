import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useStudent } from "@/context/StudentContext";

export const Header = () => {
  const { studentData } = useStudent();
  const [notifications, setNotifications] = useState<{ message: string }[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Écouteur de défilement pour réduire l'en-tête
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50); // Changez 50 par le seuil de position de défilement
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Notifications en temps réel avec messages
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8080/api/notifications");
  
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [...prev, ...data.messages]);
    };
  
    return () => {
      eventSource.close();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header
      className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-10 md:pt-4 transition-all ${
        scrolled ? "h-16" : "h-auto"
      }`}
    >
      {/* Message de bienvenue */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {studentData ? `${studentData.firstName} ${studentData.lastName}` : "Chargement..."}!
        </h1>
        <p className="text-gray-600 font-normal">
          "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
        </p>
      </motion.div>

      {/* Section Notifications & Profil */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center mt-4 md:mt-0 relative"
      >
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 relative hover:bg-gray-200 rounded-full"
            aria-label="Notifications"
            onClick={() => setNotificationDropdownOpen(!isNotificationDropdownOpen)}
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-pink-500 text-white text-xs font-bold rounded-full">
                {notifications.length}
              </span>
            )}
          </Button>

          {/* Menu déroulant des notifications */}
          {isNotificationDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50"
            >
              <ul className="py-2 text-gray-700">
                {notifications.map((notification, index) => (
                  <li key={index}>
                    <div className="w-full px-4 py-2 hover:bg-gray-100">
                      <p className="text-sm">{notification.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Avatar de profil avec menu déroulant */}
        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-200"
            onClick={() => setDropdownOpen(!isDropdownOpen)}
          >
            <Avatar className="h-10 w-10 border-2 border-cyan-400">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={studentData?.firstName || "Étudiant"} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700">
                {studentData ? studentData.firstName.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </Button>

          {/* Menu déroulant */}
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50"
            >
              <ul className="py-2 text-gray-700">
                <li>
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profil
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push("/settings")}
                    className="w-full flex items-center px-4 py-2 hover:bg-gray-100"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Paramètres
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Déconnexion
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </div>
      </motion.div>
    </header>
  );
};