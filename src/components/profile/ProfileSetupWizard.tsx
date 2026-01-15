import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadAvatar } from '@/firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  User, ChevronRight, ChevronLeft, Check, Upload, 
  GraduationCap, Zap, Shield, Sparkles, Globe
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=cyber1&backgroundColor=0d1117',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=cyber2&backgroundColor=0d1117',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=cyber3&backgroundColor=0d1117',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=cyber4&backgroundColor=0d1117',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=cyber5&backgroundColor=0d1117',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=cyber6&backgroundColor=0d1117',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=agent1&backgroundColor=0d1117',
  'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=agent2&backgroundColor=0d1117',
];

const ROLES = [
  { value: 'student', labelKey: 'roleStudent', icon: GraduationCap, descKey: 'roleStudentDesc' },
  { value: 'beginner', labelKey: 'roleBeginner', icon: Zap, descKey: 'roleBeginnerDesc' },
  { value: 'cyber_learner', labelKey: 'roleCyberLearner', icon: Shield, descKey: 'roleCyberLearnerDesc' },
  { value: 'enthusiast', labelKey: 'roleEnthusiast', icon: Sparkles, descKey: 'roleEnthusiastDesc' },
];

interface ProfileSetupWizardProps {
  onComplete: () => void;
}

const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({ onComplete }) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || PRESET_AVATARS[0]);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [role, setRole] = useState(profile?.role || 'cyber_learner');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(t('invalidFileType'));
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('fileTooLarge'));
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const { url, error } = await uploadAvatar(
        user.uid, 
        file,
        (progress) => setUploadProgress(progress)
      );

      if (error) {
        console.error('Avatar upload error:', error);
        throw error;
      }

      if (url) {
        setAvatarUrl(url);
        toast.success(t('avatarUploaded'));
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      // More specific error messages
      if (error?.code === 'storage/unauthorized') {
        toast.error(language === 'hi' ? 'अपलोड की अनुमति नहीं है' : 'Upload not authorized');
      } else if (error?.code === 'storage/canceled') {
        toast.error(language === 'hi' ? 'अपलोड रद्द किया गया' : 'Upload canceled');
      } else {
        toast.error(t('uploadFailed'));
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset input
      e.target.value = '';
    }
  };

  const handleComplete = async () => {
    if (!displayName.trim()) {
      toast.error(t('enterDisplayName'));
      return;
    }

    setSaving(true);
    try {
      const { error } = await updateProfile({
        display_name: displayName.trim(),
        username: username.trim() || null,
        role,
        avatar_url: avatarUrl,
        language_preference: language,
        profile_completed: true,
      });

      if (error) throw error;

      await refreshProfile();
      toast.success(t('profileCreated'));
      onComplete();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(t('profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="glass-card-glow rounded-2xl max-w-lg w-full p-8 space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-1 mx-2 rounded ${
                  step > s ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Avatar */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('chooseAvatar')}</h2>
              <p className="text-muted-foreground">{t('avatarSubtitle')}</p>
            </div>

            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden bg-muted">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-full aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                    avatarUrl === url 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="text-center space-y-3">
              <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Upload className="w-4 h-4" />
                <span className="text-sm">{uploading ? t('uploading') : t('uploadCustom')}</span>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/gif,image/webp" 
                  onChange={handleFileUpload}
                  className="hidden" 
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <div className="w-full max-w-xs mx-auto">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(uploadProgress)}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('yourIdentity')}</h2>
              <p className="text-muted-foreground">{t('identitySubtitle')}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t('displayName')} *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="displayName"
                    placeholder={t('displayNamePlaceholder')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 h-12 bg-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">{t('username')} ({t('optional')})</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="username"
                    placeholder="cyber_agent"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="pl-8 h-12 bg-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Role */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('selectRole')}</h2>
              <p className="text-muted-foreground">{t('roleSubtitle')}</p>
            </div>

            <div className="space-y-3">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      role === r.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        role === r.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{t(r.labelKey)}</p>
                        <p className="text-sm text-muted-foreground">{t(r.descKey)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Language */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">{t('selectLanguage')}</h2>
              <p className="text-muted-foreground">{t('languageSubtitle')}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setLanguage('en')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  language === 'en'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">English</p>
                    <p className="text-sm text-muted-foreground">Continue in English</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setLanguage('hi')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  language === 'hi'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    language === 'hi' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">हिंदी</p>
                    <p className="text-sm text-muted-foreground">हिंदी में जारी रखें</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('back')}
          </Button>

          {step < 4 ? (
            <Button 
              onClick={() => setStep(step + 1)}
              className="gap-2 bg-gradient-to-r from-primary to-secondary"
            >
              {t('next')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleComplete}
              disabled={saving || !displayName.trim()}
              className="gap-2 bg-gradient-to-r from-primary to-secondary"
            >
              {saving ? t('saving') : t('complete')}
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupWizard;
