'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  Building,
  Layers,
  FileText,
  Settings,
  Eye,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from "@/config/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Department {
  id: number;
  name: string;
  managerId?: number;
}

interface Module {
  id: number;
  name: string;
  department_id: number;
}

interface Subject {
  id: number;
  name: string;
  description?: string;
  moduleId: number;
  syllabus?: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  status: string;
  classeId: number;
  departmentId: number;
  user_id?: number;
  classe?: {
    id: number;
    name: string;
    level: number;
    departmentId: number;
  };
}

interface AttendanceRecord {
  id: number;
  studentId: number;
  sessionId: number;
  status: string;
  recordedAt?: string;
  studentName: string;
  subjectName: string;
  instructorName: string;
  sessionDate: string;
  sessiontype: string;
  roomNumber: string;
  startTime: string;
  endTime: string;
}

interface Class {
  id: number;
  name: string;
  level: number;
  departmentId: number;
  department?: Department;
  studentCount?: number;
  modules?: Module[];
  subjects?: Subject[];
}

interface ClassSchedule {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectId: number;
  subjectName: string;
  instructorName?: string;
  roomNumber?: string;
}

interface UserStats {
  totalUsers: number;
  identityCounts: { identity: string; count: number }[];
}

export default function AdminClassesPage() {
  const { token, userId } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false);
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    level: 1,
    departmentId: 0
  });

  // Student pagination state
  const [studentPage, setStudentPage] = useState(0);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [studentLoading, setStudentLoading] = useState(false);
  const [selectedClassStudents, setSelectedClassStudents] = useState<Student[]>([]);

  // Stats state
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalModules: 0,
    totalSubjects: 0,
    todayAttendance: 0,
    presentToday: 0,
    absentToday: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const [classesData, departmentsData, modulesData, subjectsData, attendanceData, userStatsData] = await Promise.all([
          apiGet(API_ENDPOINTS.CLASSES.BASE, token),
          apiGet(API_ENDPOINTS.DEPARTMENTS, token),
          apiGet(API_ENDPOINTS.MODULES, token),
          apiGet(API_ENDPOINTS.SUBJECTS, token),
          apiGet(API_ENDPOINTS.ATTENDANCE.BASE, token),
          apiGet(`${API_ENDPOINTS.USERS}/admin/stats`, token)
        ]);

        setClasses(classesData);
        setDepartments(departmentsData);
        setModules(modulesData);
        setSubjects(subjectsData);
        setAttendanceRecords(attendanceData || []);
        setUserStats(userStatsData);

        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendanceData?.filter((record: AttendanceRecord) => 
          record.sessionDate === today
        ) || [];
        
        const presentToday = todayAttendance.filter((record: AttendanceRecord) => 
          record.status === 'oui'
        ).length;
        
        const absentToday = todayAttendance.filter((record: AttendanceRecord) => 
          record.status === 'non'
        ).length;

        setStats({
          totalClasses: classesData.length,
          totalStudents: userStatsData.identityCounts?.find((i: any) => i.identity === "ETUDIANT")?.count || 0,
          totalModules: modulesData.length,
          totalSubjects: subjectsData.length,
          todayAttendance: todayAttendance.length,
          presentToday,
          absentToday
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Fetch students for a specific class with pagination
  const fetchStudentsForClass = async (classId: number, page: number = 0) => {
    if (!token) return;
    
    try {
      setStudentLoading(true);
      const url = `${API_ENDPOINTS.CLASSES.STUDENTS(classId)}?page=${page}&size=10`;
      const data = await apiGet(url, token);
      
      setSelectedClassStudents(data.content || data || []);
      setStudentTotalPages(data.totalPages || 1);
      setStudentPage(page);
    } catch (error: any) {
      console.error("Failed to fetch students for class:", error);
      toast.error("Failed to load students");
      setSelectedClassStudents([]);
      setStudentTotalPages(1);
    } finally {
      setStudentLoading(false);
    }
  };

  const filteredClasses = classes.filter(classe => {
    const matchesSearch = classe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || classe.departmentId === parseInt(departmentFilter);
    const matchesLevel = levelFilter === "all" || classe.level === parseInt(levelFilter);
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const handleCreateClass = async () => {
    if (!token) return;
    
    try {
      const response = await apiPost(API_ENDPOINTS.CLASSES.BASE, newClass, token);
      setClasses([...classes, response]);
      setNewClass({ name: "", level: 1, departmentId: 0 });
      setIsDialogOpen(false);
      toast.success("Class created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create class");
    }
  };

  const handleUpdateClass = async (updatedClass: Class) => {
    if (!token) return;
    
    try {
      const response = await apiPut(API_ENDPOINTS.CLASSES.BY_ID(updatedClass.id), updatedClass, token);
      setClasses(classes.map(c => c.id === updatedClass.id ? response : c));
      setSelectedClass(null);
      toast.success("Class updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update class");
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!token) return;
    
    try {
      await apiDelete(API_ENDPOINTS.CLASSES.BY_ID(classId), token);
      setClasses(classes.filter(c => c.id !== classId));
      toast.success("Class deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete class");
    }
  };

  const getModulesByDepartment = (departmentId: number) => {
    return modules.filter(module => module.department_id === departmentId);
  };

  const getSubjectsByModule = (moduleId: number) => {
    return subjects.filter(subject => subject.moduleId === moduleId);
  };

  // Function to get students by class using the new endpoint
  const getStudentsByClass = async (classId: number) => {
    if (!token) return [];
    
    try {
      const students = await apiGet(API_ENDPOINTS.CLASSES.STUDENTS(classId), token);
      return students || [];
    } catch (error: any) {
      console.error("Failed to fetch students for class:", error);
      return [];
    }
  };

  // Function to add student to class using the new endpoint
  const addStudentToClass = async (classId: number, studentId: number) => {
    if (!token) return false;
    
    try {
      await apiPost(API_ENDPOINTS.CLASSES.ADD_STUDENT(classId, studentId), {}, token);
      toast.success("Student added to class successfully!");
      return true;
    } catch (error: any) {
      toast.error("Failed to add student to class");
      return false;
    }
  };

  // Function to get classes by department using the new endpoint
  const getClassesByDepartment = async (departmentId: number) => {
    if (!token) return [];
    
    try {
      const departmentClasses = await apiGet(API_ENDPOINTS.CLASSES.BY_DEPARTMENT(departmentId), token);
      return departmentClasses || [];
    } catch (error: any) {
      console.error("Failed to fetch classes for department:", error);
      return [];
    }
  };

  // Function to get students in a specific class (for display purposes)
  const getStudentsInClass = (classId: number) => {
    return students.filter(student => student.classeId === classId);
  };

  // Function to get attendance for a specific class today
  const getTodayAttendanceForClass = (classId: number) => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(record => {
      const student = students.find(s => s.id === record.studentId);
      return student?.classeId === classId && record.sessionDate === today;
    });
  };

  // Handle opening students dialog
  const handleOpenStudentsDialog = async (classe: Class) => {
    setSelectedClass(classe);
    setIsStudentsDialogOpen(true);
    // Fetch first page of students
    await fetchStudentsForClass(classe.id, 0);
  };

  const ClassCard = ({ classe }: { classe: Class }) => {
    const department = departments.find(d => d.id === classe.departmentId);
    const departmentModules = getModulesByDepartment(classe.departmentId);
    const studentsInClass = getStudentsInClass(classe.id);
    const todayAttendance = getTodayAttendanceForClass(classe.id);
    
    return (
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-md border-indigo-400/20 hover:border-purple-400/40 transition-all duration-300 group hover:shadow-lg hover:shadow-indigo-500/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all">
                <BookOpen className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-white group-hover:text-indigo-200 transition-colors">
                  {classe.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {department?.name} • Level {classe.level}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-indigo-500/20 text-indigo-300"
                onClick={() => setSelectedClass(classe)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-red-500/20 text-red-300"
                onClick={() => handleDeleteClass(classe.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
              <div className="text-2xl font-bold text-white">{studentsInClass.length}</div>
              <div className="text-xs text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{departmentModules.length}</div>
            <div className="text-xs text-gray-600">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {departmentModules.reduce((total, module) => 
                  total + getSubjectsByModule(module.id).length, 0
                )}
              </div>
              <div className="text-xs text-gray-600">Subjects</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-indigo-400/30 hover:bg-indigo-500/20 text-indigo-300"
                onClick={() => {
                  setSelectedClass(classe);
                  setIsScheduleDialogOpen(true);
                }}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Attendance
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-purple-400/30 hover:bg-purple-500/20 text-purple-300"
                onClick={() => {
                  setSelectedClass(classe);
                  setIsModulesDialogOpen(true);
                }}
              >
                <Layers className="h-3 w-3 mr-1" />
                Modules
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-blue-400/30 hover:bg-blue-500/20 text-blue-300"
                onClick={() => handleOpenStudentsDialog(classe)}
              >
                <Users className="h-3 w-3 mr-1" />
                Students ({studentsInClass.length})
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-green-400/30 hover:bg-green-500/20 text-green-300"
              >
                <FileText className="h-3 w-3 mr-1" />
                Reports
              </Button>
            </div>

            {/* Today's Attendance Summary */}
            {todayAttendance.length > 0 && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-sm text-gray-600 mb-2">Today's Attendance</div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">
                    Present: {todayAttendance.filter(r => r.status === 'oui').length}
                  </span>
                  <span className="text-red-400">
                    Absent: {todayAttendance.filter(r => r.status === 'non').length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Class Management
          </h1>
          <p className="text-gray-600 mt-2">Manage academic classes, schedules, and curriculum</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800/95 backdrop-blur-md border-indigo-500/30">
            <DialogHeader>
              <DialogTitle className="text-indigo-300">Create New Class</DialogTitle>
              <DialogDescription className="text-blue-200">
                Add a new class to the academic structure
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-blue-200">Class Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Computer Science 1A" 
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level" className="text-blue-200">Level</Label>
                  <Select 
                    value={newClass.level.toString()} 
                    onValueChange={(value) => setNewClass({ ...newClass, level: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-gray-900">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/95 border-indigo-500/30">
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department" className="text-blue-200">Department</Label>
                  <Select 
                    value={newClass.departmentId.toString()} 
                    onValueChange={(value) => setNewClass({ ...newClass, departmentId: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-gray-900">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/95 border-indigo-500/30">
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                onClick={handleCreateClass}
              >
                Create Class
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalClasses}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <Layers className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalModules}</div>
            <div className="text-sm text-gray-600">Total Modules</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.todayAttendance}</div>
            <div className="text-sm text-gray-600">Today's Attendance</div>
            <div className="text-xs text-green-400 mt-1">
              Present: {stats.presentToday} | Absent: {stats.absentToday}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-gray-900 placeholder-gray-600 focus:border-blue-400"
              />
            </div>
            <Select value={departmentFilter} onValueChange={async (value) => {
              setDepartmentFilter(value);
              if (value !== "all") {
                // Demonstrate the BY_DEPARTMENT endpoint
                const departmentClasses = await getClassesByDepartment(parseInt(value));
                console.log(`Classes in department ${value}:`, departmentClasses);
              }
            }}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-gray-900">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-md border-white/20">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-gray-900">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/20 backdrop-blur-md border-white/20">
                <SelectItem value="all">All Levels</SelectItem>
                {[1, 2, 3, 4, 5].map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 backdrop-blur-md rounded-xl h-64 border border-white/10"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClasses.map((classe) => (
            <ClassCard key={classe.id} classe={classe} />
          ))}
        </div>
      )}

      {filteredClasses.length === 0 && !loading && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No classes found</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start by creating your first class"}
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Students List Dialog */}
      <Dialog open={isStudentsDialogOpen} onOpenChange={setIsStudentsDialogOpen}>
                  <DialogContent className="bg-slate-800/95 backdrop-blur-md border-white/20 max-w-6xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-white">Students in {selectedClass?.name}</DialogTitle>
              <DialogDescription className="text-gray-600">
                Manage students enrolled in this class
              </DialogDescription>
            </DialogHeader>
          {selectedClass && (
            <div className="space-y-4 overflow-hidden flex flex-col h-full">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total Students: {selectedClassStudents.length} (Page {studentPage + 1} of {studentTotalPages})
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-white/20 hover:bg-white/10 text-gray-900"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Student
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto">
                {studentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    <span className="ml-2 text-gray-600">Loading students...</span>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-gray-600">Student</TableHead>
                          <TableHead className="text-gray-600">Email</TableHead>
                          <TableHead className="text-gray-600">Phone</TableHead>
                          <TableHead className="text-gray-600">Status</TableHead>
                          <TableHead className="text-gray-600">Today's Attendance</TableHead>
                          <TableHead className="text-gray-600">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClassStudents.length > 0 ? (
                          selectedClassStudents.map((student) => {
                            const todayAttendance = getTodayAttendanceForClass(selectedClass.id)
                              .find(record => record.studentId === student.id);
                            
                            return (
                              <TableRow key={student.id} className="border-white/5 hover:bg-white/5">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-blue-500/20 text-blue-300">
                                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-white">
                                        {student.firstName} {student.lastName}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        ID: {student.id}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-blue-400" />
                                    <span className="text-gray-600">{student.email}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3 text-blue-400" />
                                    <span className="text-gray-600">{student.phoneNumber}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={student.status === 'active' ? 'default' : 'secondary'}
                                    className={student.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}
                                  >
                                    {student.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {todayAttendance ? (
                                    <div className="flex items-center gap-2">
                                      {todayAttendance.status === 'oui' ? (
                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-400" />
                                      )}
                                      <span className={todayAttendance.status === 'oui' ? 'text-green-400' : 'text-red-400'}>
                                        {todayAttendance.status === 'oui' ? 'Present' : 'Absent'}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-600">No record</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="hover:bg-blue-500/20 text-blue-300">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="hover:bg-indigo-500/20 text-indigo-300">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                              No students found in this class
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination */}
                    {studentTotalPages > 1 && (
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                                                  <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => fetchStudentsForClass(selectedClass.id, studentPage - 1)}
                            disabled={studentPage === 0}
                            className="border-white/20 hover:bg-white/10 text-gray-900"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                          </Button>
                        <span className="text-gray-600 text-sm">
                          Page {studentPage + 1} of {studentTotalPages}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fetchStudentsForClass(selectedClass.id, studentPage + 1)}
                          disabled={studentPage >= studentTotalPages - 1}
                          className="border-white/20 hover:bg-white/10 text-gray-900"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Management Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-md border-indigo-500/30 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-300">Class Attendance Management</DialogTitle>
            <DialogDescription className="text-blue-200">
              Manage attendance for {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-6">
              <Tabs defaultValue="attendance" className="w-full">
                <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
                  <TabsTrigger value="attendance" className="data-[state=active]:bg-indigo-500/30">Attendance Records</TabsTrigger>
                  <TabsTrigger value="subjects" className="data-[state=active]:bg-purple-500/30">Subject Allocation</TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-pink-500/30">Attendance Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="attendance" className="space-y-4">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Attendance Management</h3>
                    <p className="text-blue-200">Attendance tracking and reporting coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="subjects" className="space-y-4">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Subject Allocation</h3>
                    <p className="text-blue-200">Subject assignment and curriculum management coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⚙️</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Attendance Settings</h3>
                    <p className="text-blue-200">Advanced attendance configuration options coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modules Management Dialog */}
      <Dialog open={isModulesDialogOpen} onOpenChange={setIsModulesDialogOpen}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-md border-purple-500/30 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Modules & Subjects Management</DialogTitle>
            <DialogDescription className="text-blue-200">
              Manage modules and subjects for {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-6">
              <Tabs defaultValue="modules" className="w-full">
                <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
                  <TabsTrigger value="modules" className="data-[state=active]:bg-purple-500/30">Modules</TabsTrigger>
                  <TabsTrigger value="subjects" className="data-[state=active]:bg-indigo-500/30">Subjects</TabsTrigger>
                  <TabsTrigger value="curriculum" className="data-[state=active]:bg-pink-500/30">Curriculum</TabsTrigger>
                </TabsList>

                <TabsContent value="modules" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getModulesByDepartment(selectedClass.departmentId).map(module => (
                      <Card key={module.id} className="bg-white/5 backdrop-blur-md border-purple-400/30">
                        <CardHeader>
                          <CardTitle className="text-purple-300">{module.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-blue-200">
                            {getSubjectsByModule(module.id).length} subjects
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="subjects" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getModulesByDepartment(selectedClass.departmentId).flatMap(module =>
                      getSubjectsByModule(module.id).map(subject => (
                        <Card key={subject.id} className="bg-white/5 backdrop-blur-md border-indigo-400/30">
                          <CardHeader>
                            <CardTitle className="text-indigo-300">{subject.name}</CardTitle>
                            <CardDescription className="text-blue-200">
                              {modules.find(m => m.id === subject.moduleId)?.name}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-blue-200">
                              {subject.description || "No description"}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="curriculum" className="space-y-4">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎓</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Curriculum Management</h3>
                    <p className="text-blue-200">Advanced curriculum planning and mapping coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 