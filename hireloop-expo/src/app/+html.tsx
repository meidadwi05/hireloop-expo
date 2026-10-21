import {ScrollViewStyleReset, useServerDocumentContext} from 'expo-router/html';
import type {PropsWithChildren} from 'react';

export default function Root({children}: PropsWithChildren) {
  const {headNodes, bodyNodes, htmlAttributes, bodyAttributes} = useServerDocumentContext();
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="id" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#050B55" />
        <meta name="application-name" content="HireLoop" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        {isProduction ? <script src="/pwa-update.js" defer /> : null}
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
