"use client"
import { useState, useEffect } from "react"
import { Plus, RefreshCw, Tag, X, Table2 } from "lucide-react"

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [tableData, setTableData] = useState({
    vehicles: [],
    weapons: [],
    skins: [],
    currencies: []
  })
  const [loadingTableData, setLoadingTableData] = useState(false)
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(null) // 'vehicle', 'weapon', 'skin', 'currency'
  const [formData, setFormData] = useState({
    item_id: '',
    name: '',
    brand_id: '',
    model_id: '',
    type_id: ''
  })
  const [submitting, setSubmitting] = useState(false)
  
  // Dropdown data
  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [types, setTypes] = useState([])
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  
  // Quick-add modal states
  const [showQuickAddModal, setShowQuickAddModal] = useState(null) // 'brand', 'model', 'type'
  const [quickAddData, setQuickAddData] = useState({ 
    brand: { name: '', category_id: '' }, 
    model: { name: '', brand_id: '' }, 
    type: { name: '', category_id: '' } 
  })
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchDropdownData()
  }, [])

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true)
    try {
      const [brandsRes, modelsRes, typesRes] = await Promise.all([
        fetch('/api/dropdowns/brands'),
        fetch('/api/dropdowns/models'),
        fetch('/api/dropdowns/types')
      ])

      const [brandsData, modelsData, typesData] = await Promise.all([
        brandsRes.json(),
        modelsRes.json(),
        typesRes.json()
      ])

      if (brandsData.success) setBrands(brandsData.data || [])
      if (modelsData.success) setModels(modelsData.data || [])
      if (typesData.success) setTypes(typesData.data || [])
    } catch (error) {
      console.error('Error fetching dropdown data:', error)
    } finally {
      setLoadingDropdowns(false)
    }
  }

  const fetchCategories = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data || [])
        console.log('Categories loaded:', result.data?.length || 0, 'categories')
      } else {
        console.error('Failed to fetch categories:', result.error)
        alert(result.error || 'Failed to load categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      alert('An error occurred while loading categories')
    } finally {
      setLoading(false)
      setRefreshing(false)
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
          name: newCategoryName.trim()
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchCategories()
        setNewCategoryName("")
        setShowAddCategory(false)
        alert(`Category "${newCategoryName.trim()}" created successfully!`)
      } else {
        alert(result.error || 'Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      alert('An error occurred while adding the category')
    }
  }

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category)
    setLoadingTableData(true)

    try {
      const response = await fetch(`/api/categories/${category.id}/items`)
      const result = await response.json()

      if (result.success) {
        setTableData(result.data)
      } else {
        console.error('Failed to fetch category items:', result.error)
        alert(result.error || 'Failed to load category items')
        setTableData({
          vehicles: [],
          weapons: [],
          skins: [],
          currencies: []
        })
      }
    } catch (error) {
      console.error('Error fetching category items:', error)
      alert('An error occurred while loading category items')
      setTableData({
        vehicles: [],
        weapons: [],
        skins: [],
        currencies: []
      })
    } finally {
      setLoadingTableData(false)
    }
  }

  // Determine which table types have data and should be shown
  const getVisibleTableTypes = () => {
    if (!selectedCategory) {
      return []
    }

    const types = []
    
    // Only show table types that have data in this category
    if (tableData.vehicles.length > 0) types.push('vehicle')
    if (tableData.weapons.length > 0) types.push('weapon')
    if (tableData.skins.length > 0) types.push('skin')
    if (tableData.currencies.length > 0) types.push('currency')
    
    // If no data exists yet, try to infer from category name
    if (types.length === 0) {
      const categoryName = selectedCategory.name.toLowerCase()
      if (categoryName.includes('vehicle') || categoryName.includes('veh')) {
        types.push('vehicle')
      } else if (categoryName.includes('weapon') || categoryName.includes('wep')) {
        types.push('weapon')
      } else if (categoryName.includes('skin')) {
        types.push('skin')
      } else if (categoryName.includes('currency') || categoryName.includes('curr')) {
        types.push('currency')
      } else {
        // If can't determine, show all buttons so user can add any type
        return ['vehicle', 'weapon', 'skin', 'currency']
      }
    }
    
    return types
  }

  const visibleTableTypes = getVisibleTableTypes()

  const handleCloseTable = () => {
    setSelectedCategory(null)
    setTableData({
      vehicles: [],
      weapons: [],
      skins: [],
      currencies: []
    })
    setShowAddForm(null)
    setFormData({ item_id: '', name: '', brand_id: '', model_id: '', type_id: '' })
  }

  const getItemIdLabel = () => {
    switch (showAddForm) {
      case 'vehicle':
        return 'Vehicle ID'
      case 'weapon':
        return 'Weapon ID'
      case 'skin':
        return 'Skin ID'
      case 'currency':
        return 'Currency ID'
      default:
        return 'ID'
    }
  }

  const getModalColor = () => {
    switch (showAddForm) {
      case 'vehicle':
        return { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', text: 'text-blue-600', button: 'bg-blue-600 hover:bg-blue-700' }
      case 'weapon':
        return { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-500', text: 'text-purple-600', button: 'bg-purple-600 hover:bg-purple-700' }
      case 'skin':
        return { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-500', text: 'text-green-600', button: 'bg-green-600 hover:bg-green-700' }
      case 'currency':
        return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-500', text: 'text-yellow-600', button: 'bg-yellow-600 hover:bg-yellow-700' }
      default:
        return { bg: 'bg-gray-50 dark:bg-gray-900/20', border: 'border-gray-500', text: 'text-gray-600', button: 'bg-gray-600 hover:bg-gray-700' }
    }
  }

  const handleOpenAddForm = (tableType) => {
    if (!selectedCategory) {
      alert('Please select a category first')
      return
    }
    setShowAddForm(tableType)
    setFormData({ item_id: '', name: '', brand_id: '', model_id: '', type_id: '' })
  }

  const handleCloseAddForm = () => {
    setShowAddForm(null)
    setFormData({ item_id: '', name: '', brand_id: '', model_id: '', type_id: '' })
  }

  const handleOpenQuickAddModal = (type) => {
    setShowQuickAddModal(type)
    // Reset quick add data for this type
    if (type === 'brand') {
      setQuickAddData({ ...quickAddData, brand: { name: '', category_id: selectedCategory?.id?.toString() || '' } })
    } else if (type === 'model') {
      setQuickAddData({ ...quickAddData, model: { name: '', brand_id: formData.brand_id || '' } })
    } else if (type === 'type') {
      setQuickAddData({ ...quickAddData, type: { name: '', category_id: selectedCategory?.id?.toString() || '' } })
    }
  }

  const handleCloseQuickAddModal = () => {
    setShowQuickAddModal(null)
    setQuickAddData({ 
      brand: { name: '', category_id: '' }, 
      model: { name: '', brand_id: '' }, 
      type: { name: '', category_id: '' } 
    })
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    const type = showQuickAddModal
    if (!type) return

    const data = quickAddData[type]
    
    if (type === 'brand' || type === 'type') {
      if (!data.name || !data.name.trim()) {
        alert(`Please enter a ${type} name`)
        return
      }
      if (!data.category_id) {
        alert('Please select a category')
        return
      }
    } else if (type === 'model') {
      if (!data.name || !data.name.trim()) {
        alert('Please enter a model name')
        return
      }
      if (!data.brand_id) {
        alert('Please select a brand')
        return
      }
    }

    setQuickAddSubmitting(true)

    try {
      const endpoint = `/api/dropdowns/${type === 'brand' ? 'brands' : type === 'model' ? 'models' : 'types'}`
      const body = type === 'model' 
        ? { name: data.name.trim(), brand_id: data.brand_id }
        : { name: data.name.trim(), category_id: data.category_id }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh dropdown data
        await fetchDropdownData()
        
        // Auto-select the newly created item
        if (type === 'brand') {
          setFormData({ ...formData, brand_id: result.data.id.toString() })
        } else if (type === 'model') {
          setFormData({ ...formData, model_id: result.data.id.toString() })
        } else if (type === 'type') {
          setFormData({ ...formData, type_id: result.data.id.toString() })
        }
        
        // Close modal
        handleCloseQuickAddModal()
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} created successfully!`)
      } else {
        alert(result.error || `Failed to add ${type}`)
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error)
      alert(`An error occurred while creating the ${type}`)
    } finally {
      setQuickAddSubmitting(false)
    }
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter a name')
      return
    }

    if (!selectedCategory) {
      alert('Please select a category first')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableType: showAddForm,
          item_id: formData.item_id || null,
          name: formData.name.trim(),
          brand_id: formData.brand_id || null,
          model_id: formData.model_id || null,
          type_id: formData.type_id || null
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Refresh table data
        await handleCategorySelect(selectedCategory)
        handleCloseAddForm()
        alert(`${showAddForm} created successfully!`)
      } else {
        alert(result.error || `Failed to add ${showAddForm}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred while creating the item')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
            <p className="text-muted-foreground">
              Manage product categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchCategories(true)}
              disabled={refreshing || loading}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Category
            </button>
          </div>
        </div>

        {/* Add Category Form */}
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory()
                  }
                }}
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

        {/* Categories List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Tag className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold">Categories</h2>
            <span className="text-sm text-gray-500">({categories.length})</span>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Tag className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No categories found</p>
              <p className="text-sm">Create your first category to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`p-4 border rounded-lg hover:shadow-md transition cursor-pointer ${
                    selectedCategory?.id === category.id
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 ring-2 ring-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Table */}
        {selectedCategory && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Table2 className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold">
                  Category: {selectedCategory.name}
                </h2>
              </div>
              <button
                onClick={handleCloseTable}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingTableData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading data...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Vehicles Table */}
                {visibleTableTypes.includes('vehicle') && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-blue-600">
                      Vehicles ({tableData.vehicles.length})
                    </h3>
                    <button
                      onClick={() => handleOpenAddForm('vehicle')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center text-sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Vehicle
                    </button>
                  </div>

                  {tableData.vehicles.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Vehicle ID</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Brand Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Model Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Type Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Category Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.vehicles.map((vehicle) => (
                            <tr key={vehicle.vehicle_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{vehicle.vehicle_id}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{vehicle.name}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{vehicle.brand_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{vehicle.model_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{vehicle.type_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{vehicle.category_name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                )}

                {/* Weapons Table */}
                {visibleTableTypes.includes('weapon') && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-purple-600">
                      Weapons ({tableData.weapons.length})
                    </h3>
                    <button
                      onClick={() => handleOpenAddForm('weapon')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center text-sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Weapon
                    </button>
                  </div>

                  {tableData.weapons.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Weapon ID</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Model Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Brand Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Type Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Category Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.weapons.map((weapon) => (
                            <tr key={weapon.weapon_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{weapon.weapon_id}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{weapon.name}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{weapon.model_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{weapon.brand_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{weapon.type_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{weapon.category_name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                )}

                {/* Skins Table */}
                {visibleTableTypes.includes('skin') && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-green-600">
                      Skins ({tableData.skins.length})
                    </h3>
                    <button
                      onClick={() => handleOpenAddForm('skin')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center text-sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Skin
                    </button>
                  </div>

                  {tableData.skins.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Skin ID</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Brand Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Model Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Type Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Category Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.skins.map((skin) => (
                            <tr key={skin.skin_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{skin.skin_id}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{skin.name}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{skin.brand_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{skin.model_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{skin.type_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{skin.category_name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                )}

                {/* Currencies Table */}
                {visibleTableTypes.includes('currency') && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-yellow-600">
                      Currencies ({tableData.currencies.length})
                    </h3>
                    <button
                      onClick={() => handleOpenAddForm('currency')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center text-sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Currency
                    </button>
                  </div>

                  {tableData.currencies.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Currency ID</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Type Name</th>
                            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Category Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.currencies.map((currency) => (
                            <tr key={currency.currency_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{currency.currency_id}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{currency.name}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{currency.type_name || '-'}</td>
                              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{currency.category_name || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                )}

                {/* Empty State */}
                {tableData.vehicles.length === 0 &&
                  tableData.weapons.length === 0 &&
                  tableData.skins.length === 0 &&
                  tableData.currencies.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Table2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No items found in this category</p>
                      <p className="text-sm">Click the "Add" button above to create items for this category</p>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseAddForm}>
            <div className={`${getModalColor().bg} rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 border-2 ${getModalColor().border}`} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${getModalColor().text}`}>
                  Add New {showAddForm.charAt(0).toUpperCase() + showAddForm.slice(1)}
                </h3>
                <button
                  onClick={handleCloseAddForm}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* Category Display */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={selectedCategory ? `${selectedCategory.name} (ID: ${selectedCategory.id})` : ''}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                {/* ID Field */}
                <div>
                  <label className="block text-sm font-medium mb-1">{getItemIdLabel()} (Optional)</label>
                  <input
                    type="number"
                    value={formData.item_id}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={`Enter ${getItemIdLabel()} or leave empty for auto-increment`}
                  />
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={`${showAddForm.charAt(0).toUpperCase() + showAddForm.slice(1)} name`}
                  />
                </div>

                {/* Dynamic Fields Based on Type */}
                {(showAddForm === 'vehicle' || showAddForm === 'weapon' || showAddForm === 'skin') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Brand Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium">Brand</label>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickAddModal('brand')}
                          className={`text-xs ${getModalColor().text} hover:opacity-80 flex items-center`}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add New
                        </button>
                      </div>
                      <select
                        value={formData.brand_id}
                        onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium">Model</label>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickAddModal('model')}
                          className={`text-xs ${getModalColor().text} hover:opacity-80 flex items-center`}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add New
                        </button>
                      </div>
                      <select
                        value={formData.model_id}
                        onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Model</option>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Type Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium">Type</label>
                        <button
                          type="button"
                          onClick={() => handleOpenQuickAddModal('type')}
                          className={`text-xs ${getModalColor().text} hover:opacity-80 flex items-center`}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add New
                        </button>
                      </div>
                      <select
                        value={formData.type_id}
                        onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Type</option>
                        {types.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Type Field for Currency */}
                {showAddForm === 'currency' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium">Type</label>
                      <button
                        type="button"
                        onClick={() => handleOpenQuickAddModal('type')}
                        className={`text-xs ${getModalColor().text} hover:opacity-80 flex items-center`}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add New
                      </button>
                    </div>
                    <select
                      value={formData.type_id}
                      onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Type</option>
                      {types.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleCloseAddForm}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : `Create ${showAddForm.charAt(0).toUpperCase() + showAddForm.slice(1)}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Add Modal for Brand/Model/Type */}
        {showQuickAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseQuickAddModal}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border-2 border-gray-300 dark:border-gray-600" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Add New {showQuickAddModal.charAt(0).toUpperCase() + showQuickAddModal.slice(1)}
                </h3>
                <button
                  onClick={handleCloseQuickAddModal}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleQuickAdd} className="space-y-4">
                {/* Category Selection for Brand and Type */}
                {(showQuickAddModal === 'brand' || showQuickAddModal === 'type') && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      value={quickAddData[showQuickAddModal].category_id}
                      onChange={(e) => setQuickAddData({
                        ...quickAddData,
                        [showQuickAddModal]: { ...quickAddData[showQuickAddModal], category_id: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Brand Selection for Model */}
                {showQuickAddModal === 'model' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Brand *</label>
                    <select
                      required
                      value={quickAddData.model.brand_id}
                      onChange={(e) => setQuickAddData({
                        ...quickAddData,
                        model: { ...quickAddData.model, brand_id: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={quickAddData[showQuickAddModal].name}
                    onChange={(e) => setQuickAddData({
                      ...quickAddData,
                      [showQuickAddModal]: { ...quickAddData[showQuickAddModal], name: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={`${showQuickAddModal.charAt(0).toUpperCase() + showQuickAddModal.slice(1)} name`}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleCloseQuickAddModal}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quickAddSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {quickAddSubmitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

