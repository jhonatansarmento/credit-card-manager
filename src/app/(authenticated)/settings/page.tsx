import { getAuthSession } from '@/lib/auth-session';
import {
  listCategories,
  seedDefaultCategories,
} from '@/services/category.service';
import { SettingsContent } from './_components/settings-content';

export default async function SettingsPage() {
  const session = await getAuthSession();
  const userId = session.user.id;

  let categories = await listCategories(userId);
  if (categories.length === 0) {
    await seedDefaultCategories(userId);
    categories = await listCategories(userId);
  }

  return (
    <SettingsContent
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        color: c.color,
      }))}
    />
  );
}
