"use client"
import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Plus,
  Tag,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Settings
} from "lucide-react"

const categoryIcons = [
  { value: "⚔️", label: "Weapons" },
  { value: "🚗", label: "Vehicles" },
  { value: "💰", label: "Currency" }
]

const initialData = {}

const defaultColumns = ["id", "name", "brand", "model", "category", "status"]

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [categoryData, setCategoryData] = useState(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [editingRow, setEditingRow] = useState(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({})
  const [showColumnEditor, setShowColumnEditor] = useState(false)
  const [tempColumns, setTempColumns] = useState([])
  const [newColumnName, setNewColumnName] = useState("")

  // Fetch categories from API
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
        // Load items for each category
        const categoryDataTemp = {}
        for (const category of result.data) {
          try {
            const itemsResponse = await fetch(`/api/categories/${category.id}/items`)
            const itemsResult = await itemsResponse.json()
            if (itemsResult.success) {
              categoryDataTemp[category.icon] = {
                columns: itemsResult.columns,
                items: itemsResult.data
              }
            }
          } catch (error) {
            console.error(`Error fetching items for category ${category.id}:`, error)
          }
        }
        setCategoryData(categoryDataTemp)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name!")
      return
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: '',
          order: categories.length,
          columns: defaultColumns
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCategories([...categories, result.data])
        setNewCategoryName("")
        setShowAddCategory(false)
        alert(`Category "${newCategoryName}" and its table created successfully!`)
      } else {
        alert(result.error || 'Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('An error occurred while adding the category')
    }
  }

  const handleIconClick = (icon) => {
    setSelectedIcon(icon)
    setSearchTerm("")
    setShowAddItem(false)
    setEditingRow(null)
    
    if (!categoryData[icon]) {
      setCategoryData({
        ...categoryData,
        [icon]: {
          columns: [...defaultColumns],
          items: []
        }
      })
    }
  }

  const handleOpenColumnEditor = () => {
    if (selectedIcon && categoryData[selectedIcon]) {
      setTempColumns([...categoryData[selectedIcon].columns])
      setShowColumnEditor(true)
    }
  }

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      setTempColumns([...tempColumns, newColumnName.toLowerCase().replace(/\s+/g, '_')])
      setNewColumnName("")
    }
  }

  const handleRemoveColumn = (index) => {
    const cols = [...tempColumns]
    cols.splice(index, 1)
    setTempColumns(cols)
  }

  const handleSaveColumns = () => {
    const updatedData = {...categoryData}
    const currentItems = updatedData[selectedIcon].items
    
    // Update items to match new columns
    const updatedItems = currentItems.map(item => {
      const newItem = {}
      tempColumns.forEach(col => {
        newItem[col] = item[col] || ""
      })
      return newItem
    })
    
    updatedData[selectedIcon] = {
      columns: [...tempColumns],
      items: updatedItems
    }
    
    setCategoryData(updatedData)
    setShowColumnEditor(false)
    alert("Columns updated successfully!")
  }

  const initializeNewItem = () => {
    const item = {}
    if (selectedIcon && categoryData[selectedIcon]) {
      categoryData[selectedIcon].columns.forEach(col => {
        item[col] = col === 'status' ? 'Active' : ''
      })
    }
    return item
  }

  const handleShowAddItem = () => {
    setNewItem(initializeNewItem())
    setShowAddItem(true)
  }

  const handleAddItem = async () => {
    if (!selectedIcon) {
      alert("Please select a category icon first!")
      return
    }

    const selectedCategory = categories.find(cat => cat.icon === selectedIcon)
    if (!selectedCategory) {
      alert("Category not found!")
      return
    }

    const requiredFields = categoryData[selectedIcon]?.columns.filter(col => col !== 'status') || []
    const allFilled = requiredFields.every(field => newItem[field] && newItem[field].trim())

    if (allFilled) {
      try {
        // Insert into the common category_items table
        const response = await fetch(`/api/categories/${selectedCategory.id}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        })

        const result = await response.json()

        if (result.success) {
          // Update local state
          const updatedData = {...categoryData}
          if (!updatedData[selectedIcon]) {
            updatedData[selectedIcon] = { columns: defaultColumns, items: [] }
          }
          updatedData[selectedIcon].items = [...updatedData[selectedIcon].items, result.data]
          setCategoryData(updatedData)
          setNewItem({})
          setShowAddItem(false)
          alert("Item added successfully!")
          // Refresh categories to update counts
          fetchCategories()
        } else {
          alert(result.error || 'Failed to add item')
        }
      } catch (error) {
        console.error('Error adding item:', error)
        alert('An error occurred while adding the item')
      }
    } else {
      alert("Please fill all required fields!")
    }
  }

  const handleUpdateItem = (index, field, value) => {
    const updatedData = {...categoryData}
    updatedData[selectedIcon].items[index][field] = value
    setCategoryData(updatedData)
  }

  const handleSaveEdit = () => {
    setEditingRow(null)
    alert("Changes saved successfully!")
  }

  const handleDeleteItem = (index) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const updatedData = {...categoryData}
      updatedData[selectedIcon].items.splice(index, 1)
      setCategoryData(updatedData)
      alert("Item deleted successfully!")
    }
  }

  const getFilteredData = () => {
    if (!selectedIcon || !categoryData[selectedIcon]) return []
    
    return categoryData[selectedIcon].items.filter(item =>
      Object.values(item).some(val => 
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  const getColumnLabel = (col) => {
    return col.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const renderTable = () => {
    if (!selectedIcon) {
      return (
        <div className="text-center py-20 text-gray-500">
          <Tag className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Click on a Category Icon to view items</p>
        </div>
      )
    }

    const filteredData = getFilteredData()
    const columns = categoryData[selectedIcon].columns

    if (filteredData.length === 0 && !showAddItem) {
      return (
        <div className="text-center py-20 text-gray-500">
          <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No items found in this category</p>
          <button
            onClick={handleShowAddItem}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add First Item
          </button>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-6 py-4 text-left text-sm font-semibold">
                  {getColumnLabel(col)}
                </th>
              ))}
              <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {showAddItem && (
              <tr className="bg-blue-50 dark:bg-blue-900">
                {columns.map(col => (
                  <td key={col} className="px-6 py-4">
                    {col === 'status' ? (
                      <select
                        value={newItem[col] || 'Active'}
                        onChange={(e) => setNewItem({...newItem, [col]: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={getColumnLabel(col)}
                        value={newItem[col] || ''}
                        onChange={(e) => setNewItem({...newItem, [col]: e.target.value})}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    )}
                  </td>
                ))}
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAddItem}
                      className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddItem(false)
                        setNewItem({})
                      }}
                      className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {filteredData.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                {columns.map(col => (
                  <td key={col} className="px-6 py-4 text-sm">
                    {editingRow === index ? (
                      col === 'status' ? (
                        <select
                          value={item[col]}
                          onChange={(e) => handleUpdateItem(index, col, e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        >
                          <option>Active</option>
                          <option>Inactive</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={item[col] || ''}
                          onChange={(e) => handleUpdateItem(index, col, e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      )
                    ) : (
                      col === 'status' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium">
                          {item[col]}
                        </span>
                      ) : col === 'category' || col === 'currency_type' ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                          {item[col]}
                        </span>
                      ) : (
                        item[col]
                      )
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    {editingRow === index ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingRow(null)}
                          className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingRow(index)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(index)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="px-3 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Category Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Click on a category icon to manage items
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Category
          </button>
        </div>

        {showAddCategory && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-500">
            <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleAddCategory}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryName("")
                }}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showColumnEditor && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-purple-500">
            <h3 className="text-lg font-semibold mb-4">Edit Table Columns</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter new column name..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none"
                />
                <button
                  onClick={handleAddColumn}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tempColumns.map((col, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium">{getColumnLabel(col)}</span>
                    <button
                      onClick={() => handleRemoveColumn(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowColumnEditor(false)}
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveColumns}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Columns
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Tag className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Category Icons</h2>
            </div>
            {selectedIcon && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Selected: <span className="text-2xl ml-2">{selectedIcon}</span>
                </span>
                <button
                  onClick={handleOpenColumnEditor}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Columns
                </button>
                {!showAddItem && (
                  <button
                    onClick={handleShowAddItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-8 gap-3">
            {loading ? (
              <div className="col-span-8 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-8 text-center py-8 text-gray-500">
                <Tag className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No categories found</p>
                <p className="text-sm">Create your first category to get started</p>
              </div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleIconClick(category.icon)}
                  className={`h-20 flex flex-col items-center justify-center space-y-2 rounded-lg border-2 transition ${
                    selectedIcon === category.icon
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 shadow-lg scale-105'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:shadow'
                  }`}
                >
                  <span className="text-3xl">{category.icon}</span>
                  <span className="text-xs font-medium">{category.name}</span>
                  <span className="text-xs text-blue-600 font-bold">
                    ({category.productCount})
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedIcon && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Items in {selectedIcon} {categoryIcons.find(i => i.value === selectedIcon)?.label}
              </h2>
              <div className="relative flex-1 max-w-md ml-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {renderTable()}
        </div>
      </div>
    </div>
  )
}