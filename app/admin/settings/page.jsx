"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Settings,
  Save,
  Globe,
  Mail,
  Shield,
  Palette,
  Database,
  Bell,
  Key,
  Users,
} from "lucide-react"

const settingsSections = [
  {
    id: "general",
    title: "General Settings",
    description: "Basic site configuration and information",
    icon: Globe,
    fields: [
      {
        name: "siteName",
        label: "Site Name",
        type: "text",
        value: "Cyber Yakku",
        placeholder: "Enter site name",
      },
      {
        name: "siteDescription",
        label: "Site Description",
        type: "textarea",
        value: "Premium gaming marketplace for all your gaming needs",
        placeholder: "Enter site description",
      },
      {
        name: "siteUrl",
        label: "Site URL",
        type: "url",
        value: "https://cyberyakku.com",
        placeholder: "https://example.com",
      },
    ],
  },
  {
    id: "email",
    title: "Email Settings",
    description: "Configure email notifications and SMTP settings",
    icon: Mail,
    fields: [
      {
        name: "smtpHost",
        label: "SMTP Host",
        type: "text",
        value: "smtp.gmail.com",
        placeholder: "smtp.gmail.com",
      },
      {
        name: "smtpPort",
        label: "SMTP Port",
        type: "number",
        value: "587",
        placeholder: "587",
      },
      {
        name: "smtpUser",
        label: "SMTP Username",
        type: "email",
        value: "noreply@cyberyakku.com",
        placeholder: "noreply@example.com",
      },
    ],
  },
  {
    id: "security",
    title: "Security Settings",
    description: "Configure security policies and authentication",
    icon: Shield,
    fields: [
      {
        name: "sessionTimeout",
        label: "Session Timeout (minutes)",
        type: "number",
        value: "60",
        placeholder: "60",
      },
      {
        name: "maxLoginAttempts",
        label: "Max Login Attempts",
        type: "number",
        value: "5",
        placeholder: "5",
      },
      {
        name: "require2FA",
        label: "Require 2FA",
        type: "checkbox",
        value: false,
      },
    ],
  },
  {
    id: "appearance",
    title: "Appearance",
    description: "Customize the look and feel of your admin panel",
    icon: Palette,
    fields: [
      {
        name: "primaryColor",
        label: "Primary Color",
        type: "color",
        value: "#8b5cf6",
        placeholder: "#8b5cf6",
      },
      {
        name: "logoUrl",
        label: "Logo URL",
        type: "url",
        value: "",
        placeholder: "https://example.com/logo.png",
      },
      {
        name: "faviconUrl",
        label: "Favicon URL",
        type: "url",
        value: "",
        placeholder: "https://example.com/favicon.ico",
      },
    ],
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = React.useState({})
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    // Initialize settings with default values
    const defaultSettings = {}
    settingsSections.forEach((section) => {
      section.fields.forEach((field) => {
        defaultSettings[field.name] = field.value
      })
    })
    setSettings(defaultSettings)
  }, [])

  const handleFieldChange = (fieldName, value) => {
    setSettings((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Settings saved:", settings)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (field) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={settings[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.name}
              checked={settings[field.name] || false}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <label htmlFor={field.name} className="text-sm">
              Enable {field.label}
            </label>
          </div>
        )
      case "color":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings[field.name] || field.value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="h-10 w-20 rounded border border-input"
            />
            <Input
              value={settings[field.name] || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="flex-1"
            />
          </div>
        )
      default:
        return (
          <Input
            type={field.type}
            value={settings[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your admin panel and site settings
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Reset All Settings</h4>
              <p className="text-sm text-muted-foreground">
                Reset all settings to their default values
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Reset Settings
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Delete All Data</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete all data from the database
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
