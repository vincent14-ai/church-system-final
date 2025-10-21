import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CameraCapture } from './camera';
import { Camera, Plus, Trash2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import axios from 'axios';

export function PersonalInfo({ isDark, onToggleTheme }) {
  const [showCamera, setShowCamera] = useState(false);
  const [data, setData] = useState({
    first_name: "", last_name: "", marital_status: "", date_of_birth: "", gender: "", contact_number: "",
    prev_church_attendee: "", address: "", age_group: "", prev_church: "", invited_by: "", date_attended: "", attending_cell_group: "", cell_leader_name: "",
    church_ministry: "", consolidation: "", reason: "", water_baptized: "", spiritual_training: "", willing_training: "", member_status: "", created_at: "",
    household_members: [], spiritual_trainings: {
      "Life Class": false,
      "SOL 1": false,
      "SOL 2": false,
      "SOL 3": false,
      willing_training: false,
    },
  });

  const [message, setMessage] = useState("");

  // generic input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateAgeGroup = (date_of_birth, marital_status) => {
    if (!date_of_birth) return '';

    const today = new Date();
    const birthDate = new Date(date_of_birth);
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 13) return 'Children';
    if (age >= 13 && age <= 17) return 'Youth';
    if (age >= 18 && age <= 39) {
      return marital_status === 'Married' ? 'Young Married' : 'Young Adult';
    }
    if (age >= 40 && age <= 59) return 'Middle Adult';
    return 'Senior Adult';
  };

  const addHouseholdMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      date_of_birth: '',
    };
    setData(prev => ({
      ...prev,
      household_members: [...prev.household_members, newMember],
    }));
  };

  const removeHouseholdMember = (id) => {
    setData(prev => ({
      ...prev,
      household_members: prev.household_members.filter(member => member.id !== id),
    }));
  };

  const updateHouseholdMember = (id, field, value) => {
    setData(prev => ({
      ...prev,
      household_members: prev.household_members.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      ),
    }));
  };

  const trainings = ["Life Class", "SOL 1", "SOL 2", "SOL 3"];

  const handlePhotoCapture = (imageDataUrl) => {
    setData(prev => ({ ...prev, photo: imageDataUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Personal Info Data:', data);

    try {
      const res = await axios.post("http://localhost:5000/api/members", data);

      setMessage(`Member added with id ${res.data.id}`);
      setData({
        first_name: "", last_name: "", marital_status: "", date_of_birth: "", gender: "", contact_number: "",
        prev_church_attendee: "", address: "", age_group: "", prev_church: "", invited_by: "", attending_cell_group: "", cell_leader_name: "",
        church_ministry: "", consolidation: "", reason: "", water_baptized: "", spiritual_training: "", willing_training: "", member_status: "", created_at: "",
        household_members: [], spiritual_trainings: [], date_attended: "",
      }); // reset form
    } catch (err) {
      console.error(err);
      setMessage("Failed to add member");
    }
  };

  useEffect(() => {
    const group = calculateAgeGroup(data.date_of_birth, data.marital_status);
    setData(prev => ({ ...prev, age_group: group }));
  }, [data.date_of_birth, data.marital_status]);

  return (
    <div className="min-h-screen">
      {/* Desktop Header */}
      <div className="hidden lg:block bg-card/90 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Personal Information Registration
              </h1>
            </div>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50 lg:hidden">
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                Personal Information Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Photo Section */}
                <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 space-y-4">
                  <Label className="text-lg">Profile Photo</Label>
                  <div className="flex items-center gap-6">
                    <Avatar className="w-32 h-32 shadow-lg border-4 border-background">
                      <AvatarImage src={data.photo} alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                        <User className="w-16 h-16 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCamera(true)}
                        className="shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {data.photo ? 'Retake Photo' : 'Take Photo'}
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Click to capture a new photo using your camera
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg border-b border-border/50 pb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/20 rounded-md flex items-center justify-center">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    </div>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm">First Name *</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={data.first_name}
                        onChange={handleChange}
                        className="h-11 bg-input-background shadow-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm">Last Name *</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={data.last_name}
                        onChange={handleChange}
                        className="h-11 bg-input-background shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status *</Label>
                    <Select
                      value={data.marital_status}
                      onValueChange={(value) =>
                        setData((prev) => ({ ...prev, marital_status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={data.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      name="gender"
                      value={data.gender}
                      onValueChange={(value) =>
                        setData((prev) => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Age Group</Label>
                    <Input
                      name="age_group"
                      value={data.age_group}
                      readOnly
                      className="bg-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number *</Label>
                    <Input
                      id="contact_number"
                      name="contact_number"
                      value={data.contact_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={data.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Household Members */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Household Members</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addHouseholdMember}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Member
                    </Button>
                  </div>
                  {data.household_members.map((member) => (
                    <Card key={member.id} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => updateHouseholdMember(member.id, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Relationship"
                          value={member.relationship}
                          onChange={(e) => updateHouseholdMember(member.id, 'relationship', e.target.value)}
                        />
                        <Input
                          type="date"
                          value={member.date_of_birth}
                          onChange={(e) => updateHouseholdMember(member.id, 'date_of_birth', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeHouseholdMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Church Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prev_church">Previous Born-Again Christian Church</Label>
                    <Input
                      id="prev_church"
                      name="prev_church"
                      value={data.prev_church}
                      onChange={handleChange}
                      placeholder="Church name (if applicable)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invited_by">Invited By</Label>
                    <Input
                      id="invited_by"
                      name="invited_by"
                      value={data.invited_by}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_attended">Date Attended in JPCC Balayan</Label>
                    <Input
                      id="date_attended"
                      name="date_attended"
                      type="month"
                      value={data.date_attended}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="church_ministry">Church Ministry</Label>
                    <Select
                      name="church_ministry"
                      value={data.church_ministry}
                      onValueChange={(value) =>
                        setData((prev) => ({ ...prev, church_ministry: value }))
                      }
                      className="w-full p-2 rounded-md bg-slate-900 border border-slate-700"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ministry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Praise Team">Praise Team</SelectItem>
                        <SelectItem value="Content Writer">Content Writer</SelectItem>
                        <SelectItem value="Ushering">Ushering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cell Group */}
                <div className="space-y-4">
                  <Label>Cell Group Member</Label>
                  <Select
                    name="attending_cell_group"
                    value={String(data.attending_cell_group)} // must be a string for Select
                    onValueChange={(value) =>
                      setData((prev) => ({
                        ...prev,
                        attending_cell_group: Number(value), // convert back to number
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>

                  {data.attending_cell_group === "Yes" && (
                    <div className="space-y-2">
                      <Label htmlFor="cell_leader_name">Cell Leader's Name</Label>
                      <Input
                        id="cell_leader_name"
                        name="cell_leader_name"
                        value={data.cell_leader_name}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>


                {/* Spiritual Training */}
                <div className="space-y-4">
                  <Label>Spiritual Training</Label>

                  <div className="space-y-4">
                    {trainings.map((key) => (
                      <div key={key} className="flex items-center space-x-4">
                        <Checkbox
                          id={key}
                          checked={!!data.spiritual_trainings[key]} // ✅ always boolean
                          onCheckedChange={(checked) =>
                            setData((prev) => ({
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

                        {data.spiritual_trainings[key] && (
                          <Input
                            type="number"
                            placeholder="Year"
                            className="w-24"
                            value={data.spiritual_trainings[`${key}Year`] || ""}
                            onChange={(e) =>
                              setData((prev) => ({
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
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="willing_training"
                        checked={!!data.spiritual_trainings.willing_training}
                        onCheckedChange={(checked) =>
                          setData((prev) => ({
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
                  </div>

                  {/* Optional debug output */}
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>

                {/* Member Status */}
                <div className="space-y-2">
                  <Label htmlFor="member_status">Member Status</Label>
                  <Select
                    value={data.member_status}
                    onValueChange={(value) => setData(prev => ({ ...prev, member_status: value }))}
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

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Save Personal Information
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {showCamera && (
          <CameraCapture
            onCapture={handlePhotoCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    </div>
  );
}