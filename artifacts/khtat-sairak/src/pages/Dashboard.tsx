import { Link } from 'wouter';
import { Plus, Map, Calendar, LogOut } from 'lucide-react';
import { useGetPlans, useLogout } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function Dashboard() {
  const { data: plans, isLoading } = useGetPlans();
  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        window.location.href = '/';
      }
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'خاصة': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'مشتركة': return 'bg-primary/20 text-primary border-primary/30';
      case 'منتهية': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">لوحة التحكم</h1>
            <p className="text-muted-foreground text-lg">أهلاً بك، إليك جميع خططك ورحلاتك القادمة.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/plans/new">
              <Button size="lg" className="gap-2">
                <Plus size={20} />
                خطة جديدة
              </Button>
            </Link>
            <Button size="lg" variant="glass" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
              <LogOut size={20} className="ml-2" />
              خروج
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 glass-card rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : plans?.length === 0 ? (
          <div className="text-center py-32 glass-panel rounded-3xl">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <Map size={48} />
            </div>
            <h3 className="text-2xl font-bold mb-2">لا توجد خطط بعد</h3>
            <p className="text-muted-foreground mb-8">ابدأ بإنشاء أول خطة لك لتنظيم رحلتك القادمة</p>
            <Link href="/plans/new">
              <Button size="lg">إنشاء خطة جديدة</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans?.map((plan) => (
              <Link key={plan.id} href={`/plans/${plan.id}`}>
                <div className="glass-card rounded-3xl p-6 h-full flex flex-col cursor-pointer group hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10">
                      {plan.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(plan.status)}`}>
                      {plan.status}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{plan.title}</h3>
                  <p className="text-muted-foreground line-clamp-2 mb-6 flex-grow">
                    {plan.description || "لا يوجد وصف"}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-white/5">
                    <Calendar size={16} />
                    <span>{formatDate(plan.scheduledAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
