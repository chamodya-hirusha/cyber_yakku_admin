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

const categories = [
  { id: "skins", name: "Skins", icon: "🎮" },
  { id: "weapons", name: "Weapons", icon: "⚔️" },
  { id: "vehicles", name: "Vehicles", icon: "🚗" },
  { id: "currency", name: "Currency", icon: "💰" },
  { id: "accessories", name: "Accessories", icon: "🎯" },
  { id: "armor", name: "Armor", icon: "🛡️" },
  { id: "other", name: "Other", icon: "📦" },
]

const statusOptions = [
  { value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" },
  { value: "out_of_stock", label: "Out of Stock", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
]

export default function AddProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState("skins")
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
      stock: 0,
      status: "draft",
      featured: false,
      sku: "",
      imageUrl: "",
    },
  })

  const watchedPrice = watch("price")
  const watchedDiscount = watch("discount")

  // Fetch all product details when category changes
  React.useEffect(() => {
    const fetchProductDetails = async () => {
      setLoadingDetails(true)
      try {
        // Fetch all details in parallel
        const [modelsRes, categoriesRes, typesRes, brandsRes] = await Promise.all([
          fetch(`/api/models?category=${selectedCategory}`),
          fetch(`/api/product-categories?category=${selectedCategory}`),
          fetch(`/api/product-types?category=${selectedCategory}`),
          fetch(`/api/brands?category=${selectedCategory}`)
        ])

        const [modelsData, categoriesData, typesData, brandsData] = await Promise.all([
          modelsRes.json(),
          categoriesRes.json(),
          typesRes.json(),
          brandsRes.json()
        ])

        if (modelsData.success) setAvailableModels(modelsData.data || [])
        if (categoriesData.success) setAvailableCategories(categoriesData.data || [])
        if (typesData.success) setAvailableTypes(typesData.data || [])
        if (brandsData.success) setAvailableBrands(brandsData.data || [])
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
  }, [selectedCategory, setValue])

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
    setValue("imageUrl", url)
    setImagePreview(url)
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Product data:", {
        ...data,
        mainCategoryId: selectedCategory,
        modelId: selectedModel,
        productCategoryId: selectedDetailCategory,
        productTypeId: selectedType,
        brandId: selectedBrand,
        tags,
        imageUrl: imagePreview,
      })
      
      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)
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
            <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
            <p className="text-muted-foreground">
              Add a new product to your catalog
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
            {isLoading ? "Creating..." : "Create Product"}
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
                  Enter the basic details of your product
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
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        type="button"
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.id)}
                        className="justify-start"
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
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
                  Select model, category, type, and brand based on main category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDetails ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading product details...
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
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

                    {/* Category Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={selectedDetailCategory}
                        onChange={(e) => {
                          setSelectedDetailCategory(e.target.value)
                          setValue("productCategoryId", e.target.value)
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a category...</option>
                        {availableCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {availableCategories.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No categories available for this category
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
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Pricing</span>
                </CardTitle>
                <CardDescription>
                  Set the price and discount for your product
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
                    <label htmlFor="stock" className="text-sm font-medium">
                      Stock Quantity *
                    </label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("stock", { valueAsNumber: true })}
                      className={errors.stock ? "border-destructive" : ""}
                    />
                    {errors.stock && (
                      <p className="text-sm text-destructive">{errors.stock.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sku" className="text-sm font-medium">
                      PID
                    </label>
                    <Input
                      id="sku"
                      placeholder="e.g., DRG-SWD-001"
                      {...register("sku")}
                      className={errors.sku ? "border-destructive" : ""}
                    />
                    {errors.sku && (
                      <p className="text-sm text-destructive">{errors.sku.message}</p>
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
                  Add product images and media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="imageUrl" className="text-sm font-medium">
                    Image URL
                  </label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    onChange={handleImageUrlChange}
                    className={errors.imageUrl ? "border-destructive" : ""}
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
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
                  Add tags to help customers find your product
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
                    {(selectedModel || selectedDetailCategory || selectedType || selectedBrand) && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {selectedModel && <div>Model: {availableModels.find(m => m.id === parseInt(selectedModel))?.name}</div>}
                        {selectedDetailCategory && <div>Category: {availableCategories.find(c => c.id === parseInt(selectedDetailCategory))?.name}</div>}
                        {selectedType && <div>Type: {availableTypes.find(t => t.id === parseInt(selectedType))?.name}</div>}
                        {selectedBrand && <div>Brand: {availableBrands.find(b => b.id === parseInt(selectedBrand))?.name}</div>}
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
                      Stock: {watch("stock") || "0"} | SKU: {watch("sku") || "N/A"}
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
                  Save as Draft
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