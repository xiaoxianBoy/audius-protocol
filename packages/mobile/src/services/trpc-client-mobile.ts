import type { AppRouter } from '@audius/trpc-server'
import { createTRPCReact, httpBatchLink } from '@trpc/react-query'
import Config from 'react-native-config'

export const trpc = createTRPCReact<AppRouter>()

export function createAudiusTrpcClient(currentUserId: number | null) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: getTrpcEndpoint(),
        maxURLLength: 2083,
        headers() {
          if (!currentUserId) return {}
          return {
            'x-current-user-id': '' + currentUserId
          }
        }
      })
    ]
  })
}

// this hardcodes some dedicated nodes for dev/stage/prod
// since tRPC server is deployed manually atm.
// in the future some tRPC middleware can set host to currently selected DN per request
function getTrpcEndpoint() {
  switch (Config.ENVIRONMENT) {
    case 'production':
      return 'https://discoveryprovider3.audius.co/trpc/trpc'
    case 'staging':
      return 'https://discoveryprovider3.staging.audius.co/trpc/trpc'
  }
  return 'http://localhost:2022/trpc'
}