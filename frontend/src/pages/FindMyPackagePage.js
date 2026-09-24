"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Download,
  Phone,
  RotateCcw,
  Info,
  Wallet,
  Users,
  Building2,
  Cpu,
  Bed,
  Bath,
  Layers,
  Loader2,
} from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";
import { useLeadModal } from "@/components/site/LeadModalProvider";

/* ──────────────────────────────────────────────────────────────
   CURATED IMAGES
────────────────────────────────────────────────────────────── */
const IMG = {
  budget: {
    value:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788860705/93868621-2e72-46ce-b1f9-4c1989cef648.png",
    balanced:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861526/6e29d38d-22fd-4126-88ec-6829e0281b76.png",
    premium:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788860791/5dc0502c-eb33-4705-a4f8-d22f44bf7735.png",
    luxury:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788860821/5bdf0b3f-47fd-4b3f-897d-66ba797e58f3.png",
  },
  family: {
    "1-2":
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861039/2921ddad-4aa1-4b8f-9a22-906b3ee9ae37.png",
    "3-4":
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861077/ab994b98-81c1-4d1a-ba23-cd12f80414c9.png",
    "5+":
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861105/268d0fc9-e700-48b6-bbc0-d2789e89dc40.png",
  },
  style: {
    modern:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861151/c651e4a2-6355-4daa-9068-589112f08361.png",
    classic:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861200/1ba651d5-855d-4bed-8d77-0fa48eb3d096.png",
    villa:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861239/012cf513-e58f-4cd9-94b0-ac5234f19f2b.png",
    duplex:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861269/0a8a1c35-f5de-48c3-934e-89ce4b9aad7a.png",
    open:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861327/6351ef99-3fd8-49d1-8551-df296785c001.png",
  },
  smart: {
    yes:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861368/2d3317ae-80bf-427d-a8dc-b585c2e7456b.png",
    partial:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861408/5a1ec08e-804c-4a2f-b5ec-da6903bfbbd4.png",
    no:
      "https://res.cloudinary.com/yavvnb6s/image/upload/v1788861446/a46e1901-1466-49e6-bdd8-f406dfdde141.png",
  },
};

