import { useState, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  MapPin, Plus, ArrowRight, GripVertical, Trash2, Edit2, Link2,
  Tent, Package, Navigation, CheckSquare, Square, X, UserCircle
} from 'lucide-react';
import { useGetPlan, useCreateStop, useUpdateStop, useDeleteStop, useSharePlan } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Map } from '@/components/Map';
import { toast } from 'sonner';

/* ── Types ─────────────────────────────── */
interface Activity { id: string; label: string; icon: string; checked: boolean; }
interface GearItem  { id: string; name: string; assignedTo: string; done: boolean; }

/* ── Predefined activities ──────────────── */
const DEFAULT_ACTIVITIES: Omit<Activity, 'checked'>[] = [
  { id: 'bbq',      icon: '🔥', label: 'شواء'              },
  { id: 'camp',     icon: '⛺', label: 'مخيم / خيام'       },
  { id: 'jeep',     icon: '🚙', label: 'رحلة جيب'          },
  { id: 'coffee',   icon: '☕', label: 'ورد وقهوة'          },
  { id: 'fish',     icon: '🎣', label: 'صيد'               },
  { id: 'sports',   icon: '⚽', label: 'ألعاب رياضية'      },
  { id: 'night',    icon: '🌙', label: 'سمر ليلي'          },
  { id: 'music',    icon: '🎵', label: 'موسيقى'            },
  { id: 'hike',     icon: '🚶', label: 'مشي وتنزه'         },
  { id: 'games',    icon: '🎮', label: 'ألعاب جماعية'      },
  { id: 'stars',    icon: '🔭', label: 'مراقبة النجوم'     },
  { id: 'sand',     icon: '🏜️', label: 'قيادة على الرمال' },
];

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

