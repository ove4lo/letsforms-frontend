import ResponsesPageClient from "./_components/ResponsesPageClient"; 

// Это серверный компонент
export default async function ResponsesPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;

  return <ResponsesPageClient hash={hash} />;
}