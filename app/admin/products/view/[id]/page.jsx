"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Edit,
  Package,
  DollarSign,
  Hash,
  Tag,
  Calendar,
  Star,
} from "lucide-react"

export default function ViewProductPage({ params }) {
  const router = useRouter()
  const [product, setProduct] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [resolvedId, setResolvedId] = React.useState(null)

  // Resolve params in Next.js App Router
  React.useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        setResolvedId(resolvedParams.id)
      } catch (err) {
        console.error('Error resolving params:', err)
        setError('Invalid product ID')
        setIsLoading(false)
      }
    }
    
    resolveParams()
  }, [params])

  React.useEffect(() => {
    if (!resolvedId) return
    
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/products/${resolvedId}`)
        const result = await response.json()
        
        if (result.success) {
          setProduct(result.data)
        } else {
          setError(result.error || 'Failed to fetch product')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('An error occurred while fetching the product')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [resolvedId])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "out_of_stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active"
      case "out_of_stock":
        return "Out of Stock"
      case "inactive":
        return "Inactive"
      case "draft":
        return "Draft"
      default:
        return "Unknown"
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-8 w-8 animate-pulse mb-4" />
            <p className="text-muted-foreground">Loading product details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error || 'The product you are looking for does not exist.'}
            </p>
            <Button onClick={() => router.push('/admin/products')}>
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">
              Product ID: #{product.product_id}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/products')}
          >
            Back to Products
          </Button>
          <Button
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => {
              if (resolvedId) {
                router.push(`/admin/products/edit/${resolvedId}`)
              }
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                  <p className="font-semibold">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="font-semibold">{product.category_name || 'Uncategorized'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(product.status)}>
                      {getStatusText(product.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PID</label>
                  <p className="font-semibold">{product.pid || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1">{product.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          {(product.brand_name || product.model_name || product.type_name) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Product Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {product.brand_name && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Brand</label>
                      <p className="font-semibold">{product.brand_name}</p>
                    </div>
                  )}
                  {product.model_name && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Model</label>
                      <p className="font-semibold">{product.model_name}</p>
                    </div>
                  )}
                  {product.type_name && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type</label>
                      <p className="font-semibold">{product.type_name}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {product.tags && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(product.tags) 
                    ? product.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    : (() => {
                        try {
                          const parsedTags = JSON.parse(product.tags)
                          return parsedTags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))
                        } catch {
                          return <Badge variant="secondary">{product.tags}</Badge>
                        }
                      })()
                  }
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Image */}
          {product.image_url && (
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Pricing & Inventory</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Price</span>
                <span className="text-xl font-bold">${parseFloat(product.price || 0).toFixed(2)}</span>
              </div>
              {product.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Discount</span>
                  <span className="text-sm text-muted-foreground">{product.discount}%</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stock Quantity</span>
                <span className="font-semibold">{product.stock_quantity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Featured</span>
                <Badge variant={product.featured ? "default" : "secondary"}>
                  {product.featured ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Timestamps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">
                  {new Date(product.created_at).toLocaleDateString()} at{' '}
                  {new Date(product.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="text-sm">
                  {new Date(product.updated_at).toLocaleDateString()} at{' '}
                  {new Date(product.updated_at).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}