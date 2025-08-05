import Navbar from "@/components/navbar"
import PersonCompanyForm from "@/components/person-company-form"

export default function NewPersonCompanyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <PersonCompanyForm />
      </main>
    </div>
  )
}
