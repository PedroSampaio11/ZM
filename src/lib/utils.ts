import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sanitize an external image URL: upgrade http→https, handle protocol-relative, reject blank/non-http
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  const raw = url?.trim()
  if (!raw) return null
  const lower = raw.toLowerCase()
  if (lower.startsWith('http://')) return 'https://' + raw.slice(7)
  if (lower.startsWith('https://')) return raw
  if (raw.startsWith('//')) return 'https:' + raw
  return null
}

// Sanitize a whole array: clean each URL, deduplicate, drop nulls
export function sanitizeImages(urls: string[] | null | undefined): string[] {
  return [...new Set((urls ?? []).map(sanitizeImageUrl).filter((u): u is string => u !== null))]
}

// Get two-letter initials: "Lucas S." → "LS", "Fernanda" → "F"
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0]?.toUpperCase() ?? ''
  if (parts.length === 1) return first
  const last = parts[parts.length - 1].replace(/\./g, '')[0]?.toUpperCase() ?? ''
  return first + last
}
