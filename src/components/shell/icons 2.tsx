import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function SvgIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  )
}

export function SidebarCollapseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 5h16" />
      <path d="M4 19h16" />
      <path d="M9 5v14" />
      <path d="m15 9-3 3 3 3" />
    </SvgIcon>
  )
}

export function SidebarExpandIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 5h16" />
      <path d="M4 19h16" />
      <path d="M15 5v14" />
      <path d="m9 9 3 3-3 3" />
    </SvgIcon>
  )
}

export function CalendarGlyph(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7 3v3" />
      <path d="M17 3v3" />
      <path d="M4 8h16" />
      <rect x="4" y="5" width="16" height="16" rx="2" />
    </SvgIcon>
  )
}

export function FilterGlyph(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </SvgIcon>
  )
}

export function BellGlyph(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-2 7-2 9h16c0-2-2-2-2-9" />
      <path d="M10 21h4" />
    </SvgIcon>
  )
}
