import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { MapPin, LogIn, UserPlus } from 'lucide-react';
import { useLogin, useRegister } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShapeGrid } from '@/components/ShapeGrid';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        toast.success("تم تسجيل الدخول بنجاح");
        // Reload to let AuthContext pick up the cookie
        window.location.href = '/dashboard'; 
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || "فشل تسجيل الدخول");
      }
    }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: () => {
        toast.success("تم إنشاء الحساب بنجاح");
        window.location.href = '/dashboard';
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.error || "فشل إنشاء الحساب");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ data: { email, password } });
    } else {
      if (!username) return toast.error("يرجى إدخال اسم المستخدم");
      registerMutation.mutate({ data: { email, password, username } });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <ShapeGrid />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 md:p-10 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground shadow-xl">
              <MapPin size={32} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">
            {isLogin ? 'أهلاً بعودتك' : 'ابدأ رحلتك معنا'}
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            {isLogin ? 'سجل دخولك لمتابعة خططك' : 'أنشئ حسابك وابدأ التخطيط الآن'}
          </p>

          <div className="flex bg-black/20 p-1 rounded-xl mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium mb-1 ml-1 text-muted-foreground">اسم المستخدم</label>
                  <Input 
                    placeholder="Ahmed" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <label className="block text-sm font-medium mb-1 ml-1 text-muted-foreground">البريد الإلكتروني</label>
              <Input 
                type="email" 
                placeholder="ahmed@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 ml-1 text-muted-foreground">كلمة المرور</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
              {isLoading ? 'جاري المعالجة...' : isLogin ? (
                <><LogIn className="ml-2 w-5 h-5" /> دخول</>
              ) : (
                <><UserPlus className="ml-2 w-5 h-5" /> إنشاء حساب</>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// Missing AnimatePresence import fix
import { AnimatePresence } from 'framer-motion';
