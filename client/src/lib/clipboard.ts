export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const fallback = document.createElement('textarea')
      fallback.value = text
      document.body.appendChild(fallback)
      fallback.select()
      const ok = document.execCommand('copy')
      fallback.remove()
      return ok
    } catch {
      return false
    }
  }
}
