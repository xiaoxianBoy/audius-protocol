const axios = require('axios')
const config = require('../config.js')
const { logger } = require('../logging')
const models = require('../models')

const aaoEndpoint = config.get('aaoEndpoint') || 'https://antiabuseoracle.audius.co'

const blockRelayAbuseErrorCodes = new Set([0, 8, 10])
const blockNotificationsErrorCodes = new Set([9])

/**
 * Gets IP of a user by using the leftmost forwarded-for entry
 * or defaulting to req.ip
 */
const getIP = (req) => {
  const forwardedFor = req.get('X-Forwarded-For')
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0].trim()
    return ip
  }
  return req.ip
}

/**
 * Records or updates the last seen IP for `handle`
 */
const recordIP = async (userIP, handle) => {
  const record = await models.UserIPs.findOne({ where: { handle } })
  if (!record) {
    await models.UserIPs.create({
      handle,
      userIP
    })
  } else {
    // update even if IP has not changed so that we can later use updatedAt value if necessary
    await record.update({ userIP, updatedAt: Date.now() })
  }
}

const getAbuseData = async (handle, reqIP) => {
  const res = await axios.get(`${aaoEndpoint}/abuse/${handle}`, {
    headers: {
      'X-Forwarded-For': reqIP
    }
  })

  const { data: rules } = res
  const appliedRules = rules.filter(r => r.trigger && r.action === 'fail').map(r => r.rule)
  const blockedFromRelay = appliedRules.some(r => blockRelayAbuseErrorCodes.has(r))
  const blockedFromNotifications = appliedRules.some(r => blockNotificationsErrorCodes.has(r))
  return { blockedFromRelay, blockedFromNotifications, appliedRules }
}

const detectAbuse = async (user, reqIP) => {
  let blockedFromRelay = false
  let blockedFromNotifications = false
  let appliedRules = null

  if (!user.handle) {
    // Something went wrong during sign up and identity has no knowledge
    // of this user's handle. Flag them as abusive.
    blockedFromRelay = true
  } else {
    try {
      // Write out the latest user IP to Identity DB - AAO will request it back
      await recordIP(reqIP, user.handle)

      // Perform abuse check conditional on environment
      if (config.get('skipAbuseCheck')) {
        logger.info(`Skipping abuse check for user ${user.handle}`)
      } else {
        ;({ appliedRules, blockedFromRelay, blockedFromNotifications } = await getAbuseData(user.handle, reqIP))
      }
    } catch (e) {
      logger.warn(`antiAbuse: aao request failed ${e.message}`)
    }
  }

  // Use !! for nullable columns :(
  if (!!user.isBlockedFromRelay !== blockedFromRelay || !!user.isBlockedFromNotifications !== blockedFromNotifications) {
    await user.update({ isBlockedFromRelay: blockedFromRelay, isBlockedFromNotifications: blockedFromNotifications, appliedRules })
  }
}

module.exports = {
  getAbuseAttestation: getAbuseData,
  detectAbuse,
  getIP,
  recordIP
}
