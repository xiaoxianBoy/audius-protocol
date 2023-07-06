import type { AuthService, StorageService } from '../../services'
import snakecaseKeys from 'snakecase-keys'
import {
  Action,
  EntityManagerService,
  EntityType,
  WriteOptions
} from '../../services/EntityManager/types'
import { parseRequestParameters } from '../../utils/parseRequestParameters'
import {
  Configuration,
  PlaylistsApi as GeneratedPlaylistsApi
} from '../generated/default'
import {
  createUploadPlaylistSchema,
  DeletePlaylistRequest,
  DeletePlaylistSchema,
  PlaylistMetadata,
  PlaylistTrackMetadata,
  RepostPlaylistRequest,
  RepostPlaylistSchema,
  SavePlaylistRequest,
  SavePlaylistSchema,
  UnrepostPlaylistSchema,
  UnsavePlaylistRequest,
  UnsavePlaylistSchema,
  UploadPlaylistRequest
} from './types'
import { retry3 } from '../../utils/retry'
import { generateMetadataCidV1 } from '../../utils/cid'
import { TrackUploadHelper } from '../tracks/TrackUploadHelper'

export class PlaylistsApi extends GeneratedPlaylistsApi {
  private readonly trackUploadHelper: TrackUploadHelper

  constructor(
    configuration: Configuration,
    private readonly storage: StorageService,
    private readonly entityManager: EntityManagerService,
    private readonly auth: AuthService
  ) {
    super(configuration)
    this.trackUploadHelper = new TrackUploadHelper(configuration)
  }

  /**
   * Upload a playlist or album
   */
  async uploadPlaylist(
    requestParameters: UploadPlaylistRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const {
      userId,
      trackFiles,
      coverArtFile,
      metadata,
      trackMetadatas: parsedTrackMetadatas,
      onProgress
    } = parseRequestParameters(
      'uploadPlaylist',
      createUploadPlaylistSchema()
    )(requestParameters)

    // Upload track audio and cover art to storage node
    const [coverArtResponse, ...audioResponses] = await Promise.all([
      retry3(
        async () =>
          await this.storage.uploadFile({
            file: coverArtFile,
            onProgress,
            template: 'img_square'
          }),
        (e) => {
          console.log('Retrying uploadTrackCoverArt', e)
        }
      ),
      ...trackFiles.map((trackFile) =>
        retry3(
          async () =>
            await this.storage.uploadFile({
              file: trackFile,
              onProgress,
              template: 'audio'
            }),
          (e) => {
            console.log('Retrying uploadTrackAudio', e)
          }
        )
      )
    ])

    // Write tracks to chain
    const trackIds = await Promise.all(
      parsedTrackMetadatas.map(async (parsedTrackMetadata, i) => {
        // Transform track metadata
        const trackMetadata = this.combineMetadata(
          this.trackUploadHelper.transformTrackUploadMetadata(
            parsedTrackMetadata,
            userId
          ),
          metadata
        )

        const audioResponse = audioResponses[i]

        if (!audioResponse) {
          throw new Error(`Failed to upload track: ${trackMetadata}`)
        }

        // Update metadata to include uploaded CIDs
        const updatedMetadata =
          this.trackUploadHelper.populateTrackMetadataWithUploadResponse(
            trackMetadata,
            audioResponse,
            coverArtResponse
          )

        const metadataCid = await generateMetadataCidV1(updatedMetadata)
        const trackId = await this.trackUploadHelper.generateId('track')
        await this.entityManager.manageEntity({
          userId,
          entityType: EntityType.TRACK,
          entityId: trackId,
          action: Action.CREATE,
          metadata: JSON.stringify({
            cid: metadataCid.toString(),
            data: snakecaseKeys(updatedMetadata)
          }),
          auth: this.auth,
          ...writeOptions
        })

        return trackId
      })
    )

    const playlistId = await this.trackUploadHelper.generateId('playlist')

    // Update metadata to include uploaded CIDs
    const updatedMetadata = {
      ...metadata,
      isPrivate: false,
      playlistContents: {
        trackIds: trackIds.map((trackId) => ({
          track: trackId,
          time: Date.now()
        }))
      },
      playlistImageSizesMultihash: coverArtResponse.id
    }

    // Write playlist metadata to chain
    const metadataCid = await generateMetadataCidV1(updatedMetadata)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.PLAYLIST,
      entityId: playlistId,
      action: Action.CREATE,
      metadata: JSON.stringify({
        cid: metadataCid.toString(),
        data: snakecaseKeys(updatedMetadata)
      }),
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return {
      blockHash: txReceipt.blockHash,
      blockNumber: txReceipt.blockNumber,
      playlistId
    }
  }

  /**
   * Delete a playlist or album
   */
  async deletePlaylist(
    requestParameters: DeletePlaylistRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, playlistId } = parseRequestParameters(
      'deletePlaylist',
      DeletePlaylistSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.PLAYLIST,
      entityId: playlistId,
      action: Action.DELETE,
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Favorite a playlist or album
   */
  async savePlaylist(
    requestParameters: SavePlaylistRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, playlistId, metadata } = parseRequestParameters(
      'savePlaylist',
      SavePlaylistSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.PLAYLIST,
      entityId: playlistId,
      action: Action.SAVE,
      metadata: metadata && JSON.stringify(snakecaseKeys(metadata)),
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Unfavorite a playlist or album
   */
  async unsavePlaylist(
    requestParameters: UnsavePlaylistRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, playlistId } = parseRequestParameters(
      'unsavePlaylist',
      UnsavePlaylistSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.PLAYLIST,
      entityId: playlistId,
      action: Action.UNSAVE,
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Repost a playlist or album
   */
  async repostPlaylist(
    requestParameters: RepostPlaylistRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, playlistId, metadata } = parseRequestParameters(
      'respostPlaylist',
      RepostPlaylistSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.PLAYLIST,
      entityId: playlistId,
      action: Action.REPOST,
      metadata: metadata && JSON.stringify(snakecaseKeys(metadata)),
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Unrepost a track
   */
  async unrepostPlaylist(
    requestParameters: SavePlaylistRequest,
    writeOptions?: WriteOptions
  ) {
    // Parse inputs
    const { userId, playlistId } = parseRequestParameters(
      'unrepostPlaylist',
      UnrepostPlaylistSchema
    )(requestParameters)

    const response = await this.entityManager.manageEntity({
      userId,
      entityType: EntityType.PLAYLIST,
      entityId: playlistId,
      action: Action.UNREPOST,
      auth: this.auth,
      ...writeOptions
    })
    const txReceipt = response.txReceipt

    return txReceipt
  }

  /**
   * Combines the metadata for a track and a collection (playlist or album),
   * taking the metadata from the playlist when the track is missing it.
   */
  private combineMetadata(
    trackMetadata: PlaylistTrackMetadata & { coverArtSizes?: string },
    playlistMetadata: PlaylistMetadata & { coverArtSizes?: string }
  ) {
    const metadata = trackMetadata

    if (!metadata.genre) metadata.genre = playlistMetadata.genre
    if (!metadata.mood) metadata.mood = playlistMetadata.mood

    if (playlistMetadata.tags) {
      if (!metadata.tags) {
        // Take playlist tags
        metadata.tags = playlistMetadata.tags
      } else {
        // Combine tags and dedupe
        metadata.tags = [
          ...new Set([
            ...metadata.tags.split(','),
            ...playlistMetadata.tags.split(',')
          ])
        ].join(',')
      }
    }
    return trackMetadata
  }
}
