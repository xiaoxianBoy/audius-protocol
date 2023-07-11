import type { AuthService } from '../Auth'
import type { TransactionReceipt } from 'web3-core'
import type { DiscoveryNodeSelectorService } from '../DiscoveryNodeSelector'

export type EntityManagerConfig = {
  contractAddress: string
  web3ProviderUrl: string
  identityServiceUrl: string
  discoveryNodeSelector: DiscoveryNodeSelectorService
}

export type EntityManagerService = {
  manageEntity: (
    options: ManageEntityOptions
  ) => Promise<{ txReceipt: TransactionReceipt }>
  confirmWrite: (options: {
    blockHash: string
    blockNumber: number
    confirmationTimeout?: number
    confirmationPollingInterval?: number
  }) => Promise<boolean>
  getCurrentBlock: () => Promise<{ timestamp: number }>
}

export enum Action {
  CREATE = 'Create',
  UPDATE = 'Update',
  DELETE = 'Delete',
  VERIFY = 'Verify',
  FOLLOW = 'Follow',
  UNFOLLOW = 'Unfollow',
  SAVE = 'Save',
  UNSAVE = 'Unsave',
  REPOST = 'Repost',
  UNREPOST = 'Unrepost',
  SUBSCRIBE = 'Subscribe',
  UNSUBSCRIBE = 'Unsubscribe',
  VIEW = 'View',
  VIEW_PLAYLIST = 'ViewPlaylist'
}

export enum EntityType {
  PLAYLIST = 'Playlist',
  TRACK = 'Track',
  USER = 'User',
  USER_REPLICA_SET = 'UserReplicaSet',
  NOTIFICATION = 'Notification',
  DEVELOPER_APP = 'DeveloperApp',
  GRANT = 'Grant'
}

export type WriteOptions = {
  /**
   * Timeout confirmation of the write
   */
  confirmationTimeout?: number
  /**
   * Skip confirmation of the write
   */
  skipConfirmation?: boolean
}

export type ManageEntityOptions = {
  /**
   * The numeric user id
   */
  userId: number
  /**
   * The type of entity being modified
   */
  entityType: EntityType
  /**
   * The id of the entity
   */
  entityId: number
  /**
   * Action being performed on the entity
   */
  action: Action
  /**
   * Metadata associated with the action
   */
  metadata?: string
  /**
   * An instance of AuthService
   */
  auth: AuthService
} & WriteOptions

export enum BlockConfirmation {
  CONFIRMED = 'CONFIRMED',
  DENIED = 'DENIED',
  UNKNOWN = 'UNKNOWN'
}
