import { sdk, AudiusSdk } from '@audius/sdk'
import { keccak_256 } from '@noble/hashes/sha3'
import * as secp from '@noble/secp256k1'
import { signTypedData } from 'eth-sig-util'

import { waitForLibsInit } from 'services/audius-backend/eagerLoadUtils'
import { discoveryNodeSelectorService } from 'services/discovery-node-selector'
import { entityManagerInstance } from 'services/entity-manager'

declare global {
  interface Window {
    audiusLibs: any
    audiusSdk: AudiusSdk
  }
}

let inProgress = false
const SDK_LOADED_EVENT_NAME = 'AUDIUS_SDK_LOADED'

const initSdk = async () => {
  inProgress = true
  const audiusSdk = sdk({
    appName: 'audius-client',
    services: {
      discoveryNodeSelector: await discoveryNodeSelectorService.getInstance(),
      entityManager: entityManagerInstance,
      auth: {
        sign: async (data) => {
          await waitForLibsInit()
          return await secp.sign(
            keccak_256(data),
            window.audiusLibs.hedgehog.getWallet().privateKey,
            {
              recovered: true,
              der: false
            }
          )
        },
        signTransaction: async (data) => {
          await waitForLibsInit()
          return signTypedData(
            Buffer.from(
              window.audiusLibs.hedgehog.getWallet().privateKey,
              'hex'
            ),
            {
              data: data as any
            }
          )
        },
        getSharedSecret: async (publicKey: string | Uint8Array) => {
          await waitForLibsInit()
          return secp.getSharedSecret(
            window.audiusLibs.hedgehog.getWallet().privateKey,
            publicKey,
            true
          )
        },
        getAddress: async () => {
          await waitForLibsInit()
          return window.audiusLibs?.hedgehog?.wallet.getAddressString() ?? ''
        }
      }
    }
  })
  window.audiusSdk = audiusSdk
  inProgress = false
  window.dispatchEvent(new CustomEvent(SDK_LOADED_EVENT_NAME))
  return audiusSdk
}

export const audiusSdk = async () => {
  if (inProgress) {
    await new Promise((resolve) => {
      window.addEventListener(SDK_LOADED_EVENT_NAME, resolve)
    })
  } else if (!window.audiusSdk) {
    return await initSdk()
  }
  return window.audiusSdk
}
