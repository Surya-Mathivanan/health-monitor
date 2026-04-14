import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';

export function UserProfilePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    position: profile?.position || '',
    personal_number: profile?.personal_number || '',
    degree: profile?.degree || '',
    experience: profile?.experience || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    
    setIsSaving(true);
    try {
      const { error: err } = await supabase
        .from('users')
        .update({
          display_name: formData.display_name,
          position: formData.position,
          personal_number: formData.personal_number,
          degree: formData.degree,
          experience: formData.experience,
        })
        .eq('id', profile.id);

      if (err) throw err;
      success('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      error('Failed to update profile', err.message);
      console.error('Failed to update profile:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      display_name: profile?.display_name || '',
      position: profile?.position || '',
      personal_number: profile?.personal_number || '',
      degree: profile?.degree || '',
      experience: profile?.experience || '',
    });
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="p-4 lg:p-6 text-center py-20">
        <p className="text-slate-400">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Main profile card */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Header with avatar and edit button */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full brand-gradient-bg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
                  {getInitials(profile.display_name || 'U')}
                </div>
                {!isEditing && (
                  <div>
                    <h2 className="text-2xl font-bold text-white">{profile.display_name}</h2>
                    {profile.position && (
                      <p className="text-sm text-slate-400 mt-1">{profile.position}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">Role: <span className="capitalize text-slate-400 font-medium">{profile.role}</span></p>
                  </div>
                )}
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  title="Edit profile"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="pb-6 border-b border-slate-700/50">
              <label className="text-xs text-slate-500 uppercase tracking-wide font-medium">Email</label>
              <p className="text-sm text-slate-300 mt-2 font-mono">{profile.email}</p>
            </div>

            {/* Edit form */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Full Name *</label>
                  <Input
                    type="text"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Position</label>
                  <Input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., Doctor, Nutritionist, Fitness Coach"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Personal Number</label>
                  <Input
                    type="tel"
                    name="personal_number"
                    value={formData.personal_number}
                    onChange={handleChange}
                    placeholder="Your personal contact number"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Degree / Qualification</label>
                  <Input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="e.g., MD, B.Sc. Nutrition, Certified Fitness Trainer"
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Experience</label>
                  <Input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 10 years in healthcare"
                    className="mt-2"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 justify-end border-t border-slate-700/50">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.position && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Position</p>
                    <p className="text-sm text-slate-300 mt-2">{profile.position}</p>
                  </div>
                )}
                {profile.personal_number && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Personal Number</p>
                    <p className="text-sm text-slate-300 mt-2">{profile.personal_number}</p>
                  </div>
                )}
                {profile.degree && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Degree / Qualification</p>
                    <p className="text-sm text-slate-300 mt-2">{profile.degree}</p>
                  </div>
                )}
                {profile.experience && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Experience</p>
                    <p className="text-sm text-slate-300 mt-2">{profile.experience}</p>
                  </div>
                )}
                {!profile.position && !profile.degree && !profile.experience && (
                  <p className="text-sm text-slate-500 italic py-4">No additional profile details added yet. Click edit to add them.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
