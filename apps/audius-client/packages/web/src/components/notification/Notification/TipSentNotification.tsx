import { useUIAudio } from 'common/hooks/useUIAudio'
import { TipSend } from 'common/store/notifications/types'

import styles from './TipSentNotification.module.css'
import { AudioText } from './components/AudioText'
import { NotificationBody } from './components/NotificationBody'
import { NotificationFooter } from './components/NotificationFooter'
import { NotificationHeader } from './components/NotificationHeader'
import { NotificationTile } from './components/NotificationTile'
import { NotificationTitle } from './components/NotificationTitle'
import { ProfilePicture } from './components/ProfilePicture'
import { TwitterShareButton } from './components/TwitterShareButton'
import { UserNameLink } from './components/UserNameLink'
import { IconTip } from './components/icons'

const messages = {
  title: 'Your Tip Was Sent!',
  sent: 'You successfully sent a tip of',
  to: 'to'
}

type TipSentNotificationProps = {
  notification: TipSend
}

export const TipSentNotification = (props: TipSentNotificationProps) => {
  const { notification } = props
  const { user, amount, timeLabel, isViewed } = notification
  const uiAmount = useUIAudio(amount)

  return (
    <NotificationTile notification={notification}>
      <NotificationHeader icon={<IconTip />}>
        <NotificationTitle>{messages.title}</NotificationTitle>
      </NotificationHeader>
      <NotificationBody className={styles.body}>
        <ProfilePicture className={styles.profilePicture} user={user} />
        <span>
          {messages.sent} <AudioText value={uiAmount} /> {messages.to}{' '}
          <UserNameLink user={user} notification={notification} />
        </span>
      </NotificationBody>
      <TwitterShareButton />
      <NotificationFooter timeLabel={timeLabel} isViewed={isViewed} />
    </NotificationTile>
  )
}
