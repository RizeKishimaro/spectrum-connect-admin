import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyTable } from "@/components/companies/company-table"
import { CreateCompanyForm } from "@/components/companies/create-company-form"

export default function CompaniesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
        <CreateCompanyForm />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Company Management</CardTitle>
          <CardDescription>Manage your system companies and their settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyTable />
        </CardContent>
      </Card>
    </div>
  )
}
