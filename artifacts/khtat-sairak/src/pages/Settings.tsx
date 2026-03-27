import { useTheme } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { Check, Palette } from "lucide-react";
import { motion } from "framer-motion";

const themes = [
  {
    id: "dark-luxury",
    name: "الأسود الفاخر",
    desc: "خلفية داكنة مع لمسات ذهبية غنية",
    color: "#c9a227",
    bg: "#0a0a0f",
    icon: "🖤",
  },
  {
    id: "light-elegant",
    name: "الأبيض الأنيق",
    desc: "نظيف وناصع مع تفاصيل برونزية",
    color: "#8b6914",
    bg: "#fafafa",
    icon: "🤍",
  },
  {
    id: "midnight-blue",
    name: "أزرق منتصف الليل",
    desc: "عميق ومريح للعين مع أزرق كهربائي",
    color: "#4d9de0",
    bg: "#050d1a",
    icon: "💙",
  },
  {
    id: "emerald-premium",
    name: "الزمرد الفاخر",
    desc: "درجات الفحمي مع الأخضر الزمردي",
    color: "#10b981",
    bg: "#0d1117",
    icon: "💚",
  },
  {
    id: "eid-festive",
    name: "ثيم العيد 🌙",
    desc: "احتفل بالعيد خلفية ليلية مع ذهب وهلال",
    color: "#f5c518",
    bg: "#061209",
    icon: "✨",
    eid: true,
  },
] as const;

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Palette className="text-primary" size={36} />
            المظهر والإعدادات
          </h1>
          <p className="text-muted-foreground text-lg">
            اختر الثيم الذي يناسب ذوقك وتجربتك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map((t) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              className={`relative overflow-hidden text-right p-6 rounded-3xl border-2 transition-all duration-300 ${
                theme === t.id
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-border/50 hover:border-white/20 bg-card/40"
              } ${"eid" in t && t.eid ? "md:col-span-2" : ""}`}
              style={{
                backgroundColor: theme === t.id ? "var(--card)" : undefined,
              }}
            >
              {"eid" in t && t.eid && (
                <>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, #061209 0%, #0d2318 40%, #1a3a20 100%)`,
                      opacity: 0.95,
                    }}
                  />
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[
                      {
                        top: "12%",
                        right: "8%",
                        size: 18,
                        dur: "2.5s",
                        delay: "0s",
                      },
                      {
                        top: "20%",
                        right: "25%",
                        size: 10,
                        dur: "3.2s",
                        delay: "0.5s",
                      },
                      {
                        top: "65%",
                        right: "15%",
                        size: 14,
                        dur: "2.8s",
                        delay: "1s",
                      },
                      {
                        top: "50%",
                        right: "45%",
                        size: 8,
                        dur: "4s",
                        delay: "0.3s",
                      },
                      {
                        top: "30%",
                        right: "60%",
                        size: 12,
                        dur: "3s",
                        delay: "1.5s",
                      },
                      {
                        top: "75%",
                        right: "70%",
                        size: 9,
                        dur: "2.2s",
                        delay: "0.8s",
                      },
                      {
                        top: "10%",
                        right: "80%",
                        size: 16,
                        dur: "3.5s",
                        delay: "0.2s",
                      },
                    ].map((s, i) => (
                      <svg
                        key={i}
                        className="absolute eid-star"
                        style={
                          {
                            top: s.top,
                            right: s.right,
                            "--dur": s.dur,
                            "--delay": s.delay,
                          } as any
                        }
                        width={s.size}
                        height={s.size}
                        viewBox="0 0 24 24"
                        fill="#f5c518"
                      >
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ))}
                    <svg
                      className="absolute eid-crescent"
                      style={{ top: "15%", left: "6%" }}
                      width="52"
                      height="52"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d="M 70 50 A 30 30 0 1 1 70 50.01 A 20 20 0 1 0 70 50"
                        fill="#f5c518"
                        opacity="0.9"
                      />
                    </svg>
                  </div>
                </>
              )}

              {!("eid" in t && t.eid) && (
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, transparent, ${t.color} 200%)`,
                  }}
                />
              )}

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div
                  className="w-12 h-12 rounded-full border-4 border-white/10 shadow-inner flex items-center justify-center"
                  style={{ backgroundColor: t.color }}
                >
                  {theme === t.id ? (
                    <Check className="text-white" size={24} />
                  ) : (
                    <span className="text-xl">{t.icon}</span>
                  )}
                </div>
                <div
                  className="w-8 h-8 rounded-full border border-white/20"
                  style={{ backgroundColor: t.bg }}
                />
              </div>

              <h3
                className="text-xl font-bold mb-2 relative z-10"
                style={"eid" in t && t.eid ? { color: "#f5c518" } : {}}
              >
                {t.name}
              </h3>
              <p
                className="text-sm relative z-10"
                style={
                  "eid" in t && t.eid
                    ? { color: "rgba(245,197,24,0.7)" }
                    : undefined
                }
              >
                {!("eid" in t && t.eid) && (
                  <span className="text-muted-foreground">{t.desc}</span>
                )}
                {"eid" in t && t.eid && t.desc}
              </p>
              {"eid" in t && t.eid && (
                <p
                  className="text-xs mt-2 relative z-10"
                  style={{ color: "rgba(245,197,24,0.5)" }}
                >
                  ✨ ثيم موسمي خاص بمناسبة حلول العيد المبارك
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
