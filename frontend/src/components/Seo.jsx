import { Helmet } from 'react-helmet-async';
export default function Seo({ title, desc }) {
  const t = `${title} | CATVORA Technology`;
  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
