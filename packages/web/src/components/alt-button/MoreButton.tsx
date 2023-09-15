import cn from 'classnames'

import moreMatrix from 'assets/img/iconKebabInactiveMatrix@2x.png'
import moreDark from 'assets/img/iconMoreDark@2x.png'
import moreLight from 'assets/img/iconMoreLight@2x.png'

import styles from './MoreButton.module.css'

type MoreButtonProps = {
  onClick: () => void
  isDarkMode: boolean
  isMatrixMode: boolean
  className?: string
  wrapperClassName?: string
  stopPropagation?: boolean
}

const iconMap = {
  dark: moreDark,
  light: moreLight,
  matrix: moreMatrix
}

const MoreButton = ({
  onClick,
  isDarkMode,
  isMatrixMode,
  className,
  wrapperClassName,
  stopPropagation = true
}: MoreButtonProps) => {
  const icon = iconMap[isMatrixMode ? 'matrix' : isDarkMode ? 'dark' : 'light']

  return (
    <div
      className={wrapperClassName}
      onClick={(e) => {
        onClick()
        stopPropagation && e.stopPropagation()
      }}
    >
      <div
        className={cn(styles.icon, className)}
        style={{
          backgroundImage: `url(${icon})`
        }}
      />
    </div>
  )
}

export default MoreButton