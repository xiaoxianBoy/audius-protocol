import { z } from 'zod'

import { MAX_DISPLAY_NAME_LENGTH } from '~/services/oauth/formatSocialProfile'

export const finishProfileSchema = z.object({
  displayName: z.string().max(MAX_DISPLAY_NAME_LENGTH, ''),
  profileImage: z.object({
    url: z.string()
  }),
  coverPhoto: z
    .object({
      url: z.string().optional()
    })
    .optional()
})
