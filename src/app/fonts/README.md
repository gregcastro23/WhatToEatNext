# Self-hosted fonts

`next/font/google` downloaded these faces from `fonts.gstatic.com` during
every build. That download failed intermittently and failed the build
(`TypeError: Cannot read properties of null (reading '1')`). It hit GitHub
Actions on #871 and #873 and Vercel previews on #746, #751 and #752. With
`next/font/local`, the build reads the fonts from this directory and never
contacts Google.

| Module | Family | CSS variable | Weights | Styles | Google version |
| --- | --- | --- | --- | --- | --- |
| `cormorantGaramond.ts` | Cormorant Garamond | `--font-display` | 400 500 600 | normal, italic | v21 |
| `manrope.ts` | Manrope | `--font-body` | 300 400 500 600 700 | normal | v20 |
| `jetbrainsMono.ts` | JetBrains Mono | `--font-mono` | 300 400 500 600 | normal | v24 |
| `bodoniModa.ts` | Bodoni Moda | `--font-grimoire` | 400 600 700 | normal, italic | v28 |

## What these files are

The woff2 files are byte-identical to what `next/font/google` 15.5.19
fetched. They were downloaded on 2026-09-23 from the same `css2` URLs, with
the same Chrome 104 user agent. Google publishes each family as one variable
font per unicode-range subset. Each file is named `<subset>[-italic].woff2`.
Every weight's `@font-face` points at the same file, as Google's own CSS does.

Every subset is kept, not only latin. `subsets: ["latin"]` in
`next/font/google` only chose which files to *preload*. Its CSS still
declared, and self-hosted, every subset with its `unicode-range`. Keeping all
of them means non-latin text still renders in the webfont wherever it
appears. Examples are the `ở` in a Vietnamese dish name, Greek letters, and
Bodoni Moda's math and symbol glyphs. A browser only downloads a slice when a
page actually uses one of its characters.

Each `localFont()` call sets `font-family` to the real family name
(`Manrope`, …) instead of using the generated one.
`next/font/google` emitted those same names in production CSS. About 40 call
sites depend on them by naming a family literally, for example
`fontFamily="JetBrains Mono"` in SVGs and `dashboard.css`.

## Fallback faces

Each `<family>/fallback.css` defines `"<Family> Fallback"`. It is a local
Arial or Times New Roman face whose size and line metrics are matched to the
webfont, and it comes second in the family's CSS variable. It draws text
before the webfont loads. After that, it still draws every glyph the webfont
lacks, such as arrows, `▼` and `♂ ♀`, so its metrics are visible in steady
state.

The values are pinned to what `next/font/google` emitted, which it computed
from Next's bundled capsize metrics. `next/font/local`'s own
`adjustFontFallback` measures the woff2 instead. Its result is 1–3% off,
which drew those glyphs visibly smaller. So the latin calls set
`adjustFontFallback: false` and name the pinned face in `fallback`. Each file
lists its inputs and the formula.

## License

All four families are licensed under the SIL Open Font License 1.1 and have no
Reserved Font Names. Each directory carries its `OFL.txt`, copied from
`github.com/google/fonts/tree/main/ofl/<family>`. OFL §2 requires that
license to accompany redistributed copies.

## Git

`.gitattributes` routes `*.woff2` through Git LFS repo-wide but exempts
`src/app/fonts/**`, so these files are stored as ordinary blobs. Vercel's
builder does not fetch LFS objects. With pointers, `next/font/local` would
read 130 bytes of pointer text instead of a font. The build would only log an
error. `__tests__/selfHostedFonts.test.ts` guards this.

## Updating a face

1. Fetch `https://fonts.googleapis.com/css2?family=<Family>:<axes>&display=swap`
   with a Chrome user agent. Without one, Google serves TTF instead of woff2.
2. Download each `src: url(…)` into `<family>/<subset>[-italic].woff2`.
3. Copy each subset's `unicode-range` into its `localFont()` call. Keep
   Google's subset order, with latin last.
4. Leave `fallback.css` alone unless the family's metrics change.
