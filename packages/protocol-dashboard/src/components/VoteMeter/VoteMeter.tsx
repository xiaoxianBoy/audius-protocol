import React from 'react'
import BN from 'bn.js'
import { formatAud } from 'utils/format'
import { fraction } from 'utils/numeric'
import { TICKER } from 'utils/consts'
import Tooltip from 'components/Tooltip'
import { formatWei } from 'utils/format'

import desktopStyles from './VoteMeter.module.css'
import mobileStyles from './VoteMeterMobile.module.css'
import { createStyles } from 'utils/mobile'

const styles = createStyles({ desktopStyles, mobileStyles })

const messages = {
  for: 'FOR',
  against: 'AGAINST',
  auds: TICKER
}

type OwnProps = {
  votesFor: BN
  votesAgainst: BN
}

type VoteMeterProps = OwnProps

const VoteMeter: React.FC<VoteMeterProps> = ({
  votesFor,
  votesAgainst
}: VoteMeterProps) => {
  const percentFor = fraction(votesFor, votesFor.add(votesAgainst)) * 100

  return (
    <div className={styles.voteMeter}>
      <div className={styles.counts}>
        <div className={styles.count}>
          <Tooltip text={formatWei(votesFor)}>{formatAud(votesFor)}</Tooltip>
          <span>{messages.auds}</span>
        </div>
        <div className={styles.count}>
          <Tooltip text={formatWei(votesAgainst)}>
            {formatAud(votesAgainst)}
          </Tooltip>
          <span>{messages.auds}</span>
        </div>
      </div>

      <div className={styles.meter}>
        <div
          className={styles.votesFor}
          style={{
            width: `${percentFor}%`
          }}
        />
        <div
          className={styles.votesAgainst}
          style={{
            width: `${100 - percentFor}%`
          }}
        />
      </div>

      <div className={styles.labels}>
        <div className={styles.label}>{messages.for}</div>
        <div className={styles.label}>{messages.against}</div>
      </div>
    </div>
  )
}

export default VoteMeter