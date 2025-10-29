"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Package,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  ShoppingCart,
  Eye,
  Star,
  Plus,
  Settings,
  Calendar,
} from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    change: "+12.5%",
    changeType: "positive",
    icon: Users,
    description: "From last month",
  },
  {
    title: "Products",
    value: "1,234",
    change: "+8.2%",
    changeType: "positive",
    icon: Package,
    description: "Active products",
  },
  {
    title: "Revenue",
    value: "$45,231",
    change: "+23.1%",
    changeType: "positive",
    icon: DollarSign,
    description: "This month",
  },
  {
    title: "Orders",
    value: "892",
    change: "-2.3%",
    changeType: "negative",
    icon: ShoppingCart,
    description: "From last month",
  },
]

const recentActivities = [
  {
    id: 1,
    action: "New product added",
    description: "Gaming Headset Pro was added to the store",
    time: "2 minutes ago",
    type: "product",
  },
  {
    id: 2,
    action: "User registered",
    description: "john.doe@example.com joined the platform",
    time: "5 minutes ago",
    type: "user",
  },
  {
    id: 3,
    action: "Order completed",
    description: "Order #1234 was successfully completed",
    time: "10 minutes ago",
    type: "order",
  },
  {
    id: 4,
    action: "Page updated",
    description: "About page content was modified",
    time: "15 minutes ago",
    type: "content",
  },
]

const topProducts = [
  {
    id: 1,
    name: "Gaming Headset Pro",
    sales: 234,
    revenue: "$12,345",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    sales: 189,
    revenue: "$8,765",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Gaming Mouse",
    sales: 156,
    revenue: "$6,543",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Monitor 27\"",
    sales: 98,
    revenue: "$15,432",
    rating: 4.9,
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleQuickAction = (action) => {
    setIsLoading(true)
    switch (action) {
      case 'add-product':
        router.push('/admin/products/add')
        break
      case 'create-page':
        router.push('/admin/content')
        break
      case 'manage-users':
        router.push('/admin/users')
        break
      case 'view-analytics':
        router.push('/admin/settings')
        break
      default:
        break
    }
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {mounted && currentTime ? (
              <>
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </>
            ) : (
              'Loading...'
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleQuickAction('view-analytics')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Activity className="mr-2 h-4 w-4" />
            Live Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {stat.change}
                </span>{" "}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Revenue trends over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                  <p className="text-xs text-muted-foreground mt-1">Integrate with charting library like Recharts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>
              Best performing products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{product.sales} sales</span>
                      <span>•</span>
                      <span>{product.revenue}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions and updates from your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Conversion Rate</span>
                </div>
                <span className="text-sm font-bold">3.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Avg. Order Value</span>
                </div>
                <span className="text-sm font-bold">$127.50</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                </div>
                <span className="text-sm font-bold">4.8/5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-sm font-medium">Return Rate</span>
                </div>
                <span className="text-sm font-bold">2.1%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts for managing your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-primary/5 transition-colors"
              onClick={() => handleQuickAction('add-product')}
            >
              <Package className="h-6 w-6" />
              <span>Add Product</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-primary/5 transition-colors"
              onClick={() => handleQuickAction('create-page')}
            >
              <FileText className="h-6 w-6" />
              <span>Create Page</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-primary/5 transition-colors"
              onClick={() => handleQuickAction('manage-users')}
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2 hover:bg-primary/5 transition-colors"
              onClick={() => handleQuickAction('view-analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            System Notifications
          </CardTitle>
          <CardDescription>
            Important updates and alerts for your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">System Update Available</p>
                <p className="text-xs text-blue-700">Version 2.1.0 is ready to install</p>
              </div>
              <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                Update
              </Button>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Backup Completed</p>
                <p className="text-xs text-green-700">Database backup completed successfully</p>
              </div>
              <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                View
              </Button>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Low Inventory Alert</p>
                <p className="text-xs text-yellow-700">5 products are running low on stock</p>
              </div>
              <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>
          Dashboard last updated: {mounted && currentTime ? currentTime.toLocaleTimeString('en-US') : 'Loading...'}
        </p>
        <p className="mt-1">Cyber Yakku Admin Panel v2.0.0</p>
      </div>
    </div>
  )
}
