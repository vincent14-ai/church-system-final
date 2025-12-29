import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
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
import { Users, Download, Search, Filter, Plus, Trash2, User, Loader2, X, Edit2, ChevronLeft, ChevronRight, Hash, Calendar, Heart, Home, BookOpen, CheckCircle, ListChecks, Sun, Moon, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from "sonner";
//import axios
import axios from 'axios';


/**
 * Utility functions for data parsing and formatting.
 */
function parseChurchMinistry(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        return value.split(/\s*(?:,\s*|\s*-\s*)\s*/).filter(Boolean).map(s => s.trim());
    }
    return [];
}

function parseHouseholds(householdsString) {
    if (!householdsString) return [];
    return householdsString.split(";").map((item) => {
        const trimmed = item.trim();
        if (!trimmed) return null;
        const match = trimmed.match(/^(.*?)\s*-\s*(.*?)\s*\(((\d{4})-(\d{2})-(\d{2}))\)$/);
        if (match) {
            const [, name, relationship, , year, month, day] = match;
            const date_of_birth = `${year}-${month}-${day}`;
            return { id: Math.random().toString(36).substring(2, 9), name: name.trim(), relationship: relationship.trim(), date_of_birth };
        }
        return null;
    }).filter(Boolean);
};

function formatHouseholds(householdMembersArray) {
    if (!householdMembersArray || householdMembersArray.length === 0) return null;
    return householdMembersArray.map(member => {
        if (member.name && member.relationship && member.date_of_birth) {
            return `${member.name.trim()} - ${member.relationship.trim()} (${member.date_of_birth})`;
        }
        return null;
    }).filter(Boolean).join("; ");
}

function parseTrainings(trainingsString) {
    if (!trainingsString) return {};
    if (typeof trainingsString === "object") return trainingsString;
    const result = {};
    trainingsString.split(",").forEach((item) => {
        const match = item.trim().match(/^(.*?)\s*\(((\d{4}))\)$/);
        if (match) {
            const [_, training, year] = match;
            result[training.trim()] = true;
            result[`${training.trim()}Year`] = year;
        } else {
            const trainingName = item.trim();
            if (trainingName) {
                result[trainingName] = true;
            }
        }
    });
    return result;
};

function formatTrainings(trainingsObj) {
    if (!trainingsObj) return "";
    return Object.entries(trainingsObj)
        .filter(([key, value]) => value === true && !key.endsWith("Year") && key !== "willing_training")
        .map(([key]) => {
            const year = trainingsObj[`${key}Year`];
            return year ? `${key} (${year})` : key;
        })
        .join(", ");
};

function formatDate(dateString, includeTime = false) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        return dateString;
    }
}

//additional data for gender
    const genders = [
        { label: "Male", value: "M" },
        { label: "Female", value: "F" },
    ];

