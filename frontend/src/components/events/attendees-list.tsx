'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { useTranslations } from 'next-intl'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VALIDATE_TICKET_MUTATION } from '@/graphql/events/mutations'
import type { TicketType } from '@/graphql/events/types'

interface AttendeesListProps {
  tickets: TicketType[]
}

interface ValidateTicketData {
  validateTicket: TicketType
}

export function AttendeesList({ tickets: initialTickets }: AttendeesListProps) {
  const t = useTranslations('events')
  const [tickets, setTickets] = useState(initialTickets)
  const [validatingId, setValidatingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [validateTicket] = useMutation<ValidateTicketData>(VALIDATE_TICKET_MUTATION, {
    onCompleted: (data) => {
      setTickets((prev) =>
        prev.map((tk) => (tk.qrCode === data.validateTicket.qrCode ? data.validateTicket : tk)),
      )
      setValidatingId(null)
    },
    onError: (err) => {
      setError(err.message)
      setValidatingId(null)
    },
  })

  const handleValidate = (qrCode: string) => {
    setValidatingId(qrCode)
    setError('')
    void validateTicket({ variables: { qrCode } })
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ticket ID</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{ticket.user?.name ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{ticket.user?.email ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                  {ticket.id}
                </td>
                <td className="px-4 py-3">
                  {ticket.used ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      {t('used')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {t('valid')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!ticket.used && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={validatingId === ticket.qrCode}
                      onClick={() => handleValidate(ticket.qrCode)}
                    >
                      {t('validate')}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('noTickets')}</div>
        )}
      </div>
    </div>
  )
}
