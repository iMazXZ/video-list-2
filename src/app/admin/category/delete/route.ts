import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const formData = await req.formData();
  const id = Number(formData.get("id"));

  if (!id) return;

  await prisma.category.delete({ where: { id } });

  redirect("/admin/category");
}