// --- Edit Modal Component (EXTRACTED for performance fix) ---
const EditModal = ({
    showEditModal,
    setShowEditModal,
    editFormData,
    selectedMember,
    isSubmitting,
    handleEditChange,
    handleSelectChange,
    handleBooleanToggle,
    handleEditSubmit,
    ministries,
    trainings,
    toggleMinistry,
    toggleTraining,
    handleTrainingYearChange,
    handleAddHouseholdMember,
    handleHouseholdMemberChange,
    handleRemoveHouseholdMember,
}) => {
    // Local state for Tabs
    const [activeTab, setActiveTab] = useState("personal");

    // Reset tab when modal opens/closes
    useEffect(() => {
        if (showEditModal) {
            setActiveTab("personal");
        }
    }, [showEditModal]);

    // Ensure editFormData is not null before rendering form elements
    if (!editFormData || !selectedMember) return null;

    return (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
            {/* FIX: Removed unconditional dark classes from DialogContent. The theme is applied by the parent div wrapper in Reports.js */}
            <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 border-indigo-200 dark:border-indigo-700 shadow-2xl p-6 rounded-xl">
                <DialogHeader className="border-b border-indigo-200 dark:border-indigo-700/50 pb-4">
                    <DialogTitle className="text-3xl font-extrabold flex items-center gap-3 text-purple-600 dark:text-purple-400">
                        <Edit2 className="w-6 h-6" /> Update Member Record
                    </DialogTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Editing: {editFormData.first_name} {editFormData.last_name} (ID: {selectedMember})
                    </p>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-lg">
                        <TabsTrigger
                            value="personal"
                            className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 transition-all rounded-md"
                        >
                            <User className="w-4 h-4" /> Personal & Household
                        </TabsTrigger>
                        <TabsTrigger
                            value="church"
                            className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/30 transition-all rounded-md"
                        >
                            <BookOpen className="w-4 h-4" /> Church Details
                        </TabsTrigger>
                    </TabsList>

                    {/* --- TAB 1: Personal & Household --- */}
                    <TabsContent value="personal" className="mt-4 space-y-6">
                        {/* Basic Information Card */}
                        {/* FIX: Card background and border are now conditional */}
                        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-purple-300 dark:border-purple-700 shadow-xl space-y-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Basic Information
                            </CardTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-300">First Name</Label>
                                    {/* FIX: Input colors are now conditional */}
                                    <Input id="first_name" name="first_name" value={editFormData.first_name || ""} onChange={handleEditChange} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                                    <Input id="last_name" name="last_name" value={editFormData.last_name || ""} onChange={handleEditChange} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact_number" className="text-gray-700 dark:text-gray-300">Contact Number</Label>
                                    <Input id="contact_number" name="contact_number" value={editFormData.contact_number || ""} onChange={handleEditChange} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth" className="text-gray-700 dark:text-gray-300">Date of Birth</Label>
                                    <Input id="date_of_birth" name="date_of_birth" type="date" value={editFormData.date_of_birth || ""} onChange={handleEditChange} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:[color-scheme:dark]" />
                                </div>

                                {/* Marital Status Dropdown FIX */}
                                <div className="space-y-2">
                                    <Label htmlFor="marital_status" className="text-gray-700 dark:text-gray-300">Marital Status</Label>
                                    <Select value={editFormData.marital_status || ""} onValueChange={(val) => handleSelectChange('marital_status', val)}>
                                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue placeholder="Select Status" /></SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"> {/* FIX: Light mode background */}
                                            {['Single', 'Married', 'Couples', 'Widowed/Widower'].map(s =>
                                                <SelectItem key={s} value={s} className="text-gray-900 dark:text-white">
                                                    {s}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Gender Dropdown FIX */}
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-gray-700 dark:text-gray-300">Gender</Label>
                                    {/*changed to work with backend
                                    <Select value={editFormData.gender || ""} onValueChange={(val) => handleSelectChange('gender', val)}>
                                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"> {/* FIX: Light mode background 
                                            {['Male', 'Female', 'Other'].map(g =>
                                                <SelectItem key={g} value={g} className="text-gray-900 dark:text-white">
                                                    {g}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>*/}
                                    <Select
                                        value={editFormData.gender || ""}
                                        onValueChange={(val) =>
                                            handleSelectChange("gender", val)
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

                        {/* Address Details Card */}
                        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-purple-300 dark:border-purple-700 shadow-xl space-y-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Address Details
                            </CardTitle>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Full Address</Label>
                                <Textarea id="address" name="address" value={editFormData.address || ""} onChange={handleEditChange} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white min-h-[100px]" />
                            </div>
                        </Card>

                        {/* Household Members Card */}
                        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-purple-300 dark:border-purple-700 shadow-xl space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                <CardTitle className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                    Household Members
                                </CardTitle>
                                <Button type="button" size="sm" onClick={handleAddHouseholdMember} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                                    <Plus className="w-4 h-4" /> Add Member
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {(editFormData.household_members || []).length === 0 ? (
                                    <div className="text-center text-gray-500 dark:text-gray-500 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                        Click "Add Member" to list dependents or cohabitants.
                                    </div>
                                ) : (
                                    (editFormData.household_members || []).map((member, index) => (
                                        <Card key={member.id} className="p-4 bg-white dark:bg-gray-700 border border-indigo-300 dark:border-indigo-500 relative">
                                            <h5 className="text-sm font-bold mb-2 text-indigo-600 dark:text-indigo-300">Member #{index + 1}</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500 dark:text-gray-400">Name</Label>
                                                    <Input
                                                        value={member.name || ""}
                                                        onChange={(e) => handleHouseholdMemberChange(member.id, 'name', e.target.value)}
                                                        placeholder="Full Name"
                                                        className="bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500 dark:text-gray-400">Relationship</Label>
                                                    <Input
                                                        value={member.relationship || ""}
                                                        onChange={(e) => handleHouseholdMemberChange(member.id, 'relationship', e.target.value)}
                                                        placeholder="Spouse, Child, Sibling"
                                                        className="bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</Label>
                                                    <Input
                                                        type="date"
                                                        value={member.date_of_birth || ""}
                                                        onChange={(e) => handleHouseholdMemberChange(member.id, 'date_of_birth', e.target.value)}
                                                        className="bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white dark:[color-scheme:dark]"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveHouseholdMember(member.id)}
                                                className="absolute top-2 right-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </Card>
                    </TabsContent>

                    {/* --- TAB 2: Church Details --- */}
                    <TabsContent value="church" className="mt-4 space-y-6">

                        {/* Attendance & Invitation Card */}
                        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-purple-300 dark:border-purple-700 shadow-xl space-y-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Attendance & Invitation
                            </CardTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date_attended" className="text-gray-700 dark:text-gray-300">First Date Attended</Label>
                                    <Input id="date_attended" name="date_attended" type="month" value={editFormData.date_attended || ""} onChange={handleEditChange} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:[color-scheme:dark]" /> {/*changed date to month*/}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invited_by" className="text-gray-700 dark:text-gray-300">Invited By (Full Name)</Label>
                                    <Input id="invited_by" name="invited_by" value={editFormData.invited_by || ""} onChange={handleEditChange} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                            </div>
                        </Card>

                        {/* Previous Church History Card */}
                        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-purple-300 dark:border-purple-700 shadow-xl space-y-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Previous Church History
                            </CardTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="prev_church_attendee" className="text-gray-700 dark:text-gray-300">Attended previous church?</Label>
                                    <Select
                                        value={editFormData.prev_church_attendee ? 'true' : 'false'}
                                        onValueChange={(val) => handleBooleanToggle('prev_church_attendee', val)}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"> {/* FIX: Light mode background */}
                                            <SelectItem value="true" className="text-gray-900 dark:text-white">Yes</SelectItem>
                                            <SelectItem value="false" className="text-gray-900 dark:text-white">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="prev_church" className="text-gray-700 dark:text-gray-300">Previous Church Name</Label>
                                    <Input id="prev_church" name="prev_church" value={editFormData.prev_church || ""} onChange={handleEditChange} disabled={!editFormData.prev_church_attendee} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50" />
                                </div>
                            </div>
                        </Card>

                        {/* Consolidation & Status Card */}
                        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-purple-300 dark:border-purple-700 shadow-xl space-y-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-purple-600 dark:text-purple-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Consolidation & Status
                            </CardTitle>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="attending_cell_group" className="text-gray-700 dark:text-gray-300">Attending Cell Group?</Label>
                                    <Select
                                        value={editFormData.attending_cell_group ? 'true' : 'false'}
                                        onValueChange={(val) => handleBooleanToggle('attending_cell_group', val)}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"> {/* FIX: Light mode background */}
                                            <SelectItem value="true" className="text-gray-900 dark:text-white">Yes</SelectItem>
                                            <SelectItem value="false" className="text-gray-900 dark:text-white">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
    <Label htmlFor="cell_leader_name" className="text-gray-700 dark:text-gray-300">
        Cell Leader Name
    </Label>
    <Input 
        id="cell_leader_name" 
        name="cell_leader_name" 
        // Ensure this fallback || "" is present to prevent 'uncontrolled' input warnings
        value={editFormData.cell_leader_name || ""} 
        onChange={handleEditChange} 
        disabled={!editFormData.attending_cell_group} 
        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50" 
    />
</div>
                                <div className="space-y-2">
                                    <Label htmlFor="member_status" className="text-gray-700 dark:text-gray-300">Member Status</Label>
                                    <Select value={editFormData.member_status || ""} onValueChange={(val) => handleSelectChange('member_status', val)}>
                                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"> {/* FIX: Light mode background */}
                                            <SelectItem value="Active" className="text-gray-900 dark:text-white">Active</SelectItem>
                                            <SelectItem value="Inactive" className="text-gray-900 dark:text-white">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="water_baptized" className="text-gray-700 dark:text-gray-300">Water Baptized?</Label>
                                    <Select
                                        value={editFormData.water_baptized ? 'true' : 'false'}
                                        onValueChange={(val) => handleBooleanToggle('water_baptized', val)}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"> {/* FIX: Light mode background */}
                                            <SelectItem value="true" className="text-gray-900 dark:text-white">Yes</SelectItem>
                                            <SelectItem value="false" className="text-gray-900 dark:text-white">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="consolidation" className="text-gray-700 dark:text-gray-300">Consolidation</Label>
                                    <Select value={editFormData.consolidation || 'N/A'} onValueChange={(val) => handleSelectChange('consolidation', val)}>
                                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"> {/* FIX: Light mode background */}
                                            <SelectItem value="Yes" className="text-gray-900 dark:text-white">Yes</SelectItem>
                                            <SelectItem value="No" className="text-gray-900 dark:text-white">No</SelectItem>
                                            <SelectItem value="N/A" className="text-gray-900 dark:text-white">N/A</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reason" className="text-gray-700 dark:text-gray-300">Reason(Optional)</Label>
                                    <Input id="reason" name="reason" value={editFormData.reason || ""} onChange={handleEditChange} className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" />
                                </div>
                            </div>
                        </Card>

                        {/* Spiritual Trainings & Readiness Card */}
                        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-yellow-300 dark:border-yellow-700 shadow-xl space-y-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-yellow-600 dark:text-yellow-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Spiritual Trainings & Readiness
                            </CardTitle>
                            <div className="grid grid-cols-2 gap-4">
                                {trainings.map((training) => (
                                    <div key={training} className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 p-2 rounded-md border border-gray-300 dark:border-gray-600">
                                        <Checkbox
                                            id={training}
                                            checked={!!editFormData.spiritual_trainings?.[training]}
                                            onCheckedChange={() => toggleTraining(training)}
                                            className="h-4 w-4 rounded text-yellow-600 dark:text-yellow-500 border-yellow-400 dark:border-yellow-500"
                                        />
                                        <Label htmlFor={training} className="font-medium flex-grow text-gray-700 dark:text-gray-200">
                                            {training}
                                        </Label>
                                        {editFormData.spiritual_trainings?.[training] && (
                                            <Input
                                                type="number"
                                                placeholder="Year"
                                                value={editFormData.spiritual_trainings?.[`${training}Year`] || new Date().getFullYear().toString()}
                                                onChange={(e) => handleTrainingYearChange(training, e.target.value)}
                                                className="w-20 h-8 text-xs bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
                                <Label htmlFor="willing_training" className="font-medium text-gray-700 dark:text-gray-300">Willing to undergo further training?</Label>
                                <Select
                                    value={editFormData.willing_training ? 'true' : 'false'}
                                    onValueChange={(val) => handleBooleanToggle('willing_training', val)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"> {/* FIX: Light mode background */}
                                        <SelectItem value="true" className="text-gray-900 dark:text-white">Yes</SelectItem>
                                        <SelectItem value="false" className="text-gray-900 dark:text-white">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </Card>

                        {/* Involved Church Ministries Card */}
                        <Card className="p-6 bg-gray-50 dark:bg-gray-800 border border-orange-300 dark:border-orange-700 shadow-xl space-y-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-orange-600 dark:text-orange-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Involved Church Ministries
                            </CardTitle>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {ministries.map(ministry => (
                                    <div key={ministry} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={ministry}
                                            checked={editFormData.church_ministry?.includes(ministry)}
                                            onCheckedChange={() => toggleMinistry(ministry)}
                                            className="h-4 w-4 rounded text-orange-600 dark:text-orange-500 border-orange-400 dark:border-orange-500"
                                        />
                                        <Label htmlFor={ministry} className="text-gray-700 dark:text-gray-200">{ministry}</Label>
                                    </div>
                                ))}
                            </div>

                             {/* SHOW INPUT IF "Others" IS SELECTED */}
                                {editFormData.church_ministry?.includes("Others") && (
                                    <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label htmlFor="otherMinistryDetails" className="text-sm font-semibold text-yellow-700 dark:text-orange-400">
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

                <DialogFooter className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-end gap-3">
                    <Button
                        onClick={() => setShowEditModal(false)}
                        variant="outline"
                        className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEditSubmit}
                        disabled={isSubmitting}
                        className="bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-lg shadow-purple-500/30"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Edit2 className="mr-2 h-4 w-4" />
                        )}
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- End of Edit Modal Component ---

// Main Reports Component
export const Reports = ({ isDark, onToggleTheme }) => {
    // --- Member Records State ---
    const [members, setMembers] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); //remove hardcoded data
    const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMinistry, setSelectedMinistry] = useState("all");
    const [selectedTraining, setSelectedTraining] = useState("all");
    const [selectedBirthMonth, setSelectedBirthMonth] = useState("all"); 
    const [selectedWaterBaptized, setSelectedWaterBaptized] = useState("all");
    const [selectedMaritalStatus, setSelectedMaritalStatus] = useState("all");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // --- Attendance Records State ---
    const [attendanceRecords, setRecords] = useState("");
    const [attendanceDate, setAttendanceDate] = useState("");
    const [attendanceSearchTerm, setAttendanceSearchTerm] = useState("");

    // --- General State ---
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeMainTab, setActiveMainTab] = useState("members");

    const rowsPerPage = 10;

    const startIndex = (currentPage - 1) * rowsPerPage;

    const currentMemberRows = members.slice(startIndex, startIndex + rowsPerPage);
    const totalMemberPages = Math.ceil(members.length / rowsPerPage);

    const currentAttendanceRows = attendanceRecords.slice(startIndex, startIndex + rowsPerPage);
    const totalAttendancePages = Math.ceil(attendanceRecords.length / rowsPerPage);

    
    const [selectedMember, setSelectedMember] = useState(null);
    const [editFormData, setEditFormData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ministries = ["Media", "Praise Team", "Content Writer", "Ushering", "Kids Ministry", "Technical", "Others"];
    const trainings = ["Life Class", "SOL 1", "SOL 2", "SOL 3"];

    const fileInputRef = useRef(null);

    

    //const API = MOCK_API; 

    // --- Data Fetching Logic for Member Records ---
    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            //change API back to axios
            const res = await axios.get("http://localhost:5000/api/members", {
                params: {
                    search: searchTerm,
                    age_group: selectedAgeGroup,
                    member_status: selectedStatus,
                    church_ministry: selectedMinistry,
                    spiritual_trainings: selectedTraining ? [selectedTraining] : [],
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
            toast.error("Failed to load member records.");
        } finally {
            setIsLoading(false);
        }
    };
    /*
    // --- Data Fetching Logic for Attendance Records ---
    const fetchAttendance = async () => {
        setIsLoading(true);
        try {
            //change API back to axios
            const res = await axios.get("http://localhost:5000/api/attendance", { 
                params: {
                    date: attendanceDate,
                    search: attendanceSearchTerm, 
                },
            });
            setAttendanceRecords(res.data);
            setCurrentPage(1); 
        } catch (err) {
            console.error("Error fetching attendance:", err);
            toast.error("Failed to load attendance records.");
        } finally {
            setIsLoading(false);
        }
    };
    */

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

    const fetchFilteredAttendance = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/attendance/filter", {
                params: {
                    search: attendanceSearchTerm,
                    ageGroup: "all",
                    status: "all",
                    dateFrom: attendanceDate,
                    dateTo: attendanceDate
                }
            });
            setRecords(res.data.records);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching attendance:", err);
            toast.error("Failed to load attendance records.");
        } finally {
            setIsLoading(false);
        }
    };


    // --- Effect to load data based on active tab ---
    useEffect(() => {
        setCurrentPage(1);

        if (activeMainTab === 'members') {
            fetchMembers();
        } else if (activeMainTab === 'attendance') {
            fetchFilteredAttendance();
        }
    }, [activeMainTab]);

    // --- Filter Handlers ---
    const handleApplyMemberFilters = () => {
        fetchMembers();
    };

    const handleClearMemberFilters = () => {
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
        setTimeout(fetchMembers, 50);
    };

    // --- Filter Handlers for Attendance ---
    const handleApplyAttendanceFilters = () => {
        fetchFilteredAttendance();
    };

    const handleClearAttendanceFilters = () => {
        setAttendanceDate("");
        setAttendanceSearchTerm("");
        setTimeout(fetchFilteredAttendance, 50);
    };

    // --- Utility Helpers for Rendering ---
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600 text-white">Active</Badge>;
            case 'Inactive':
                return <Badge variant="secondary" className="bg-red-400 hover:bg-red-500 dark:bg-red-800 dark:hover:bg-red-700 text-white">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

   const getAttendanceBadge = (status) => {
    // Ginagawa nating lowercase ang status para laging match sa switch case
    const currentStatus = status?.toLowerCase();

    switch (currentStatus) {
        case 'present':
            return (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-3">
                    Present
                </Badge>
            );
        case 'absent':
            return (
                <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none px-3">
                    Absent
                </Badge>
            );
        default:
            return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
};


    // --- Modal Logic ---
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
        const { name, value, type } = e.target;
        if (type !== 'checkbox') {
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (name, value) => {
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBooleanToggle = (name, value) => {
    const boolValue = value === 'true';

    setEditFormData((prev) => {
        // Create a copy of the previous state with the new toggle value
        const updatedState = { ...prev, [name]: boolValue };

        // 1. Logic for Previous Church
        if (name === 'prev_church_attendee' && !boolValue) {
            updatedState.prev_church = ""; 
        }

        // 2. Logic for Cell Group
        if (name === 'attending_cell_group' && !boolValue) {
            updatedState.cell_leader_name = "";
        }

        return updatedState;
    });
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
            //changed API to axios
            const res = await axios.delete(`http://localhost:5000/api/members/${member_id}`);
            fetchMembers();
            if (res.status !== 200) throw new Error("Failed to delete member");

            // Remove deleted member from local state
            setMembers((prev) => prev.filter((m) => m.member_id !== member_id));
            toast.success("Member deleted successfully!");
            if (currentMemberRows.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
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

        // Prepare the new state object
        const updatedState = { ...prev, church_ministry: next };

        // If "Others" was just removed, clear the details field
        if (ministry === "Others" && exists) {
            updatedState.other_ministry_details = "";
        }

        return updatedState;
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
                        [training]: true,
                        [`${training}Year`]: new Date().getFullYear().toString()
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

    //export members report
    const handleExportPost = async () => {
        try {
            const filters = {
                age_group: selectedAgeGroup,
                member_status: selectedStatus,
                date_from: startDate,
                date_to: endDate,
                birth_month: selectedBirthMonth !== 'all' ? Number(selectedBirthMonth) : undefined, // added birth_month filter
                church_ministry: selectedMinistry !== 'all' ? selectedMinistry : undefined, //added ministry filter
                water_baptized: selectedWaterBaptized !== 'all' ? (selectedWaterBaptized === 'true') : undefined, //added water baptized filter
                marital_status: selectedMaritalStatus !== 'all' ? selectedMaritalStatus : undefined, //added marital status filter
                spiritual_trainings: selectedTraining !== 'all' ? [selectedTraining] : undefined, // fix on going


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
            const filters = {
                search: attendanceSearchTerm,
                dateFrom: attendanceDate,
                dateTo: attendanceDate,
            };

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
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
        }
    };

    

    // --- Component for Member Records ---
    const renderMemberRecords = () => (
        <>
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

            {/* Filter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

                {/* 1. Age Group (Existing) */}
                <div className="space-y-2">
                    <Label htmlFor="ageGroup" className="text-gray-700 dark:text-gray-300 font-medium">Age Group</Label>
                    <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            <SelectValue placeholder="Select Age Group" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800">
                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Age Groups</SelectItem>
                            <SelectItem value="Children" className="text-gray-900 dark:text-white">Children</SelectItem>
                            <SelectItem value="Youth" className="text-gray-900 dark:text-white">Youth</SelectItem>
                            <SelectItem value="Young Adult" className="text-gray-900 dark:text-white">Young Adult</SelectItem>
                            <SelectItem value="Young Married" className="text-gray-900 dark:text-white">Young Married</SelectItem>
                            <SelectItem value="Middle Adult" className="text-gray-900 dark:text-white">Middle Adult</SelectItem>
                            <SelectItem value="Senior Adult" className="text-gray-900 dark:text-white">Senior Adult</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* 2. Status (Existing) */}
                <div className="space-y-2">
                    <Label htmlFor="member_status" className="text-gray-700 dark:text-gray-300 font-medium">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800">
                            <SelectItem value="all" className="text-gray-900 dark:text-white">All Status</SelectItem>
                            <SelectItem value="Active" className="text-gray-900 dark:text-white">Active</SelectItem> {/* capitatlized the first letter of the value */}
                            <SelectItem value="Inactive" className="text-gray-900 dark:text-white">Inactive</SelectItem> {/* capitatlized the first letter of the value */}
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. Ministry Filter (NEW) */}
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

                        </SelectContent>
                    </Select>
                </div>

                {/* 4. Spiritual Training Filter (NEW) */}
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

              {/* 5. Birth Month Filter (RESTORED) */}
<div className="space-y-2">
    <Label htmlFor="birthMonth" className="text-gray-700 dark:text-gray-300 font-medium">Birth Month</Label>
    <Select 
        value={selectedBirthMonth} 
        onValueChange={setSelectedBirthMonth}
    > 
        <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <SelectItem value="all" className="text-gray-900 dark:text-white">All Months</SelectItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => {
                const monthName = new Date(0, monthNum - 1).toLocaleString('en-US', { month: 'long' });
                return (
                    <SelectItem key={monthNum} value={monthNum.toString()} className="text-gray-900 dark:text-white">
                        {monthName}
                    </SelectItem>
                );
            })}
        </SelectContent>
    </Select>
</div>
                {/* 6. Water Baptized Filter (NEW) */}
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

                {/* 7. Marital Status Filter (NEW) */}
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

                {/* 8. Date Attended From (Existing - line 663 approximation) */}
                <div className="space-y-2">
                    <Label htmlFor="dateFrom" className="text-gray-700 dark:text-gray-300 font-medium">Date Attended From</Label>
                    <Input id="dateFrom" type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:[color-scheme:dark]" />
                </div>

                {/* 9. Date Attended To (Existing) */}
                <div className="space-y-2">
                    <Label htmlFor="dateTo" className="text-gray-700 dark:text-gray-300 font-medium">Date Attended To</Label>
                    <Input id="dateTo" type="month" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:[color-scheme:dark]" />
                </div>

                {/* 10. Apply/Clear Buttons (Existing) */}
                <div className="flex flex-col gap-2 pt-0 lg:pt-2 col-span-2 lg:col-span-1 justify-end">
                    <Button variant="default" onClick={handleApplyMemberFilters} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors h-10">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                        Apply Filters
                    </Button>
                    <Button variant="outline" onClick={handleClearMemberFilters} className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors h-10">
                        <X className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 pb-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">
                        Member Records (<span className="text-indigo-600 dark:text-indigo-400">{members.length}</span> total)
                    </h3>
                </div>
                {/* 👇 New Wrapper for Buttons with Flex for side-by-side alignment */}
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={23} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mx-auto" />
                                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading member records...</p>
                                </TableCell>
                            </TableRow>
                        ) : currentMemberRows.length > 0 ? (
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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden ${!member.photo_url ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : ''}`}>
                                            {member.photo_url ? (
                                                <img
                                                    src={member.photo_url}
                                                    alt={`${member.first_name} ${member.last_name}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Photo'; }}
                                                />
                                            ) : (
                                                `${member.first_name[0]}${member.last_name[0]}`
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium whitespace-nowrap">{member.first_name} {member.last_name}</TableCell>
                                    <TableCell>{member.marital_status || 'N/A'}</TableCell>
                                    <TableCell className="whitespace-nowrap">{formatDate(member.date_of_birth)}</TableCell>
                                    <TableCell>{member.gender || 'N/A'}</TableCell>
                                    <TableCell className="whitespace-nowrap">{member.contact_number || 'N/A'}</TableCell>
                                    <TableCell>{member.prev_church_attendee ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{member.prev_church || 'N/A'}</TableCell>
                                    <TableCell>{member.address || 'N/A'}</TableCell>
                                    <TableCell><Badge variant="outline">{member.age_group || 'N/A'}</Badge></TableCell>
                                    <TableCell className="max-w-[150px] text-wrap">{member.trainings || 'None'}</TableCell>
                                    <TableCell>{member.willing_training ? 'Yes' : 'No'}</TableCell>
                                    <TableCell className="max-w-[200px] text-wrap">{member.households || 'None'}</TableCell>
                                    <TableCell>{member.invited_by || 'N/A'}</TableCell>
                                    <TableCell className="whitespace-nowrap">{formatDate(member.date_attended)}</TableCell>
                                    <TableCell>{member.attending_cell_group ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{member.cell_leader_name || 'N/A'}</TableCell>
                                    <TableCell className="max-w-[150px] text-wrap">{member.church_ministry || 'None'}</TableCell>
                                    <TableCell>{member.consolidation || 'N/A'}</TableCell>
                                    <TableCell className="max-w-[150px] text-wrap">{member.reason || 'N/A'}</TableCell>
                                    <TableCell>{member.water_baptized ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{getStatusBadge(member.member_status)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={23} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                    <Filter className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                                    No members found matching the current filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {currentMemberRows.length} of {members.length} records.
                </span>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>{currentPage}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalMemberPages, prev + 1)); }}
                                className={currentPage >= totalMemberPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </>
    );

    // --- Component for Attendance Records ---
    const renderAttendanceRecords = () => (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-500/10 dark:bg-teal-300/10 rounded-lg flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Filter Attendance</h3>
                </div>
                <div className="relative flex-grow sm:flex-grow-0 sm:ml-auto w-full sm:w-72">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search member name..."
                        value={attendanceSearchTerm}
                        onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">

                <div className="space-y-3 col-span-4 lg:col-span-1">
                    <Label htmlFor="attendance_date" className="text-gray-700 dark:text-gray-300 font-medium">Select Date</Label>
                    <Input
                        id="attendance_date"
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 dark:[color-scheme:dark]"
                    />
                </div>

                <div className="col-span-4 lg:col-span-3 flex items-end gap-4 pt-0 lg:pt-7">
                    <Button
                        variant="default"
                        onClick={handleApplyAttendanceFilters}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-colors flex-grow"
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
                        Apply Filter
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleClearAttendanceFilters}
                        className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-grow"
                    >
                        <X className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
            </div>

             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 pb-6 border-b border-gray-200 dark:border-gray-700 mb-6">

    <div className="flex items-center gap-3 mb-3 sm:mb-0">

        <ListChecks className="w-5 h-5 text-teal-600 dark:text-teal-400" />

        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">

            Attendance History (<span className="text-teal-600 dark:text-teal-400">{attendanceRecords.length}</span> records)

        </h3>
    </div>
    <Button 
        onClick={handleExportAttendance} 
        variant="outline" 
        className="flex items-center gap-2 border-teal-400 text-teal-600 dark:border-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/50 transition-colors"
    >
        <Upload className="w-4 h-4" /> 
        Export CSV
    </Button>
</div>
            <Card className="overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-xl rounded-lg">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow className="bg-teal-50 dark:bg-gray-700/50 whitespace-nowrap text-gray-700 dark:text-gray-200 font-semibold border-b-2 border-teal-200 dark:border-teal-800">
                            <TableHead className="w-[80px]">Member ID</TableHead>
                            <TableHead>Member Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-teal-500 mx-auto" />
                                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading attendance records...</p>
                                </TableCell>
                            </TableRow>
                        ) : currentAttendanceRows.length > 0 ? (
                            currentAttendanceRows.map((record) => (
                                <TableRow key={record.attendance_id} className="text-gray-700 dark:text-gray-300 hover:bg-teal-50/50 dark:hover:bg-gray-800/70 border-b border-gray-100 dark:border-gray-700/50 transition-colors">
                                    <TableCell className="font-mono text-xs">{record.id}</TableCell>
                                    <TableCell className="font-medium">{record.fullName}</TableCell>
                                    <TableCell className="whitespace-nowrap">{formatDate(record.date)}</TableCell>
                                    <TableCell>{getAttendanceBadge(record.status)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-6 w-6 mx-auto text-gray-400 mb-2" />
                                    No attendance records found matching the criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {currentAttendanceRows.length} of {attendanceRecords.length} records.
                </span>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>{currentPage}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(totalAttendancePages, prev + 1)); }}
                                className={currentPage >= totalAttendancePages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </>
    );

    // --- Main Render ---
    return (
        
        <div
            className={`min-h-screen ${isDark ? 'dark bg-gradient-to-br from-gray-900 to-indigo-950 text-gray-50' : 'bg-gradient-to-br from-gray-50 to-indigo-50 text-gray-900'}`}
        >
            {/* Desktop Header */}
<div className="hidden lg:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Logs and Reports
                </h1>
            </div>

            {/* --- Updated Theme Toggle Button --- */}
            <button 
                onClick={onToggleTheme} 
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm active:scale-90"
            >
                {isDark ? (
                    <Moon className="w-5 h-5 text-indigo-400" /> 
                ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                )}
            </button>
            {/* ------------------------------------ */}

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

            {/* Main Tab Navigation */}
<Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full mb-8">
  <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 shadow-lg p-1 h-auto">
    
    {/* Member Records Tab */}
    <TabsTrigger 
      value="members" 
      className="flex items-center justify-center gap-2 py-3 px-4 transition-all duration-200
        data-[state=active]:bg-blue-600 
        data-[state=active]:text-white 
        data-[state=active]:shadow-md
        hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <Users className="w-4 h-4" /> 
      <span className="font-medium">Member Records</span>
    </TabsTrigger>

    {/* Attendance Records Tab */}
    <TabsTrigger 
      value="attendance" 
      className="flex items-center justify-center gap-2 py-3 px-4 transition-all duration-200
        data-[state=active]:bg-indigo-600 
        data-[state=active]:text-white 
        data-[state=active]:shadow-md
        hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      <ListChecks className="w-4 h-4" /> 
      <span className="font-medium">Attendance Records</span>
    </TabsTrigger>

  </TabsList>

                {/* Member Records Tab Content */}
                <TabsContent value="members" className="mt-6">
                    <Card className="p-5 bg-gray-50 dark:bg-gray-900 shadow-inner border border-gray-200 dark:border-gray-700 mb-8">
                        {/* ✅ TAMA: Function call gamit ang curly braces */}
                        {renderMemberRecords()}
                    </Card>
                </TabsContent>

                {/* Attendance Records Tab Content */}
                <TabsContent value="attendance" className="mt-6">
                    <Card className="p-5 bg-gray-50 dark:bg-gray-900 shadow-inner border border-gray-200 dark:border-gray-700 mb-8">
                        {/* ✅ TAMA: Function call gamit ang curly braces */}
                        {renderAttendanceRecords()}
                    </Card>
                </TabsContent>

            </Tabs>

        </Card>
    </motion.div>
</div>

            {/* Edit/View Modal (The parent div wrapper now applies the theme to the modal contents) */}
            {showEditModal && selectedMember && (
                <div className={isDark ? 'dark' : ''}> {/* FIX: This wrapper ensures the modal inherits the theme */}
                    <EditModal
                        showEditModal={showEditModal}
                        setShowEditModal={setShowEditModal}
                        editFormData={editFormData}
                        selectedMember={selectedMember}
                        isSubmitting={isSubmitting}
                        handleEditChange={handleEditChange}
                        handleSelectChange={handleSelectChange}
                        handleBooleanToggle={handleBooleanToggle}
                        handleEditSubmit={handleEditSubmit}
                        ministries={ministries}
                        trainings={trainings}
                        toggleMinistry={toggleMinistry}
                        toggleTraining={toggleTraining}
                        handleTrainingYearChange={handleTrainingYearChange}
                        handleAddHouseholdMember={handleAddHouseholdMember}
                        handleHouseholdMemberChange={handleHouseholdMemberChange}
                        handleRemoveHouseholdMember={handleRemoveHouseholdMember}
                    />
                </div>
            )}
        </div>
    );
};