async function patchPlan(id: string, path: string, body: any) {
  const res = await fetch(`${BASE_URL}/api/plans/${id}/${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function PlanView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: plan, isLoading, refetch } = useGetPlan(id);

  const [tab, setTab] = useState<'stops' | 'activities' | 'gear'>('stops');

  /* ── Stops state ── */
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStopData, setNewStopData] = useState({ name: '', notes: '', lat: null as number | null, lng: null as number | null });

  const createStop  = useCreateStop({ mutation: { onSuccess: () => { refetch(); setIsAddingStop(false); setNewStopData({name:'',notes:'',lat:null,lng:null}); toast.success("تم الإضافة"); } } });
  const updateStop  = useUpdateStop({ mutation: { onSuccess: () => refetch() } });
  const deleteStop  = useDeleteStop({ mutation: { onSuccess: () => { refetch(); toast.success("تم الحذف"); } } });

  /* ── Share ── */
  const [shareAction, setShareAction] = useState<'copy'|'whatsapp'>('copy');
  const sharePlan = useSharePlan({
    mutation: {
      onSuccess: (data) => {
        const fullUrl = data.shareUrl.startsWith('http') ? data.shareUrl : `${window.location.origin}${data.shareUrl}`;
        if (shareAction === 'whatsapp') {
          window.open(`https://wa.me/?text=${encodeURIComponent(`🗺️ شاركني هذه الخطة: "${plan?.title}"\n${fullUrl}`)}`, '_blank');
        } else {
          navigator.clipboard.writeText(fullUrl);
          toast.success("تم نسخ رابط المشاركة!");
        }
      }
    }
  });
  const handleShare = (action: 'copy'|'whatsapp') => { setShareAction(action); sharePlan.mutate({ id }); };

  /* ── Activities ── */
  const rawActivities: Activity[] = (plan as any)?.activities?.length
    ? (plan as any).activities
    : DEFAULT_ACTIVITIES.map(a => ({ ...a, checked: false }));

  const toggleActivity = async (actId: string) => {
    const updated = rawActivities.map(a => a.id === actId ? { ...a, checked: !a.checked } : a);
    try { await patchPlan(id, 'activities', { activities: updated }); refetch(); }
    catch { toast.error("فشل الحفظ"); }
  };

  /* ── Gear ── */
  const gearItems: GearItem[] = (plan as any)?.gearItems || [];
  const [newGearName, setNewGearName]   = useState('');
  const [newGearPerson, setNewGearPerson] = useState('');

  const saveGear = useCallback(async (items: GearItem[]) => {
    try { await patchPlan(id, 'gear', { gearItems: items }); refetch(); }
    catch { toast.error("فشل الحفظ"); }
  }, [id]);

  const addGearItem = async () => {
    if (!newGearName.trim()) return toast.error("اسم الغرض مطلوب");
    const item: GearItem = { id: crypto.randomUUID(), name: newGearName.trim(), assignedTo: newGearPerson.trim(), done: false };
    await saveGear([...gearItems, item]);
    setNewGearName(''); setNewGearPerson('');
  };

  const toggleGearDone = (gId: string) => saveGear(gearItems.map(g => g.id === gId ? { ...g, done: !g.done } : g));
  const removeGearItem = (gId: string) => saveGear(gearItems.filter(g => g.id !== gId));

  /* ── Map ── */
  const handleMapClick = (lat: number, lng: number, name?: string) => {
    setNewStopData(prev => ({ ...prev, lat, lng, name: name ?? prev.name }));
    setIsAddingStop(true);
    setTab('stops');
  };

  const handleAddStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStopData.name) return toast.error("اسم النقطة مطلوب");
    createStop.mutate({ id, data: { name: newStopData.name, notes: newStopData.notes, lat: newStopData.lat, lng: newStopData.lng, order: plan?.stops?.length || 0 } });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !plan?.stops) return;
    const items = Array.from(plan.stops);
    const [r] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, r);
    items.forEach((item, index) => { if (item.order !== index) updateStop.mutate({ id, stopId: item.id, data: { order: index } }); });
  };

  /* ── Google Maps full-route link ── */
  const sortedStops = [...(plan?.stops || [])].sort((a, b) => a.order - b.order).filter(s => s.lat && s.lng);
  const googleMapsRouteUrl = sortedStops.length >= 2
    ? `https://www.google.com/maps/dir/${sortedStops.map(s => `${s.lat},${s.lng}`).join('/')}`
    : sortedStops.length === 1
      ? `https://www.google.com/maps?q=${sortedStops[0].lat},${sortedStops[0].lng}`
      : null;

  /* ── Render guards ── */
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;
  if (!plan) return <div className="min-h-screen flex items-center justify-center text-xl">الخطة غير موجودة</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">

      {/* ── Side panel ── */}
      <div className="w-full lg:w-[460px] xl:w-[500px] flex-shrink-0 flex flex-col border-l border-white/10 glass-panel z-10 shadow-2xl">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard')} className="mb-3 text-muted-foreground hover:text-foreground">
            <ArrowRight className="ml-2 w-4 h-4" /> رجوع
          </Button>
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-xl font-bold leading-snug">{plan.title}</h1>
            <div className="flex gap-1.5 flex-shrink-0 mr-2">
              <Button size="icon" variant="ghost" onClick={() => setLocation(`/plans/${id}/edit`)} title="تعديل">
                <Edit2 size={16} />
              </Button>
              <Button size="icon" variant="outline" title="نسخ رابط" onClick={() => handleShare('copy')} disabled={sharePlan.isPending}>
                <Link2 size={16} className="text-primary" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleShare('whatsapp')} disabled={sharePlan.isPending}
                className="gap-1.5 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366] px-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="text-xs">واتساب</span>
              </Button>
              {googleMapsRouteUrl && (
                <a href={googleMapsRouteUrl} target="_blank" rel="noreferrer" title="افتح المسار في قوقل ماب"
                  className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-md border text-xs font-semibold border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 transition-colors">
                  <Navigation size={14} />
                  ماب
                </a>
              )}
            </div>
          </div>
          {plan.description && <p className="text-muted-foreground text-sm mb-3">{plan.description}</p>}
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded bg-white/5 text-xs border border-white/10">{plan.type}</span>
            <span className="px-2 py-0.5 rounded bg-white/5 text-xs border border-white/10">{plan.status}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {([
            { key: 'stops',      icon: <MapPin size={15}/>,    label: 'نقاط التوقف' },
            { key: 'activities', icon: <Tent size={15}/>,      label: 'فعاليات البر' },
            { key: 'gear',       icon: <Package size={15}/>,   label: 'توزيع الأغراض' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ══ STOPS TAB ══ */}
          {tab === 'stops' && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">{plan.stops?.length || 0} نقطة</span>
                <Button size="sm" onClick={() => setIsAddingStop(true)} variant="outline" className="text-xs gap-1">
                  <Plus size={14}/> إضافة
                </Button>
              </div>

              {isAddingStop && (
                <form onSubmit={handleAddStopSubmit} className="glass-card p-4 rounded-2xl mb-5 space-y-3 border border-primary/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse inline-block"/>
                    <h3 className="font-bold text-sm">{newStopData.lat ? '📍 تم تحديد الموقع' : 'نقطة جديدة'}</h3>
                  </div>
                  {newStopData.lat && (
                    <p className="text-xs text-muted-foreground">
                      {newStopData.lat.toFixed(5)}، {newStopData.lng?.toFixed(5)}
                      {!newStopData.name && <span className="mr-2 text-yellow-500">• جارٍ التعرف...</span>}
                    </p>
                  )}
                  {!newStopData.lat && <p className="text-xs text-muted-foreground">أو انقر على الخريطة</p>}
                  <Input autoFocus placeholder="اسم النقطة" value={newStopData.name} onChange={e => setNewStopData({...newStopData, name: e.target.value})} />
                  <Input placeholder="ملاحظات (اختياري)" value={newStopData.notes} onChange={e => setNewStopData({...newStopData, notes: e.target.value})} />
                  <div className="flex gap-2 pt-1">
                    <Button type="submit" size="sm" className="flex-1" disabled={createStop.isPending}>حفظ</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => { setIsAddingStop(false); setNewStopData({name:'',notes:'',lat:null,lng:null}); }}>إلغاء</Button>
                  </div>
                </form>
              )}

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="stops">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2.5">
                      {plan.stops?.sort((a,b) => a.order - b.order).map((stop, index) => (
                        <Draggable key={stop.id} draggableId={stop.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`glass-card p-3.5 rounded-2xl flex items-center gap-2.5 transition-shadow ${snapshot.isDragging ? 'shadow-xl border-primary/50' : ''}`}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground flex-shrink-0">
                                <GripVertical size={18} />
                              </div>
                              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{stop.name}</h4>
                                {stop.notes && <p className="text-xs text-muted-foreground truncate">{stop.notes}</p>}
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                {stop.lat && stop.lng && (
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`}
                                    target="_blank" rel="noreferrer"
                                    title="افتح في قوقل ماب"
                                    className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors"
                                  >
                                    <Navigation size={14} />
                                  </a>
                                )}
                                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 h-7 w-7" onClick={() => deleteStop.mutate({ id, stopId: stop.id })}>
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {plan.stops?.length === 0 && !isAddingStop && (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl mt-4">
                  <MapPin className="mx-auto mb-2 text-muted-foreground" size={28} />
                  <p className="text-muted-foreground text-sm">انقر على الخريطة لإضافة أول نقطة</p>
                </div>
              )}
            </div>
          )}

          {/* ══ ACTIVITIES TAB ══ */}
          {tab === 'activities' && (
            <div className="p-5">
              <p className="text-muted-foreground text-xs mb-5">اختر فعاليات طلعتكم 🏕️</p>
              <div className="grid grid-cols-2 gap-3">
                {rawActivities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => toggleActivity(act.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-right transition-all duration-200 ${
                      act.checked
                        ? 'bg-primary/15 border-primary/50 text-foreground'
                        : 'glass-card border-transparent hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl leading-none">{act.icon}</span>
                    <span className="font-medium text-sm flex-1">{act.label}</span>
                    {act.checked
                      ? <CheckSquare size={16} className="text-primary flex-shrink-0" />
                      : <Square size={16} className="text-muted-foreground flex-shrink-0" />
                    }
                  </button>
                ))}
              </div>
              {rawActivities.filter(a => a.checked).length > 0 && (
                <div className="mt-5 p-4 rounded-2xl bg-primary/8 border border-primary/20">
                  <p className="text-xs text-primary font-semibold mb-2">الفعاليات المختارة ({rawActivities.filter(a=>a.checked).length})</p>
                  <div className="flex flex-wrap gap-2">
                    {rawActivities.filter(a => a.checked).map(a => (
                      <span key={a.id} className="text-sm px-2 py-1 rounded-lg bg-primary/15 text-primary">{a.icon} {a.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ GEAR TAB ══ */}
          {tab === 'gear' && (
            <div className="p-5">
              <p className="text-muted-foreground text-xs mb-4">وزّع الأغراض على الأعضاء — من يجيب إيش 🎒</p>

              {/* Add new item */}
              <div className="glass-card p-4 rounded-2xl mb-5 space-y-2.5 border border-white/10">
                <Input
                  placeholder="اسم الغرض (مثال: خيمة، شواية، حطب)"
                  value={newGearName}
                  onChange={e => setNewGearName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addGearItem()}
                />
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <UserCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="الشخص المسؤول (اختياري)"
                      value={newGearPerson}
                      onChange={e => setNewGearPerson(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addGearItem()}
                      className="pr-9"
                    />
                  </div>
                  <Button size="sm" onClick={addGearItem} className="gap-1 flex-shrink-0">
                    <Plus size={14}/> إضافة
                  </Button>
                </div>
              </div>

              {/* Gear list */}
              <div className="space-y-2.5">
                {gearItems.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                    <Package className="mx-auto mb-2 text-muted-foreground" size={28} />
                    <p className="text-muted-foreground text-sm">لا توجد أغراض بعد</p>
                  </div>
                )}
                {gearItems.map((item) => (
                  <div
                    key={item.id}
                    className={`glass-card p-3.5 rounded-2xl flex items-center gap-3 transition-all ${item.done ? 'opacity-60' : ''}`}
                  >
                    <button onClick={() => toggleGearDone(item.id)} className="flex-shrink-0 text-primary">
                      {item.done
                        ? <CheckSquare size={20} className="text-primary" />
                        : <Square size={20} className="text-muted-foreground" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.name}</p>
                      {item.assignedTo && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <UserCircle size={12} /> {item.assignedTo}
                        </p>
                      )}
                    </div>
                    <button onClick={() => removeGearItem(item.id)} className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary by person */}
              {gearItems.length > 1 && (
                <div className="mt-6 p-4 rounded-2xl bg-card/60 border border-white/10">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">ملخص حسب الشخص</p>
                  {Object.entries(
                    gearItems.reduce((acc: Record<string, string[]>, g) => {
                      const key = g.assignedTo || 'غير محدد';
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(g.name);
                      return acc;
                    }, {})
                  ).map(([person, items]) => (
                    <div key={person} className="flex gap-2 items-start mb-2 last:mb-0">
                      <span className="text-xs font-semibold text-primary min-w-16 flex-shrink-0">{person}:</span>
                      <span className="text-xs text-muted-foreground">{(items as string[]).join('، ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Map ── */}
      <div className="flex-1 h-[50vh] lg:h-screen sticky top-0 relative z-0">
        <Map
          stops={plan.stops || []}
          onMapClick={handleMapClick}
          pendingPoint={isAddingStop && newStopData.lat ? { lat: newStopData.lat, lng: newStopData.lng! } : null}
        />
      </div>

    </div>
  );
}
