import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'pt', 'es', 'zh', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'as-needed' 
});