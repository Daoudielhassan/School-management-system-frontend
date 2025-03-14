"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, UserPlus, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Class {
  id: number
  name: string
  departmentId: number
  level: number
}

interface Student {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  status: string
  dateOfBirth: string
  classeId: number
}

const AddStudent = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [manualStudent, setManualStudent] = useState<Student>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    status: "active",
    dateOfBirth: "",
    classeId: 0,
  })
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:8080/api/classes")
        if (!response.ok) throw new Error("Failed to fetch classes")
        const data = await response.json()
        setClasses(data)
      } catch (error) {
        console.error("Error fetching classes:", error)
        toast.error("Failed to load class data")
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setManualStudent({ ...manualStudent, [name]: value })
  }

  const handleClassChange = (value: string) => {
    setManualStudent({ ...manualStudent, classeId: Number.parseInt(value) })
  }

  const validateForm = () => {
    if (
      !manualStudent.firstName ||
      !manualStudent.lastName ||
      !manualStudent.email ||
      !manualStudent.phoneNumber ||
      !manualStudent.dateOfBirth
    ) {
      setError("All fields are required")
      return false
    }
    setError("")
    return true
  }

  const handleManualSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...manualStudent,
          departmentId: classes.find((c) => c.id === manualStudent.classeId)?.departmentId,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) throw new Error(responseData.message || "Failed to add student")

      toast.success("Student added successfully!")
      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding student:", error)
      toast.error(`Failed to add student: ${(error as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setManualStudent({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      status: "active",
      dateOfBirth: "",
      classeId: 0,
    })
    setError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    setUploadError("")
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload")
      return
    }

    // Validate file type
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
    if (fileExtension !== "csv" && fileExtension !== "xlsx") {
      setUploadError("Only CSV or Excel files are supported")
      return
    }

    setUploadLoading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("http://localhost:8080/api/students/bulk-upload", {
        method: "POST",
        body: formData,
      })

      const responseData = await response.json()

      if (!response.ok) throw new Error(responseData.message || "Failed to upload students")

      toast.success(`Successfully uploaded ${responseData.count || "multiple"} students!`)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading students:", error)
      setUploadError(`Failed to upload: ${(error as Error).message}`)
      toast.error(`Upload failed: ${(error as Error).message}`)
    } finally {
      setUploadLoading(false)
    }
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6">
        <CardTitle className="text-2xl font-bold">Student Management</CardTitle>
        <CardDescription className="text-blue-100">Add new students individually or in bulk</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <UserPlus size={18} />
              <span>Add Manually</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={18} />
              <span>Bulk Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <div className="flex justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-md flex items-center gap-2">
                    <UserPlus size={18} />
                    Add Student Manually
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-800">Add Student</DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                      Fill out the form below to add a new student.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={manualStudent.firstName}
                          onChange={handleManualInputChange}
                          placeholder="John"
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={manualStudent.lastName}
                          onChange={handleManualInputChange}
                          placeholder="Doe"
                          className="w-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={manualStudent.email}
                        onChange={handleManualInputChange}
                        placeholder="john.doe@example.com"
                        className="w-full"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={manualStudent.phoneNumber}
                          onChange={handleManualInputChange}
                          placeholder="+1 (555) 123-4567"
                          className="w-full"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={manualStudent.dateOfBirth}
                          onChange={handleManualInputChange}
                          className="w-full"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select
                        onValueChange={handleClassChange}
                        value={manualStudent.classeId ? manualStudent.classeId.toString() : ""}
                      >
                        <SelectTrigger id="class" className="w-full">
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((classe) => (
                            <SelectItem key={classe.id} value={classe.id.toString()}>
                              {classe.name} (Level {classe.level}) - Department {classe.departmentId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        onValueChange={(value) => setManualStudent({ ...manualStudent, status: value })}
                        value={manualStudent.status}
                      >
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetForm()
                        setIsDialogOpen(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleManualSubmit}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add Student"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <FileSpreadsheet className="text-blue-600 h-10 w-10 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-1">Bulk Upload Students</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV or Excel file containing student information. The file should include columns for first
                    name, last name, email, phone number, date of birth, class ID, and status.
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="file-upload">Upload File</Label>
                      <div className="flex gap-2">
                        <Input
                          id="file-upload"
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".csv,.xlsx"
                          className="flex-1"
                        />
                        <Button
                          onClick={handleFileUpload}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                          disabled={uploadLoading || !selectedFile}
                        >
                          {uploadLoading ? "Uploading..." : "Upload"}
                          <Upload size={16} />
                        </Button>
                      </div>
                      {selectedFile && <p className="text-sm text-gray-600">Selected file: {selectedFile.name}</p>}
                    </div>

                    {uploadError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <h4 className="text-sm font-medium text-amber-800 mb-1">Template Format</h4>
                      <p className="text-xs text-gray-600">
                        Download our{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          template file
                        </a>{" "}
                        to ensure your data is formatted correctly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Need help? Contact the IT department at{" "}
          <a href="mailto:it@example.com" className="text-blue-600 hover:underline">
            it@example.com
          </a>
        </p>
      </CardFooter>
      <ToastContainer position="top-right" autoClose={5000} />
    </Card>
  )
}

export default AddStudent

