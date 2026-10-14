"use server";

import { findUserByCredentials } from "@/lib/auth/users";
import { createSession, clearSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export interface LoginFormState {
  error?: string;
  email?: string;
}

export async function loginAction(
  prevState: LoginFormState | null,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email.trim() || !password.trim()) {
    return {
      error: "Please enter both email and password.",
      email,
    };
  }

  const user = findUserByCredentials(email, password);
  if (!user) {
    return {
      error: "Invalid email or password. Please verify your demo credentials.",
      email,
    };
  }

  await createSession(user);
  redirect("/transactions");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

