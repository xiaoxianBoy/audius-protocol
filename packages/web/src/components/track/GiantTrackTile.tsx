import { Suspense, lazy, useCallback, useState } from 'react'

import {
  isContentUSDCPurchaseGated,
  ID,
  CoverArtSizes,
  FieldVisibility,
  Remix,
  AccessConditions
} from '@audius/common/models'
import { FeatureFlags } from '@audius/common/services'
import {
  cacheTracksSelectors,
  publishTrackConfirmationModalUIActions,
  CommonState
} from '@audius/common/store'
import {
  Genre,
  getCanonicalName,
  formatSeconds,
  formatDate,
  getDogEarType,
  Nullable
} from '@audius/common/utils'
import {
  Text,
  Box,
  Flex,
  IconRobot,
  IconRepost,
  IconHeart,
  IconKebabHorizontal,
  IconShare,
  IconRocket,
  Button
} from '@audius/harmony'
import { Mood } from '@audius/sdk'
import cn from 'classnames'
import moment from 'moment'
import { useDispatch, shallowEqual, useSelector } from 'react-redux'

import { ClientOnly } from 'components/client-only/ClientOnly'
import { TextLink, UserLink } from 'components/link'
import Menu from 'components/menu/Menu'
import RepostFavoritesStats from 'components/repost-favorites-stats/RepostFavoritesStats'
import { ScheduledReleaseGiantLabel } from 'components/scheduled-release-label/ScheduledReleaseLabel'
import { SearchTag } from 'components/search/SearchTag'
import Skeleton from 'components/skeleton/Skeleton'
import { Tile } from 'components/tile'
import Toast from 'components/toast/Toast'
import Tooltip from 'components/tooltip/Tooltip'
import { ComponentPlacement } from 'components/types'
import { UserGeneratedText } from 'components/user-generated-text'
import { getFeatureEnabled } from 'services/remote-config/featureFlagHelpers'
import { useSsrContext } from 'ssr/SsrContext'
import { moodMap } from 'utils/Moods'
import { trpc } from 'utils/trpcClientWeb'

import { AiTrackSection } from './AiTrackSection'
import Badge from './Badge'
import { CardTitle } from './CardTitle'
import { GatedTrackSection } from './GatedTrackSection'
import GiantArtwork from './GiantArtwork'
import styles from './GiantTrackTile.module.css'
import { GiantTrackTileProgressInfo } from './GiantTrackTileProgressInfo'
import InfoLabel from './InfoLabel'
import { PlayPauseButton } from './PlayPauseButton'

const DownloadSection = lazy(() =>
  import('./DownloadSection').then((module) => ({
    default: module.DownloadSection
  }))
)

const { requestOpen: openPublishTrackConfirmationModal } =
  publishTrackConfirmationModalUIActions
const { getTrack } = cacheTracksSelectors

const BUTTON_COLLAPSE_WIDTHS = {
  first: 1095,
  second: 1190,
  third: 1286
}
// Toast timeouts in ms
const REPOST_TIMEOUT = 1000
const SAVED_TIMEOUT = 1000

const messages = {
  makePublic: 'MAKE PUBLIC',
  releaseNow: 'RELEASE NOW',
  isPublishing: 'PUBLISHING',
  repostButtonText: 'repost',
  repostedButtonText: 'reposted',
  unplayed: 'Unplayed',
  timeLeft: 'left',
  played: 'Played',
  generatedWithAi: 'Generated With AI',
  actionGroupLabel: 'track actions'
}

