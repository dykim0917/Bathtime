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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                word-break: keep-all;
                overflow-wrap: normal;
              }

              body * {
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
