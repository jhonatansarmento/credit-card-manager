import Navbar from "@/components/navbar"
import CreditCardForm from "@/components/credit-card-form"

export default function NewCreditCardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <CreditCardForm />
      </main>
    </div>
  )
}
