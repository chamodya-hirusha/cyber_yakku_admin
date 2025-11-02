"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema } from "@/lib/validation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Package,
  DollarSign,
  Hash,
  Image as ImageIcon,
  Tag,
} from "lucide-react"

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
]

export default function EditProductPage({ params }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [productLoading, setProductLoading] = React.useState(true)
  const [product, setProduct] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [resolvedId, setResolvedId] = React.useState(null)
  
  const [categories, setCategories] = React.useState([])
  const [selectedCategory, setSelectedCategory] = React.useState("")
  const [imagePreview, setImagePreview] = React.useState("")
  const [tags, setTags] = React.useState([])
  const [newTag, setNewTag] = React.useState("")
  
  // Dynamic product details
  const [availableModels, setAvailableModels] = React.useState([])
  const [availableCategories, setAvailableCategories] = React.useState([])
  const [availableTypes, setAvailableTypes] = React.useState([])
  const [availableBrands, setAvailableBrands] = React.useState([])
  const [loadingDetails, setLoadingDetails] = React.useState(false)
  
  // Selected values
  const [selectedModel, setSelectedModel] = React.useState("")
  const [selectedDetailCategory, setSelectedDetailCategory] = React.useState("")
  const [selectedType, setSelectedType] = React.useState("")
  const [selectedBrand, setSelectedBrand] = React.useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discount: 0,
      stock_quantity: 0,
      status: "draft",
      featured: false,
      pid: "",
      image_url: "",
    },
  })

  const watchedPrice = watch("price")
  const watchedDiscount = watch("discount")

  // Resolve params in Next.js App Router
  React.useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params
        setResolvedId(resolvedParams.id)
      } catch (err) {
        console.error('Error resolving params:', err)
        setError('Invalid product ID')
        setProductLoading(false)
      }
    }
    
    resolveParams()
  }, [params])

  // Load existing product
  React.useEffect(() => {
    if (!resolvedId) return
    
    const fetchProduct = async () => {
      try {
        setProductLoading(true)
        const response = await fetch(`/api/products/${resolvedId}`)
        const result = await response.json()
        
        if (result.success) {
          const productData = result.data
          setProduct(productData)
          
          // Populate form with existing data
          setValue("name", productData.name || "")
          setValue("description", productData.description || "")
          setValue("price", parseFloat(productData.price) || 0)
          setValue("discount", parseFloat(productData.discount) || 0)
          setValue("stock_quantity", parseInt(productData.stock_quantity) || 0)
          setValue("status", productData.status || "draft")
          setValue("featured", Boolean(productData.featured))
          setValue("pid", productData.pid || "")
          setValue("image_url", productData.image_url || "")
          
          setImagePreview(productData.image_url || "")
          
          // Set tags
          if (productData.tags) {
            try {
              const parsedTags = Array.isArray(productData.tags)
                ? productData.tags
                : JSON.parse(productData.tags)
              setTags(parsedTags)
            } catch {
              setTags([])
            }
          }
          
          // Set category
          if (productData.category_id) {
            setSelectedCategory(productData.category_id.toString())
          }
          
        } else {
          setError(result.error || 'Failed to fetch product')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('An error occurred while fetching the product')
      } finally {
        setProductLoading(false)
      }
    }

    fetchProduct()
  }, [resolvedId, setValue])

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const result = await response.json()
        
        if (result.success) {
          setCategories(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Determine category type and fetch product details when category changes
  React.useEffect(() => {
    if (!selectedCategory) return
    
    const fetchProductDetails = async () => {
      setLoadingDetails(true)
      try {
        // First, check what items exist in this category to determine what fields to show
        const itemsResponse = await fetch(`/api/categories/${selectedCategory}/items`)
        const itemsData = await itemsResponse.json()
        
        let hasVehicleWeaponSkin = false
        let hasCurrency = false
        
        if (itemsData.success) {
          const { vehicles = [], weapons = [], skins = [], currencies = [] } = itemsData.data || {}
          hasVehicleWeaponSkin = vehicles.length > 0 || weapons.length > 0 || skins.length > 0
          hasCurrency = currencies.length > 0
        }
        
        // If no items exist, we'll check the category name as fallback
        const selectedCat = categories.find(c => c.id.toString() === selectedCategory)
        const categoryName = selectedCat?.name?.toLowerCase() || ""
        
        // Determine if this is a currency-only category or vehicle/weapon/skin category
        const isCurrencyCategory = categoryName.includes('currency') || (hasCurrency && !hasVehicleWeaponSkin)
        const isVehicleWeaponSkinCategory = categoryName.includes('vehicle') || categoryName.includes('weapon') || categoryName.includes('skin') || hasVehicleWeaponSkin
        
        // Fetch data based on category type
        if (isCurrencyCategory) {
          // For currency: only fetch types
          const typesRes = await fetch(`/api/dropdowns/types?category_id=${selectedCategory}`)
          const typesData = await typesRes.json()
          if (typesData.success) setAvailableTypes(typesData.data || [])
          
          // Clear other fields
          setAvailableModels([])
          setAvailableCategories([])
          setAvailableBrands([])
        } else if (isVehicleWeaponSkinCategory || !isCurrencyCategory) {
          // For vehicle/weapon/skin: fetch brand, model, and type
          const [brandsRes, modelsRes, typesRes] = await Promise.all([
            fetch(`/api/dropdowns/brands?category_id=${selectedCategory}`),
            fetch(`/api/dropdowns/models?category_id=${selectedCategory}`),
            fetch(`/api/dropdowns/types?category_id=${selectedCategory}`)
          ])
          
          const [brandsData, modelsData, typesData] = await Promise.all([
            brandsRes.json(),
            modelsRes.json(),
            typesRes.json()
          ])
          
          if (brandsData.success) setAvailableBrands(brandsData.data || [])
          if (modelsData.success) setAvailableModels(modelsData.data || [])
          if (typesData.success) setAvailableTypes(typesData.data || [])
          setAvailableCategories([])
        } else {
          // Default: try to fetch all
          const [brandsRes, modelsRes, typesRes] = await Promise.all([
            fetch(`/api/dropdowns/brands?category_id=${selectedCategory}`),
            fetch(`/api/dropdowns/models?category_id=${selectedCategory}`),
            fetch(`/api/dropdowns/types?category_id=${selectedCategory}`)
          ])
          
          const [brandsData, modelsData, typesData] = await Promise.all([
            brandsRes.json(),
            modelsRes.json(),
            typesRes.json()
          ])
          
          if (brandsData.success) setAvailableBrands(brandsData.data || [])
          if (modelsData.success) setAvailableModels(modelsData.data || [])
          if (typesData.success) setAvailableTypes(typesData.data || [])
          setAvailableCategories([])
        }
      } catch (error) {
        console.error("Error fetching product details:", error)
        // Set empty arrays on error
        setAvailableModels([])
        setAvailableCategories([])
        setAvailableTypes([])
        setAvailableBrands([])
      } finally {
        setLoadingDetails(false)
      }
    }

    fetchProductDetails()
    
    // Reset all selections when category changes
    setSelectedModel("")
    setSelectedDetailCategory("")
    setSelectedType("")
    setSelectedBrand("")
    setValue("modelId", "")
    setValue("productCategoryId", "")
    setValue("productTypeId", "")
    setValue("brandId", "")
  }, [selectedCategory, setValue, categories])

  // Update selections when product data is loaded
  React.useEffect(() => {
    if (product) {
      if (product.brand_id) setSelectedBrand(product.brand_id.toString())
      if (product.model_id) setSelectedModel(product.model_id.toString())
      if (product.type_id) setSelectedType(product.type_id.toString())
    }
  }, [product])

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
      setValue("tags", [...tags, newTag.trim()])
    }
  }

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    setValue("tags", updatedTags)
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setValue("image_url", url)
    setImagePreview(url)
  }

  const onSubmit = async (data) => {
    if (!resolvedId) {
      alert('Product ID not resolved')
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    try {
      const productData = {
        name: data.name,
        description: data.description || null,
        category_id: parseInt(selectedCategory),
        type_id: selectedType ? parseInt(selectedType) : null,
        brand_id: selectedBrand ? parseInt(selectedBrand) : null,
        model_id: selectedModel ? parseInt(selectedModel) : null,
        price: parseFloat(data.price) || 0,
        discount: parseFloat(data.discount) || 0,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        pid: data.pid?.trim() || null,
        featured: Boolean(data.featured),
        image_url: imagePreview || data.image_url || null,
        status: data.status || 'draft',
        tags: tags || []
      }

      const response = await fetch(`/api/products/${resolvedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      const result = await response.json()

      if (result.success) {
        alert('Product updated successfully!')
        router.push("/admin/products")
      } else {
        alert(result.error || 'Failed to update product')
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert('An error occurred while updating the product')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDiscountPrice = () => {
    if (watchedPrice && watchedDiscount) {
      return (watchedPrice * (1 - watchedDiscount / 100)).toFixed(2)
    }
    return 0
  }

  // Loading state
  if (productLoading) {
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
            <p className="text-muted-foreground">Loading product...</p>
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
              {error || 'The product you are trying to edit does not exist.'}
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">
              Update product information
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Update the basic details of your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Product Name *
                  </label>
                  <Input
                    id="name"
                    placeholder="e.g., Dragon Sword Skin"
                    {...register("name")}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    placeholder="Product description..."
                    rows={4}
                    {...register("description")}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Main Category *</label>
                  {categories.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No categories available. Please create a category first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          type="button"
                          variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                          onClick={() => setSelectedCategory(category.id.toString())}
                          className="justify-start"
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status *</label>
                  <div className="flex space-x-4">
                    {statusOptions.map((status) => (
                      <label key={status.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value={status.value}
                          {...register("status")}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{status.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Product Details</span>
                </CardTitle>
                <CardDescription>
                  Update brand, model, and type for vehicle/weapon/skin categories, or type for currency categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDetails ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading product details...
                  </div>
                ) : (() => {
                  // Determine category type
                  const selectedCat = categories.find(c => c.id.toString() === selectedCategory)
                  const categoryName = selectedCat?.name?.toLowerCase() || ""
                  const isCurrencyCategory = categoryName.includes('currency') || 
                    (availableBrands.length === 0 && availableModels.length === 0 && availableTypes.length > 0)
                  const isVehicleWeaponSkinCategory = categoryName.includes('vehicle') || 
                    categoryName.includes('weapon') || 
                    categoryName.includes('skin') ||
                    (availableBrands.length > 0 || availableModels.length > 0)
                  
                  // For currency: show only Type
                  if (isCurrencyCategory) {
                    return (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type *</label>
                          <select
                            value={selectedType}
                            onChange={(e) => {
                              setSelectedType(e.target.value)
                              setValue("productTypeId", e.target.value)
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a type...</option>
                            {availableTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                          {availableTypes.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              No types available for this category
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  }
                  
                  // For vehicle/weapon/skin: show Brand, Model, and Type
                  if (isVehicleWeaponSkinCategory) {
                    return (
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* Brand Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Brand</label>
                          <select
                            value={selectedBrand}
                            onChange={(e) => {
                              setSelectedBrand(e.target.value)
                              setValue("brandId", e.target.value)
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a brand...</option>
                            {availableBrands.map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.name}
                              </option>
                            ))}
                          </select>
                          {availableBrands.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              No brands available for this category
                            </p>
                          )}
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Model</label>
                          <select
                            value={selectedModel}
                            onChange={(e) => {
                              setSelectedModel(e.target.value)
                              setValue("modelId", e.target.value)
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a model...</option>
                            {availableModels.map((model) => (
                              <option key={model.id} value={model.id}>
                                {model.name}
                              </option>
                            ))}
                          </select>
                          {availableModels.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              No models available for this category
                            </p>
                          )}
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type</label>
                          <select
                            value={selectedType}
                            onChange={(e) => {
                              setSelectedType(e.target.value)
                              setValue("productTypeId", e.target.value)
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a type...</option>
                            {availableTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                          {availableTypes.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              No types available for this category
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  }
                  
                  // Default: show all fields
                  return (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="text-sm text-muted-foreground">
                        No product details available for this category type.
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Pricing</span>
                </CardTitle>
                <CardDescription>
                  Update the price and discount for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      Price ($) *
                    </label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register("price", { valueAsNumber: true })}
                      className={errors.price ? "border-destructive" : ""}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="discount" className="text-sm font-medium">
                      Discount (%)
                    </label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      {...register("discount", { valueAsNumber: true })}
                      className={errors.discount ? "border-destructive" : ""}
                    />
                    {errors.discount && (
                      <p className="text-sm text-destructive">{errors.discount.message}</p>
                    )}
                  </div>
                </div>

                {watchedDiscount > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Discounted Price:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${calculateDiscountPrice()}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Save ${(watchedPrice - calculateDiscountPrice()).toFixed(2)} ({watchedDiscount}% off)
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="h-5 w-5" />
                  <span>Inventory</span>
                </CardTitle>
                <CardDescription>
                  Manage stock and product identification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="stock_quantity" className="text-sm font-medium">
                      Stock Quantity *
                    </label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("stock_quantity", { valueAsNumber: true })}
                      className={errors.stock_quantity ? "border-destructive" : ""}
                    />
                    {errors.stock_quantity && (
                      <p className="text-sm text-destructive">{errors.stock_quantity.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="pid" className="text-sm font-medium">
                      PID
                    </label>
                    <Input
                      id="pid"
                      placeholder="e.g., DRG-SWD-001"
                      {...register("pid")}
                      className={errors.pid ? "border-destructive" : ""}
                    />
                    {errors.pid && (
                      <p className="text-sm text-destructive">{errors.pid.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    {...register("featured")}
                    className="h-4 w-4 rounded border-input"
                  />
                  <label htmlFor="featured" className="text-sm">
                    Featured product
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Media</span>
                </CardTitle>
                <CardDescription>
                  Update product images and media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="image_url" className="text-sm font-medium">
                    Image URL
                  </label>
                  <Input
                    id="image_url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    onChange={handleImageUrlChange}
                    className={errors.image_url ? "border-destructive" : ""}
                  />
                  {errors.image_url && (
                    <p className="text-sm text-destructive">{errors.image_url.message}</p>
                  )}
                </div>

                {imagePreview && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preview</label>
                    <div className="border rounded-lg p-4">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="h-32 w-32 object-cover rounded-lg mx-auto"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Or drag and drop an image here
                  </p>
                  <Button type="button" variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Tags</span>
                </CardTitle>
                <CardDescription>
                  Update tags to help customers find your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      {watch("name") || "Product Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {watch("description") || "Product description..."}
                    </p>
                    {(selectedModel || selectedType || selectedBrand) && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {selectedBrand && <div>Brand: {availableBrands.find(b => b.id === parseInt(selectedBrand))?.name}</div>}
                        {selectedModel && <div>Model: {availableModels.find(m => m.id === parseInt(selectedModel))?.name}</div>}
                        {selectedType && <div>Type: {availableTypes.find(t => t.id === parseInt(selectedType))?.name}</div>}
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">
                        ${calculateDiscountPrice() || watch("price") || "0.00"}
                      </span>
                      {watchedDiscount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${watch("price") || "0.00"}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Stock: {watch("stock_quantity") || "0"} | PID: {watch("pid") || "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Tag className="mr-2 h-4 w-4" />
                  Manage Categories
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}