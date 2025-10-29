"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Settings,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Customer",
    status: "active",
    joinDate: "2024-01-15",
    lastLogin: "2024-01-20",
    avatar: "JD",
    orders: 12,
    totalSpent: 1250.50,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Admin",
    status: "active",
    joinDate: "2023-11-20",
    lastLogin: "2024-01-20",
    avatar: "JS",
    orders: 0,
    totalSpent: 0,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "Customer",
    status: "inactive",
    joinDate: "2023-08-10",
    lastLogin: "2023-12-15",
    avatar: "MJ",
    orders: 5,
    totalSpent: 450.25,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    role: "Editor",
    status: "active",
    joinDate: "2023-09-05",
    lastLogin: "2024-01-19",
    avatar: "SW",
    orders: 0,
    totalSpent: 0,
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@example.com",
    role: "Customer",
    status: "active",
    joinDate: "2024-01-10",
    lastLogin: "2024-01-20",
    avatar: "DB",
    orders: 3,
    totalSpent: 299.99,
  },
]

const roles = ["All", "Customer", "Admin", "Editor", "Viewer"]
const statuses = ["All", "Active", "Inactive"]

export default function UsersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState("All")
  const [selectedStatus, setSelectedStatus] = React.useState("All")
  const [filteredUsers, setFilteredUsers] = React.useState(users)
  const [selectedUsers, setSelectedUsers] = React.useState([])
  const [showBulkActions, setShowBulkActions] = React.useState(false)
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedRole !== "All") {
      filtered = filtered.filter((user) => user.role === selectedRole)
    }

    if (selectedStatus !== "All") {
      const statusMap = { Active: "active", Inactive: "inactive" }
      filtered = filtered.filter((user) => user.status === statusMap[selectedStatus])
    }

    setFilteredUsers(filtered)
  }, [searchTerm, selectedRole, selectedStatus])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <Shield className="h-4 w-4" />
      case "Editor":
        return <Edit className="h-4 w-4" />
      case "Customer":
        return <Users className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleUserAction = (action, userId) => {
    switch (action) {
      case 'view':
        router.push(`/admin/users/${userId}`)
        break
      case 'edit':
        router.push(`/admin/users/edit/${userId}`)
        break
      case 'toggle-status':
        console.log('Toggle status for user:', userId)
        break
      case 'delete':
        console.log('Delete user:', userId)
        break
      default:
        break
    }
  }

  const handleBulkAction = (action) => {
    switch (action) {
      case 'activate':
        console.log('Activate selected users:', selectedUsers)
        break
      case 'deactivate':
        console.log('Deactivate selected users:', selectedUsers)
        break
      case 'delete':
        console.log('Delete selected users:', selectedUsers)
        break
      default:
        break
    }
    setSelectedUsers([])
    setShowBulkActions(false)
  }

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.status === 'active').length
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0)
  const totalOrders = users.reduce((sum, u) => sum + u.orders, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowBulkActions(!showBulkActions)}>
            <Settings className="mr-2 h-4 w-4" />
            Bulk Actions
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedUsers.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  <UserCheck className="mr-2 h-3 w-3" />
                  Activate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  <UserX className="mr-2 h-3 w-3" />
                  Deactivate
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedUsers([])}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  onClick={() => setSelectedRole(role)}
                  size="sm"
                >
                  {role}
                </Button>
              ))}
            </div>
            <div className="flex space-x-2">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  onClick={() => setSelectedStatus(status)}
                  size="sm"
                >
                  {status}
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

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className={selectedUsers.includes(user.id) ? "ring-2 ring-blue-500" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                  )}
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                    {user.avatar}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {formatDate(user.joinDate)}</span>
                      </div>
                      <span>Last login: {formatDate(user.lastLogin)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {user.role === "Customer" && (
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {user.orders} orders
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${user.totalSpent.toFixed(2)} spent
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserAction('view', user.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserAction('edit', user.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserAction('toggle-status', user.id)}
                    >
                      {user.status === "active" ? (
                        <UserX className="h-3 w-3" />
                      ) : (
                        <UserCheck className="h-3 w-3" />
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserAction('delete', user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || selectedRole !== "All" || selectedStatus !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first user"}
            </p>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Add a new user to the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input placeholder="Enter full name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input placeholder="Enter email address" type="email" />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                  onClick={() => {
                    setShowCreateModal(false)
                    // Handle user creation logic here
                  }}
                >
                  Create User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
