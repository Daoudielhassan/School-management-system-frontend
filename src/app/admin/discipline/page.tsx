'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  Scale, 
  FileText, 
  Clock, 
  Eye,
  Search, 
  Filter,
  Plus,
  Calendar,
  User,
  Gavel,
  History,
  Shield
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
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

interface DisciplinaryCase {
  id: number;
  studentName: string;
  studentId: string;
  violation: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  status: 'pending' | 'under_review' | 'resolved' | 'appealed';
  reportedBy: string;
  dateReported: string;
  lastUpdate: string;
  action: string;
  evidence: string[];
}

interface DisciplinaryStats {
  totalCases: number;
  pendingCases: number;
  resolvedCases: number;
  appealedCases: number;
}

export default function DisciplinePage() {
  const [cases, setCases] = useState<DisciplinaryCase[]>([]);
  const [stats, setStats] = useState<DisciplinaryStats>({
    totalCases: 0,
    pendingCases: 0,
    resolvedCases: 0,
    appealedCases: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDisciplinaryCases = async () => {
      try {
        if (!token) return;
        const response: DisciplinaryCase[] = await apiGet(API_ENDPOINTS.DISCIPLINE, token ?? '');
        setCases(response);
        setStats({
          totalCases: response.length,
          pendingCases: response.filter((c) => c.status === 'pending').length,
          resolvedCases: response.filter((c) => c.status === 'resolved').length,
          appealedCases: response.filter((c) => c.status === 'appealed').length
        });
      } catch (error) {
        console.error("Error fetching disciplinary cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisciplinaryCases();
    const interval = setInterval(fetchDisciplinaryCases, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [token]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return "from-yellow-400 to-orange-400";
      case 'moderate': return "from-orange-400 to-red-400";
      case 'severe': return "from-red-400 to-pink-400";
      case 'critical': return "from-pink-400 to-purple-400";
      default: return "from-gray-400 to-slate-400";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'minor': return "bg-yellow-500/20 border-yellow-400/50 text-yellow-200";
      case 'moderate': return "bg-orange-500/20 border-orange-400/50 text-orange-200";
      case 'severe': return "bg-red-500/20 border-red-400/50 text-red-200";
      case 'critical': return "bg-pink-500/20 border-pink-400/50 text-pink-200";
      default: return "bg-gray-500/20 border-gray-400/50 text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return "bg-yellow-500/20 border-yellow-400/50 text-yellow-200";
      case 'under_review': return "bg-blue-500/20 border-blue-400/50 text-blue-200";
      case 'resolved': return "bg-green-500/20 border-green-400/50 text-green-200";
      case 'appealed': return "bg-purple-500/20 border-purple-400/50 text-purple-200";
      default: return "bg-gray-500/20 border-gray-400/50 text-gray-200";
    }
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.violation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || caseItem.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const CaseCard = ({ caseItem }: { caseItem: DisciplinaryCase }) => (
    <Card className="bg-black/50 backdrop-blur-md border-red-900/30 hover:border-red-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-red-500/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-400/30">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-red-300 transition-colors">{caseItem.studentName}</h3>
              <p className="text-sm text-gray-400">{caseItem.studentId}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={`border ${getSeverityBg(caseItem.severity)}`}>
              {caseItem.severity}
            </Badge>
            <Badge className={`border ${getStatusColor(caseItem.status)}`}>
              {caseItem.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-red-300 mb-1">Violation</h4>
            <p className="text-white">{caseItem.violation}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-red-300 mb-1">Description</h4>
            <p className="text-gray-300 text-sm line-clamp-2">{caseItem.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Reported by:</span>
              <p className="text-white">{caseItem.reportedBy}</p>
            </div>
            <div>
              <span className="text-gray-400">Date:</span>
              <p className="text-white">{caseItem.dateReported}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-red-300 mb-1">Current Action</h4>
            <p className="text-gray-300 text-sm">{caseItem.action}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 border-red-400/30 hover:bg-red-500/20 text-red-300"
            onClick={() => setSelectedCase(caseItem)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Review
          </Button>
          <Button 
            size="sm" 
            className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30"
          >
            <Gavel className="h-3 w-3 mr-1" />
            Action
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-950/20">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Disciplinary Management
            </h1>
            <p className="text-gray-300 mt-2">Authoritative management of student disciplinary cases</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg shadow-red-500/20">
                  <Plus className="mr-2 h-4 w-4" />
                  New Case
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-md border-red-500/30">
                <DialogHeader>
                  <DialogTitle className="text-red-300">Create Disciplinary Case</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Report a new disciplinary violation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student" className="text-gray-300">Student</Label>
                      <Input 
                        id="student" 
                        placeholder="Select student" 
                        className="bg-black/30 border-red-400/30 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="violation" className="text-gray-300">Violation Type</Label>
                      <Select>
                        <SelectTrigger className="bg-black/30 border-red-400/30 text-white">
                          <SelectValue placeholder="Select violation" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800/95 border-red-500/30">
                          <SelectItem value="academic">Academic Misconduct</SelectItem>
                          <SelectItem value="behavior">Disruptive Behavior</SelectItem>
                          <SelectItem value="attendance">Attendance Violation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-gray-300">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Detailed description of the incident" 
                      className="bg-black/30 border-red-400/30 text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="severity" className="text-gray-300">Severity</Label>
                      <Select>
                        <SelectTrigger className="bg-black/30 border-red-400/30 text-white">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800/95 border-red-500/30">
                          <SelectItem value="minor">Minor</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reporter" className="text-gray-300">Reported By</Label>
                      <Input 
                        id="reporter" 
                        placeholder="Your name" 
                        className="bg-black/30 border-red-400/30 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                    Submit Case
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="border-red-400/30 bg-red-500/20 text-red-300 hover:bg-red-500/30">
              <History className="mr-2 h-4 w-4" />
              Case History
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-black/50 backdrop-blur-md border-red-900/30 hover:border-red-500/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Scale className="h-8 w-8 text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-red-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalCases}</div>
              <div className="text-sm text-red-300">Total Cases</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 backdrop-blur-md border-yellow-900/30 hover:border-yellow-500/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.pendingCases}</div>
              <div className="text-sm text-yellow-300">Pending</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 backdrop-blur-md border-green-900/30 hover:border-green-500/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.resolvedCases}</div>
              <div className="text-sm text-green-300">Resolved</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 backdrop-blur-md border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="relative">
                <AlertTriangle className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.appealedCases}</div>
              <div className="text-sm text-purple-300">Appealed</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-black/50 backdrop-blur-md border-red-900/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-red-400" />
                <Input
                  placeholder="Search cases by student, violation, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/30 border-red-400/30 text-white placeholder-gray-400 focus:border-red-400"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-black/30 border-red-400/30 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/95 backdrop-blur-md border-red-500/30">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="appealed">Appealed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-48 bg-black/30 border-red-400/30 text-white">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/95 backdrop-blur-md border-red-500/30">
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="bg-black/50 backdrop-blur-md border border-red-900/30">
            <TabsTrigger value="active" className="data-[state=active]:bg-red-500/30">Active Cases</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500/30">Pending Review</TabsTrigger>
            <TabsTrigger value="resolved" className="data-[state=active]:bg-green-500/30">Resolved</TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-purple-500/30">Timeline View</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-black/30 backdrop-blur-md rounded-xl h-80 border border-red-900/30"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCases.filter(c => c.status !== 'resolved').map((caseItem) => (
                  <CaseCard key={caseItem.id} caseItem={caseItem} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.filter(c => c.status === 'pending').map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.filter(c => c.status === 'resolved').map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card className="bg-black/50 backdrop-blur-md border-red-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-red-400" />
                  Disciplinary Timeline
                </CardTitle>
                <CardDescription className="text-gray-300">Historical view of disciplinary actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚖️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Timeline View</h3>
                  <p className="text-gray-300">Comprehensive case history timeline coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Case Detail Dialog */}
        <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
          <DialogContent className="bg-gray-900/95 backdrop-blur-md border-red-500/30 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-red-300">Disciplinary Case Review</DialogTitle>
              <DialogDescription className="text-gray-300">
                Complete case details and evidence for {selectedCase?.studentName}
              </DialogDescription>
            </DialogHeader>
            {selectedCase && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Student Information</label>
                      <div className="bg-black/30 p-3 rounded-lg">
                        <p className="text-white font-medium">{selectedCase.studentName}</p>
                        <p className="text-gray-400 text-sm">{selectedCase.studentId}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Violation</label>
                      <p className="text-white font-medium">{selectedCase.violation}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Severity</label>
                      <Badge className={`${getSeverityBg(selectedCase.severity)} border`}>
                        {selectedCase.severity}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Status</label>
                      <Badge className={`${getStatusColor(selectedCase.status)} border`}>
                        {selectedCase.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Reported By</label>
                      <p className="text-white font-medium">{selectedCase.reportedBy}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Date Reported</label>
                      <p className="text-white font-medium">{selectedCase.dateReported}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Description</label>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-white">{selectedCase.description}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Current Action</label>
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-white">{selectedCase.action}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400">Evidence Files</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.evidence.map((file, index) => (
                      <Badge key={index} variant="outline" className="border-red-400/30 text-red-300">
                        <FileText className="h-3 w-3 mr-1" />
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                    Take Action
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-400/30 text-red-300 hover:bg-red-500/20">
                    Schedule Hearing
                  </Button>
                  <Button variant="outline" className="border-gray-400/30 text-gray-300 hover:bg-gray-500/20">
                    Generate Report
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