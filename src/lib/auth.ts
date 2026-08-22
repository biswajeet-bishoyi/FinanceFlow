import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireUser(includeProfile = false) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    redirect("/login");
  }

  const user = await prisma.user.findFirst({
    where: { authId: authUser.id },
    include: includeProfile ? { profile: true } : undefined
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}
