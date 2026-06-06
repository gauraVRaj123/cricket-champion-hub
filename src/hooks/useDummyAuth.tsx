import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Role = "student" | "coach" | "admin";

type DummyUser = {
  id: string;
  email: string;
  role: Role;
  full_name?: string;
  phone?: string;
};

type Ctx = {
  user: DummyUser | null;
  loading: boolean;
  signIn: (args: { email: string; password: string }) => Promise<{ error?: string }>;
  signUp: (args: {
    full_name: string;
    phone: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const LS_KEY = "dummy_auth_user";
const LS_USERS_KEY = "dummy_auth_users";

type StoredUser = Omit<DummyUser, "id"> & { password: string };

const DefaultCtx: Ctx = {
  user: null,
  loading: true,
  signIn: async () => ({ error: "Not implemented" }),
  signUp: async () => ({ error: "Not implemented" }),
  signOut: async () => {},
};

const Ctx = createContext<Ctx>(DefaultCtx);

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(LS_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
}

function readUser(): DummyUser | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as DummyUser;
  } catch {
    return null;
  }
}

function writeUser(u: DummyUser | null) {
  if (!u) {
    localStorage.removeItem(LS_KEY);
    return;
  }
  localStorage.setItem(LS_KEY, JSON.stringify(u));
}

function ensureSeedUsers() {
  const users = readUsers();
  if (users.length) return;

  // Seed accounts for quick testing.
  const seed: StoredUser[] = [
    {
      email: "student@example.com",
      password: "password123",
      role: "student",
      full_name: "Test Student",
      phone: "9000000000",
    },
    {
      email: "coach@example.com",
      password: "password123",
      role: "coach",
      full_name: "Test Coach",
      phone: "9000000001",
    },
    {
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      full_name: "Test Admin",
      phone: "9000000002",
    },
  ];

  writeUsers(seed);
}

export function DummyAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DummyUser | null>(null);

  useEffect(() => {
    ensureSeedUsers();
    setUser(readUser());
    setLoading(false);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      user,
      loading,
      signIn: async ({ email, password }) => {
        const users = readUsers();
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!found) return { error: "Invalid email or password" };
        if (found.password !== password) return { error: "Invalid email or password" };

        const dummyUser: DummyUser = {
          id: `dummy_${found.email}`,
          email: found.email,
          role: found.role,
          full_name: found.full_name,
          phone: found.phone,
        };

        writeUser(dummyUser);
        setUser(dummyUser);
        return {};
      },
      signUp: async ({ full_name, phone, email, password, role }) => {
        const users = readUsers();
        const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) return { error: "Account already exists" };

        const newUser: StoredUser = { full_name, phone, email, password, role };
        writeUsers([...users, newUser]);

        const dummyUser: DummyUser = {
          id: `dummy_${email}`,
          email,
          role,
          full_name,
          phone,
        };
        writeUser(dummyUser);
        setUser(dummyUser);
        return {};
      },
      signOut: async () => {
        writeUser(null);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDummyAuth() {
  return useContext(Ctx);
}
