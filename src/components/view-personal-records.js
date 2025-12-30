import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Users, Download, Search, Filter, Plus, Trash2, User, Loader2, X, Edit2, ChevronLeft, ChevronRight, Hash, Calendar, Heart, Sun, Moon, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from "axios";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "./ui/dropdown-menu";

/*
// --- Hardcoded Data for Initial State (Unchanged) ---
const HARDCODED_MEMBERS = [
    {
        member_id: 101,
        photo_url: 'https://images.unsplash.com/photo-1544723795-3fb6469e71b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D',
        first_name: 'Nheil',
        last_name: 'Reyes',
        marital_status: 'Single',
        date_of_birth: '2002-12-09T00:00:00.000Z',
        gender: 'Male',
        contact_number: '09171234567',
        prev_church_attendee: true,
        prev_church: 'JPCC Balayan',
        address: 'Alangilan, Batangas City',
        age_group: 'Youth',
        trainings: 'Life Class (2020), SOL 1 (2022)',
        willing_training: false,
        households: null,
        invited_by: 'Pastor Dan',
        date_attended: '2019-10-10T00:00:00.000Z',
        attending_cell_group: true,
        cell_leader_name: 'JC Malabanan',
        church_ministry: 'Media, Visuals',
        consolidation: 'Yes',
        reason: 'N/A',
        water_baptized: true,
        member_status: 'Active',
    },
    {
        member_id: 102,
        photo_url: null,
        first_name: 'Vicente',
        last_name: 'Lopez',
        marital_status: 'Single',
        date_of_birth: '2001-01-20T00:00:00.000Z',
        gender: 'Male',
        contact_number: '09209876543',
        prev_church_attendee: false,
        prev_church: null,
        address: '456 Elm Ave, Quezon City',
        age_group: 'Youth',
        trainings: 'Life Class (2024)',
        willing_training: true,
        households: null,
        invited_by: null,
        date_attended: '2024-03-01T00:00:00.000Z',
        attending_cell_group: true,
        cell_leader_name: 'JC Malabanan',
        church_ministry: 'Praise Team, Content Writer',
        consolidation: 'Yes',
        reason: 'N/A',
        water_baptized: false,
        member_status: 'Active',
    },
    {
        member_id: 103,
        photo_url: 'C:\Users\nheil\OneDrive\Desktop\church-system-final-latest_main\src\components\assets\LOGO WHITE.png',
        first_name: 'Jayvee',
        last_name: 'Pesino',
        marital_status: 'Married',
        date_of_birth: '2000-11-10T00:00:00.000Z',
        gender: 'Male',
        contact_number: '09985551234',
        prev_church_attendee: true,
        prev_church: 'JPCC Balayan',
        address: '789 Oak Lane, Makati City',
        age_group: 'Couples',
        trainings: 'SOL 1 (2015), SOL 2 (2016), SOL 3 (2017)',
        willing_training: false,
        households: null,
        invited_by: null,
        date_attended: '2014-05-25T00:00:00.000Z',
        attending_cell_group: false,
        cell_leader_name: null,
        church_ministry: null,
        consolidation: 'No',
        reason: null,
        water_baptized: true,
        member_status: 'Inactive',
    },
];
// --- End Hardcoded Data ---

// --- Mock API Setup for Client-Side Simulation (Unchanged) ---
const MOCK_API = {
    members: [...HARDCODED_MEMBERS],
    get: function(url, config) {
        let filtered = this.members;
        const { search, age_group, member_status, ministry, training, birth_month, water_baptized, marital_status } = config.params;

        // Simulate Searching
        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(m =>
                m.first_name.toLowerCase().includes(lowerSearch) ||
                m.last_name.toLowerCase().includes(lowerSearch)
            );
        }

        // Simulate Filtering
        if (age_group && age_group !== 'all') {
            filtered = filtered.filter(m => m.age_group === age_group);
        }
        if (member_status && member_status !== 'all') {
            const statusMap = { 'active': 'Active', 'inactive': 'Inactive' };
            filtered = filtered.filter(m => m.member_status === statusMap[member_status]);
        }

        // NEW: Ministry Filter (Checks if the member's ministry string includes the selected ministry)
        if (ministry && ministry !== 'all') {
            const lowerMinistry = ministry.toLowerCase();
            filtered = filtered.filter(m => m.church_ministry && m.church_ministry.toLowerCase().includes(lowerMinistry));
        }

        // NEW: Spiritual Training Filter (Checks if the member's training string includes the selected training)
        if (training && training !== 'all') {
            const lowerTraining = training.toLowerCase();
            filtered = filtered.filter(m => m.trainings && m.trainings.toLowerCase().includes(lowerTraining));
        }

        // NEW: Birth Month Filter
        if (birth_month && birth_month !== 'all') {
            filtered = filtered.filter(m => {
                if (!m.date_of_birth) return false;
                // date_of_birth is 'YYYY-MM-DD...' so month is at index 5 and 6 (e.g., '12' for December)
                const memberMonth = new Date(m.date_of_birth).getMonth() + 1; // getMonth() is 0-indexed
                return memberMonth.toString() === birth_month;
            });
        }

        // NEW: Water Baptized Filter
        if (water_baptized && water_baptized !== 'all') {
            const isBaptized = water_baptized === 'true';
            filtered = filtered.filter(m => !!m.water_baptized === isBaptized);
        }

        // NEW: Marital Status Filter
        if (marital_status && marital_status !== 'all') {
            filtered = filtered.filter(m => m.marital_status === marital_status);
        }

        return Promise.resolve({ data: filtered });
    },
    getById: function(id) {
        const member = this.members.find(m => m.member_id === id);
        return Promise.resolve({ data: member });
    },
    put: function(id, data) {
        const index = this.members.findIndex(m => m.member_id === id);
        if (index !== -1) {
            this.members[index] = { ...this.members[index], ...data };
            return Promise.resolve({ data: this.members[index] });
        }
        return Promise.reject({ response: { status: 404 } });
    },
    delete: function(id) {
        const initialLength = this.members.length;
        this.members = this.members.filter(m => m.member_id !== id);
        if (this.members.length < initialLength) {
            return Promise.resolve({ status: 200 });
        }
        return Promise.reject({ response: { status: 404 } });
    }
};
// --- End Mock API Setup ---
*/

