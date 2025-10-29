"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Star,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MessageSquare,
  User,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const reviews = [
  {
    id: 1,
    productName: "Gaming Headset Pro",
    customerName: "John Doe",
    customerEmail: "john.doe@example.com",
    rating: 5,
    title: "Excellent sound quality!",
    comment: "This headset delivers amazing sound quality and comfort. Perfect for long gaming sessions. The noise cancellation is top-notch.",
    date: "2024-01-15",
    status: "published",
    helpful: 12,
    verified: true,
    productId: 1,
  },
  {
    id: 2,
    productName: "Mechanical Keyboard RGB",
    customerName: "Jane Smith",
    customerEmail: "jane.smith@example.com",
    rating: 4,
    title: "Great keyboard, minor issues",
    comment: "Love the RGB lighting and the typing feel. However, the spacebar is a bit stiff. Overall very satisfied with the purchase.",
    date: "2024-01-14",
    status: "published",
    helpful: 8,
    verified: true,
    productId: 2,
  },
  {
    id: 3,
    productName: "Gaming Mouse Wireless",
    customerName: "Mike Johnson",
    customerEmail: "mike.j@example.com",
    rating: 2,
    title: "Battery life disappointing",
    comment: "The mouse works well but the battery only lasts 2 days with moderate use. Expected better from a premium product.",
    date: "2024-01-13",
    status: "pending",
    helpful: 3,
    verified: false,
    productId: 3,
  },
  {
    id: 4,
    productName: "Monitor 27\" 4K",
    customerName: "Sarah Wilson",
    customerEmail: "sarah.w@example.com",
    rating: 5,
    title: "Stunning display quality",
    comment: "The colors are vibrant and the resolution is incredible. Perfect for both work and gaming. Highly recommended!",
    date: "2024-01-12",
    status: "published",
    helpful: 15,
    verified: true,
    productId: 4,
  },
  {
    id: 5,
    productName: "Gaming Chair Pro",
    customerName: "Alex Brown",
    customerEmail: "alex.b@example.com",
    rating: 3,
    title: "Comfortable but pricey",
    comment: "The chair is very comfortable for long sessions, but I feel it's overpriced for what you get. Assembly was straightforward though.",
    date: "2024-01-11",
    status: "published",
    helpful: 6,
    verified: true,
    productId: 5,
  },
]

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterRating, setFilterRating] = React.useState("all")
  const [filterStatus, setFilterStatus] = React.useState("all")

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = filterRating === "all" || review.rating.toString() === filterRating
    const matchesStatus = filterStatus === "all" || review.status === filterStatus
    return matchesSearch && matchesRating && matchesStatus
  })

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>
          <p className="text-muted-foreground">
            Manage and moderate customer reviews for your products.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Flag className="mr-2 h-4 w-4" />
            Reported Reviews
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            <MessageSquare className="mr-2 h-4 w-4" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">
              All time reviews
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.status === "published").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Live on site
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
          <CardDescription>
            Filter and manage customer reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Rating: {filterRating === "all" ? "All" : `${filterRating} stars`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterRating("all")}>
                  All Ratings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRating("5")}>
                  5 Stars
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRating("4")}>
                  4 Stars
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRating("3")}>
                  3 Stars
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRating("2")}>
                  2 Stars
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRating("1")}>
                  1 Star
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {filterStatus === "all" ? "All" : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("published")}>
                  Published
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("rejected")}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{review.customerName}</p>
                          <p className="text-sm text-muted-foreground">{review.customerEmail}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="font-medium mb-1">{review.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Product: {review.productName}
                        </p>
                        <p className="text-sm">{review.comment}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{review.helpful} helpful</span>
                        </span>
                        {review.verified && (
                          <span className="text-green-600">✓ Verified Purchase</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {review.status === "pending" && (
                            <>
                              <DropdownMenuItem>
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Flag className="mr-2 h-4 w-4" />
                            Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}