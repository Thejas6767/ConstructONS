"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import {
  motion,
  useInView,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

import {
  Plus,
  Minus,
} from "lucide-react";

import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import LogoMark from "@/components/site/LogoMark";
import { publicApi } from "@/lib/api";


/* =========================================================
   UTILITY
========================================================= */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}


/* =========================================================
   ANIMATED NUMBER
========================================================= */

function AnimatedNumber({
  value,
  suffix = "",
}) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
  });

  const numeric =
    parseInt(String(value).replace(/\D/g, "")) || 0;

  const spring = useSpring(0, {
    bounce: 0,
    duration: 2200,
  });

  const out = useTransform(
    spring,
    (v) => Math.round(v) + suffix
  );

  useEffect(() => {
    if (isInView) {
      spring.set(numeric);
    }
  }, [isInView, numeric, spring]);

  return (
    <motion.span ref={ref}>
      {out}
    </motion.span>
  );
}


/* =========================================================
   POWER BUTTON ICON (REPLACES 'O')
========================================================= */
function PowerIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2v10" />
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    </svg>
  );
}


/* =========================================================
   STAT ICONS
   DIRECT SVG - NO EXTERNAL DEPENDENCY
========================================================= */
function StatIcon({ type }) {
  const iconStyle = {
    width: "26px",
    height: "26px",
    display: "block",
    flexShrink: 0,
  };

  /* HOME */
  if (type === "Home") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={iconStyle}
      >
        <path
          d="M3 10.5L12 3L21 10.5V21H3V10.5Z"
          stroke="#FF5A00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 21V14H15V21"
          stroke="#FF5A00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  /* AWARD / EXPERIENCE */
  if (type === "Award") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={iconStyle}
      >
        <circle
          cx="12"
          cy="9"
          r="6"
          stroke="#FF5A00"
          strokeWidth="2"
        />
        <path
          d="M8.5 14L7 21L12 18L17 21L15.5 14"
          stroke="#FF5A00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  /* CLOCK / DELIVERY */
  if (type === "Clock") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={iconStyle}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="#FF5A00"
          strokeWidth="2"
        />
        <path
          d="M12 7V12L15.5 14"
          stroke="#FF5A00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  /* USERS / TEAM */
  if (type === "Users") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={iconStyle}
      >
        <circle
          cx="9"
          cy="8"
          r="3.5"
          stroke="#FF5A00"
          strokeWidth="2"
        />
        <path
          d="M3 20C3 16.5 5.7 13.8 9 13.8C12.3 13.8 15 16.5 15 20"
          stroke="#FF5A00"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="17"
          cy="9"
          r="2.5"
          stroke="#FF5A00"
          strokeWidth="2"
        />
        <path
          d="M15 15C18.2 14.8 20.5 16.8 20.5 19.5"
          stroke="#FF5A00"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return null;
}


/* =========================================================
   MAIN PAGE COMPONENT
========================================================= */

