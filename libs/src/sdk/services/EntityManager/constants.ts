import type { EntityManagerConfig } from './types'
import { productionConfig } from '../../config'
import { DiscoveryNodeSelector } from '../DiscoveryNodeSelector'
import { Logger } from '../Logger'

export const defaultEntityManagerConfig: EntityManagerConfig = {
  contractAddress: productionConfig.entityManagerContractAddress,
  web3ProviderUrl: productionConfig.web3ProviderUrl,
  identityServiceUrl: productionConfig.identityServiceUrl,
  discoveryNodeSelector: new DiscoveryNodeSelector(),
  logger: new Logger()
}

export const DEFAULT_GAS_LIMIT = 2000000
export const CONFIRMATION_POLLING_INTERVAL = 2000
export const CONFIRMATION_TIMEOUT = 45000
