"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminServiceClient } from "@/lib/api-clients"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "react-toastify"
import { Database, Download, RotateCcw, FileArchive, HardDrive, Clock } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Backup {
    id: string
    filename: string
    size: number
    createdAt: string
    status: string
    type: string
}

export default function BackupsPage() {
    const { token } = useAuth()
    const queryClient = useQueryClient()

    const { data: backups = [], isLoading } = useQuery({
        queryKey: ['backups'],
        queryFn: () => token ? AdminServiceClient.listBackups(token) : [],
        enabled: !!token
    })

    const createBackupMutation = useMutation({
        mutationFn: () => AdminServiceClient.createBackup(token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['backups'] })
            toast.success("Backup created successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create backup")
        }
    })

    const restoreBackupMutation = useMutation({
        mutationFn: (id: string) => AdminServiceClient.restoreBackup(id, token!),
        onSuccess: () => {
            toast.success("System restored successfully")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to restore backup")
        }
    })

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const columns: ColumnDef<Backup>[] = [
        {
            accessorKey: "filename",
            header: "Filename",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <FileArchive className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{row.getValue("filename")}</span>
                </div>
            )
        },
        {
            accessorKey: "size",
            header: "Size",
            cell: ({ row }) => formatSize(row.getValue("size")),
        },
        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PP p"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {row.getValue("status")}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            if (confirm("Are you sure you want to restore this backup? Current data will be overwritten.")) {
                                restoreBackupMutation.mutate(row.original.id)
                            }
                        }}
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
                    <p className="text-muted-foreground">Manage database backups and system restoration.</p>
                </div>
                <Button onClick={() => createBackupMutation.mutate()} disabled={createBackupMutation.isPending}>
                    <Database className="mr-2 h-4 w-4" />
                    {createBackupMutation.isPending ? "Creating..." : "Create Backup"}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{backups.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {backups.length > 0 ? format(new Date(backups[0].createdAt), "MMM d, HH:mm") : "Never"}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatSize(backups.reduce((acc: number, b: Backup) => acc + b.size, 0))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Backup History</CardTitle>
                    <CardDescription>
                        List of all available system backups.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={backups}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
