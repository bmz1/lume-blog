import lume from "lume/mod.ts";
import metas from "lume/plugins/metas.ts";
import date from "lume/plugins/date.ts";
import code_highlight from "lume/plugins/code_highlight.ts";
import pagefind from "lume/plugins/pagefind.ts";
import windi from "lume/plugins/windi_css.ts";
import postcss from "lume/plugins/postcss.ts";
import imagick from "lume/plugins/imagick.ts";

import lang_javascript from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/javascript.min.js";
import lang_bash from "https://unpkg.com/@highlightjs/cdn-assets@11.6.0/es/languages/bash.min.js";


const site = lume({
  src: "./src",
});

site.copy('favicon.ico')

site.use(postcss());
site.use(metas());
site.use(date())
site.use(code_highlight({
  languages: {
    javascript: lang_javascript,
    bash: lang_bash,
  }
}));
site.use(windi());
site.use(pagefind({
  ui: {
    resetStyles: false,
  }
}));
site.use(imagick());

export default site;
