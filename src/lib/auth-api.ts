import { getApiUrl } from "@/lib/api-url";
import type { User } from "@/contexts/AuthContext";

interface AuthSuccess {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
  };
}

interface AuthError {
  success: false;
  message?: string;
}

type AuthResponse = AuthSuccess | AuthError;

export async function exchangeFirebaseToken(idToken: string): Promise<AuthSuccess["data"]> {
  const response = await fetch(getApiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "firebase", idToken }),
  });

  const payload = (await response.json().catch(() => null)) as AuthResponse | null;

  if (!response.ok || payload?.success !== true) {
    const message = payload?.success === false ? payload.message : undefined;
    throw new Error(message || "Não foi possível concluir a autenticação com o servidor.");
  }

  return payload.data;
}
