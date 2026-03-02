import AssetForm from '@/components/asset-form';
import { PageBreadcrumb } from '@/components/page-breadcrumb';

export default function NewAssetPage() {
  return (
    <div className="flex-1 flex flex-col">
      <PageBreadcrumb
        segments={[
          { label: 'Bens/Ativos', href: '/assets' },
          { label: 'Novo Bem' },
        ]}
      />
      <div className="flex-1 flex items-center justify-center">
        <AssetForm />
      </div>
    </div>
  );
}
