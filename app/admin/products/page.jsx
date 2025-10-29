"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
} from "lucide-react"

const products = [
  {
    id: 1,
    name: "Gaming Headset Pro",
    category: "Audio",
    price: 299.99,
    stock: 45,
    status: "active",
    rating: 4.8,
    sales: 234,
    image: "🎧",
  },
  {
    id: 2,
    name: "Mechanical Keyboard RGB",
    category: "Peripherals",
    price: 199.99,
    stock: 32,
    status: "active",
    rating: 4.6,
    sales: 189,
    image: "⌨️",
  },
  {
    id: 3,
    name: "Gaming Mouse Wireless",
    category: "Peripherals",
    price: 149.99,
    stock: 0,
    status: "out_of_stock",
    rating: 4.7,
    sales: 156,
    image: "🖱️",
  },
  {
    id: 4,
    name: "Monitor 27\" 4K",
    category: "Displays",
    price: 599.99,
    stock: 12,
    status: "active",
    rating: 4.9,
    sales: 98,
    image: "🖥️",
  },
  {
    id: 5,
    name: "Gaming Chair Pro",
    category: "Furniture",
    price: 399.99,
    stock: 8,
    status: "active",
    rating: 4.5,
    sales: 67,
    image: "🪑",
  },
]

const categories = ["All", "Audio", "Peripherals", "Displays", "Furniture"]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [filteredProducts, setFilteredProducts] = React.useState(products)

  React.useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "out_of_stock":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
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
      default:
        return "Unknown"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <Button 
          className="bg-gradient-primary hover:opacity-90"
          onClick={() => window.location.href = '/admin/products/add'}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center text-2xl">
                    {product.image}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${product.price}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                    product.status
                  )}`}
                >
                  {getStatusText(product.status)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Stock: {product.stock}</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{product.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{product.sales} sales</span>
                <span>ID: #{product.id}</span>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-3 w-3" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || selectedCategory !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first product"}
            </p>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => window.location.href = '/admin/products/add'}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
