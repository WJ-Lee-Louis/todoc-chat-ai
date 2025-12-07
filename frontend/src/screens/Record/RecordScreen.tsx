import { useState, ReactNode } from 'react';
import {
  Bot,
  TrendingUp,
  Heart,
  Moon,
  Utensils,
  Baby,
  Smile,
  Sparkles,
  ArrowLeft,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import { cn } from '@/components/ui/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';

// --- MOCK DATA & TYPES ---
interface JournalEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  timestamp: string;
  date: Date;
  details?: any;
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    category: 'meal',
    title: 'First solid food!',
    content: 'Tried rice cereal for the first time. A bit strange for the little one, but ate half of it. So proud!',
    timestamp: 'November 8, 2025',
    date: new Date(2025, 10, 8),
    details: { foodType: 'Rice Cereal', amount: '30ml' }
  },
  {
    id: '2',
    category: 'sleep',
    title: 'Slept 5 hours straight!',
    content: 'Finally slept for 5 hours straight through the night. Mom and Dad are crying tears of joy... 😭',
    timestamp: 'November 7, 2025',
    date: new Date(2025, 10, 7),
    details: { startTime: '22:00', endTime: '03:00', quality: 'Good' }
  },
];

const recordCategories = (t: (key: any) => string) => [
  { id: 'growth', label: t('category.growth'), icon: <TrendingUp className="h-5 w-5" />, color: 'var(--primary)' },
  { id: 'sleep', label: t('category.sleep'), icon: <Moon className="h-5 w-5" />, color: 'var(--accent)' },
  { id: 'meal', label: t('category.meal'), icon: <Utensils className="h-5 w-5" />, color: 'var(--secondary)' },
  { id: 'health', label: t('category.health'), icon: <Heart className="h-5 w-5" />, color: 'var(--destructive)' },
  { id: 'development', label: t('category.development'), icon: <Baby className="h-5 w-5" />, color: 'var(--primary)' },
  { id: 'emotion', label: t('category.emotion'), icon: <Smile className="h-5 w-5" />, color: 'var(--emotion)' },
];

// --- SUB-COMPONENTS ---

