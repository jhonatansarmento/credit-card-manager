import IncomeForm from '@/components/income-form';
import { PageBreadcrumb } from '@/components/page-breadcrumb';

export default function NewIncomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <PageBreadcrumb
        segments={[
          { label: 'Proventos', href: '/incomes' },
          { label: 'Novo Provento' },
        ]}
      />
      <div className="flex-1 flex items-center justify-center">
        <IncomeForm />
      </div>
    </div>
  );
}
