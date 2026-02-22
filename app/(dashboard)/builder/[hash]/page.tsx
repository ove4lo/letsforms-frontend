import BuilderPageClient from "./_components/BuilderPageClient"; 

// Это серверный компонент
export default async function BuilderPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;

  return <BuilderPageClient hash={hash} />;
}