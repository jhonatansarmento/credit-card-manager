"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface DeleteButtonProps {
  itemId: string
  action: (id: string) => Promise<void>
}

export default function DeleteButton({ itemId, action }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      setIsDeleting(true)
      try {
        await action(itemId)
        toast.success("Item excluído com sucesso!")
      } catch (error: any) {
        toast.error(error.message || "Ocorreu um erro ao excluir o item.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Excluir</span>
    </Button>
  )
}
