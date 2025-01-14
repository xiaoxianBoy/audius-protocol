import {
  USDCPurchaseConditions,
  UserTrackMetadata,
  ComputedTrackProperties
} from '~/models/Track'

/** Denotes the 3 preset amounts to show on the form, values are in cents. */
export type PayExtraAmountPresetValues = {
  [PayExtraPreset.LOW]: number
  [PayExtraPreset.MEDIUM]: number
  [PayExtraPreset.HIGH]: number
}

export enum PayExtraPreset {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CUSTOM = 'custom',
  NONE = 'none'
}

export type PurchaseableTrackStreamMetadata = UserTrackMetadata &
  ComputedTrackProperties & {
    stream_conditions: USDCPurchaseConditions
  }

export type PurchaseableTrackDownloadMetadata = UserTrackMetadata &
  ComputedTrackProperties & {
    download_conditions: USDCPurchaseConditions
  }

export type PurchaseableTrackMetadata =
  | PurchaseableTrackStreamMetadata
  | PurchaseableTrackDownloadMetadata

export type USDCPurchaseConfig = {
  minContentPriceCents: number
  maxContentPriceCents: number
  minUSDCPurchaseAmountCents: number
  maxUSDCPurchaseAmountCents: number
}

export type PurchasePage = 'purchase' | 'crypto-transfer'
