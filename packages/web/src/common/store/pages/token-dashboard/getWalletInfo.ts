import { Chain } from '@audius/common/models'
import { getContext } from '@audius/common/store'
import { call } from 'typed-redux-saga'

import {
  fetchOpenSeaNftsForWallets,
  fetchSolanaCollectiblesForWallets
} from 'common/store/profile/sagas'

export function* getWalletInfo(walletAddress: string, chain: Chain) {
  const walletClient = yield* getContext('walletClient')

  const [{ balance }] = yield* call(
    [
      walletClient,
      chain === Chain.Eth ? 'getEthWalletBalances' : 'getSolWalletBalances'
    ],
    [walletAddress]
  )

  const collectiblesMap = (yield* call(
    chain === Chain.Eth
      ? fetchOpenSeaNftsForWallets
      : fetchSolanaCollectiblesForWallets,
    [walletAddress]
  )) as Record<string, string[]>

  const collectibleCount = collectiblesMap[walletAddress]?.length ?? 0

  return { balance, collectibleCount }
}
