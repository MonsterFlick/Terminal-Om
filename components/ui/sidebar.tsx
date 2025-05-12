"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface SidebarProviderProps {
  children: React.ReactNode
}

interface SidebarContextValue {
  isSidebarVisible: Record<string, boolean>
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  setSidebarVisible: (key: string, visible: boolean) => void
  isMobile: boolean
  collapsible: "icon" | "blend" | "none"
  setCollapsible: React.Dispatch<React.SetStateAction<"icon" | "blend" | "none">>
}

const SidebarContext = React.createContext<SidebarContextValue>({
  isSidebarVisible: {},
  isCollapsed: false,
  setIsCollapsed: () => {},
  setSidebarVisible: () => {},
  isMobile: false,
  collapsible: "icon",
  setCollapsible: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isSidebarVisible, setSidebarVisibleState] = React.useState<Record<string, boolean>>({})
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [collapsible, setCollapsible] = React.useState<"icon" | "blend" | "none">("icon")

  const isMobile = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768
    }
    return false
  }, [])

  const setSidebarVisible = React.useCallback((key: string, visible: boolean) => {
    setSidebarVisibleState((prev) => ({ ...prev, [key]: visible }))
  }, [])

  return (
    <SidebarContext.Provider
      value={{
        isSidebarVisible,
        setSidebarVisible,
        isCollapsed,
        setIsCollapsed,
        isMobile,
        collapsible,
        setCollapsible,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "grid h-full w-full grid-cols-1 grid-rows-[min-content_auto_min-content] flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground data-[collapsed=true]:px-0 data-[collapsible=none]:min-w-0 data-[expanded=true]:mx-0 data-[expanded=true]:border-r md:sticky",
  {
    variants: {
      side: {
        left: "left-0 top-0 z-20",
        right: "right-0 top-0 border-l border-r-0 z-10",
      },
      collapsible: {
        blend: "",
        icon: "",
        none: "",
      },
      expanded: {
        true: "",
        false: "",
      },
      collapsed: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      side: "left",
      collapsible: "icon",
      expanded: false,
      collapsed: false,
    },
  },
)

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
  defaultWidth?: string
  defaultCollapsed?: boolean
  collapsible?: "icon" | "blend" | "none"
  minWidth?: string
  maxWidth?: string
}

export function Sidebar({
  side = "left",
  defaultWidth = "16rem",
  minWidth = defaultWidth,
  maxWidth = "20rem",
  defaultCollapsed = false,
  collapsible = "icon",
  className,
  children,
  ...props
}: SidebarProps) {
  const { setCollapsible } = useSidebar()
  const [width, setWidth] = React.useState(defaultWidth)
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [isHovered, setIsHovered] = React.useState(false)

  const showSidebar = isHovered || !isCollapsed

  React.useEffect(() => {
    setCollapsible(collapsible)
  }, [collapsible, setCollapsible])

  return (
    <div
      data-collapsible={collapsible}
      data-side={side}
      data-expanded={!isCollapsed}
      data-collapsed={isCollapsed}
      data-hovered={isHovered}
      style={{
        width: collapsible === "none" ? defaultWidth : isCollapsed ? "4rem" : width,
        minWidth: collapsible === "none" ? minWidth : isCollapsed ? "4rem" : minWidth,
        maxWidth: collapsible === "none" ? maxWidth : isCollapsed ? "4rem" : maxWidth,
      }}
      onMouseEnter={() => {
        if (collapsible !== "none") {
          setIsHovered(true)
        }
      }}
      onMouseLeave={() => {
        if (collapsible !== "none") {
          setIsHovered(false)
        }
      }}
      className={cn(sidebarVariants({ side, collapsible, expanded: !isCollapsed, collapsed: isCollapsed }), className)}
      {...props}
    >
      <SidebarContext.Provider
        value={{
          isSidebarVisible: {},
          isCollapsed,
          setIsCollapsed,
          setSidebarVisible: () => {},
          isMobile: false,
          collapsible,
          setCollapsible,
        }}
      >
        {showSidebar ? children : null}
      </SidebarContext.Provider>
    </div>
  )
}

export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setIsCollapsed } = useSidebar()

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={() => setIsCollapsed((isCollapsed) => !isCollapsed)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  )
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 pb-2 pt-2", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-y-auto p-2", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 pb-2 pt-2", className)} {...props} />
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-2", className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-2 pb-1 text-xs font-medium text-muted-foreground", className)} {...props} />
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative", className)} {...props} />
}

export function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1 pl-6", className)} {...props} />
}

export function SidebarMenuSubItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative", className)} {...props} />
}

export function SidebarMenuSubButton({
  className,
  isActive,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  const { collapsible, isCollapsed } = useSidebar()

  return (
    <a
      role="button"
      data-active={isActive}
      className={cn(
        "group flex w-full items-center rounded-md px-2 py-1 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground [&>[data-sidebar-trigger-icon]]:ml-auto",
        collapsible === "icon" && isCollapsed && "h-9 w-9 p-0 [&_span]:hidden [&_svg]:m-0",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarMenuButton({
  className,
  isActive,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { isActive?: boolean }) {
  const { collapsible, isCollapsed } = useSidebar()

  return (
    <a
      role="button"
      data-active={isActive}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground [&>[data-sidebar-trigger-icon]]:ml-auto",
        collapsible === "icon" && isCollapsed && "h-9 w-9 justify-center p-0 [&_span]:hidden [&_svg]:m-0",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarMenuBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary"
}) {
  return (
    <span
      className={cn(
        "ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sidebar-badge text-[0.625rem] font-medium text-sidebar-badge-foreground group-hover:bg-sidebar-badge-hover group-hover:text-sidebar-badge-hover-foreground group-data-[active=true]:bg-sidebar-badge-active group-data-[active=true]:text-sidebar-badge-active-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarMenuAction({
  className,
  showOnHover = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  showOnHover?: boolean
}) {
  return (
    <button
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md border border-sidebar-border text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute right-2 top-1",
        showOnHover && "opacity-0 group-hover:opacity-100",
        className,
      )}
      {...props}
    />
  )
}

export function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("absolute bottom-0 top-0 w-1.5 border-r border-sidebar-border", className)} {...props} />
}

export function SidebarInset({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden" {...props}>
      {children}
    </div>
  )
}

export function SidebarSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-2 my-2 h-px bg-border", className)} {...props} />
}

export const Collapsible = CollapsiblePrimitive.Root

export const CollapsibleTrigger = CollapsiblePrimitive.Trigger

export const CollapsibleContent = CollapsiblePrimitive.Content

