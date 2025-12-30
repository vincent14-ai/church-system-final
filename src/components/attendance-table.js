import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Search, Calendar, User, Moon, Sun } from 'lucide-react';
import axios from 'axios';
// --- MINIMAL UI COMPONENTS (Replacements for shadcn/ui) ---

const Button = ({ className = '', variant = 'default', size = 'default', children, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-violet-600 text-white hover:bg-violet-700",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    icon: "h-10 w-10",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Theme Toggle Component (Kept for local definition)
const ThemeToggle = ({ isDark, onToggle }) => (
  <button
    // 1. Idinagdag ang 'e' (event) para makuha ang coordinates ng click
    onClick={(e) => onToggle(e)} 
    className={`p-2 rounded-full transition-all duration-300 relative z-[60] ${
      isDark 
        ? 'bg-[#180C34] text-violet-400 border border-violet-900/50 shadow-lg shadow-violet-950/50' 
        : 'bg-white text-yellow-600 border border-gray-200 shadow-md hover:shadow-lg'
    }`}
  >
    {/* 2. Nagdagdag ng z-index para manatiling litaw ang icon habang lumalaki ang circle */}
    <div className="relative z-[61]">
      {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </div>
  </button>
);

// --- UTILS ---
const normalizeDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/* --- MOCK DATA FOR PREVIEW ---
const TODAY = normalizeDate(new Date());

const INITIAL_MEMBERS = [
  { id: 101, fullName: "Nheil Reyes", ageGroup: "Youth" },
  { id: 102, fullName: "JC Malabanan", ageGroup: "Adult" },
  { id: 103, fullName: "Vicente Lopez", ageGroup: "Youth" },
  { id: 104, fullName: "Jayvee Pesino", ageGroup: "Youth" },
];

/* Pre-fill some records for the table view
const INITIAL_ATTENDANCE_RECORDS = [
  { id: 101, fullName: "Nheil Reyes", ageGroup: "Youth", date: TODAY, status: "present" },
  { id: 102, fullName: "JC Malabanan", ageGroup: "Adult", date: TODAY, status: "absent" },
  { id: 103, fullName: "Vicente Lopez", ageGroup: "Youth", date: TODAY, status: "present" },
  { id: 104, fullName: "Jayvee Pesino", ageGroup: "Youth", date: TODAY, status: "present" },
];
*/

// -----------------------------------------------------------
// MODIFIED: Accept isDark and onToggleTheme as props
// -----------------------------------------------------------
export function AttendanceTable({ isDark, onToggleTheme }) {

  // Core State
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));//changed 
  const [searchTerm, setSearchTerm] = useState('');

  const [attendanceRecords, setAttendanceRecords] = useState([]);//removed
  const [members, setMembers] = useState([]); //removed
  const [filteredMembers, setFilteredMembers] = useState([]);//removed

  const [summary, setSummary] = useState({
    presentCount: 0,
    absentCount: 0,
    totalCount: 0 // Corrected total count based on INITIAL_MEMBERS
  });

  // --- MOCK EFFECTS (Replacing Axios for Preview) ---

  /* removed
  1. Fetch Members (Mock)
  useEffect(() => {
    setMembers(INITIAL_MEMBERS);
  }, []);

  // 2. Fetch Attendance for Date (Mock)
  useEffect(() => {
    const isToday = normalizeDate(selectedDate) === TODAY;
    if (isToday) {
       setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
    } else {
      // If we select a different date, we show an empty record set for the mock
       setAttendanceRecords(
          INITIAL_MEMBERS.map(m => ({
            id: m.id,
            fullName: m.fullName,
            ageGroup: m.ageGroup,
            date: normalizeDate(selectedDate),
            status: null, // Not recorded
          }))
       ); 
    }
  }, [selectedDate]);

  // 4. Recalculate Summary
  useEffect(() => {
    const normalized = normalizeDate(selectedDate);
    const currentRecords = attendanceRecords.filter(r => r.date === normalized && r.status !== null);
    
    // Count records that have been explicitly marked
    const present = currentRecords.filter(r => r.status === 'present').length;
    const absent = currentRecords.filter(r => r.status === 'absent').length;
    
    setSummary({
      presentCount: present,
      absentCount: absent,
      totalCount: members.length
    });
  }, [attendanceRecords, selectedDate, members]);

  // --- LOGIC ---
const getAttendanceStatus = (id) => {
    const normalized = normalizeDate(selectedDate);
    const record = attendanceRecords.find(
      (r) => r.id === id && normalizeDate(r.date) === normalized
    );
    return record?.status;
  };
  
  */

  // 3. Search Filter
  const filteredRecords = React.useMemo(() => {
  return attendanceRecords.filter(r =>
    r.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [attendanceRecords, searchTerm]);


  // Fetch summary + records for selected date
  //added back
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const date = normalizeDate(selectedDate);
        const res = await axios.get("http://localhost:5000/api/attendance/get", { params: { date } });

        const { records, summary } = res.data;

        const normalizedRecords = (records || []).map((r) => ({
          id: r.id,
          fullName: r.fullName,
          ageGroup: r.ageGroup,
          date: normalizeDate(r.date),
          status: r.status
        }));

        setAttendanceRecords(normalizedRecords);

        // 🔹 Add this to populate members for filtering
        setMembers(normalizedRecords);

        setSummary(summary || { presentCount: 0, absentCount: 0, totalCount: 0 });
      } catch (err) {
        console.error("Error fetching table records:", err);
      }
    };

    if (selectedDate) fetchAttendance();
  }, [selectedDate]);


  // --- STYLES ---

  const bgClass = isDark ? 'bg-[#0A001F]' : 'bg-gray-100';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const cardBg = isDark ? 'bg-[#180C34] border-violet-900/30' : 'bg-white border-gray-200';
  const tableHeaderBg = isDark ? 'bg-[#180C34]' : 'bg-gray-50';
  const tableBorder = isDark ? 'border-violet-900/30' : 'border-gray-200';
  const rowHover = isDark ? 'hover:bg-[#2a1655]/40' : 'hover:bg-gray-50';

  return (
    <div className={`min-h-screen w-full ${bgClass} ${textClass} font-sans transition-colors duration-300`}>

      {/* TOP HEADER BAR */}
      <div className={`w-full sticky top-0 z-10 border-b ${isDark ? 'bg-[#0A001F]/95 border-violet-900/30' : 'bg-white/95 border-gray-200'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Attendance Records
            </h2>
          </div>
          {/* RE-ADDED THE THEME TOGGLE BUTTON */}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* 1. CONTROLS & STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Date Picker */}
          <div className="space-y-2 md:col-span-1">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Select Date</label>
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`h-12 pl-4 text-lg ${isDark
                  ? 'bg-[#180C34] border-violet-800/50 text-white'
                  : 'bg-white border-gray-200 text-gray-900'}`}
                style={isDark ? { colorScheme: 'dark' } : {}}
              />
            </div>
          </div>

          {/* Total Members */}
          <div className={`p-4 rounded-xl border shadow-sm ${cardBg}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Members</p>
                <p className="text-2xl font-bold">{summary.totalCount}</p>
              </div>
            </div>
          </div>

          {/* Present */}
          <div className={`p-4 rounded-xl border shadow-sm ${cardBg}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Present</p>
                <p className="text-2xl font-bold">{summary.presentCount}</p>
              </div>
            </div>
          </div>

          {/* Absent */}
          <div className={`p-4 rounded-xl border shadow-sm ${cardBg}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Absent</p>
                <p className="text-2xl font-bold">{summary.absentCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SEARCH BAR */}
        <div className="relative max-w-md">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 h-11 ${isDark
              ? 'bg-[#180C34] border-violet-800/50 placeholder:text-gray-500'
              : 'bg-white border-gray-200'}`}
          />
        </div>

        {/* 3. ATTENDANCE TABLE (As requested) */}
        <div className="space-y-4">
          <h3 className={`text-xl font-bold ${isDark ? 'text-violet-200' : 'text-violet-900'}`}>
            Attendance Summary
          </h3>

          <div className={`rounded-xl border overflow-hidden ${tableBorder} ${cardBg}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                {/* Table Header */}
                <thead className={`text-xs uppercase ${tableHeaderBg} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Age Group</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className={`divide-y ${isDark ? 'divide-violet-900/30' : 'divide-gray-100'}`}>
                {/* changed to attendanceRecords  */}
                  {filteredRecords.map((record) => (

                    <motion.tr
                      key={`${record.id}-${record.date}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-colors ${rowHover}`}
                    >
                      <td className="px-6 py-4 font-semibold">
                        {record.fullName}
                      </td>

                      <td className="px-6 py-4 text-violet-400 font-medium">
                        {record.ageGroup || 'N/A'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {record.status === 'present' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                              Present
                            </span>
                          )}

                          {record.status === 'absent' && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-rose-500/20 text-rose-400 border-rose-500/50">
                              Absent
                            </span>
                          )}

                          {!record.status && (
                            <span className="text-xs italic text-gray-400">
                              Not Recorded
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {formatDateForDisplay(record.date)}
                      </td>
                    </motion.tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AttendanceTable;