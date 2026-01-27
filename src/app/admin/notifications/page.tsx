"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminServiceClient } from "@/lib/api-clients"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/admin/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "react-toastify"
import { Bell, Send, Clock } from "lucide-react"
import { format } from "date-fns"

interface Notification {
    id: number
    title: string
    message: string
    priority: string
    targetAudience: string
    scheduledFor?: string
    status: string
    createdAt: string
}

export default function NotificationsPage() {
    const { token } = useAuth()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        priority: "NORMAL",
        targetRoles: "ALL"
    })

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['scheduled-notifications'],
        queryFn: () => token ? AdminServiceClient.getScheduledNotifications(token) : [],
        enabled: !!token
    })

    const broadcastMutation = useMutation({
        mutationFn: (data: any) => AdminServiceClient.broadcastNotification(data, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] })
            toast.success("Notification broadcasted successfully")
            setFormData({ title: "", message: "", priority: "NORMAL", targetRoles: "ALL" })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to broadcast notification")
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        broadcastMutation.mutate(formData)
    }

    const columns: ColumnDef<Notification>[] = [
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "targetAudience",
            header: "Audience",
            cell: ({ row }) => <Badge variant="outline">{row.getValue("targetAudience")}</Badge>
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const priority = row.getValue("priority") as string
                return (
                    <Badge variant={priority === "HIGH" ? "destructive" : "secondary"}>
                        {priority}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Status",
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PP p"),
        },
    ]

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Global Notifications</h1>
                    <p className="text-muted-foreground">Broadcast messages to all users or specific roles.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Send Broadcast</CardTitle>
                        <CardDescription>Create a new notification to send immediately.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="System Maintenance"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="The system will be down for maintenance..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(v) => setFormData({ ...formData, priority: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="NORMAL">Normal</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="URGENT">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="target">Target Audience</Label>
                                    <Select
                                        value={formData.targetRoles}
                                        onValueChange={(v) => setFormData({ ...formData, targetRoles: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Users</SelectItem>
                                            <SelectItem value="STUDENT">Students Only</SelectItem>
                                            <SelectItem value="INSTRUCTOR">Instructors Only</SelectItem>
                                            <SelectItem value="MANAGER">Managers Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={broadcastMutation.isPending}>
                                {broadcastMutation.isPending ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Send Broadcast
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Recent History</CardTitle>
                        <CardDescription>Recently sent and scheduled notifications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={notifications}
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

import { Badge } from "@/components/ui/badge"
