"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/domain/entities/user"
import { userRepository } from "@/infrastructure/repositories/api-user-repository"
import { DEFAULT_USER_EMAIL } from "@/infrastructure/api/api-client"
import { useToast } from "@/hooks/use-toast"

export function UserProfileView() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    salary: 0,
    savings: 0,
  })
  const { toast } = useToast()

  const loadUser = async () => {
    try {
      const userData = await userRepository.findByEmail(DEFAULT_USER_EMAIL)
      setUser(userData)
      if (userData) {
        setFormData({
          name: userData.name,
          salary: userData.salary,
          savings: userData.savings,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const updatedUser = await userRepository.update({
        email: user.email,
        name: formData.name,
        salary: formData.salary,
        savings: formData.savings,
        active: user.active,
      })
      setUser(updatedUser)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        salary: user.salary,
        savings: user.savings,
      })
    }
    setIsEditing(false)
  }

  if (isLoading && !user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">User Profile</h2>
          {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details and financial information</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || DEFAULT_USER_EMAIL} disabled />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      step="0.01"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="Enter your monthly salary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="savings">Savings</Label>
                    <Input
                      id="savings"
                      type="number"
                      step="0.01"
                      value={formData.savings}
                      onChange={(e) => setFormData({ ...formData, savings: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="Enter your savings amount"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">{user?.email || DEFAULT_USER_EMAIL}</p>
                  </div>

                  <div>
                    <Label>Name</Label>
                    <p className="text-sm text-muted-foreground">{user?.name || "Not set"}</p>
                  </div>

                  <div>
                    <Label>Monthly Salary</Label>
                    <p className="text-sm text-muted-foreground">${user?.salary?.toLocaleString() || "0.00"}</p>
                  </div>

                  <div>
                    <Label>Savings</Label>
                    <p className="text-sm text-muted-foreground">${user?.savings?.toLocaleString() || "0.00"}</p>
                  </div>

                  {user?.createdAt && (
                    <div>
                      <Label>Member Since</Label>
                      <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>Your account information and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">{user?.active ? "Active" : "Inactive"}</p>
                </div>

                {user?.updatedAt && (
                  <div>
                    <Label>Last Updated</Label>
                    <p className="text-sm text-muted-foreground">{new Date(user.updatedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