export default function AboutPage() {

  const [team, setTeam] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState(null);


  useEffect(() => {

    publicApi
      .getTeam()
      .then(setTeam)
      .catch(() => setTeam([]));

    publicApi
      .getFaqs()
      .then(setFaqs)
      .catch(() => setFaqs([]));

    publicApi
      .getSiteSettings()
      .then(setSettings)
      .catch(() => setSettings(null));

  }, []);


  const formattedTeam = team.map((m) => ({
    id: m.id || m.name,
    name: m.name,
    role: m.role,
    expertise:
      m.bio ||
      "Dedicated to building better homes with transparent processes.",
    image: m.photo,
    accent: "#FF5A00",
  }));


  return (

    <div className="bg-white font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white min-h-screen">

      <Header />

      <main>


        {/* =================================================
            HERO SECTION
        ================================================= */}

        <section className="relative min-h-[85svh] md:min-h-[90svh] w-full bg-[#F7F7F7] overflow-hidden pt-20 md:pt-24 flex flex-col justify-between">


          {/* TOP TEXT */}

          <div className="relative z-10 pt-4 md:pt-8 text-center px-2 select-none pointer-events-none">

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full flex flex-col items-center justify-center"
            >

              <h1 className="font-extrabold text-[#000F1B] text-[13vw] sm:text-[11vw] md:text-[10vw] lg:text-[9vw] leading-none tracking-tight whitespace-nowrap flex items-center justify-center">

                Construct

                <span className="inline-flex items-center text-[#FF5A00]">
                  <PowerIcon className="w-[0.72em] h-[0.72em] stroke-[#FF5A00] inline-block -mt-[0.05em]" />
                  NS
                </span>

                <sup className="text-[0.35em] font-bold text-[#FF5A00] -top-[0.8em] ml-[0.05em]">
                  ™
                </sup>

              </h1>


              <p className="mt-3 text-[#000F1B]/50 font-medium text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase">

                Everything Construction. Always On.

              </p>

            </motion.div>

          </div>



          {/* BOTTOM HERO IMAGE */}

          <motion.div
            initial={{
              y: "10%",
              opacity: 0,
            }}
            animate={{
              y: "0%",
              opacity: 1,
            }}
            transition={{
              duration: 1.2,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative z-20 -mt-8 sm:-mt-14 md:-mt-20 w-full flex-1 flex items-end justify-center pointer-events-none"
          >

            <img
              src="/images/about/about.webp"
              alt="ConstructONS Architecture"
              className="w-full max-w-6xl max-h-[50vh] sm:max-h-[60vh] md:max-h-[68vh] object-contain object-bottom drop-shadow-[0_25px_60px_rgba(0,15,27,0.2)]"
              onError={(e) => {

                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80";

                e.currentTarget.className =
                  "w-full max-w-6xl max-h-[50vh] object-cover object-bottom rounded-t-[40px] shadow-2xl";

              }}
            />

          </motion.div>



          {/* FLOATING CARDS */}

          <div className="absolute inset-0 z-30 pointer-events-none">

            <div className="container-wide relative h-full w-full">


              {/* MISSION */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: -30,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.8,
                }}
                className="absolute left-4 bottom-6 md:left-8 md:bottom-12 pointer-events-auto"
              >

                <div className="max-w-[200px] sm:max-w-[240px] bg-white/85 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-black/5 shadow-xl">

                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#FF5A00] mb-2">

                    Our Mission

                  </div>

                  <p className="text-[10px] sm:text-[11px] leading-relaxed text-[#000F1B]/75">

                    To build India&rsquo;s most intelligent construction platform for premium homeowners — with total transparency at every step.

                  </p>

                </div>

              </motion.div>



              {/* WHAT WE BUILD */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: 30,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: 1,
                  duration: 0.8,
                }}
                className="absolute right-4 bottom-6 md:right-8 md:bottom-12 pointer-events-auto hidden sm:block"
              >

                <div className="bg-[#000F1B]/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-xl shadow-2xl max-w-[200px] sm:max-w-[220px] border border-white/10">

                  <div className="flex items-center gap-1.5">

                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-pulse" />

                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#FF8A4C]">

                      What we build

                    </div>

                  </div>


                  <div className="mt-2 text-xs sm:text-sm font-bold leading-snug">

                    Homes engineered for absolute perfection.

                  </div>

                </div>

              </motion.div>


            </div>

          </div>

        </section>



        {/* =================================================
            STATS SECTION
        ================================================= */}

        <section className="py-12 md:py-16 bg-white relative z-30">

          <div className="container-wide">

            <div
              className="
                relative
                overflow-hidden
                bg-[#000F1B]
                rounded-[2.5rem]
                md:rounded-full
                py-8
                md:py-10
                px-5
                sm:px-8
                md:px-12
                border
                border-white/10
                shadow-2xl
                shadow-[#000F1B]/20
              "
            >

              {/* Glowing decorative circles */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -bottom-10
                  w-60
                  h-60
                  bg-[#FF5A00]/15
                  rounded-full
                  blur-3xl
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -left-10
                  -top-10
                  w-60
                  h-60
                  bg-[#FF5A00]/10
                  rounded-full
                  blur-3xl
                "
              />


              {/* STATS GRID */}

              <div
                className="
                  relative
                  z-10
                  grid
                  grid-cols-2
                  md:grid-cols-4
                  gap-y-8
                  md:gap-y-0
                "
              >


                {/* =========================================
                    HOME
                ========================================= */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    sm:gap-4
                    px-3
                    md:px-5
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      shrink-0
                      rounded-[1.25rem]
                      border
                      border-white/10
                      bg-[#132230]
                      shadow-inner
                    "
                    style={{
                      width: "56px",
                      height: "56px",
                      minWidth: "56px",
                      minHeight: "56px",
                    }}
                  >
                    <StatIcon type="Home" />
                  </div>


                  <div className="text-left">

                    <div
                      className="
                        text-2xl
                        sm:text-3xl
                        md:text-4xl
                        font-extrabold
                        leading-none
                        text-white
                      "
                    >
                      <AnimatedNumber
                        value="250"
                        suffix="+"
                      />
                    </div>

                    <div
                      className="
                        mt-1
                        text-[9px]
                        sm:text-[10px]
                        md:text-xs
                        font-semibold
                        tracking-wider
                        text-white/60
                      "
                    >
                      Homes Planned
                    </div>

                  </div>

                </motion.div>



                {/* =========================================
                    AWARD
                ========================================= */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.1,
                  }}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    sm:gap-4
                    px-3
                    md:px-5
                    md:border-l
                    md:border-white/10
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      shrink-0
                      rounded-[1.25rem]
                      border
                      border-white/10
                      bg-[#132230]
                      shadow-inner
                    "
                    style={{
                      width: "56px",
                      height: "56px",
                      minWidth: "56px",
                      minHeight: "56px",
                    }}
                  >
                    <StatIcon type="Award" />
                  </div>


                  <div className="text-left">

                    <div
                      className="
                        text-2xl
                        sm:text-3xl
                        md:text-4xl
                        font-extrabold
                        leading-none
                        text-white
                      "
                    >
                      <AnimatedNumber
                        value="10"
                        suffix="+"
                      />
                    </div>

                    <div
                      className="
                        mt-1
                        text-[9px]
                        sm:text-[10px]
                        md:text-xs
                        font-semibold
                        tracking-wider
                        text-white/60
                      "
                    >
                      Years Experience
                    </div>

                  </div>

                </motion.div>



                {/* =========================================
                    CLOCK
                ========================================= */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2,
                  }}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    sm:gap-4
                    px-3
                    md:px-5
                    md:border-l
                    md:border-white/10
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      shrink-0
                      rounded-[1.25rem]
                      border
                      border-white/10
                      bg-[#132230]
                      shadow-inner
                    "
                    style={{
                      width: "56px",
                      height: "56px",
                      minWidth: "56px",
                      minHeight: "56px",
                    }}
                  >
                    <StatIcon type="Clock" />
                  </div>


                  <div className="text-left">

                    <div
                      className="
                        text-2xl
                        sm:text-3xl
                        md:text-4xl
                        font-extrabold
                        leading-none
                        text-white
                      "
                    >
                      <AnimatedNumber
                        value="98"
                        suffix="%"
                      />
                    </div>

                    <div
                      className="
                        mt-1
                        text-[9px]
                        sm:text-[10px]
                        md:text-xs
                        font-semibold
                        tracking-wider
                        text-white/60
                      "
                    >
                      On-Time Delivery
                    </div>

                  </div>

                </motion.div>



                {/* =========================================
                    USERS
                ========================================= */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3,
                  }}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    sm:gap-4
                    px-3
                    md:px-5
                    md:border-l
                    md:border-white/10
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      shrink-0
                      rounded-[1.25rem]
                      border
                      border-white/10
                      bg-[#132230]
                      shadow-inner
                    "
                    style={{
                      width: "56px",
                      height: "56px",
                      minWidth: "56px",
                      minHeight: "56px",
                    }}
                  >
                    <StatIcon type="Users" />
                  </div>


                  <div className="text-left">

                    <div
                      className="
                        text-2xl
                        sm:text-3xl
                        md:text-4xl
                        font-extrabold
                        leading-none
                        text-white
                      "
                    >
                      <AnimatedNumber
                        value="50"
                        suffix="+"
                      />
                    </div>

                    <div
                      className="
                        mt-1
                        text-[9px]
                        sm:text-[10px]
                        md:text-xs
                        font-semibold
                        tracking-wider
                        text-white/60
                      "
                    >
                      Expert Professionals
                    </div>

                  </div>

                </motion.div>


              </div>

            </div>

          </div>

        </section>



        {/* =================================================
            TEAM
        ================================================= */}

        <section
          className="relative py-20 md:py-28 bg-[#F7F7F7] bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{
            backgroundImage:
              "url('/images/about/teambg.webp')",
          }}
        >

          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none" />

          <div className="container-wide relative z-10">

            {formattedTeam.length > 0 && (

              <TeamRevealGrid
                eyebrow="Leadership"
                title="Meet the team"
                description="The architects, engineers, and visionaries building the future of construction."
                members={formattedTeam}
              />

            )}

          </div>

        </section>



        {/* =================================================
            FAQ
        ================================================= */}

        <section
          id="faq"
          className="py-20 md:py-28 bg-white border-t border-black/5"
        >

          <div className="container-wide">

            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">


              <div className="lg:sticky lg:top-32">

                <div className="inline-flex items-center gap-2 rounded-full border border-[#FF5A00]/20 bg-[#FF5A00]/5 px-3 py-1.5">

                  <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-pulse" />

                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF5A00]">

                    Knowledge Base

                  </span>

                </div>


                <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold text-[#000F1B] leading-[1.1] tracking-tight">

                  Frequently Asked
                  <br />

                  <span className="text-[#FF5A00]">
                    Questions.
                  </span>

                </h2>


                <p className="mt-4 text-[#000F1B]/60 text-sm md:text-base leading-relaxed max-w-sm">

                  Everything you need to know about building with ConstructONS. Can&rsquo;t find the answer? Contact our support team.

                </p>

              </div>



              <div className="space-y-3 sm:space-y-4">

                {faqs.map((f, i) => (

                  <FAQItem
                    key={f.id || i}
                    faq={f}
                    index={i}
                  />

                ))}

              </div>


            </div>

          </div>

        </section>


      </main>


      <Footer settings={settings} />

    </div>
  );
}



/* =========================================================
   FAQ ITEM
========================================================= */

function FAQItem({
  faq,
  index,
}) {

  const [isOpen, setIsOpen] = useState(false);


  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
      }}
      className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
        isOpen
          ? "bg-[#F7F7F7] border-[#FF5A00]/30"
          : "bg-white border-black/5 hover:border-black/15"
      }`}
    >

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 outline-none"
      >

        <span
          className={`font-semibold text-sm sm:text-[15px] pr-4 transition-colors ${
            isOpen
              ? "text-[#FF5A00]"
              : "text-[#000F1B]"
          }`}
        >

          {faq.question}

        </span>


        <div
          className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center transition-colors duration-300 ${
            isOpen
              ? "bg-[#FF5A00] text-white"
              : "bg-[#000F1B]/5 text-[#000F1B]"
          }`}
        >

          {isOpen ? (
            <Minus className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}

        </div>

      </button>


      <AnimatePresence>

        {isOpen && (

          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
          >

            <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-[#000F1B]/65 text-xs sm:text-sm leading-relaxed">

              {faq.answer}

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </motion.div>

  );
}



/* =========================================================
   TEAM HELPERS
========================================================= */

function initials(name) {

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase();

}



/* =========================================================
   PORTRAIT
========================================================= */

function Portrait({
  member,
  active,
}) {

  const style = {
    "--team-accent":
      member.accent ?? "#FF5A00",
  };


  return (

    <div
      style={style}
      className={cn(
        "relative h-full overflow-hidden rounded-[1.05rem] bg-[#E8EEF2] transition-colors duration-500",
        active &&
          "bg-[color-mix(in_srgb,var(--team-accent)_12%,white)]"
      )}
    >

      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 opacity-55 transition-opacity duration-500",
          active && "opacity-100"
        )}
        style={{
          background:
            "radial-gradient(circle at 68% 20%, color-mix(in srgb, var(--team-accent) 36%, transparent), transparent 36%), radial-gradient(circle at 22% 82%, color-mix(in srgb, var(--team-accent) 16%, transparent), transparent 42%)",
        }}
      />


      {member.image ? (

        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          draggable={false}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-top grayscale transition-[filter,transform,opacity] duration-500 ease-out",
            active
              ? "scale-[1.03] grayscale-0"
              : "scale-100 grayscale opacity-85"
          )}
        />

      ) : (

        <div className="absolute inset-0 flex flex-col items-center justify-end overflow-hidden">

          <div
            aria-hidden="true"
            className={cn(
              "absolute top-[13%] aspect-square h-[36%] rounded-full bg-black/10 transition-[transform,background-color] duration-500",
              active &&
                "-translate-y-0.5 scale-105 bg-[var(--team-accent)]"
            )}
          />


          <div
            aria-hidden="true"
            className={cn(
              "absolute -bottom-[12%] h-[66%] w-[82%] rounded-t-[48%] bg-black/10 transition-[transform,background-color] duration-500",
              active &&
                "scale-105 bg-[var(--team-accent)]"
            )}
          />


          <span className="relative z-10 mb-[18%] text-2xl font-bold tracking-tight text-[#000F1B] mix-blend-overlay">

            {initials(member.name)}

          </span>

        </div>

      )}


      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#000F1B]/90 via-[#000F1B]/30 to-transparent transition-opacity duration-500",
          active
            ? "opacity-100"
            : "opacity-0"
        )}
      />

    </div>

  );
}



