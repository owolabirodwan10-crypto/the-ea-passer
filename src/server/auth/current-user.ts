import { cookies } from "next/headers";
import { getSessionUser } from "@/server/auth/session";

export async function getCurrentUser() {
  const token = cookies().get("eapaser_session")?.value;
  return getSessionUser(token);
}
