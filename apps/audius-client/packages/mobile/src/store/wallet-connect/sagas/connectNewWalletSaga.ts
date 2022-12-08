import type { WalletAddress } from '@audius/common'
import {
  accountSelectors,
  Chain,
  getContext,
  tokenDashboardPageActions
} from '@audius/common'
import bs58 from 'bs58'
import { checkIsNewWallet } from 'common/store/pages/token-dashboard/checkIsNewWallet'
import { getWalletInfo } from 'common/store/pages/token-dashboard/getWalletInfo'
import { Linking } from 'react-native'
import nacl from 'tweetnacl'
import { takeEvery, select, put, call } from 'typed-redux-saga'

import { getDappKeyPair } from '../selectors'
import {
  connectNewWallet,
  setConnectionStatus,
  setPublicKey,
  setSession,
  setSharedSecret
} from '../slice'
import type { ConnectNewWalletAction } from '../types'
import { buildUrl, decryptPayload, encryptPayload } from '../utils'
const { setIsConnectingWallet } = tokenDashboardPageActions
const { getUserId } = accountSelectors

export function* convertToChecksumAddress(address: WalletAddress) {
  const audiusBackend = yield* getContext('audiusBackendInstance')
  const audiusLibs = yield* call(audiusBackend.getAudiusLibs)
  const ethWeb3 = audiusLibs.ethWeb3Manager.getWeb3()
  return ethWeb3.utils.toChecksumAddress(address)
}

function* connectNewWalletAsync(action: ConnectNewWalletAction) {
  const accountUserId = yield* select(getUserId)
  if (!accountUserId) return

  const message = `AudiusUserID:${accountUserId}`

  switch (action.payload.connectionType) {
    case null:
      console.error('No connection type set')
      break
    case 'phantom': {
      const { phantom_encryption_public_key, data, nonce } = action.payload
      const dappKeyPair = yield* select(getDappKeyPair)

      if (!dappKeyPair) return

      const sharedSecretDapp = nacl.box.before(
        bs58.decode(phantom_encryption_public_key),
        dappKeyPair.secretKey
      )
      const connectData = decryptPayload(data, nonce, sharedSecretDapp)
      const { session, public_key } = connectData

      const isNewWallet = yield* checkIsNewWallet(public_key, Chain.Sol)
      if (!isNewWallet) return

      const { balance, collectibleCount } = yield* getWalletInfo(
        public_key,
        Chain.Sol
      )

      yield* put(
        setSharedSecret({ sharedSecret: bs58.encode(sharedSecretDapp) })
      )
      yield* put(setSession({ session }))
      yield* put(setPublicKey({ publicKey: public_key }))
      yield* put(
        setIsConnectingWallet({
          wallet: public_key,
          chain: Chain.Sol,
          balance,
          collectibleCount
        })
      )

      const payload = {
        session,
        message: bs58.encode(Buffer.from(message))
      }

      const [nonce2, encryptedPayload] = encryptPayload(
        payload,
        sharedSecretDapp
      )

      const urlParams = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        nonce: bs58.encode(nonce2),
        redirect_link: 'audius://wallet-sign-message',
        payload: bs58.encode(encryptedPayload)
      })

      const url = buildUrl('signMessage', urlParams)
      Linking.openURL(url)
      break
    }
    case 'solana-phone-wallet-adapter': {
      // Solana phone wallet adapter supports a single
      // connect + signMessage, so nothing is necessary at this stage.
      break
    }
    case 'wallet-connect': {
      const { publicKey } = action.payload
      const wallet = yield* call(convertToChecksumAddress, publicKey)

      const isNewWallet = yield* checkIsNewWallet(wallet, Chain.Eth)
      if (!isNewWallet) return

      const { balance, collectibleCount } = yield* getWalletInfo(
        wallet,
        Chain.Eth
      )

      yield* put(
        setIsConnectingWallet({
          wallet,
          chain: Chain.Eth,
          balance,
          collectibleCount
        })
      )

      yield* put(setConnectionStatus({ status: 'connected' }))

      break
    }
  }
}

export function* watchConnectNewWallet() {
  yield* takeEvery(connectNewWallet.type, connectNewWalletAsync)
}
