'use client';

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
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, UserPlus, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from "@/config/api";

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

interface StudentData {
  id: number
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  phoneNumber: string
  status: string
  classe: Class
}

// AddStudent Component
const AddStudent = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [manualStudent, setManualStudent] = useState<Student>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    status: "active",
    dateOfBirth: "",
    classeId: 0,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await apiGet(API_ENDPOINTS.CLASSES, token);
        setClasses(data);
      } catch (error: any) {
        toast.error("Failed to load class data");
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [token]);

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManualStudent({ ...manualStudent, [name]: value });
  };

  const handleClassChange = (value: string) => {
    setManualStudent({ ...manualStudent, classeId: Number.parseInt(value) });
  };

  const validateForm = () => {
    if (
      !manualStudent.firstName ||
      !manualStudent.lastName ||
      !manualStudent.email ||
      !manualStudent.phoneNumber ||
      !manualStudent.dateOfBirth
    ) {
      setError("All fields are required");
      return false;
    }
    setError("");
    return true;
  };

  const handleManualSubmit = async () => {
    if (!validateForm()) return;
    if (!token) {
      toast.error("Authentication token not available");
      return;
    }
    setLoading(true);
    try {
      const response = await apiPost(API_ENDPOINTS.STUDENTS, {
        ...manualStudent,
        departmentId: classes.find((c) => c.id === manualStudent.classeId)?.departmentId,
      }, token);
      toast.success("Student added successfully!");
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      let message = error?.message || "Failed to add student";
      if (error?.response?.data) {
        if (typeof error.response.data === "string") {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setManualStudent({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      status: "active",
      dateOfBirth: "",
      classeId: 0,
    });
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError("");
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file to upload");
      return;
    }
    if (!token) {
      setUploadError("Authentication token not available");
      return;
    }
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "csv" && fileExtension !== "xlsx") {
      setUploadError("Only CSV or Excel files are supported");
      return;
    }
    setUploadLoading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${API_ENDPOINTS.STUDENTS}/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Failed to upload students");
      toast.success(`Successfully uploaded ${responseData.count || "multiple"} students!`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      setUploadError(`Failed to upload: ${error.message}`);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }} className="shadow-md rounded-lg overflow-hidden">
      <CardHeader style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }} className="p-6">
        <CardTitle className="text-2xl font-bold">Student Management</CardTitle>
        <CardDescription style={{ color: 'var(--background)' }}>Add new students individually or in bulk</CardDescription>
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
                    Upload a CSV or Excel file containing student information.
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
            it.club@aiac.ma
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}

// StudentManagement Component
const StudentManagement = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [studentToDeleteId, setStudentToDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      let url = `${API_ENDPOINTS.STUDENTS}?page=${page}&size=10`;
      if (searchTerm) url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      if (filter && filter !== "all") url += `&status=${encodeURIComponent(filter)}`;
      else url += `&status=all`;

      const data = await apiGet(url, token);
      setStudents(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (error: any) {
      setError(error.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [page, searchTerm, filter, token]);

  const handleEdit = (student: StudentData) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (studentId: number) => {
    setStudentToDeleteId(studentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (studentToDeleteId === null || !token) return;
    setLoading(true);
    try {
      await apiDelete(`${API_ENDPOINTS.STUDENTS}/${studentToDeleteId}`, token);
      toast.success("Student deleted successfully!");
      fetchStudents();
    } catch (error: any) {
      console.error("Delete error:", error);
      let errorMessage = "Failed to delete student";
      
      if (error.message) {
        if (error.message.includes("404")) {
          errorMessage = "Student not found";
        } else if (error.message.includes("403")) {
          errorMessage = "You don't have permission to delete this student";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error occurred while deleting student";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setStudentToDeleteId(null);
      setLoading(false);
    }
  };

  const handleSave = async (updatedStudent: StudentData) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiPut(`${API_ENDPOINTS.STUDENTS}/${updatedStudent.id}`, updatedStudent, token);
      fetchStudents();
    } catch (error: any) {
      setError(error.message || "Failed to update student");
    } finally {
      setIsEditModalOpen(false);
      setLoading(false);
    }
  };

  return (
    <Card style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }} className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold" style={{ color: 'var(--primary)' }}>Student Management</CardTitle>
        <div className="flex gap-2 mt-4">
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-lg bg-white border border-blue-950 text-black focus:border-blue-950"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#2A3747] hover:bg-[#2A3747] hover:text-[#00D4FF]">
                Filter <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1E2D3D] border-[#2A3747] text-white">
              <DropdownMenuItem onClick={() => setFilter("all")} className="hover:bg-[#2A3747] cursor-pointer">
                All Students
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("active")} className="hover:bg-[#2A3747] cursor-pointer">
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inactive")} className="hover:bg-[#2A3747] cursor-pointer">
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400">Loading students...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-400">{error}</TableCell>
              </TableRow>
            ) : students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.firstName} {student.lastName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phoneNumber}</TableCell>
                  <TableCell>{student.classe.name}</TableCell>
                  <TableCell className={student.status === "active" ? "text-green-400" : "text-red-400"}>
                    {student.status}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(student)} className="mr-2">Edit</Button>
                    <Button onClick={() => handleDeleteClick(student.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400">No students found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page === 0}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="text-gray-400">Page {page + 1} of {totalPages}</span>
        <Button onClick={() => setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev))} disabled={page >= totalPages - 1}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>

      {/* Edit Student Modal */}
      {isEditModalOpen && selectedStudent && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="p-6 rounded-lg shadow-lg bg-gray-300 w-full max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Input
                name="firstName"
                value={selectedStudent.firstName}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, firstName: e.target.value })}
                placeholder="First Name"
              />
              <Input
                name="lastName"
                value={selectedStudent.lastName}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, lastName: e.target.value })}
                placeholder="Last Name"
              />
              <Input
                name="email"
                value={selectedStudent.email}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                placeholder="Email"
              />
              <Input
                name="phoneNumber"
                value={selectedStudent.phoneNumber}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, phoneNumber: e.target.value })}
                placeholder="Phone Number"
              />
              <Input
                name="status"
                value={selectedStudent.status}
                onChange={(e) => setSelectedStudent({ ...selectedStudent, status: e.target.value })}
                placeholder="Status"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={() => handleSave(selectedStudent)}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

        {/* Delete Modal */}
  {isDeleteModalOpen && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this student?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default function AdminStudentsPage() {
  const { token, isAuthenticated, role, userId } = useAuth();
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
          {!isAuthenticated && (
            <p className="text-red-600 mt-2">Please log in to access this page.</p>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug info: isAuthenticated={isAuthenticated.toString()}</p>
            <p>Debug info: token={token ? "present" : "missing"}</p>
            <p>Debug info: role={role || "none"}</p>
            <p>Debug info: userId={userId || "none"}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>Gestion des étudiants</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Ajout et gestion des étudiants du système</p>
      </div>
      <AddStudent />
      <StudentManagement />
    </div>
  );
}