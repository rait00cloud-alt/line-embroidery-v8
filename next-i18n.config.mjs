/** @type {import('next-i18next').NextI18NextConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt'],
  },
  react: { useSuspense: false },
  eslint: {
    ignoreDuringBuilds: true,
  },
};