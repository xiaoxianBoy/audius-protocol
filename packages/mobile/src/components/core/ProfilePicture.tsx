import type { ID } from '@audius/common/models'
import { SquareSizes } from '@audius/common/models'
import { cacheUsersSelectors } from '@audius/common/store'
import { useSelector } from 'react-redux'

import type { AvatarProps } from '@audius/harmony-native'
import { Avatar } from '@audius/harmony-native'

import { useProfilePicture } from '../image/UserImage'
const { getUser } = cacheUsersSelectors

export type ProfilePictureProps = Omit<
  AvatarProps,
  'source' | 'accessibilityLabel'
> & {
  userId: ID
}

export const ProfilePicture = (props: ProfilePictureProps) => {
  const { userId, ...other } = props

  const userName = useSelector((state) => getUser(state, { id: userId })?.name)
  const accessibilityLabel = `Profile picture for ${userName}`

  const { source, handleError } = useProfilePicture(
    userId,
    SquareSizes.SIZE_150_BY_150
  )

  return (
    <Avatar
      source={source}
      onError={handleError}
      accessibilityLabel={accessibilityLabel}
      {...other}
    />
  )
}
