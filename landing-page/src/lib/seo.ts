/** Keep route metadata aligned after client-side navigation and language changes. */
export function definirSeo({
  titre,
  description,
  url,
}: {
  titre: string;
  description: string;
  url: string;
}) {
  document.title = titre;
  const canonicalUrl = `https://visa.eiden-group.com${url}`;
  const set = (selector: string, attribute: string, value: string) => {
    document.querySelector(selector)?.setAttribute(attribute, value);
  };
  set('meta[name="description"]', "content", description);
  set('link[rel="canonical"]', "href", canonicalUrl);
  set('meta[property="og:url"]', "content", canonicalUrl);
  set('meta[property="og:title"]', "content", titre);
  set('meta[property="og:description"]', "content", description);
  set('meta[name="twitter:title"]', "content", titre);
  set('meta[name="twitter:description"]', "content", description);
}
