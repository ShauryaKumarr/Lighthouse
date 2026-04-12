import { BeamDetailClient } from "./BeamDetailClient";

export function generateStaticParams() {
  return Array.from({ length: 20 }, (_, i) => ({
    requestIndex: String(i),
  }));
}

export default async function BeamDetailPage({
  params,
}: {
  params: Promise<{ requestIndex: string }>;
}) {
  const { requestIndex } = await params;
  return <BeamDetailClient requestIndex={requestIndex} />;
}
