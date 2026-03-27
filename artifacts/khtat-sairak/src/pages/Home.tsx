import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Share2, Users, Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShapeGrid } from "@/components/ShapeGrid";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ShapeGrid />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-4 min-h-[90vh] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background z-0" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 text-primary font-medium text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              أفضل طريقة لتخطيط مسارك
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tight mb-6 leading-tight">
              خطط{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                سيرك
              </span>{" "}
              بذكاء
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              ارسم رحلاتك، طلعاتك، ومشاويرك بأسلوب احترافي. شاركها مع أصدقائك،
              وحدد نقاط التوقف على خريطة تفاعلية بكل سهولة.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isLoading &&
                (isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto text-xl gap-2 group"
                    >
                      لوحة التحكم
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto text-xl gap-2 group"
                    >
                      ابدأ مجاناً
                      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ))}
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="glass"
                  className="w-full sm:w-auto text-xl"
                >
                  التوثيق
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 relative z-10 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              مميزات صممت لأجلك
            </h2>
            <p className="text-muted-foreground text-lg">
              كل ما تحتاجه لتنظيم رحلة لا تُنسى في مكان واحد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: "خرائط تفاعلية",
                desc: "أضف نقاط التوقف، رتبها، وشاهد مسارك بوضوح تام على خريطة حية.",
              },
              {
                icon: Share2,
                title: "مشاركة سهلة",
                desc: "رابط واحد يكفي لمشاركة خطتك مع الجميع، سواء للرؤية أو التعديل.",
              },
              {
                icon: Users,
                title: "متعدد المستخدمين",
                desc: "خطط مع أصدقائك وعائلتك في نفس الوقت وفي مساحة واحدة.",
              },
              {
                icon: Shield,
                title: "آمن وخاص",
                desc: "احمِ خططك بكلمات مرور وخصص صلاحيات الوصول حسب رغبتتك.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card p-8 rounded-3xl group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-white/5 pt-16 pb-8 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <MapPin size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">خطط سيرك</span>
          </div>

          <div className="flex gap-6">
            <a
              href="https://x.com/N163361N"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Twitter / X
            </a>
            <a
              href="https://discord.gg/MQgaPegSgA"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Discord
            </a>
            <a
              href="https://github.com/1celec-N163361N/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://cranl.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors font-bold"
            >
              Cranl.com
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} خطط سيرك. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
