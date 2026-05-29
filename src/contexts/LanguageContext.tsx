import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Language = 'en' | 'te' | 'hi' | 'kn' | 'ta';

export const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
];

type Dict = Record<string, string>;

const translations: Record<Language, Dict> = {
  en: {
    'app.title': 'Rescue & Nourish',
    'app.tagline': 'Connecting donors, NGOs & orphanages',
    'lang.choose': 'Choose Your Language',
    'lang.subtitle': 'Select a language to continue. You can change it anytime.',
    'lang.continue': 'Continue',
    'nav.food': 'Food & Donations',
    'nav.tracking': 'Tracking',
    'nav.needs': 'Medical & Needs',
    'nav.chat': 'Donors & Chat',
    'nav.ngos': 'NGOs',
    'nav.watchlist': 'Watchlist',
    'nav.smart': 'Smart Match',
    'nav.notifications': 'Notifications',
    'nav.analytics': 'Analytics',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'action.switchRole': 'Switch Role',
    'action.language': 'Language',
    'action.save': 'Save',
  },
  te: {
    'app.title': 'రెస్క్యూ & నరిష్',
    'app.tagline': 'దాతలు, NGOలు & అనాథాశ్రమాలను కలుపుతుంది',
    'lang.choose': 'మీ భాషను ఎంచుకోండి',
    'lang.subtitle': 'కొనసాగించడానికి భాషను ఎంచుకోండి. మీరు ఎప్పుడైనా మార్చవచ్చు.',
    'lang.continue': 'కొనసాగించు',
    'nav.food': 'ఆహారం & దానాలు',
    'nav.tracking': 'ట్రాకింగ్',
    'nav.needs': 'వైద్య & అవసరాలు',
    'nav.chat': 'దాతలు & చాట్',
    'nav.ngos': 'NGOలు',
    'nav.watchlist': 'వాచ్‌లిస్ట్',
    'nav.smart': 'స్మార్ట్ మ్యాచ్',
    'nav.notifications': 'నోటిఫికేషన్లు',
    'nav.analytics': 'విశ్లేషణ',
    'nav.profile': 'ప్రొఫైల్',
    'nav.admin': 'అడ్మిన్',
    'action.switchRole': 'పాత్ర మార్చు',
    'action.language': 'భాష',
    'action.save': 'భద్రపరచు',
  },
  hi: {
    'app.title': 'रेस्क्यू & नरिश',
    'app.tagline': 'दानदाताओं, NGOs और अनाथालयों को जोड़ना',
    'lang.choose': 'अपनी भाषा चुनें',
    'lang.subtitle': 'जारी रखने के लिए भाषा चुनें. आप इसे कभी भी बदल सकते हैं.',
    'lang.continue': 'जारी रखें',
    'nav.food': 'भोजन और दान',
    'nav.tracking': 'ट्रैकिंग',
    'nav.needs': 'चिकित्सा और ज़रूरतें',
    'nav.chat': 'दानदाता और चैट',
    'nav.ngos': 'NGOs',
    'nav.watchlist': 'वॉचलिस्ट',
    'nav.smart': 'स्मार्ट मैच',
    'nav.notifications': 'सूचनाएं',
    'nav.analytics': 'विश्लेषण',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.admin': 'एडमिन',
    'action.switchRole': 'भूमिका बदलें',
    'action.language': 'भाषा',
    'action.save': 'सहेजें',
  },
  kn: {
    'app.title': 'ರೆಸ್ಕ್ಯೂ & ನರಿಶ್',
    'app.tagline': 'ದಾನಿಗಳು, NGOಗಳು ಮತ್ತು ಅನಾಥಾಶ್ರಮಗಳನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ',
    'lang.choose': 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    'lang.subtitle': 'ಮುಂದುವರಿಯಲು ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಾಯಿಸಬಹುದು.',
    'lang.continue': 'ಮುಂದುವರಿಸಿ',
    'nav.food': 'ಆಹಾರ ಮತ್ತು ದಾನಗಳು',
    'nav.tracking': 'ಟ್ರ್ಯಾಕಿಂಗ್',
    'nav.needs': 'ವೈದ್ಯಕೀಯ ಮತ್ತು ಅಗತ್ಯಗಳು',
    'nav.chat': 'ದಾನಿಗಳು ಮತ್ತು ಚಾಟ್',
    'nav.ngos': 'NGOಗಳು',
    'nav.watchlist': 'ವಾಚ್‌ಲಿಸ್ಟ್',
    'nav.smart': 'ಸ್ಮಾರ್ಟ್ ಮ್ಯಾಚ್',
    'nav.notifications': 'ಅಧಿಸೂಚನೆಗಳು',
    'nav.analytics': 'ವಿಶ್ಲೇಷಣೆ',
    'nav.profile': 'ಪ್ರೊಫೈಲ್',
    'nav.admin': 'ನಿರ್ವಾಹಕ',
    'action.switchRole': 'ಪಾತ್ರ ಬದಲಾಯಿಸಿ',
    'action.language': 'ಭಾಷೆ',
    'action.save': 'ಉಳಿಸಿ',
  },
  ta: {
    'app.title': 'ரெஸ்க்யூ & நரிஷ்',
    'app.tagline': 'நன்கொடையாளர்கள், NGOக்கள் & அனாதை இல்லங்களை இணைக்கிறது',
    'lang.choose': 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    'lang.subtitle': 'தொடர ஒரு மொழியைத் தேர்ந்தெடுக்கவும். நீங்கள் எப்போது வேண்டுமானாலும் மாற்றலாம்.',
    'lang.continue': 'தொடரவும்',
    'nav.food': 'உணவு & நன்கொடைகள்',
    'nav.tracking': 'கண்காணிப்பு',
    'nav.needs': 'மருத்துவம் & தேவைகள்',
    'nav.chat': 'நன்கொடையாளர்கள் & அரட்டை',
    'nav.ngos': 'NGOக்கள்',
    'nav.watchlist': 'கண்காணிப்புப் பட்டியல்',
    'nav.smart': 'ஸ்மார்ட் மேட்ச்',
    'nav.notifications': 'அறிவிப்புகள்',
    'nav.analytics': 'பகுப்பாய்வு',
    'nav.profile': 'சுயவிவரம்',
    'nav.admin': 'நிர்வாகி',
    'action.switchRole': 'பங்கை மாற்று',
    'action.language': 'மொழி',
    'action.save': 'சேமி',
  },
};

interface LanguageContextValue {
  language: Language | null;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language | null>(() => {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem('app_language') as Language | null) || null;
  });

  useEffect(() => {
    const sync = () => {
      setLanguageState((localStorage.getItem('app_language') as Language | null) || null);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('app_language', lang);
    setLanguageState(lang);
  };

  const t = (key: string) => {
    const lang = language || 'en';
    return translations[lang][key] ?? translations.en[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
