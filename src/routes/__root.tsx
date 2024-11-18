import fontsourceInter from '@fontsource-variable/inter?url'
import fontsourceNotoSansTC from '@fontsource-variable/noto-sans-tc?url'
import globalStyle from '~/styles/global.css?url'

import { createRootRouteWithContext, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'
import { createTranslator, IntlProvider } from 'use-intl'
import type { ErrorComponentProps } from '@tanstack/react-router'
import type { PropsWithChildren } from 'react'

import { AppHeader } from '~/components/layout/app-header'
import { AppSidebar } from '~/components/layout/app-sidebar'
import { ThemeProvider } from '~/components/theme'
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar'
import { Toaster } from '~/components/ui/sonner'
import { Typography } from '~/components/ui/typography'
import { createMetadata } from '~/libs/seo'
import { authQueryOptions } from '~/services/auth.query'
import { i18nQueryOptions, useI18nQuery } from '~/services/i18n.query'
import type { RouterContext } from '~/libs/router'

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const [auth, i18n] = await Promise.all([
      context.queryClient.ensureQueryData(authQueryOptions()),
      context.queryClient.ensureQueryData(i18nQueryOptions()),
    ])

    const translator = createTranslator(i18n)

    return {
      auth,
      i18n: {
        ...i18n,
        translator,
      },
    }
  },
  head: () => {
    return {
      meta: createMetadata({
        charSet: 'utf-8',
        viewport: 'width=device-width, initial-scale=1',
        title: 'TanStack Boilerplate',
        description: 'A fully type-safe boilerplate with a focus on UX and DX, complete with multiple examples.',
        robots: 'index, follow',
      }),
      links: [
        {
          rel: 'icon',
          href: '/favicon.ico',
        },
        {
          rel: 'stylesheet',
          href: globalStyle,
        },
        {
          rel: 'stylesheet',
          href: fontsourceInter,
        },
        {
          rel: 'stylesheet',
          href: fontsourceNotoSansTC,
        },
      ],
      scripts: import.meta.env.PROD ? [] : [
        {
          type: 'module',
          children: /* js */ `
            import RefreshRuntime from "/_build/@react-refresh"
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
          `,
        },
      ],
    }
  },
  component: RootComponent,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className='flex h-full flex-col'>
            <AppHeader />
            <div className='flex h-full flex-1 flex-col items-center px-2'>
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RootDocument>
  )
}

function PendingComponent() {
  return (
    <div className='space-y-6 p-6'>
      <Typography.H1>
        Loading...
      </Typography.H1>
    </div>
  )
}

function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <RootDocument>
      <div className='space-y-6 p-6'>
        <Typography.H1>
          Error
        </Typography.H1>
        <p className='text-destructive'>
          {error.message}
        </p>
      </div>
    </RootDocument>
  )
}

function NotFoundComponent() {
  return (
    <div className='space-y-6'>
      <Typography.H1>
        404 Not Found
      </Typography.H1>
    </div>
  )
}

function RootDocument({ children }: PropsWithChildren) {
  const i18nQuery = useI18nQuery()

  return (
    <html lang={i18nQuery.data.locale} suppressHydrationWarning>
      <head>
        <Meta />
      </head>
      <body>
        <IntlProvider {...i18nQuery.data}>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </IntlProvider>
        {/* <QueryDevtools buttonPosition='bottom-left' /> */}
        {/* <RouterDevtools position='bottom-right' /> */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
