import { format, formatDistanceToNowStrict } from 'date-fns'
import { pt } from 'date-fns/locale'
import type { Timestamp } from 'firebase/firestore'

export function formatDate(value: Timestamp | null) {
  return value ? format(value.toDate(), "dd/MM/yyyy, HH:mm", { locale: pt }) : 'agora'
}

export function formatRelativeDate(value: Timestamp | null) {
  return value ? `há ${formatDistanceToNowStrict(value.toDate(), { locale: pt })}` : 'agora'
}
