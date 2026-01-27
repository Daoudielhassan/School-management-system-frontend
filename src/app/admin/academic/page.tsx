"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AcademicStructureClient } from "@/lib/api-clients"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DataTable } from "@/components/admin/DataTable"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "react-toastify"
import { Calendar, Plus, Edit, Trash2, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface AcademicYear {
    id: number
    name: string
    startDate: string
    endDate: string
    status: string // ACTIVE, UPCOMING, ARCHIVED
}

export default function AcademicYearsPage() {
    const { token } = useAuth()
    const queryClient = useQueryClient()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: ""
    })

    const { data: years = [], isLoading } = useQuery({
        queryKey: ['academic-years'],
        queryFn: () => token ? AcademicStructureClient.getAllAcademicYears(token) : [],
        enabled: !!token
    })

    const createYearMutation = useMutation({
        mutationFn: (data: any) => AcademicStructureClient.createAcademicYear(data, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-years'] })
            toast.success("Academic year created successfully")
            setIsCreateOpen(false)
            setFormData({ name: "", startDate: "", endDate: "" })
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create academic year")
        }
    })

    const setActiveMutation = useMutation({
        mutationFn: (id: number) => AcademicStructureClient.setActiveAcademicYear(id, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['academic-years'] })
            toast.success("Active academic year updated")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update active year")
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        createYearMutation.mutate(formData)
    }

    const columns: ColumnDef<AcademicYear>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>
        },
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({ row }) => format(new Date(row.getValue("startDate")), "PP"),
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({ row }) => format(new Date(row.getValue("endDate")), "PP"),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string
                return (
                    <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
                        {status}
                    </Badge>
                )
            }
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    {row.original.status !== "ACTIVE" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveMutation.mutate(row.original.id)}
                            disabled={setActiveMutation.isPending}
                        >
                            <CheckCircle className="h-4 w-4 mr-1" /> Set Active
                        </Button>
                    )}
                    <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Academic Years</h1>
                    <p className="text-muted-foreground">Manage academic calendar and semesters.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Academic Year
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Academic Year</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="2026-2027"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={createYearMutation.isPending}>
                                {createYearMutation.isPending ? "Creating..." : "Create"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Academic Years</CardTitle>
                    <CardDescription>
                        History of all academic years configured in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={years}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
