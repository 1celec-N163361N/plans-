import { Navbar } from '@/components/Navbar';
import { BookOpen, MapPin, Share2, Shield, Code } from 'lucide-react';

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 pt-32 pb-20 flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-32 glass-panel p-6 rounded-3xl">
            <h3 className="font-bold text-lg mb-4 text-primary">المحتويات</h3>
            <ul className="space-y-3">
              <li><a href="#intro" className="text-muted-foreground hover:text-foreground transition-colors block">مقدمة</a></li>
              <li><a href="#create" className="text-muted-foreground hover:text-foreground transition-colors block">إنشاء خطة</a></li>
              <li><a href="#points" className="text-muted-foreground hover:text-foreground transition-colors block">إضافة النقاط</a></li>
              <li><a href="#share" className="text-muted-foreground hover:text-foreground transition-colors block">المشاركة</a></li>
              <li><a href="#security" className="text-muted-foreground hover:text-foreground transition-colors block">الأمان</a></li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-16">
          <section id="intro">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><BookOpen size={24} /></div>
              <h1 className="text-4xl font-bold">مقدمة عن خطط سيرك</h1>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              "خطط سيرك" هو منصتك المتكاملة لتخطيط وتوثيق الرحلات والطلعات. سواء كنت تخطط لرحلة برية طويلة، أو مجرد مشوار صغير داخل المدينة، يوفر لك التطبيق الأدوات اللازمة للترتيب والمشاركة بسهولة.
            </p>
          </section>

          <section id="create">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><MapPin size={24} /></div>
              <h2 className="text-3xl font-bold">إنشاء خطة جديدة</h2>
            </div>
            <div className="glass-card p-6 rounded-2xl mb-4">
              <p className="text-muted-foreground leading-relaxed">
                من لوحة التحكم، اضغط على "خطة جديدة". يمكنك تحديد نوع الخطة (رحلة، سفر، طلعة...) وتحديد حالة الخصوصية (خاصة، أو مشتركة). يمكنك أيضاً إضافة تاريخ ووقت ووصف تفصيلي.
              </p>
            </div>
          </section>

          <section id="points">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><MapPin size={24} /></div>
              <h2 className="text-3xl font-bold">إضافة وترتيب النقاط</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              بعد إنشاء الخطة، ستنتقل لصفحة الخريطة. يمكنك إضافة نقاط التوقف بالنقر المباشر على الخريطة. بعد الإضافة، يمكنك سحب النقاط وإفلاتها (Drag & Drop) في القائمة الجانبية لإعادة ترتيب مسارك بسلاسة.
            </p>
          </section>

          <section id="share">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><Share2 size={24} /></div>
              <h2 className="text-3xl font-bold">المشاركة مع الآخرين</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              اضغط على زر المشاركة أعلى يمين صفحة الخطة لنسخ رابط الدعوة. أي شخص يحمل الرابط سيمكنه رؤية الخطة التفاعلية ونقاط التوقف (بوضع القراءة فقط).
            </p>
          </section>

          <section id="security">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 text-primary"><Shield size={24} /></div>
              <h2 className="text-3xl font-bold">الأمان وكلمات المرور</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              عند إنشاء خطة "مشتركة"، يمكنك إضافة كلمة مرور. سيتعين على أي زائر كتابة كلمة المرور قبل أن يتمكن من رؤية محتوى الرابط. هذا يضمن خصوصية رحلاتك حتى لو تم تسريب الرابط عن طريق الخطأ.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
