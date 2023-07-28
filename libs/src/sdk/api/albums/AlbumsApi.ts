import type { AuthService, StorageService } from '../../services'
import type {
  EntityManagerService,
  WriteOptions
} from '../../services/EntityManager/types'
import type { LoggerService } from '../../services/Logger'
import { parseRequestParameters } from '../../utils/parseRequestParameters'
import type { Configuration } from '../generated/default'
import { PlaylistsApi } from '../playlists/PlaylistsApi'
import {
  createUpdateAlbumSchema,
  createUploadAlbumSchema,
  DeleteAlbumRequest,
  DeleteAlbumSchema,
  FavoriteAlbumRequest,
  FavoriteAlbumSchema,
  getAlbumRequest,
  getAlbumTracksRequest,
  RepostAlbumRequest,
  RepostAlbumSchema,
  UnfavoriteAlbumRequest,
  UnfavoriteAlbumSchema,
  UnrepostAlbumRequest,
  UnrepostAlbumSchema,
  UpdateAlbumRequest,
  UploadAlbumRequest
} from './types'

export class AlbumsApi {
  private readonly playlistsApi: PlaylistsApi
  constructor(
    configuration: Configuration,
    storage: StorageService,
    entityManager: EntityManagerService,
    auth: AuthService,
    logger: LoggerService
  ) {
    this.playlistsApi = new PlaylistsApi(
      configuration,
      storage,
      entityManager,
      auth,
      logger
    )
  }

  // READS
  async getAlbum(requestParameters: getAlbumRequest) {
    const { userId, albumId } = requestParameters
    return await this.playlistsApi.getPlaylist({ userId, playlistId: albumId })
  }

  async getAlbumTracks(requestParameters: getAlbumTracksRequest) {
    const { albumId } = requestParameters
    return await this.playlistsApi.getPlaylistTracks({ playlistId: albumId })
  }

  // WRITES
  /** @hidden
   * Upload an album
   * Uploads the specified tracks and combines them into an album
   */
  async uploadAlbum(
    requestParameters: UploadAlbumRequest,
    writeOptions?: WriteOptions
  ) {
    const { metadata, ...parsedParameters } = await parseRequestParameters(
      'uploadAlbum',
      createUploadAlbumSchema()
    )(requestParameters)

    const { albumName, ...playlistMetadata } = metadata

    // Call uploadPlaylistInternal with parsed inputs
    const response = await this.playlistsApi.uploadPlaylistInternal(
      {
        ...parsedParameters,
        metadata: {
          ...playlistMetadata,
          playlistName: albumName,
          isAlbum: true
        }
      },
      writeOptions
    )

    return {
      blockHash: response.blockHash,
      blockNumber: response.blockNumber,
      albumId: response.playlistId
    }
  }

  /** @hidden
   * Update an album
   */
  async updateAlbum(
    requestParameters: UpdateAlbumRequest,
    writeOptions?: WriteOptions
  ) {
    const { albumId, metadata, ...parsedParameters } =
      await parseRequestParameters(
        'updateAlbum',
        createUpdateAlbumSchema()
      )(requestParameters)

    const { albumName, ...playlistMetadata } = metadata

    // Call updatePlaylistInternal with parsed inputs
    return await this.playlistsApi.updatePlaylistInternal(
      {
        ...parsedParameters,
        playlistId: albumId,
        metadata: {
          ...playlistMetadata,
          playlistName: albumName
        }
      },
      writeOptions
    )
  }

  /** @hidden
   * Delete an album
   */
  async deleteAlbum(
    requestParameters: DeleteAlbumRequest,
    writeOptions?: WriteOptions
  ) {
    await parseRequestParameters(
      'deleteAlbum',
      DeleteAlbumSchema
    )(requestParameters)

    return await this.playlistsApi.deletePlaylist(
      {
        userId: requestParameters.userId,
        playlistId: requestParameters.albumId
      },
      writeOptions
    )
  }

  /** @hidden
   * Favorite an album
   */
  async favoriteAlbum(
    requestParameters: FavoriteAlbumRequest,
    writeOptions?: WriteOptions
  ) {
    const { metadata } = await parseRequestParameters(
      'favoriteAlbum',
      FavoriteAlbumSchema
    )(requestParameters)
    return await this.playlistsApi.favoritePlaylist(
      {
        userId: requestParameters.userId,
        playlistId: requestParameters.albumId,
        metadata
      },
      writeOptions
    )
  }

  /** @hidden
   * Unfavorite an album
   */
  async unfavoriteAlbum(
    requestParameters: UnfavoriteAlbumRequest,
    writeOptions?: WriteOptions
  ) {
    await parseRequestParameters(
      'unfavoriteAlbum',
      UnfavoriteAlbumSchema
    )(requestParameters)
    return await this.playlistsApi.unfavoritePlaylist(
      {
        userId: requestParameters.userId,
        playlistId: requestParameters.albumId
      },
      writeOptions
    )
  }

  /** @hidden
   * Repost an album
   */
  async repostAlbum(
    requestParameters: RepostAlbumRequest,
    writeOptions?: WriteOptions
  ) {
    const { metadata } = await parseRequestParameters(
      'repostAlbum',
      RepostAlbumSchema
    )(requestParameters)

    return await this.playlistsApi.repostPlaylist(
      {
        userId: requestParameters.userId,
        playlistId: requestParameters.albumId,
        metadata
      },
      writeOptions
    )
  }

  /** @hidden
   * Unrepost an album
   */
  async unrepostAlbum(
    requestParameters: UnrepostAlbumRequest,
    writeOptions?: WriteOptions
  ) {
    await parseRequestParameters(
      'unrepostAlbum',
      UnrepostAlbumSchema
    )(requestParameters)
    return await this.playlistsApi.unrepostPlaylist(
      {
        userId: requestParameters.userId,
        playlistId: requestParameters.albumId
      },
      writeOptions
    )
  }
}