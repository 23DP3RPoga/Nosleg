/**
 * Tulkošanas konteksts: bāzes virkņu vārdnīcas (lv/en) + sapludinājums ar `page-messages.ts`.
 * `t(atslēga)` — aktīvā valoda; ja trūkst tulkojuma, kritiens uz latviešu.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { PAGE_EN, PAGE_LV } from "./page-messages";

export type Lang = "lv" | "en";

type Dict = Record<string, string | string[]>;

const lv: Dict = {
  // Galvenā navigācija
  "nav.home": "Sākums",
  "nav.features": "Iespējas",
  "nav.about": "Par mums",
  "nav.contact": "Kontakti",
  "nav.login": "Pieslēgties",
  "nav.register": "Reģistrēties",
  "nav.dashboard": "Mans pārskats",
  "nav.signout": "Iziet",
  "nav.admin": "Admin",
  "nav.account": "Konts",
  "nav.settings": "Iestatījumi",

  // Sākumlapas varonis (hero)
  "hero.badge": "Personīgā veselības centrāle — vienkārši un droši",
  "hero.title.1": "Tava veselība,",
  "hero.title.italic": "vienuviet",
  "hero.title.2": "un vienmēr pa rokai.",
  "hero.subtitle":
    "Vitalo apvieno medicīnisko vēsturi, ārstu vizītes, zāļu atgādinājumus un veselības rādītājus skaistā, vizuālā skatā — un ļauj droši dalīties ar speciālistiem ar vienu klikšķi.",
  "hero.cta.primary": "Sākt bez maksas",
  "hero.cta.secondary": "Apskatīt demo",
  "hero.trust.gdpr": "GDPR atbilstība",
  "hero.trust.devices": "Apple Watch & Fitbit sinhronizācija",
  "hero.trust.noads": "Bez reklāmām",

  // Iespēju sadaļa (landing)
  "features.eyebrow": "Iespējas",
  "features.title.1": "Viss, kas vajadzīgs tavai",
  "features.title.italic": "veselības rūpēm",
  "features.subtitle":
    "Vitalo aizvieto burtnīcas, atsevišķas lietotnes un nepārskatāmus portālus ar vienu skaidru, lietotājam draudzīgu sistēmu.",
  "features.1.t": "Veselības rādītāji",
  "features.1.d": "Asinsspiediens, cukura līmenis, sirds ritms, svars — viss vienā vietā.",
  "features.2.t": "Gudri atgādinājumi",
  "features.2.d": "Zāļu, vizīšu un izmeklējumu atgādinājumi tieši laikā.",
  "features.3.t": "Vizualizācijas",
  "features.3.d": "Skaisti grafiki un tendences, kas palīdz saprast tavu veselību.",
  "features.4.t": "Viedierīču sinhronizācija",
  "features.4.d": "Apple Watch, Fitbit un Garmin — automātiska datu pārsūtīšana.",
  "features.5.t": "Medicīniskā vēsture",
  "features.5.d": "Izraksti, analīzes un ārstu nosūtījumi vienā drošā glabātuvē.",
  "features.6.t": "Drošā koplietošana",
  "features.6.d": "Dalies ar ārstiem caur unikālu saiti — bez reģistrācijas viesim.",
  "features.7.t": "Speciālistu meklēšana",
  "features.7.d": "Atrodi ārstus pēc jomas, atrašanās vietas un pieejamības.",
  "features.8.t": "Datu drošība",
  "features.8.d": "Šifrēšana un GDPR. Dati paliek tavi — vienmēr.",

  // Pārskata / diagrammu sadaļa sākumlapā
  "dash.eyebrow": "Dati, kas runā",
  "dash.title.1": "Redzi savas veselības",
  "dash.title.italic": "stāstu",
  "dash.title.2": "diagrammās.",
  "dash.subtitle":
    "Asinsspiediens pakāpeniski uzlabojas? Cukura līmenis stabils? Vitalo automātiski analizē tendences un brīdina, kad kaut kas jāpārrunā ar ārstu.",
  "dash.bullet.1": "Automātiska tendenču analīze",
  "dash.bullet.2": "Salīdzinājums ar normām vecuma grupai",
  "dash.bullet.3": "Eksports PDF formātā ārsta vizītei",
  "dash.bp": "Asinsspiediens",
  "dash.systolic": "Sistoliskais",
  "dash.diastolic": "Diastoliskais",

  // Salīdzinājumu tabula
  "compare.eyebrow": "Salīdzinājums",
  "compare.title.1": "Kāpēc Vitalo, nevis",
  "compare.title.italic": "esošās platformas",
  "compare.col.feature": "Iespēja",
  "compare.partial": "daļēji",
  "compare.row.1": "Visi veselības dati vienuviet",
  "compare.row.2": "Viedierīču sinhronizācija",
  "compare.row.3": "Atgādinājumi par zālēm",
  "compare.row.4": "Vizualizācijas un tendences",
  "compare.row.5": "Drošā koplietošana ar ārstu",
  "compare.row.6": "Moderns dizains",
  "compare.row.7": "Pieejams Latvijā",

  // BUJ
  "faq.eyebrow": "Bieži uzdotie jautājumi",
  "faq.title": "Atbildes uz svarīgāko.",
  "faq.1.q": "Vai mani dati ir droši?",
  "faq.1.a": "Jā. Visi dati tiek šifrēti un glabāti atbilstoši GDPR prasībām. Tikai tu kontrolē, kurš var redzēt tavu informāciju.",
  "faq.2.q": "Vai Vitalo aizvieto E-veselību?",
  "faq.2.a": "Nē — Vitalo papildina E-veselību. Tu vari saglabāt savus datus, atgādinājumus un dalīties ar ārstiem ērtākā veidā.",
  "faq.3.q": "Kā darbojas datu koplietošana ar ārstu?",
  "faq.3.a": "Tu izveido drošu saiti ar paroli un derīguma termiņu. Ārsts vai ģimenes loceklis var apskatīt datus bez reģistrācijas.",
  "faq.4.q": "Vai tas ir bez maksas?",
  "faq.4.a": "Pamata funkcijas — atgādinājumi, datu uzskaite un vizualizācijas — ir bez maksas. Papildu iespējas pieejamas Pro plānā.",

  // Aicinājums rīkoties (call-to-action)
  "cta.title.1": "Sāc rūpēties par sevi",
  "cta.title.italic": "jau šodien",
  "cta.subtitle":
    "Pievienojies tūkstošiem cilvēku, kas izvēlējušies pārvaldīt savu veselību gudrāk. Reģistrācija aizņem mazāk par minūti.",
  "cta.primary": "Izveidot kontu",
  "cta.secondary": "Sazināties ar mums",

  // Kājene
  "footer.tagline":
    "Personīgā veselības centrāle — drošas, vizuālas un lietotājam draudzīgas veselības rūpes.",
  "footer.product": "Produkts",
  "footer.legal": "Juridiski",
  "footer.privacy": "Privātums",
  "footer.terms": "Noteikumi",
  "footer.copyright": "Visas tiesības aizsargātas.",
  "footer.made": "Veidots ar rūpēm Latvijā.",

  // Valodas pārslēdzējs
  "lang.label": "Valoda",
  "lang.lv": "Latviešu",
  "lang.en": "Angļu",

  ...PAGE_LV,
};

/** Angļu valodas bāzes virknes — tās pašas atslēgas kā `lv`, lai `t()` strādā abās valodās. */
const en: Dict = {
  "nav.home": "Home",
  "nav.features": "Features",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.login": "Sign in",
  "nav.register": "Sign up",
  "nav.dashboard": "Dashboard",
  "nav.signout": "Sign out",
  "nav.admin": "Admin",
  "nav.account": "Account",
  "nav.settings": "Settings",

  "hero.badge": "Your personal health hub — simple and secure",
  "hero.title.1": "Your health,",
  "hero.title.italic": "all in one place",
  "hero.title.2": "and always at hand.",
  "hero.subtitle":
    "Vitalo brings together medical history, doctor visits, medication reminders and health metrics in a beautiful, visual view — and lets you securely share with specialists in one click.",
  "hero.cta.primary": "Get started free",
  "hero.cta.secondary": "View demo",
  "hero.trust.gdpr": "GDPR compliant",
  "hero.trust.devices": "Apple Watch & Fitbit sync",
  "hero.trust.noads": "No ads",

  "features.eyebrow": "Features",
  "features.title.1": "Everything you need for your",
  "features.title.italic": "health care",
  "features.subtitle":
    "Vitalo replaces notebooks, scattered apps and confusing portals with one clear, user-friendly system.",
  "features.1.t": "Health metrics",
  "features.1.d": "Blood pressure, glucose, heart rate, weight — all in one place.",
  "features.2.t": "Smart reminders",
  "features.2.d": "Medication, visit and check-up reminders right on time.",
  "features.3.t": "Visualizations",
  "features.3.d": "Beautiful charts and trends that help you understand your health.",
  "features.4.t": "Device sync",
  "features.4.d": "Apple Watch, Fitbit and Garmin — automatic data transfer.",
  "features.5.t": "Medical history",
  "features.5.d": "Records, lab results and referrals in one secure vault.",
  "features.6.t": "Secure sharing",
  "features.6.d": "Share with doctors via a unique link — no signup needed for the guest.",
  "features.7.t": "Find specialists",
  "features.7.d": "Find doctors by field, location and availability.",
  "features.8.t": "Data security",
  "features.8.d": "Encryption and GDPR. Your data stays yours — always.",

  "dash.eyebrow": "Data that speaks",
  "dash.title.1": "See your health",
  "dash.title.italic": "story",
  "dash.title.2": "in charts.",
  "dash.subtitle":
    "Is your blood pressure gradually improving? Glucose stable? Vitalo automatically analyzes trends and alerts you when something needs to be discussed with a doctor.",
  "dash.bullet.1": "Automatic trend analysis",
  "dash.bullet.2": "Comparison with norms for your age group",
  "dash.bullet.3": "Export to PDF for doctor visits",
  "dash.bp": "Blood pressure",
  "dash.systolic": "Systolic",
  "dash.diastolic": "Diastolic",

  "compare.eyebrow": "Comparison",
  "compare.title.1": "Why Vitalo, not",
  "compare.title.italic": "existing platforms",
  "compare.col.feature": "Feature",
  "compare.partial": "partial",
  "compare.row.1": "All health data in one place",
  "compare.row.2": "Device sync",
  "compare.row.3": "Medication reminders",
  "compare.row.4": "Visualizations and trends",
  "compare.row.5": "Secure sharing with a doctor",
  "compare.row.6": "Modern design",
  "compare.row.7": "Available in Latvia",

  "faq.eyebrow": "Frequently asked questions",
  "faq.title": "Answers to the most important.",
  "faq.1.q": "Is my data safe?",
  "faq.1.a": "Yes. All data is encrypted and stored in compliance with GDPR. Only you control who can see your information.",
  "faq.2.q": "Does Vitalo replace E-health?",
  "faq.2.a": "No — Vitalo complements E-health. You can store your data, reminders and share with doctors more conveniently.",
  "faq.3.q": "How does sharing data with a doctor work?",
  "faq.3.a": "You create a secure link with a password and expiry date. The doctor or family member can view the data without signing up.",
  "faq.4.q": "Is it free?",
  "faq.4.a": "Core features — reminders, data tracking and visualizations — are free. Additional features are available in the Pro plan.",

  "cta.title.1": "Start taking care of yourself",
  "cta.title.italic": "today",
  "cta.subtitle":
    "Join thousands of people who chose to manage their health smarter. Sign up takes less than a minute.",
  "cta.primary": "Create account",
  "cta.secondary": "Contact us",

  "footer.tagline":
    "Personal health hub — secure, visual and user-friendly health care.",
  "footer.product": "Product",
  "footer.legal": "Legal",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.copyright": "All rights reserved.",
  "footer.made": "Built with care in Latvia.",

  "lang.label": "Language",
  "lang.lv": "Latvian",
  "lang.en": "English",

  ...PAGE_EN,
};

