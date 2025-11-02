"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Home,
  Plus,
  Edit,
  Eye,
  Trash2,
  Settings,
  Image,
  Layout,
  ShoppingCart,
  FileText,
  ArrowUp,
  ArrowDown,
  Save,
  RefreshCw,
  X,
  Upload,
  Link,
  Type,
  Palette,
} from "lucide-react"

const HomeContentPage = () => {
  const [activeTab, setActiveTab] = React.useState('hero')
   const [heroSections, setHeroSections] = React.useState([])
   const [contentCards, setContentCards] = React.useState([])
   const [productCarousels, setProductCarousels] = React.useState([])
   const [membershipSections, setMembershipSections] = React.useState([])
   const [homeLayout, setHomeLayout] = React.useState([])
   const [isLoading, setIsLoading] = React.useState(false)
   const [showCreateModal, setShowCreateModal] = React.useState(false)
   const [editingItem, setEditingItem] = React.useState(null)
   const [formData, setFormData] = React.useState({})
   const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Mock data for demonstration
  React.useEffect(() => {
    setHeroSections([
      {
        id: 1,
        section_type: 'hero1',
        title: 'Welcome to Cyber Yakku',
        subtitle: 'Premium Gaming Store',
        description: 'Discover the best gaming products and accessories',
        bg_image_url: '/images/hero-gaming.jpg',
        cta_text: 'Shop Now',
        cta_link: '/products',
        active: true,
        order_index: 1
      },
      {
        id: 2,
        section_type: 'hero2',
        title: 'New Arrivals',
        subtitle: 'Latest Gaming Gear',
        description: 'Check out our newest collection',
        bg_image_url: '/images/hero-new-arrivals.jpg',
        cta_text: 'Explore',
        cta_link: '/products?filter=new',
        active: true,
        order_index: 2
      }
    ])

    setContentCards([
      {
        id: 1,
        title: 'Gaming Headsets',
        description: 'High-quality audio for immersive gaming',
        image_url: '/images/cards/headsets.jpg',
        link: '/products?category=headsets',
        active: true,
        order_index: 1
      },
      {
        id: 2,
        title: 'Mechanical Keyboards',
        description: 'Precision and speed for competitive gaming',
        image_url: '/images/cards/keyboards.jpg',
        link: '/products?category=keyboards',
        active: true,
        order_index: 2
      },
      {
        id: 3,
        title: 'Gaming Mice',
        description: 'Ergonomic design for long gaming sessions',
        image_url: '/images/cards/mice.jpg',
        link: '/products?category=mice',
        active: true,
        order_index: 3
      }
    ])

    setProductCarousels([
      {
        id: 1,
        title: 'Trending Now',
        carousel_type: 'trending',
        product_ids: ['prod1', 'prod2', 'prod3', 'prod4'],
        active: true,
        order_index: 1
      },
      {
        id: 2,
        title: 'Best Sellers',
        carousel_type: 'popular',
        product_ids: ['prod5', 'prod6', 'prod7', 'prod8'],
        active: true,
        order_index: 2
      }
    ])

    setMembershipSections([
      {
        id: 1,
        title: 'Premium Membership',
        description: 'Unlock exclusive benefits and premium features',
        features: ['Free shipping', 'Priority support', 'Exclusive discounts', 'Early access'],
        price: 29.99,
        period: 'monthly',
        button_text: 'Join Premium',
        button_link: '/membership/premium',
        bg_color: '#1a1a1a',
        text_color: '#ffffff',
        active: true,
        order_index: 1
      },
      {
        id: 2,
        title: 'VIP Membership',
        description: 'The ultimate gaming experience with VIP perks',
        features: ['All Premium benefits', 'VIP events access', 'Personal concierge', 'Custom gaming setup'],
        price: 99.99,
        period: 'monthly',
        button_text: 'Become VIP',
        button_link: '/membership/vip',
        bg_color: '#ffd700',
        text_color: '#000000',
        active: true,
        order_index: 2
      }
    ])

    setHomeLayout([
      { id: 1, type: 'hero', section_id: 1, order: 1, active: true },
      { id: 2, type: 'content_cards', section_id: null, order: 2, active: true },
      { id: 3, type: 'product_carousel', section_id: 1, order: 3, active: true },
      { id: 4, type: 'product_carousel', section_id: 2, order: 4, active: true },
      { id: 5, type: 'membership', section_id: null, order: 5, active: true }
    ])
  }, [])

  const tabs = [
    { id: 'hero', label: 'Hero Sections', icon: Image },
    { id: 'cards', label: 'Content Cards', icon: FileText },
    { id: 'carousels', label: 'Product Carousels', icon: ShoppingCart },
    { id:'membership', label: 'Membership Section', icon: Type}

  ]

  const handleCreate = () => {
    setEditingItem(null)
    setFormData({})
    setShowCreateModal(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({ ...item })
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingItem(null)
    setFormData({})
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Determine the API endpoint based on active tab
      let endpoint = ''
      let method = editingItem ? 'PUT' : 'POST'
      
      switch (activeTab) {
        case 'hero':
          endpoint = '/api/home/hero-sections'
          break
        case 'cards':
          endpoint = '/api/home/content-cards'
          break
        case 'carousels':
          endpoint = '/api/home/product-carousels'
          break
        case 'membership':
          endpoint = '/api/home/membership-sections'
          break
        default:
          throw new Error('Invalid tab')
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Refresh data or update local state
        console.log('Success:', editingItem ? 'Updated' : 'Created')
        handleCloseModal()
        // You can add a refresh function here
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id, type) => {
    if (confirm('Are you sure you want to delete this item?')) {
      console.log(`Delete ${type} with id:`, id)
      // Implement delete logic
    }
  }

  const handleReorder = (id, direction) => {
    console.log(`Reorder ${direction} for id:`, id)
    // Implement reorder logic
  }

  const renderHeroSections = () => (
    <div className="space-y-4">
      {heroSections.map((section) => (
        <Card key={section.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Image className="h-6 w-6 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {section.section_type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      section.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {section.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(section.id, 'hero')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderContentCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contentCards.map((card) => (
        <Card key={card.id}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="h-32 w-full rounded-lg bg-gray-200 flex items-center justify-center">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    card.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {card.active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(card)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(card.id, 'card')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderProductCarousels = () => (
    <div className="space-y-4">
      {productCarousels.map((carousel) => (
        <Card key={carousel.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{carousel.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {carousel.product_ids.length} products
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {carousel.carousel_type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      carousel.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {carousel.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(carousel)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(carousel.id, 'carousel')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderMembershipSections = () => (
    <div className="space-y-4">
      {membershipSections.map((section) => (
        <Card key={section.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-24 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: section.bg_color }}>
                  ${section.price}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {section.period}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      section.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {section.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(section.id, 'membership')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {section.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

 

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Home Content</h1>
          <p className="text-muted-foreground">
            Manage your home page content and layout
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'hero' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Hero Sections</h2>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Hero Section
              </Button>
            </div>
            {renderHeroSections()}
          </div>
        )}

        {activeTab === 'cards' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Content Cards</h2>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Content Card
              </Button>
            </div>
            {renderContentCards()}
          </div>
        )}

        {activeTab === 'carousels' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Product Carousels</h2>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Carousel
              </Button>
            </div>
            {renderProductCarousels()}
          </div>
        )}

        {activeTab === 'membership' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Membership Sections</h2>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Membership Section
              </Button>
            </div>
            {renderMembershipSections()}
          </div>
        )}

        {activeTab === 'layout' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Page Layout</h2>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Layout
              </Button>
            </div>
            {renderPageLayout()}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {editingItem ? 'Edit' : 'Create'} {activeTab === 'hero' ? 'Hero Section' : activeTab === 'cards' ? 'Content Card' : activeTab === 'carousels' ? 'Product Carousel' : 'Membership Section'}
                </CardTitle>
                <CardDescription>
                  {editingItem ? 'Update the content details' : 'Add new content to your home page'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'hero' && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Section Type</label>
                        <select
                          value={formData.section_type || ''}
                          onChange={(e) => handleInputChange('section_type', e.target.value)}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">Select type</option>
                          <option value="hero1">Hero 1</option>
                          <option value="hero2">Hero 2</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Order Index</label>
                        <Input
                          type="number"
                          value={formData.order_index || ''}
                          onChange={(e) => handleInputChange('order_index', parseInt(e.target.value))}
                          placeholder="Display order"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Subtitle</label>
                      <Input
                        value={formData.subtitle || ''}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                        placeholder="Enter subtitle"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter description"
                        className="w-full p-2 border rounded-md h-20"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Background Image URL</label>
                      <div className="flex space-x-2">
                        <Input
                          value={formData.bg_image_url || ''}
                          onChange={(e) => handleInputChange('bg_image_url', e.target.value)}
                          placeholder="Enter image URL"
                        />
                        <Button type="button" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">CTA Text</label>
                        <Input
                          value={formData.cta_text || ''}
                          onChange={(e) => handleInputChange('cta_text', e.target.value)}
                          placeholder="Button text"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">CTA Link</label>
                        <Input
                          value={formData.cta_link || ''}
                          onChange={(e) => handleInputChange('cta_link', e.target.value)}
                          placeholder="Button link"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="text-sm font-medium">Text Color</label>
                        <Input
                          type="color"
                          value={formData.text_color || '#ffffff'}
                          onChange={(e) => handleInputChange('text_color', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Text Alignment</label>
                        <select
                          value={formData.text_alignment || 'center'}
                          onChange={(e) => handleInputChange('text_alignment', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Overlay Opacity</label>
                        <Input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={formData.overlay_opacity || 0.5}
                          onChange={(e) => handleInputChange('overlay_opacity', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'cards' && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={formData.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter title"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Order Index</label>
                        <Input
                          type="number"
                          value={formData.order_index || ''}
                          onChange={(e) => handleInputChange('order_index', parseInt(e.target.value))}
                          placeholder="Display order"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter description"
                        className="w-full p-2 border rounded-md h-20"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Image URL</label>
                      <div className="flex space-x-2">
                        <Input
                          value={formData.image_url || ''}
                          onChange={(e) => handleInputChange('image_url', e.target.value)}
                          placeholder="Enter image URL"
                        />
                        <Button type="button" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Link</label>
                        <Input
                          value={formData.link || ''}
                          onChange={(e) => handleInputChange('link', e.target.value)}
                          placeholder="Enter link URL"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Link Target</label>
                        <select
                          value={formData.link_target || '_self'}
                          onChange={(e) => handleInputChange('link_target', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="_self">Same Window</option>
                          <option value="_blank">New Window</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Icon</label>
                        <Input
                          value={formData.icon || ''}
                          onChange={(e) => handleInputChange('icon', e.target.value)}
                          placeholder="Icon class or URL"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Badge Text</label>
                        <Input
                          value={formData.badge_text || ''}
                          onChange={(e) => handleInputChange('badge_text', e.target.value)}
                          placeholder="Optional badge text"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'carousels' && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={formData.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter title"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Carousel Type</label>
                        <select
                          value={formData.carousel_type || ''}
                          onChange={(e) => handleInputChange('carousel_type', e.target.value)}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">Select type</option>
                          <option value="trending">Trending</option>
                          <option value="popular">Popular</option>
                          <option value="discount">Discount</option>
                          <option value="featured">Featured</option>
                          <option value="new_arrivals">New Arrivals</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter description"
                        className="w-full p-2 border rounded-md h-20"
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Icon</label>
                        <Input
                          value={formData.icon || ''}
                          onChange={(e) => handleInputChange('icon', e.target.value)}
                          placeholder="Icon class or URL"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Display Limit</label>
                        <Input
                          type="number"
                          value={formData.display_limit || 10}
                          onChange={(e) => handleInputChange('display_limit', parseInt(e.target.value))}
                          placeholder="Max products to show"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Product IDs (comma-separated)</label>
                      <Input
                        value={Array.isArray(formData.product_ids) ? formData.product_ids.join(', ') : ''}
                        onChange={(e) => handleInputChange('product_ids', e.target.value.split(',').map(id => id.trim()))}
                        placeholder="prod1, prod2, prod3"
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.auto_play || false}
                          onChange={(e) => handleInputChange('auto_play', e.target.checked)}
                          className="rounded"
                        />
                        <label className="text-sm font-medium">Auto Play</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.show_dots || false}
                          onChange={(e) => handleInputChange('show_dots', e.target.checked)}
                          className="rounded"
                        />
                        <label className="text-sm font-medium">Show Dots</label>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'membership' && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={formData.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter membership title"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Price</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.price || ''}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                          placeholder="Enter price"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter membership description"
                        className="w-full p-2 border rounded-md h-20"
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Period</label>
                        <select
                          value={formData.period || 'monthly'}
                          onChange={(e) => handleInputChange('period', e.target.value)}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="lifetime">Lifetime</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Order Index</label>
                        <Input
                          type="number"
                          value={formData.order_index || ''}
                          onChange={(e) => handleInputChange('order_index', parseInt(e.target.value))}
                          placeholder="Display order"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Features (one per line)</label>
                      <textarea
                        value={Array.isArray(formData.features) ? formData.features.join('\n') : ''}
                        onChange={(e) => handleInputChange('features', e.target.value.split('\n').filter(f => f.trim()))}
                        placeholder="Enter membership features"
                        className="w-full p-2 border rounded-md h-24"
                        required
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Button Text</label>
                        <Input
                          value={formData.button_text || ''}
                          onChange={(e) => handleInputChange('button_text', e.target.value)}
                          placeholder="Join Now"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Button Link</label>
                        <Input
                          value={formData.button_link || ''}
                          onChange={(e) => handleInputChange('button_link', e.target.value)}
                          placeholder="/membership/premium"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.active !== false}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="rounded"
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default HomeContentPage
