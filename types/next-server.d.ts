declare module 'next/server' {
  export { NextRequest } from 'next/dist/server/web/spec-extension/request';
  export { NextResponse } from 'next/dist/server/web/spec-extension/response';
  export { NextFetchEvent } from 'next/dist/server/web/spec-extension/fetch-event';
  export { userAgent, userAgentFromString } from 'next/dist/server/web/spec-extension/user-agent';
  export type { ImageResponseOptions } from 'next/dist/compiled/@vercel/og/types';
}