function parseChurchMinistry(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        return value.split(/\s*(?:,|-)\s*/).filter(Boolean).map(s => s.trim());
    }
    return [];
}

/**
 * Converts a semicolon-separated household string into an array of objects for the form.
 */

function parseHouseholds(householdsString) {
    if (!householdsString) return [];

    return householdsString.split(";").map((item) => {
        const trimmed = item.trim();
        if (!trimmed) return null;

        const match = trimmed.match(/^(.*?)\s*-\s*(.*?)\s*\((\d{4}-\d{2}-\d{2})\)$/);
        if (match) {
            const [, name, relationship, date_of_birth] = match;
            return { id: Math.random().toString(36).substring(2, 9), name, relationship, date_of_birth };
        }

        return null;
    }).filter(Boolean);
};

/**
 * Converts the array of household objects back into the semicolon-separated string format for the API.
 */
function formatHouseholds(householdMembersArray) {
    if (!householdMembersArray || householdMembersArray.length === 0) return null;

    return householdMembersArray.map(member => {
        if (member.name && member.relationship && member.date_of_birth) {
            return `${member.name} - ${member.relationship} (${member.date_of_birth})`;
        }
        return null;
    }).filter(Boolean).join("; ");
}


function parseTrainings(trainingsString) {
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

function formatTrainings(trainingsObj) {
    if (!trainingsObj) return "";

    return Object.entries(trainingsObj)
        .filter(([key, value]) => value && !key.endsWith("Year") && key !== "willing_training")
        .map(([key]) => {
            const year = trainingsObj[`${key}Year`];
            return year ? `${key} (${year})` : key;
        })
        .join(", ");
};

export default function ViewPersonalRecords({ isDark, onToggleTheme }) {
    const [members, setMembers] = useState(""); //removed HARDCODED_MEMBERS
    const [currentPage, setCurrentPage] = useState(1);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMinistry, setSelectedMinistry] = useState("all");
    const [selectedTraining, setSelectedTraining] = useState("all");
    const [selectedBirthMonth, setSelectedBirthMonth] = useState("all");
    const [selectedWaterBaptized, setSelectedWaterBaptized] = useState("all");
    const [selectedMaritalStatus, setSelectedMaritalStatus] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const rowsPerPage = 10;

    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentMemberRows = members.slice(startIndex, startIndex + rowsPerPage);

    const totalMemberPages = Math.ceil(members.length / rowsPerPage);

    const [selectedMember, setSelectedMember] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");

    // UPDATED: Added new ministries - "Kids Ministry" and "Technical"
    const ministries = ["Media", "Praise Team", "Content Writer", "Ushering", "Kids Ministry", "Technical", "Others"];
    const trainings = ["Life Class", "SOL 1", "SOL 2", "SOL 3"];

    //const API = MOCK_API; 

    const fileInputRef = useRef(null);

    const fetchMembers = async () => {
        try {
            //changed API to axios
            const res = await axios.get("http://localhost:5000/api/members", {
                params: {
                    search: searchTerm,
                    age_group: selectedAgeGroup,
                    member_status: selectedStatus,
                    church_ministry: selectedMinistry,
                    spiritual_trainings: selectedTraining !== "all" ? selectedTraining : undefined,
                    birth_month: selectedBirthMonth !== "all" ? selectedBirthMonth : undefined,
                    water_baptized: selectedWaterBaptized,
                    marital_status: selectedMaritalStatus,
                    date_from: startDate,
                    date_to: endDate,
                },
            });
            setMembers(res.data);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching members:", err);
            toast.error("Failed to load records.");
        }
    };

    /*const handleEdit = async (member_id) => {
        try {
            //changed API to axios
            const res = await axios.getById(member_id);
            const member = res.data;

            if (!member) throw new Error("Member not found");

            const parsedTrainings = parseTrainings(member.trainings);
            const parsedHouseholds = parseHouseholds(member.households);

            setEditFormData({
                ...member,
                date_of_birth: member.date_of_birth ? new Date(member.date_of_birth).toISOString().split('T')[0] : "",
                date_attended: member.date_attended ? new Date(member.date_attended).toISOString().split('T')[0] : "",
                church_ministry: parseChurchMinistry(member.church_ministry),
                spiritual_trainings: parsedTrainings,
                household_members: parsedHouseholds,
            });

            setSelectedMember(member_id);
            setShowEditModal(true);
            setActiveTab("personal"); // Reset tab on open
        } catch (error) {
            console.error("Failed to fetch member for edit:", error);
            toast.error("Unable to load member details");
        }
    };*/

    // edit member
    const handleEdit = async (member_id) => {
        try {
            console.log("Fetching member:", member_id);
            const res = await axios.get(`http://localhost:5000/api/members/${member_id}`);
            const member = res.data;

            // Map backend's 'trainings' to frontend's 'spiritual_trainings'
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
            console.error("Failed to fetch member for edit:", error);
            toast.error("Unable to load member details");
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

   const handleEditSubmit = async () => {
  try {
    if (!selectedMember) return toast.error("No member selected");

    // --- START OF VALIDATION ---
    const errors = [];

    // Validation para sa Cell Group
    if (editFormData.attending_cell_group && !editFormData.cell_leader_name?.trim()) {
      errors.push("Cell Leader Name is required because you selected 'Yes' for Attending Cell Group.");
    }

    // Validation para sa Previous Church
    if (editFormData.prev_church_attendee && !editFormData.prev_church?.trim()) {
      errors.push("Previous Church Name is required because you selected 'Yes' for Attended Previous Church.");
    }

    // Kung may errors, ipakita sila at i-stop ang function
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return; // Dito hihinto ang function, hindi tutuloy sa axios.put
    }
    // --- END OF VALIDATION ---

    const payload = {
      ...editFormData,
      church_ministry: Array.isArray(editFormData.church_ministry)
        ? editFormData.church_ministry.join(", ")
        : editFormData.church_ministry || null,
      trainings: formatTrainings(editFormData.spiritual_trainings),
    };

    await axios.put(`http://localhost:5000/api/members/${selectedMember}`, payload);
    
    fetchMembers();
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
        // FIX: Gumamit ng backticks (`) para sa Template Literals sa URL
        const res = await axios.delete(`http://localhost:5000/api/members/${member_id}`);
        
        // Mahalaga: I-check muna ang status bago mag-update ng state
        if (res.status === 200) {
            fetchMembers(); // I-refresh ang listahan
            
            // Remove deleted member from local state
            setMembers((prev) => prev.filter((m) => m.member_id !== member_id));
            toast.success("Member deleted successfully!");
            
            if (currentMemberRows.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
        } else {
            throw new Error("Failed to delete member");
        }

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
            // LOGIC: If "Others" was just unchecked, clear the text field
        const shouldClearOthers = exists && ministry === "Others";
           return { 
            ...prev, 
            church_ministry: next,
            // If shouldClearOthers is true, it overrides the details with an empty string
            ...(shouldClearOthers && { other_ministry_details: "" })

            
        };
        });
    };

    

    const toggleTraining = (training) => {
        setEditFormData(prev => {
            const currentTrainings = prev.spiritual_trainings || {};
            const isChecked = !!currentTrainings[training];

            if (isChecked) {
                const newTrainings = { ...currentTrainings };
                delete newTrainings[training];
                delete newTrainings[`${training}Year`];
                return { ...prev, spiritual_trainings: newTrainings };
            } else {
                return {
                    ...prev,
                    spiritual_trainings: {
                        ...currentTrainings,
                        [training]: true
                    }
                };
            }
        });
    };

    const handleTrainingYearChange = (training, year) => {
        setEditFormData(prev => ({
            ...prev,
            spiritual_trainings: {
                ...prev.spiritual_trainings,
                [`${training}Year`]: year
            }
        }));
    };

    const handleAddHouseholdMember = () => {
        setEditFormData(prev => ({
            ...prev,
            household_members: [
                ...(prev.household_members || []),
                {
                    id: Math.random().toString(36).substring(2, 9),
                    name: "",
                    relationship: "",
                    date_of_birth: ""
                }
            ]
        }));
    };

    const handleHouseholdMemberChange = (id, field, value) => {
        setEditFormData(prev => ({
            ...prev,
            household_members: (prev.household_members || []).map(member =>
                member.id === id ? { ...member, [field]: value } : member
            )
        }));
    };

    const handleRemoveHouseholdMember = (id) => {
        setEditFormData(prev => ({
            ...prev,
            household_members: (prev.household_members || []).filter(member => member.id !== id)
        }));
    };
const handleBooleanToggle = (name, value) => {
    // Convert string 'true'/'false' from Select component to actual Boolean
    const boolValue = value === 'true';

    setEditFormData((prev) => {
        const newState = { 
            ...prev, 
            [name]: boolValue 
        };

        // AUTO-DELETE LOGIC:
        // If the specific field is toggled to 'false', clear its related text field
        if (name === 'prev_church_attendee' && !boolValue) {
            newState.prev_church = "";
        }

      
       // Cleanup: Cell Group (NEW)
        if (name === 'attending_cell_group' && !boolValue) {
            newState.cell_leader_name = ""; // Clear the leader's name if No is selected
        }

        return newState;
    });
};

    const handleApplyFilters = () => {
        fetchMembers();
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedAgeGroup("all");
        setSelectedStatus("all");
        setSelectedMinistry("all");
        setSelectedTraining("all");
        setSelectedBirthMonth("all");
        setSelectedWaterBaptized("all");
        setSelectedMaritalStatus("all");
        setStartDate("");
        setEndDate("");
        // Use a timeout or useEffect for a slight delay to ensure state updates trigger the fetch, or pass state directly.
        // For simplicity and to simulate a state-driven fetch:
        setTimeout(fetchMembers, 0);
    };

    // Initial fetch on component mount 
    useEffect(() => {
        fetchMembers();
    }, []);

    // Helper for badges
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600">Active</Badge>;
            case 'Inactive':
                return <Badge variant="secondary" className="bg-red-400 hover:bg-red-500 dark:bg-red-800 dark:hover:bg-red-700">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Helper for table data formatting
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            return dateString;
        }
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/api/import", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const { message, importedCount, failedRows } = response.data;

            // Single toast for both success and partial failure
            if (!failedRows || failedRows.length === 0) {
                toast.success(message || `Successfully imported ${importedCount} members.`);
            } else {
                toast(
                    <div className="space-y-2">
                        <div className="font-semibold text-green-600">
                            Imported {importedCount} new data.
                        </div>

                        <div className="space-y-1">
                            {failedRows.map((msg, idx) => (
                                <div key={idx} className="text-red-500 text-sm">
                                    {msg}
                                </div>
                            ))}
                        </div>
                    </div>,
                    { duration: 15000 }
                );
            }

        } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Import failed", {
                description: "Check your data format before importing.",
                duration: 15000,
            });
        } finally {
            setIsLoading(false);
            fetchMembers();
        }
    };

    //export members report
    const handleExportPost = async () => {
        try {
            const filters = {
                age_group: selectedAgeGroup,
                member_status: selectedStatus,
                date_from: startDate,
                date_to: endDate,
                birth_month: selectedBirthMonth !== 'all' ? Number(selectedBirthMonth) : undefined,
                church_ministry: selectedMinistry !== 'all' ? selectedMinistry : undefined,
                water_baptized: selectedWaterBaptized !== 'all' ? (selectedWaterBaptized === 'true') : undefined,
                marital_status: selectedMaritalStatus !== 'all' ? selectedMaritalStatus : undefined,
                spiritual_trainings: selectedTraining !== 'all' ? [selectedTraining] : undefined, // optional for now

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

    //additional data for gender
    const genders = [
        { label: "Male", value: "M" },
        { label: "Female", value: "F" },
    ];


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 text-gray-900 dark:text-gray-50">
            {/* Desktop Header */}
            <div className="hidden lg:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Member Records Management
                            </h1>
                        </div>
                        {/* Placeholder for Theme Toggle */}
                        <button 
  onClick={onToggleTheme} 
  className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-700"
>
  {isDark ? (
    /* Icon to show when DARK mode is active */
    <Moon className="w-5 h-5 text-indigo-400" /> 
  ) : (
    /* Icon to show when LIGHT mode is active */
    <Sun className="w-5 h-5 text-amber-500" />
  )}
</button>
                    </div>
                </div>
            </div>
            {/* --- Main Content Area --- */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="shadow-2xl border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
                        {/* Filters Section */}
                        <Card className="p-5 bg-gray-50 dark:bg-gray-900 shadow-inner border border-gray-200 dark:border-gray-700 mb-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-300/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Filter & Search Members</h3>
                                </div>
                                <div className="relative flex-grow sm:flex-grow-0 sm:ml-auto w-full sm:w-72">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                    <Input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ageGroup" className="text-gray-700 dark:text-gray-300 font-medium">Age Group</Label>
                                    <Select
                                        value={selectedAgeGroup}
                                        onValueChange={setSelectedAgeGroup}
                                    >
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            <SelectValue placeholder="Select Age Group" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800">
                                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Age Groups</SelectItem>
                                            <SelectItem value="Children" className="text-gray-900 dark:text-white">Children</SelectItem>
                                            <SelectItem value="Youth" className="text-gray-900 dark:text-white">Youth</SelectItem>
                                            <SelectItem value="Young Adult" className="text-gray-900 dark:text-white">Young Adult</SelectItem>
                                            <SelectItem value="Couples" className="text-gray-900 dark:text-white">Couples</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="member_status" className="text-gray-700 dark:text-gray-300 font-medium">Status</Label>
                                    <Select
                                        value={selectedStatus}
                                        onValueChange={setSelectedStatus}
                                    >
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800">
                                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Status</SelectItem>
                                            <SelectItem value="Active" className="text-gray-900 dark:text-white">Active</SelectItem>
                                            <SelectItem value="Inactive" className="text-gray-900 dark:text-white">Inactive</SelectItem>

                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ministry" className="text-gray-700 dark:text-gray-300 font-medium">Ministry</Label>
                                    <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            <SelectValue placeholder="Select Ministry" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800">
                                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Ministries</SelectItem>
                                            {ministries.map(m => (
                                                <SelectItem key={m} value={m} className="text-gray-900 dark:text-white">{m}</SelectItem>
                                            ))}
                                            <SelectItem value="Others" className="text-gray-900 dark:text-white">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="training" className="text-gray-700 dark:text-gray-300 font-medium">Spiritual Training</Label>
                                    <Select value={selectedTraining} onValueChange={setSelectedTraining}>
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            <SelectValue placeholder="Select Training" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800">
                                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Trainings</SelectItem>
                                            {trainings.map(t => (
                                                <SelectItem key={t} value={t} className="text-gray-900 dark:text-white">{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthMonth" className="text-gray-700 dark:text-gray-300 font-medium">Birth Month</Label>
                                    <Select value={selectedBirthMonth} onValueChange={setSelectedBirthMonth}>
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            <SelectValue placeholder="Select Month" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800">
                                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Months</SelectItem>
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => {
                                                const monthName = new Date(0, monthNum - 1).toLocaleString('en-US', { month: 'long' });
                                                return <SelectItem key={monthNum} value={monthNum.toString()} className="text-gray-900 dark:text-white">{monthName}</SelectItem>;
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="waterBaptized" className="text-gray-700 dark:text-gray-300 font-medium">Water Baptized</Label>
                                    <Select value={selectedWaterBaptized} onValueChange={setSelectedWaterBaptized}>
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800">
                                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Members</SelectItem>
                                            <SelectItem value="true" className="text-gray-900 dark:text-white">Yes</SelectItem>
                                            <SelectItem value="false" className="text-gray-900 dark:text-white">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maritalStatus" className="text-gray-700 dark:text-gray-300 font-medium">Marital Status</Label>
                                    <Select value={selectedMaritalStatus} onValueChange={setSelectedMaritalStatus}>
                                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800">
                                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Status</SelectItem>
                                            <SelectItem value="Single" className="text-gray-900 dark:text-white">Single</SelectItem>
                                            <SelectItem value="Married" className="text-gray-900 dark:text-white">Married</SelectItem>
                                            <SelectItem value="Widow/Widower" className="text-gray-900 dark:text-white">Widow/Widower</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateFrom" className="text-gray-700 dark:text-gray-300 font-medium">Date From</Label>
                                    <Input
                                    id="dateFrom"
                                    type="month"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white dark:[color-scheme:dark]"
                                  />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateTo" className="text-gray-700 dark:text-gray-300 font-medium">Date To</Label>
                                    <Input
                                        id="dateTo"
                                        type="month"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white dark:[color-scheme:dark]"
                                    />
                                </div>

                                {/* 👇 FIX APPLIED HERE: Using flex-col and justify-end to align buttons to the bottom of the column cell. */}
                                <div className="flex flex-col justify-end col-span-2 md:col-span-3 lg:col-span-1 gap-2">
                                    <Button
                                        variant="default"
                                        onClick={handleApplyFilters}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors h-10"
                                    >
                                        Apply Filters
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleClearFilters}
                                        className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors h-10"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Members Table Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 pb-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                            <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">
                                    Member Records (<span className="text-indigo-600 dark:text-indigo-400">{members.length}</span> total)
                                </h3>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    ref={fileInputRef}
                                    onChange={handleImport}
                                    className="hidden"
                                />
                                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex items-center gap-2 border-indigo-400 text-indigo-600 dark:border-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors">
                                    <Download className="w-4 h-4" /> Import CSV
                                </Button>
                                <Button 
                                 onClick={handleExportPost} 
                                 variant="outline" 
                                 className="flex items-center gap-2 border-indigo-400 text-indigo-600 dark:border-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
>
                                    <Upload className="w-4 h-4" /> 
                                   Export CSV
                                   </Button>
                            </div>
                        </div>


                        {/* Members Table */}
                        <Card className="overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
                            <Table className="min-w-full">
                                <TableHeader>
                                    <TableRow className="bg-indigo-50 dark:bg-gray-700/50 whitespace-nowrap text-gray-700 dark:text-gray-200 font-semibold border-b-2 border-indigo-200 dark:border-indigo-800">
                                        <TableHead className="w-[120px]">Actions</TableHead>
                                        <TableHead>Photo</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Marital Status</TableHead>
                                        <TableHead>Date of Birth</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Contact Number</TableHead>
                                        <TableHead>Prev Church?</TableHead>
                                        <TableHead>Prev Church Name</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Age Group</TableHead>
                                        <TableHead>Spiritual Training</TableHead>
                                        <TableHead>Willing to Train?</TableHead>
                                        <TableHead>Household Members</TableHead>
                                        <TableHead>Invited By</TableHead>
                                        <TableHead>Date Attended</TableHead>
                                        <TableHead>Attending Cell?</TableHead>
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
                                            <TableRow key={member.member_id} className="text-gray-700 dark:text-gray-300 hover:bg-indigo-50/50 dark:hover:bg-gray-800/70 border-b border-gray-100 dark:border-gray-700/50 transition-colors">
                                                <TableCell className="space-x-2 w-36 whitespace-nowrap">
                                                    <Button variant="outline" size="icon" onClick={() => handleEdit(member.member_id)} className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-700 transition-colors">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(member.member_id)} className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                                        {member.photo_url ? (
                                                            <img src={member.photo_url} alt={`${member.first_name} ${member.last_name}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium whitespace-nowrap">{member.last_name}, {member.first_name}</TableCell>
                                                <TableCell className="whitespace-nowrap">{member.marital_status}</TableCell>
                                                <TableCell className="whitespace-nowrap">{formatDate(member.date_of_birth)}</TableCell>
                                                <TableCell>{member.gender}</TableCell>
                                                <TableCell className="whitespace-nowrap">{member.contact_number}</TableCell>
                                                <TableCell>{member.prev_church_attendee ? 'Yes' : 'No'}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{member.prev_church || 'N/A'}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">{member.address}</TableCell>
                                                <TableCell><Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{member.age_group}</Badge></TableCell>
                                                <TableCell className="max-w-[200px] truncate">{member.trainings || 'None'}</TableCell>
                                                <TableCell>{member.willing_training ? 'Yes' : 'No'}</TableCell>
                                                <TableCell className="max-w-[250px] truncate">{member.households || 'None'}</TableCell>
                                                <TableCell>{member.invited_by || 'Self'}</TableCell>
                                                <TableCell className="whitespace-nowrap">{formatDate(member.date_attended)}</TableCell>
                                                <TableCell>{member.attending_cell_group ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{member.cell_leader_name || 'N/A'}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{member.church_ministry || 'None'}</TableCell>
                                                <TableCell>{member.consolidation}</TableCell>
                                                <TableCell className="max-w-[150px] truncate">{member.reason || 'N/A'}</TableCell>
                                                <TableCell>{member.water_baptized ? 'Yes' : 'No'}</TableCell>
                                                <TableCell>{getStatusBadge(member.member_status)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={23} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                                No records found matching your filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Pagination */}
                        <div className="flex justify-between items-center pt-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {currentMemberRows.length > 0 ? startIndex + 1 : 0} to {startIndex + currentMemberRows.length} of {members.length} records.
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                            disabled={currentPage === 1}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-indigo-100 dark:hover:bg-indigo-900'}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalMemberPages }, (_, i) => i + 1).map(page => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                                                isActive={page === currentPage}
                                                className={page === currentPage ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600' : 'text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalMemberPages, prev + 1)); }}
                                            disabled={currentPage === totalMemberPages || totalMemberPages === 0}
                                            className={currentPage === totalMemberPages || totalMemberPages === 0 ? 'pointer-events-none opacity-50' : 'hover:bg-indigo-100 dark:hover:bg-indigo-900'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* --- Edit Member Modal (AESTHETICALLY ENHANCED) --- */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
    <DialogContent className="max-w-[95vw] lg:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border-t-4 border-indigo-500 [&>button]:hidden"> 
        {/* Note: [&>button]:hidden removes the default tiny 'X' so we can use our custom one below */}
        
        <DialogHeader className="relative">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <DialogTitle className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                            <Edit2 className="w-7 h-7" />
                        </motion.div>
                        Update Member Record
                    </DialogTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Editing: {editFormData.first_name} {editFormData.last_name} (ID: {editFormData.member_id})
                    </p>
                </div>

                {/* --- CUSTOM CLOSE BUTTON --- */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEditModal(false)}
                    className="rounded-full h-10 w-10 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:text-gray-400 transition-all duration-200"
                >
                    <X className="w-6 h-6" />
                </Button>
            </div>
        </DialogHeader>
                    

                    {/* Tabs for organization - Now using 2 tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner">
                            <TabsTrigger
                                value="personal"
                                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-semibold transition-all text-gray-700 dark:text-gray-300 dark:data-[state=active]:bg-indigo-500 rounded-lg py-2"
                            >
                                <User className="w-4 h-4 mr-2" /> Personal & Household
                            </TabsTrigger>
                            <TabsTrigger
                                value="church"
                                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-semibold transition-all text-gray-700 dark:text-gray-300 dark:data-[state=active]:bg-indigo-500 rounded-lg py-2"
                            >
                                <Calendar className="w-4 h-4 mr-2" /> Church Details
                            </TabsTrigger>
                        </TabsList>

                        {/* Personal Info Tab (Now including Household) */}
                        <TabsContent value="personal" className="mt-6 space-y-6">
                            {/* Basic Information */}
                            <Card className="p-6 shadow-md border-t-4 border-indigo-300 dark:border-indigo-700">
                                <CardTitle className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">Basic Information</CardTitle>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="font-semibold text-indigo-600 dark:text-indigo-400">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="first_name"
                                            value={editFormData.first_name || ""}
                                            onChange={handleEditChange}
                                            // FIX: Dark mode styling for Input
                                            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="font-semibold text-indigo-600 dark:text-indigo-400">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="last_name"
                                            value={editFormData.last_name || ""}
                                            onChange={handleEditChange}
                                            // FIX: Dark mode styling for Input
                                            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber" className="font-semibold text-indigo-600 dark:text-indigo-400">Contact Number</Label>
                                        <Input
                                            id="contactNumber"
                                            name="contact_number"
                                            value={editFormData.contact_number || ""}
                                            onChange={handleEditChange}
                                            // FIX: Dark mode styling for Input
                                            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dateOfBirth" className="font-semibold text-indigo-600 dark:text-indigo-400">Date of Birth</Label>
                                        <Input
                                            id="dateOfBirth"
                                            type="date"
                                            name="date_of_birth"
                                            value={editFormData.date_of_birth || ""}
                                            onChange={handleEditChange}
                                            // FIX: Dark mode styling for Input
                                            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:[color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maritalStatus" className="font-semibold text-indigo-600 dark:text-indigo-400">Marital Status</Label>
                                        <Select
                                            value={editFormData.marital_status || ""}
                                            onValueChange={(val) => handleSelectChange("marital_status", val)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                {['Single', 'Married', 'Couples', 'Widowed/Widower'].map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gender" className="font-semibold text-indigo-600 dark:text-indigo-400">Gender</Label>
                                        {/* changed to work with the backend
                                        <Select
                                            value={editFormData.gender || ""}
                                            onValueChange={(val) => handleSelectChange("gender", val)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                {['Male', 'Female', 'Other'].map(gender => (
                                                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>*/}
                                        <Select
                                            value={editFormData.gender || ""}
                                            onValueChange={(val) =>
                                                setEditFormData((prev) => ({ ...prev, gender: val }))
                                            }
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>

                                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                {genders.map(({ label, value }) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                    </div>
                                </div>
                            </Card>

                            {/* Address Details */}
                            <Card className="p-6 shadow-md border-t-4 border-indigo-300 dark:border-indigo-700">
                                <CardTitle className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">Address Details</CardTitle>
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="font-semibold text-indigo-600 dark:text-indigo-400">Full Address</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        value={editFormData.address || ""}
                                        onChange={handleEditChange}
                                        rows={3}
                                        placeholder="123 Main St, City, Province"
                                        // FIX: Dark mode styling for Textarea
                                        className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                    />
                                </div>
                            </Card>

                            {/* Household Members (MOVED HERE) */}
                            <Card className="p-6 shadow-md border-t-4 border-blue-500 dark:border-blue-600 bg-blue-50/50 dark:bg-gray-700/50">
                                <CardTitle className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400 flex justify-between items-center">
                                    Household Members
                                    <Button type="button" size="sm" onClick={handleAddHouseholdMember} className="bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md">
                                        <Plus className="w-4 h-4 mr-1" /> Add Member
                                    </Button>
                                </CardTitle>
                                <div className="space-y-4">
                                    {(editFormData.household_members || []).map((member, index) => (
                                        <div key={member.id} className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-12 gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-blue-200 dark:border-blue-700">
                                            <div className="space-y-1 lg:col-span-4">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                                                <Input
                                                    value={member.name}
                                                    onChange={(e) => handleHouseholdMemberChange(member.id, 'name', e.target.value)}
                                                    placeholder="Full Name"
                                                    // FIX: Dark mode styling for Input
                                                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                            <div className="space-y-1 lg:col-span-3">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</Label>
                                                <Input
                                                    value={member.relationship}
                                                    onChange={(e) => handleHouseholdMemberChange(member.id, 'relationship', e.target.value)}
                                                    placeholder="Spouse, Child, Parent"
                                                    // FIX: Dark mode styling for Input
                                                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                                />
                                            </div>
                                            <div className="space-y-1 lg:col-span-3">
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</Label>
                                                <Input
                                                    type="date"
                                                    value={member.date_of_birth}
                                                    onChange={(e) => handleHouseholdMemberChange(member.id, 'date_of_birth', e.target.value)}
                                                    // FIX: Dark mode styling for Input
                                                    className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:[color-scheme:dark]"
                                                />
                                            </div>
                                            <div className="flex items-end pt-2 sm:pt-0 lg:col-span-2 justify-end">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveHouseholdMember(member.id)} className="border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-700 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {(editFormData.household_members || []).length === 0 && (
                                        <div className="text-center py-4 border border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-gray-500 dark:text-gray-400">
                                            Click "Add Member" to list dependents or cohabitants.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>

                        {/* Church Details Tab (Now including Trainings & Ministries) */}
                        <TabsContent value="church" className="mt-6 space-y-6">
                            {/* Attendance & Invitation */}
                            <Card className="p-6 shadow-md border-t-4 border-indigo-500 dark:border-indigo-600 bg-indigo-50/50 dark:bg-gray-700/50">
                                <CardTitle className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">Attendance & Invitation</CardTitle>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dateAttended" className="font-medium text-gray-700 dark:text-gray-300">First Date Attended</Label>
                                        <Input
                                            id="dateAttended"
                                            type="month" //changed from date to month to work with backend
                                            name="date_attended"
                                            value={editFormData.date_attended || ""}
                                            onChange={handleEditChange}
                                            // FIX: Dark mode styling for Input
                                            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:[color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="invitedBy" className="font-medium text-gray-700 dark:text-gray-300">Invited By (Full Name)</Label>
                                        <Input
                                            id="invitedBy"
                                            name="invited_by"
                                            value={editFormData.invited_by || ""}
                                            onChange={handleEditChange}
                                            placeholder="Pastor Mark / Michael Chen"
                                            // FIX: Dark mode styling for Input
                                            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Previous Church History - FINAL ALIGNMENT FIX */}
                            <Card className="p-6 shadow-md border-t-4 border-purple-500 dark:border-purple-600 bg-purple-50/50 dark:bg-gray-700/50">
                                <CardTitle className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">Previous Church History</CardTitle>
                                {/* Using grid-cols-3 for 1/3 and 2/3 split and consistency */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 col-span-1 flex flex-col"> {/* Use flex-col to force alignment of label and field */}
                                        <Label htmlFor="prevChurchAttendee" className="font-medium text-gray-700 dark:text-gray-300">Attended previous church?</Label>
                                        <Select
                                            value={editFormData.prev_church_attendee ? 'true' : 'false'}
                                            onValueChange={(val) => handleBooleanToggle("prev_church_attendee", val)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2 flex flex-col">
    <Label 
        htmlFor="prevChurch" 
        className="font-medium text-gray-700 dark:text-gray-300 transition-opacity duration-300"
    >
        Previous Church Name
        {/* Magpapakita ang asterisk (*) kapag Yes ang sagot */}
        {editFormData.prev_church_attendee && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
        id="prevChurch"
        name="prev_church"
        value={editFormData.prev_church || ""}
        onChange={handleEditChange}
        // Magiging required lamang kung ang attendee status ay true (Yes)
        required={editFormData.prev_church_attendee}
        disabled={!editFormData.prev_church_attendee}
        className={`dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 transition-all duration-300 ${
            !editFormData.prev_church_attendee ? 'opacity-50' : 'border-purple-300 focus:border-purple-500'
        }`}
        placeholder={editFormData.prev_church_attendee ? "Enter previous church name" : ""}
    />
</div>
                                </div>
                            </Card>

                            {/* Consolidation & Status - FINAL ALIGNMENT FIX */}
                            <Card className="p-6 shadow-md border-t-4 border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-gray-700/50">
                                <CardTitle className="text-xl font-bold mb-4 text-green-700 dark:text-green-400">Consolidation & Status</CardTitle>

                                {/* Row 1: 1/4 (Select), 2/4 (Input), 1/4 (Select) */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-2 col-span-1 flex flex-col"> {/* Use flex-col */}
                                        <Label htmlFor="attendingCellGroup" className="font-medium text-gray-700 dark:text-gray-300">Attending Cell Group?</Label>
                                        <Select
                                            value={editFormData.attending_cell_group ? 'true' : 'false'}
                                            onValueChange={(val) => handleBooleanToggle("attending_cell_group", val)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-1 md:col-span-2 flex flex-col">
    <Label 
        htmlFor="cellLeaderName" 
        className="font-medium text-gray-700 dark:text-gray-300 transition-opacity duration-300"
    >
        Cell Leader Name
        {/* Magpapakita ng red asterisk (*) kapag Yes ang pinili */}
        {editFormData.attending_cell_group && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
        id="cellLeaderName"
        name="cell_leader_name"
        value={editFormData.cell_leader_name || ""} 
        onChange={handleEditChange}
        // Magiging required lang ang field na ito kapag naka-Yes (true) ang checkbox/select
        required={editFormData.attending_cell_group}
        disabled={!editFormData.attending_cell_group}
        className={`dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ${
            !editFormData.attending_cell_group ? 'opacity-50' : 'border-indigo-300 focus:border-indigo-500'
        }`}
        placeholder={editFormData.attending_cell_group ? "Enter leader's name" : ""}
    />
</div>
                                    <div className="space-y-2 col-span-1 flex flex-col"> {/* Use flex-col */}
                                        <Label htmlFor="memberStatus" className="font-medium text-gray-700 dark:text-gray-300">Member Status</Label>
                                        <Select
                                            value={editFormData.member_status || 'Active'}
                                            onValueChange={(val) => handleSelectChange("member_status", val)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                <SelectItem value="Active">Active</SelectItem>
                                                <SelectItem value="Inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Row 2: 1/4 (Select), 1/4 (Select), 2/4 (Input) */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    <div className="space-y-2 flex flex-col"> {/* Use flex-col */}
                                        <Label htmlFor="waterBaptized" className="font-medium text-gray-700 dark:text-gray-300">Water Baptized?</Label>
                                        <Select
                                            value={editFormData.water_baptized ? 'true' : 'false'}
                                            onValueChange={(val) => handleBooleanToggle("water_baptized", val)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 flex flex-col"> {/* Use flex-col */}
                                        <Label htmlFor="consolidation" className="font-medium text-gray-700 dark:text-gray-300">Consolidation</Label>
                                        <Select
                                            value={editFormData.consolidation || 'No'}
                                            onValueChange={(val) => handleSelectChange("consolidation", val)}
                                        >
                                            <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2 col-span-2 flex flex-col"> {/* Use flex-col */}
                                        <Label htmlFor="reason" className="font-medium text-gray-700 dark:text-gray-300">Reason for Inactivity/Other</Label>
                                        <Input
                                            id="reason"
                                            name="reason"
                                            value={editFormData.reason || ""}
                                            onChange={handleEditChange}
                                            // FIX: Dark mode styling for Input
                                            className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Spiritual Trainings */}
                            <Card className="p-6 shadow-md border-t-4 border-purple-500 dark:border-purple-600 bg-purple-50/50 dark:bg-gray-700/50">
                                <CardTitle className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-400">Spiritual Trainings & Readiness</CardTitle>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {trainings.map(training => (
                                        <div key={training} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700">
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`training-${training}`}
                                                    checked={!!editFormData.spiritual_trainings?.[training]}
                                                    onCheckedChange={() => toggleTraining(training)}
                                                    className="border-purple-500 data-[state=checked]:bg-purple-600 data-[state=checked]:text-white transition-colors"
                                                />
                                                <Label htmlFor={`training-${training}`} className="flex-1 font-medium text-gray-700 dark:text-gray-300">{training}</Label>
                                            </div>
                                            {editFormData.spiritual_trainings?.[training] && (
                                                <Input
                                                    type="number"
                                                    placeholder="Year"
                                                    value={editFormData.spiritual_trainings?.[`${training}Year`] || ""}
                                                    onChange={(e) => handleTrainingYearChange(training, e.target.value)}
                                                    // FIX: Dark mode styling for Input
                                                    className="w-24 h-9 text-sm text-center border-purple-300 dark:border-purple-600 dark:bg-gray-700 dark:text-gray-200"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 space-y-2 border-t pt-4 border-purple-200 dark:border-purple-700">
                                    <Label htmlFor="willingTraining" className="font-medium text-gray-700 dark:text-gray-300">Willing to undergo further training?</Label>
                                    <Select
                                        value={editFormData.willing_training ? 'true' : 'false'}
                                        onValueChange={(val) => handleBooleanToggle("willing_training", val)}
                                    >
                                        <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                            <SelectItem value="true">Yes</SelectItem>
                                            <SelectItem value="false">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </Card>

                            {/* Church Ministries */}
<Card className="p-6 shadow-md border-t-4 border-yellow-500 dark:border-yellow-600 bg-yellow-50/50 dark:bg-gray-700/50">
    <CardTitle className="text-xl font-bold mb-4 text-yellow-700 dark:text-yellow-400">Involved Church Ministries</CardTitle>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ministries.map(ministry => (
            <div key={ministry} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Checkbox
                    id={`ministry-${ministry}`}
                    checked={editFormData.church_ministry?.includes(ministry)}
                    onCheckedChange={() => toggleMinistry(ministry)}
                    className="border-yellow-500 data-[state=checked]:bg-yellow-600 data-[state=checked]:text-white transition-colors"
                />
                <Label htmlFor={`ministry-${ministry}`} className="font-medium text-sm text-gray-700 dark:text-gray-300">{ministry}</Label>
            </div>
        ))}
    </div>

    {/* SHOW INPUT IF "Others" IS SELECTED */}
    {editFormData.church_ministry?.includes("Others") && (
        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label htmlFor="otherMinistryDetails" className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                Specify Ministry Details
            </Label>
            <Input
                id="otherMinistryDetails"
                name="other_ministry_details"
                placeholder="Type ministry name..."
                value={editFormData.other_ministry_details || ""}
                onChange={handleEditChange}
                className="flex w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-3 py-2.5 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-300 dark:text-gray-200"
            />
        </div>
    )}
</Card>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                            className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSubmit}
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl px-6 transition-transform transform hover:scale-[1.02] disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Edit2 className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}