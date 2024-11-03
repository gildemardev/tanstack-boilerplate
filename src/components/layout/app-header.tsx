import { Link, useLocation } from '@tanstack/react-router'
import { Fragment } from 'react'
import { useTranslations } from 'use-intl'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { Separator } from '~/components/ui/separator'
import { SidebarTrigger } from '~/components/ui/sidebar'
import type { TranslateKeys } from '~/libs/i18n'

export function AppHeader() {
  const t = useTranslations()

  const location = useLocation()

  const paths = location.pathname.split('/').filter(Boolean)

  return (
    <header className='flex h-16 shrink-0 items-center gap-2'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to='/'>
                  <BreadcrumbPage>
                    {t('navigation.home')}
                  </BreadcrumbPage>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {paths.length > 0 && <BreadcrumbSeparator />}

            {paths.map((path, idx) => {
              const isLast = idx === paths.length - 1
              const hasNext = idx + 1 < paths.length

              const name = t(`navigation.${path}` as TranslateKeys)
              const isTranslated = name !== `navigation.${path}`

              return (
                <Fragment key={path}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>
                        {isTranslated ? name : path}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={`/${path}`} >
                          {isTranslated ? name : path}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {hasNext && <BreadcrumbSeparator />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}