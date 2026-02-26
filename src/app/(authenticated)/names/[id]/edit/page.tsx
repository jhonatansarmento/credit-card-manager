import { PageBreadcrumb } from '@/components/page-breadcrumb';
import PersonCompanyForm from '@/components/person-company-form';
import { getAuthSession } from '@/lib/auth-session';
import { getName } from '@/services/name.service';
import { notFound } from 'next/navigation';

interface EditPersonCompanyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPersonCompanyPage({
  params,
}: EditPersonCompanyPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const userId = session.user.id;

  const personCompany = await getName(id, userId);

  if (!personCompany) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col">
      <PageBreadcrumb
        segments={[
          { label: 'Nomes', href: '/names' },
          { label: 'Editar Nome' },
        ]}
      />
      <div className="flex-1 flex items-center justify-center">
        <PersonCompanyForm personCompany={personCompany} />
      </div>
    </div>
  );
}
