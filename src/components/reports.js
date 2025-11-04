import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Camera, Plus, Trash2, User } from 'lucide-react';
import { Textarea } from './ui/textarea';
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './ui/pagination';
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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "./ui/dropdown-menu";

function parseChurchMinistry(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value.split(/\s*(?:,|-)\s*/).filter(Boolean);
  }
  return [];
}

export function Reports({ isDark, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentRows, setCurrentRows] = useState([]);
  const [editingMember, setEditingMember] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const fileInputRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  //attendance
  const [filters, setFilters] = useState({
    search: "",
    ageGroup: "all",
    status: "all",
    dateFrom: "",
    dateTo: ""
  });
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({
    presentCount: 0,
    absentCount: 0,
    totalCount: 0,
    rate: 0
  });

  // Calculate pagination
  const totalMemberPages = Math.ceil(members.length / rowsPerPage);
  const totalAttendancePages = Math.ceil(records.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentMemberRows = members.slice(startIndex, startIndex + rowsPerPage);
  const currentAttendanceRows = records.slice(startIndex, startIndex + rowsPerPage);

  //update
  const [selectedMember, setSelectedMember] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  const ministries = ["Media", "Praise Team", "Content Writer", "Ushering"];
  const trainings = ["Life Class", "SOL 1", "SOL 2", "SOL 3"];



  // Fetch with filtered members
  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/members", {
        params: {
          search: searchTerm || undefined,
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

  // Fetch with filtered attendance
  const fetchFilteredAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance/filter", {
        params: filters
      });
      setRecords(res.data.records);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("❌ Error fetching filtered attendance:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchFilteredAttendance();
  }, []);

  // Clear attendance filters
  const clearFilters = () => {
    setFilters({ search: "", ageGroup: "all", status: "all", dateFrom: "", dateTo: "" });
    fetchFilteredAttendance();
  };

  //export members report
  const handleExportPost = async () => {
    try {
      const filters = {
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

  //export attendance report
  const handleExportAttendance = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/export/attendance/export",
        filters,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance_report.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  //export member template
  const handleExportTemplate = async () => {
    try {

      const res = await axios.get(
        "http://localhost:5000/api/export/members/template",
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

  // Import members
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
      fetchMembers();
    }
  };

  // Convert backend households string → array of objects for editFormData
  const parseHouseholds = (householdsString) => {
    if (!householdsString) return [];

    return householdsString.split(";").map((item) => {
      const trimmed = item.trim();
      if (!trimmed) return null;

      const match = trimmed.match(/^(.*?)\s*-\s*(.*?)\s*\((\d{4}-\d{2}-\d{2})\)$/);
      if (match) {
        const [, name, relationship, date_of_birth] = match;
        return { id: Date.now() + Math.random(), name, relationship, date_of_birth };
      }

      return null;
    }).filter(Boolean);
  };

  // Convert backend string → object (for checkboxes)
  const parseTrainings = (trainingsString) => {
    if (!trainingsString) return {};
    if (typeof trainingsString === "object") return trainingsString;

    const result = {};
    trainingsString.split(",").forEach((item) => {
      const match = item.trim().match(/^(.*?)\s*\((\d{4})\)$/);
      if (match) {
        const [_, training, year] = match;
        result[training] = true;
        result[`${training}Year`] = year;
      } else {
        result[item.trim()] = true;
      }
    });

    return result;
  };

  // Convert object → backend string
  const formatTrainings = (trainingsObj) => {
    if (!trainingsObj) return "";

    return Object.entries(trainingsObj)
      .filter(([key, value]) => value && !key.endsWith("Year") && key !== "willing_training")
      .map(([key]) => {
        const year = trainingsObj[`${key}Year`];
        return year ? `${key} (${year})` : key;
      })
      .join(", ");
  };

  // edit member
  const handleEdit = async (member_id) => {
    try {
      console.log("Fetching member:", member_id);
      const res = await axios.get(`http://localhost:5000/api/members/${member_id}`);
      const member = res.data;

      // ✅ Map backend's 'trainings' to frontend's 'spiritual_trainings'
      const parsedTrainings = parseTrainings(member.trainings);

      setEditFormData({
        ...member,
        church_ministry: parseChurchMinistry(member.church_ministry),
        spiritual_trainings: parsedTrainings, // 👈 this ensures it's defined
        household_members: parseHouseholds(member.households),
      });

      console.log("🎯 editFormData after mapping:", {
        ...member,
        spiritual_trainings: parsedTrainings,
      });

      setSelectedMember(member_id);
      setShowEditModal(true);
    } catch (error) {
      console.error("❌ Failed to fetch member for edit:", error);
      toast.error("Unable to load member details");
    }
  };


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      if (!selectedMember) return toast.error("No member selected");

      const payload = {
        ...editFormData,
        church_ministry: Array.isArray(editFormData.church_ministry)
          ? editFormData.church_ministry.join(", ")
          : editFormData.church_ministry || null,
        trainings: formatTrainings(editFormData.spiritual_trainings),
      };

      await axios.put(`http://localhost:5000/api/members/${selectedMember}`, payload);
      fetchMembers();

      setCurrentRows((prev) =>
        prev.map((m) =>
          m.member_id === selectedMember ? { ...m, ...editFormData } : m
        )
      );

      toast.success("Member updated successfully!");
      setShowEditModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update member. Please try again.");
    }
  };

  // delete member
  const handleDelete = async (member_id) => {
    const confirmed = window.confirm("Are you sure you want to delete this member?");
    if (!confirmed) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/members/${member_id}`);
      fetchMembers();
      if (res.status !== 200) throw new Error("Failed to delete member");

      // Remove deleted member from local state
      setCurrentRows((prev) => prev.filter((m) => m.member_id !== member_id));

      toast.success("Member deleted successfully!");

    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete member. Please try again.");
    }
  };

  const toggleMinistry = (ministry) => {
    setEditFormData(prev => {
      const list = Array.isArray(prev.church_ministry) ? prev.church_ministry : [];
      const exists = list.includes(ministry);
      const next = exists ? list.filter(m => m !== ministry) : [...list, ministry];
      return { ...prev, church_ministry: next };
    });
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

                <TabsContent value="members" className="space-y-4">
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
                          type="month"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateTo">Date To</Label>
                        <Input
                          id="dateTo"
                          type="month"
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
                            setSelectedAgeGroup("all");
                            setSelectedStatus("all");
                            setStartDate("");
                            setEndDate("");
                          }}
                        >
                          Clear Filters
                        </Button>

                      </div>
                    </div>
                  </Card>
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
                          <TableHead></TableHead>
                          <TableHead>Photo</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Marital Status</TableHead>
                          <TableHead>Date of Birth</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Contact Number</TableHead>
                          <TableHead>Previous Church Attendee?</TableHead>
                          <TableHead>Previous Church Name</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Age Group</TableHead>
                          <TableHead>Spiritual Training</TableHead>
                          <TableHead>Willing to Train?</TableHead>
                          <TableHead>Household Members</TableHead>
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
                        {currentMemberRows.length > 0 ? (
                          currentMemberRows.map((member) => (
                            <TableRow key={member.member_id}>
                              <TableCell className="space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(member.member_id)}>
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(member.member_id)}>
                                  Delete
                                </Button>
                              </TableCell>
                              <TableCell>photo</TableCell>
                              <TableCell>{member.last_name}, {member.first_name}</TableCell>
                              <TableCell>{member.marital_status}</TableCell>
                              <TableCell>{new Date(member.date_of_birth).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}</TableCell>
                              <TableCell>{member.gender}</TableCell>
                              <TableCell>{member.contact_number}</TableCell>
                              <TableCell>{member.prev_church_attendee ? "Yes" : "No"}</TableCell>
                              <TableCell>{member.prev_church}</TableCell>
                              <TableCell className="max-w-xs truncate">{member.address || "None"}</TableCell>
                              <TableCell>{member.age_group}</TableCell>
                              <TableCell>{member.trainings || "None"}</TableCell>
                              <TableCell>{member.willing_training ? "Yes" : "No"}</TableCell>
                              <TableCell>{member.households || "None"}</TableCell>
                              <TableCell>{member.invited_by || "None"}</TableCell>
                              <TableCell>
                                {member.date_attended
                                  ? new Date(member.date_attended).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                  })
                                  : "N/A"}
                              </TableCell>
                              <TableCell>{member.attending_cell_group ? "Yes" : "No"}</TableCell>
                              <TableCell>{member.cell_leader_name || "N/A"}</TableCell>
                              <TableCell>{member.church_ministry || "None"}</TableCell>
                              <TableCell>{member.consolidation || "N/A"}</TableCell>
                              <TableCell>{member.reason || "None"}</TableCell>
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
                      <Pagination className="pt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                              className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalMemberPages }, (_, index) => (
                            <PaginationItem key={index}>
                              <PaginationLink
                                isActive={currentPage === index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                              >
                                {index + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalMemberPages))}
                              className={currentPage === totalMemberPages ? "opacity-50 pointer-events-none" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                  {/* Filters */}
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
                          value={filters.search}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, search: e.target.value }))
                          }
                          className="bg-transparent p-1 text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ageGroup">Age Group</Label>
                        <Select
                          value={filters.ageGroup}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, ageGroup: value }))}
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
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={filters.status}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="present">Present</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateFrom">Date From</Label>
                        <Input
                          id="dateFrom"
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateTo">Date To</Label>
                        <Input
                          id="dateTo"
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                        />
                      </div>

                      <div className="flex items-end gap-2">
                        <Button variant="outline" onClick={fetchFilteredAttendance}>
                          Apply Filters
                        </Button>
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </Card>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <h3>Attendance Report ({summary.totalCount} records)</h3>
                    </div>
                    <Button
                      onClick={handleExportAttendance}
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
                          <p>{summary.totalCount}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Present</p>
                          <p> {summary.presentCount}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Absent</p>
                          <p> {summary.absentCount}</p>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Attendance Rate</p>
                          <p>
                            {summary.rate}%
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
                        {currentAttendanceRows.length > 0 ? (
                          currentAttendanceRows.map((record, index) => (
                            <TableRow key={index}>
                              <TableCell>{record.fullName}</TableCell>
                              <TableCell>{record.ageGroup}</TableCell>
                              <TableCell>{new Date(record.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}</TableCell>
                              <TableCell>
                                <Badge variant={record.status === 'Present' ? 'destructive' : 'default'}>
                                  {record.status
                                    ? record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase()
                                    : "N/A"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="17" className="text-center p-4 text-slate-500 italic">
                              No Records found
                            </td>
                          </tr>
                        )}
                      </TableBody>
                    </Table>
                    {/* Pagination Controls */}
                    {records.length > rowsPerPage && (
                      <Pagination className="pt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                              className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalAttendancePages }, (_, index) => (
                            <PaginationItem key={index}>
                              <PaginationLink
                                isActive={currentPage === index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                              >
                                {index + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalAttendancePages))}
                              className={currentPage === totalAttendancePages ? "opacity-50 pointer-events-none" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
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
                          {isUploading ? "Uploading..." : "Import Members File"}
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
                            onClick={handleExportTemplate}
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
      {/* Edit Member Modal */}
      {showEditModal && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  name="first_name"
                  value={editFormData.first_name || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  name="last_name"
                  value={editFormData.last_name || ""}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  name="date_of_birth"
                  value={editFormData.date_of_birth?.slice(0, 10) || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={editFormData.gender || ""}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <Select
                  value={editFormData.marital_status || ""}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, marital_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input
                  name="contact_number"
                  value={editFormData.contact_number || ""}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                name="address"
                value={editFormData.address || ""}
                onChange={handleEditChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Age Group</Label>
                <Select
                  value={editFormData.age_group || ""}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, age_group: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label>Member Status</Label>
                <Select
                  value={editFormData.member_status || ""}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, member_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Previous Church Attendee?</Label>
                <Select
                  value={editFormData.prev_church_attendee ? "Yes" : "No"}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      prev_church_attendee: value === "Yes",
                      prev_church: value === "Yes" ? prev.prev_church : "", // clear if "No"
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editFormData.prev_church_attendee && (
                <div className="space-y-2">
                  <Label>Previous Church Name</Label>
                  <Input
                    name="prev_church"
                    value={editFormData.prev_church || ""}
                    onChange={handleEditChange}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Invited By</Label>
                <Input
                  name="invited_by"
                  value={editFormData.invited_by || ""}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Date Attended</Label>
                <Input
                  type="month"
                  name="date_attended"
                  value={editFormData.date_attended || ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, date_attended: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Attending Cell Group?</Label>
                <Select
                  value={editFormData.attending_cell_group ? "Yes" : "No"}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      attending_cell_group: value === "Yes",
                      cell_leader_name: value === "Yes" ? prev.cell_leader_name : "", // clear if "No"
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editFormData.attending_cell_group && (
                <div className="space-y-2">
                  <Label>Cell Leader</Label>
                  <Input
                    name="cell_leader_name"
                    value={editFormData.cell_leader_name || ""}
                    onChange={handleEditChange}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Church Ministry</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {Array.isArray(editFormData.church_ministry) && editFormData.church_ministry.length
                        ? editFormData.church_ministry.join(", ")
                        : (typeof editFormData.church_ministry === "string" && editFormData.church_ministry.length
                          ? editFormData.church_ministry
                          : "Select ministry")}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-56">
                    {ministries.map((ministry) => (
                      <DropdownMenuCheckboxItem
                        key={ministry}
                        checked={Array.isArray(editFormData.church_ministry) && editFormData.church_ministry.includes(ministry)}
                        onCheckedChange={() => toggleMinistry(ministry)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {ministry}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <Label>Consolidation</Label>
                <Select
                  name="consolidation"
                  value={editFormData.consolidation || ""}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({ ...prev, consolidation: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="space-y-4">
                  <Label>Spiritual Training</Label>

                  <div className="space-y-4">
                    {trainings.map((key) => (
                      <div key={key} className="flex items-center space-x-4">
                        <Checkbox
                          id={key}
                          checked={!!editFormData.spiritual_trainings?.[key]}
                          onCheckedChange={(checked) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              spiritual_trainings: {
                                ...prev.spiritual_trainings,
                                [key]: checked,
                              },
                            }))
                          }
                        />
                        <Label htmlFor={key} className="flex-1">
                          {key}
                        </Label>

                        {editFormData.spiritual_trainings?.[key] && (
                          <Input
                            type="number"
                            placeholder="Year"
                            className="w-24"
                            value={editFormData.spiritual_trainings?.[`${key}Year`] || ""}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                spiritual_trainings: {
                                  ...prev.spiritual_trainings,
                                  [`${key}Year`]: e.target.value,
                                },
                              }))
                            }
                          />
                        )}
                      </div>
                    ))}

                    {/* Willing to train */}
                    {!Object.entries(editFormData.spiritual_trainings || {})
                      .filter(([key]) => key !== "willing_training")
                      .some(([, value]) => value) && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="willing_training"
                            checked={!!editFormData.spiritual_trainings?.willing_training}
                            onCheckedChange={(checked) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                spiritual_trainings: {
                                  ...prev.spiritual_trainings,
                                  willing_training: checked,
                                },
                              }))
                            }
                          />
                          <Label htmlFor="willing_training">
                            Willing to undergo spiritual training (if none of the above was checked)
                          </Label>
                        </div>
                      )}
                  </div>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Willing to Train?</Label>
                <Select
                  value={editFormData.willing_training ? "Yes" : "No"}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      willing_training: value === "Yes",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Water Baptized?</Label>
                <Select
                  value={editFormData.water_baptized ? "Yes" : "No"}
                  onValueChange={(value) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      water_baptized: value === "Yes",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Households</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Household Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditFormData((prev) => ({
                        ...prev,
                        household_members: [
                          ...(prev.household_members || []),
                          { id: Date.now(), name: "", relationship: "", date_of_birth: "" },
                        ],
                      }));
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                {(editFormData.household_members || []).map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            household_members: prev.household_members.map((m) =>
                              m.id === member.id ? { ...m, name: e.target.value } : m
                            ),
                          }))
                        }
                      />
                      <Input
                        placeholder="Relationship"
                        value={member.relationship}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            household_members: prev.household_members.map((m) =>
                              m.id === member.id
                                ? { ...m, relationship: e.target.value }
                                : m
                            ),
                          }))
                        }
                      />
                      <Input
                        type="date"
                        value={member.date_of_birth}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            household_members: prev.household_members.map((m) =>
                              m.id === member.id
                                ? { ...m, date_of_birth: e.target.value }
                                : m
                            ),
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditFormData((prev) => ({
                            ...prev,
                            household_members: prev.household_members.filter(
                              (m) => m.id !== member.id
                            ),
                          }))
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                name="reason"
                value={editFormData.reason || ""}
                onChange={handleEditChange}
              />
            </div>

            <DialogFooter>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )
      }
    </div >
  );
}