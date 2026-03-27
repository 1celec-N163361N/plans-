import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { Save, ArrowRight, Lock, Eye, EyeOff } from 'lucide-react';
import { useCreatePlan, useGetPlan, useUpdatePlan, CreatePlanRequestType, CreatePlanRequestStatus } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function PlanForm() {
  const params = useParams();
  const isEdit = !!params?.id;
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'رحلة' as CreatePlanRequestType,
    status: 'خاصة' as CreatePlanRequestStatus,
    password: '',
    notes: '',
    scheduledAt: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const { data: planToEdit, isLoading: isFetching } = useGetPlan(params?.id || '', {
    query: { enabled: isEdit }
  });

  useEffect(() => {
    if (isEdit && planToEdit) {
      setFormData({
        title: planToEdit.title,
        description: planToEdit.description || '',
        type: planToEdit.type as CreatePlanRequestType,
        status: planToEdit.status as CreatePlanRequestStatus,
        password: '', // Don't prefill password
        notes: planToEdit.notes || '',
        scheduledAt: planToEdit.scheduledAt ? new Date(planToEdit.scheduledAt).toISOString().slice(0, 16) : ''
      });
    }
  }, [isEdit, planToEdit]);

  const createMutation = useCreatePlan({
    mutation: {
      onSuccess: (data) => {
        toast.success("تم إنشاء الخطة بنجاح!");
        setLocation(`/plans/${data.id}`);
      },
      onError: () => toast.error("حدث خطأ أثناء الإنشاء")
    }
  });

  const updateMutation = useUpdatePlan({
    mutation: {
      onSuccess: (data) => {
        toast.success("تم تحديث الخطة بنجاح!");
        setLocation(`/plans/${data.id}`);
      },
      onError: () => toast.error("حدث خطأ أثناء التحديث")
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return toast.error("عنوان الخطة مطلوب");

    const payload = {
      ...formData,
      password: formData.password || null,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null
    };

    if (isEdit) {
      updateMutation.mutate({ id: params!.id, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isFetching) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="mb-8">
          <ArrowRight className="ml-2 w-5 h-5" /> عودة للوحة التحكم
        </Button>
        
        <div className="glass-panel p-8 md:p-10 rounded-3xl">
          <h1 className="text-3xl font-bold mb-8">
            {isEdit ? 'تعديل الخطة' : 'إنشاء خطة جديدة'}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">عنوان الخطة *</label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  placeholder="مثال: رحلة نهاية الأسبوع للبر"
                  required 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">وصف قصير</label>
                <Input 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="تفاصيل سريعة عن وجهتك..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">نوع الخطة</label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as CreatePlanRequestType})}
                >
                  <option value="رحلة">رحلة</option>
                  <option value="سفر">سفر</option>
                  <option value="طلعة">طلعة</option>
                  <option value="مشوار">مشوار</option>
                  <option value="مخصص">مخصص</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">حالة المشاركة</label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-border bg-background/50 px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as CreatePlanRequestStatus})}
                >
                  <option value="خاصة">خاصة (لي فقط)</option>
                  <option value="مشتركة">مشتركة (برابط)</option>
                  <option value="منتهية">منتهية (أرشيف)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">تاريخ ووقت البدء</label>
                <Input 
                  type="datetime-local" 
                  value={formData.scheduledAt} 
                  onChange={e => setFormData({...formData, scheduledAt: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Lock size={16} /> 
                  كلمة مرور (اختياري لحماية الخطة المشتركة)
                </label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder="اتركه فارغاً إن لم ترغب بحماية"
                  />
                  <button 
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">ملاحظات إضافية</label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all duration-200 resize-none"
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  placeholder="أي شيء آخر تود تدوينه..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <Button type="submit" size="lg" disabled={isPending} className="w-full md:w-auto px-12">
                {isPending ? 'جاري الحفظ...' : (
                  <><Save className="ml-2 w-5 h-5" /> حفظ الخطة</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
