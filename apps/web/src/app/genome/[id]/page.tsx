import { notFound } from "next/navigation";
import { getGenome } from "@/lib/api/engine";
import { ForensicReport } from "@/components/report/ForensicReport";

export const dynamic = "force-dynamic";

export default async function GenomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genome = await getGenome(id);
  if (!genome) notFound();
  return <ForensicReport genome={genome} />;
}
