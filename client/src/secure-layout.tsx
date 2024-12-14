import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RootState } from "@/store";
import { UserCircle2 } from "lucide-react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import apiClient from "./api/client";
import Loader from "./components/loader";
import { Button } from "./components/ui/button";
import useControlledRouting from "./hooks/use-controlled-routing";
import { cn } from "./lib/utils";
import { baseApi } from "./store/baseApi";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { logout, user } from "./store/slices/authSlice";
import { User } from "./store/slices/userSlice";

const SecureLayout = () => {
  const auth = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useControlledRouting();

  if (!auth || !auth.token) {
    return <Navigate to="/login" />;
  }

  const handleLogout = () => {
    apiClient.post("api/accounts/logout/", {}).finally(() => {
      dispatch(logout());
      dispatch(baseApi.util.resetApiState());
      navigate("/");
    });
  };

  if (!auth.user) {
    apiClient
      .get("api/accounts/current-user")
      .then((res) => dispatch(user(res)))
      .catch(handleLogout); // Prompt to relogin if we can't get user details
  }

  // Prevent loading the app till user is persited into the store
  if (!auth.user) {
    return (
      <div className="flex w-screen h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  const currUser = auth.user as User;

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold">Secure File Share</h1>
          <div className="flex space-x-4">
            {currUser.role !== "guest" && (
              <NavLink
                to="/"
                className={({ isActive }) =>
                  cn(
                    isActive
                      ? "text-blue-300"
                      : "hover:text-blue-300 transition-colors",
                    "flex justify-center items-center"
                  )
                }
              >
                Home
              </NavLink>
            )}
            <NavLink
              to="/shared"
              className={({ isActive }) =>
                cn(
                  isActive
                    ? "text-blue-300"
                    : "hover:text-blue-300 transition-colors",
                  "flex justify-center items-center "
                )
              }
            >
              Shared
            </NavLink>
            {currUser.role !== "guest" && (
              <NavLink
                to="/revoke"
                className={({ isActive }) =>
                  cn(
                    isActive
                      ? "text-blue-300"
                      : "hover:text-blue-300 transition-colors",
                    "flex justify-center items-center "
                  )
                }
              >
                Revoke
              </NavLink>
            )}
            {currUser.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    isActive
                      ? "text-blue-300"
                      : "hover:text-blue-300 transition-colors",
                    "flex justify-center items-center "
                  )
                }
              >
                Admin
              </NavLink>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-9 px-0">
                  <UserCircle2 className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 flex-col h-full overflow-auto container mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default SecureLayout;
