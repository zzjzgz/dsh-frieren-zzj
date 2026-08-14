# @deepseek-ai/dsh-client-frieren-zzj

dsh-芙莉莲-zzj — Frieren × Himmel (葬送のフリーレン) decorative web theme: an
alias-token override layer, a global stylesheet, and decorative slot entries. The browser
half stacks the token layer through the theme service, injects the global
stylesheet (embedded watercolor background scene, fantasy serif headings,
gold-lilac scrollbar, sparkles, blue-moon-weed flowers, magic circles), and
registers the frame stage, the hero seal, the header badge, and the Himmel
dock quote into their slots.

## Configuration

None. The theme is decorative and always active while the plugin is composed.

## Model Experience

None, as this package affects no model context: it only overrides theme
tokens, injects a static stylesheet, and registers decorative slot entries.

#### KV Cache effect

Does not invalidate: the package neither reads nor writes model requests, so
it never changes the prompt or message prefix; provider cache availability and
eviction remain outside the package contract.

## Known Limitations and Deferred Work

- The background scene is embedded as a base64 data URL inside the client
  bundle (about 0.4 MB), keeping the image self-contained at the cost of
  bundle size.
- Heading fonts load from Google Fonts at runtime; offline sessions fall back
  to local serif stacks.
