import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Calendar, Users, UserCheck, UserX, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';

// Mock data for demonstration
const mockMembers = [
  { id: '1', fullName: 'John Doe', ageGroup: 'Young Adults (18-25)' },
  { id: '2', fullName: 'Jane Smith', ageGroup: 'Young Married (26-39)' },
  { id: '3', fullName: 'Bob Johnson', ageGroup: 'Middle Adults (40-59)' },
  { id: '4', fullName: 'Alice Brown', ageGroup: 'Youth (13-17)' },
  { id: '5', fullName: 'Charlie Wilson', ageGroup: 'Senior Adults (60+)' },
];

export function Attendance({ isDark, onToggleTheme }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState(mockMembers);

  React.useEffect(() => {
    const filtered = mockMembers.filter(member =>
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm]);

  const markAttendance = (memberId, status) => {
    const member = mockMembers.find(m => m.id === memberId);
    if (!member) return;

    const existingRecordIndex = attendanceRecords.findIndex(
      record => record.id === memberId && record.date === selectedDate
    );

    const newRecord = {
      id: memberId,
      fullName: member.fullName,
      ageGroup: member.ageGroup,
      date: selectedDate,
      status,
    };

    if (existingRecordIndex >= 0) {
      // Update existing record
      const updatedRecords = [...attendanceRecords];
      updatedRecords[existingRecordIndex] = newRecord;
      setAttendanceRecords(updatedRecords);
    } else {
      // Add new record
      setAttendanceRecords(prev => [...prev, newRecord]);
    }
  };

  const getAttendanceStatus = (memberId) => {
    const record = attendanceRecords.find(
      record => record.id === memberId && record.date === selectedDate
    );
    return record?.status;
  };

  const todayAttendance = attendanceRecords.filter(record => record.date === selectedDate);
  const presentCount = todayAttendance.filter(record => record.status === 'present').length;
  const absentCount = todayAttendance.filter(record => record.status === 'absent').length;

  return (
    <div className="min-h-screen">
      {/* Desktop Header */}
      <div className="hidden lg:block bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Attendance Monitoring
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
                  <Calendar className="w-5 h-5 text-primary-foreground" />
                </div>
                Attendance Monitoring
              </CardTitle>
            </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Date Selection and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm">Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-11 bg-input-background shadow-sm"
                />
              </div>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Recorded</p>
                    <p className="text-2xl">{todayAttendance.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="text-2xl">{presentCount}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <UserX className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-2xl">{absentCount}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Member List */}
            <div className="space-y-4">
              <h3>Mark Attendance</h3>
              <div className="grid gap-4">
                {filteredMembers.map((member) => {
                  const status = getAttendanceStatus(member.id);
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4>{member.fullName}</h4>
                            <p className="text-sm text-muted-foreground">{member.ageGroup}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {status && (
                              <Badge variant={status === 'present' ? 'default' : 'destructive'}>
                                {status === 'present' ? 'Present' : 'Absent'}
                              </Badge>
                            )}
                            <Button
                              variant={status === 'present' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => markAttendance(member.id, 'present')}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Present
                            </Button>
                            <Button
                              variant={status === 'absent' ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => markAttendance(member.id, 'absent')}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Absent
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Attendance Summary Table */}
            {todayAttendance.length > 0 && (
              <div className="space-y-4">
                <h3>Today's Attendance Summary</h3>
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Age Group</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayAttendance.map((record) => (
                        <TableRow key={`${record.id}-${record.date}`}>
                          <TableCell>{record.fullName}</TableCell>
                          <TableCell>{record.ageGroup}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                              {record.status === 'present' ? 'Present' : 'Absent'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}
          </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}