const JournalEntryCard = ({ entry }: { entry: JournalEntry }) => {
  const { t } = useLanguage();
  const categoryInfo = recordCategories(t).find(cat => cat.id === entry.category);
  if (!categoryInfo) return null;

  return (
    <Card className="w-full overflow-hidden" style={{ borderLeft: `4px solid ${categoryInfo.color}` }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: categoryInfo.color }}>
            {categoryInfo.icon}
            <span className="font-medium">{categoryInfo.label}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground/80">
            <CalendarIcon className="h-3 w-3" />
            <span>{entry.timestamp}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-1">{entry.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{entry.content}</p>

        {/* Render details based on category */}
        {entry.details && (
          <div className="bg-muted/30 p-3 rounded-md text-sm space-y-1">
            {entry.category === 'growth' && (
              <div className="grid grid-cols-2 gap-2">
                {entry.details.height && <div>Height: <span className="font-medium">{entry.details.height} cm</span></div>}
                {entry.details.weight && <div>Weight: <span className="font-medium">{entry.details.weight} kg</span></div>}
                {entry.details.headCircumference && <div className="col-span-2">Head: <span className="font-medium">{entry.details.headCircumference} cm</span></div>}
              </div>
            )}
            {entry.category === 'sleep' && (
              <div className="grid grid-cols-2 gap-2">
                {entry.details.startTime && <div>Start: <span className="font-medium">{entry.details.startTime}</span></div>}
                {entry.details.endTime && <div>End: <span className="font-medium">{entry.details.endTime}</span></div>}
                {entry.details.quality && <div className="col-span-2">Quality: <span className="font-medium">{entry.details.quality}</span></div>}
              </div>
            )}
            {entry.category === 'meal' && (
              <div className="grid grid-cols-2 gap-2">
                {entry.details.foodType && <div className="col-span-2">Food: <span className="font-medium">{entry.details.foodType}</span></div>}
                {entry.details.amount && <div className="col-span-2">Amount: <span className="font-medium">{entry.details.amount}</span></div>}
              </div>
            )}
            {entry.category === 'health' && (
              <div className="space-y-1">
                {entry.details.temperature && <div>Temp: <span className="font-medium">{entry.details.temperature}°C</span></div>}
                {entry.details.symptoms && entry.details.symptoms.length > 0 && (
                  <div>Symptoms: <span className="font-medium">{entry.details.symptoms.join(', ')}</span></div>
                )}
              </div>
            )}
            {entry.category === 'development' && entry.details.milestone && (
              <div>Milestone: <span className="font-medium">{entry.details.milestone}</span></div>
            )}
            {entry.category === 'emotion' && entry.details.mood && (
              <div>Mood: <span className="font-medium">{entry.details.mood}</span></div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const JournalForm = ({ categoryId, onSave, onBack, isDarkMode }: { categoryId: string; onSave: (data: any) => void; onBack: () => void; isDarkMode: boolean }) => {
  const { t, language } = useLanguage();
  const categoryInfo = recordCategories(t).find(cat => cat.id === categoryId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Dynamic state for specific categories
  const [details, setDetails] = useState<any>({});

  if (!categoryInfo) return null;

  const handleSave = () => {
    if (!title || !date) {
      toast.error(t('form.fillRequired'));
      return;
    }
    onSave({
      category: categoryId,
      title,
      content,
      date,
      details,
    });
  };

  const renderSpecificFields = () => {
    switch (categoryId) {
      case 'growth':
        return (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Height (cm)</label>
              <Input
                type="number"
                placeholder="0.0"
                value={details.height || ''}
                onChange={e => setDetails({ ...details, height: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Weight (kg)</label>
              <Input
                type="number"
                placeholder="0.0"
                value={details.weight || ''}
                onChange={e => setDetails({ ...details, weight: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1.5 block">Head Circumference (cm)</label>
              <Input
                type="number"
                placeholder="0.0"
                value={details.headCircumference || ''}
                onChange={e => setDetails({ ...details, headCircumference: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>
        );
      case 'sleep':
        return (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Start Time</label>
              <Input
                type="time"
                value={details.startTime || ''}
                onChange={e => setDetails({ ...details, startTime: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">End Time</label>
              <Input
                type="time"
                value={details.endTime || ''}
                onChange={e => setDetails({ ...details, endTime: e.target.value })}
                className="bg-white"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium mb-1.5 block">Sleep Quality</label>
              <div className="flex gap-2">
                {['Good', 'Fair', 'Poor'].map(q => (
                  <Button
                    key={q}
                    variant={details.quality === q ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDetails({ ...details, quality: q })}
                    className="flex-1"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'meal':
        return (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Food Type</label>
              <Input
                placeholder="e.g., Breast milk, Formula, Porridge"
                value={details.foodType || ''}
                onChange={e => setDetails({ ...details, foodType: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Amount</label>
              <Input
                placeholder="e.g., 120ml, 1 bowl"
                value={details.amount || ''}
                onChange={e => setDetails({ ...details, amount: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>
        );
      case 'health':
        return (
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Temperature (°C)</label>
              <Input
                type="number"
                placeholder="36.5"
                value={details.temperature || ''}
                onChange={e => setDetails({ ...details, temperature: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Symptoms</label>
              <div className="grid grid-cols-2 gap-2">
                {['Cough', 'Fever', 'Runny Nose', 'Rash', 'Vomiting', 'Diarrhea'].map(s => (
                  <div key={s} className="flex items-center space-x-2 bg-white p-2 rounded border">
                    <input
                      type="checkbox"
                      id={`symptom-${s}`}
                      checked={details.symptoms?.includes(s) || false}
                      onChange={(e) => {
                        const current = details.symptoms || [];
                        if (e.target.checked) {
                          setDetails({ ...details, symptoms: [...current, s] });
                        } else {
                          setDetails({ ...details, symptoms: current.filter((i: string) => i !== s) });
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`symptom-${s}`} className="text-xs">{s}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'development':
        return (
          <div className="p-4 bg-muted/20 rounded-lg">
            <label className="text-xs font-medium mb-1.5 block">Milestone</label>
            <Input
              placeholder="e.g., Rolled over, First step"
              value={details.milestone || ''}
              onChange={e => setDetails({ ...details, milestone: e.target.value })}
              className="bg-white"
            />
          </div>
        );
      case 'emotion':
        return (
          <div className="p-4 bg-muted/20 rounded-lg">
            <label className="text-xs font-medium mb-1.5 block">Mood</label>
            <div className="flex justify-between gap-2">
              {['😊 Happy', '😐 Neutral', '😭 Crying', '😡 Angry'].map(m => (
                <button
                  key={m}
                  onClick={() => setDetails({ ...details, mood: m })}
                  className={`flex-1 py-2 rounded-md text-sm border transition-all ${details.mood === m
                      ? 'bg-white border-primary shadow-sm ring-1 ring-primary'
                      : 'bg-white/50 border-transparent hover:bg-white'
                    }`}
                >
                  {m.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-background text-foreground p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold" style={{ color: categoryInfo.color }}>
          {t('form.new')} {categoryInfo.label} {t('form.entry')}
        </h2>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t('form.date')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: language === 'ko' ? ko : enUS }) : <span>{t('form.pickDate')}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={language === 'ko' ? ko : enUS}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('form.title')}</label>
            <Input
              placeholder={t('form.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-muted-foreground/20"
            />
          </div>

          {/* Dynamic Fields Section */}
          {renderSpecificFields()}

          <div>
            <label className="text-sm font-medium mb-2 block">{t('form.comment')}</label>
            <Textarea
              placeholder={t('form.commentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] border-muted-foreground/20"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          type="button"
          style={{
            backgroundColor:
              categoryId === 'growth' ? '#6AA6FF' :
              categoryId === 'sleep' ? '#9ADBC6' :
              categoryId === 'meal' ? '#FFC98B' :
              categoryId === 'health' ? '#ef4444' :
              categoryId === 'development' ? '#6AA6FF' :
              categoryId === 'emotion' ? (isDarkMode ? 'white' : '#1e3a8a') :
              '#6b7280',
            color:
              categoryId === 'emotion' ? (isDarkMode ? '#1e3a8a' : 'white') :
              'white'
          }}
          className="w-full h-12 text-base font-semibold shadow-md transition-all hover:scale-[1.02] rounded-md"
        >
          {t('form.saveEntry')}
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function RecordScreen({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const { t, language } = useLanguage();
  const [view, setView] = useState<{ screen: 'list' | 'form'; categoryId: string | null }>({ screen: 'list', categoryId: null });
  const [entries, setEntries] = useState<JournalEntry[]>(mockEntries);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);

  const handleSaveEntry = (newEntryData: { category: string; title: string; content: string; date: Date }) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: format(newEntryData.date, 'PPP', { locale: language === 'ko' ? ko : enUS }),
      ...newEntryData,
    };
    setEntries([newEntry, ...entries]);
    const categoryLabel = recordCategories(t).find(cat => cat.id === newEntry.category)?.label || '';
    toast.success(`${categoryLabel} ${t('form.saved')}`);
    setView({ screen: 'list', categoryId: null });
  };

  if (view.screen === 'form' && view.categoryId) {
    return (
      <JournalForm
        categoryId={view.categoryId}
        onSave={handleSaveEntry}
        onBack={() => setView({ screen: 'list', categoryId: null })}
        isDarkMode={isDarkMode}
      />
    );
  }

  const displayedEntries = showAllEntries ? entries : entries.slice(0, 3);

  return (
    <div className="h-full w-full overflow-auto bg-background text-foreground p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-primary">{t('record.title')}</h1>
      </div>

      <div className="space-y-4">
        <div className="pt-2">
          <h2 className="font-medium text-muted-foreground mb-3">{t('record.addNew')}</h2>
          <div className="grid grid-cols-3 gap-3">
            {recordCategories(t).map((cat) => (
              <Card
                key={cat.id}
                className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setView({ screen: 'form', categoryId: cat.id })}
              >
                <div className="mb-2" style={{ color: cat.color }}>{cat.icon}</div>
                <p className="text-xs font-medium">{cat.label}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <h2 className="font-medium text-muted-foreground">{t('record.recent')}</h2>
          {entries.length > 0 ? (
            <>
              {displayedEntries.map(entry => <JournalEntryCard key={entry.id} entry={entry} />)}
              {entries.length > 3 && !showAllEntries && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAllEntries(true)}
                >
                  {t('record.seeMore')} ({entries.length - 3} {t('record.olderEntries')})
                </Button>
              )}
              {showAllEntries && entries.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAllEntries(false)}
                >
                  {t('record.showLess')}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('record.noEntries')}</p>
              <p className="text-muted-foreground text-sm">{t('record.noEntriesDesc')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-20 right-4 flex flex-col gap-3 z-10">
        <Drawer open={isAiSheetOpen} onOpenChange={setIsAiSheetOpen}>
          <DrawerTrigger asChild>
            <Button size="icon" className="rounded-full h-14 w-14 bg-gradient-to-br from-primary to-accent shadow-lg">
              <Bot className="h-7 w-7 text-white" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t('ai.title')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <p className="text-muted-foreground text-sm">{t('ai.comingSoon')}</p>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
