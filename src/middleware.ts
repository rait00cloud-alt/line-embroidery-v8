import createMiddleware from "next-intl/middleware";
import { routing } from '@/i18n/routing'; 

export default createMiddleware({
  // Adicionando japonês (ja), francês (fr) e russo (ru) além dos já existentes
  locales: ['en', 'pt', 'es', 'zh', 'ja', 'fr', 'ru'],
  defaultLocale: 'en',      
  localeDetection: false,   
  localePrefix: 'as-needed' 
});

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
