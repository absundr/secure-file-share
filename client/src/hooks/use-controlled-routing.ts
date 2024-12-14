import { useAppSelector } from "@/store/hooks";
import { User } from "@/store/slices/userSlice";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const allowedPages = {
  admin: ["/", "/shared", "/revoke", "/admin"],
  user: ["/", "/shared", "/revoke"],
  guest: ["/shared"],
};

function useControlledRouting() {
  const user = useAppSelector((store) => store.auth.user) as unknown as User;
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      const role = user.role as keyof typeof allowedPages;
      if (!allowedPages[role].includes(location.pathname)) {
        navigate(allowedPages[role][0]);
      }
    }
  }, [user, navigate, location.pathname]);
}

export default useControlledRouting;
