import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { UNIVERSITIES } from "@/lib/data";
import UniDetail from "@/components/universities/UniDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const uni = UNIVERSITIES.find((u) => u.id === Number(id));
  return {
    title: uni ? `${uni.name} — AdmitGH` : "University — AdmitGH",
  };
}

export default async function UniversityDetailPage({ params }: Props) {
  const { id } = await params;
  const uni = UNIVERSITIES.find((u) => u.id === Number(id));

  if (!uni) notFound();

  return <UniDetail uni={uni} />;
}
