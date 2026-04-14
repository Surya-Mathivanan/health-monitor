import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 chars'),
});
const registerSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Name must be at least 2 chars'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  path: ['confirmPassword'], message: 'Passwords do not match',
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const regForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  async function handleGoogleLogin() {
    setAuthError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setAuthError(error.message);
  }

  async function handleLogin(data: LoginForm) {
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email, password: data.password,
    });
    if (error) setAuthError(error.message);
    else navigate('/dashboard');
  }

  async function handleRegister(data: RegisterForm) {
    setAuthError('');
    const { error, data: res } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { display_name: data.displayName } },
    });
    if (error) { setAuthError(error.message); return; }
    // Insert into users table
    if (res.user) {
      await supabase.from('users').upsert({
        id: res.user.id,
        email: data.email,
        display_name: data.displayName,
        role: 'staff',
      });
    }
    setTab('login');
    setAuthError('Registration successful! Please check your email to confirm your account.');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDFoNjBNMSAwaC4wMU02MCAxdjYwTTEgNjBoNjAiIHN0cm9rZT0iIzFlMjkzYiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-2xl brand-gradient-bg flex items-center justify-center shadow-brand-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">LifeCare Wellness</h1>
            <p className="text-slate-400 text-sm mt-1">Comprehensive Health Management</p>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-6">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl mb-6">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                id={`auth-tab-${t}`}
                onClick={() => { setTab(t); setAuthError(''); }}
                className={tab === t
                  ? 'flex-1 py-2 text-sm font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all'
                  : 'flex-1 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white transition-all'}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Google OAuth */}
          {/* <Button
            id="google-login-btn"
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleLogin}
            leftIcon={<Globe className="w-4 h-4" />}
          >
            Continue with Google
          </Button> */}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-700/60" />
            <span className="text-slate-500 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>

          {/* Error / success message */}
          {authError && (
            <div className={`mb-4 p-3 rounded-xl text-sm border ${
              authError.startsWith('Registration') 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {authError}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="flex flex-col gap-4">
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <Input
                id="login-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />
              <Button
                id="login-submit-btn"
                type="submit"
                className="w-full mt-2"
                loading={loginForm.formState.isSubmitting}
              >
                Sign In
              </Button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={regForm.handleSubmit(handleRegister)} className="flex flex-col gap-4">
              <Input
                id="register-name"
                label="Full Name"
                type="text"
                placeholder="Dr. John Smith"
                error={regForm.formState.errors.displayName?.message}
                {...regForm.register('displayName')}
              />
              <Input
                id="register-email"
                label="Email Address"
                type="email"
                placeholder="you@gmail.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={regForm.formState.errors.email?.message}
                {...regForm.register('email')}
              />
              <Input
                id="register-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPass(s => !s)}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={regForm.formState.errors.password?.message}
                {...regForm.register('password')}
              />
              <Input
                id="register-confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={regForm.formState.errors.confirmPassword?.message}
                {...regForm.register('confirmPassword')}
              />
              <Button
                id="register-submit-btn"
                type="submit"
                className="w-full mt-2"
                loading={regForm.formState.isSubmitting}
              >
                Create Account
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Protected by Supabase Auth · JWT Secured
        </p>
      </div>
    </div>
  );
}
