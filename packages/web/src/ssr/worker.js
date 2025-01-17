/**
 * This worker handles SSR
 *
 * It's separate from the main worker because the app bundle is heavy
 * and causes slow cold starts. This way we can conditionally do SSR
 * and avoid cold starts in the general case.
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { Toucan } from 'toucan-js'
import { renderPage } from 'vike/server'

/* globals SENTRY_DSN */

const DEBUG = false
const BROWSER_CACHE_TTL_SECONDS = 60 * 60 * 24

addEventListener('fetch', (event) => {
  const sentry =
    typeof SENTRY_DSN !== 'undefined'
      ? new Toucan({
          dsn: SENTRY_DSN,
          context: event,
          request: event.request
        })
      : null
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (sentry) {
      sentry.captureException(e)
    }
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500
        })
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  if (!isAssetUrl(event.request.url)) {
    // If the request is not for an asset, then it's a request for a page

    const pageContextInit = {
      urlOriginal: event.request.url,
      userAgent: event.request.headers.get('User-Agent')
    }

    const pageContext = await renderPage(pageContextInit)

    const { httpResponse } = pageContext
    if (!httpResponse) {
      throw new Error(pageContext.errorWhileRendering)
    } else {
      const { body, statusCode: status, headers } = httpResponse
      return new Response(body, { headers, status })
    }
  } else {
    // Adjust browser cache on assets that don't change frequently and/or
    // are given unique hashes when they do.
    const asset = await getAssetFromKV(event)

    const response = new Response(asset.body, asset)
    response.headers.set('cache-control', BROWSER_CACHE_TTL_SECONDS)

    return response
  }
}

function isAssetUrl(url) {
  const { pathname } = new URL(url)
  return (
    pathname.startsWith('/assets') ||
    pathname.startsWith('/scripts') ||
    pathname.startsWith('/fonts') ||
    pathname.startsWith('/favicons') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/gitsha.json')
  )
}
