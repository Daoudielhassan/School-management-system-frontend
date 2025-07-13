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
  Eye
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

export default function AdminClassesPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    level: 1,
    departmentId: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const [classesData, departmentsData, modulesData, subjectsData] = await Promise.all([
          apiGet(API_ENDPOINTS.CLASSES, token),
          apiGet(API_ENDPOINTS.DEPARTMENTS, token),
          apiGet(API_ENDPOINTS.MODULES, token),
          apiGet(API_ENDPOINTS.SUBJECTS, token)
        ]);

        setClasses(classesData);
        setDepartments(departmentsData);
        setModules(modulesData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const filteredClasses = classes.filter(classe => {
    const matchesSearch = classe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || classe.departmentId === parseInt(departmentFilter);
    const matchesLevel = levelFilter === "all" || classe.level === parseInt(levelFilter);
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const handleCreateClass = async () => {
    if (!token) return;
    
    try {
      const response = await apiPost(API_ENDPOINTS.CLASSES, newClass, token);
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
      const response = await apiPut(`${API_ENDPOINTS.CLASSES}/${updatedClass.id}`, updatedClass, token);
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
      await apiDelete(`${API_ENDPOINTS.CLASSES}/${classId}`, token);
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

  const ClassCard = ({ classe }: { classe: Class }) => {
    const department = departments.find(d => d.id === classe.departmentId);
    const departmentModules = getModulesByDepartment(classe.departmentId);
    
    return (
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-md border-indigo-400/20 hover:border-purple-400/40 transition-all duration-300 group hover:shadow-lg hover:shadow-indigo-500/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all">
                <BookOpen className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-white group-hover:text-indigo-300 transition-colors">
                  {classe.name}
                </CardTitle>
                <CardDescription className="text-blue-200">
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
              <div className="text-2xl font-bold text-white">{classe.studentCount || 0}</div>
              <div className="text-xs text-blue-300">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{departmentModules.length}</div>
              <div className="text-xs text-blue-300">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {departmentModules.reduce((total, module) => 
                  total + getSubjectsByModule(module.id).length, 0
                )}
              </div>
              <div className="text-xs text-blue-300">Subjects</div>
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
                Schedule
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
              >
                <Users className="h-3 w-3 mr-1" />
                Students
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
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Class Management
          </h1>
          <p className="text-blue-200 mt-2">Manage academic classes, schedules, and curriculum</p>
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
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="level" className="text-blue-200">Level</Label>
                  <Select 
                    value={newClass.level.toString()} 
                    onValueChange={(value) => setNewClass({ ...newClass, level: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
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
        <Card className="bg-gradient-to-br from-indigo-500/20 to-indigo-700/10 backdrop-blur-md border-indigo-400/30">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{classes.length}</div>
            <div className="text-sm text-indigo-300">Total Classes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-700/10 backdrop-blur-md border-purple-400/30">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {classes.reduce((sum, classe) => sum + (classe.studentCount || 0), 0)}
            </div>
            <div className="text-sm text-purple-300">Total Students</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-pink-500/20 to-pink-700/10 backdrop-blur-md border-pink-400/30">
          <CardContent className="p-6 text-center">
            <Layers className="h-8 w-8 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{modules.length}</div>
            <div className="text-sm text-pink-300">Total Modules</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/10 backdrop-blur-md border-blue-400/30">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{subjects.length}</div>
            <div className="text-sm text-blue-300">Total Subjects</div>
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
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-indigo-400"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-md border-indigo-500/30">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-md border-indigo-500/30">
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
            <BookOpen className="h-12 w-12 text-indigo-400/50 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No classes found</h3>
            <p className="text-blue-200 text-center mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Start by creating your first class"}
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Schedule Management Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-md border-indigo-500/30 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-300">Class Schedule Management</DialogTitle>
            <DialogDescription className="text-blue-200">
              Manage schedule for {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-6">
              <Tabs defaultValue="schedule" className="w-full">
                <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
                  <TabsTrigger value="schedule" className="data-[state=active]:bg-indigo-500/30">Weekly Schedule</TabsTrigger>
                  <TabsTrigger value="subjects" className="data-[state=active]:bg-purple-500/30">Subject Allocation</TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-pink-500/30">Schedule Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Schedule Management</h3>
                    <p className="text-blue-200">Weekly schedule configuration coming soon...</p>
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
                    <h3 className="text-xl font-semibold text-white mb-2">Schedule Settings</h3>
                    <p className="text-blue-200">Advanced schedule configuration options coming soon...</p>
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