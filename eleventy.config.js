import { IdAttributePlugin } from '@11ty/eleventy';
import Image from '@11ty/eleventy-img';
import path from 'node:path';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(IdAttributePlugin);

  eleventyConfig.addPassthroughCopy('src/assets');
  eleventyConfig.addPassthroughCopy('src/admin');
  eleventyConfig.addPassthroughCopy('src/site.webmanifest');
  eleventyConfig.addPassthroughCopy('src/robots.txt');

  eleventyConfig.addWatchTarget('src/**/*.css');

  // The CMS admin page is static (passthrough only) — don't run it through templating.
  eleventyConfig.ignores.add('src/admin/index.html');

  // imgUrl: optimized WebP URL for local images (CMS uploads land in assets/uploads);
  // remote/placeholder URLs pass through untouched.
  eleventyConfig.addNunjucksAsyncFilter('imgUrl', (src, callback) => {
    (async () => {
      if (!src || /^https?:\/\//.test(src)) return src || '';
      const metadata = await Image(path.join('src', src.replace(/^\//, '')), {
        widths: [1200],
        formats: ['webp'],
        outputDir: './dist/img/',
        urlPath: 'img/',
      });
      return metadata.webp[0].url;
    })()
      .then((url) => callback(null, url))
      .catch((err) => callback(err));
  });

  eleventyConfig.addCollection('properties', (c) =>
    c.getFilteredByTag('property').sort((a, b) => (a.data.order || 0) - (b.data.order || 0)),
  );

  eleventyConfig.addFilter('money', (n) => '$' + Number(n).toLocaleString('en-US'));

  return {
    dir: { input: 'src', output: 'dist', includes: '_includes', data: '_data' },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    templateFormats: ['njk', 'md', 'html'],
  };
}
