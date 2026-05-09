import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                font-family: Pretendard, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                word-break: keep-all;
                overflow-wrap: normal;
              }

              body *, input, button, textarea, select {
                font-family: inherit;
                word-break: inherit;
                overflow-wrap: inherit;
              }

              .bath-detail-sticky-info {
                width: 32%;
                position: sticky !important;
                top: 28px !important;
                align-self: flex-start !important;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
