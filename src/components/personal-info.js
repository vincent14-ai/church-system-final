import React, { useState } from 'react';
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

export function PersonalInfo({ isDark, onToggleTheme }) {
  const [showCamera, setShowCamera] = useState(false);
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    maritalStatus: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    address: '',
    householdMembers: [],
    previousChurch: '',
    invitedBy: '',
    dateAttended: '',
    cellGroupMember: 'no',
    cellLeaderName: '',
    churchMinistry: '',
    spiritualTraining: {
      lifeClass: false,
      lifeClassYear: '',
      sol1: false,
      sol1Year: '',
      sol2: false,
      sol2Year: '',
      sol3: false,
      sol3Year: '',
      willingToTrain: false,
    },
    memberStatus: 'active',
    photo: '',
  });

  const calculateAgeGroup = (dateOfBirth, maritalStatus) => {
    if (!dateOfBirth) return '';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) return 'Children (0-12)';
    if (age >= 13 && age <= 17) return 'Youth (13-17)';
    if (age >= 18 && age <= 25) {
      return maritalStatus === 'married' ? 'Young Married (18-25)' : 'Young Adults (18-25)';
    }
    if (age >= 26 && age <= 39) {
      return maritalStatus === 'married' ? 'Young Married (26-39)' : 'Young Adults (26-39)';
    }
    if (age >= 40 && age <= 59) return 'Middle Adults (40-59)';
    return 'Senior Adults (60+)';
  };

  const addHouseholdMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      dateOfBirth: '',
    };
    setData(prev => ({
      ...prev,
      householdMembers: [...prev.householdMembers, newMember],
    }));
  };

  const removeHouseholdMember = (id) => {
    setData(prev => ({
      ...prev,
      householdMembers: prev.householdMembers.filter(member => member.id !== id),
    }));
  };

  const updateHouseholdMember = (id, field, value) => {
    setData(prev => ({
      ...prev,
      householdMembers: prev.householdMembers.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      ),
    }));
  };

  const handlePhotoCapture = (imageDataUrl) => {
    setData(prev => ({ ...prev, photo: imageDataUrl }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Personal Info Data:', data);
    // Here you would save to your backend/database
    alert('Personal information saved successfully!');
  };

  const ageGroup = calculateAgeGroup(data.dateOfBirth, data.maritalStatus);

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
                    <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                    <Input
                      id="firstName"
                      value={data.firstName}
                      onChange={(e) => setData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="h-11 bg-input-background shadow-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={data.lastName}
                      onChange={(e) => setData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="h-11 bg-input-background shadow-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status *</Label>
                  <Select
                    value={data.maritalStatus}
                    onValueChange={(value) => setData(prev => ({ ...prev, maritalStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => setData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={data.gender}
                    onValueChange={(value) => setData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age Group</Label>
                  <Input value={ageGroup} readOnly className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    value={data.contactNumber}
                    onChange={(e) => setData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={data.address}
                    onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
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
                {data.householdMembers.map((member) => (
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
                        value={member.dateOfBirth}
                        onChange={(e) => updateHouseholdMember(member.id, 'dateOfBirth', e.target.value)}
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
                  <Label htmlFor="previousChurch">Previous Born-Again Christian Church</Label>
                  <Input
                    id="previousChurch"
                    value={data.previousChurch}
                    onChange={(e) => setData(prev => ({ ...prev, previousChurch: e.target.value }))}
                    placeholder="Church name (if applicable)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invitedBy">Invited By</Label>
                  <Input
                    id="invitedBy"
                    value={data.invitedBy}
                    onChange={(e) => setData(prev => ({ ...prev, invitedBy: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateAttended">Date Attended in JPCC Balayan</Label>
                  <Input
                    id="dateAttended"
                    type="month"
                    value={data.dateAttended}
                    onChange={(e) => setData(prev => ({ ...prev, dateAttended: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="churchMinistry">Church Ministry</Label>
                  <Input
                    id="churchMinistry"
                    value={data.churchMinistry}
                    onChange={(e) => setData(prev => ({ ...prev, churchMinistry: e.target.value }))}
                    placeholder="Ministry name (if applicable)"
                  />
                </div>
              </div>

              {/* Cell Group */}
              <div className="space-y-4">
                <Label>Cell Group Member</Label>
                <Select
                  value={data.cellGroupMember}
                  onValueChange={(value) => setData(prev => ({ ...prev, cellGroupMember: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {data.cellGroupMember === 'yes' && (
                  <div className="space-y-2">
                    <Label htmlFor="cellLeaderName">Cell Leader's Name</Label>
                    <Input
                      id="cellLeaderName"
                      value={data.cellLeaderName}
                      onChange={(e) => setData(prev => ({ ...prev, cellLeaderName: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              {/* Spiritual Training */}
              <div className="space-y-4">
                <Label>Spiritual Training</Label>
                <div className="space-y-4">
                  {[
                    { key: 'lifeClass', label: 'Life Class' },
                    { key: 'sol1', label: 'SOL 1' },
                    { key: 'sol2', label: 'SOL 2' },
                    { key: 'sol3', label: 'SOL 3' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-4">
                      <Checkbox
                        id={key}
                        checked={data.spiritualTraining[key]}
                        onCheckedChange={(checked) =>
                          setData(prev => ({
                            ...prev,
                            spiritualTraining: {
                              ...prev.spiritualTraining,
                              [key]: checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor={key} className="flex-1">{label}</Label>
                      {data.spiritualTraining[key] && (
                        <Input
                          type="number"
                          placeholder="Year"
                          className="w-24"
                          value={data.spiritualTraining[`${key}Year`]}
                          onChange={(e) =>
                            setData(prev => ({
                              ...prev,
                              spiritualTraining: {
                                ...prev.spiritualTraining,
                                [`${key}Year`]: e.target.value,
                              },
                            }))
                          }
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="willingToTrain"
                      checked={data.spiritualTraining.willingToTrain}
                      onCheckedChange={(checked) =>
                        setData(prev => ({
                          ...prev,
                          spiritualTraining: {
                            ...prev.spiritualTraining,
                            willingToTrain: checked,
                          },
                        }))
                      }
                    />
                    <Label htmlFor="willingToTrain">
                      Willing to undergo spiritual training (if none of the above was checked)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Member Status */}
              <div className="space-y-2">
                <Label htmlFor="memberStatus">Member Status</Label>
                <Select
                  value={data.memberStatus}
                  onValueChange={(value) => setData(prev => ({ ...prev, memberStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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