export type GiantTrackTileProps = {
  aiAttributionUserId: Nullable<number>
  artistHandle: string
  badge: Nullable<string>
  coSign: Nullable<Remix>
  coverArtSizes: Nullable<CoverArtSizes>
  credits: string
  currentUserId: Nullable<ID>
  description: string
  hasStreamAccess: boolean
  duration: number
  fieldVisibility: FieldVisibility
  following: boolean
  genre: string
  isArtistPick: boolean
  isOwner: boolean
  isStreamGated: boolean
  isDownloadGated: boolean
  isPublishing: boolean
  isRemix: boolean
  isReposted: boolean
  isSaved: boolean
  isUnlisted: boolean
  isScheduledRelease: boolean
  listenCount: number
  loading: boolean
  mood: string
  onClickFavorites: () => void
  onClickReposts: () => void
  onMakePublic: (trackId: ID) => void
  onFollow: () => void
  onPlay: () => void
  onPreview: () => void
  onRepost: () => void
  onSave: () => void
  onShare: () => void
  onUnfollow: () => void
  playing: boolean
  previewing: boolean
  streamConditions: Nullable<AccessConditions>
  downloadConditions: Nullable<AccessConditions>
  released: string
  repostCount: number
  saveCount: number
  tags: string
  trackId: number
  trackTitle: string
  userId: number
}

