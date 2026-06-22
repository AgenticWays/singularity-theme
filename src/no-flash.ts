// @singularityfp/theme — no-flash theme script. Applies the saved theme before
// first paint. Render in <head>:
//   <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
export const noFlashScript = `(function () {
  try {
    var t = localStorage.getItem('sfp-theme');
    if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();`;

export default noFlashScript;
