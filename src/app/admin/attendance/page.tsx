'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, CheckCircle, XCircle, Clock, Users, Search, Filter, Eye, Download, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AttendanceRecord {
  id: number;
  studentName: string;
  studentId: string;
  subject: string;
  instructor: string;
  date: string;
  time: string;
  status: 'present' | 'absent' | 'pending';
  justification?: string;
  room: string;
  sessionType: string;
}

interface AttendanceStats {
  totalSessions: number;
  totalStudents: number;
  overallAttendanceRate: number;
  pendingJustifications: number;
}

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    totalStudents: 0,
    overallAttendanceRate: 0,
    pendingJustifications: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      const mockData: AttendanceRecord[] = [
        { id: 1, studentName: "Alice Martin", studentId: "STU001", subject: "Computer Science", instructor: "Dr. Smith", date: "2024-01-15", time: "09:00", status: "present", room: "A101", sessionType: "Cours" },
        { id: 2, studentName: "Bob Johnson", studentId: "STU002", subject: "Mathematics", instructor: "Dr. Brown", date: "2024-01-15", time: "10:30", status: "absent", room: "B203", sessionType: "TD" },
        { id: 3, studentName: "Claire Wilson", studentId: "STU003", subject: "Physics", instructor: "Dr. Davis", date: "2024-01-15", time: "14:00", status: "pending", justification: "Medical appointment", room: "C105", sessionType: "TP" },
        { id: 4, studentName: "David Brown", studentId: "STU004", subject: "Engineering", instructor: "Prof. Miller", date: "2024-01-15", time: "15:30", status: "present", room: "D301", sessionType: "Cours" },
        { id: 5, studentName: "Emma Davis", studentId: "STU005", subject: "Computer Science", instructor: "Dr. Smith", date: "2024-01-15", time: "09:00", status: "absent", room: "A101", sessionType: "Cours" },
      ];
      
      setAttendanceRecords(mockData);
      setStats({
        totalSessions: 45,
        totalStudents: 320,
        overallAttendanceRate: 87.5,
        pendingJustifications: 12
      });
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return "bg-green-500/20 text-green-300 border-green-400/30";
      case 'absent': return "bg-red-500/20 text-red-300 border-red-400/30";
      case 'pending': return "bg-yellow-500/20 text-yellow-300 border-yellow-400/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const AttendanceRecordCard = ({ record }: { record: AttendanceRecord }) => (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-blue-400/30 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">{record.studentName}</h3>
              <p className="text-xs text-blue-300">{record.studentId}</p>
            </div>
          </div>
          <Badge className={`border ${getStatusColor(record.status)} flex items-center gap-1`}>
            {getStatusIcon(record.status)}
            {record.status}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-200">Subject:</span>
            <span className="text-white">{record.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Instructor:</span>
            <span className="text-white">{record.instructor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Date & Time:</span>
            <span className="text-white">{record.date} at {record.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200">Room:</span>
            <span className="text-white">{record.room}</span>
          </div>
          {record.justification && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-yellow-300 text-xs">Justification: {record.justification}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 border-blue-400/30 hover:bg-blue-500/20 text-blue-300"
            onClick={() => setSelectedRecord(record)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30"
              >
                Approve
              </Button>
              <Button 
                size="sm" 
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="text-blue-200 mt-2">Monitor and validate student attendance records</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-blue-400/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white shadow-lg shadow-blue-500/20">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Review
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/10 backdrop-blur-md border-blue-400/30">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalSessions}</div>
            <div className="text-sm text-blue-300">Total Sessions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/20 to-green-700/10 backdrop-blur-md border-green-400/30">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.overallAttendanceRate}%</div>
            <div className="text-sm text-green-300">Attendance Rate</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-700/10 backdrop-blur-md border-purple-400/30">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
            <div className="text-sm text-purple-300">Total Students</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500/20 to-red-500/10 backdrop-blur-md border-yellow-400/30">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.pendingJustifications}</div>
            <div className="text-sm text-yellow-300">Pending Reviews</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
              <Input
                placeholder="Search by student, subject, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-blue-300 focus:border-blue-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-md border-blue-500/30">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white/10 backdrop-blur-md border border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/30">Overview</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500/30">Pending Reviews</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/30">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/5 backdrop-blur-md rounded-xl h-48 border border-white/10"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record) => (
                <AttendanceRecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.filter(record => record.status === 'pending').map((record) => (
              <AttendanceRecordCard key={record.id} record={record} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Attendance Analytics</CardTitle>
              <CardDescription className="text-blue-200">Detailed insights and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-blue-200">Advanced attendance analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="bg-slate-800/95 backdrop-blur-md border-blue-500/30">
          <DialogHeader>
            <DialogTitle className="text-blue-300">Attendance Record Details</DialogTitle>
            <DialogDescription className="text-blue-200">
              Complete information for {selectedRecord?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-blue-200">Student Name</label>
                  <p className="text-white font-medium">{selectedRecord.studentName}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-200">Student ID</label>
                  <p className="text-white font-medium">{selectedRecord.studentId}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-200">Subject</label>
                  <p className="text-white font-medium">{selectedRecord.subject}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-200">Instructor</label>
                  <p className="text-white font-medium">{selectedRecord.instructor}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-200">Date & Time</label>
                  <p className="text-white font-medium">{selectedRecord.date} at {selectedRecord.time}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-200">Status</label>
                  <Badge className={`${getStatusColor(selectedRecord.status)} border`}>
                    {selectedRecord.status}
                  </Badge>
                </div>
              </div>
              {selectedRecord.justification && (
                <div>
                  <label className="text-sm text-blue-200">Justification</label>
                  <p className="text-white bg-white/10 p-3 rounded-lg">{selectedRecord.justification}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30">
                  Approve
                </Button>
                <Button className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30">
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}