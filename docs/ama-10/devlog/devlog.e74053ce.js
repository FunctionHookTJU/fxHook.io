(()=>{"use strict";var e,t,n,r,a,o,i,s,c,l,d,u,p,f,m,h,g,v={164(e,t,n){n.d(t,{A:()=>s});var r=n(801),a=n.n(r),o=n(210),i=n.n(o)()(a());i.push([e.id,`/* ama-10 shared styles */

:root {
  --bg: #050505;
  --fg: #e8e8e8;
  --fg-dim: #6a6a6a;
  --fg-accent: #c8c8c8;
  --fg-error: #c66;
  --signal: #bbff00;
  --mono: ui-monospace, "JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", Menlo, "Courier New", monospace;
  --sans: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.accent {
  color: var(--signal);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--mono);
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
}

body {
  position: relative;
}

@keyframes blink {
  0%, 49% { opacity: 0.65; }
  50%, 100% { opacity: 0; }
}

.cursor-underline {
  display: inline-block;
  width: 0.55em;
  border-bottom: 2px solid var(--fg);
  vertical-align: text-bottom;
  animation: blink 1.1s steps(1) infinite;
  margin-left: 2px;
}

#orientation-gate { display: none; }

@media (orientation: portrait) and (max-width: 900px) {
  #orientation-gate {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--bg);
    color: var(--fg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: 14px;
    line-height: 1.9;
    padding: 0 2rem;
    text-align: left;
  }
  #orientation-gate p { margin: 0; }
}

::selection {
  background: #333;
  color: var(--fg);
}
`,""]);let s=i},210(e){e.exports=function(e){var t=[];return t.toString=function(){return this.map(function(t){var n="",r=void 0!==t[5];return t[4]&&(n+="@supports (".concat(t[4],") {")),t[2]&&(n+="@media ".concat(t[2]," {")),r&&(n+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),n+=e(t),r&&(n+="}"),t[2]&&(n+="}"),t[4]&&(n+="}"),n}).join("")},t.i=function(e,n,r,a,o){"string"==typeof e&&(e=[[null,e,void 0]]);var i={};if(r)for(var s=0;s<this.length;s++){var c=this[s][0];null!=c&&(i[c]=!0)}for(var l=0;l<e.length;l++){var d=[].concat(e[l]);r&&i[d[0]]||(void 0!==o&&(void 0===d[5]||(d[1]="@layer".concat(d[5].length>0?" ".concat(d[5]):""," {").concat(d[1],"}")),d[5]=o),n&&(d[2]&&(d[1]="@media ".concat(d[2]," {").concat(d[1],"}")),d[2]=n),a&&(d[4]?(d[1]="@supports (".concat(d[4],") {").concat(d[1],"}"),d[4]=a):d[4]="".concat(a)),t.push(d))}},t}},801(e){e.exports=function(e){return e[1]}},431(e){var t=[];function n(e){for(var n=-1,r=0;r<t.length;r++)if(t[r].identifier===e){n=r;break}return n}function r(e,r){for(var a={},o=[],i=0;i<e.length;i++){var s=e[i],c=r.base?s[0]+r.base:s[0],l=a[c]||0,d="".concat(c," ").concat(l);a[c]=l+1;var u=n(d),p={css:s[1],media:s[2],sourceMap:s[3],supports:s[4],layer:s[5]};if(-1!==u)t[u].references++,t[u].updater(p);else{var f=function(e,t){var n=t.domAPI(t);return n.update(e),function(t){t?(t.css!==e.css||t.media!==e.media||t.sourceMap!==e.sourceMap||t.supports!==e.supports||t.layer!==e.layer)&&n.update(e=t):n.remove()}}(p,r);r.byIndex=i,t.splice(i,0,{identifier:d,updater:f,references:1})}o.push(d)}return o}e.exports=function(e,a){var o=r(e=e||[],a=a||{});return function(e){e=e||[];for(var i=0;i<o.length;i++){var s=n(o[i]);t[s].references--}for(var c=r(e,a),l=0;l<o.length;l++){var d=n(o[l]);0===t[d].references&&(t[d].updater(),t.splice(d,1))}o=c}}},456(e){var t={};e.exports=function(e,n){var r=function(e){if(void 0===t[e]){var n=document.querySelector(e);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}t[e]=n}return t[e]}(e);if(!r)throw Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");r.appendChild(n)}},579(e){e.exports=function(e){var t=document.createElement("style");return e.setAttributes(t,e.attributes),e.insert(t,e.options),t}},471(e,t,n){e.exports=function(e){var t=n.nc;t&&e.setAttribute("nonce",t)}},588(e){e.exports=function(e){if("u"<typeof document)return{update:function(){},remove:function(){}};var t=e.insertStyleElement(e);return{update:function(n){var r,a,o;r="",n.supports&&(r+="@supports (".concat(n.supports,") {")),n.media&&(r+="@media ".concat(n.media," {")),(a=void 0!==n.layer)&&(r+="@layer".concat(n.layer.length>0?" ".concat(n.layer):""," {")),r+=n.css,a&&(r+="}"),n.media&&(r+="}"),n.supports&&(r+="}"),(o=n.sourceMap)&&"u">typeof btoa&&(r+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(o))))," */")),e.styleTagTransform(r,t,e.options)},remove:function(){var e;null===(e=t).parentNode||e.parentNode.removeChild(e)}}}},184(e){e.exports=function(e,t){if(t.styleSheet)t.styleSheet.cssText=e;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(e))}}}},y={};function b(e){var t=y[e];if(void 0!==t)return t.exports;var n=y[e]={id:e,exports:{}};return v[e](n,n.exports,b),n.exports}b.m=v,b.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return b.d(t,{a:t}),t},w=Object.getPrototypeOf?e=>Object.getPrototypeOf(e):e=>e.__proto__,b.t=function(e,t){if(1&t&&(e=this(e)),8&t||"object"==typeof e&&e&&(4&t&&e.__esModule||16&t&&"function"==typeof e.then))return e;var n=Object.create(null);b.r(n);var r={};x=x||[null,w({}),w([]),w(w)];for(var a=2&t&&e;("object"==typeof a||"function"==typeof a)&&!~x.indexOf(a);a=w(a))Object.getOwnPropertyNames(a).forEach(t=>{r[t]=()=>e[t]});return r.default=()=>e,b.d(n,r),n},b.d=(e,t)=>{for(var n in t)b.o(t,n)&&!b.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},b.f={},b.e=e=>Promise.all(Object.keys(b.f).reduce((t,n)=>(b.f[n](e,t),t),[])),b.u=e=>""+e+".4353006e.js",b.g=(()=>{if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(e){if("object"==typeof window)return window}})(),b.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),C={},b.l=function(e,t,n,r){if(C[e])return void C[e].push(t);if(void 0!==n)for(var a,o,i=document.getElementsByTagName("script"),s=0;s<i.length;s++){var c=i[s];if(c.getAttribute("src")==e||c.getAttribute("data-rspack")=="ama-10:"+n){a=c;break}}a||(o=!0,(a=document.createElement("script")).timeout=120,b.nc&&a.setAttribute("nonce",b.nc),a.setAttribute("data-rspack","ama-10:"+n),a.src=e),C[e]=[t];var l=function(t,n){a.onerror=a.onload=null,clearTimeout(d);var r=C[e];if(delete C[e],a.parentNode&&a.parentNode.removeChild(a),r&&r.forEach(function(e){return e(n)}),t)return t(n)},d=setTimeout(l.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=l.bind(null,a.onerror),a.onload=l.bind(null,a.onload),o&&document.head.appendChild(a)},b.r=e=>{"u">typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},b.nc=void 0,b.rv=()=>"1.7.11",b.g.importScripts&&(E=b.g.location+"");var x,w,C,E,S=b.g.document;if(!E&&S&&(S.currentScript&&"SCRIPT"===S.currentScript.tagName.toUpperCase()&&(E=S.currentScript.src),!E)){var T=S.getElementsByTagName("script");if(T.length)for(var k=T.length-1;k>-1&&(!E||!/^http(s?):/.test(E));)E=T[k--].src}if(!E)throw Error("Automatic publicPath is not supported in this browser");b.p=(E=E.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"))+"../",e={433:0},b.f.j=function(t,n){var r=b.o(e,t)?e[t]:void 0;if(0!==r)if(r)n.push(r[2]);else{var a=new Promise((n,a)=>r=e[t]=[n,a]);n.push(r[2]=a);var o=b.p+b.u(t),i=Error();b.l(o,function(n){if(b.o(e,t)&&(0!==(r=e[t])&&(e[t]=void 0),r)){var a=n&&("load"===n.type?"missing":n.type),o=n&&n.target&&n.target.src;i.message="Loading chunk "+t+" failed.\n("+a+": "+o+")",i.name="ChunkLoadError",i.type=a,i.request=o,r[1](i)}},"chunk-"+t,t)}},t=(t,n)=>{var r,a,[o,i,s]=n,c=0;if(o.some(t=>0!==e[t])){for(r in i)b.o(i,r)&&(b.m[r]=i[r]);s&&s(b)}for(t&&t(n);c<o.length;c++)a=o[c],b.o(e,a)&&e[a]&&e[a][0](),e[a]=0},(n=self.webpackChunkama_10=self.webpackChunkama_10||[]).forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n)),b.ruid="bundler=rspack@1.7.11",r=b(431),a=b.n(r),o=b(588),i=b.n(o),s=b(456),c=b.n(s),l=b(471),d=b.n(l),u=b(579),p=b.n(u),f=b(184),m=b.n(f),h=b(164),(g={}).styleTagTransform=m(),g.setAttributes=d(),g.insert=c().bind(null,"head"),g.domAPI=i(),g.insertStyleElement=p(),a()(h.A,g),h.A&&h.A.locals&&h.A.locals,(()=>{let e=['&gt; project <span class="accent">ama-10</span> // deregistered.','&gt; subject <span class="accent">reclassified</span>.'],t=document.getElementById("terminal"),n=document.getElementById("bg-wrap");function r(){let e=document.querySelector("[data-ascii-dither-bg]");e&&e.remove(),n&&(n.style.display="none")}let a=null;try{a=sessionStorage.getItem("ama10_archive_snapshot")}catch{a=null}if(!a){r(),i();return}let o=function(e){let t=e.split(/\r?\n/),n=[],r=null,a=null,o=[];function i(){if(!r)return;let e=o.join("\n").trim();n.push({id:r,time:a||"TT ----",body:e}),r=null,a=null,o=[]}for(let e of t){let t=e.trim();if(/^#\d+$/.test(t)||"###"===t){i(),r=t;continue}if(null===r)continue;if(!a&&/^TT\s+/.test(t)){a=t;continue}o.push(e)}return i(),n.filter(e=>e.id)}(a);if(0===o.length){r(),i("> archive corrupted. returning.");return}function i(e){t.innerHTML="";let n=document.createElement("div");n.className="line error",n.textContent=e||"> access denied. initiate query from ama-10 terminal.",t.appendChild(n),setTimeout(()=>{location.href="../"},2200)}function s(e){return new Promise(t=>setTimeout(t,e))}function c(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}async function l(r){let a,o;requestAnimationFrame(()=>n.classList.add("fading")),setTimeout(()=>{if(n.style.display="none","function"==typeof n.firstElementChild?.__asciiDitherDestroy)try{n.firstElementChild.__asciiDitherDestroy()}catch{}},800),(a=document.createElement("div")).className="line fade-in dim",a.textContent="> accessing ama-10 archive...",t.appendChild(a),await s(350);let i=new Set,l=new Set,d=[];for(let e=0;e<r.length;e++){let n=r[e],a=e===r.length-1,o=a?"???":n.id,i=a?"TT ----":n.time,l=document.createElement("div");l.className="line entry-header fade-in",l.setAttribute("role","button"),l.setAttribute("tabindex","0"),l.dataset.idx=String(e),l.innerHTML='<span class="arrow">&gt;</span> log found: <span class="num">'+c(o+" ".repeat(Math.max(0,5-o.length)))+'</span>   <span class="time">'+c(i)+"</span>";let u=document.createElement("div");if(u.className="entry-body",u.dataset.idx=String(e),a){let e=document.createElement("p");e.className="meta",e.textContent=n.id+"   "+n.time,u.appendChild(e)}n.body.split(/\n+/).map(e=>e.trim()).filter(Boolean).forEach(e=>{let t=document.createElement("p");t.textContent=e,u.appendChild(t)}),t.appendChild(l),t.appendChild(u),d.push({header:l,body:u}),l.addEventListener("click",()=>f(e)),l.addEventListener("keydown",t=>{("Enter"===t.key||" "===t.key)&&(t.preventDefault(),f(e))}),await s(350)}function u(e){return"final"===e?r.findIndex(e=>"###"===e.id):r.findIndex(t=>t.id.replace(/^#+/,"")===e)}function p(){let e=Array.from(i).sort((e,t)=>e-t).map(e=>{var t;return"###"===(t=r[e]).id?"final":t.id.replace(/^#+/,"")}),t=0===e.length?"":"#open="+e.join(","),n=location.pathname+location.search+t;history.replaceState(null,"",n)}function f(e){var t;i.has(e)?(t=e,i.delete(t),d[t].body.classList.remove("open"),d[t].header.classList.remove("open"),p()):m(e)}function m(e){i.add(e),l.add(e),d[e].body.classList.add("open"),d[e].header.classList.add("open"),p(),g()}await s(400),d.forEach(({header:e})=>{let t=e.querySelector(".arrow");t&&t.classList.add("pulse")}),await s(800),d.forEach(({header:e})=>{let t=e.querySelector(".arrow");t&&t.classList.remove("pulse")}),((o=/^#open=(.+)$/.exec(location.hash))?o[1].split(",").map(e=>e.trim()).filter(Boolean).map(u).filter(e=>e>=0):[]).forEach(e=>{e>=0&&e<r.length&&m(e)});let h=!1;async function g(){if(h||l.size<r.length)return;h=!0,await s(700);let n=document.createElement("div");for(let r of(n.id="ending",t.appendChild(n),e)){let e=document.createElement("div");e.className="line",e.innerHTML=r,n.appendChild(e),await new Promise(e=>requestAnimationFrame(e)),requestAnimationFrame(()=>e.classList.add("show")),await s(520)}}}b.e("854").then(b.t.bind(b,629,23)).then(()=>{(()=>l(o))()}).catch(()=>{r(),t.innerHTML="";let e=document.createElement("div");e.className="line error",e.textContent="> archive display failed.",t.appendChild(e)})})()})();
