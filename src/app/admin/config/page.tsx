"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminServiceClient } from "@/lib/api-clients"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-toastify"
import { Save, RefreshCw, Settings } from "lucide-react"

interface SystemConfig {
    key: string
    value: string
    description: string
    category: string
}

export default function SystemConfigPage() {
    const { token } = useAuth()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState("general")

    const { data: configs = [], isLoading } = useQuery({
        queryKey: ['system-config'],
        queryFn: () => token ? AdminServiceClient.getAllConfigs(token) : [],
        enabled: !!token
    })

    const updateConfigMutation = useMutation({
        mutationFn: (data: { key: string, value: string }) =>
            AdminServiceClient.updateConfig(data.key, { value: data.value }, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-config'] })
            toast.success("Configuration updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update configuration")
        }
    })

    const handleSave = (key: string, value: string) => {
        updateConfigMutation.mutate({ key, value })
    }

    // Group configs by category
    const groupedConfigs = configs.reduce((acc: any, config: SystemConfig) => {
        const category = config.category || 'general'
        if (!acc[category]) acc[category] = []
        acc[category].push(config)
        return acc
    }, {})

    const categories = Object.keys(groupedConfigs)

    if (isLoading) return <div>Loading configuration...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
                    <p className="text-muted-foreground">Manage global system settings and parameters.</p>
                </div>
            </div>

            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    {categories.length > 0 ? (
                        categories.map(category => (
                            <TabsTrigger key={category} value={category} className="capitalize">
                                {category}
                            </TabsTrigger>
                        ))
                    ) : (
                        <TabsTrigger value="general">General</TabsTrigger>
                    )}
                </TabsList>

                {categories.length > 0 ? (
                    categories.map(category => (
                        <TabsContent key={category} value={category}>
                            <div className="grid gap-6">
                                {groupedConfigs[category].map((config: SystemConfig) => (
                                    <ConfigCard
                                        key={config.key}
                                        config={config}
                                        onSave={handleSave}
                                        isUpdating={updateConfigMutation.isPending}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    ))
                ) : (
                    <TabsContent value="general">
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                No configurations found. Initialize the system to see settings here.
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}

function ConfigCard({ config, onSave, isUpdating }: { config: SystemConfig, onSave: (k: string, v: string) => void, isUpdating: boolean }) {
    const [value, setValue] = useState(config.value)
    const [isDirty, setIsDirty] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        setIsDirty(e.target.value !== config.value)
    }

    const handleSave = () => {
        onSave(config.key, value)
        setIsDirty(false)
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">{config.key}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 items-end">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor={config.key}>Value</Label>
                        <Input
                            id={config.key}
                            value={value}
                            onChange={handleChange}
                        />
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty || isUpdating}
                    >
                        {isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
