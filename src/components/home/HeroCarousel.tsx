import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroSlides } from '../../data/content';
import { SmartImage } from '../ui';

const INTERVAL = 6500;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduce = useReducedMotion();
  const slide = heroSlides[index];

  const go = useCallback((i: number, manual = false) => {
    setIndex((i + heroSlides.length) % heroSlides.length);
    if (manual) setPlaying(false); // l'utilisatrice reprend la main : on arrête la rotation
  }, []);

  useEffect(() => {
    if (!playing || reduce) return;
    const t = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [index, playing, reduce, go]);

  return (
    <section
      className="relative overflow-hidden bg-powder"
      aria-roledescription="carrousel"
      aria-label="Collections Inahair"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blush/80 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-white/50 blur-3xl"
      />
      <div className="container-site relative grid min-h-[600px] items-center gap-8 py-10 md:grid-cols-2 md:py-16 lg:min-h-[640px]">
        <div className="order-2 md:order-1" aria-live={playing ? 'off' : 'polite'}>
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
            >
              <p className="eyebrow">{slide.eyebrow}</p>
              {/* Une seule slide est affichée à la fois : la page garde toujours un titre principal. */}
              <h1 className="mt-4 max-w-xl font-serif text-[2.4rem] leading-[1.08] text-cocoa sm:text-5xl lg:text-[3.6rem]">
                {slide.title}
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">{slide.text}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={slide.primary.to} className="btn-primary px-8">
                  {slide.primary.label}
                </Link>
                <Link to={slide.secondary.to} className="btn-outline px-8">
                  {slide.secondary.label}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1, true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-berry/30 text-berry hover:bg-white"
              aria-label="Diapositive précédente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2" role="tablist" aria-label="Choisir une diapositive">
              {heroSlides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Diapositive ${i + 1} : ${s.eyebrow}`}
                  onClick={() => go(i, true)}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-berry' : 'w-2 bg-berry/30 hover:bg-berry/60'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(index + 1, true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-berry/30 text-berry hover:bg-white"
              aria-label="Diapositive suivante"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              className="ml-1 grid h-10 w-10 place-items-center rounded-full text-muted hover:text-berry"
              aria-label={playing ? 'Mettre en pause le défilement' : 'Relancer le défilement'}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="relative order-1 md:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[290px] sm:max-w-[420px] md:max-w-none lg:max-w-[520px]">
            <div aria-hidden className="absolute -inset-3 rounded-b-[2rem] rounded-t-[999px] border border-berry/20" />
            <div className="relative h-full overflow-hidden rounded-b-[2rem] rounded-t-[999px] bg-blush shadow-soft">
              <AnimatePresence initial={false}>
                <motion.div
                  key={slide.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <SmartImage
                    src={slide.image}
                    alt={slide.imageAlt}
                    loading="eager"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: slide.imagePosition ?? 'center' }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute -left-2 bottom-10 hidden rounded-2xl bg-white/95 px-5 py-4 shadow-soft backdrop-blur sm:block md:-left-10">
              <p className="font-serif text-lg text-berry">Collection 2026</p>
              <p className="text-xs text-muted">Perruques · Tissages · Accessoires</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
