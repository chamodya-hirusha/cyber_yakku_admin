"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  Settings,
  BarChart3,
  Image as ImageIcon,
  ShoppingCart,
  User,
  Mail,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { name: "All Products", href: "/admin/products" },
      { name: "Categories", href: "/admin/products/categories" },
      { name: "Reviews", href: "/admin/products/reviews" },
     
    ],
  },
  {
    name: "Media",
    href: "/admin/media",
    icon: ImageIcon,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    children: [
      { name: "Customers", href: "/admin/users/customers" },
      { name: "Admins", href: "/admin/users/admins" },
    ],
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function Sidebar({ isCollapsed, onToggle }) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState(new Set())
  const [logoError, setLogoError] = React.useState(false)

  const toggleExpanded = (itemName) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName)
    } else {
      newExpanded.add(itemName)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b gap-2">
        <Link href="/admin/dashboard" className="flex items-center flex-1 min-w-0">
          {isCollapsed ? (
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          ) : (
            <div className="flex items-center w-full">
              {logoError ? (
                <div className="h-8 px-3 bg-gradient-primary rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CY</span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/resources/Logo/CYBER_NEW.webp"
                  alt="Cyber Yakku Logo"
                  className="h-8 w-auto max-w-full object-contain"
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("flex-shrink-0", isCollapsed ? "mx-auto" : "ml-auto")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const isExpanded = expandedItems.has(item.name)
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center"
                )}
                onClick={hasChildren ? (e) => {
                  e.preventDefault()
                  toggleExpanded(item.name)
                } : undefined}
              >
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <>
                    <span>{item.name}</span>
                    {hasChildren && (
                      <ChevronRight
                        className={cn(
                          "ml-auto h-4 w-4 transition-transform",
                          isExpanded && "rotate-90"
                        )}
                      />
                    )}
                  </>
                )}
              </Link>

              {/* Submenu */}
              {hasChildren && !isCollapsed && isExpanded && (
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                          isChildActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <span>{child.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className={cn("flex items-center", isCollapsed && "justify-center")}>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@cyberyakku.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
