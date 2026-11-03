import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { loginAdmin } from "@/lib/api";
import { clearSession, getSession, saveSession, subscribeToSession } from "@/lib/admin-session";

const AdminContext = createContext(null);

/**
 * Admin access is the password-protected Apps Script session. There are no
 * user accounts anymore: a valid token means "administrator".
 */
export function AdminProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => subscribeToSession(() => setSession(getSession())), []);

  const value = useMemo(
    () => ({
      isAdmin: Boolean(session),
      login: async (password) => {
        const data = await loginAdmin(password);
        saveSession(data.token, data.expiresIn);
        setSession(getSession());
      },
      logout: () => clearSession(),
    }),
    [session],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used inside <AdminProvider>");
  return context;
}
