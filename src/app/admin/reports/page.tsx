'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Calendar, 
  Users,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  FileText,
  Eye,
  Settings,
  Zap,
  Target
} from "lucide-react";
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
import { Label } from "@/components/ui/label";

interface ReportData {
  id: number;
  name: string;
  type: 'attendance' | 'grades' | 'enrollment' | 'financial' | 'performance';
  description: string;
  lastGenerated: string;
  status: 'ready' | 'generating' | 'scheduled';
  size: string;
  format: 'pdf' | 'excel' | 'csv';
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [attendanceData, setAttendanceData] = useState<ChartData[]>([]);
  const [gradeData, setGradeData] = useState<ChartData[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<ChartData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      const mockReports: ReportData[] = [
        {
          id: 1,
          name: "Monthly Attendance Report",
          type: "attendance",
          description: "Comprehensive attendance analysis for all students and courses",
          lastGenerated: "2024-01-16 14:30",
          status: "ready",
          size: "2.4 MB",
          format: "pdf"
        },
        {
          id: 2,
          name: "Grade Distribution Analysis",
          type: "grades",
          description: "Statistical analysis of grade distributions across all departments",
          lastGenerated: "2024-01-15 16:45",
          status: "ready",
          size: "1.8 MB",
          format: "excel"
        },
        {
          id: 3,
          name: "Enrollment Trends Report",
          type: "enrollment",
          description: "Student enrollment patterns and demographic analysis",
          lastGenerated: "2024-01-14 11:20",
          status: "generating",
          size: "Processing...",
          format: "pdf"
        },
        {
          id: 4,
          name: "Financial Overview",
          type: "financial",
          description: "Budget allocation and spending analysis for the semester",
          lastGenerated: "2024-01-13 09:15",
          status: "scheduled",
          size: "3.2 MB",
          format: "excel"
        }
      ];

      const mockAttendanceData: ChartData[] = [
        { name: "Present", value: 85, color: "#10B981" },
        { name: "Absent", value: 12, color: "#EF4444" },
        { name: "Late", value: 3, color: "#F59E0B" }
      ];

      const mockGradeData: ChartData[] = [
        { name: "A (90-100)", value: 25, color: "#10B981" },
        { name: "B (80-89)", value: 35, color: "#3B82F6" },
        { name: "C (70-79)", value: 25, color: "#F59E0B" },
        { name: "D (60-69)", value: 10, color: "#EF4444" },
        { name: "F (<60)", value: 5, color: "#991B1B" }
      ];

      const mockEnrollmentData: ChartData[] = [
        { name: "Computer Science", value: 450, color: "#3B82F6" },
        { name: "Engineering", value: 380, color: "#10B981" },
        { name: "Mathematics", value: 320, color: "#F59E0B" },
        { name: "Physics", value: 280, color: "#EF4444" },
        { name: "Other", value: 170, color: "#8B5CF6" }
      ];
      
      setReports(mockReports);
      setAttendanceData(mockAttendanceData);
      setGradeData(mockGradeData);
      setEnrollmentData(mockEnrollmentData);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'attendance': return "from-blue-400 to-cyan-400";
      case 'grades': return "from-green-400 to-emerald-400";
      case 'enrollment': return "from-purple-400 to-pink-400";
      case 'financial': return "from-yellow-400 to-orange-400";
      case 'performance': return "from-red-400 to-pink-400";
      default: return "from-gray-400 to-slate-400";
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'attendance': return "bg-blue-500/20 border-blue-400/50 text-blue-200";
      case 'grades': return "bg-green-500/20 border-green-400/50 text-green-200";
      case 'enrollment': return "bg-purple-500/20 border-purple-400/50 text-purple-200";
      case 'financial': return "bg-yellow-500/20 border-yellow-400/50 text-yellow-200";
      case 'performance': return "bg-red-500/20 border-red-400/50 text-red-200";
      default: return "bg-gray-500/20 border-gray-400/50 text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return "bg-green-500/20 border-green-400/50 text-green-200";
      case 'generating': return "bg-yellow-500/20 border-yellow-400/50 text-yellow-200";
      case 'scheduled': return "bg-blue-500/20 border-blue-400/50 text-blue-200";
      default: return "bg-gray-500/20 border-gray-400/50 text-gray-200";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const ReportCard = ({ report }: { report: ReportData }) => (
    <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30 hover:border-blue-400/50 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${getTypeColor(report.type)}/20`}>
              <FileText className={`h-6 w-6 bg-gradient-to-r ${getTypeColor(report.type)} bg-clip-text text-transparent`} />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{report.name}</h3>
              <p className="text-sm text-gray-400">{report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={`border ${getTypeBg(report.type)}`}>
              {report.type}
            </Badge>
            <Badge className={`border ${getStatusColor(report.status)}`}>
              {report.status}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-gray-300 text-sm">{report.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Last Generated:</span>
              <p className="text-white">{report.lastGenerated}</p>
            </div>
            <div>
              <span className="text-gray-400">Size:</span>
              <p className="text-white">{report.size}</p>
            </div>
            <div>
              <span className="text-gray-400">Format:</span>
              <p className="text-white uppercase">{report.format}</p>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <p className="text-white capitalize">{report.status}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 border-blue-400/30 hover:bg-blue-500/20 text-blue-300"
            onClick={() => setSelectedReport(report)}
            disabled={report.status === 'generating'}
          >
            <Eye className="h-3 w-3 mr-1" />
            {report.status === 'generating' ? 'Processing...' : 'View'}
          </Button>
          <Button 
            size="sm" 
            className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/30"
            disabled={report.status === 'generating'}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ChartWidget = ({ title, data, icon: Icon }: { title: string; data: ChartData[]; icon: React.ElementType }) => (
    <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30 hover:border-blue-400/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-300 text-sm">{item.name}</span>
              </div>
              <span className="text-white font-medium">
                {item.value}{title.includes('Attendance') ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-gray-300 mt-2">Advanced data visualization and comprehensive reporting system</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/30">
                <DialogHeader>
                  <DialogTitle className="text-blue-300">Generate New Report</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Create a custom report with specific parameters
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportName" className="text-gray-300">Report Name</Label>
                    <Input 
                      id="reportName" 
                      placeholder="Enter report name" 
                      className="bg-gray-800/50 border-blue-400/30 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reportType" className="text-gray-300">Report Type</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-800/50 border-blue-400/30 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800/95 border-blue-500/30">
                          <SelectItem value="attendance">Attendance</SelectItem>
                          <SelectItem value="grades">Grades</SelectItem>
                          <SelectItem value="enrollment">Enrollment</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="format" className="text-gray-300">Format</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-800/50 border-blue-400/30 text-white">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800/95 border-blue-500/30">
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
                      <Input 
                        id="startDate" 
                        type="date" 
                        className="bg-gray-800/50 border-blue-400/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-gray-300">End Date</Label>
                      <Input 
                        id="endDate" 
                        type="date" 
                        className="bg-gray-800/50 border-blue-400/30 text-white"
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="border-yellow-400/30 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30">
              <Download className="mr-2 h-4 w-4" />
              Export All
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30 hover:border-blue-400/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{reports.length}</div>
              <div className="text-sm text-blue-300">Total Reports</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30 hover:border-green-400/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'ready').length}</div>
              <div className="text-sm text-green-300">Ready to Download</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30 hover:border-yellow-400/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Target className="h-8 w-8 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'generating').length}</div>
              <div className="text-sm text-yellow-300">In Progress</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30 hover:border-purple-400/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Calendar className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{reports.filter(r => r.status === 'scheduled').length}</div>
              <div className="text-sm text-purple-300">Scheduled</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                <Input
                  placeholder="Search reports by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600/30 text-white placeholder-gray-400 focus:border-blue-400"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-600/30 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/95 backdrop-blur-md border-gray-600/30">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="grades">Grades</SelectItem>
                  <SelectItem value="enrollment">Enrollment</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports and Analytics Tabs */}
        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList className="bg-gray-800/50 backdrop-blur-md border border-gray-600/30">
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-500/30">Generated Reports</TabsTrigger>
            <TabsTrigger value="charts" className="data-[state=active]:bg-green-500/30">Data Visualization</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/30">Advanced Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-800/50 backdrop-blur-md rounded-xl h-80 border border-gray-600/30"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ChartWidget title="Attendance Overview" data={attendanceData} icon={BarChart3} />
              <ChartWidget title="Grade Distribution" data={gradeData} icon={PieChart} />
              <ChartWidget title="Enrollment by Department" data={enrollmentData} icon={LineChart} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-yellow-400" />
                  Advanced Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-gray-300">Comprehensive data insights and predictive analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
                  <p className="text-gray-300">Interactive charts and predictive models coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="bg-gray-900/95 backdrop-blur-md border-blue-500/30 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-blue-300">Report Details</DialogTitle>
              <DialogDescription className="text-gray-300">
                Complete information and preview for {selectedReport?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Report Name</label>
                      <p className="text-white font-medium">{selectedReport.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Type</label>
                      <Badge className={`${getTypeBg(selectedReport.type)} border`}>
                        {selectedReport.type}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Format</label>
                      <p className="text-white font-medium uppercase">{selectedReport.format}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <Badge className={`${getStatusColor(selectedReport.status)} border`}>
                        {selectedReport.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Last Generated</label>
                      <p className="text-white font-medium">{selectedReport.lastGenerated}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">File Size</label>
                      <p className="text-white font-medium">{selectedReport.size}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Description</label>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <p className="text-white">{selectedReport.description}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" className="border-gray-400/30 text-gray-300 hover:bg-gray-500/20">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
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