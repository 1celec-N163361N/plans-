import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, FileText, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 ${scrolled ? 'top-2' : ''}`}>
      <div className={`max-w-5xl mx-auto glass-panel rounded-2xl transition-all duration-300 ${scrolled ? 'shadow-2xl bg-card/70' : 'shadow-lg bg-card/40'}`}>
        <div className="px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="خطط سيرك"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform drop-shadow-lg"
            />
            <span className="text-xl font-bold tracking-tight text-foreground">خطط سيرك</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">الرئيسية</Link>
            <Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors font-medium">التوثيق</Link>
            <Link href="/settings" className="text-muted-foreground hover:text-primary transition-colors font-medium">المظهر</Link>
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="default">لوحة التحكم</Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button variant="default">ابدأ الآن</Button>
                </Link>
              )}
            </div>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-foreground hover:bg-white/10 rounded-lg transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Expanded Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden md:hidden border-t border-white/10"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                <Link href="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <img src={`${import.meta.env.BASE_URL}logo.png`} alt="الرئيسية" className="w-5 h-5 object-contain" />
                  <span className="font-medium text-lg">الرئيسية</span>
                </Link>
                <Link href="/docs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <FileText className="text-primary" size={20} />
                  <span className="font-medium text-lg">التوثيق</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <Settings className="text-primary" size={20} />
                  <span className="font-medium text-lg">الإعدادات والمظهر</span>
                </Link>
                
                <div className="h-px bg-white/10 my-2" />
                
                {isAuthenticated ? (
                  <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary transition-colors">
                    <User size={20} />
                    <span className="font-bold text-lg">لوحة التحكم</span>
                  </Link>
                ) : (
                  <Link href="/auth" className="flex items-center gap-3 p-3 rounded-xl bg-primary text-primary-foreground transition-colors shadow-lg">
                    <User size={20} />
                    <span className="font-bold text-lg">تسجيل الدخول / حساب جديد</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
