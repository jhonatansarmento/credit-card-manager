import { PageBreadcrumb } from '@/components/page-breadcrumb';
import PersonCompanyForm from '@/components/person-company-form';

export default function NewPersonCompanyPage() {
  return (
    <div className="flex-1 flex flex-col">
      <PageBreadcrumb
        segments={[{ label: 'Nomes', href: '/names' }, { label: 'Novo Nome' }]}
      />
      <div className="flex-1 flex items-center justify-center">
        <PersonCompanyForm />
      </div>
    </div>
  );
}
