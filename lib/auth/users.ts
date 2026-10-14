export type UserRole = "ADMIN" | "VIEWER";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface MockUserWithPassword extends MockUser {
  password: string; // Demo password (not for production)
}

export const MOCK_USERS: MockUserWithPassword[] = [
  {
    id: "usr_admin_01",
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin123!",
    role: "ADMIN",
  },
  {
    id: "usr_viewer_01",
    name: "Viewer User",
    email: "viewer@example.com",
    password: "Viewer123!",
    role: "VIEWER",
  },
];

/**
 * Validates credentials against mock user store.
 * Returns public MockUser object without password, or null if invalid.
 */
export function findUserByCredentials(
  email?: string | null,
  password?: string | null
): MockUser | null {
  if (!email || !password) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

/**
 * Finds user by ID from mock user store.
 */
export function findUserById(id: string): MockUser | null {
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