/* ──────────────────────────────────────────────────────────────
   QUESTIONS
────────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: "budget",
    icon: Wallet,
    kicker: "Investment",
    title: "What kind of investment feels right?",
    subtitle: "Choose the level of finish that matches your vision.",
    tip: "Your budget maps directly to the specification tier — from Basic essentials to Premium bespoke finishes.",
    options: [
      { id: "value", label: "Value", note: "Essentials · ₹1,499/sqft", img: IMG.budget.value },
      { id: "balanced", label: "Balanced", note: "Quality + value · ₹1,799/sqft", img: IMG.budget.balanced },
      { id: "premium", label: "Premium", note: "Designer · ₹2,199/sqft", img: IMG.budget.premium },
      { id: "luxury", label: "Luxury", note: "Bespoke · Custom quote", img: IMG.budget.luxury },
    ],
  },
  {
    id: "family",
    icon: Users,
    kicker: "Lifestyle",
    title: "Who will call this home?",
    subtitle: "Family size shapes the rooms and the layout.",
    tip: "This helps us recommend the right BHK layout, bathroom count and shared spaces.",
    options: [
      { id: "1-2", label: "1 – 2", note: "Couple / young family", img: IMG.family["1-2"] },
      { id: "3-4", label: "3 – 4", note: "Growing family", img: IMG.family["3-4"] },
      { id: "5+", label: "5 +", note: "Multi-generation", img: IMG.family["5+"] },
    ],
  },
  {
    id: "style",
    icon: Building2,
    kicker: "Architecture",
    title: "What architectural style do you love?",
    subtitle: "Pick the aesthetic that speaks to you.",
    tip: "Not sure? Pick 'I'm open' — we'll show you the most-loved styles for your budget.",
    options: [
      { id: "modern", label: "Modern", note: "Clean lines · glass · open plan", img: IMG.style.modern },
      { id: "classic", label: "Classic", note: "Timeless · elegant · warm", img: IMG.style.classic },
      { id: "villa", label: "Villa", note: "Grand · landscaped · private", img: IMG.style.villa },
      { id: "duplex", label: "Duplex", note: "Vertical · dual-floor", img: IMG.style.duplex },
      { id: "open", label: "I'm open", note: "Show me what fits", img: IMG.style.open },
    ],
  },
  {
    id: "smart_home",
    icon: Cpu,
    kicker: "Technology",
    title: "How smart should your home be?",
    subtitle: "From essentials to fully AI-connected living.",
    tip: "Smart-home wiring is easiest to install during construction — decide once, enjoy for years.",
    options: [
      { id: "yes", label: "Full automation", note: "Lights · climate · security · AI", img: IMG.smart.yes },
      { id: "partial", label: "Essentials only", note: "Security + basic controls", img: IMG.smart.partial },
      { id: "no", label: "Traditional", note: "Focus on craftsmanship", img: IMG.smart.no },
    ],
  },
];

const LABELS = {
  budget: { value: "Value", balanced: "Balanced", premium: "Premium", luxury: "Luxury" },
  family: { "1-2": "1–2 people", "3-4": "3–4 people", "5+": "5+ people" },
  style: { modern: "Modern", classic: "Classic", villa: "Villa", duplex: "Duplex", open: "Open to all" },
  smart_home: { yes: "Full automation", partial: "Essentials only", no: "Traditional" },
};

/* Fallback package details */
const PACKAGE_DETAILS = {
  basic: { slug: "basic", name: "Basic Package", tagline: "Smart & Affordable", price: "₹1,499", unit: "/sqft", tone: "Value", highlights: ["ISI-certified structural materials", "Standard specifications, no hidden costs", "Digital progress tracking on the app", "1-year defect warranty · 10-year structural"] },
  essential: { slug: "essential", name: "Essential Package", tagline: "Perfect Balance", price: "₹1,799", unit: "/sqft", tone: "Balanced", highlights: ["Upgraded flooring, doors and fittings", "Dedicated project manager", "Live milestone tracking + weekly reports", "10-year structural warranty"] },
  standard: { slug: "standard", name: "Standard Package", tagline: "Premium Value", price: "₹2,199", unit: "/sqft", tone: "Premium", highlights: ["Designer finishes and premium fixtures", "Full AI dashboard + document vault", "Multi-level quality inspections", "10-year structural warranty"] },
  premium: { slug: "premium", name: "Premium Package", tagline: "Bespoke Luxury", price: "Custom", unit: "quote", tone: "Luxury", highlights: ["Fully customised design + planning", "Luxury materials and imported fittings", "Smart-home integration included", "10-year structural warranty"] },
};

function recommendPackageLocal(answers) {
  if (answers.budget === "luxury") return PACKAGE_DETAILS.premium;
  if (answers.budget === "premium") return PACKAGE_DETAILS.standard;
  if (answers.budget === "balanced") return PACKAGE_DETAILS.essential;
  return PACKAGE_DETAILS.basic;
}

/* ──────────────────────────────────────────────────────────────
   CUSTOM LOGO COMPONENT WITH POWER BUTTON 'O' (Darker styling)
────────────────────────────────────────────────────────────── */
function LogoMark({ className = "w-6 h-6" }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/logo.webp"
        alt="ConstructONS Logo"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

function BrandLogoText({ size = "md" }) {
  const sizes = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl",
  }[size];

  return (
    <span className={`font-bold tracking-tight text-white inline-flex items-center ${sizes}`}>
      Construct
      {/* The 'O' rendered as a darker, bolder power button */}
      <span className="inline-flex items-center justify-center relative mx-[1px] w-[0.8em] h-[0.8em] rounded-full border-[2.5px] border-[#D44A00] align-middle bg-[#FF5A00]/10">
        <span className="absolute top-0 w-[2.5px] h-[48%] bg-[#D44A00] rounded-full -translate-y-0.5" />
      </span>
      NS
    </span>
  );
}

