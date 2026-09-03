import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true, account: true },
      orderBy: { occurredAt: "desc" },
    });

    if (format === "json") {
      const jsonContent = JSON.stringify(transactions, null, 2);
      return new NextResponse(jsonContent, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="financeflow-export-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    // CSV format
    const headers = ["Date", "Type", "Amount (INR)", "Category", "Account", "Merchant", "Notes"];
    const rows = transactions.map((t) => [
      new Date(t.occurredAt).toISOString().split("T")[0],
      t.type,
      (t.amount / 100).toFixed(2),
      `"${(t.category?.name || "Uncategorized").replace(/"/g, '""')}"`,
      `"${(t.account?.name || "Cash").replace(/"/g, '""')}"`,
      `"${(t.merchant || "").replace(/"/g, '""')}"`,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="financeflow-transactions-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
