'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  Target,
  Zap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface StudentGrade {
  id: number;
  studentName: string;
  studentId: string;
  subject: string;
  grade: number;
  maxGrade: number;
  percentage: number;
  performance: 'excellent' | 'good' | 'average' | 'weak';
  trend: 'up' | 'down' | 'stable';
  examType: string;
  date: string;
  instructor: string;
}

interface GradeStats {
  totalStudents: number;
  averageGrade: number;
  excellentCount: number;
  weakCount: number;
  passingRate: number;
}

export default function GradesPage() {
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [stats, setStats] = useState<GradeStats>({
    totalStudents: 0,
    averageGrade: 0,
    excellentCount: 0,
    weakCount: 0,
    passingRate: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentGrade | null>(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      const mockGrades: StudentGrade[] = [
        { id: 1, studentName: "Alice Martin", studentId: "STU001", subject: "Computer Science", grade: 18, maxGrade: 20, percentage: 90, performance: "excellent", trend: "up", examType: "Final Exam", date: "2024-01-15", instructor: "Dr. Smith" },
        { id: 2, studentName: "Bob Johnson", studentId: "STU002", subject: "Mathematics", grade: 7, maxGrade: 20, percentage: 35, performance: "weak", trend: "down", examType: "Midterm", date: "2024-01-14", instructor: "Dr. Brown" },
        { id: 3, studentName: "Claire Wilson", studentId: "STU003", subject: "Physics", grade: 14, maxGrade: 20, percentage: 70, performance: "good", trend: "up", examType: "Quiz", date: "2024-01-13", instructor: "Dr. Davis" },
        { id: 4, studentName: "David Brown", studentId: "STU004", subject: "Engineering", grade: 12, maxGrade: 20, percentage: 60, performance: "average", trend: "stable", examType: "Project", date: "2024-01-12", instructor: "Prof. Miller" },
        { id: 5, studentName: "Emma Davis", studentId: "STU005", subject: "Computer Science", grade: 16, maxGrade: 20, percentage: 80, performance: "good", trend: "up", examType: "Lab Test", date: "2024-01-11", instructor: "Dr. Smith" },
        { id: 6, studentName: "Frank Wilson", studentId: "STU006", subject: "Mathematics", grade: 9, maxGrade: 20, percentage: 45, performance: "weak", trend: "down", examType: "Assignment", date: "2024-01-10", instructor: "Dr. Brown" },
      ];

      setGrades(mockGrades);
      setStats({
        totalStudents: 320,
        averageGrade: 13.2,
        excellentCount: 45,
        weakCount: 28,
        passingRate: 78.5
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return "from-green-400 to-emerald-500";
      case 'good': return "from-blue-400 to-cyan-500";
      case 'average': return "from-yellow-400 to-orange-500";
      case 'weak': return "from-red-400 to-pink-500";
      default: return "from-gray-400 to-slate-500";
    }
  };

  const getPerformanceBg = (performance: string) => {
    switch (performance) {
      case 'excellent': return "bg-green-500/20 border-green-400/30";
      case 'good': return "bg-blue-500/20 border-blue-400/30";
      case 'average': return "bg-yellow-500/20 border-yellow-400/30";
      case 'weak': return "bg-red-500/20 border-red-400/30";
      default: return "bg-gray-500/20 border-gray-400/30";
    }
  };

  const getTrendIcon = (trend: string, performance: string) => {
    const colorClass = performance === 'excellent' || performance === 'good' ? 'text-green-400' :
      performance === 'average' ? 'text-yellow-400' : 'text-red-400';

    switch (trend) {
      case 'up': return <TrendingUp className={`h-4 w-4 ${colorClass}`} />;
      case 'down': return <TrendingDown className={`h-4 w-4 ${colorClass}`} />;
      default: return <Target className={`h-4 w-4 ${colorClass}`} />;
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === "all" || grade.subject === subjectFilter;
    const matchesPerformance = performanceFilter === "all" || grade.performance === performanceFilter;
    return matchesSearch && matchesSubject && matchesPerformance;
  });

  const GradeCard = ({ grade }: { grade: StudentGrade }) => (
    <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 group hover:shadow-lg hover:shadow-[var(--primary)]/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getPerformanceColor(grade.performance)}/20`}>
              <Award className={`h-5 w-5 bg-gradient-to-r ${getPerformanceColor(grade.performance)} bg-clip-text text-transparent`} />
            </div>
            <div>
              <h3 className="font-medium text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">{grade.studentName}</h3>
              <p className="text-xs text-[var(--text-muted)]">{grade.studentId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(grade.trend, grade.performance)}
            <Badge className={`border ${getPerformanceBg(grade.performance)} text-[var(--text)]`}>
              {grade.performance}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Subject:</span>
            <span className="text-[var(--text)]">{grade.subject}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Score:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${grade.percentage >= 80 ? 'text-green-400' : grade.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {grade.grade}/{grade.maxGrade}
              </span>
              <span className="text-xs text-[var(--text-muted)]">({grade.percentage}%)</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Type:</span>
            <span className="text-[var(--text)]">{grade.examType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Date:</span>
            <span className="text-[var(--text)]">{grade.date}</span>
          </div>
        </div>

        {/* Performance Bar */}
        <div className="mt-4">
          <div className="w-full bg-[var(--background-light)] rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${getPerformanceColor(grade.performance)} transition-all duration-500`}
              style={{ width: `${grade.percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 text-[var(--accent)]"
            onClick={() => setSelectedStudent(grade)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          <Button
            size="sm"
            className="bg-[var(--secondary)]/50 hover:bg-[var(--secondary)]/60 text-[var(--text)] border border-[var(--accent)]/30"
          >
            <Zap className="h-3 w-3 mr-1" />
            Analyze
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Academic Performance Tracking
            </h1>
            <p className="text-[var(--text-muted)] mt-2">Advanced analytics dashboard for student performance monitoring</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-[var(--accent)]/30 bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-[var(--text)] shadow-lg shadow-green-500/20">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Statistics Cards with Neon Effects */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Users className="h-8 w-8 text-[var(--primary)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-[var(--text)]">{stats.totalStudents}</div>
              <div className="text-sm text-[var(--primary)]">Total Students</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Target className="h-8 w-8 text-[var(--primary)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-[var(--text)]">{stats.averageGrade}/20</div>
              <div className="text-sm text-[var(--primary)]">Average Grade</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Award className="h-8 w-8 text-[var(--primary)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-[var(--primary)]">{stats.excellentCount}</div>
              <div className="text-sm text-[var(--primary)]">Excellent (≥16)</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <AlertTriangle className="h-8 w-8 text-[var(--primary)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-[var(--primary)]">{stats.passingRate}%</div>
              <div className="text-sm text-[var(--primary)]">Passing Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30 hover:border-[var(--primary)]/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <TrendingDown className="h-8 w-8 text-[var(--primary)] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-[var(--primary)]">{stats.weakCount}</div>
              <div className="text-sm text-[var(--primary)]">At Risk (&lt;10)</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--primary)]" />
                <Input
                  placeholder="Search by student, subject, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[var(--secondary)]/50 border-[var(--accent)]/30 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--primary)]"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-48 bg-[var(--secondary)]/50 border-[var(--accent)]/30 text-[var(--text)]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--secondary)]/95 backdrop-blur-md border-[var(--accent)]/30">
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>
              <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                <SelectTrigger className="w-48 bg-[var(--secondary)]/50 border-[var(--accent)]/30 text-[var(--text)]">
                  <SelectValue placeholder="Filter by performance" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--secondary)]/95 backdrop-blur-md border-[var(--accent)]/30">
                  <SelectItem value="all">All Performance</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="weak">Weak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Performance Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[var(--secondary)]/50 backdrop-blur-md border border-[var(--accent)]/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--primary)]/30">Performance Overview</TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-[var(--primary)]/30">Trends Analysis</TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-[var(--primary)]/30">Performance Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-[var(--secondary)]/50 backdrop-blur-md rounded-xl h-64 border border-[var(--accent)]/30"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGrades.map((grade) => (
                  <GradeCard key={grade.id} grade={grade} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="bg-[var(--secondary)]/10 backdrop-blur-md border-[var(--accent)]/30">
              <CardHeader>
                <CardTitle className="text-[var(--text)] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                  Performance Trends
                </CardTitle>
                <CardDescription className="text-[var(--text-muted)]">Student performance evolution over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-xl font-semibold text-[var(--text)] mb-2">Trend Analysis Dashboard</h3>
                  <p className="text-[var(--text-muted)]">Advanced performance tracking charts coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGrades.filter(grade => grade.performance === 'weak').map((grade) => (
                <GradeCard key={grade.id} grade={grade} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Student Detail Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="bg-[var(--secondary)]/95 backdrop-blur-md border-[var(--primary)]/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-[var(--primary)]">Student Performance Details</DialogTitle>
              <DialogDescription className="text-[var(--text-muted)]">
                Comprehensive analysis for {selectedStudent?.studentName}
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[var(--text-muted)]">Student Name</label>
                    <p className="text-[var(--text)] font-medium">{selectedStudent.studentName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-muted)]">Student ID</label>
                    <p className="text-[var(--text)] font-medium">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-muted)]">Subject</label>
                    <p className="text-[var(--text)] font-medium">{selectedStudent.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm text-[var(--text-muted)]">Instructor</label>
                    <p className="text-[var(--text)] font-medium">{selectedStudent.instructor}</p>
                  </div>
                </div>

                <div className="bg-[var(--secondary)]/10 rounded-lg p-4">
                  <h4 className="text-[var(--text)] font-medium mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-2xl font-bold ${selectedStudent.percentage >= 80 ? 'text-green-400' : selectedStudent.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {selectedStudent.grade}/{selectedStudent.maxGrade}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">Score</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${selectedStudent.percentage >= 80 ? 'text-green-400' : selectedStudent.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {selectedStudent.percentage}%
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">Percentage</div>
                    </div>
                    <div>
                      <Badge className={`${getPerformanceBg(selectedStudent.performance)} border text-[var(--text)]`}>
                        {selectedStudent.performance}
                      </Badge>
                      <div className="text-xs text-[var(--text-muted)] mt-1">Performance</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                    Generate Report
                  </Button>
                  <Button variant="outline" className="flex-1 border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/20">
                    View History
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}