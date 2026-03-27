import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Shield, MapPin, Eye, Lock } from 'lucide-react';
import { useGetInvite, useVerifyPlanPassword, useGetStops } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Map } from '@/components/Map';
import { ShapeGrid } from '@/components/ShapeGrid';
import { toast } from 'sonner';

export default function Invite() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const { data: inviteInfo, isLoading } = useGetInvite(token || '');
  
  // Only fetch stops if no password needed, or if successfully unlocked
  const { data: stops } = useGetStops(inviteInfo?.planId || '', {
    query: { enabled: !!inviteInfo?.planId && (!inviteInfo?.hasPassword || isUnlocked) }
  });

  const verifyMutation = useVerifyPlanPassword({
    mutation: {
      onSuccess: () => {
        setIsUnlocked(true);
        toast.success("تم التحقق بنجاح");
      },
      onError: () => toast.error("كلمة المرور خاطئة")
    }
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteInfo?.planId) {
      verifyMutation.mutate({ id: inviteInfo.planId, data: { password } });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;
  if (!inviteInfo) return <div className="min-h-screen flex items-center justify-center text-xl">رابط غير صالح أو منتهي الصلاحية</div>;

  const needsPassword = inviteInfo.hasPassword && !isUnlocked;

  if (needsPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <ShapeGrid />
        <div className="glass-panel p-8 max-w-md w-full rounded-3xl relative z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">خطة محمية بكلمة مرور</h2>
          <p className="text-muted-foreground mb-6">قام {inviteInfo.ownerName} بحماية هذه الخطة. يرجى إدخال كلمة المرور للوصول.</p>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <Input 
              type="password" 
              placeholder="كلمة المرور..." 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="text-center text-xl tracking-widest"
            />
            <Button type="submit" className="w-full" size="lg" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? 'جاري التحقق...' : 'فتح الخطة'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Viewing Mode
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col border-l border-white/10 glass-panel z-10 shadow-2xl">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold">{inviteInfo.title}</h1>
            <span className="px-2 py-1 rounded bg-white/5 text-xs border border-white/10">{inviteInfo.type}</span>
          </div>
          <p className="text-muted-foreground text-sm mb-4">{inviteInfo.description}</p>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield size={14} className="text-primary" />
            بواسطة {inviteInfo.ownerName}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <MapPin className="text-primary" /> نقاط التوقف ({stops?.length || 0})
          </h2>
          
          {stops?.sort((a,b) => a.order - b.order).map((stop, i) => (
            <div key={stop.id} className="glass-card p-4 rounded-2xl flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <h4 className="font-bold text-sm">{stop.name}</h4>
                {stop.notes && <p className="text-xs text-muted-foreground mt-1">{stop.notes}</p>}
              </div>
            </div>
          ))}
          {stops?.length === 0 && (
            <p className="text-muted-foreground text-center text-sm pt-8">لا توجد نقاط توقف مضافة بعد.</p>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10 text-center">
          <Button variant="outline" className="w-full" onClick={() => setLocation('/')}>
            اصنع خطتك الخاصة مجاناً
          </Button>
        </div>
      </div>
      
      <div className="flex-1 h-[50vh] lg:h-screen sticky top-0 z-0">
        <Map stops={stops || []} interactive={false} />
      </div>
    </div>
  );
}
