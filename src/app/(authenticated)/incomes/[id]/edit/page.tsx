import IncomeForm from '@/components/income-form';
import { PageBreadcrumb } from '@/components/page-breadcrumb';
import { getAuthSession } from '@/lib/auth-session';
import { getIncome } from '@/services/income.service';
import { notFound } from 'next/navigation';

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAuthSession();
  const income = await getIncome(id, session.user.id);

  if (!income) notFound();

  // Serialize for client component
  const serialized = {
    id: income.id,
    name: income.name,
    description: income.description,
    amount: Number(income.amount),
    incomeType: income.incomeType,
    isRecurring: income.isRecurring,
    receiveDay: income.receiveDay,
    startDate: income.startDate
      ? new Date(income.startDate).toISOString().split('T')[0]
      : '',
    endDate: income.endDate
      ? new Date(income.endDate).toISOString().split('T')[0]
      : '',
  };

  return (
    <div className="flex-1 flex flex-col">
      <PageBreadcrumb
        segments={[
          { label: 'Proventos', href: '/incomes' },
          { label: income.name, href: `/incomes/${income.id}` },
          { label: 'Editar' },
        ]}
      />
      <div className="flex-1 flex items-center justify-center">
        <IncomeForm income={serialized} />
      </div>
    </div>
  );
}
