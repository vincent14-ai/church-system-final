import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Users, UserCheck, UserX, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import axios from "axios";

// Function to normalize date to 'YYYY-MM-DD' format
const normalizeDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function Attendance({ isDark, onToggleTheme }) {
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [summary, setSummary] = useState({
    presentCount: 0,
    absentCount: 0,
    totalCount: 0
  });

  // Fetch all members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/members/attendance");
        setMembers(res.data);
        setFilteredMembers(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, []);

  // Fetch attendance for selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const normalizedDate = normalizeDate(selectedDate);

        const res = await axios.get("http://localhost:5000/api/attendance/get", {
          params: { date: normalizedDate },
        });

        const { records, summary } = res.data;

        // Normalize record dates
        const dbRecords = (records || []).map((record) => ({
          id: record.id,
          fullName: record.fullName,
          ageGroup: record.ageGroup,
          date: normalizeDate(record.date),
          status: record.status,
        }));

        setAttendanceRecords(dbRecords);
        setSummary(summary || { presentCount: 0, absentCount: 0, totalCount: 0 });

      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    if (selectedDate) fetchAttendance();
  }, [selectedDate]);

  // Search filter
  useEffect(() => {
    const filtered = members.filter(member =>
      member.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  // Mark attendance (save + update state)
  const markAttendance = async (memberId, status) => {
    const member = filteredMembers.find((m) => m.id === memberId);
    if (!member) return;

    const normalizedDate = normalizeDate(selectedDate);

    const newRecord = {
      id: memberId,
      fullName: member.fullName,
      ageGroup: member.ageGroup,
      date: normalizedDate,
      status,
    };

    try {
      // Persist user's explicit selection first
      await axios.post("http://localhost:5000/api/attendance/create", {
        member_id: memberId,
        date: normalizedDate,
        status,
      });

      // Update local records deterministically so we can calculate the threshold reliably
      setAttendanceRecords((prev) => {
        // create a shallow copy and replace or append the new record
        const existingIndex = prev.findIndex(
          (r) => r.id === memberId && r.date === normalizedDate
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newRecord;
          // After updating, check threshold and possibly apply defaults
          applyDefaultAbsentsIfNeeded(normalizedDate, updated);
          return updated;
        }
        const updated = [...prev, newRecord];
        applyDefaultAbsentsIfNeeded(normalizedDate, updated);
        return updated;
      });

    } catch (err) {
      console.error("Error saving attendance:", err);
    }
  };

  // Apply default absent for all remaining members once threshold is reached (but keep them editable)
  const applyDefaultAbsentsIfNeeded = async (date, currentRecords) => {
    try {
      const normalized = normalizeDate(date);
      // Count how many unique members have been explicitly marked for this date
      const markedIds = new Set(currentRecords.filter(r => r.date === normalized).map(r => r.id));
      const markedCount = markedIds.size;

      const THRESHOLD = 10;
      if (markedCount < THRESHOLD) return; // nothing to do yet

      // Find members that are not yet marked for this date
      const toMark = filteredMembers.filter(m => !markedIds.has(m.id));
      if (toMark.length === 0) return;

      // Prepare default absent records
      const defaultRecords = toMark.map(m => ({
        id: m.id,
        fullName: m.fullName,
        ageGroup: m.ageGroup,
        date: normalized,
        status: 'absent',
      }));

      // Optimistically update local state to include defaults (avoid duplicates)
      setAttendanceRecords(prev => {
        const exists = new Set(prev.map(r => `${r.id}-${r.date}`));
        const merged = [...prev];
        for (const rec of defaultRecords) {
          const key = `${rec.id}-${rec.date}`;
          if (!exists.has(key)) merged.push(rec);
        }
        return merged;
      });

      // Persist default absent records to backend
      await Promise.all(defaultRecords.map(rec => axios.post("http://localhost:5000/api/attendance/create", {
        member_id: rec.id,
        date: rec.date,
        status: rec.status,
      }).catch(err => {
        // log but don't fail the whole batch
        console.error('Error saving default absent for', rec.id, err);
      })));

    } catch (err) {
      console.error('Error applying default absents:', err);
    }
  };

  // Get attendance status for each member
  const getAttendanceStatus = (id) => {
    const record = attendanceRecords.find(
      (record) => record.id == id && normalizeDate(record.date) === normalizeDate(selectedDate)
    );
    return record?.status;
  };

  // Recalculate summary when data changes
  useEffect(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return;

    const normalized = normalizeDate(selectedDate);
    const todayAttendance = attendanceRecords.filter(
      (record) => record.date === normalized
    );

    const localPresent = todayAttendance.filter(r => r.status === "present").length;
    const localAbsent = todayAttendance.filter(r => r.status === "absent").length;
    const localTotal = todayAttendance.length;

    setSummary({
      presentCount: localPresent,
      absentCount: localAbsent,
      totalCount: localTotal,
    });
  }, [attendanceRecords, selectedDate]);

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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}