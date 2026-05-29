import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LANGUAGES, Language, useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, HandHeart, Languages, Check } from 'lucide-react';

export default function SelectLanguage() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Language>(language || 'en');

  const handleContinue = () => {
    setLanguage(selected);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <Heart className="h-9 w-9 text-emerald-600 fill-emerald-600" />
            <HandHeart className="h-9 w-9 text-orange-500" />
          </div>
          <h1 className="text-3xl font-black text-emerald-800 tracking-tight">
            {t('app.title')}
          </h1>
        </div>

        <Card className="border-emerald-200 shadow-xl bg-white/90 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-emerald-800 flex items-center justify-center gap-2">
              <Languages className="h-6 w-6" />
              {t('lang.choose')}
            </CardTitle>
            <CardDescription>{t('lang.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {LANGUAGES.map(lang => {
              const active = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setSelected(lang.code)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <p className="font-bold text-emerald-900 text-lg">{lang.native}</p>
                      <p className="text-sm text-gray-500">{lang.label}</p>
                    </div>
                  </div>
                  {active && <Check className="h-6 w-6 text-emerald-600" />}
                </button>
              );
            })}

            <Button
              onClick={handleContinue}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
            >
              {t('lang.continue')} →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
