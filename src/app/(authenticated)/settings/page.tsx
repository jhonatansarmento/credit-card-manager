import { getAuthSession } from '@/lib/auth-session';
import { SettingsContent } from './_components/settings-content';

export default async function SettingsPage() {
  const session = await getAuthSession();

  return (
    <SettingsContent
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    />
  );
}
