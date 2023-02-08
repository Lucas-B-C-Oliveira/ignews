import Link, { LinkProps } from 'next/link'
import { ReactElement } from 'react'
import { useRouter } from 'next/router';

interface ActiveLinkProps extends LinkProps {
  children: ReactElement | string
  activeClassName: string
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {

  const { asPath } = useRouter()

  const className = asPath === rest.href
    ? activeClassName
    : '';

  className


  return (
    <Link className={className} {...rest}>
      {children}
    </Link>
  )
}