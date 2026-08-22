import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user: authUser }, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
  });

  if (!user) {
    // If they signed up through Supabase but haven't been created in Prisma yet,
    // this shouldn't happen if we use a trigger or handle it in the signup route.
    redirect("/login");
  }

  return user;
}
