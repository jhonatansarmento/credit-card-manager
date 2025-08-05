"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createCreditCard, updateCreditCard } from "@/app/cards/actions"
import { useState } from "react"
import type { CreditCard as CreditCardType } from "@prisma/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface CreditCardFormProps {
  card?: CreditCardType // Opcional, para edição
}

export default function CreditCardForm({ card }: CreditCardFormProps) {
  const [name, setName] = useState(card?.name || "")
  const [dueDay, setDueDay] = useState(card?.dueDay.toString() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    try {
      if (card) {
        await updateCreditCard(card.id, formData)
        toast.success("Cartão atualizado com sucesso!")
      } else {
        await createCreditCard(formData)
        toast.success("Cartão criado com sucesso!")
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao salvar o cartão.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{card ? "Editar Cartão de Crédito" : "Novo Cartão de Crédito"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ex: Nubank, Inter Mastercard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDay">Dia de Vencimento</Label>
            <Input
              id="dueDay"
              name="dueDay"
              type="number"
              placeholder="Ex: 10 (para dia 10 do mês)"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Cartão"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
