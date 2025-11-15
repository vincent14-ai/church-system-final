import React, { useState, useEffect } from 'react';
import axios from "axios";
import { motion } from 'framer-motion';
import { CalendarCheck, Users, UserCheck, UserX, Table as TableIcon } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

// Shared date util
const normalizeDate = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function AttendanceTable({ isDark, onToggleTheme }) {
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState({
    presentCount: 0,
    absentCount: 0,
    totalCount: 0
  });

  // Fetch summary + records for selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const date = normalizeDate(selectedDate);

        const res = await axios.get("http://localhost:5000/api/attendance/get", {
          params: { date }
        });

        const { records, summary } = res.data;

        const normalizedRecords = (records || []).map((r) => ({
          id: r.id,
          fullName: r.fullName,
          ageGroup: r.ageGroup,
          date: normalizeDate(r.date),
          status: r.status
        }));

        setAttendanceRecords(normalizedRecords);
        setSummary(summary || { presentCount: 0, absentCount: 0, totalCount: 0 });

      } catch (err) {
        console.error("Error fetching table records:", err);
      }
    };

    if (selectedDate) fetchAttendance();
  }, [selectedDate]);

  return (
    <div className="min-h-screen">
      {/* Desktop Header */}
      <div className="hidden lg:block bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <TableIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Attendance Summary Table
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
                  <TableIcon className="w-5 h-5 text-primary-foreground" />
                </div>
                Attendance Summary Table
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
                      <p className="text-2xl">{summary.totalCount}</p>
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
                      <p className="text-2xl">{summary.presentCount || "0"}</p>
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
                      <p className="text-2xl">{summary.absentCount || "0"}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Summary Table */}
              {attendanceRecords.length > 0 ? (
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
                      {attendanceRecords.map((record) => (
                        <TableRow key={`${record.id}-${record.date}`}>
                          <TableCell>{record.fullName}</TableCell>
                          <TableCell>{record.ageGroup}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                              {record.status === 'present' ? 'Present' : 'Absent'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(record.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <p className="text-muted-foreground">No attendance found for this date.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
