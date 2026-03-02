import AssetForm from '@/components/asset-form';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { getAuthSession } from '@/lib/auth-session';
import { getAsset } from '@/services/asset.service';
import { notFound } from 'next/navigation';

interface EditAssetPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const userId = session.user.id;

  const asset = await getAsset(id, userId);

  if (!asset) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col">
      <PageBreadcrumb
        segments={[
          { label: 'Bens/Ativos', href: '/assets' },
          { label: 'Editar Bem' },
        ]}
      />
      <div className="flex-1 flex items-center justify-center">
        <AssetForm asset={asset} />
      </div>
    </div>
  );
}
