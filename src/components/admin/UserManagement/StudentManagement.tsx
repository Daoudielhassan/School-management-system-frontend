'use client';

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";

interface Classe {
  id: number;
  name: string;
  level: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  status: string;
  classe: Classe;
}

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0); // Pagination starts from 0
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDeleteId, setStudentToDeleteId] = useState<number | null>(null);

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/students?page=${page}&size=10&searchTerm=${searchTerm}&status=${filter}`
      );
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, searchTerm, filter]);

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (studentId: number) => {
    setStudentToDeleteId(studentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (studentToDeleteId === null) return;

    try {
      const response = await fetch(`http://localhost:8080/api/students/${studentToDeleteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Failed to delete student");
      // Refresh the student list after deletion
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setStudentToDeleteId(null);
    }
  };

  const handleSave = async (updatedStudent: Student) => {
    try {
      const response = await fetch(`http://localhost:8080/api/students/${updatedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStudent),
      });
      if (!response.ok) throw new Error("Failed to update student");
      // Refresh the student list after update
      fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  return (
    <Card className="bg-gray border-[#2A3747] shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-blue-900">Student Management</CardTitle>
        <div className="flex gap-2 mt-4">
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-lg bg-white border  border-y-blue-950 text-BLACK focus:border-blue-950 "
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
            {students.length > 0 ? (
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
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <ModalContent className="p-6 rounded-lg shadow-lg bg-gray-300 w-full max-w-md">
            <ModalHeader>Edit Student</ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={() => handleSave(selectedStudent)}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <ModalContent className="p-6 rounded-lg shadow-lg bg-gray-300 w-full max-w-md">
            <ModalHeader>Confirm Deletion</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to delete this student?</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Card>
  );
};

export default StudentManagement;