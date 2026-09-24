export function friendlyError(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : ''
  if (code.includes('wrong-password') || code.includes('invalid-credential')) return 'Password incorreta. Tenta novamente.'
  if (code.includes('network-request-failed') || !navigator.onLine) return 'Sem ligação à Internet. Verifica a ligação e tenta novamente.'
  if (code.includes('permission-denied')) return 'Não foi possível guardar a alteração. Confirma as permissões do projeto.'
  if (error instanceof Error && error.message.startsWith('APP:')) return error.message.slice(4)
  return 'Não foi possível concluir a operação. Tenta novamente.'
}
