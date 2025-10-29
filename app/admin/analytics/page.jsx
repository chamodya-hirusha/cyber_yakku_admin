"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react"

const analyticsData = {
  overview: [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      changeType: "positive",
      icon: DollarSign,
      description: "vs last month",
    },
    {
      title: "Total Orders",
      value: "2,350",
      change: "+15.3%",
      changeType: "positive",
      icon: ShoppingCart,
      description: "vs last month",
    },
    {
      title: "Total Visitors",
      value: "12,234",
      change: "+7.2%",
      changeType: "positive",
      icon: Eye,
      description: "vs last month",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "-0.4%",
      changeType: "negative",
      icon: TrendingUp,
      description: "vs last month",
    },
  ],
  salesByCategory: [
    { category: "Gaming Peripherals", sales: 15420, percentage: 35 },
    { category: "Audio Equipment", sales: 12340, percentage: 28 },
    { category: "Monitors & Displays", sales: 9870, percentage: 22 },
    { category: "Gaming Chairs", sales: 6540, percentage: 15 },
  ],
  topProducts: [
    { name: "Gaming Headset Pro", sales: 234, revenue: 70166, growth: "+12%" },
    { name: "Mechanical Keyboard RGB", sales: 189, revenue: 37781, growth: "+8%" },
    { name: "Gaming Mouse Wireless", sales: 156, revenue: 23384, growth: "+15%" },
    { name: "Monitor 27\" 4K", sales: 98, revenue: 58702, growth: "+22%" },
  ],
  trafficSources: [
    { source: "Direct", visitors: 4521, percentage: 37 },
    { source: "Search Engines", visitors: 3214, percentage: 26 },
    { source: "Social Media", visitors: 2156, percentage: 18 },
    { source: "Referrals", visitors: 1343, percentage: 11 },
    { source: "Email", visitors: 1000, percentage: 8 },
  ],
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState("30d")
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const renderProgressBar = (percentage) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your store's performance and customer behavior.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Time Range:</span>
            {["7d", "30d", "90d", "1y"].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "1 Year"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsData.overview.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <span
                  className={`flex items-center ${
                    metric.changeType === "positive" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                </span>
                <span className="ml-1">{metric.description}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Revenue breakdown by product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.salesByCategory.map((category) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="text-sm text-muted-foreground">
                      ${category.sales.toLocaleString()} ({category.percentage}%)
                    </span>
                  </div>
                  {renderProgressBar(category.percentage)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{source.source}</span>
                    <span className="text-sm text-muted-foreground">
                      {source.visitors.toLocaleString()} ({source.percentage}%)
                    </span>
                  </div>
                  {renderProgressBar(source.percentage)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
          <CardDescription>Best-selling products and their performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} sales • ${product.revenue.toLocaleString()} revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    product.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.growth}
                  </span>
                  <p className="text-xs text-muted-foreground">vs last period</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Revenue chart visualization</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Integrate with charting library like Recharts or Chart.js
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Page views, session duration, and bounce rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">User engagement metrics</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Analytics integration required
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>AI-powered insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">📈 Revenue Growth</h4>
              <p className="text-sm text-blue-700">
                Your revenue has increased by 20.1% this month. The Gaming Peripherals category is driving most of this growth.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">🎯 High Conversion</h4>
              <p className="text-sm text-green-700">
                Direct traffic shows the highest conversion rate at 4.2%. Consider optimizing your SEO for better organic traffic.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Attention Needed</h4>
              <p className="text-sm text-yellow-700">
                The Gaming Mouse Wireless is out of stock. Restocking this popular item could increase sales by up to 15%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}