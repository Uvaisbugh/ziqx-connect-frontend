import { connection } from 'next/server';
import { TemplatesScreen } from '@/components/templates/TemplatesScreen';
import { loadTemplates } from '@/lib/whatsapp/templates';

export default async function TemplatesRoute() {
  await connection();
  const { items: templates, error } = await loadTemplates();
  return <TemplatesScreen templates={templates} loadError={error} />;
}