/* ──────────────────────────────────────────────────────────────
   PAGE
────────────────────────────────────────────────────────────── */
export default function FindMyPackagePage() {
  const { open: openLead } = useLeadModal();

  const [screen, setScreen] = useState("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [homes, setHomes] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi?.getSiteSettings?.().then(setSettings).catch(() => {});
    publicApi?.getHomes?.().then(setHomes).catch(() => setHomes([]));
  }, []);

  const total = QUESTIONS.length;
  const current = QUESTIONS[step];

  // FIX: Make API call to backend when quiz is completed
  const pickAnswer = (optionId) => {
    const next = { ...answers, [current.id]: optionId };
    setAnswers(next);

    setTimeout(async () => {
      if (step < total - 1) {
        setStep(step + 1);
      } else {
        setScreen("analysing");

        try {
          // Send Quiz Answers to Backend API
          const apiRes = await publicApi.recommendPackage({
            budget: next.budget || "balanced",
            family_size: next.family || "3-4",
            style: next.style || "modern",
            smart_home: next.smart_home || "no",
          });

          if (apiRes && apiRes.recommended_package) {
            const pkg = apiRes.recommended_package;
            setResult({
              slug: pkg.slug,
              name: pkg.name,
              tagline: pkg.tagline || "Recommended Match",
              price: pkg.price_display || "Custom",
              unit: pkg.price_unit || "",
              tone: pkg.tier?.toUpperCase() || "Value",
              highlights: pkg.highlights?.length ? pkg.highlights : ["ISI-certified materials", "Digital updates", "Warranty"],
              submissionId: apiRes.submission_id,
            });
            if (apiRes.shortlisted_homes?.length) {
              setHomes(apiRes.shortlisted_homes);
            }
          } else {
            const localRec = recommendPackageLocal(next);
            setResult(localRec);
          }
        } catch (err) {
          console.error("Failed to submit quiz to backend:", err);
          const localRec = recommendPackageLocal(next);
          setResult(localRec);
        } finally {
          setTimeout(() => {
            setScreen("result");
          }, 1500);
        }
      }
    }, 350);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
    setScreen("intro");
  };

  return (
    <div className="bg-[#FBF9F6] font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white min-h-screen">
      <Header />

      <main className="pt-24">
        <div className="container-wide mt-2 mb-6 flex justify-center">
          <BrandPill />
        </div>

        <AnimatePresence mode="wait">
          {screen === "intro" && (
            <IntroScreen key="intro" onBegin={() => setScreen("quiz")} />
          )}

          {screen === "quiz" && (
            <QuizScreen
              key="quiz"
              step={step}
              total={total}
              current={current}
              answers={answers}
              onPick={pickAnswer}
              onBack={() => (step > 0 ? setStep(step - 1) : setScreen("intro"))}
            />
          )}

          {screen === "analysing" && <AnalysingScreen key="analysing" />}

          {screen === "result" && result && (
            <ResultScreen
              key="result"
              result={result}
              answers={answers}
              homes={homes}
              onRestart={restart}
              onConsult={() => openLead({ source: "quiz-result", quiz_submission_id: result.submissionId })}
              onBrochure={() => openLead({ source: "quiz-brochure", package: result.name, quiz_submission_id: result.submissionId })}
            />
          )}
        </AnimatePresence>
      </main>

      <Footer settings={settings} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   BRAND PILL (Supports logo-only mode)
────────────────────────────────────────────────────────────── */
function BrandPill({ size = "md", logoOnly = false }) {
  const sizes = {
    sm: { pill: "px-3 py-1.5 text-[11px] gap-1.5", mark: "w-5 h-5" },
    md: { pill: "px-4 py-2 text-xs gap-2", mark: "w-6 h-6" },
    lg: { pill: "px-5 py-2.5 text-sm gap-2.5", mark: "w-7 h-7" },
  }[size];

  if (logoOnly) {
    return (
      <div className={`inline-flex items-center justify-center rounded-full bg-[#000F1B] shadow-[0_10px_30px_rgba(0,15,27,0.25)] border border-white/10 ${size === 'sm' ? 'p-2' : size === 'lg' ? 'p-3.5' : 'p-2.5'}`}>
        <LogoMark className={sizes.mark} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center rounded-full bg-[#000F1B] shadow-[0_10px_30px_rgba(0,15,27,0.25)] border border-white/5 ${sizes.pill}`}>
      <LogoMark className={sizes.mark} />
      <BrandLogoText size={size === "sm" ? "sm" : size === "lg" ? "lg" : "md"} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
<<<<<<< HEAD
   INTRO — Heading modified to remove Discovery references
=======
   INTRO
>>>>>>> 410b931a02d7c955867771b0f896faf136a69120
────────────────────────────────────────────────────────────── */
function IntroScreen({ onBegin }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full overflow-hidden"
    >
      <div className="container-wide py-12 md:py-20 lg:py-24 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[56px] leading-[1.05] tracking-tight">
            Answer four questions.
            <br />
            <span className="text-[#FF5A00] italic">Find your home.</span>
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-8 h-[2px] w-20 bg-[#FF5A00] origin-left mx-auto"
          />

          <p className="mt-6 max-w-lg mx-auto text-[#000F1B]/60 text-sm md:text-base leading-relaxed">
            A short guided preference selection — your investment, lifestyle, style and
            technology priorities. We'll match you to the right package.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={onBegin}
              className="group inline-flex items-center gap-3 rounded-full bg-[#000F1B] hover:bg-[#FF5A00] text-white text-sm font-semibold px-8 py-4 transition-all shadow-[0_16px_40px_rgba(0,15,27,0.25)]"
            >
              Begin Selection
              <span className="w-7 h-7 rounded-full bg-[#FF5A00] group-hover:bg-white group-hover:text-[#FF5A00] text-white grid place-items-center transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <div className="text-xs text-[#000F1B]/45 font-medium tracking-wider uppercase">
              4 questions · ~30 seconds
            </div>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {QUESTIONS.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.08 }}
                className="rounded-sm border border-black/10 bg-white/60 backdrop-blur p-4 text-left"
              >
                <q.icon className="w-4 h-4 text-[#FF5A00]" />
                <div className="mt-2 text-[9px] font-bold uppercase tracking-widest text-[#000F1B]/45">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-0.5 text-sm font-bold text-[#000F1B]">
                  {q.kicker}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ──────────────────────────────────────────────────────────────
   QUIZ
────────────────────────────────────────────────────────────── */
function QuizScreen({ step, total, current, answers, onPick, onBack }) {
  const [showTip, setShowTip] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative pb-16"
    >
      <div className="container-wide">
        <JourneyIndicator step={step} total={total} answers={answers} />

        <div className="mt-8 grid lg:grid-cols-[1fr_240px] gap-6 lg:gap-8">
          <div className="min-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">
                    {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {current.kicker}
                  </div>

                  {current.tip && (
                    <div className="relative">
                      <button
                        type="button"
                        onMouseEnter={() => setShowTip(true)}
                        onMouseLeave={() => setShowTip(false)}
                        onFocus={() => setShowTip(true)}
                        onBlur={() => setShowTip(false)}
                        onClick={() => setShowTip((s) => !s)}
                        aria-label="Why we ask"
                        className="inline-flex items-center gap-1 rounded-full border border-[#000F1B]/15 bg-white text-[#000F1B]/60 hover:text-[#FF5A00] hover:border-[#FF5A00]/40 text-[10px] font-semibold uppercase tracking-widest px-2 py-1 transition"
                      >
                        <Info className="w-3 h-3" />
                        Why?
                      </button>

                      <AnimatePresence>
                        {showTip && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            className="absolute left-0 top-full mt-2 z-20 w-64 rounded-sm bg-[#000F1B] text-white text-xs leading-relaxed p-3 shadow-xl"
                          >
                            <div className="text-[9px] font-bold uppercase tracking-widest text-[#FF8A4C] mb-1">
                              Why we ask
                            </div>
                            {current.tip}
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-[#000F1B] rotate-45" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <h2 className="mt-3 text-[#000F1B] font-bold text-2xl sm:text-3xl md:text-4xl lg:text-[40px] leading-[1.1] tracking-tight max-w-3xl">
                  {current.title}
                </h2>

                <p className="mt-3 text-[#000F1B]/60 text-sm max-w-xl leading-relaxed">
                  {current.subtitle}
                </p>

<<<<<<< HEAD
                {/* Options */}
=======
>>>>>>> 410b931a02d7c955867771b0f896faf136a69120
                <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {current.options.map((opt, i) => {
                    const active = answers[current.id] === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        onClick={() => onPick(opt.id)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className={`
                          group relative overflow-hidden rounded-sm text-left border transition-all duration-300
                          ${
                            active
                              ? "border-[#FF5A00] shadow-[0_16px_32px_-16px_rgba(255,90,0,0.4)]"
                              : "border-black/10 hover:border-[#000F1B]/40"
                          }
                        `}
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#0B1E30]">
                          <img
                            src={opt.img}
                            alt={opt.label}
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                              active ? "scale-105" : "group-hover:scale-105"
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B]/85 via-[#000F1B]/10 to-transparent" />

                          <AnimatePresence>
                            {active && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#FF5A00] grid place-items-center shadow-lg"
                              >
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="absolute inset-x-0 bottom-0 p-3">
                            <div className="text-white font-bold text-sm sm:text-base leading-tight uppercase tracking-tight line-clamp-1">
                              {opt.label}
                            </div>
                            <div className="text-white/70 text-[10px] mt-0.5 line-clamp-2 leading-tight">
                              {opt.note}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between px-2.5 py-2 bg-white">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${active ? "text-[#FF5A00]" : "text-[#000F1B]/40"}`}>
                            {active ? "Selected" : "Select"}
                          </span>
                          <ArrowRight
                            className={`w-3 h-3 transition-all ${
                              active
                                ? "text-[#FF5A00] translate-x-1"
                                : "text-[#000F1B]/30 group-hover:text-[#FF5A00] group-hover:translate-x-1"
                            }`}
                          />
                        </div>

                        {active && (
                          <motion.div
                            layoutId="activeBar"
                            className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF5A00]"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#000F1B]/60 hover:text-[#FF5A00] transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {step === 0 ? "Back to start" : "Previous"}
                  </button>

                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#000F1B]/40">
                    Tap an answer to continue
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <ProfilePanel answers={answers} />
        </div>
      </div>
    </motion.section>
  );
}

function JourneyIndicator({ step, total, answers }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {QUESTIONS.map((q, i) => {
        const done = i < step || !!answers[q.id];
        const active = i === step;
        return (
          <div key={q.id} className="relative">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  active ? "text-[#FF5A00]" : done ? "text-[#000F1B]" : "text-[#000F1B]/30"
                }`}
              >
                {String(i + 1).padStart(2, "0")} · <span className="hidden sm:inline">{q.kicker}</span>
              </span>
            </div>
            <div className="h-[3px] rounded-full bg-black/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: active ? "60%" : done ? "100%" : "0%",
                }}
                transition={{ duration: 0.5 }}
                className="h-full bg-[#FF5A00]"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProfilePanel({ answers }) {
  return (
    <div className="lg:sticky lg:top-28 self-start">
      <div className="rounded-sm bg-white/70 backdrop-blur border border-black/5 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5A00]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
          Your Selections
        </div>

        <div className="mt-4 space-y-3">
          {QUESTIONS.map((q) => {
            const val = answers[q.id];
            const label = val ? LABELS[q.id]?.[val] || val : "—";
            return (
              <div key={q.id} className="pb-2.5 border-b border-black/5 last:border-0">
                <div className="text-[9px] font-bold uppercase tracking-widest text-[#000F1B]/40">
                  {q.kicker}
                </div>
                <motion.div
                  key={val || "empty"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-0.5 text-sm font-bold ${val ? "text-[#000F1B]" : "text-[#000F1B]/25"}`}
                >
                  {label}
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-black/5 flex items-center gap-2 text-[10px] text-[#000F1B]/45 font-medium">
          <Check className="w-3 h-3 text-emerald-500" />
          Updates in real time
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ANALYSING
────────────────────────────────────────────────────────────── */
function AnalysingScreen() {
  const steps = ["Budget", "Lifestyle", "Architecture", "Technology"];
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[65vh] flex items-center justify-center"
    >
      <div className="container-wide text-center max-w-md">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF5A00] mb-4">
          Processing
        </div>
        <h3 className="text-[#000F1B] font-bold text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight">
          Finding spaces that fit you.
        </h3>

        <div className="mt-10 space-y-3 text-left">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.3, duration: 0.3 }}
              className="flex items-center justify-between border-b border-black/10 pb-3"
            >
              <span className="text-sm font-semibold text-[#000F1B]">{s}</span>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.3 + 0.2 }}
                className="w-6 h-6 rounded-full bg-[#FF5A00] grid place-items-center"
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#000F1B]/50 flex items-center justify-center gap-2"
        >
          <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" />
          Connecting to ConstructONS Engine...
        </motion.div>
      </div>
    </motion.section>
  );
}

function ResultScreen({ result, answers, homes, onRestart, onConsult, onBrochure }) {
  const shortlisted = useMemo(() => {
    if (!homes?.length) return [];
    let list = [...homes];
    if (answers.style && answers.style !== "open") {
      const filtered = list.filter((h) =>
        String(h.style || "").toLowerCase().includes(answers.style)
      );
      if (filtered.length) list = filtered;
    }
    return list.slice(0, 4);
  }, [homes, answers]);

  const reasons = [
    { key: "budget", label: "Fits your preferred budget", val: LABELS.budget?.[answers.budget] },
    { key: "family", label: "Designed for your family size", val: LABELS.family?.[answers.family] },
    { key: "style", label: "Matches your architectural taste", val: LABELS.style?.[answers.style] },
    { key: "smart_home", label: "Supports your smart-home preference", val: LABELS.smart_home?.[answers.smart_home] },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-20"
    >
      <div className="container-wide">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-5xl leading-[1.05] tracking-tight">
            A home designed{" "}
            <span className="italic text-[#FF5A00]">around you.</span>
          </h2>
        </div>

<<<<<<< HEAD
        {/* PACKAGE CARD (Logo-only badge) + WHY */}
=======
        {/* PACKAGE CARD + WHY */}
>>>>>>> 410b931a02d7c955867771b0f896faf136a69120
        <div className="mt-10 grid lg:grid-cols-[1.15fr_1fr] gap-5 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-sm bg-gradient-to-br from-[#000F1B] via-[#0B1E30] to-[#000F1B] text-white p-7 sm:p-9 border border-white/10 shadow-[0_30px_60px_-30px_rgba(0,15,27,0.4)]"
          >
            <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FF5A00]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#FF5A00]/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  {/* BrandPill with logoOnly enabled to display ONLY the logo mark */}
                  <BrandPill size="sm" logoOnly={true} />
                  <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF8A4C]">
                    Recommended Package
                  </div>
                  <h3 className="mt-2 text-white font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight">
                    {result.name}
                  </h3>
                  <div className="mt-1 text-white/60 text-sm">{result.tagline}</div>
                </div>
              </div>

              <div className="mt-6 flex items-end gap-2">
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {result.price}
                </div>
                <div className="text-sm text-white/50 pb-1.5">{result.unit}</div>
                <div className="ml-auto text-[10px] font-bold uppercase tracking-widest text-[#FF8A4C]">
                  {result.tone}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/45 mb-3">
                  What's included
                </div>
                <ul className="space-y-2.5">
                  {result.highlights.map((h, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="flex items-start gap-2.5 text-sm text-white/85"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#FF5A00]/15 border border-[#FF5A00]/30 grid place-items-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#FF8A4C]" strokeWidth={3} />
                      </span>
                      {h}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
                <Link
                  to={`/packages/${result.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white text-sm font-semibold px-6 py-3 shadow-[0_10px_28px_rgba(255,90,0,0.35)] transition"
                >
                  Explore this package <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={onBrochure}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-6 py-3 transition"
                >
                  <Download className="w-4 h-4" /> Brochure
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right: Why this match */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-sm bg-white border border-black/10 p-6 sm:p-8 flex flex-col"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">
              Why this match
            </div>
            <h4 className="mt-2 text-[#000F1B] font-bold text-2xl leading-tight">
              We picked this because…
            </h4>

            <ul className="mt-6 space-y-4 flex-1">
              {reasons.map((r, i) =>
                r.val ? (
                  <motion.li
                    key={r.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#FF5A00]/10 grid place-items-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#FF5A00]" strokeWidth={3} />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[#000F1B]">
                        {r.label}
                      </div>
                      <div className="text-xs text-[#000F1B]/50 mt-0.5">
                        {r.val}
                      </div>
                    </div>
                  </motion.li>
                ) : null
              )}
            </ul>

            <button
              type="button"
              onClick={onConsult}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full border border-black/10 text-[#000F1B] hover:border-[#000F1B] text-sm font-semibold px-6 py-3 transition"
            >
              <Phone className="w-3.5 h-3.5" /> Talk to an expert
            </button>
          </motion.div>
        </div>

        {/* HOMES — small cards */}
        {shortlisted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF5A00]">
                  Recommended Homes
                </div>
                <h3 className="mt-2 text-[#000F1B] font-bold text-xl sm:text-2xl md:text-3xl tracking-tight">
                  {String(shortlisted.length).padStart(2, "0")} homes matched to your profile
                </h3>
              </div>
              <Link
                to="/#home-collection"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A00] hover:gap-2 transition-all"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {shortlisted.map((h, i) => (
                <SmallHomeCard key={h.id || h.slug} home={h} isBest={i === 0} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-black/10">
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#000F1B]/60 hover:text-[#FF5A00] transition"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Selection
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="text-xs text-[#000F1B]/45 font-medium">
              Not sure yet?
            </div>
            <button
              type="button"
              onClick={onConsult}
              className="inline-flex items-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white text-sm font-semibold px-6 py-3 shadow-[0_10px_28px_rgba(255,90,0,0.32)] transition"
            >
              Talk to our home consultant
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* Small recommended home card */
function SmallHomeCard({ home, isBest }) {
  return (
    <Link
      to={`/homes/${home.slug}`}
      className="group relative rounded-sm overflow-hidden bg-white border border-black/10 hover:border-[#FF5A00]/40 hover:shadow-[0_16px_32px_-16px_rgba(255,90,0,0.25)] transition-all block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0B1E30]">
        <img
          src={home.cover_image}
          alt={home.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B]/60 to-transparent" />

        {isBest && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2 py-1 rounded-full bg-[#FF5A00] text-white text-[9px] font-bold uppercase tracking-widest shadow">
            Best Match
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur text-[#000F1B] text-[9px] font-bold uppercase tracking-widest">
          {home.style}
        </div>
      </div>

      <div className="p-3">
        <div className="text-sm font-bold text-[#000F1B] leading-tight line-clamp-1">
          {home.name}
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#000F1B]/55 flex-wrap">
          {home.bedrooms && (
            <span className="inline-flex items-center gap-0.5">
              <Bed className="w-3 h-3 text-[#FF5A00]" />
              {home.bedrooms} BHK
            </span>
          )}
          {home.bathrooms && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-black/20" />
              <span className="inline-flex items-center gap-0.5">
                <Bath className="w-3 h-3 text-[#FF5A00]" />
                {home.bathrooms}
              </span>
            </>
          )}
          {home.floors && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-black/20" />
              <span className="inline-flex items-center gap-0.5">
                <Layers className="w-3 h-3 text-[#FF5A00]" />
                G+{home.floors}
              </span>
            </>
          )}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-black/5 flex items-center justify-between">
          <div className="text-[10px] font-semibold text-[#000F1B]/70 line-clamp-1">
            {home.area_sqft}
          </div>
          <span className="text-[10px] font-bold text-[#FF5A00] inline-flex items-center gap-0.5 group-hover:gap-1 transition-all">
            View
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}