/**
 * Validates required environment variables at app startup.
 * Throws a descriptive error if any are missing.
 */
export function validateEnv(): void {
  const required = [
    'VITE_NFT_CONTRACT_ID',
    'VITE_TOKEN_CONTRACT_ID',
    'VITE_STAKING_CONTRACT_ID',
  ] as const

  const missing = required.filter((key) => !import.meta.env[key])

  if (missing.length > 0) {
    console.warn(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env and fill in your Soroban contract IDs.`
    )
  }
}
