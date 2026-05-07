import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'

type EncryptedBlob = { __enc: 1; iv: string; tag: string; data: string }

function getKey(): Buffer {
  const hex = process.env.CREDENTIALS_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error(
      'CREDENTIALS_ENCRYPTION_KEY ausente ou inválida. Deve ser uma string hex de 64 chars (32 bytes). ' +
      'Gere com: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    )
  }
  return Buffer.from(hex, 'hex')
}

export function encryptCredentials(plain: Record<string, string>): EncryptedBlob {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(plain))),
    cipher.final(),
  ])
  return {
    __enc: 1,
    iv:   iv.toString('hex'),
    tag:  cipher.getAuthTag().toString('hex'),
    data: encrypted.toString('hex'),
  }
}

export function decryptCredentials(stored: Record<string, unknown>): Record<string, string> {
  // Compatibilidade retroativa: se não tem __enc, é JSON puro (pre-encryption)
  if (!stored['__enc']) return stored as Record<string, string>

  const key = getKey()
  const blob = stored as EncryptedBlob
  const decipher = createDecipheriv(ALGO, key, Buffer.from(blob.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(blob.tag, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(blob.data, 'hex')),
    decipher.final(),
  ])
  return JSON.parse(decrypted.toString()) as Record<string, string>
}