/* =========================================================
   TEAM REVEAL GRID
========================================================= */

function TeamRevealGrid({
  eyebrow,
  title,
  description,
  members = [],
}) {

  const [
    internalActiveId,
    setInternalActiveId,
  ] = useState(
    members[0]?.id || null
  );


  const [
    interacting,
    setInteracting,
  ] = useState(false);


  const selectMember = useCallback(
    (id) => setInternalActiveId(id),
    []
  );


  useEffect(() => {

    if (
      interacting ||
      members.length < 2
    ) {
      return;
    }


    const timer = window.setInterval(() => {

      setInternalActiveId((current) => {

        const idx =
          members.findIndex(
            (m) => m.id === current
          );

        const next =
          (idx + 1) % members.length;

        return members[next].id;

      });

    }, 2800);


    return () =>
      window.clearInterval(timer);

  }, [
    interacting,
    members,
  ]);


  return (

    <div className="relative w-full mx-auto max-w-6xl">


      <header className="mx-auto mb-10 md:mb-12 max-w-2xl text-center">

        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF5A00]">

          {eyebrow}

        </p>


        <h2 className="text-balance text-3xl sm:text-4xl font-bold tracking-tight text-[#000F1B]">

          <span className="relative inline-block">

            <span className="relative z-10">
              {title}
            </span>


            {/* ANIMATED SVG */}

            <svg
              aria-hidden="true"
              className="absolute -bottom-2 sm:-bottom-3 left-0 h-2 sm:h-3 w-full text-[#FF5A00]"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              fill="none"
            >

              <path
                d="M2 12 Q35 2 95 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="1"
              >

                <animate
                  attributeName="stroke-dasharray"
                  values="0 1;1 0"
                  dur="700ms"
                  fill="freeze"
                />

              </path>


              <path
                d="M5 15 Q40 18 98 5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="1"
              >

                <animate
                  attributeName="stroke-dasharray"
                  values="0 1;1 0"
                  dur="800ms"
                  begin="120ms"
                  fill="freeze"
                />

              </path>

            </svg>

          </span>

        </h2>


        <p className="mx-auto mt-6 max-w-xl text-sm md:text-[15px] leading-relaxed text-[#000F1B]/60">

          {description}

        </p>

      </header>



      {/* TEAM GRID */}

      <ul className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5">

        {members.map((member) => {

          const active =
            member.id ===
            internalActiveId;

          const detailsId =
            `team-member-${member.id}-details`;


          return (

            <li
              key={member.id}
              className="w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.95rem)] min-w-[100px] flex-shrink-0"
            >

              <button
                type="button"
                aria-expanded={active}
                aria-controls={detailsId}

                onClick={() =>
                  selectMember(member.id)
                }

                onPointerEnter={(e) => {

                  if (
                    e.pointerType === "mouse"
                  ) {

                    setInteracting(true);
                    selectMember(member.id);

                  }

                }}

                onPointerLeave={(e) => {

                  if (
                    e.pointerType === "mouse"
                  ) {

                    setInteracting(false);

                  }

                }}

                onFocus={() => {

                  setInteracting(true);
                  selectMember(member.id);

                }}

                onBlur={() =>
                  setInteracting(false)
                }

                className="group block w-full text-left outline-none"
              >

                <div
                  style={{
                    "--team-accent":
                      member.accent ??
                      "#FF5A00",
                  }}

                  className={cn(
                    "relative overflow-hidden rounded-[1.25rem] border bg-white/90 backdrop-blur-sm p-1.5 shadow-[0_10px_35px_-24px_rgba(0,0,0,0.15)] transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",

                    active
                      ? "-translate-y-1 border-[color-mix(in_srgb,var(--team-accent)_50%,transparent)] shadow-[0_22px_48px_-28px_color-mix(in_srgb,var(--team-accent)_60%,transparent)]"

                      : "border-black/5"
                  )}
                >

                  <div
                    className={cn(
                      "h-44 sm:h-48 md:h-52 transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",

                      active &&
                        "h-60 sm:h-64 md:h-72"
                    )}
                  >

                    <Portrait
                      member={member}
                      active={active}
                    />

                  </div>


                  <div
                    id={detailsId}
                    className={cn(
                      "absolute inset-x-3 sm:inset-x-4 bottom-3 z-10 transition-[opacity,transform] duration-500 ease-out",

                      active
                        ? "translate-y-0 opacity-100"
                        : "translate-y-3 opacity-0"
                    )}
                  >

                    <p className="line-clamp-3 text-[10px] sm:text-[11px] md:text-xs leading-relaxed text-white/90 font-medium">

                      {member.expertise}

                    </p>

                  </div>

                </div>


                <div className="px-1 pt-2.5 text-center">

                  <h3 className="truncate text-xs sm:text-sm md:text-base font-bold text-[#000F1B] tracking-tight">

                    {member.name}

                  </h3>


                  <p
                    className={cn(
                      "mt-0.5 truncate text-[10px] sm:text-[11px] md:text-xs font-medium transition-colors duration-300",

                      active
                        ? "text-[#FF5A00]"
                        : "text-[#000F1B]/60"
                    )}
                  >

                    {member.role}

                  </p>

                </div>

              </button>

            </li>

          );

        })}

      </ul>

    </div>

  );
}