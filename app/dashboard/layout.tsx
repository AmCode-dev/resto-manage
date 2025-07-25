"use client"

import type React from "react"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { useState } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
