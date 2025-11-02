"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

const iconOptions = [
  "📦", "🎮", "🖥️", "⌨️", "🖱️", "🎧", "📱", "💻",
  "🖨️", "📷", "🎯", "⚡", "🔥", "⭐", "💎", "🏆",
  "🎨", "🎭", "🎪", "🎬", "🎤", "🎸", "🎹", "🥁",
  "🚀", "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓"
]

export default function AddCategoryPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState("📦")
  const [selectedParent, setSelectedParent] = useState(null)
  const [formData, setFormData] = useState({ name: "", description: "", order: 0 })
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parentId: selectedParent,
          icon: selectedIcon,
        }),
      })
      const data = await response.json()
      if (data.success) {
        alert("Category created successfully!")
        // Reset form or redirect
        setFormData({ name: "", description: "", order: 0 })
        setSelectedParent(null)
        setSelectedIcon("📦")
      } else {
        alert("Failed to create category")
      }
    } catch (error) {
      console.error('Error creating category:', error)
      alert("Error creating category")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products/categories" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Add Category</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Create a new product category
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Category Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Parent Category</label>
            <select
              value={selectedParent || ""}
              onChange={(e) => setSelectedParent(e.target.value || null)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">None (Root Category)</option>
              {!loadingCategories && categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-2 border rounded ${selectedIcon === icon ? 'border-blue-600 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Link href="/admin/products/categories" className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}