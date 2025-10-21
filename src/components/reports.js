import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  FileText,
  Download,
  Upload,
  Filter,
  Calendar,
  Users,
  BarChart3,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import axios from "axios";

export function Reports({ isDark, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fileInputRef = useRef(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(members.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = members.slice(startIndex, startIndex + rowsPerPage);

  // ✅ Fetch with filters
  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/members", {
        params: {
          search: searchTerm || undefined,
          gender: selectedGender || undefined,
          age_group: selectedAgeGroup || undefined,
          member_status: selectedStatus || undefined,
          date_from: startDate || undefined,
          date_to: endDate || undefined,
        },
      });
      setMembers(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleExportPost = async () => {
    try {
      const filters = {
        search: searchTerm,
        gender: selectedGender,
        age_group: selectedAgeGroup,
        member_status: selectedStatus,
        date_from: startDate,
        date_to: endDate,
      };

      const res = await axios.post(
        "http://localhost:5000/api/export/members/export",
        filters,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "members_report.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // optional delay (simulate loading)
      await new Promise((delay) => setTimeout(delay, 1000));

      alert(response.data.message);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Import failed.");
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="min-h-screen">
      {/* Desktop Header */}
      <div className="hidden lg:block bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Reports & Data Management
              </h1>
            </div>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50 lg:hidden">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                Reports & Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1 shadow-sm">
                  <TabsTrigger value="members" className="h-10">Members Report</TabsTrigger>
                  <TabsTrigger value="attendance" className="h-10">Attendance Report</TabsTrigger>
                  <TabsTrigger value="import" className="h-10">Import/Export</TabsTrigger>
                </TabsList>

                {/* Filters Section */}
                <Card className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Filter className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-lg">Filters & Search</h3>
                    <div className="flex items-center bg-slate-900 px-2 rounded">
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent p-1 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ageGroup">Age Group</Label>
                      <Select
                        value={selectedAgeGroup}
                        onValueChange={setSelectedAgeGroup}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Age Groups</SelectItem>
                          <SelectItem value="Children">Children</SelectItem>
                          <SelectItem value="Youth">Youth</SelectItem>
                          <SelectItem value="Young Adult">Young Adult</SelectItem>
                          <SelectItem value="Young Married">Young Married</SelectItem>
                          <SelectItem value="Middle Adult">Middle Adult</SelectItem>
                          <SelectItem value="Senior Adult">Senior Adult</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="member_status">Status</Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">Date From</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">Date To</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={fetchMembers}
                      >
                        Apply Filters
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedGender("");
                          setSelectedAgeGroup("");
                          setSelectedStatus("");
                          setStartDate("");
                          setEndDate("");
                        }}
                      >
                        Clear Filters
                      </Button>

                    </div>
                  </div>
                </Card>

                <TabsContent value="members" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <h3>Members Information ({members.length} records)</h3>
                    </div>
                    <Button
                      onClick={handleExportPost}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export to Excel
                    </Button>
                  </div>

                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Photo</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Marital Status</TableHead>
                          <TableHead>Date of Birth</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Contact Number</TableHead>
                          <TableHead>Previous Church Attendee?</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Age Group</TableHead>
                          <TableHead>Spiritual Training</TableHead>
                          <TableHead>Willing to Train?</TableHead>
                          <TableHead>Household Members</TableHead>
                          <TableHead>Previous Churh</TableHead>
                          <TableHead>Invited By</TableHead>
                          <TableHead>Date Attended</TableHead>
                          <TableHead>Attending Cell Group?</TableHead>
                          <TableHead>Cell Leader</TableHead>
                          <TableHead>Church Ministry</TableHead>
                          <TableHead>Consolidation</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Water Baptized?</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRows.length > 0 ? (
                          currentRows.map((member) => (
                            <TableRow key={member.member_id}>
                              <TableCell>photo</TableCell>
                              <TableCell>{member.first_name} {member.last_name}</TableCell>
                              <TableCell>{member.marital_status}</TableCell>
                              <TableCell>{member.date_of_birth
                                ? new Date(member.date_of_birth).toLocaleDateString()
                                : "N/A"}</TableCell>
                              <TableCell>{member.gender}</TableCell>
                              <TableCell>{member.contact_number}</TableCell>
                              <TableCell>{member.prev_church_attendee ? "Yes" : "No"}</TableCell>
                              <TableCell className="max-w-xs truncate">{member.address}</TableCell>
                              <TableCell>{member.age_group}</TableCell>
                              <TableCell>{member.trainings || "None"}</TableCell>
                              <TableCell>{member.willing_training ? "Yes" : "No"}</TableCell>
                              <TableCell>{member.households || "None"}</TableCell>
                              <TableCell>{member.prev_church}</TableCell>
                              <TableCell>{member.invited_by}</TableCell>
                              <TableCell>{member.date_attended}</TableCell>
                              <TableCell>{member.attending_cell_group ? "Yes" : "No"}</TableCell>
                              <TableCell>{member.cell_leader_name}</TableCell>
                              <TableCell>{member.church_ministry}</TableCell>
                              <TableCell>{member.consolidation}</TableCell>
                              <TableCell>{member.reason}</TableCell>
                              <TableCell>{member.water_baptized ? "Yes" : "No"}</TableCell>
                              <TableCell>
                                <Badge variant={member.member_status === 'Active' ? 'default' : 'secondary'}>
                                  {member.member_status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="17" className="text-center p-4 text-slate-500 italic">
                              No members found
                            </td>
                          </tr>
                        )}
                      </TableBody>
                    </Table>
                    {/* Pagination Controls */}
                    {members.length > rowsPerPage && (
                      <div className="flex items-center justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>

                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>

                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}

                  </Card>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <h3>Attendance Report ({members.length} records)</h3>
                    </div>
                    <Button
                      onClick={handleExportPost}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export to Excel
                    </Button>
                  </div>

                  {/* Attendance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Records</p>
                          <p>{members.length}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Present</p>
                          <p>{members.filter(r => r.status === 'Present').length}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Absent</p>
                          <p>{members.filter(r => r.status === 'Absent').length}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Attendance Rate</p>
                          <p>
                            {members.length > 0
                              ? Math.round((members.filter(r => r.status === 'Present').length / members.length) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Age Group</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell>{record.fullName}</TableCell>
                            <TableCell>{record.ageGroup}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>
                              <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </TabsContent>

                <TabsContent value="import" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="flex items-center gap-2 mb-4">
                        <Upload className="w-4 h-4" />
                        Import Data
                      </h3>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Import member data from Excel/CSV files
                        </p>

                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          ref={fileInputRef}
                          onChange={handleImport}
                          className="hidden"
                        />

                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                          variant="outline"
                          disabled={isUploading}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? "Uploading..." : "Import File"}
                        </Button>

                      </div>
                    </Card>

                    <Card className="p-6">
                      <h3 className="flex items-center gap-2 mb-4">
                        <Download className="w-4 h-4" />
                        Export Templates
                      </h3>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Download templates for data import
                        </p>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleExportPost([{
                              firstName: 'Sample',
                              lastName: 'Name',
                              maritalStatus: 'Single',
                              dateOfBirth: '1990-01-01',
                              gender: 'Male',
                              contactNumber: '+63 912 345 6789',
                              address: 'Sample Address',
                              ageGroup: 'Young Adults (18-25)',
                              memberStatus: 'Active'
                            }], 'member_template')}
                          >
                            Member Template
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleExportPost([{
                              fullName: 'Sample Name',
                              ageGroup: 'Young Adults (18-25)',
                              date: '2024-09-30',
                              status: 'Present'
                            }], 'attendance_template')}
                          >
                            Attendance Template
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}