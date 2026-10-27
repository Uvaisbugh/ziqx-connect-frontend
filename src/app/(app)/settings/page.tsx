import { connection } from 'next/server';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { loadAccount } from '@/lib/whatsapp/templates';

export default async function SettingsRoute() {
  await connection();
  const account = await loadAccount();
  return <SettingsPage whatsappAccount={account} />;
}