/** Aktīvās valodas vārdnīcas kopā ar `page-messages` papildinājumiem. */
const dicts: Record<Lang, Dict> = { lv, en };

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

const STORAGE_KEY = "vitalo.lang";

/** Saglabā izvēli `localStorage`; bez saglabātas vērtības — pēc pārlūka valodas. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("lv");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (saved === "lv" || saved === "en") {
        setLangState(saved);
      } else if (typeof navigator !== "undefined") {
        const nav = navigator.language.toLowerCase();
        if (nav.startsWith("en")) setLangState("en");
      }
    } catch {
      /* private režīms / ierobežots localStorage */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* skat. augšā */
    }
  };

  const t = (key: string): string => {
    const v = dicts[lang][key];
    if (typeof v === "string") return v;
    const fallback = dicts.lv[key];
    return typeof fallback === "string" ? fallback : key;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Sinhronizē `<html lang>` ar izvēlēto valodu (piekļūstamība un SEO). */
export function DocumentLang() {
  const { lang } = useI18n();
  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "lv";
  }, [lang]);
  return null;
}

/** Uzstāda pārlūka cilnes virsrakstu pēc tulkošanas atslēgas, kad mainās valoda. */
export function usePageTitle(titleKey: string) {
  const { t, lang } = useI18n();
  useEffect(() => {
    document.title = `${t(titleKey)} — Vitalo`;
  }, [lang, titleKey, t]);
}

/** `toLocaleDateString` / `Intl` — atbilstošs lokaļu kods izvēlētajai valodai. */
export function useDateLocale(): string {
  const { lang } = useI18n();
  return lang === "en" ? "en-US" : "lv-LV";
}