export const GiantTrackTile = ({
  aiAttributionUserId,
  artistHandle,
  badge,
  coSign,
  coverArtSizes,
  credits,
  description,
  hasStreamAccess,
  duration,
  fieldVisibility,
  following,
  genre,
  isArtistPick,
  isOwner,
  isStreamGated,
  isRemix,
  isReposted,
  isPublishing,
  isSaved,
  isScheduledRelease,
  isUnlisted,
  listenCount,
  loading,
  mood,
  onClickFavorites,
  onClickReposts,
  onFollow,
  onMakePublic,
  onPlay,
  onPreview,
  onSave,
  onShare,
  onRepost,
  onUnfollow,
  released,
  repostCount,
  saveCount,
  playing,
  previewing,
  streamConditions,
  tags,
  trackId,
  trackTitle,
  userId
}: GiantTrackTileProps) => {
  const dispatch = useDispatch()
  const { isSsrEnabled } = useSsrContext()
  const [artworkLoading, setArtworkLoading] = useState(!isSsrEnabled)
  const onArtworkLoad = useCallback(
    () => setArtworkLoading(false),
    [setArtworkLoading]
  )
  const isLongFormContent =
    genre === Genre.PODCASTS || genre === Genre.AUDIOBOOKS
  const isNewPodcastControlsEnabled = getFeatureEnabled(
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED,
    FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK
  )
  const isUSDCPurchaseGated = isContentUSDCPurchaseGated(streamConditions)
  const isEditAlbumsEnabled = getFeatureEnabled(FeatureFlags.EDIT_ALBUMS)
  const track = useSelector(
    (state: CommonState) => getTrack(state, { id: trackId }),
    shallowEqual
  )
  const hasDownloadableAssets =
    track?.is_downloadable || (track?._stems?.length ?? 0) > 0
  // Preview button is shown for USDC-gated tracks if user does not have access
  // or is the owner
  const showPreview = isUSDCPurchaseGated && (isOwner || !hasStreamAccess)
  // Play button is conditionally hidden for USDC-gated tracks when the user does not have access
  const showPlay = isUSDCPurchaseGated ? hasStreamAccess : true
  const { data: albumInfo } = trpc.tracks.getAlbumBacklink.useQuery(
    { trackId },
    { enabled: !!trackId }
  )

  const renderCardTitle = (className: string) => {
    return (
      <CardTitle
        className={className}
        isUnlisted={isUnlisted}
        isScheduledRelease={isScheduledRelease}
        isRemix={isRemix}
        isStreamGated={isStreamGated}
        isPodcast={genre === Genre.PODCASTS}
        streamConditions={streamConditions}
      />
    )
  }

  const renderShareButton = () => {
    const shouldShow =
      (!isUnlisted && !isPublishing) || fieldVisibility.share || isOwner
    return shouldShow ? (
      <Button
        variant='secondary'
        iconLeft={IconShare}
        widthToHideText={BUTTON_COLLAPSE_WIDTHS.first}
        onClick={onShare}
      >
        share
      </Button>
    ) : null
  }

  const renderMakePublicButton = () => {
    let text = messages.isPublishing
    if (isUnlisted && !isPublishing) {
      text = isScheduledRelease ? messages.releaseNow : messages.makePublic
    }
    return (
      (isUnlisted || isPublishing) &&
      isOwner && (
        <Button
          variant='secondary'
          isLoading={isPublishing}
          iconLeft={IconRocket}
          widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
          onClick={() => {
            dispatch(
              openPublishTrackConfirmationModal({
                confirmCallback: () => {
                  onMakePublic(trackId)
                }
              })
            )
          }}
        >
          {text}
        </Button>
      )
    )
  }

  const renderRepostButton = () => {
    return (
      !isUnlisted &&
      !isPublishing &&
      !isOwner && (
        <Toast
          placement={ComponentPlacement.BOTTOM}
          text={'Reposted!'}
          disabled={isReposted}
          delay={REPOST_TIMEOUT}
          fillParent={false}
        >
          <Tooltip
            disabled={isOwner || repostCount === 0}
            text={isReposted ? 'Unrepost' : 'Repost'}
          >
            <div>
              <Button
                variant={isReposted ? 'primary' : 'secondary'}
                name='repost'
                disabled={isOwner}
                widthToHideText={BUTTON_COLLAPSE_WIDTHS.second}
                iconLeft={IconRepost}
                onClick={onRepost}
              >
                {isReposted
                  ? messages.repostedButtonText
                  : messages.repostButtonText}
              </Button>
            </div>
          </Tooltip>
        </Toast>
      )
    )
  }

  const renderFavoriteButton = () => {
    return (
      !isUnlisted &&
      !isOwner && (
        <Toast
          placement={ComponentPlacement.BOTTOM}
          text={'Favorited!'}
          disabled={isSaved}
          delay={SAVED_TIMEOUT}
          fillParent={false}
        >
          <Tooltip
            disabled={isOwner || saveCount === 0}
            text={isSaved ? 'Unfavorite' : 'Favorite'}
          >
            <div>
              <Button
                name='favorite'
                disabled={isOwner}
                variant={isSaved ? 'primary' : 'secondary'}
                widthToHideText={BUTTON_COLLAPSE_WIDTHS.third}
                iconLeft={IconHeart}
                onClick={onSave}
              >
                {isSaved ? 'favorited' : 'favorite'}
              </Button>
            </div>
          </Tooltip>
        </Toast>
      )
    )
  }

  const renderMood = () => {
    const shouldShow = !isUnlisted || fieldVisibility.mood
    return (
      shouldShow &&
      mood && (
        <InfoLabel
          className={styles.infoLabelPlacement}
          labelName='mood'
          labelValue={mood in moodMap ? moodMap[mood as Mood] : mood}
        />
      )
    )
  }

  const renderGenre = () => {
    const shouldShow = !isUnlisted || fieldVisibility.genre

    return (
      shouldShow && (
        <InfoLabel
          className={styles.infoLabelPlacement}
          labelName='genre'
          labelValue={getCanonicalName(genre)}
        />
      )
    )
  }

  const renderListenCount = () => {
    const shouldShow =
      isOwner || (!isStreamGated && (isUnlisted || fieldVisibility.play_count))

    if (!shouldShow) {
      return null
    }
    return (
      <div className={styles.listens}>
        {!isOwner && listenCount === 0 ? (
          <span className={styles.firstListen}>
            Be the first to listen to this track!
          </span>
        ) : (
          <>
            <span className={styles.numberOfListens}>
              {listenCount.toLocaleString()}
            </span>
            <span className={styles.listenText}>
              {listenCount === 1 ? 'Play' : 'Plays'}
            </span>
          </>
        )}
      </div>
    )
  }

  const renderTags = () => {
    const shouldShow = !isUnlisted || fieldVisibility.tags
    if (!shouldShow || !tags) return null
    return (
      <Flex pt='m' wrap='wrap' gap='s'>
        {tags
          .split(',')
          .filter((t) => t)
          .map((tag) => (
            <SearchTag key={tag} source='track page'>
              {tag}
            </SearchTag>
          ))}
      </Flex>
    )
  }

  const renderAlbum = () => {
    if (!isEditAlbumsEnabled || !albumInfo) return null
    return (
      <InfoLabel
        className={styles.infoLabelPlacement}
        labelName='album'
        labelValue={
          <TextLink to={albumInfo.permalink}>
            {albumInfo.playlist_name}
          </TextLink>
        }
      />
    )
  }

  const renderReleased = () => {
    return (
      !isUnlisted &&
      released && (
        <InfoLabel
          className={styles.infoLabelPlacement}
          labelName='released'
          labelValue={formatDate(released)}
        />
      )
    )
  }

  const renderStatsRow = () => {
    const isLongFormContent =
      genre === Genre.PODCASTS || genre === Genre.AUDIOBOOKS
    const isNewPodcastControlsEnabled = getFeatureEnabled(
      FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED,
      FeatureFlags.PODCAST_CONTROL_UPDATES_ENABLED_FALLBACK
    )

    return (
      <>
        <RepostFavoritesStats
          isUnlisted={isUnlisted}
          repostCount={repostCount}
          saveCount={saveCount}
          onClickReposts={onClickReposts}
          onClickFavorites={onClickFavorites}
        />
        {isLongFormContent && isNewPodcastControlsEnabled
          ? renderListenCount()
          : null}
      </>
    )
  }

  const renderScheduledReleaseRow = () => {
    return (
      <ScheduledReleaseGiantLabel released={released} isUnlisted={isUnlisted} />
    )
  }

  const isLoading = loading || artworkLoading
  // Omitting isOwner and hasStreamAccess so that we always show gated DogEars
  const dogEarType = isLoading
    ? undefined
    : getDogEarType({
        streamConditions,
        isUnlisted:
          isUnlisted && (!released || moment(released).isBefore(moment()))
      })

  const overflowMenuExtraItems = []
  if (!isOwner) {
    overflowMenuExtraItems.push({
      text: following ? 'Unfollow Artist' : 'Follow Artist',
      onClick: () =>
        setTimeout(() => (following ? onUnfollow() : onFollow()), 0)
    })
  }

  const overflowMenu = {
    menu: {
      type: 'track',
      trackId,
      trackTitle,
      genre,
      handle: artistHandle,
      isFavorited: isSaved,
      mount: 'page',
      isOwner,
      includeFavorite: false,
      includeTrackPage: false,
      isArtistPick,
      includeEmbed: !(isUnlisted || isStreamGated),
      includeArtistPick: !isUnlisted,
      includeAddToPlaylist: !isStreamGated,
      includeAddToAlbum: !isStreamGated,
      extraMenuItems: overflowMenuExtraItems
    }
  }

  const fadeIn = {
    [styles.show]: !isLoading,
    [styles.hide]: isLoading
  }

  return (
    <Tile
      className={styles.giantTrackTile}
      dogEar={dogEarType}
      size='large'
      elevation='mid'
    >
      <div className={styles.topSection}>
        <GiantArtwork
          trackId={trackId}
          coverArtSizes={coverArtSizes}
          coSign={coSign}
          cid={track?.cover_art_sizes ?? null}
          callback={onArtworkLoad}
        />
        <div className={styles.infoSection}>
          <div className={styles.infoSectionHeader}>
            {renderCardTitle(cn(fadeIn))}
            <div className={styles.title}>
              <Text variant='heading' size='xl' className={cn(fadeIn)}>
                {trackTitle}
              </Text>
              {isLoading && <Skeleton className={styles.skeleton} />}
            </div>
            <Flex>
              <Text
                variant='title'
                strength='weak'
                tag='h2'
                className={cn(fadeIn)}
              >
                <Text color='subdued'>By </Text>
                <UserLink userId={userId} popover />
              </Text>
              {isLoading && (
                <Skeleton className={styles.skeleton} width='60%' />
              )}
            </Flex>
          </div>

          <ClientOnly>
            <div className={cn(styles.playSection, fadeIn)}>
              {showPlay ? (
                <PlayPauseButton
                  disabled={!hasStreamAccess}
                  playing={playing && !previewing}
                  onPlay={onPlay}
                  trackId={trackId}
                />
              ) : null}
              {showPreview ? (
                <PlayPauseButton
                  playing={playing && previewing}
                  onPlay={onPreview}
                  trackId={trackId}
                  isPreview
                />
              ) : null}
              {isLongFormContent && isNewPodcastControlsEnabled ? (
                <GiantTrackTileProgressInfo
                  duration={duration}
                  trackId={trackId}
                />
              ) : (
                renderListenCount()
              )}
            </div>
          </ClientOnly>

          <div className={cn(styles.statsSection, fadeIn)}>
            {renderStatsRow()}
            {renderScheduledReleaseRow()}
          </div>

          <ClientOnly>
            <div
              className={cn(styles.actionButtons, fadeIn)}
              role='group'
              aria-label={messages.actionGroupLabel}
            >
              {renderShareButton()}
              {renderMakePublicButton()}
              {hasStreamAccess && renderRepostButton()}
              {hasStreamAccess && renderFavoriteButton()}
              <span>
                {/* prop types for overflow menu don't work correctly
              so we need to cast here */}
                <Menu {...(overflowMenu as any)}>
                  {(ref, triggerPopup) => (
                    <div className={cn(styles.menuKebabContainer)} ref={ref}>
                      <Button
                        variant='secondary'
                        aria-label='More options'
                        iconLeft={IconKebabHorizontal}
                        onClick={() => triggerPopup()}
                      />
                    </div>
                  )}
                </Menu>
              </span>
            </div>
          </ClientOnly>
        </div>
        <div className={styles.badges}>
          {aiAttributionUserId ? (
            <Badge
              icon={<IconRobot />}
              className={styles.badgeAi}
              textLabel={messages.generatedWithAi}
            />
          ) : null}
          {badge ? (
            <Badge className={styles.badgePlacement} textLabel={badge} />
          ) : null}
        </div>
      </div>

      <ClientOnly>
        {isStreamGated && streamConditions ? (
          <GatedTrackSection
            isLoading={isLoading}
            trackId={trackId}
            streamConditions={streamConditions}
            hasStreamAccess={hasStreamAccess}
            isOwner={isOwner}
            ownerId={userId}
          />
        ) : null}
      </ClientOnly>

      <ClientOnly>
        {aiAttributionUserId ? (
          <AiTrackSection attributedUserId={aiAttributionUserId} />
        ) : null}
      </ClientOnly>

      <div className={cn(styles.bottomSection, fadeIn)}>
        <div className={styles.infoLabelsSection}>
          <InfoLabel
            className={styles.infoLabelPlacement}
            labelName='duration'
            labelValue={`${formatSeconds(duration)}`}
          />
          {renderReleased()}
          {renderGenre()}
          {renderMood()}
          {credits ? (
            <InfoLabel
              className={styles.infoLabelPlacement}
              labelName='credit'
              labelValue={credits}
            />
          ) : null}
          {renderAlbum()}
        </div>
        {description ? (
          <UserGeneratedText tag='h3' size='s' className={styles.description}>
            {description}
          </UserGeneratedText>
        ) : null}
        <ClientOnly>
          {renderTags()}
          {hasDownloadableAssets ? (
            <Box pt='l' w='100%'>
              <Suspense>
                <DownloadSection trackId={trackId} />
              </Suspense>
            </Box>
          ) : null}
        </ClientOnly>
      </div>
    </Tile>
  )
}
