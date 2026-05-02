(()=>{"use strict";var e,t,n,r,o,a,i,c,s,l,d,u,p,m,f={164(e,t,n){n.d(t,{A:()=>c});var r=n(801),o=n.n(r),a=n(210),i=n.n(a)()(o());i.push([e.id,`/* ama-10 shared styles */

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
`,""]);let c=i},210(e){e.exports=function(e){var t=[];return t.toString=function(){return this.map(function(t){var n="",r=void 0!==t[5];return t[4]&&(n+="@supports (".concat(t[4],") {")),t[2]&&(n+="@media ".concat(t[2]," {")),r&&(n+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),n+=e(t),r&&(n+="}"),t[2]&&(n+="}"),t[4]&&(n+="}"),n}).join("")},t.i=function(e,n,r,o,a){"string"==typeof e&&(e=[[null,e,void 0]]);var i={};if(r)for(var c=0;c<this.length;c++){var s=this[c][0];null!=s&&(i[s]=!0)}for(var l=0;l<e.length;l++){var d=[].concat(e[l]);r&&i[d[0]]||(void 0!==a&&(void 0===d[5]||(d[1]="@layer".concat(d[5].length>0?" ".concat(d[5]):""," {").concat(d[1],"}")),d[5]=a),n&&(d[2]&&(d[1]="@media ".concat(d[2]," {").concat(d[1],"}")),d[2]=n),o&&(d[4]?(d[1]="@supports (".concat(d[4],") {").concat(d[1],"}"),d[4]=o):d[4]="".concat(o)),t.push(d))}},t}},801(e){e.exports=function(e){return e[1]}},431(e){var t=[];function n(e){for(var n=-1,r=0;r<t.length;r++)if(t[r].identifier===e){n=r;break}return n}function r(e,r){for(var o={},a=[],i=0;i<e.length;i++){var c=e[i],s=r.base?c[0]+r.base:c[0],l=o[s]||0,d="".concat(s," ").concat(l);o[s]=l+1;var u=n(d),p={css:c[1],media:c[2],sourceMap:c[3],supports:c[4],layer:c[5]};if(-1!==u)t[u].references++,t[u].updater(p);else{var m=function(e,t){var n=t.domAPI(t);return n.update(e),function(t){t?(t.css!==e.css||t.media!==e.media||t.sourceMap!==e.sourceMap||t.supports!==e.supports||t.layer!==e.layer)&&n.update(e=t):n.remove()}}(p,r);r.byIndex=i,t.splice(i,0,{identifier:d,updater:m,references:1})}a.push(d)}return a}e.exports=function(e,o){var a=r(e=e||[],o=o||{});return function(e){e=e||[];for(var i=0;i<a.length;i++){var c=n(a[i]);t[c].references--}for(var s=r(e,o),l=0;l<a.length;l++){var d=n(a[l]);0===t[d].references&&(t[d].updater(),t.splice(d,1))}a=s}}},456(e){var t={};e.exports=function(e,n){var r=function(e){if(void 0===t[e]){var n=document.querySelector(e);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}t[e]=n}return t[e]}(e);if(!r)throw Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");r.appendChild(n)}},579(e){e.exports=function(e){var t=document.createElement("style");return e.setAttributes(t,e.attributes),e.insert(t,e.options),t}},471(e,t,n){e.exports=function(e){var t=n.nc;t&&e.setAttribute("nonce",t)}},588(e){e.exports=function(e){if("u"<typeof document)return{update:function(){},remove:function(){}};var t=e.insertStyleElement(e);return{update:function(n){var r,o,a;r="",n.supports&&(r+="@supports (".concat(n.supports,") {")),n.media&&(r+="@media ".concat(n.media," {")),(o=void 0!==n.layer)&&(r+="@layer".concat(n.layer.length>0?" ".concat(n.layer):""," {")),r+=n.css,o&&(r+="}"),n.media&&(r+="}"),n.supports&&(r+="}"),(a=n.sourceMap)&&"u">typeof btoa&&(r+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(a))))," */")),e.styleTagTransform(r,t,e.options)},remove:function(){var e;null===(e=t).parentNode||e.parentNode.removeChild(e)}}}},184(e){e.exports=function(e,t){if(t.styleSheet)t.styleSheet.cssText=e;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(e))}}}},v={};function h(e){var t=v[e];if(void 0!==t)return t.exports;var n=v[e]={id:e,exports:{}};return f[e](n,n.exports,h),n.exports}h.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return h.d(t,{a:t}),t},h.d=(e,t)=>{for(var n in t)h.o(t,n)&&!h.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},h.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),h.nc=void 0,h.rv=()=>"1.7.11",h.ruid="bundler=rspack@1.7.11",e=h(431),t=h.n(e),n=h(588),r=h.n(n),o=h(456),a=h.n(o),i=h(471),c=h.n(i),s=h(579),l=h.n(s),d=h(184),u=h.n(d),p=h(164),(m={}).styleTagTransform=u(),m.setAttributes=c(),m.insert=a().bind(null,"head"),m.domAPI=r(),m.insertStyleElement=l(),t()(p.A,m),p.A&&p.A.locals&&p.A.locals,(()=>{let e=document.getElementById("terminal-lines"),t=document.getElementById("input"),n=!1,r=null;function o(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function a(){for(;e.children.length>200;)e.removeChild(e.firstChild)}function i(t,n){let r=document.createElement("div");return r.className="line"+(n?" "+n:""),r.textContent=t,e.appendChild(r),a(),r}function c(){let t=document.createElement("div");return t.className="line prompt",t.innerHTML='<span class="cursor-underline"></span>',e.appendChild(t),a(),r=t,t}function s(e){r&&(r.innerHTML=o(e)+'<span class="cursor-underline"></span>')}async function l(e){let t=await fetch("https://ak.hypergryph.com/ama-10-console",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({command:e})});if(401===t.status)return{ok:!1,reason:"invalid_command"};if(!t.ok)return{ok:!1,reason:"service_unreachable"};let n=await t.json();return n.ok&&"string"==typeof n.archive&&"string"==typeof n.redirectPath?{ok:!0,archive:n.archive,redirectPath:n.redirectPath}:{ok:!1,reason:"service_unreachable"}}async function d(t){if(n)return;if(r&&(r.innerHTML=o(t),r=null),0===t.trim().length)return void c();n=!0;let s=String(t).replace(/\s+/g,"");if("devlog"===s){const y=document.createElement("div");y.className="line dim",y.appendChild(document.createTextNode("> launching "));const z=document.createElement("span");z.className="accent",z.textContent=s,y.appendChild(z),y.appendChild(document.createTextNode("...")),e.appendChild(y),a(),sessionStorage.setItem("ama10_archive_snapshot",`#1
TT 202/06/14
一种足够结实耐用的，可以用于重建工作的多功能机器。
立项的初衷很简单。如果那之后还有人幸存，它能在重建工作上予以协助。如果幸存的是其他生命形态，它至少也能提供些基本的引导。
称不上是多么重要的项目，但大家都对它格外上心。应该承认，我也是。
毕竟，只是想象未来还会有生命存续，就足够让人欣慰了。

#10
TT 202/10/23
那么现在，我们来假设你会遇到某种非人的生命形态。这的确是在将来有可能发生的事。
你首先应该有办法表示善意。避免无谓的冲突是很重要的，哪怕不考虑原则性问题，飞溅的血液对你的机械结构也不太友好。
麻烦的是，我们没法预测你会遇到怎样的生命形态，更妄谈掌握它们的交流方式。
所以，最方便的办法应该是某种拟态构造功能。你能变成它们的模样、模仿它们的声音，就能和它们相处。
我想，所有生命终归都是需要同类的，你或许也不例外。

#17
TT 202/12/05
我该给你录入些人类文明的瑰宝。过去我们还会成百上千地往深空里抛撒探测器的时候，就规定过对外应该传递什么样的讯息——哪几门语言听起来比较友好、哪几个公式不会显得我们像傻瓜，当然还有永远吵不出结果的，哪些音乐能代表我们的艺术品位。
但我却在这里给你录入笑话集。
我们为什么永远不往太空里发送笑话？因为笑话是玩弄轻重的艺术，有人被它逗笑，就一定有人会被它冒犯，更别提其他生命形态了。但这次，如果我的兼容指令编得够好，你或许能正确地理解人类历史上的每一个笑话。
但愿这个功能最后的用处，是让你在需要笑声的场合能笑出来，而不是到处去解释笑话。

#35
TT 203/04/11
测试结果符合预期，现在你会骂人了。
编写语言模块的时候，我们本来想过要把粗口都删掉。语言相对论就像神的幽灵，平常再怎么批判它，真到了这种时候，我们又都愿意相信只要语言得到矫正，拾起这些语言的后来者，就不必继承我们思维当中根深蒂固的隔阂。
开发过程中我们一直在用占位符代替粗口，得益于我们糟糕的幽默感，占位符就是*粗口*。但最终，我们没能从你的语言逻辑里彻底剔除掉对这类词语的需求——至少，如果不想损害你的情感模块，就做不到。
我没法剥夺你感受愤怒、感受悲伤、感受痛苦的能力。
所以我猜，你也得有办法表达它们。
......不知不觉中我好像已经在这个项目中投入太多精力了。

#63
TT 203/09/28
我大概会被宣判亵渎科学进步之类的罪名吧。
......别那样反应，你要是听不出我在开玩笑，我之前给你写的那些兼容笑话的指令算什么？
话虽如此，让你做梦这件事，确实不怎么符合常理。
你看，梦是我们大脑的副产物，是我们的记忆处理机制太过原始的表现。你的处理机制要成熟得多，所有的信息只会以最合乎逻辑的方式被组合、归纳。实际上，为了在你身上准确地复现出这种原始的副产物，我还费了些工夫。
倒不是为了让你从梦里获取灵感——虽然我自己经常这样——只是......
很多事物在有悖逻辑的状态下，才更有趣。如果你要在同一种现实里熬过上万年之久，却一次也没见过长了翅膀的面包在天上飞......我大概会感到愧疚的。

###
TT ----
AMa-10。
我猜，如果你的情感模块表现正常，你苏醒后最先感受到的，应该是恐惧。
我们每个人在诞生之初，都只需要做最简单的事：啼哭、乞食，就这样。但你......你的任务序列关乎整个世界的未来，它们不会循序渐进地展开，它们占满了你将要存在的全部时间，从你苏醒的那一刻起就是如此。
至少，如果是我，我会感到恐惧。那是太多人的太多期望了。
希望再加上这最后一条，不会太过分，或者......太自私。
"去找你自己。"
> project ama-10 // deregistered.
> subject reclassified.`),await new Promise(e=>setTimeout(e,550)),location.href="devlog/",n=!1;return}let d=document.createElement("div");d.className="line dim",d.textContent="> ...",e.appendChild(d),a();try{let r=await l(t);if(!r.ok){d.remove(),"invalid_command"===r.reason?i("command not found: "+t,"error"):i("error: archive unreachable.","error"),c(),n=!1;return}d.remove();let o=document.createElement("div");o.className="line dim",o.appendChild(document.createTextNode("> launching "));let u=document.createElement("span");u.className="accent",u.textContent=s,o.appendChild(u),o.appendChild(document.createTextNode("...")),e.appendChild(o),a(),sessionStorage.setItem("ama10_archive_snapshot",r.archive),await new Promise(e=>setTimeout(e,550)),location.href=r.redirectPath}catch(e){console.error("[ama-10] launch failed:",e),d.remove(),i("error: archive unreachable.","error"),c(),n=!1}}function u(){n||document.activeElement===t||t.focus()}t.addEventListener("input",()=>s(t.value)),t.addEventListener("keydown",e=>{if("Enter"===e.key){e.preventDefault();let n=t.value;t.value="",s(""),d(n)}}),document.addEventListener("click",u),document.addEventListener("touchstart",u,{passive:!0}),document.addEventListener("keydown",e=>{document.activeElement!==t&&t.focus()}),window.addEventListener("focus",u),c(),setTimeout(()=>t.focus(),0);let p=document.getElementById("signal-pulse");function m(){!p||document.hidden||(p.classList.remove("flash"),p.offsetWidth,p.classList.add("flash"))}setTimeout(()=>{m(),setInterval(m,45e3)},45e3)})()})();