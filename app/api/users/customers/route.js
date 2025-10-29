import { NextResponse } from 'next/server'

// Mock data - in production, this would come from your database
const customers = [
  {
    id: 1,
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    status: "active",
    role: "customer",
    avatar: null,
    phone: "+1-555-0123",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    preferences: {
      newsletter: true,
      notifications: true,
      theme: "dark",
    },
    stats: {
      totalOrders: 12,
      totalSpent: 1250.50,
      lastOrderDate: "2024-01-20",
      averageOrderValue: 104.21,
    },
    createdAt: "2023-06-15",
    lastLogin: "2024-01-20T10:30:00Z",
    verified: true,
    tags: ["vip", "frequent-buyer"],
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    username: "janesmith",
    status: "active",
    role: "customer",
    avatar: null,
    phone: "+1-555-0124",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    preferences: {
      newsletter: false,
      notifications: true,
      theme: "light",
    },
    stats: {
      totalOrders: 5,
      totalSpent: 450.75,
      lastOrderDate: "2024-01-18",
      averageOrderValue: 90.15,
    },
    createdAt: "2023-08-22",
    lastLogin: "2024-01-19T14:20:00Z",
    verified: true,
    tags: ["new-customer"],
  },
  {
    id: 3,
    email: "mike.wilson@example.com",
    firstName: "Mike",
    lastName: "Wilson",
    username: "mikewilson",
    status: "inactive",
    role: "customer",
    avatar: null,
    phone: "+1-555-0125",
    address: {
      street: "789 Pine St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
    },
    preferences: {
      newsletter: true,
      notifications: false,
      theme: "dark",
    },
    stats: {
      totalOrders: 2,
      totalSpent: 150.00,
      lastOrderDate: "2023-12-15",
      averageOrderValue: 75.00,
    },
    createdAt: "2023-11-10",
    lastLogin: "2023-12-20T09:15:00Z",
    verified: false,
    tags: ["inactive"],
  },
  {
    id: 4,
    email: "sarah.johnson@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    username: "sarahj",
    status: "active",
    role: "customer",
    avatar: null,
    phone: "+1-555-0126",
    address: {
      street: "321 Elm St",
      city: "Miami",
      state: "FL",
      zipCode: "33101",
      country: "USA",
    },
    preferences: {
      newsletter: true,
      notifications: true,
      theme: "light",
    },
    stats: {
      totalOrders: 8,
      totalSpent: 890.25,
      lastOrderDate: "2024-01-19",
      averageOrderValue: 111.28,
    },
    createdAt: "2023-07-05",
    lastLogin: "2024-01-19T16:45:00Z",
    verified: true,
    tags: ["loyal-customer"],
  },
  {
    id: 5,
    email: "alex.brown@example.com",
    firstName: "Alex",
    lastName: "Brown",
    username: "alexbrown",
    status: "suspended",
    role: "customer",
    avatar: null,
    phone: "+1-555-0127",
    address: {
      street: "654 Maple Dr",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "USA",
    },
    preferences: {
      newsletter: false,
      notifications: false,
      theme: "dark",
    },
    stats: {
      totalOrders: 3,
      totalSpent: 200.00,
      lastOrderDate: "2023-10-30",
      averageOrderValue: 66.67,
    },
    createdAt: "2023-09-15",
    lastLogin: "2023-11-01T11:30:00Z",
    verified: true,
    tags: ["suspended", "fraud-risk"],
  },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let filteredCustomers = [...customers]

    // Filter by status
    if (status && status !== 'all') {
      filteredCustomers = filteredCustomers.filter(customer => customer.status === status)
    }

    // Search functionality
    if (search) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.firstName.toLowerCase().includes(search.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        customer.username.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sorting
    filteredCustomers.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'stats.totalSpent') {
        aValue = a.stats.totalSpent
        bValue = b.stats.totalSpent
      } else if (sortBy === 'stats.totalOrders') {
        aValue = a.stats.totalOrders
        bValue = b.stats.totalOrders
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

    // Calculate summary stats
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.status === 'active').length
    const totalRevenue = customers.reduce((sum, c) => sum + c.stats.totalSpent, 0)
    const averageOrderValue = customers.reduce((sum, c) => sum + c.stats.averageOrderValue, 0) / customers.length

    return NextResponse.json({
      success: true,
      data: paginatedCustomers,
      pagination: {
        page,
        limit,
        total: filteredCustomers.length,
        pages: Math.ceil(filteredCustomers.length / limit),
        hasNext: endIndex < filteredCustomers.length,
        hasPrev: page > 1,
      },
      summary: {
        totalCustomers,
        activeCustomers,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      },
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    const newCustomer = {
      id: Date.now(),
      ...body,
      status: body.status || 'active',
      role: 'customer',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      verified: false,
      stats: {
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: null,
        averageOrderValue: 0,
      },
      preferences: {
        newsletter: true,
        notifications: true,
        theme: 'light',
        ...body.preferences,
      },
      tags: body.tags || [],
    }
    
    return NextResponse.json({
      success: true,
      data: newCustomer,
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    // In production, you would update the database here
    const updatedCustomer = {
      ...updateData,
      id,
    }
    
    return NextResponse.json({
      success: true,
      data: updatedCustomer,
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      )
    }
    
    // In production, you would delete from database here
    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
