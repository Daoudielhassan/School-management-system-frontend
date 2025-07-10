'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building, Plus, Users, BookOpen, Calendar, Edit, Trash2, Search, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";

interface Department {
  id: number;
  name: string;
  description: string;
  headId: number;
  headName: string;
  studentCount: number;
  classCount: number;
  professorCount: number;
}

interface Class {
  id: number;
  name: string;
  level: number;
  studentCount: number;
  departmentId: number;
}

export default function DepartmentsPage() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Simulated API call for departments
    setTimeout(() => {
      setDepartments([
        { id: 1, name: "Computer Science", description: "Advanced computing and software development", headId: 1, headName: "Dr. Smith", studentCount: 450, classCount: 12, professorCount: 25 },
        { id: 2, name: "Mathematics", description: "Pure and applied mathematics", headId: 2, headName: "Dr. Johnson", studentCount: 320, classCount: 8, professorCount: 18 },
        { id: 3, name: "Physics", description: "Theoretical and experimental physics", headId: 3, headName: "Dr. Williams", studentCount: 280, classCount: 10, professorCount: 20 },
        { id: 4, name: "Engineering", description: "Mechanical and electrical engineering", headId: 4, headName: "Dr. Brown", studentCount: 380, classCount: 15, professorCount: 22 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      // Simulated API call for classes
      setClasses([
        { id: 1, name: "L1 Info", level: 1, studentCount: 45, departmentId: selectedDepartment },
        { id: 2, name: "L2 Info", level: 2, studentCount: 38, departmentId: selectedDepartment },
        { id: 3, name: "L3 Info", level: 3, studentCount: 42, departmentId: selectedDepartment },
        { id: 4, name: "M1 Info", level: 4, studentCount: 35, departmentId: selectedDepartment },
        { id: 5, name: "M2 Info", level: 5, studentCount: 30, departmentId: selectedDepartment },
      ]);
    }
  }, [selectedDepartment]);

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DepartmentCard = ({ department }: { department: Department }) => (
    <Card 
      className="bg-gradient-to-br from-teal-500/10 to-yellow-500/5 backdrop-blur-md border-teal-400/20 hover:border-yellow-400/40 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-teal-500/20"
      onClick={() => setSelectedDepartment(selectedDepartment === department.id ? null : department.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-yellow-500/20 group-hover:from-teal-500/30 group-hover:to-yellow-500/30 transition-all">
              <Building className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <CardTitle className="text-white group-hover:text-teal-300 transition-colors">{department.name}</CardTitle>
              <CardDescription className="text-blue-200">Head: {department.headName}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-teal-500/20 text-teal-300">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-red-500/20 text-red-300">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-blue-200 mb-4">{department.description}</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{department.studentCount}</div>
            <div className="text-xs text-blue-300">Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{department.classCount}</div>
            <div className="text-xs text-blue-300">Classes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{department.professorCount}</div>
            <div className="text-xs text-blue-300">Professors</div>
          </div>
        </div>
        
        {selectedDepartment === department.id && (
          <div className="mt-4 pt-4 border-t border-teal-400/20">
            <h4 className="text-sm font-semibold text-teal-300 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Classes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {classes.map((cls) => (
                <div key={cls.id} className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-teal-400/30 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{cls.name}</span>
                    <Badge variant="outline" className="border-teal-400/30 text-teal-300">
                      {cls.studentCount} students
                    </Badge>
                  </div>
                  <div className="text-xs text-blue-300 mt-1">Level {cls.level}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Department Management
          </h1>
          <p className="text-blue-200 mt-2">Organize and manage academic departments and classes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-500 to-yellow-600 hover:from-teal-600 hover:to-yellow-700 text-white shadow-lg shadow-teal-500/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800/95 backdrop-blur-md border-teal-500/30">
            <DialogHeader>
              <DialogTitle className="text-teal-300">Create New Department</DialogTitle>
              <DialogDescription className="text-blue-200">
                Add a new department to the academic structure
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-blue-200">Department Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Computer Science" 
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-blue-200">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief description of the department" 
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />
              </div>
              <div>
                <Label htmlFor="head" className="text-blue-200">Department Head</Label>
                <Input 
                  id="head" 
                  placeholder="Select department head" 
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-teal-500 to-yellow-600 hover:from-teal-600 hover:to-yellow-700">
                Create Department
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-teal-400" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-teal-400"
              />
            </div>
            <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Department Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-teal-500/20 to-cyan-500/10 backdrop-blur-md border-teal-400/30">
          <CardContent className="p-6 text-center">
            <Building className="h-8 w-8 text-teal-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{departments.length}</div>
            <div className="text-sm text-teal-300">Total Departments</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 backdrop-blur-md border-yellow-400/30">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {departments.reduce((sum, dept) => sum + dept.studentCount, 0)}
            </div>
            <div className="text-sm text-yellow-300">Total Students</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/10 backdrop-blur-md border-blue-400/30">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {departments.reduce((sum, dept) => sum + dept.classCount, 0)}
            </div>
            <div className="text-sm text-blue-300">Total Classes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 backdrop-blur-md border-purple-400/30">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {departments.reduce((sum, dept) => sum + dept.professorCount, 0)}
            </div>
            <div className="text-sm text-purple-300">Total Professors</div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 backdrop-blur-md rounded-xl h-64 border border-white/10"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDepartments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </div>
      )}

      {filteredDepartments.length === 0 && !loading && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-teal-400/50 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No departments found</h3>
            <p className="text-blue-200 text-center mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start by creating your first department"}
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-yellow-600 hover:from-teal-600 hover:to-yellow-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}