"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDebt, updateDebt } from "@/app/debts/actions"
import { useState } from "react"
import type { CreditCard, PersonCompany, Debt as DebtType } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DebtFormProps {
  debt?: DebtType // Opcional, para edição
  creditCards: CreditCard[]
  personCompanies: PersonCompany[]
}

export default function DebtForm({ debt, creditCards, personCompanies }: DebtFormProps) {
  const [cardId, setCardId] = useState(debt?.cardId || "")
  const [personCompanyId, setPersonCompanyId] = useState(debt?.personCompanyId || "")
  const [totalAmount, setTotalAmount] = useState(debt?.totalAmount.toString() || "")
  const [installmentsQuantity, setInstallmentsQuantity] = useState(debt?.installmentsQuantity.toString() || "")
  const [startDate, setStartDate] = useState(debt?.startDate.toISOString().split("T")[0] || "")
  const [description, setDescription] = useState(debt?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    try {
      if (debt) {
        await updateDebt(debt.id, formData)
        toast.success("Dívida atualizada com sucesso!")
      } else {
        await createDebt(formData)
        toast.success("Dívida criada com sucesso!")
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao salvar a dívida.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{debt ? "Editar Dívida" : "Nova Dívida/Despesa"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cardId">Cartão</Label>
            <Select name="cardId" value={cardId} onValueChange={setCardId} required>
              <SelectTrigger id="cardId">
                <SelectValue placeholder="Selecione um cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={card.id}>
                    {card.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="personCompanyId">Pessoa/Empresa</Label>
            <Select name="personCompanyId" value={personCompanyId} onValueChange={setPersonCompanyId} required>
              <SelectTrigger id="personCompanyId">
                <SelectValue placeholder="Selecione uma pessoa/empresa" />
              </SelectTrigger>
              <SelectContent>
                {personCompanies.map((pc) => (
                  <SelectItem key={pc.id} value={pc.id}>
                    {pc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="totalAmount">Valor Total da Dívida</Label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              step="0.01"
              placeholder="Ex: 1200.50"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="installmentsQuantity">Quantidade de Parcelas</Label>
            <Input
              id="installmentsQuantity"
              name="installmentsQuantity"
              type="number"
              min="1"
              placeholder="Ex: 12"
              value={installmentsQuantity}
              onChange={(e) => setInstallmentsQuantity(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDate">Data de Início (Opcional)</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Deixe em branco para usar o mês atual como início.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição/Título da Dívida</Label>
            <Input
              id="description"
              name="description"
              placeholder="Ex: Notebook Dell, Viagem RJ"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Dívida"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
