import FormPageClient from "./_components/FormPageClient";

// Это серверный компонент
export default async function FormPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;

  return <FormPageClient hash={hash} />;
}