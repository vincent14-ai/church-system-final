import React, { useState, useRef } from 'react';
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
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';

// Mock data
const mockPersonalInfo = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    ageGroup: 'Young Adults (18-25)',
    maritalStatus: 'Single',
    dateOfBirth: '1999-05-15',
    gender: 'Male',
    contactNumber: '+63 912 345 6789',
    address: '123 Main St, Balayan, Batangas',
    memberStatus: 'Active',
    dateAttended: '2024-01',
    spiritualTraining: ['Life Class'],
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    ageGroup: 'Young Married (26-39)',
    maritalStatus: 'Married',
    dateOfBirth: '1990-08-22',
    gender: 'Female',
    contactNumber: '+63 923 456 7890',
    address: '456 Church Ave, Balayan, Batangas',
    memberStatus: 'Active',
    dateAttended: '2023-06',
    spiritualTraining: ['Life Class', 'SOL 1', 'SOL 2'],
  },
];

const mockAttendanceData = [
  { id: '1', fullName: 'John Doe', ageGroup: 'Young Adults (18-25)', date: '2024-09-29', status: 'Present' },
  { id: '1', fullName: 'John Doe', ageGroup: 'Young Adults (18-25)', date: '2024-09-22', status: 'Present' },
  { id: '2', fullName: 'Jane Smith', ageGroup: 'Young Married (26-39)', date: '2024-09-29', status: 'Present' },
  { id: '2', fullName: 'Jane Smith', ageGroup: 'Young Married (26-39)', date: '2024-09-22', status: 'Absent' },
];

export function Reports({ isDark, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('members');
  const [filters, setFilters] = useState({
    ageGroup: 'all',
    memberStatus: 'all',
    dateFrom: '',
    dateTo: '',
    spiritualTraining: 'all',
  });
  const fileInputRef = useRef(null);

  const filteredMembers = mockPersonalInfo.filter(member => {
    if (filters.ageGroup !== 'all' && member.ageGroup !== filters.ageGroup) return false;
    if (filters.memberStatus !== 'all' && member.memberStatus.toLowerCase() !== filters.memberStatus) return false;
    
    if (filters.dateFrom && filters.dateTo) {
      const memberDate = new Date(member.dateAttended + '-01');
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      if (memberDate < fromDate || memberDate > toDate) return false;
    }
    
    return true;
  });

  const filteredAttendance = mockAttendanceData.filter(record => {
    if (filters.dateFrom && record.date < filters.dateFrom) return false;
    if (filters.dateTo && record.date > filters.dateTo) return false;
    if (filters.ageGroup !== 'all' && record.ageGroup !== filters.ageGroup) return false;
    return true;
  });

  const exportToExcel = (data, filename) => {
    // Create CSV content
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      console.log('Imported file content:', content);
      // Here you would parse the CSV/Excel file and process the data
      alert('File imported successfully! (This is a demo)');
    };
    reader.readAsText(file);
  };

  const ageGroups = [
    'Children (0-12)',
    'Youth (13-17)',
    'Young Adults (18-25)',
    'Young Married (18-25)',
    'Young Adults (26-39)',
    'Young Married (26-39)',
    'Middle Adults (40-59)',
    'Senior Adults (60+)',
  ];

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
                        {ageGroups.map(group => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberStatus">Status</Label>
                    <Select
                      value={filters.memberStatus}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, memberStatus: value }))}
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
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => setFilters({
                        ageGroup: 'all',
                        memberStatus: 'all',
                        dateFrom: '',
                        dateTo: '',
                        spiritualTraining: 'all',
                      })}
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
                    <h3>Members Information ({filteredMembers.length} records)</h3>
                  </div>
                  <Button
                    onClick={() => exportToExcel(filteredMembers, 'members_report')}
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
                        <TableHead>Name</TableHead>
                        <TableHead>Age Group</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Attended</TableHead>
                        <TableHead>Training</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.firstName} {member.lastName}</TableCell>
                          <TableCell>{member.ageGroup}</TableCell>
                          <TableCell>{member.gender}</TableCell>
                          <TableCell>{member.contactNumber}</TableCell>
                          <TableCell className="max-w-xs truncate">{member.address}</TableCell>
                          <TableCell>
                            <Badge variant={member.memberStatus === 'Active' ? 'default' : 'secondary'}>
                              {member.memberStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{member.dateAttended}</TableCell>
                          <TableCell>{member.spiritualTraining.join(', ')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="attendance" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <h3>Attendance Report ({filteredAttendance.length} records)</h3>
                  </div>
                  <Button
                    onClick={() => exportToExcel(filteredAttendance, 'attendance_report')}
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
                        <p>{filteredAttendance.length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Present</p>
                        <p>{filteredAttendance.filter(r => r.status === 'Present').length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Absent</p>
                        <p>{filteredAttendance.filter(r => r.status === 'Absent').length}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Attendance Rate</p>
                        <p>
                          {filteredAttendance.length > 0 
                            ? Math.round((filteredAttendance.filter(r => r.status === 'Present').length / filteredAttendance.length) * 100)
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
                      {filteredAttendance.map((record, index) => (
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
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        variant="outline"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File to Import
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
                          onClick={() => exportToExcel([{
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
                          onClick={() => exportToExcel([{
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