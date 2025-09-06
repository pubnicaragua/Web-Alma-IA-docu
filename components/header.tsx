"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserProfile,
  type ProfileResponse,
} from "@/services/profile-service";
import { Skeleton } from "@/components/ui/skeleton";
import { getNotificationCount } from "@/services/header-service";
import { useUser } from "@/middleware/user-context";
import { useAuth } from "@/middleware/auth-provider";

interface HeaderProps {
  toggleSidebar?: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { getFuntions, refresh, selectedSchoolId, setSelectedSchoolId } =
    useUser();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [dataSchool, setDataSchool] = useState<any>({});

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserProfile();
      setProfileData(data);
    } catch {
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const count = await getNotificationCount(selectedSchoolId || undefined);
      setNotificationCount(count);
      
    } catch {
      setNotificationCount(0);
    }
  }, [selectedSchoolId]);

  // Inicializa isClient lo antes posible
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    loadUserProfile();

    // Si contexto no tiene selectedSchoolId, intenta sincronizarlo con localStorage
    if (typeof window !== "undefined" && !selectedSchoolId) {
      const lsSelected = localStorage.getItem("selectedSchool");
      if (lsSelected) {
        setSelectedSchoolId(lsSelected);
      }
      const lsSchoolData = localStorage.getItem("schoolData");
      if (lsSchoolData) setDataSchool(JSON.parse(lsSchoolData));
    } else if (selectedSchoolId) {
      // Si context tiene selectedSchoolId, actualiza dataSchool en UI
      if (typeof window !== "undefined") {
        const schoolDataLs = localStorage.getItem("schoolData");
        if (schoolDataLs) {
          const parsed = JSON.parse(schoolDataLs);
          if (parsed.id === selectedSchoolId) {
            setDataSchool(parsed);
          } else {
            setDataSchool({});
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  // Mantener sincronía del dataSchool con selectedSchoolId
  useEffect(() => {
    if (!selectedSchoolId) {
      setDataSchool({});
      setNotificationCount(0);
      return;
    }

    // Resetear notificaciones inmediatamente al cambiar colegio  
    setNotificationCount(0);

    if (typeof window !== "undefined") {
      const schoolDataLs = localStorage.getItem("schoolData");
      if (schoolDataLs) {
        const parsed = JSON.parse(schoolDataLs);
        if (parsed.id === selectedSchoolId) {
          setDataSchool(parsed);
        } else {
          setDataSchool({});
        }
      }
    }
  }, [selectedSchoolId]);

  // Recarga las notificaciones cuando cambia colegio o ruta  
  useEffect(() => {
    if (!isClient) return;

    // Resetear inmediatamente  
    setNotificationCount(0);

    if (selectedSchoolId) {
      // Pequeño delay para evitar llamadas múltiples  
      const timer = setTimeout(() => {
        loadNotifications();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedSchoolId, pathname, loadNotifications, isClient]);

  // Escuchar eventos storage para sincronización entre pestañas (no en la misma pestaña)
  useEffect(() => {
    if (!isClient) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedSchool" || e.key === "schoolData") {
        const newSelected = localStorage.getItem("selectedSchool");
        if (newSelected !== selectedSchoolId) {
          setSelectedSchoolId(newSelected);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isClient, selectedSchoolId, setSelectedSchoolId]);

  useEffect(() => {
    if (!isClient) return;

    const handleRefreshNotifications = () => {
      if (selectedSchoolId) {
        loadNotifications();
      }
    };

    window.addEventListener('refresh-notifications', handleRefreshNotifications);
    return () => window.removeEventListener('refresh-notifications', handleRefreshNotifications);
  }, [isClient, selectedSchoolId, loadNotifications]);

  const handleBellClick = () => {
    console.log(notificationCount)
    if (notificationCount > 0 && getFuntions("Alertas")) {
      router.push("/alertas");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    try {
      if (pathname !== "/select-school")
        router.push(`/alumnos?search=${searchTerm}`);
      else setIsSearching(true);
    } catch {
      toast({
        title: "Error",
        description:
          "No se pudo realizar la búsqueda. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setSearchTerm("");
    }
  };

  const handleNavigateToProfile = () => {
    router.push("/perfil");
  };

  const handleChangeSchool = () => {
    router.push("/select-school");
  };

  const handleLogout = () => logout();

  const getFullName = () => {
    if (!profileData) return "Usuario";
    const nombres = profileData.persona?.nombres || "";
    const apellidos = profileData.persona?.apellidos || "";
    if (nombres && apellidos) return `${nombres} ${apellidos}`;
    if (nombres) return nombres;
    if (apellidos) return apellidos;
    return profileData.usuario?.nombre_social || "Usuario";
  };

  const getUserRole = () => profileData?.rol?.nombre || "Usuario";

  const getUserImageUrl = () => {
    const url =
      profileData?.usuario?.url_foto_perfil || "/confident-businessman.png";
    return url.trim() || "/confident-businessman.png";
  };

  return (
    <header className="print:hidden w-full relative h-[100px]">
      {/* Fondo SVG */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 158"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <g clipPath="url(#clip0_1640_1280)">
            <path
              d="M833.589 134.163C546.178 107.941 158.109 136.149 0 158V-62H1475V110.325C1380.95 129.196 1121 160.384 833.589 134.163Z"
              fill="#89C2F8"
            />
          </g>
          <defs>
            <clipPath id="clip0_1640_1280">
              <rect width="1440" height="158" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>

      {/* Contenido principal */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-between px-4 sm:px-8 lg:px-12"
        style={{ transform: "translateY(-10%)" }}
      >
        <div className="flex items-center gap-4 flex-shrink-0">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="text-white block md:hidden focus:outline-none p-2 ml-1"
              aria-label="Toggle navigation menu"
              type="button"
            >
              <Menu size={28} />
            </button>
          )}

          <Link href="/" className="flex items-center">
            <div className="h-10 w-auto mr-2">
              <Image
                src="/logotipo.png"
                alt="AlmaIA Logo"
                width={128}
                height={40}
                className="h-full w-auto"
              />
            </div>
          </Link>
        </div>

        {pathname !== "/select-school" && (
          <div className="flex items-center justify-between w-full max-w-2xl mx-4">
            <h2 className="hidden md:block text-xl font-semibold text-white mr-4 min-w-[180px] max-w-[220px] leading-tight">
              {dataSchool.name}
            </h2>

            <form
              onSubmit={handleSearch}
              className="relative flex-grow max-w-md"
            >
              <button
                type="submit"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                disabled={isSearching}
                aria-label="Buscar alumno"
              >
                {isSearching ? (
                  <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>

              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar alumno..."
                className="w-full pl-10 border bg-white/90 rounded-md h-9 md:h-10 text-sm md:text-base"
                disabled={isSearching}
              />
            </form>
          </div>
        )}

        <div className="flex items-center space-x-4 flex-shrink-0">
          {pathname !== "/select-school" && (
            <div
              className={`relative ${isClient && notificationCount > 0
                ? "cursor-pointer"
                : "cursor-default"
                }`}
              onClick={handleBellClick}
              role="button"
              tabIndex={0}
              aria-label={`Notificaciones: ${notificationCount}`}
            >
              <Bell className="text-white h-7 w-7 hidden sm:block" />
              {isClient && notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-3 focus:outline-none">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-full" />
                  ) : (
                    <Image
                      src={getUserImageUrl() || "/placeholder.svg"}
                      alt="Perfil de usuario"
                      width={45}
                      height={45}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="text-white text-right hidden sm:block min-w-[120px]">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <p className="text-base font-medium leading-tight">
                        {getFullName()}
                      </p>
                      <p className="text-sm text-white/80 leading-tight">
                        {getUserRole()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {pathname !== "/select-school" && (
                <DropdownMenuItem onClick={handleNavigateToProfile}>
                  Mi perfil
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleChangeSchool}>
                Cambiar colegio
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
