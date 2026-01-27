"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AdminServiceClient } from "@/lib/api-clients"
import { useAuth } from "@/context/AuthContext"
import { DataTable } from "@/components/admin/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Shield, Search, Filter, Download } from "lucide-react"

interface AuditLog {
    id: number
    userId: number
    username: string
    action: string
    resource: string
    details: string
    ipAddress: string
    timestamp: string
}

export default function AuditLogsPage() {
    const { token } = useAuth()
    const [actionFilter, setActionFilter] = useState<string>("ALL")
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })

    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['audit-logs', actionFilter, dateRange],
        queryFn: async () => {
            if (!token) return []

            if (actionFilter !== "ALL") {
                return AdminServiceClient.getAuditLogsByAction(actionFilter, token)
            }

            if (dateRange.start && dateRange.end) {
                return AdminServiceClient.getAuditLogsByDateRange(dateRange.start, dateRange.end, token)
            }

            return AdminServiceClient.getAllAuditLogs(token)
        },
        enabled: !!token
    })

    const columns: ColumnDef<AuditLog>[] = [
        {
            accessorKey: "timestamp",
            header: "Date & Time",
            cell: ({ row }) => format(new Date(row.getValue("timestamp")), "PPpp"),
        },
        {
            accessorKey: "username",
            header: "User",
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: ({ row }) => {
                const action = row.getValue("action") as string
                let color = "bg-gray-100 text-gray-800"

                if (action.includes("CREATE")) color = "bg-green-100 text-green-800"
                if (action.includes("UPDATE")) color = "bg-blue-100 text-blue-800"
                if (action.includes("DELETE")) color = "bg-red-100 text-red-800"
                if (action.includes("LOGIN")) color = "bg-purple-100 text-purple-800"

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                        {action}
                    </span>
                )
            }
        },
        {
            accessorKey: "resource",
            header: "Resource",
        },
        {
            accessorKey: "details",
            header: "Details",
            cell: ({ row }) => (
                <span className="truncate max-w-[300px] block" title={row.getValue("details")}>
                    {row.getValue("details")}
                </span>
            )
        },
        {
            accessorKey: "ipAddress",
            header: "IP Address",
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">Monitor system activity and security events.</p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                    <CardDescription>
                        View and filter audit logs from all system components.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="w-[200px]">
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Actions</SelectItem>
                                    <SelectItem value="LOGIN">Login</SelectItem>
                                    <SelectItem value="CREATE">Create</SelectItem>
                                    <SelectItem value="UPDATE">Update</SelectItem>
                                    <SelectItem value="DELETE">Delete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Date range pickers could go here */}
                    </div>

                    <DataTable
                        columns={columns}
                        data={logs}
                        searchKey="username"
                        searchPlaceholder="Search by username..."
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
