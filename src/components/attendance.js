import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Users, UserCheck, UserX, Search, Calendar, User } from 'lucide-react'; 
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

/* --- HARDCODED SAMPLE DATA ---
const SAMPLE_MEMBER_ID = 999;
const TODAY = normalizeDate(new Date());

const INITIAL_MEMBERS = [
  { 
    id: SAMPLE_MEMBER_ID, 
    fullName: "Nheil Reyes", 
    ageGroup: "Youth",
    
  },
];

const INITIAL_ATTENDANCE_RECORDS = []; // No default status

// --- END HARDCODED SAMPLE DATA ---
*/
export function Attendance({ isDark, onToggleTheme }) {
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));
  const [searchTerm, setSearchTerm] = useState('');
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [members, setMembers] = useState([]);//removed hardcoded initial members
  const [filteredMembers, setFilteredMembers] = useState([]);//removed hardcoded initial members

  const [summary, setSummary] = useState({
    presentCount: 0,
    absentCount: 0,
    totalCount: 0
  });
  const [timerId, setTimerId] = useState(null);
  const [isAttendanceLoaded, setIsAttendanceLoaded] = useState(false);


  // Fetch all members (API calls are retained but will append to hardcoded data)
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
          setIsAttendanceLoaded(true);
          console.log("Fetched attendance records:", dbRecords);
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

  // Time-based absent marking at 1pm - only after attendance data is loaded
    useEffect(() => {
      if (!isAttendanceLoaded || !attendanceRecords.length) return; // Don't proceed until attendance is loaded and records exist
  
      const now = new Date();
      const today1pm = new Date();
      today1pm.setHours(10, 30, 0, 0); // Set to 1:00 PM today
  
      if (now >= today1pm) {
        // If it's already past 1pm, apply absents immediately
        applyTimeBasedAbsents();
      } else {
        // If before 1pm, set a timeout to apply at 1pm
        const timeUntil1pm = today1pm - now;
        const timeoutId = setTimeout(() => {
          applyTimeBasedAbsents();
        }, timeUntil1pm);
        setTimerId(timeoutId);
        return () => clearTimeout(timeoutId);
      }
    }, [selectedDate, members, isAttendanceLoaded, attendanceRecords]); // Restart on date change, members load, attendance load, or records change
  
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
  
        // Update local records
        setAttendanceRecords((prev) => {
          const existingIndex = prev.findIndex(
            (r) => r.id === memberId && r.date === normalizedDate
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newRecord;
            return updated;
          }
          return [...prev, newRecord];
        });
  
      } catch (err) {
        console.error("Error saving attendance:", err);
      }
    };
  
    // Apply time-based absent for all unmarked members
    const applyTimeBasedAbsents = async () => {
      try {
        const normalized = normalizeDate(selectedDate);
        // Find members that are not yet marked for this date
        const markedIds = new Set(attendanceRecords.filter(r => r.date === normalized).map(r => r.id));
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
  
        // Persist default absent records to backend first
        await Promise.all(defaultRecords.map(rec => axios.post("http://localhost:5000/api/attendance/create", {
          member_id: rec.id,
          date: rec.date,
          status: rec.status,
        }).catch(err => {
          // log but don't fail the whole batch
          console.error('Error saving default absent for', rec.id, err);
        })));
  
        // Update local state to include defaults (avoid duplicates)
        setAttendanceRecords(prev => {
          const exists = new Set(prev.map(r => `${r.id}-${r.date}`));
          const merged = [...prev];
          for (const rec of defaultRecords) {
            const key = `${rec.id}-${rec.date}`;
            if (!exists.has(key)) merged.push(rec);
          }
          return merged;
        });
  
      } catch (err) {
        console.error('Error applying time-based absents:', err);
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
  
      setSummary({
        presentCount: localPresent,
        absentCount: localAbsent,
        totalCount: members.length,
      });
    }, [attendanceRecords, selectedDate, members]);
  
  // 1. UPDATE: Main page background (Dark Mode: Deep Purple #0A001F, Light Mode: Light Gray)
  const mainContainerClasses = isDark 
    ? "min-h-screen bg-[#0A001F] text-white" 
    : "min-h-screen bg-gray-100 text-gray-900";

  // 2. UPDATE: Container/Card background (Dark Mode: Slightly lighter Purple #180C34)
  const contentCardClasses = isDark
    ? "bg-[#180C34] border-violet-900/30 shadow-2xl rounded-xl border"
    : "bg-white border-gray-200 shadow-xl rounded-xl border";


  return (
    <div className={mainContainerClasses}>
      
      {/* NEW: TOP HEADER BAR (Matching Personal Information Navigation) */}
      {/* 3. UPDATE: Navbar background to match main body background */}
      <div className={`w-full ${isDark ? 'bg-[#0A001F]/90 text-white shadow-lg' : 'bg-white text-gray-900 shadow-md'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon styled like the profile icon in the reference image */}
            <div className="w-8 h-8 bg-purple-600/20 dark:bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent transition-all duration-500">
              Attendance Monitoring
            </h2>
          </div>
          {/* Theme Toggle is positioned top right */}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>


      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Content Card (Attendance Controls) - Uses the updated aesthetic card style */}
          <div className={contentCardClasses}>
            <Card className="shadow-none border-0 bg-transparent">
              <CardContent className="p-6 md:p-8 space-y-8">
                
                {/* Date Selection and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-start"> 
                  {/* Date Input */}
                {/* Date Input - FINAL FIX: Attempting to change native icon color using 'color-scheme' */}
                  <div className="space-y-2 md:col-span-1"> 
                    <Label 
                      htmlFor="date" 
                      // Note: The original class 'text-black-300' is not a standard Tailwind class. Using 'text-muted-foreground' for better theme compatibility.
                      className="text-sm font-medium text-muted-foreground" 
                    >
                      Select Date
                    </Label>
                    
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      disabled
                      onChange={(e) => setSelectedDate(e.target.value)}
                      // Inline style to influence the native icon/control color scheme
                      style={isDark ? { colorScheme: 'dark' } : {}}
                      className={`
                        h-11 shadow-sm border-indigo-700/50 focus-visible:ring-primary transition-colors
                        ${isDark 
                            ? 'bg-[#1e143d] text-indigo-100 font-medium' // Mas malalim na purple para sa readability
                            : 'bg-gray-50 text-gray-900 font-medium'
                        }
                      `}
                    />
                  </div>
                  
                  {/* STATS CARDS - Using distinct, clear colors in both modes */}
                  {/* Total Recorded (Total members in system) */}
                  <Card className="p-4 bg-gray-50 dark:bg-blue-900/20 border-gray-200 dark:border-blue-800 shadow-sm md:col-span-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">TOTAL MEMBERS</p>
                        <p className="text-2xl font-bold">{summary.totalCount}</p>
                      </div>
                    </div>
                  </Card>
                  {/* Present Count (Marked Present for selected date) */}
                  <Card className="p-4 bg-gray-50 dark:bg-green-900/20 border-gray-200 dark:border-green-800 shadow-sm md:col-span-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">PRESENT</p>
                        <p className="text-2xl font-bold">{summary.presentCount || "0"}</p>
                      </div>
                    </div>
                  </Card>
                  {/* Absent Count (Marked Absent for selected date) */}
                  <Card className="p-4 bg-gray-50 dark:bg-red-900/20 border-gray-200 dark:border-red-800 shadow-sm md:col-span-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <UserX className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">ABSENT</p>
                        <p className="text-2xl font-bold">{summary.absentCount || "0"}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Search */}
                <div className="relative pt-4"> 
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 mt-2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // *** FIX APPLIED HERE ***
                    className={`
                      pl-10 h-11 shadow-sm border-indigo-700/50 focus-visible:ring-primary 
                      ${isDark 
                          ? 'bg-gray-700/70 text-white placeholder-gray-400' // Dark Mode: dark background, light text/placeholder
                          : 'bg-white text-gray-900 placeholder-gray-500'    // Light Mode: white background, dark text/placeholder
                      }
                    `}
                  />
                </div>

                {/* Member List */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xl font-bold text-primary/90 border-b pb-2 border-border/50">Mark Attendance</h3>
                  <div className="grid gap-3">
                    {filteredMembers.map((member) => {
                      const status = getAttendanceStatus(member.id);
                      return (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Individual Member Card */}
                          <Card className="p-4 shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              {/* Member Info (Left Aligned) */}
                              <div className="flex-1 min-w-[150px]">
                                <h4 className="font-semibold text-lg">{member.fullName}</h4>
                                <p className="text-sm text-muted-foreground">{member.ageGroup || "Age Group N/A"}</p>
                              </div>
                              
                              {/* Status and Action Buttons (Right Aligned) */}
                              <div className="flex items-center gap-3">
                                {/* Status badge only appears if status is explicitly set */}
                                {status && (
                                  <Badge 
                                    className={`
                                      text-sm font-semibold h-7 px-3 transition-all duration-300
                                      ${status === 'present' 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-red-500 hover:bg-red-600'}
                                    `}
                                  >
                                    {status.toUpperCase()}
                                  </Badge>
                                )}
                                
                                {/* Present Button */}
                                <Button
                                  variant={status === 'present' ? 'default' : 'outline'}
                                  size="sm"
                                  disabled={status === 'absent'}
                                  onClick={() => markAttendance(member.id, 'present')}
                                  className={`
                                    h-9 transition-all duration-300
                                    ${status === 'present' 
                                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-md' 
                                      : 'border-green-500 text-green-500 hover:bg-green-500/10'}
                                      ${status === 'absent' ? 'opacity-50 cursor-not-allowed border-gray-400 text-gray-400' : ''}
                                  `}
                                >
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Present
                                </Button>
                                
                                {/* Absent Button */}
                                {/* <Button
                                  variant={status === 'absent' ? 'destructive' : 'outline'}
                                  size="sm"
                                  onClick={() => markAttendance(member.id, 'absent')}
                                  className={`
                                    h-9 transition-all duration-300
                                    ${status === 'absent' 
                                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-md' 
                                      : 'border-red-500 text-red-500 hover:bg-red-500/10'}
                                  `}
                                >
                                  <UserX className="w-4 h-4 mr-1" />
                                  Absent
                                </Button> */}
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}