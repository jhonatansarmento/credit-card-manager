import CreditCardForm from '@/components/credit-card-form';
import { PageBreadcrumb } from '@/components/page-breadcrumb';

export default function NewCreditCardPage() {
  return (
    <div className="flex-1 flex flex-col">
      <PageBreadcrumb
        segments={[
          { label: 'Cartões', href: '/cards' },
          { label: 'Novo Cartão' },
        ]}
      />
      <div className="flex-1 flex items-center justify-center">
        <CreditCardForm />
      </div>
    </div>
  );
}
