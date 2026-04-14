import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { getInitials } from '@/lib/utils';

export function DoctorProfileCard() {
  const { profile } = useAuth();
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
      const { error } = await supabase
        .from('users')
        .update({
          display_name: formData.display_name,
          position: formData.position,
          personal_number: formData.personal_number,
          degree: formData.degree,
          experience: formData.experience,
        })
        .eq('id', profile.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update profile:', error.message);
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

  if (!profile) return null;

  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with avatar and edit button */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full brand-gradient-bg flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {getInitials(profile.display_name || 'U')}
              </div>
              {!isEditing && (
                <div>
                  <h3 className="font-semibold text-white text-lg">{profile.display_name}</h3>
                  {profile.position && (
                    <p className="text-xs text-slate-400">{profile.position}</p>
                  )}
                </div>
              )}
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title="Edit profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Form fields */}
          {isEditing ? (
            <div className="space-y-3 pt-4 border-t border-slate-700/50">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Name</label>
                <Input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Position</label>
                <Input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g., Doctor, Nutritionist"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Personal Number</label>
                <Input
                  type="tel"
                  name="personal_number"
                  value={formData.personal_number}
                  onChange={handleChange}
                  placeholder="Your personal number"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide font-medium">Degree</label>
                <Input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g., MD, B.Sc. Nutrition"
                  className="mt-1"
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
                  className="mt-1"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  leftIcon={<X className="w-3.5 h-3.5" />}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  loading={isSaving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-slate-700/50">
              {profile.position && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Position</p>
                  <p className="text-sm text-slate-300 mt-1">{profile.position}</p>
                </div>
              )}
              {profile.personal_number && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Personal Number</p>
                  <p className="text-sm text-slate-300 mt-1">{profile.personal_number}</p>
                </div>
              )}
              {profile.degree && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Degree</p>
                  <p className="text-sm text-slate-300 mt-1">{profile.degree}</p>
                </div>
              )}
              {profile.experience && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Experience</p>
                  <p className="text-sm text-slate-300 mt-1">{profile.experience}</p>
                </div>
              )}
              {!profile.position && !profile.degree && !profile.experience && (
                <p className="text-xs text-slate-500 italic">No profile details added yet. Click edit to add them.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
