'use client'

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  Key,
  X,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Update role options to match database enum values
const roleOptions = [
  { label: "Super Admin", value: "SUPER_ADMIN" },
  { label: "Content Manager", value: "CONTENT_MANAGER" },
  { label: "Product Manager", value: "PRODUCT_MANAGER" },
  { label: "Marketing Manager", value: "MARKETING_MANAGER" },
];

// Update permission labels to match database enum values
const permissionLabels = {
  FULL_ACCESS: "Full Access",
  CONTENT_MANAGEMENT: "Content Management",
  MEDIA_LIBRARY: "Media Library",
  PRODUCT_MANAGEMENT: "Product Management",
  ORDER_MANAGEMENT: "Order Management",
  USER_MANAGEMENT: "User Management",
  ANALYTICS: "Analytics",
  SYSTEM_SETTINGS: "System Settings",
};

// Update permission options to include FULL_ACCESS
const permissionOptions = Object.keys(permissionLabels);

// Map display role format back to database format for forms
const roleDisplayToValue = {
  'Super Admin': 'SUPER_ADMIN',
  'Content Manager': 'CONTENT_MANAGER',
  'Product Manager': 'PRODUCT_MANAGER',
  'Marketing Manager': 'MARKETING_MANAGER',
};

export default function AdminsPage() {
  const [admins, setAdmins] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedAdmin, setSelectedAdmin] = React.useState(null)
  const [adminToDelete, setAdminToDelete] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "",
    permissions: [],
    status: true,
  })

  React.useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const response = await fetch('/api/admins');
      const result = await response.json();
      if (result.success) {
        // The API now returns `joinDate` and `lastLogin` pre-formatted
        const adminsData = result.data || [];
        setAdmins(adminsData);
        console.log('Admins loaded successfully:', adminsData.length, 'admins');
        // Log first admin data for debugging
        if (adminsData.length > 0) {
          console.log('Sample admin data:', {
            id: adminsData[0].id,
            name: adminsData[0].name,
            role: adminsData[0].role,
            permissions: adminsData[0].permissions,
            permissionsType: typeof adminsData[0].permissions,
            permissionsLength: Array.isArray(adminsData[0].permissions) ? adminsData[0].permissions.length : 'N/A'
          });
        }
      } else {
        throw new Error(result.error || 'Failed to load administrators');
      }
    } catch (error) {
      console.error('Error loading admins:', error);
      alert(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" && admin.status === true) ||
      (filterStatus === "inactive" && admin.status === false)
    return matchesSearch && matchesStatus
  })

  const handleAddAdmin = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role || formData.permissions.length === 0) {
      alert("Please fill in all required fields");
      return;
    }
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setIsAddDialogOpen(false);
        resetForm();
        loadAdmins();
        alert("Admin added successfully");
      } else {
        throw new Error(result.error || 'Failed to add administrator');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      alert(error.message);
    }
  };

  const handleEditAdmin = async () => {
    if (!selectedAdmin || !formData.name || !formData.email || !formData.role || formData.permissions.length === 0) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch(`/api/admins/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setIsEditDialogOpen(false);
        setSelectedAdmin(null);
        resetForm();
        loadAdmins();
        alert("Admin updated successfully");
      } else {
        throw new Error(result.error || 'Failed to update administrator');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert(error.message);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      const response = await fetch(`/api/admins/${adminToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setIsDeleteDialogOpen(false);
        setAdminToDelete(null);
        loadAdmins();
        alert("Admin removed successfully");
      } else {
        throw new Error(result.error || 'Failed to remove administrator');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert(error.message);
    }
  };

  const openEditDialog = (admin) => {
    setSelectedAdmin(admin)
    const roleValue = roleDisplayToValue[admin.role] || admin.role || 'SUPER_ADMIN';
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "", 
      role: roleValue,
      permissions: admin.permissions || [], // Ensure permissions is an array
      status: admin.status === true || admin.status === "Active",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (admin) => {
    setAdminToDelete(admin)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      permissions: [],
      status: true,
    })
  }

  // Reset form when add dialog opens
  React.useEffect(() => {
    if (isAddDialogOpen) {
      setTimeout(() => resetForm(), 0);
    }
  }, [isAddDialogOpen]);


  const togglePermission = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading administrators...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administrators</h1>
          <p className="text-muted-foreground">
            Manage admin users and their permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => loadAdmins(true)}
            variant="outline"
            disabled={refreshing || loading}
            className="hover:bg-accent"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={() => {
              setTimeout(() => resetForm(), 0);
              setIsAddDialogOpen(true);
            }}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins.length}</div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admins.filter(a => a.status === true || a.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {admins.filter(a => a.role === "Super Admin").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Full system access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>
            View and manage administrator accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Status: {filterStatus === "all" ? "All" : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("inactive")}>
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Admins Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Admin</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Permissions</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Join Date</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Login</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className={`border-b transition-colors hover:bg-muted/50 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                        }`}
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{admin.name}</span>
                            <span className="text-xs text-muted-foreground">{admin.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="text-sm font-medium">
                          {admin.role && admin.role.trim() ? admin.role : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {admin.permissions && Array.isArray(admin.permissions) && admin.permissions.length > 0 ? (
                            <>
                              {admin.permissions.slice(0, 3).map((perm, idx) => (
                                <span
                                  key={perm || idx}
                                  className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                                >
                                  {permissionLabels[perm] || perm || 'Unknown'}
                                </span>
                              ))}
                              {admin.permissions.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                                  +{admin.permissions.length - 3} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No permissions</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${admin.status === true || admin.status === "Active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
                          }`}>
                          {admin.status === true || admin.status === "Active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="text-sm text-muted-foreground">
                          {admin.joinDate && admin.joinDate !== 'N/A' && admin.joinDate !== ''
                            ? admin.joinDate
                            : <span className="text-muted-foreground/60 italic">N/A</span>}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="text-sm text-muted-foreground">
                          {admin.lastLogin && admin.lastLogin !== 'Never' && admin.lastLogin !== ''
                            ? admin.lastLogin
                            : <span className="text-muted-foreground/60 italic">Never</span>}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(admin)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => openDeleteDialog(admin)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAdmins.length === 0 && (
              <div className="p-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {admins.length === 0
                    ? 'No administrators found. Click "Add Admin" to create one.'
                    : 'No administrators found matching your criteria.'}
                </p>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} >
        <DialogContent className="bg-popover border-0 shadow-elegant max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Administrator</DialogTitle>
            <DialogDescription>
              Create a new admin account with specific permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}

                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-border/50 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="border-border/50 focus:border-primary bg-background">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="focus:bg-primary/10">
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status ? "active" : "inactive"} onValueChange={(value) => setFormData({ ...formData, status: value === "active" })}>
                  <SelectTrigger className="border-border/50 focus:border-primary bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="active" className="focus:bg-primary/10">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" className="focus:bg-primary/10">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Permissions *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {permissionOptions.map((permission) => (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => togglePermission(permission)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${formData.permissions.includes(permission)
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card border-border/50 hover:border-primary/50"
                        }`}
                    >
                      {permissionLabels[permission]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin} className="bg-gradient-primary hover:opacity-90">
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-popover border-0 shadow-elegant max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Administrator</DialogTitle>
            <DialogDescription>
              Update admin account information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-border/50 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="border-border/50 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="border-border/50 focus:border-primary bg-background">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value} className="focus:bg-primary/10">
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select value={formData.status ? "active" : "inactive"} onValueChange={(value) => setFormData({ ...formData, status: value === "active" })}>
                <SelectTrigger className="border-border/50 focus:border-primary bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  <SelectItem value="active" className="focus:bg-primary/10">
                    Active
                  </SelectItem>
                  <SelectItem value="inactive" className="focus:bg-primary/10">
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permissions *</Label>
              <div className="grid grid-cols-2 gap-2">
                {permissionOptions.map((permission) => (
                  <button
                    key={permission}
                    type="button"
                    onClick={() => togglePermission(permission)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${(formData.permissions || []).includes(permission)
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border/50 hover:border-primary/50"
                      }`}
                  >
                    {permissionLabels[permission]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedAdmin(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEditAdmin} className="bg-gradient-primary hover:opacity-90">
              Update Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-popover border-0 shadow-elegant">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {adminToDelete?.name} from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsDeleteDialogOpen(false); setAdminToDelete(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}