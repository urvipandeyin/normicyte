import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CyberGrid from '@/components/landing/CyberGrid';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, Lock, Chrome, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const { t } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(t('invalidCredentials'));
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(t('loginSuccess'));
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error(t('emailAlreadyRegistered'));
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(t('signupSuccess'));
          navigate('/dashboard');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* Language toggle */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('backToHome')}</span>
      </button>

      {/* Animated background */}
      <CyberGrid />

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md p-8">
        <div className="glass-card-glow rounded-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-gradient-cyber">NormiCyte</span>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? t('loginSubtitle') : t('signupSubtitle')}
            </p>
          </div>

          {/* Google button */}
          <Button
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full h-12 bg-card hover:bg-muted border border-border text-foreground"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Chrome className="w-5 h-5 mr-2" />
            )}
            {t('continueWithGoogle')}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t('orContinueWith')}</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="agent@normicyte.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-input border-border"
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-input border-border"
                />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? t('signIn') : t('createAccount')
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center text-muted-foreground">
            {isLogin ? t('noAccount') : t('hasAccount')}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? t('signUp') : t('signIn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
