import React, { useState, useEffect, useRef } from 'react';
import {
  Camera, User, Moon, Sun, Plus, Trash2, Check,
  Upload, X, Loader2, Calendar, Heart, Users,
  BookOpen, ChevronDown
} from 'lucide-react';
import { supabase } from "../lib/supabaseClient.js";
import axios from 'axios';
import PhotoUpload from "./photo";
import ChurchLogoBlue from './assets/LOGO BLUE.png';
import ChurchLogoWhite from './assets/LOGO WHITE.png';

// --- UI COMPONENTS (Internal Implementation) ---

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30',
    outline: 'border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-red-500/30',
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

const Input = ({ label, error, className, required, type, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && (
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <input
      type={type}
      className={cn(
        'flex w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-3 py-2.5 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
        // UPDATE 1: This forces the date picker icon to be white in dark mode
        (type === 'date' || type === 'month') && 'dark:[color-scheme:dark]',
        error && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      required={required}
      {...props}
    />
    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
  </div>
);

const Textarea = ({ label, className, required, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && (
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
        className
      )}
      required={required}
      {...props}
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder = "Select...", className, required = false }) => (
  <div className="space-y-1.5 w-full">
    {label && (
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={cn(
          'flex w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-3 py-2.5 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
          'text-slate-900 dark:text-slate-100',
          className
        )}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="dark:bg-slate-800">{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  </div>
);

const Checkbox = ({ id, checked, onChange, label }) => (
  <div className="flex items-center space-x-2">
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-md border border-indigo-500 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 flex items-center justify-center",
        checked ? "bg-indigo-600 text-white" : "bg-transparent"
      )}
    >
      {checked && <Check className="h-3.5 w-3.5" />}
    </button>
    <label
      htmlFor={id}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none text-slate-700 dark:text-slate-300"
      onClick={() => onChange(!checked)}
    >
      {label}
    </label>
  </div>
);

const Card = ({ children, className }) => (
  <div className={cn("rounded-2xl border border-white/20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl transition-all duration-500", className)}>
    {children}
  </div>
);

// --- CAMERA COMPONENT ---
const CameraModal = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error("Error accessing camera:", err);
        console.error("Could not access camera. Please ensure you have given permission.");
        onClose();
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    onCapture(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl border border-slate-700 transition-all duration-300">
        <div className="relative aspect-video bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover -scale-x-100" />
        </div>
        <div className="p-6 flex justify-between items-center bg-slate-900">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
          <button
            onClick={takePhoto}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-white rounded-full" />
          </button>
          <div className="w-16" />
        </div>
      </div>
    </div>
  );
};

// --- TOAST NOTIFICATION ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg backdrop-blur-md border flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-500",
      type === 'success' ? "bg-emerald-500/90 border-emerald-400 text-white" : "bg-red-500/90 border-red-400 text-white"
    )}>
      {type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

// --- MAIN COMPONENT ---

export function PersonalInfo({ isDark, setIsDark, onToggleTheme }) {
  const churchLogo = isDark ? ChurchLogoWhite : ChurchLogoBlue;
  
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

const toggleTheme = () => setIsDark(!isDark);

 

  const [data, setData] = useState({
    photo_url: "",
    first_name: "", last_name: "", marital_status: "", date_of_birth: "", gender: "", contact_number: "",
    prev_church_attendee: "",
    address: "", age_group: "", prev_church: "", invited_by: "", date_attended: "",
    attending_cell_group: "",
    cell_leader_name: "",
    church_ministry: [],
    other_ministry_involvement: "",
    consolidation: "", reason: "",
    water_baptized: "",
    member_status: "",
    household_members: [],
    spiritual_trainings: {
      "Life Class": false, "SOL 1": false, "SOL 2": false, "SOL 3": false, willing_training: false,
    },
  });

  const ministries = ["Media", "Praise Team", "Content Writer", "Ushering", "Kids Ministry", "Technical", "Others"];
  const trainings = ["Life Class", "SOL 1", "SOL 2", "SOL 3"];

  // Logic for showing/hiding "Willing to undergo training"
  const hasSelectedTraining = trainings.some(key => data.spiritual_trainings[key] === true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMinistry = (ministry) => {
    setData((prev) => {
      const current = prev.church_ministry || [];
      return {
        ...prev,
        church_ministry: current.includes(ministry)
          ? current.filter(m => m !== ministry)
          : [...current, ministry]
      };
    });
  };

  const toggleOtherMinistry = () => {
    setData((prev) => {
      const isOtherSelected = prev.church_ministry.includes('Others');
      let newMinistryList;

      if (isOtherSelected) {
        // Remove 'Others' and clear the input field**
        newMinistryList = prev.church_ministry.filter(m => m !== 'Others');
        return { ...prev, church_ministry: newMinistryList, other_ministry_involvement: "" };
      } else {
        // Add 'Others'**
        newMinistryList = [...prev.church_ministry, 'Others'];
        return { ...prev, church_ministry: newMinistryList };
      }
    });
  };

  const calculateAgeGroup = (dob, status) => {
    if (!dob) return '';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    if (age < 13) return 'Children';
    if (age >= 13 && age <= 17) return 'Youth';
    if (age >= 18 && age <= 59) return 'Young Adult';
    // if (age >= 40 && age <= 59) return 'Middle Adult';
    return 'Senior ';
  };

  useEffect(() => {
    setData(prev => ({ ...prev, age_group: calculateAgeGroup(prev.date_of_birth, prev.marital_status) }));
  }, [data.date_of_birth, data.marital_status]);

  /*const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setData(prev => ({ ...prev, photo_url: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (imageDataUrl) => {
    setData(prev => ({ ...prev, photo: imageDataUrl }));
  };*/

  const addHouseholdMember = () => {
    setData(prev => ({
      ...prev,
      household_members: [...prev.household_members, { id: Date.now(), name: '', relationship: '', dob: '' }]
    }));
  };

  const updateHouseholdMember = (id, field, value) => {
    setData(prev => ({
      ...prev,
      household_members: prev.household_members.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const removeHouseholdMember = (id) => {
    setData(prev => ({
      ...prev,
      household_members: prev.household_members.filter(m => m.id !== id)
    }));
  };

  // form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoURL = data.photo_url;
      let photoPath = data.photoPath;

      // Upload photo FIRST if a new file was selected
      if (data.selectedFile) {
        const fileName = `${Date.now()}_${data.selectedFile.name}`;

        const { error: uploadError } = await supabase
          .storage
          .from("profile-photos")
          .upload(fileName, data.selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase
          .storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        photoURL = urlData.publicUrl;
        photoPath = fileName;
      }

      // FINAL PAYLOAD
      const payload = {
        ...data,
        photo_url: photoURL,
        photoPath: photoPath,
        photo: photoURL,
        church_ministry: data.church_ministry?.join(", ") || "",
        household_members: data.household_members.map(m => ({
          ...m,
          date_of_birth: m.date_of_birth || null,
        })),
      };

      const res = await axios.post("http://localhost:5000/api/members", payload);

      setTimeout(() => {
        setLoading(false);
        setToast({ message: `${data.first_name || 'User'} added successfully!`, type: 'success' });
      }, 1500);

      // RESET STATE (fixed)
      setData({
        photo_url: "", photoPath: "", photo: "", selectedFile: null, photoPreview: null, first_name: "", last_name: "", marital_status: "", date_of_birth: "", gender: "", contact_number: "",
        prev_church_attendee: false, address: "", age_group: "", prev_church: "", invited_by: "", attending_cell_group: false, cell_leader_name: "",
        church_ministry: "", consolidation: "", reason: "", water_baptized: false, spiritual_training: "", willing_training: false, member_status: "", created_at: "",
        household_members: [], spiritual_trainings: [], date_attended: "",
      }); // reset form
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Failed to add member");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] transition-all duration-700" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] transition-all duration-700" />
      </div>

      {/* Navbar - Sagad sa Gilid Version */}
<nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-500">
  {/* Changed max-w-5xl to w-full and added px-4 to px-8 for a tiny bit of breathing room from the screen edge */}
  <div className="w-full px-4 md:px-8 py-4 flex items-center justify-between">
    
    {/* Left Side: Logo & Text */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-105">
        <Users className="w-5 h-5 text-white" />
      </div>
      <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
        Personal Information
      </h1>
    </div>

    {/* Right Side: Toggle Button */}
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
    
  </div>
</nav>
      <main className="relative z-10 max-w-5xl mx-auto p-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* HEADER & PHOTO */}
          <Card className="p-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 transition-all duration-500" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="group relative">
                <div className={cn(
                  "w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all duration-500",
                  !data.photo_url && "border-dashed border-slate-300 dark:border-slate-700"
                )}>
                  {data.photo_url ? (
                    <img src={data.photoPreview || data.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setData(prev => ({
                      ...prev,
                      selectedFile: null,
                      photoPreview: null,
                      photo_url: "",
                      photoPath: ""
                    }))
                  }
                  className={cn(
                    "absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform",
                    !data.photo_url && "hidden"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight transition-colors duration-300">New Member Profile</h2>
                  <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">Enter personal details to register a new member.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={() => setShowCamera(true)} variant="outline" className="gap-2">
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                  {/* removed this part
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button type="button" variant="outline" className="gap-2 border-dashed border-slate-300 dark:border-slate-600">
                      <Upload className="w-4 h-4" />
                      Upload Image
                    </Button>
                  </div>
                  */}
                  
                  {/*changed into this one */}
                  <PhotoUpload data={data} setData={setData} />
                </div>
              </div>
            </div>
          </Card>

          {/* BASIC INFO */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="first_name"
                value={data.first_name}
                onChange={handleChange}
                required
                placeholder="e.g. John"
              />
              <Input
                label="Last Name"
                name="last_name"
                value={data.last_name}
                onChange={handleChange}
                required
                placeholder="e.g. Doe"
              />
              <Select
                label="Marital Status"
                value={data.marital_status}
                required
                onChange={(e) => setData(prev => ({ ...prev, marital_status: e.target.value }))}
                options={[
                  { value: "Single", label: "Single" },
                  { value: "Married", label: "Married" },
                  { value: "Divorced", label: "Divorced" },
                  { value: "Widowed", label: "Widowed" },
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  name="date_of_birth"
                  value={data.date_of_birth}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Age Group"
                  value={data.age_group}
                  readOnly
                  className="bg-slate-100 dark:bg-slate-800/50 cursor-default border-transparent"
                />
              </div>
              <Select
                label="Gender"
                value={data.gender}
                required
                onChange={(e) => setData(prev => ({ ...prev, gender: e.target.value }))}
                options={[
                  { value: "M", label: "Male" },
                  { value: "F", label: "Female" },
                ]}
              />
              <Input
                label="Contact Number"
                name="contact_number"
                value={data.contact_number}
                onChange={handleChange}
                required
                placeholder="0912 345 6789"
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Address"
                  name="address"
                  value={data.address}
                  onChange={handleChange}
                  required
                  placeholder="Full residential address"
                />
              </div>
            </div>
          </Card>

          {/* CHURCH HISTORY */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-white transition-colors duration-300">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Church History</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* UPDATE 2: Added required={true} */}
              <Select
                label="Previous Church Attendee?"
                value={data.prev_church_attendee}
                required={true}
                onChange={(e) => setData(prev => ({ ...prev, prev_church_attendee: e.target.value }))}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />

              {data.prev_church_attendee === "true" && (
                <Input
                  label="Previous Church Name"
                  name="prev_church"
                  value={data.prev_church}
                  onChange={handleChange}
                  className="animate-in slide-in-from-top-2"
                />
              )}

              <Input label="Invited By (Optional)" name="invited_by" value={data.invited_by} onChange={handleChange} />
              <Input label="Date Attended (JPCC)" type="month" name="date_attended" value={data.date_attended} onChange={handleChange} />
            </div>
          </Card>

          {/* MINISTRY & INVOLVEMENT */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400 transition-colors duration-300">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Ministry & Involvement</h3>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Ministry Involvement</label>
              <div className="flex flex-wrap gap-2">
                {ministries.map(m => {
                  const isActive = data.church_ministry.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMinistry(m)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
                        isActive
                          ? "bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/30"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-pink-400"
                      )}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>

              {/* --- CONDITIONAL INPUT FIELD --- */}
              {data.church_ministry.includes('Others') && (
                <div className="pt-2"> {/* Added a small top padding for separation */}
                  <Input
                    label="Specify Other Ministry"
                    name="other_ministry_involvement"
                    value={data.other_ministry_involvement}
                    onChange={handleChange}
                    placeholder="Please Specify"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6"> {/* Removed mt-[-1rem] here */}
              {/* UPDATE 2: Added required={true} */}
              <Select
                label="Attending Cell Group?"
                value={data.attending_cell_group}
                required={true}
                onChange={(e) => setData(prev => ({ ...prev, attending_cell_group: e.target.value }))}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />
              {data.attending_cell_group === "true" && (
                <Input label="Cell Leader Name" name="cell_leader_name" value={data.cell_leader_name} onChange={handleChange} />
              )}
            </div>
          </Card>

          {/* SPIRITUAL TRAINING */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Spiritual Journey</h3>
            </div>

            <div className="grid gap-4">
              {trainings.map((key) => (
                <div key={key} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 transition-all duration-300">
                  <Checkbox
                    id={key}
                    label={key}
                    checked={data.spiritual_trainings[key]}
                    // UPDATE 3: Logic to reset "willing_training" to false if a specific training is checked
                    onChange={(checked) => setData(prev => ({
                      ...prev,
                      spiritual_trainings: {
                        ...prev.spiritual_trainings,
                        [key]: checked,
                        willing_training: checked ? false : prev.spiritual_trainings.willing_training
                      }
                    }))}
                  />
                  {data.spiritual_trainings[key] && (
                    <Input
                      placeholder="Year Completed"
                      type="number"
                      className="w-32 ml-auto h-8 text-xs animate-in fade-in slide-in-from-left-2"
                      value={data.spiritual_trainings[`${key}Year`] || ''}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        spiritual_trainings: { ...prev.spiritual_trainings, [`${key}Year`]: e.target.value }
                      }))}
                    />
                  )}
                </div>
              ))}

              {!hasSelectedTraining && (
                <div className="pt-2 animate-in fade-in duration-300">
                  <Checkbox
                    id="willing"
                    label="Willing to undergo training?"
                    checked={data.spiritual_trainings.willing_training}
                    onChange={(checked) => setData(prev => ({
                      ...prev,
                      spiritual_trainings: { ...prev.spiritual_trainings, willing_training: checked }
                    }))}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* UPDATE 2: Added required={true} */}
              <Select
                label="Consolidation"
                name="consolidation"
                value={data.consolidation}
                required={true}
                onChange={(e) => setData(prev => ({ ...prev, consolidation: e.target.value }))}
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                  { value: "In Progress", label: "In Progress" },
                ]}
              />
              {/* UPDATE 2: Added required={true} */}
              <Select
                label="Water Baptized"
                value={data.water_baptized}
                required={true}
                onChange={(e) => setData(prev => ({ ...prev, water_baptized: e.target.value }))}
                options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
              />
              {/* UPDATE 2: Added required={true} */}
              <Select
                label="Status"
                value={data.member_status}
                required={true}
                onChange={(e) => setData(prev => ({ ...prev, member_status: e.target.value }))}
                options={[
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ]}
              />
            </div>
            <div className="pt-2">
              <Input label="Reason for joining (Optional)" name="reason" value={data.reason} onChange={handleChange} />
            </div>

          </Card>

          {/* HOUSEHOLD MEMBERS */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 transition-colors duration-300">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Household Members</h3>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addHouseholdMember} className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>

            {data.household_members.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm italic">
                No household members added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.household_members.map((member) => (
                  <div key={member.id} className="grid grid-cols-1 md:grid-cols-7 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-in slide-in-from-left-4 transition-colors duration-300">
                    <div className="md:col-span-3">
                      <Input
                        placeholder="Full Name"
                        value={member.name}
                        onChange={(e) => updateHouseholdMember(member.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Relationship"
                        value={member.relationship}
                        onChange={(e) => updateHouseholdMember(member.id, 'relationship', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Input
                        type="date"
                        value={member.date_of_birth}
                        onChange={(e) => updateHouseholdMember(member.id, 'dob', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeHouseholdMember(member.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-end pt-6">
            <Button type="submit" size="lg" className="w-full md:w-auto shadow-indigo-500/20" isLoading={loading}>
              Save Member Profile
            </Button>
          </div>
        </form>
      </main>

      {showCamera && (
        <CameraModal
          onCapture={(img) => setData(prev => ({ ...prev, photo_url: img }))}
          onClose={() => setShowCamera(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// Default export to satisfy both import styles
export default PersonalInfo;