import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  Address,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk'
import { getContractConfig } from './config'
import { TX_POLL_MAX_ATTEMPTS, TX_POLL_INTERVAL_MS } from '../constants'

export async function getServer(): Promise<SorobanRpc.Server> {
  const config = getContractConfig()
  return new SorobanRpc.Server(config.rpcUrl, { allowHttp: false })
}

/**
 * Build and simulate a Soroban contract call.
 * Returns the XDR string ready for signing.
 */
export async function buildContractCall(
  publicKey: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[] = []
): Promise<string> {
  const config = getContractConfig()
  const server = await getServer()
  const account = await server.getAccount(publicKey)

  const contract = new Contract(contractId)
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Simulation failed: ${simResult.error}`)
  }

  const preparedTx = SorobanRpc.assembleTransaction(tx, simResult).build()
  return preparedTx.toXDR()
}

/**
 * Submit a signed XDR transaction and wait for confirmation.
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
  const server = await getServer()
  const tx = TransactionBuilder.fromXDR(
    signedXdr,
    getContractConfig().networkPassphrase
  )
  const result = await server.sendTransaction(tx)

  if (result.status === 'ERROR') {
    throw new Error(`Transaction failed: ${result.errorResult?.toXDR()}`)
  }

  // Poll for confirmation
  let attempts = 0
  while (attempts < TX_POLL_MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, TX_POLL_INTERVAL_MS))
    const status = await server.getTransaction(result.hash)
    if (status.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return result.hash
    }
    if (status.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Transaction failed on-chain')
    }
    attempts++
  }
  throw new Error('Transaction confirmation timeout')
}

/**
 * Read-only contract call (no signing needed).
 */
export async function readContract(
  publicKey: string,
  contractId: string,
  method: string,
  args: xdr.ScVal[] = []
): Promise<unknown> {
  const config = getContractConfig()
  const server = await getServer()
  const account = await server.getAccount(publicKey)

  const contract = new Contract(contractId)
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const simResult = await server.simulateTransaction(tx)
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(`Read failed: ${simResult.error}`)
  }

  const returnVal = (simResult as SorobanRpc.Api.SimulateTransactionSuccessResponse).result?.retval
  return returnVal ? scValToNative(returnVal) : null
}

export { nativeToScVal, Address }
