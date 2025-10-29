"use client"

import { AdminLayout } from "@/components/admin/layout/admin-layout"

export default function AdminLayoutWrapper({ children }) {
  return <AdminLayout>{children}</AdminLayout>
}
