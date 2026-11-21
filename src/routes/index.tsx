import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CircleHelp,
  Home,
  Info,
  Lightbulb,
  Medal,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameObjectIllustration, Mascot } from "@/components/game-object";
import {
  activities,
  countFirstAttemptCorrect,
  countRetriedActivities,
  createActivityResult,
  isCorrectAnswer,
  levelTitles,
  type Activity,
  type ActivityResult,
} from "@/lib/game-activities";
import { registerOfflineSupport } from "@/lib/register-offline";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "فكّر وقارن | لعبة المقارنة للأطفال" },
      {
        name: "description",
        content: "لعبة تعليمية عربية ممتعة لتنمية مهارات المقارنة عند الأطفال من خلال ١٥ نشاطًا تفاعليًا.",
      },
      { property: "og:title", content: "فكّر وقارن | لعبة المقارنة للأطفال" },
      {
        property: "og:description",
        content: "أنشطة عربية مرحة لتعلّم أوجه الشبه والاختلاف والمقارنة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GameApp,
});

type Screen = "welcome" | "instructions" | "levels" | "game" | "levelComplete" | "results" | "teacher";
type Choice = "اللون" | "الشكل" | "الحجم" | "left" | "right";
type OfflineState = "checking" | "ready" | "unavailable";

const STORAGE_KEY = "think-and-compare-progress-v1";
const initialResults = (): ActivityResult[] => [];
const toArabicNumber = (value: number) => new Intl.NumberFormat("ar-EG").format(value);
const optionsByLevel: Record<Activity["level"], Choice[]> = {
  1: ["اللون", "الشكل"],
  2: ["اللون", "الشكل", "الحجم"],
  3: ["left", "right"],
};
const optionNames: Record<Choice, string> = {
  اللون: "اللون",
  الشكل: "الشكل",
  الحجم: "الحجم",
  left: "الصورة اللي على الشمال",
  right: "الصورة اللي على اليمين",
};
const optionIcons: Record<Choice, string> = {
  اللون: "●",
  الشكل: "◆",
  الحجم: "↕",
  left: "←",
  right: "→",
};

function AppToolbar({
  soundOn,
  toggleSound,
  goHome,
  showHome = true,
}: {
  soundOn: boolean;
  toggleSound: () => void;
  goHome: () => void;
  showHome?: boolean;
}) {
  return (
    <header className="game-toolbar" dir="rtl">
      <div className="toolbar-brand" aria-label="فكّر وقارن">
        <span className="brand-dot"><Sparkles size={18} aria-hidden="true" /></span>
        <span>فكّر وقارن</span>
      </div>
      <div className="toolbar-actions">
        {showHome && <Button variant="ghost" size="icon" onClick={goHome} aria-label="القائمة الرئيسية" title="القائمة الرئيسية"><Home size={20} /></Button>}
        <Button variant="ghost" size="icon" onClick={toggleSound} aria-label={soundOn ? "إيقاف الصوت" : "تشغيل الصوت"} title={soundOn ? "إيقاف الصوت" : "تشغيل الصوت"}>
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </Button>
      </div>
    </header>
  );
}

function GameApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [results, setResults] = useState<ActivityResult[]>(initialResults);
  const [activeLevel, setActiveLevel] = useState<Activity["level"]>(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [offlineState, setOfflineState] = useState<OfflineState>("checking");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState<string | null>(null);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const answerLock = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: { results?: ActivityResult[]; soundOn?: boolean } = JSON.parse(saved);
        if (Array.isArray(parsed.results)) setResults(parsed.results);
        if (typeof parsed.soundOn === "boolean") setSoundOn(parsed.soundOn);
      }
    } catch {
      setResults([]);
    } finally {
      setProgressLoaded(true);
    }
    void registerOfflineSupport().then((ready) => setOfflineState(ready ? "ready" : "unavailable")).catch(() => setOfflineState("unavailable"));
  }, []);

  useEffect(() => {
    if (!progressLoaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ results, soundOn }));
    } catch {
      // The game continues normally if browser storage is unavailable.
    }
  }, [results, soundOn, progressLoaded]);

  const currentActivities = useMemo(() => activities.filter((activity) => activity.level === activeLevel), [activeLevel]);
  const activity = currentActivities[questionIndex];
  const levelResults = results.filter((result) => activities.find((item) => item.id === result.id)?.level === activeLevel);
  const levelFirstTryScore = countFirstAttemptCorrect(levelResults);

  const playQuestionAudio = (question: string, index = 0) => {
    if (!soundOn || typeof window === "undefined") return;
    const fileName = question === "تعالى نبص على الصورتين!" ? "instructions.mp3" : `question-${String(index + 1).padStart(2, "0")}.mp3`;
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/${fileName}`);
    setAudioUnavailable(false);
    void audio.play().catch(() => setAudioUnavailable(true));
  };

  const playSuccess = () => {
    if (!soundOn || typeof window === "undefined") return;
    try {
      if ("AudioContext" in window) {
        const context = new window.AudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, context.currentTime);
        oscillator.frequency.setValueAtTime(880, context.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.32);
        void context.close().catch(() => undefined);
      }
      const encouragement = new Audio(`${import.meta.env.BASE_URL}audio/encouragement.mp3`);
      void encouragement.play().catch(() => undefined);
    } catch {
      // Gentle sound effects are optional; visual feedback remains available.
    }
  };

  const startLevel = (level: Activity["level"], keepPreviousLevels = true) => {
    answerLock.current = false;
    setResults((previous) => previous.filter((result) => {
      const savedActivity = activities.find((item) => item.id === result.id);
      return savedActivity?.level !== level;
    }));
    setActiveLevel(level);
    setQuestionIndex(0);
    setAttempts(0);
    setSelectedAnswer(null);
    setShowHint(false);
    setPracticeAnswer(null);
    if (!keepPreviousLevels) setResults([]);
    setScreen("game");
  };

  const handleAnswer = (answer: Choice, current: Activity, scored: boolean) => {
    if (selectedAnswer !== null || answerLock.current) return;
    answerLock.current = true;
    window.setTimeout(() => { answerLock.current = false; }, 250);
    if (!isCorrectAnswer(current, answer)) {
      setAttempts((count) => count + 1);
      setShowHint(false);
      return;
    }
    setSelectedAnswer(answer);
    if (scored) {
      const totalAttempts = attempts + 1;
      setResults((previous) => {
        const result = createActivityResult(current, answer, totalAttempts);
        if (!result) return previous;
        return [...previous.filter((item) => item.id !== current.id), result];
      });
    }
    playSuccess();
  };

  const nextQuestion = () => {
    if (questionIndex < currentActivities.length - 1) {
      answerLock.current = false;
      setQuestionIndex((index) => index + 1);
      setAttempts(0);
      setSelectedAnswer(null);
      setShowHint(false);
      return;
    }
    setScreen(activeLevel === 3 ? "results" : "levelComplete");
  };

  const clearProgress = () => {
    setResults([]);
    setQuestionIndex(0);
    setAttempts(0);
    setSelectedAnswer(null);
    setResetConfirm(false);
    setScreen("levels");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage is optional; progress is cleared in the current session.
    }
  };

  const toggleSound = () => setSoundOn((enabled) => !enabled);
  const goHome = () => {
    setScreen("levels");
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAttempts(0);
  };

  const toolbar = <AppToolbar soundOn={soundOn} toggleSound={toggleSound} goHome={goHome} showHome={screen !== "welcome"} />;

  if (screen === "welcome") {
    return (
      <main className="game-shell welcome-screen" dir="rtl">
        {toolbar}
        <div className="welcome-content">
          <div className="welcome-art" aria-hidden="true"><span className="welcome-sparkle sparkle-one">✦</span><Mascot className="mascot-large" /><span className="welcome-sparkle sparkle-two">✦</span></div>
          <p className="eyebrow">يلا نكتشف سوا</p>
          <h1>فكّر <span>وقارن</span></h1>
          <p className="welcome-copy">نشوف إيه اللي شبه بعض وإيه اللي مختلف!</p>
          <div className="welcome-actions">
            <Button className="game-primary game-big-button" onClick={() => setScreen("levels")}><Play size={20} fill="currentColor" /> ابدأ اللعب</Button>
            <Button variant="outline" className="game-outline game-big-button" onClick={() => setScreen("instructions")}><CircleHelp size={20} /> طريقة اللعب</Button>
          </div>
        </div>
        <div className="welcome-bottom"><span>٣ مستويات</span><span className="dot-separator" /><span>١٥ نشاط</span><span className="dot-separator" /><span>العب على مهلك</span></div>
      </main>
    );
  }

  if (screen === "instructions") {
    const practice = activities.find((item) => item.id === 1);
    return (
      <main className="game-shell inner-screen" dir="rtl">
        {toolbar}
        <section className="page-content instructions-content">
          <div className="screen-heading"><span className="heading-icon mint-icon"><BookOpen size={24} /></span><div><p className="eyebrow">خلّينا نتعلّم</p><h1>طريقة اللعب</h1></div><Button variant="ghost" size="icon" className="replay-button" onClick={() => playQuestionAudio("تعالى نبص على الصورتين!")} aria-label="اسمع التعليمات"><Volume2 size={21} /></Button></div>
          <ol className="instruction-list">
            <li><span className="instruction-number">١</span><span>بُصّ كويس على الصورتين.</span></li>
            <li><span className="instruction-number">٢</span><span>اختار الإجابة اللي شايفها صح.</span></li>
            <li><span className="instruction-number">٣</span><span>لو محتاج، جرّب تاني براحتك.</span></li>
          </ol>
          {practice && <section className="practice-panel" aria-label="تدريب من غير نقاط">
            <div className="practice-label">نجرب سوا من غير نقاط</div>
            <h2>إيه اللي شبه بعض في الصورتين؟</h2>
            <div className="object-pair practice-pair">
              <div className="object-panel"><GameObjectIllustration object={practice.left} className="question-object" /><span>{practice.left.label}</span></div>
              <div className="pair-divider" aria-hidden="true">و</div>
              <div className="object-panel"><GameObjectIllustration object={practice.right} className="question-object" /><span>{practice.right.label}</span></div>
            </div>
            <div className="answer-row practice-answers">
              {(["اللون", "الشكل"] as Choice[]).map((choice) => <Button key={choice} variant="outline" className={`answer-button${practiceAnswer === choice ? " answer-selected" : ""}`} onClick={() => { setPracticeAnswer(choice); if (isCorrectAnswer(practice, choice)) playSuccess(); }}><span className="answer-symbol" aria-hidden="true">{optionIcons[choice]}</span>{choice}</Button>)}
            </div>
            {practiceAnswer && <p className="practice-feedback" role="status">{isCorrectAnswer(practice, practiceAnswer) ? "برافو عليك!" : "بصّ على لون الصورتين كمان مرة."}</p>}
          </section>}
          <Button className="game-primary game-big-button instruction-continue" onClick={() => setScreen("levels")}>يلا نلعب <ArrowLeft size={20} /></Button>
        </section>
      </main>
    );
  }

  if (screen === "levels") {
    const levels: Activity["level"][] = [1, 2, 3];
    return (
      <main className="game-shell inner-screen" dir="rtl">
        {toolbar}
        <section className="page-content levels-content">
          <div className="screen-heading"><span className="heading-icon yellow-icon"><Sparkles size={24} /></span><div><p className="eyebrow">اختار لعبة</p><h1>جاهز نلعب؟</h1></div></div>
          <p className="section-subtitle">اختار المستوى اللي تحبّه.</p>
          <div className="level-list">
            {levels.map((level) => {
              const levelItems = activities.filter((item) => item.level === level);
              const done = results.filter((result) => levelItems.some((item) => item.id === result.id)).length;
              return <div className={`level-row level-row-${level}`} key={level}>
                <div className="level-number">{toArabicNumber(level)}</div>
                <div className="level-info"><h2>{levelTitles[level]}</h2><p>{level === 1 ? "نشوف إيه اللي شبه بعض" : level === 2 ? "نكتشف إيه اللي مختلف" : "نقارن ونختار"}</p><div className="level-progress" aria-label={`${toArabicNumber(done)} من ٥ أنشطة مكتملة`}>{levelItems.map((item) => <span key={item.id} className={results.some((result) => result.id === item.id) ? "progress-dot is-done" : "progress-dot"} />)}</div></div>
                <Button variant="outline" className="level-play" onClick={() => startLevel(level)} aria-label={`ابدأ ${levelTitles[level]}`}><Play size={18} fill="currentColor" /><span>ابدأ</span></Button>
              </div>;
            })}
          </div>
          <div className="level-bottom-actions"><Button variant="ghost" className="subtle-action" onClick={() => setScreen("teacher")}><Info size={18} /> معلومات للمعلمة</Button>{results.length > 0 && !resetConfirm && <Button variant="ghost" className="subtle-action" onClick={() => setResetConfirm(true)}><RotateCcw size={17} /> مسح التقدم</Button>}</div>
          {resetConfirm && <div className="reset-confirm" role="alert"><span>تمسح كل التقدم؟</span><Button size="sm" variant="destructive" onClick={clearProgress}>امسح</Button><Button size="sm" variant="outline" onClick={() => setResetConfirm(false)}>إلغاء</Button></div>}
        </section>
      </main>
    );
  }

  if (screen === "teacher") {
    return (
      <main className="game-shell inner-screen" dir="rtl">
        {toolbar}
        <section className="page-content teacher-content">
          <Button variant="ghost" className="back-link" onClick={() => setScreen("levels")}><ArrowRight size={18} /> رجوع</Button>
          <div className="screen-heading"><span className="heading-icon lavender-icon"><BookOpen size={24} /></span><div><p className="eyebrow">معلومات للعرض</p><h1>عن اللعبة</h1></div></div>
          <div className="teacher-facts">
            <section><h2>الفئة المستهدفة</h2><p>أطفال من ٦ إلى ٩ سنوات من ذوي الإعاقة الذهنية البسيطة.</p></section>
            <section><h2>الأهداف التعليمية</h2><p>التعرّف على أوجه التشابه والاختلاف، ومقارنة الأشياء حسب اللون والشكل والحجم والعدد.</p></section>
            <section><h2>المستويات</h2><p>١. أوجه التشابه · ٢. أوجه الاختلاف · ٣. قارن واختار.</p></section>
            <section><h2>فكرة التصميم</h2><p>صور واضحة وخطوات قصيرة مع تكرار المحاولة دون ضغط أو عقاب.</p></section>
            <section><h2>احتساب النتيجة</h2><p>تُحسب الإجابة الصحيحة من أول محاولة بشكل منفصل عن الأنشطة التي احتاجت إعادة.</p></section>
            <section className="offline-fact"><h2>الاستعداد للعب دون إنترنت</h2><p>{offlineState === "ready" ? "جاهزة بعد فتح اللعبة أول مرة." : offlineState === "checking" ? "جارٍ التحقق من ملفات اللعبة." : "تكون متاحة بعد نشر اللعبة وفتحها مرة أولى."}</p><span className={`offline-indicator ${offlineState}`}><span className="offline-dot" />{offlineState === "ready" ? "الملفات جاهزة" : offlineState === "checking" ? "جارٍ الفحص" : "تحتاج اتصال أول مرة"}</span></section>
          </div>
          <p className="teacher-note">النتيجة خاصة بهذه الأنشطة التعليمية، ولا تُستخدم للتشخيص الطبي أو النفسي.</p>
        </section>
      </main>
    );
  }

  if (screen === "game" && activity) {
    const levelOptions = optionsByLevel[activeLevel];
    const questionNumber = questionIndex + 1;
    const questionAudioIndex = activity.id;
    return (
      <main className="game-shell game-screen" dir="rtl">
        {toolbar}
        <section className="game-content">
          <div className="game-meta"><div><span className={`level-chip chip-${activeLevel}`}>{levelTitles[activeLevel]}</span><p className="question-count">النشاط {toArabicNumber(questionNumber)} من ٥</p></div><div className="question-dots" aria-label={`النشاط ${toArabicNumber(questionNumber)} من خمسة`}>{currentActivities.map((item, index) => <span key={item.id} className={`progress-dot${index < questionIndex ? " is-done" : index === questionIndex ? " is-current" : ""}`} />)}</div></div>
          <div className="question-heading"><h1>{activity.question}</h1><Button variant="ghost" size="icon" className="replay-button" onClick={() => playQuestionAudio(activity.question, questionAudioIndex - 1)} aria-label="اسمع السؤال مرة تانية" title="اسمع السؤال مرة تانية"><Volume2 size={21} /></Button></div>
          {audioUnavailable && <p className="audio-note" role="status">التسجيل مش موجود دلوقتي، اقرأ السؤال براحتك.</p>}
          {activeLevel === 3 && <p className="choice-prompt direct-choice-prompt">دوس على الصورة الصح</p>}
          <div className="object-pair game-pair" dir="ltr">
            {[{ item: activity.left, side: "left" as const }, { item: activity.right, side: "right" as const }].map(({ item, side }) => activeLevel === 3 ? <Button key={side} variant="ghost" className={`object-panel object-select-panel${selectedAnswer === side ? " object-panel-correct" : ""}`} aria-label={`${side === "left" ? "الشمال" : "اليمين"}: ${item.label}`} disabled={selectedAnswer !== null} onClick={() => handleAnswer(side, activity, true)}><GameObjectIllustration object={item} className="question-object" /><span>{item.label}</span></Button> : <div key={side} className="object-panel"><GameObjectIllustration object={item} className="question-object" /><span>{item.label}</span></div>)}
          </div>
          {activeLevel !== 3 && <><p className="choice-prompt">إيه إجابتك؟</p><div className={`answer-row answer-row-${levelOptions.length}`}>
            {levelOptions.map((choice) => {
              const selected = selectedAnswer === choice;
              return <Button key={choice} variant="outline" disabled={selectedAnswer !== null} aria-label={optionNames[choice]} className={`answer-button${selected ? " answer-correct" : ""}`} onClick={() => handleAnswer(choice, activity, true)}><span className="answer-symbol" aria-hidden="true">{optionIcons[choice]}</span><span>{choice}</span>{selected && <Check className="answer-check" size={19} />}</Button>;
            })}
          </div></>}
          {selectedAnswer !== null ? <div className="feedback-panel correct-feedback" role="status"><span className="feedback-star"><Sparkles size={20} fill="currentColor" /></span><div><strong>أحسنت!</strong><p>اختيار جميل!</p></div><Button className="game-primary next-button" onClick={nextQuestion}>التالي <ArrowLeft size={19} /></Button></div> : attempts > 0 ? <div className="feedback-panel retry-feedback" role="status"><span className="retry-icon"><RotateCcw size={20} /></span><div><strong>حاول تاني</strong><p>إنت تقدر، جرّب مرة كمان.</p></div>{!showHint && <Button variant="outline" className="hint-button" onClick={() => setShowHint(true)}><Lightbulb size={17} /> مساعدة</Button>}{showHint && <span className="hint-text">{activeLevel === 1 ? "بصّ على لون الصورتين وشكلهم." : activeLevel === 2 ? "إيه الحاجة الوحيدة المختلفة؟" : "بصّ كويس على الصورة المطلوبة."}</span>}</div> : <div className="feedback-placeholder" aria-hidden="true" />}
          <div className="game-footer"><span><Sparkles size={16} /> براحتك، مفيش وقت</span><Button variant="ghost" className="back-link" onClick={goHome}>المستويات</Button></div>
        </section>
      </main>
    );
  }

  if (screen === "levelComplete") {
    return (
      <main className="game-shell completion-screen" dir="rtl">
        {toolbar}
        <section className="completion-content"><div className="completion-mascot"><Mascot className="mascot-small" /><span className="celebration-star">✦</span></div><p className="eyebrow">خلصنا المستوى</p><h1>شاطر جدًا!</h1><p className="completion-subtitle">أنهيت مستوى {levelTitles[activeLevel]}</p><div className="score-block"><span>إجابات صح من أول مرة</span><strong>{toArabicNumber(levelFirstTryScore)} <small>من ٥</small></strong></div><div className="completion-actions"><Button className="game-primary game-big-button" onClick={() => startLevel((activeLevel + 1) as Activity["level"])}>المستوى التالي <ArrowLeft size={20} /></Button><Button variant="outline" className="game-outline game-big-button" onClick={() => startLevel(activeLevel)}><RotateCcw size={19} /> إعادة المستوى</Button><Button variant="ghost" className="subtle-action" onClick={goHome}>اختيار مستوى تاني</Button></div></section>
      </main>
    );
  }

  const totalFirstTry = countFirstAttemptCorrect(results);
  const retried = countRetriedActivities(results);
  return (
    <main className="game-shell results-screen" dir="rtl">
      {toolbar}
      <section className="results-content"><div className="results-art"><Mascot className="mascot-small" /><span><Medal size={28} /></span></div><p className="eyebrow">أنت بطل المقارنة</p><h1>يا سلام عليك!</h1><p className="results-subtitle">خلصت كل الأنشطة، برافو!</p>
        <div className="total-score"><span>إجابات صح من أول مرة</span><strong>{toArabicNumber(totalFirstTry)} <small>من ١٥</small></strong></div>
        <div className="results-levels">{([1, 2, 3] as const).map((level) => { const levelItems = activities.filter((item) => item.level === level); const correct = countFirstAttemptCorrect(results.filter((result) => levelItems.some((item) => item.id === result.id))); return <div className="results-level-row" key={level}><span className={`level-chip chip-${level}`}>{levelTitles[level]}</span><span>{toArabicNumber(correct)} من ٥</span></div>; })}</div>
        <p className="retry-count">أنشطة احتاجت محاولة تانية: <strong>{toArabicNumber(retried)}</strong></p>
        <p className="teacher-note">هذه النتيجة تلخّص أداءك في اللعبة، وليست تقييمًا طبيًا.</p>
        <div className="completion-actions"><Button className="game-primary game-big-button" onClick={() => { clearProgress(); startLevel(1, false); }}>العب من جديد <RotateCcw size={20} /></Button><Button variant="outline" className="game-outline game-big-button" onClick={() => setScreen("teacher")}><Info size={19} /> ملخص للمعلمة</Button><Button variant="ghost" className="subtle-action" onClick={goHome}>اختيار مستوى تاني</Button></div>
      </section>
    </main>
  );
}
