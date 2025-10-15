var oi=Object.defineProperty;var ii=(s,e,t)=>e in s?oi(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var E=(s,e,t)=>ii(s,typeof e!="symbol"?e+"":e,t);import{_ as ne}from"./vendor-BnABG2cI.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const ye=class ye{constructor(){E(this,"listeners",new Map)}static getInstance(){return ye.instance||(ye.instance=new ye),ye.instance}on(e,t){this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(t)}off(e,t){const n=this.listeners.get(e);n&&n.delete(t)}emit(e,t){const n=this.listeners.get(e);n&&n.forEach(r=>{try{r(t)}catch(o){console.error(`Error in event handler for ${e}:`,o)}})}clear(){this.listeners.clear()}removeAllListeners(){this.listeners.clear()}};E(ye,"instance");let Re=ye;const ai=()=>{};var Rs={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sr={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f=function(s,e){if(!s)throw je(e)},je=function(s){return new Error("Firebase Database ("+Sr.SDK_VERSION+") INTERNAL ASSERT FAILED: "+s)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tr=function(s){const e=[];let t=0;for(let n=0;n<s.length;n++){let r=s.charCodeAt(n);r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):(r&64512)===55296&&n+1<s.length&&(s.charCodeAt(n+1)&64512)===56320?(r=65536+((r&1023)<<10)+(s.charCodeAt(++n)&1023),e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},ci=function(s){const e=[];let t=0,n=0;for(;t<s.length;){const r=s[t++];if(r<128)e[n++]=String.fromCharCode(r);else if(r>191&&r<224){const o=s[t++];e[n++]=String.fromCharCode((r&31)<<6|o&63)}else if(r>239&&r<365){const o=s[t++],i=s[t++],a=s[t++],c=((r&7)<<18|(o&63)<<12|(i&63)<<6|a&63)-65536;e[n++]=String.fromCharCode(55296+(c>>10)),e[n++]=String.fromCharCode(56320+(c&1023))}else{const o=s[t++],i=s[t++];e[n++]=String.fromCharCode((r&15)<<12|(o&63)<<6|i&63)}}return e.join("")},jn={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(s,e){if(!Array.isArray(s))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,n=[];for(let r=0;r<s.length;r+=3){const o=s[r],i=r+1<s.length,a=i?s[r+1]:0,c=r+2<s.length,l=c?s[r+2]:0,h=o>>2,d=(o&3)<<4|a>>4;let u=(a&15)<<2|l>>6,m=l&63;c||(m=64,i||(u=64)),n.push(t[h],t[d],t[u],t[m])}return n.join("")},encodeString(s,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(s):this.encodeByteArray(Tr(s),e)},decodeString(s,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(s):ci(this.decodeStringToByteArray(s,e))},decodeStringToByteArray(s,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,n=[];for(let r=0;r<s.length;){const o=t[s.charAt(r++)],a=r<s.length?t[s.charAt(r)]:0;++r;const l=r<s.length?t[s.charAt(r)]:64;++r;const d=r<s.length?t[s.charAt(r)]:64;if(++r,o==null||a==null||l==null||d==null)throw new li;const u=o<<2|a>>4;if(n.push(u),l!==64){const m=a<<4&240|l>>2;if(n.push(m),d!==64){const p=l<<6&192|d;n.push(p)}}}return n},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let s=0;s<this.ENCODED_VALS.length;s++)this.byteToCharMap_[s]=this.ENCODED_VALS.charAt(s),this.charToByteMap_[this.byteToCharMap_[s]]=s,this.byteToCharMapWebSafe_[s]=this.ENCODED_VALS_WEBSAFE.charAt(s),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[s]]=s,s>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(s)]=s,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(s)]=s)}}};class li extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Ar=function(s){const e=Tr(s);return jn.encodeByteArray(e,!0)},xt=function(s){return Ar(s).replace(/\./g,"")},In=function(s){try{return jn.decodeString(s,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function di(s){return Rr(void 0,s)}function Rr(s,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:s===void 0&&(s={});break;case Array:s=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!ui(t)||(s[t]=Rr(s[t],e[t]));return s}function ui(s){return s!=="__proto__"}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hi(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mi=()=>hi().__FIREBASE_DEFAULTS__,fi=()=>{if(typeof process>"u"||typeof Rs>"u")return;const s=Rs.__FIREBASE_DEFAULTS__;if(s)return JSON.parse(s)},gi=()=>{if(typeof document>"u")return;let s;try{s=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=s&&In(s[1]);return e&&JSON.parse(e)},Dr=()=>{try{return ai()||mi()||fi()||gi()}catch(s){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${s}`);return}},pi=s=>{var e,t;return(t=(e=Dr())==null?void 0:e.emulatorHosts)==null?void 0:t[s]},_i=s=>{const e=pi(s);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const n=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),n]:[e.substring(0,t),n]},Nr=()=>{var s;return(s=Dr())==null?void 0:s.config};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class en{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,n))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gn(s){try{return(s.startsWith("http://")||s.startsWith("https://")?new URL(s).hostname:s).endsWith(".cloudworkstations.dev")}catch{return!1}}async function vi(s){return(await fetch(s,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yi(s,e){if(s.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},n=e||"demo-project",r=s.iat||0,o=s.sub||s.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const i={iss:`https://securetoken.google.com/${n}`,aud:n,iat:r,exp:r+3600,auth_time:r,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}},...s};return[xt(JSON.stringify(t)),xt(JSON.stringify(i)),""].join(".")}const st={};function bi(){const s={prod:[],emulator:[]};for(const e of Object.keys(st))st[e]?s.emulator.push(e):s.prod.push(e);return s}function Ei(s){let e=document.getElementById(s),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",s),t=!0),{created:t,element:e}}let Ds=!1;function Ci(s,e){if(typeof window>"u"||typeof document>"u"||!Gn(window.location.host)||st[s]===e||st[s]||Ds)return;st[s]=e;function t(u){return`__firebase__banner__${u}`}const n="__firebase__banner",o=bi().prod.length>0;function i(){const u=document.getElementById(n);u&&u.remove()}function a(u){u.style.display="flex",u.style.background="#7faaf0",u.style.position="fixed",u.style.bottom="5px",u.style.left="5px",u.style.padding=".5em",u.style.borderRadius="5px",u.style.alignItems="center"}function c(u,m){u.setAttribute("width","24"),u.setAttribute("id",m),u.setAttribute("height","24"),u.setAttribute("viewBox","0 0 24 24"),u.setAttribute("fill","none"),u.style.marginLeft="-6px"}function l(){const u=document.createElement("span");return u.style.cursor="pointer",u.style.marginLeft="16px",u.style.fontSize="24px",u.innerHTML=" &times;",u.onclick=()=>{Ds=!0,i()},u}function h(u,m){u.setAttribute("id",m),u.innerText="Learn more",u.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",u.setAttribute("target","__blank"),u.style.paddingLeft="5px",u.style.textDecoration="underline"}function d(){const u=Ei(n),m=t("text"),p=document.getElementById(m)||document.createElement("span"),v=t("learnmore"),S=document.getElementById(v)||document.createElement("a"),A=t("preprendIcon"),F=document.getElementById(A)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(u.created){const $=u.element;a($),h(S,v);const G=l();c(F,A),$.append(F,p,S,G),document.body.appendChild($)}o?(p.innerText="Preview backend disconnected.",F.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(F.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,p.innerText="Preview backend running in this workspace."),p.setAttribute("id",m)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",d):d()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mi(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Pr(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Mi())}function wi(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ii(){return Sr.NODE_ADMIN===!0}function Si(){try{return typeof indexedDB=="object"}catch{return!1}}function Ti(){return new Promise((s,e)=>{try{let t=!0;const n="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(n);r.onsuccess=()=>{r.result.close(),t||self.indexedDB.deleteDatabase(n),s(!0)},r.onupgradeneeded=()=>{t=!1},r.onerror=()=>{var o;e(((o=r.error)==null?void 0:o.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ai="FirebaseError";class Ct extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name=Ai,Object.setPrototypeOf(this,Ct.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,kr.prototype.create)}}class kr{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},r=`${this.service}/${e}`,o=this.errors[e],i=o?Ri(o,n):"Error",a=`${this.serviceName}: ${i} (${r}).`;return new Ct(r,a,n)}}function Ri(s,e){return s.replace(Di,(t,n)=>{const r=e[n];return r!=null?String(r):`<${n}?>`})}const Di=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lt(s){return JSON.parse(s)}function O(s){return JSON.stringify(s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr=function(s){let e={},t={},n={},r="";try{const o=s.split(".");e=lt(In(o[0])||""),t=lt(In(o[1])||""),r=o[2],n=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:n,signature:r}},Ni=function(s){const e=xr(s),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},Pi=function(s){const e=xr(s).claims;return typeof e=="object"&&e.admin===!0};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ce(s,e){return Object.prototype.hasOwnProperty.call(s,e)}function $e(s,e){if(Object.prototype.hasOwnProperty.call(s,e))return s[e]}function Ns(s){for(const e in s)if(Object.prototype.hasOwnProperty.call(s,e))return!1;return!0}function Ot(s,e,t){const n={};for(const r in s)Object.prototype.hasOwnProperty.call(s,r)&&(n[r]=e.call(t,s[r],r,s));return n}function Lt(s,e){if(s===e)return!0;const t=Object.keys(s),n=Object.keys(e);for(const r of t){if(!n.includes(r))return!1;const o=s[r],i=e[r];if(Ps(o)&&Ps(i)){if(!Lt(o,i))return!1}else if(o!==i)return!1}for(const r of n)if(!t.includes(r))return!1;return!0}function Ps(s){return s!==null&&typeof s=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ki(s){const e=[];for(const[t,n]of Object.entries(s))Array.isArray(n)?n.forEach(r=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(n));return e.length?"&"+e.join("&"):""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xi{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const n=this.W_;if(typeof e=="string")for(let d=0;d<16;d++)n[d]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let d=0;d<16;d++)n[d]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let d=16;d<80;d++){const u=n[d-3]^n[d-8]^n[d-14]^n[d-16];n[d]=(u<<1|u>>>31)&4294967295}let r=this.chain_[0],o=this.chain_[1],i=this.chain_[2],a=this.chain_[3],c=this.chain_[4],l,h;for(let d=0;d<80;d++){d<40?d<20?(l=a^o&(i^a),h=1518500249):(l=o^i^a,h=1859775393):d<60?(l=o&i|a&(o|i),h=2400959708):(l=o^i^a,h=3395469782);const u=(r<<5|r>>>27)+l+c+h+n[d]&4294967295;c=a,a=i,i=(o<<30|o>>>2)&4294967295,o=r,r=u}this.chain_[0]=this.chain_[0]+r&4294967295,this.chain_[1]=this.chain_[1]+o&4294967295,this.chain_[2]=this.chain_[2]+i&4294967295,this.chain_[3]=this.chain_[3]+a&4294967295,this.chain_[4]=this.chain_[4]+c&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const n=t-this.blockSize;let r=0;const o=this.buf_;let i=this.inbuf_;for(;r<t;){if(i===0)for(;r<=n;)this.compress_(e,r),r+=this.blockSize;if(typeof e=="string"){for(;r<t;)if(o[i]=e.charCodeAt(r),++i,++r,i===this.blockSize){this.compress_(o),i=0;break}}else for(;r<t;)if(o[i]=e[r],++i,++r,i===this.blockSize){this.compress_(o),i=0;break}}this.inbuf_=i,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let r=this.blockSize-1;r>=56;r--)this.buf_[r]=t&255,t/=256;this.compress_(this.buf_);let n=0;for(let r=0;r<5;r++)for(let o=24;o>=0;o-=8)e[n]=this.chain_[r]>>o&255,++n;return e}}function Qn(s,e){return`${s} failed: ${e} argument `}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oi=function(s){const e=[];let t=0;for(let n=0;n<s.length;n++){let r=s.charCodeAt(n);if(r>=55296&&r<=56319){const o=r-55296;n++,f(n<s.length,"Surrogate pair missing trail surrogate.");const i=s.charCodeAt(n)-56320;r=65536+(o<<10)+i}r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):r<65536?(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},tn=function(s){let e=0;for(let t=0;t<s.length;t++){const n=s.charCodeAt(t);n<128?e++:n<2048?e+=2:n>=55296&&n<=56319?(e+=4,t++):e+=3}return e};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ge(s){return s&&s._delegate?s._delegate:s}class dt{constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _e="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Li{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const n=new en;if(this.instancesDeferred.set(t,n),this.isInitialized(t)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:t});r&&n.resolve(r)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),n=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(r){if(n)return null;throw r}else{if(n)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Vi(e))try{this.getOrInitializeService({instanceIdentifier:_e})}catch{}for(const[t,n]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const o=this.getOrInitializeService({instanceIdentifier:r});n.resolve(o)}catch{}}}}clearInstance(e=_e){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=_e){return this.instances.has(e)}getOptions(e=_e){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[o,i]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(o);n===a&&i.resolve(r)}return r}onInit(e,t){const n=this.normalizeInstanceIdentifier(t),r=this.onInitCallbacks.get(n)??new Set;r.add(e),this.onInitCallbacks.set(n,r);const o=this.instances.get(n);return o&&e(o,n),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const r of n)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:Fi(e),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch{}return n||null}normalizeInstanceIdentifier(e=_e){return this.component?this.component.multipleInstances?e:_e:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Fi(s){return s===_e?void 0:s}function Vi(s){return s.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bi{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Li(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var D;(function(s){s[s.DEBUG=0]="DEBUG",s[s.VERBOSE=1]="VERBOSE",s[s.INFO=2]="INFO",s[s.WARN=3]="WARN",s[s.ERROR=4]="ERROR",s[s.SILENT=5]="SILENT"})(D||(D={}));const Ui={debug:D.DEBUG,verbose:D.VERBOSE,info:D.INFO,warn:D.WARN,error:D.ERROR,silent:D.SILENT},$i=D.INFO,zi={[D.DEBUG]:"log",[D.VERBOSE]:"log",[D.INFO]:"info",[D.WARN]:"warn",[D.ERROR]:"error"},qi=(s,e,...t)=>{if(e<s.logLevel)return;const n=new Date().toISOString(),r=zi[e];if(r)console[r](`[${n}]  ${s.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Or{constructor(e){this.name=e,this._logLevel=$i,this._logHandler=qi,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in D))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Ui[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,D.DEBUG,...e),this._logHandler(this,D.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,D.VERBOSE,...e),this._logHandler(this,D.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,D.INFO,...e),this._logHandler(this,D.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,D.WARN,...e),this._logHandler(this,D.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,D.ERROR,...e),this._logHandler(this,D.ERROR,...e)}}const Hi=(s,e)=>e.some(t=>s instanceof t);let ks,xs;function Wi(){return ks||(ks=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ji(){return xs||(xs=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Lr=new WeakMap,Sn=new WeakMap,Fr=new WeakMap,mn=new WeakMap,Yn=new WeakMap;function Gi(s){const e=new Promise((t,n)=>{const r=()=>{s.removeEventListener("success",o),s.removeEventListener("error",i)},o=()=>{t(de(s.result)),r()},i=()=>{n(s.error),r()};s.addEventListener("success",o),s.addEventListener("error",i)});return e.then(t=>{t instanceof IDBCursor&&Lr.set(t,s)}).catch(()=>{}),Yn.set(e,s),e}function Qi(s){if(Sn.has(s))return;const e=new Promise((t,n)=>{const r=()=>{s.removeEventListener("complete",o),s.removeEventListener("error",i),s.removeEventListener("abort",i)},o=()=>{t(),r()},i=()=>{n(s.error||new DOMException("AbortError","AbortError")),r()};s.addEventListener("complete",o),s.addEventListener("error",i),s.addEventListener("abort",i)});Sn.set(s,e)}let Tn={get(s,e,t){if(s instanceof IDBTransaction){if(e==="done")return Sn.get(s);if(e==="objectStoreNames")return s.objectStoreNames||Fr.get(s);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return de(s[e])},set(s,e,t){return s[e]=t,!0},has(s,e){return s instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in s}};function Yi(s){Tn=s(Tn)}function Ki(s){return s===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const n=s.call(fn(this),e,...t);return Fr.set(n,e.sort?e.sort():[e]),de(n)}:ji().includes(s)?function(...e){return s.apply(fn(this),e),de(Lr.get(this))}:function(...e){return de(s.apply(fn(this),e))}}function Ji(s){return typeof s=="function"?Ki(s):(s instanceof IDBTransaction&&Qi(s),Hi(s,Wi())?new Proxy(s,Tn):s)}function de(s){if(s instanceof IDBRequest)return Gi(s);if(mn.has(s))return mn.get(s);const e=Ji(s);return e!==s&&(mn.set(s,e),Yn.set(e,s)),e}const fn=s=>Yn.get(s);function Xi(s,e,{blocked:t,upgrade:n,blocking:r,terminated:o}={}){const i=indexedDB.open(s,e),a=de(i);return n&&i.addEventListener("upgradeneeded",c=>{n(de(i.result),c.oldVersion,c.newVersion,de(i.transaction),c)}),t&&i.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),a.then(c=>{o&&c.addEventListener("close",()=>o()),r&&c.addEventListener("versionchange",l=>r(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}const Zi=["get","getKey","getAll","getAllKeys","count"],ea=["put","add","delete","clear"],gn=new Map;function Os(s,e){if(!(s instanceof IDBDatabase&&!(e in s)&&typeof e=="string"))return;if(gn.get(e))return gn.get(e);const t=e.replace(/FromIndex$/,""),n=e!==t,r=ea.includes(t);if(!(t in(n?IDBIndex:IDBObjectStore).prototype)||!(r||Zi.includes(t)))return;const o=async function(i,...a){const c=this.transaction(i,r?"readwrite":"readonly");let l=c.store;return n&&(l=l.index(a.shift())),(await Promise.all([l[t](...a),r&&c.done]))[0]};return gn.set(e,o),o}Yi(s=>({...s,get:(e,t,n)=>Os(e,t)||s.get(e,t,n),has:(e,t)=>!!Os(e,t)||s.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ta{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(na(t)){const n=t.getImmediate();return`${n.library}/${n.version}`}else return null}).filter(t=>t).join(" ")}}function na(s){const e=s.getComponent();return(e==null?void 0:e.type)==="VERSION"}const An="@firebase/app",Ls="0.14.4";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ie=new Or("@firebase/app"),sa="@firebase/app-compat",ra="@firebase/analytics-compat",oa="@firebase/analytics",ia="@firebase/app-check-compat",aa="@firebase/app-check",ca="@firebase/auth",la="@firebase/auth-compat",da="@firebase/database",ua="@firebase/data-connect",ha="@firebase/database-compat",ma="@firebase/functions",fa="@firebase/functions-compat",ga="@firebase/installations",pa="@firebase/installations-compat",_a="@firebase/messaging",va="@firebase/messaging-compat",ya="@firebase/performance",ba="@firebase/performance-compat",Ea="@firebase/remote-config",Ca="@firebase/remote-config-compat",Ma="@firebase/storage",wa="@firebase/storage-compat",Ia="@firebase/firestore",Sa="@firebase/ai",Ta="@firebase/firestore-compat",Aa="firebase",Ra="12.4.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rn="[DEFAULT]",Da={[An]:"fire-core",[sa]:"fire-core-compat",[oa]:"fire-analytics",[ra]:"fire-analytics-compat",[aa]:"fire-app-check",[ia]:"fire-app-check-compat",[ca]:"fire-auth",[la]:"fire-auth-compat",[da]:"fire-rtdb",[ua]:"fire-data-connect",[ha]:"fire-rtdb-compat",[ma]:"fire-fn",[fa]:"fire-fn-compat",[ga]:"fire-iid",[pa]:"fire-iid-compat",[_a]:"fire-fcm",[va]:"fire-fcm-compat",[ya]:"fire-perf",[ba]:"fire-perf-compat",[Ea]:"fire-rc",[Ca]:"fire-rc-compat",[Ma]:"fire-gcs",[wa]:"fire-gcs-compat",[Ia]:"fire-fst",[Ta]:"fire-fst-compat",[Sa]:"fire-vertex","fire-js":"fire-js",[Aa]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ft=new Map,Na=new Map,Dn=new Map;function Fs(s,e){try{s.container.addComponent(e)}catch(t){ie.debug(`Component ${e.name} failed to register with FirebaseApp ${s.name}`,t)}}function Vt(s){const e=s.name;if(Dn.has(e))return ie.debug(`There were multiple attempts to register component ${e}.`),!1;Dn.set(e,s);for(const t of Ft.values())Fs(t,s);for(const t of Na.values())Fs(t,s);return!0}function Pa(s,e){const t=s.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),s.container.getProvider(e)}function ka(s){return s==null?!1:s.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xa={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ue=new kr("app","Firebase",xa);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oa{constructor(e,t,n){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new dt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw ue.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const La=Ra;function Vr(s,e={}){let t=s;typeof e!="object"&&(e={name:e});const n={name:Rn,automaticDataCollectionEnabled:!0,...e},r=n.name;if(typeof r!="string"||!r)throw ue.create("bad-app-name",{appName:String(r)});if(t||(t=Nr()),!t)throw ue.create("no-options");const o=Ft.get(r);if(o){if(Lt(t,o.options)&&Lt(n,o.config))return o;throw ue.create("duplicate-app",{appName:r})}const i=new Bi(r);for(const c of Dn.values())i.addComponent(c);const a=new Oa(t,n,i);return Ft.set(r,a),a}function Fa(s=Rn){const e=Ft.get(s);if(!e&&s===Rn&&Nr())return Vr();if(!e)throw ue.create("no-app",{appName:s});return e}function Ve(s,e,t){let n=Da[s]??s;t&&(n+=`-${t}`);const r=n.match(/\s|\//),o=e.match(/\s|\//);if(r||o){const i=[`Unable to register library "${n}" with version "${e}":`];r&&i.push(`library name "${n}" contains illegal characters (whitespace or "/")`),r&&o&&i.push("and"),o&&i.push(`version name "${e}" contains illegal characters (whitespace or "/")`),ie.warn(i.join(" "));return}Vt(new dt(`${n}-version`,()=>({library:n,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Va="firebase-heartbeat-database",Ba=1,ut="firebase-heartbeat-store";let pn=null;function Br(){return pn||(pn=Xi(Va,Ba,{upgrade:(s,e)=>{switch(e){case 0:try{s.createObjectStore(ut)}catch(t){console.warn(t)}}}}).catch(s=>{throw ue.create("idb-open",{originalErrorMessage:s.message})})),pn}async function Ua(s){try{const t=(await Br()).transaction(ut),n=await t.objectStore(ut).get(Ur(s));return await t.done,n}catch(e){if(e instanceof Ct)ie.warn(e.message);else{const t=ue.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});ie.warn(t.message)}}}async function Vs(s,e){try{const n=(await Br()).transaction(ut,"readwrite");await n.objectStore(ut).put(e,Ur(s)),await n.done}catch(t){if(t instanceof Ct)ie.warn(t.message);else{const n=ue.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});ie.warn(n.message)}}}function Ur(s){return`${s.name}!${s.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $a=1024,za=30;class qa{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Wa(t),this._heartbeatsCachePromise=this._storage.read().then(n=>(this._heartbeatsCache=n,n))}async triggerHeartbeat(){var e,t;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=Bs();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(i=>i.date===o))return;if(this._heartbeatsCache.heartbeats.push({date:o,agent:r}),this._heartbeatsCache.heartbeats.length>za){const i=ja(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(i,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(n){ie.warn(n)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Bs(),{heartbeatsToSend:n,unsentEntries:r}=Ha(this._heartbeatsCache.heartbeats),o=xt(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(t){return ie.warn(t),""}}}function Bs(){return new Date().toISOString().substring(0,10)}function Ha(s,e=$a){const t=[];let n=s.slice();for(const r of s){const o=t.find(i=>i.agent===r.agent);if(o){if(o.dates.push(r.date),Us(t)>e){o.dates.pop();break}}else if(t.push({agent:r.agent,dates:[r.date]}),Us(t)>e){t.pop();break}n=n.slice(1)}return{heartbeatsToSend:t,unsentEntries:n}}class Wa{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Si()?Ti().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Ua(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Vs(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const n=await this.read();return Vs(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}else return}}function Us(s){return xt(JSON.stringify({version:2,heartbeats:s})).length}function ja(s){if(s.length===0)return-1;let e=0,t=s[0].date;for(let n=1;n<s.length;n++)s[n].date<t&&(t=s[n].date,e=n);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ga(s){Vt(new dt("platform-logger",e=>new ta(e),"PRIVATE")),Vt(new dt("heartbeat",e=>new qa(e),"PRIVATE")),Ve(An,Ls,s),Ve(An,Ls,"esm2020"),Ve("fire-js","")}Ga("");var Qa="firebase",Ya="12.4.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Ve(Qa,Ya,"app");var $s={};const zs="@firebase/database",qs="1.1.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let $r="";function Ka(s){$r=s}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ja{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),O(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:lt(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xa{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return ce(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zr=function(s){try{if(typeof window<"u"&&typeof window[s]<"u"){const e=window[s];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new Ja(e)}}catch{}return new Xa},Te=zr("localStorage"),Za=zr("sessionStorage");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Be=new Or("@firebase/database"),ec=function(){let s=1;return function(){return s++}}(),qr=function(s){const e=Oi(s),t=new xi;t.update(e);const n=t.digest();return jn.encodeByteArray(n)},Mt=function(...s){let e="";for(let t=0;t<s.length;t++){const n=s[t];Array.isArray(n)||n&&typeof n=="object"&&typeof n.length=="number"?e+=Mt.apply(null,n):typeof n=="object"?e+=O(n):e+=n,e+=" "}return e};let rt=null,Hs=!0;const tc=function(s,e){f(!0,"Can't turn on custom loggers persistently."),Be.logLevel=D.VERBOSE,rt=Be.log.bind(Be)},z=function(...s){if(Hs===!0&&(Hs=!1,rt===null&&Za.get("logging_enabled")===!0&&tc()),rt){const e=Mt.apply(null,s);rt(e)}},wt=function(s){return function(...e){z(s,...e)}},Nn=function(...s){const e="FIREBASE INTERNAL ERROR: "+Mt(...s);Be.error(e)},ae=function(...s){const e=`FIREBASE FATAL ERROR: ${Mt(...s)}`;throw Be.error(e),new Error(e)},W=function(...s){const e="FIREBASE WARNING: "+Mt(...s);Be.warn(e)},nc=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&W("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},Hr=function(s){return typeof s=="number"&&(s!==s||s===Number.POSITIVE_INFINITY||s===Number.NEGATIVE_INFINITY)},sc=function(s){if(document.readyState==="complete")s();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,s())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},ze="[MIN_NAME]",De="[MAX_NAME]",Qe=function(s,e){if(s===e)return 0;if(s===ze||e===De)return-1;if(e===ze||s===De)return 1;{const t=Ws(s),n=Ws(e);return t!==null?n!==null?t-n===0?s.length-e.length:t-n:-1:n!==null?1:s<e?-1:1}},rc=function(s,e){return s===e?0:s<e?-1:1},Je=function(s,e){if(e&&s in e)return e[s];throw new Error("Missing required key ("+s+") in object: "+O(e))},Kn=function(s){if(typeof s!="object"||s===null)return O(s);const e=[];for(const n in s)e.push(n);e.sort();let t="{";for(let n=0;n<e.length;n++)n!==0&&(t+=","),t+=O(e[n]),t+=":",t+=Kn(s[e[n]]);return t+="}",t},Wr=function(s,e){const t=s.length;if(t<=e)return[s];const n=[];for(let r=0;r<t;r+=e)r+e>t?n.push(s.substring(r,t)):n.push(s.substring(r,r+e));return n};function j(s,e){for(const t in s)s.hasOwnProperty(t)&&e(t,s[t])}const jr=function(s){f(!Hr(s),"Invalid JSON number");const e=11,t=52,n=(1<<e-1)-1;let r,o,i,a,c;s===0?(o=0,i=0,r=1/s===-1/0?1:0):(r=s<0,s=Math.abs(s),s>=Math.pow(2,1-n)?(a=Math.min(Math.floor(Math.log(s)/Math.LN2),n),o=a+n,i=Math.round(s*Math.pow(2,t-a)-Math.pow(2,t))):(o=0,i=Math.round(s/Math.pow(2,1-n-t))));const l=[];for(c=t;c;c-=1)l.push(i%2?1:0),i=Math.floor(i/2);for(c=e;c;c-=1)l.push(o%2?1:0),o=Math.floor(o/2);l.push(r?1:0),l.reverse();const h=l.join("");let d="";for(c=0;c<64;c+=8){let u=parseInt(h.substr(c,8),2).toString(16);u.length===1&&(u="0"+u),d=d+u}return d.toLowerCase()},oc=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},ic=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function ac(s,e){let t="Unknown Error";s==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":s==="permission_denied"?t="Client doesn't have permission to access the desired data.":s==="unavailable"&&(t="The service is unavailable");const n=new Error(s+" at "+e._path.toString()+": "+t);return n.code=s.toUpperCase(),n}const cc=new RegExp("^-?(0*)\\d{1,10}$"),lc=-2147483648,dc=2147483647,Ws=function(s){if(cc.test(s)){const e=Number(s);if(e>=lc&&e<=dc)return e}return null},Ye=function(s){try{s()}catch(e){setTimeout(()=>{const t=e.stack||"";throw W("Exception was thrown by user callback.",t),e},Math.floor(0))}},uc=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},ot=function(s,e){const t=setTimeout(s,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,ka(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(n=>this.appCheck=n)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,n)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,n):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)==null||t.get().then(n=>n.addTokenListener(e))}notifyForInvalidToken(){W(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mc{constructor(e,t,n){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=n,this.auth_=null,this.auth_=n.getImmediate({optional:!0}),this.auth_||n.onInit(r=>this.auth_=r)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(z("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,n)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,n):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',W(e)}}class Pt{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}Pt.OWNER="owner";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jn="5",Gr="v",Qr="s",Yr="r",Kr="f",Jr=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,Xr="ls",Zr="p",Pn="ac",eo="websocket",to="long_polling";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class no{constructor(e,t,n,r,o=!1,i="",a=!1,c=!1,l=null){this.secure=t,this.namespace=n,this.webSocketOnly=r,this.nodeAdmin=o,this.persistenceKey=i,this.includeNamespaceInQueryParams=a,this.isUsingEmulator=c,this.emulatorOptions=l,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=Te.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&Te.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function fc(s){return s.host!==s.internalHost||s.isCustomHost()||s.includeNamespaceInQueryParams}function so(s,e,t){f(typeof e=="string","typeof type must == string"),f(typeof t=="object","typeof params must == object");let n;if(e===eo)n=(s.secure?"wss://":"ws://")+s.internalHost+"/.ws?";else if(e===to)n=(s.secure?"https://":"http://")+s.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);fc(s)&&(t.ns=s.namespace);const r=[];return j(t,(o,i)=>{r.push(o+"="+i)}),n+r.join("&")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gc{constructor(){this.counters_={}}incrementCounter(e,t=1){ce(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return di(this.counters_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _n={},vn={};function Xn(s){const e=s.toString();return _n[e]||(_n[e]=new gc),_n[e]}function pc(s,e){const t=s.toString();return vn[t]||(vn[t]=e()),vn[t]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _c{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const n=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let r=0;r<n.length;++r)n[r]&&Ye(()=>{this.onMessage_(n[r])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const js="start",vc="close",yc="pLPCommand",bc="pRTLPCB",ro="id",oo="pw",io="ser",Ec="cb",Cc="seg",Mc="ts",wc="d",Ic="dframe",ao=1870,co=30,Sc=ao-co,Tc=25e3,Ac=3e4;class Le{constructor(e,t,n,r,o,i,a){this.connId=e,this.repoInfo=t,this.applicationId=n,this.appCheckToken=r,this.authToken=o,this.transportSessionId=i,this.lastSessionId=a,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=wt(e),this.stats_=Xn(t),this.urlFn=c=>(this.appCheckToken&&(c[Pn]=this.appCheckToken),so(t,to,c))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new _c(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(Ac)),sc(()=>{if(this.isClosed_)return;this.scriptTagHolder=new Zn((...o)=>{const[i,a,c,l,h]=o;if(this.incrementIncomingBytes_(o),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,i===js)this.id=a,this.password=c;else if(i===vc)a?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(a,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+i)},(...o)=>{const[i,a]=o;this.incrementIncomingBytes_(o),this.myPacketOrderer.handleResponse(i,a)},()=>{this.onClosed_()},this.urlFn);const n={};n[js]="t",n[io]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(n[Ec]=this.scriptTagHolder.uniqueCallbackIdentifier),n[Gr]=Jn,this.transportSessionId&&(n[Qr]=this.transportSessionId),this.lastSessionId&&(n[Xr]=this.lastSessionId),this.applicationId&&(n[Zr]=this.applicationId),this.appCheckToken&&(n[Pn]=this.appCheckToken),typeof location<"u"&&location.hostname&&Jr.test(location.hostname)&&(n[Yr]=Kr);const r=this.urlFn(n);this.log_("Connecting via long-poll to "+r),this.scriptTagHolder.addTag(r,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){Le.forceAllow_=!0}static forceDisallow(){Le.forceDisallow_=!0}static isAvailable(){return Le.forceAllow_?!0:!Le.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!oc()&&!ic()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=O(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const n=Ar(t),r=Wr(n,Sc);for(let o=0;o<r.length;o++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,r.length,r[o]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const n={};n[Ic]="t",n[ro]=e,n[oo]=t,this.myDisconnFrame.src=this.urlFn(n),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=O(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class Zn{constructor(e,t,n,r){this.onDisconnect=n,this.urlFn=r,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=ec(),window[yc+this.uniqueCallbackIdentifier]=e,window[bc+this.uniqueCallbackIdentifier]=t,this.myIFrame=Zn.createIFrame_();let o="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(o='<script>document.domain="'+document.domain+'";<\/script>');const i="<html><body>"+o+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(i),this.myIFrame.doc.close()}catch(a){z("frame writing exception"),a.stack&&z(a.stack),z(a)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||z("No IE domain setting required")}catch{const n=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+n+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[ro]=this.myID,e[oo]=this.myPW,e[io]=this.currentSerial;let t=this.urlFn(e),n="",r=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+co+n.length<=ao;){const i=this.pendingSegs.shift();n=n+"&"+Cc+r+"="+i.seg+"&"+Mc+r+"="+i.ts+"&"+wc+r+"="+i.d,r++}return t=t+n,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,n){this.pendingSegs.push({seg:e,ts:t,d:n}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const n=()=>{this.outstandingRequests.delete(t),this.newRequest_()},r=setTimeout(n,Math.floor(Tc)),o=()=>{clearTimeout(r),n()};this.addTag(e,o)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const n=this.myIFrame.doc.createElement("script");n.type="text/javascript",n.async=!0,n.src=e,n.onload=n.onreadystatechange=function(){const r=n.readyState;(!r||r==="loaded"||r==="complete")&&(n.onload=n.onreadystatechange=null,n.parentNode&&n.parentNode.removeChild(n),t())},n.onerror=()=>{z("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(n)}catch{}},Math.floor(1))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rc=16384,Dc=45e3;let Bt=null;typeof MozWebSocket<"u"?Bt=MozWebSocket:typeof WebSocket<"u"&&(Bt=WebSocket);class J{constructor(e,t,n,r,o,i,a){this.connId=e,this.applicationId=n,this.appCheckToken=r,this.authToken=o,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=wt(this.connId),this.stats_=Xn(t),this.connURL=J.connectionURL_(t,i,a,r,n),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,n,r,o){const i={};return i[Gr]=Jn,typeof location<"u"&&location.hostname&&Jr.test(location.hostname)&&(i[Yr]=Kr),t&&(i[Qr]=t),n&&(i[Xr]=n),r&&(i[Pn]=r),o&&(i[Zr]=o),so(e,eo,i)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,Te.set("previous_websocket_failure",!0);try{let n;Ii(),this.mySock=new Bt(this.connURL,[],n)}catch(n){this.log_("Error instantiating WebSocket.");const r=n.message||n.data;r&&this.log_(r),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=n=>{this.handleIncomingFrame(n)},this.mySock.onerror=n=>{this.log_("WebSocket error.  Closing connection.");const r=n.message||n.data;r&&this.log_(r),this.onClosed_()}}start(){}static forceDisallow(){J.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,n=navigator.userAgent.match(t);n&&n.length>1&&parseFloat(n[1])<4.4&&(e=!0)}return!e&&Bt!==null&&!J.forceDisallow_}static previouslyFailed(){return Te.isInMemoryStorage||Te.get("previous_websocket_failure")===!0}markConnectionHealthy(){Te.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const n=lt(t);this.onMessage(n)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(f(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const n=this.extractFrameCount_(t);n!==null&&this.appendFrame_(n)}}send(e){this.resetKeepAlive();const t=O(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const n=Wr(t,Rc);n.length>1&&this.sendString_(String(n.length));for(let r=0;r<n.length;r++)this.sendString_(n[r])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(Dc))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}J.responsesRequiredToBeHealthy=2;J.healthyTimeout=3e4;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ht{static get ALL_TRANSPORTS(){return[Le,J]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=J&&J.isAvailable();let n=t&&!J.previouslyFailed();if(e.webSocketOnly&&(t||W("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),n=!0),n)this.transports_=[J];else{const r=this.transports_=[];for(const o of ht.ALL_TRANSPORTS)o&&o.isAvailable()&&r.push(o);ht.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}ht.globalTransportInitialized_=!1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nc=6e4,Pc=5e3,kc=10*1024,xc=100*1024,yn="t",Gs="d",Oc="s",Qs="r",Lc="e",Ys="o",Ks="a",Js="n",Xs="p",Fc="h";class Vc{constructor(e,t,n,r,o,i,a,c,l,h){this.id=e,this.repoInfo_=t,this.applicationId_=n,this.appCheckToken_=r,this.authToken_=o,this.onMessage_=i,this.onReady_=a,this.onDisconnect_=c,this.onKill_=l,this.lastSessionId=h,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=wt("c:"+this.id+":"),this.transportManager_=new ht(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),n=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,n)},Math.floor(0));const r=e.healthyTimeout||0;r>0&&(this.healthyTimeout_=ot(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>xc?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>kc?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(r)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(yn in e){const t=e[yn];t===Ks?this.upgradeIfSecondaryHealthy_():t===Qs?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===Ys&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=Je("t",e),n=Je("d",e);if(t==="c")this.onSecondaryControl_(n);else if(t==="d")this.pendingDataMessages.push(n);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:Xs,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:Ks,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Js,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=Je("t",e),n=Je("d",e);t==="c"?this.onControl_(n):t==="d"&&this.onDataMessage_(n)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=Je(yn,e);if(Gs in e){const n=e[Gs];if(t===Fc){const r={...n};this.repoInfo_.isUsingEmulator&&(r.h=this.repoInfo_.host),this.onHandshake_(r)}else if(t===Js){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let r=0;r<this.pendingDataMessages.length;++r)this.onDataMessage_(this.pendingDataMessages[r]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===Oc?this.onConnectionShutdown_(n):t===Qs?this.onReset_(n):t===Lc?Nn("Server Error: "+n):t===Ys?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):Nn("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,n=e.v,r=e.h;this.sessionId=e.s,this.repoInfo_.host=r,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),Jn!==n&&W("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),n=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,n),ot(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(Nc))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):ot(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(Pc))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:Xs,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(Te.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lo{put(e,t,n,r){}merge(e,t,n,r){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,n){}onDisconnectMerge(e,t,n){}onDisconnectCancel(e,t){}reportStats(e){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uo{constructor(e){this.allowedEvents_=e,this.listeners_={},f(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const n=[...this.listeners_[e]];for(let r=0;r<n.length;r++)n[r].callback.apply(n[r].context,t)}}on(e,t,n){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:n});const r=this.getInitialEvent(e);r&&t.apply(n,r)}off(e,t,n){this.validateEventType_(e);const r=this.listeners_[e]||[];for(let o=0;o<r.length;o++)if(r[o].callback===t&&(!n||n===r[o].context)){r.splice(o,1);return}}validateEventType_(e){f(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ut extends uo{static getInstance(){return new Ut}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!Pr()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return f(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zs=32,er=768;class R{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let n=0;for(let r=0;r<this.pieces_.length;r++)this.pieces_[r].length>0&&(this.pieces_[n]=this.pieces_[r],n++);this.pieces_.length=n,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function T(){return new R("")}function M(s){return s.pieceNum_>=s.pieces_.length?null:s.pieces_[s.pieceNum_]}function fe(s){return s.pieces_.length-s.pieceNum_}function N(s){let e=s.pieceNum_;return e<s.pieces_.length&&e++,new R(s.pieces_,e)}function ho(s){return s.pieceNum_<s.pieces_.length?s.pieces_[s.pieces_.length-1]:null}function Bc(s){let e="";for(let t=s.pieceNum_;t<s.pieces_.length;t++)s.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(s.pieces_[t])));return e||"/"}function mo(s,e=0){return s.pieces_.slice(s.pieceNum_+e)}function fo(s){if(s.pieceNum_>=s.pieces_.length)return null;const e=[];for(let t=s.pieceNum_;t<s.pieces_.length-1;t++)e.push(s.pieces_[t]);return new R(e,0)}function L(s,e){const t=[];for(let n=s.pieceNum_;n<s.pieces_.length;n++)t.push(s.pieces_[n]);if(e instanceof R)for(let n=e.pieceNum_;n<e.pieces_.length;n++)t.push(e.pieces_[n]);else{const n=e.split("/");for(let r=0;r<n.length;r++)n[r].length>0&&t.push(n[r])}return new R(t,0)}function I(s){return s.pieceNum_>=s.pieces_.length}function q(s,e){const t=M(s),n=M(e);if(t===null)return e;if(t===n)return q(N(s),N(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+s+")")}function es(s,e){if(fe(s)!==fe(e))return!1;for(let t=s.pieceNum_,n=e.pieceNum_;t<=s.pieces_.length;t++,n++)if(s.pieces_[t]!==e.pieces_[n])return!1;return!0}function X(s,e){let t=s.pieceNum_,n=e.pieceNum_;if(fe(s)>fe(e))return!1;for(;t<s.pieces_.length;){if(s.pieces_[t]!==e.pieces_[n])return!1;++t,++n}return!0}class Uc{constructor(e,t){this.errorPrefix_=t,this.parts_=mo(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let n=0;n<this.parts_.length;n++)this.byteLength_+=tn(this.parts_[n]);go(this)}}function $c(s,e){s.parts_.length>0&&(s.byteLength_+=1),s.parts_.push(e),s.byteLength_+=tn(e),go(s)}function zc(s){const e=s.parts_.pop();s.byteLength_-=tn(e),s.parts_.length>0&&(s.byteLength_-=1)}function go(s){if(s.byteLength_>er)throw new Error(s.errorPrefix_+"has a key path longer than "+er+" bytes ("+s.byteLength_+").");if(s.parts_.length>Zs)throw new Error(s.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+Zs+") or object contains a cycle "+ve(s))}function ve(s){return s.parts_.length===0?"":"in property '"+s.parts_.join(".")+"'"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts extends uo{static getInstance(){return new ts}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const n=!document[e];n!==this.visible_&&(this.visible_=n,this.trigger("visible",n))},!1)}getInitialEvent(e){return f(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xe=1e3,qc=60*5*1e3,tr=30*1e3,Hc=1.3,Wc=3e4,jc="server_kill",nr=3;class oe extends lo{constructor(e,t,n,r,o,i,a,c){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=n,this.onConnectStatus_=r,this.onServerInfoUpdate_=o,this.authTokenProvider_=i,this.appCheckTokenProvider_=a,this.authOverride_=c,this.id=oe.nextPersistentConnectionId_++,this.log_=wt("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Xe,this.maxReconnectDelay_=qc,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,c)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");ts.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&Ut.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,n){const r=++this.requestNumber_,o={r,a:e,b:t};this.log_(O(o)),f(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(o),n&&(this.requestCBHash_[r]=n)}get(e){this.initConnection_();const t=new en,r={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:i=>{const a=i.d;i.s==="ok"?t.resolve(a):t.reject(a)}};this.outstandingGets_.push(r),this.outstandingGetCount_++;const o=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(o),t.promise}listen(e,t,n,r){this.initConnection_();const o=e._queryIdentifier,i=e._path.toString();this.log_("Listen called for "+i+" "+o),this.listens.has(i)||this.listens.set(i,new Map),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),f(!this.listens.get(i).has(o),"listen() called twice for same path/queryId.");const a={onComplete:r,hashFn:t,query:e,tag:n};this.listens.get(i).set(o,a),this.connected_&&this.sendListen_(a)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,n=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(n)})}sendListen_(e){const t=e.query,n=t._path.toString(),r=t._queryIdentifier;this.log_("Listen on "+n+" for "+r);const o={p:n},i="q";e.tag&&(o.q=t._queryObject,o.t=e.tag),o.h=e.hashFn(),this.sendRequest(i,o,a=>{const c=a.d,l=a.s;oe.warnOnListenWarnings_(c,t),(this.listens.get(n)&&this.listens.get(n).get(r))===e&&(this.log_("listen response",a),l!=="ok"&&this.removeListen_(n,r),e.onComplete&&e.onComplete(l,c))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&ce(e,"w")){const n=$e(e,"w");if(Array.isArray(n)&&~n.indexOf("no_index")){const r='".indexOn": "'+t._queryParams.getIndex().toString()+'"',o=t._path.toString();W(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${r} at ${o} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||Pi(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=tr)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=Ni(e)?"auth":"gauth",n={cred:e};this.authOverride_===null?n.noauth=!0:typeof this.authOverride_=="object"&&(n.authvar=this.authOverride_),this.sendRequest(t,n,r=>{const o=r.s,i=r.d||"error";this.authToken_===e&&(o==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(o,i))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,n=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,n)})}unlisten(e,t){const n=e._path.toString(),r=e._queryIdentifier;this.log_("Unlisten called for "+n+" "+r),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(n,r)&&this.connected_&&this.sendUnlisten_(n,r,e._queryObject,t)}sendUnlisten_(e,t,n,r){this.log_("Unlisten on "+e+" for "+t);const o={p:e},i="n";r&&(o.q=n,o.t=r),this.sendRequest(i,o)}onDisconnectPut(e,t,n){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,n):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:n})}onDisconnectMerge(e,t,n){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,n):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:n})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,n,r){const o={p:t,d:n};this.log_("onDisconnect "+e,o),this.sendRequest(e,o,i=>{r&&setTimeout(()=>{r(i.s,i.d)},Math.floor(0))})}put(e,t,n,r){this.putInternal("p",e,t,n,r)}merge(e,t,n,r){this.putInternal("m",e,t,n,r)}putInternal(e,t,n,r,o){this.initConnection_();const i={p:t,d:n};o!==void 0&&(i.h=o),this.outstandingPuts_.push({action:e,request:i,onComplete:r}),this.outstandingPutCount_++;const a=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(a):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,n=this.outstandingPuts_[e].request,r=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,n,o=>{this.log_(t+" response",o),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),r&&r(o.s,o.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,n=>{if(n.s!=="ok"){const o=n.d;this.log_("reportStats","Error sending stats: "+o)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+O(e));const t=e.r,n=this.requestCBHash_[t];n&&(delete this.requestCBHash_[t],n(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):Nn("Unrecognized action received from server: "+O(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){f(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Xe,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Xe,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>Wc&&(this.reconnectDelay_=Xe),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*Hc)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),n=this.onRealtimeDisconnect_.bind(this),r=this.id+":"+oe.nextConnectionId_++,o=this.lastSessionId;let i=!1,a=null;const c=function(){a?a.close():(i=!0,n())},l=function(d){f(a,"sendRequest call when we're not connected not allowed."),a.sendRequest(d)};this.realtime_={close:c,sendRequest:l};const h=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[d,u]=await Promise.all([this.authTokenProvider_.getToken(h),this.appCheckTokenProvider_.getToken(h)]);i?z("getToken() completed but was canceled"):(z("getToken() completed. Creating connection."),this.authToken_=d&&d.accessToken,this.appCheckToken_=u&&u.token,a=new Vc(r,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,n,m=>{W(m+" ("+this.repoInfo_.toString()+")"),this.interrupt(jc)},o))}catch(d){this.log_("Failed to get token: "+d),i||(this.repoInfo_.nodeAdmin&&W(d),c())}}}interrupt(e){z("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){z("Resuming connection for reason: "+e),delete this.interruptReasons_[e],Ns(this.interruptReasons_)&&(this.reconnectDelay_=Xe,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let n;t?n=t.map(o=>Kn(o)).join("$"):n="default";const r=this.removeListen_(e,n);r&&r.onComplete&&r.onComplete("permission_denied")}removeListen_(e,t){const n=new R(e).toString();let r;if(this.listens.has(n)){const o=this.listens.get(n);r=o.get(t),o.delete(t),o.size===0&&this.listens.delete(n)}else r=void 0;return r}onAuthRevoked_(e,t){z("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=nr&&(this.reconnectDelay_=tr,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){z("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=nr&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+$r.replace(/\./g,"-")]=1,Pr()?e["framework.cordova"]=1:wi()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=Ut.getInstance().currentlyOnline();return Ns(this.interruptReasons_)&&e}}oe.nextPersistentConnectionId_=0;oe.nextConnectionId_=0;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class w{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new w(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nn{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const n=new w(ze,e),r=new w(ze,t);return this.compare(n,r)!==0}minPost(){return w.MIN}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Rt;class po extends nn{static get __EMPTY_NODE(){return Rt}static set __EMPTY_NODE(e){Rt=e}compare(e,t){return Qe(e.name,t.name)}isDefinedOn(e){throw je("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return w.MIN}maxPost(){return new w(De,Rt)}makePost(e,t){return f(typeof e=="string","KeyIndex indexValue must always be a string."),new w(e,Rt)}toString(){return".key"}}const Ue=new po;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dt{constructor(e,t,n,r,o=null){this.isReverse_=r,this.resultGenerator_=o,this.nodeStack_=[];let i=1;for(;!e.isEmpty();)if(e=e,i=t?n(e.key,t):1,r&&(i*=-1),i<0)this.isReverse_?e=e.left:e=e.right;else if(i===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class B{constructor(e,t,n,r,o){this.key=e,this.value=t,this.color=n??B.RED,this.left=r??H.EMPTY_NODE,this.right=o??H.EMPTY_NODE}copy(e,t,n,r,o){return new B(e??this.key,t??this.value,n??this.color,r??this.left,o??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let r=this;const o=n(e,r.key);return o<0?r=r.copy(null,null,null,r.left.insert(e,t,n),null):o===0?r=r.copy(null,t,null,null,null):r=r.copy(null,null,null,null,r.right.insert(e,t,n)),r.fixUp_()}removeMin_(){if(this.left.isEmpty())return H.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let n,r;if(n=this,t(e,n.key)<0)!n.left.isEmpty()&&!n.left.isRed_()&&!n.left.left.isRed_()&&(n=n.moveRedLeft_()),n=n.copy(null,null,null,n.left.remove(e,t),null);else{if(n.left.isRed_()&&(n=n.rotateRight_()),!n.right.isEmpty()&&!n.right.isRed_()&&!n.right.left.isRed_()&&(n=n.moveRedRight_()),t(e,n.key)===0){if(n.right.isEmpty())return H.EMPTY_NODE;r=n.right.min_(),n=n.copy(r.key,r.value,null,null,n.right.removeMin_())}n=n.copy(null,null,null,null,n.right.remove(e,t))}return n.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,B.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,B.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}B.RED=!0;B.BLACK=!1;class Gc{copy(e,t,n,r,o){return this}insert(e,t,n){return new B(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class H{constructor(e,t=H.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new H(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,B.BLACK,null,null))}remove(e){return new H(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,B.BLACK,null,null))}get(e){let t,n=this.root_;for(;!n.isEmpty();){if(t=this.comparator_(e,n.key),t===0)return n.value;t<0?n=n.left:t>0&&(n=n.right)}return null}getPredecessorKey(e){let t,n=this.root_,r=null;for(;!n.isEmpty();)if(t=this.comparator_(e,n.key),t===0){if(n.left.isEmpty())return r?r.key:null;for(n=n.left;!n.right.isEmpty();)n=n.right;return n.key}else t<0?n=n.left:t>0&&(r=n,n=n.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new Dt(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new Dt(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new Dt(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new Dt(this.root_,null,this.comparator_,!0,e)}}H.EMPTY_NODE=new Gc;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qc(s,e){return Qe(s.name,e.name)}function ns(s,e){return Qe(s,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let kn;function Yc(s){kn=s}const _o=function(s){return typeof s=="number"?"number:"+jr(s):"string:"+s},vo=function(s){if(s.isLeafNode()){const e=s.val();f(typeof e=="string"||typeof e=="number"||typeof e=="object"&&ce(e,".sv"),"Priority must be a string or number.")}else f(s===kn||s.isEmpty(),"priority of unexpected type.");f(s===kn||s.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let sr;class V{static set __childrenNodeConstructor(e){sr=e}static get __childrenNodeConstructor(){return sr}constructor(e,t=V.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,f(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),vo(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new V(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:V.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return I(e)?this:M(e)===".priority"?this.priorityNode_:V.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:V.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const n=M(e);return n===null?t:t.isEmpty()&&n!==".priority"?this:(f(n!==".priority"||fe(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(n,V.__childrenNodeConstructor.EMPTY_NODE.updateChild(N(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+_o(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=jr(this.value_):e+=this.value_,this.lazyHash_=qr(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===V.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof V.__childrenNodeConstructor?-1:(f(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,n=typeof this.value_,r=V.VALUE_TYPE_ORDER.indexOf(t),o=V.VALUE_TYPE_ORDER.indexOf(n);return f(r>=0,"Unknown leaf type: "+t),f(o>=0,"Unknown leaf type: "+n),r===o?n==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:o-r}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}V.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let yo,bo;function Kc(s){yo=s}function Jc(s){bo=s}class Xc extends nn{compare(e,t){const n=e.node.getPriority(),r=t.node.getPriority(),o=n.compareTo(r);return o===0?Qe(e.name,t.name):o}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return w.MIN}maxPost(){return new w(De,new V("[PRIORITY-POST]",bo))}makePost(e,t){const n=yo(e);return new w(t,new V("[PRIORITY-POST]",n))}toString(){return".priority"}}const k=new Xc;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zc=Math.log(2);class el{constructor(e){const t=o=>parseInt(Math.log(o)/Zc,10),n=o=>parseInt(Array(o+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const r=n(this.count);this.bits_=e+1&r}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const $t=function(s,e,t,n){s.sort(e);const r=function(c,l){const h=l-c;let d,u;if(h===0)return null;if(h===1)return d=s[c],u=t?t(d):d,new B(u,d.node,B.BLACK,null,null);{const m=parseInt(h/2,10)+c,p=r(c,m),v=r(m+1,l);return d=s[m],u=t?t(d):d,new B(u,d.node,B.BLACK,p,v)}},o=function(c){let l=null,h=null,d=s.length;const u=function(p,v){const S=d-p,A=d;d-=p;const F=r(S+1,A),$=s[S],G=t?t($):$;m(new B(G,$.node,v,null,F))},m=function(p){l?(l.left=p,l=p):(h=p,l=p)};for(let p=0;p<c.count;++p){const v=c.nextBitIsOne(),S=Math.pow(2,c.count-(p+1));v?u(S,B.BLACK):(u(S,B.BLACK),u(S,B.RED))}return h},i=new el(s.length),a=o(i);return new H(n||e,a)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let bn;const xe={};class re{static get Default(){return f(xe&&k,"ChildrenNode.ts has not been loaded"),bn=bn||new re({".priority":xe},{".priority":k}),bn}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=$e(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof H?t:null}hasIndex(e){return ce(this.indexSet_,e.toString())}addIndex(e,t){f(e!==Ue,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const n=[];let r=!1;const o=t.getIterator(w.Wrap);let i=o.getNext();for(;i;)r=r||e.isDefinedOn(i.node),n.push(i),i=o.getNext();let a;r?a=$t(n,e.getCompare()):a=xe;const c=e.toString(),l={...this.indexSet_};l[c]=e;const h={...this.indexes_};return h[c]=a,new re(h,l)}addToIndexes(e,t){const n=Ot(this.indexes_,(r,o)=>{const i=$e(this.indexSet_,o);if(f(i,"Missing index implementation for "+o),r===xe)if(i.isDefinedOn(e.node)){const a=[],c=t.getIterator(w.Wrap);let l=c.getNext();for(;l;)l.name!==e.name&&a.push(l),l=c.getNext();return a.push(e),$t(a,i.getCompare())}else return xe;else{const a=t.get(e.name);let c=r;return a&&(c=c.remove(new w(e.name,a))),c.insert(e,e.node)}});return new re(n,this.indexSet_)}removeFromIndexes(e,t){const n=Ot(this.indexes_,r=>{if(r===xe)return r;{const o=t.get(e.name);return o?r.remove(new w(e.name,o)):r}});return new re(n,this.indexSet_)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ze;class y{static get EMPTY_NODE(){return Ze||(Ze=new y(new H(ns),null,re.Default))}constructor(e,t,n){this.children_=e,this.priorityNode_=t,this.indexMap_=n,this.lazyHash_=null,this.priorityNode_&&vo(this.priorityNode_),this.children_.isEmpty()&&f(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Ze}updatePriority(e){return this.children_.isEmpty()?this:new y(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Ze:t}}getChild(e){const t=M(e);return t===null?this:this.getImmediateChild(t).getChild(N(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(f(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const n=new w(e,t);let r,o;t.isEmpty()?(r=this.children_.remove(e),o=this.indexMap_.removeFromIndexes(n,this.children_)):(r=this.children_.insert(e,t),o=this.indexMap_.addToIndexes(n,this.children_));const i=r.isEmpty()?Ze:this.priorityNode_;return new y(r,i,o)}}updateChild(e,t){const n=M(e);if(n===null)return t;{f(M(e)!==".priority"||fe(e)===1,".priority must be the last token in a path");const r=this.getImmediateChild(n).updateChild(N(e),t);return this.updateImmediateChild(n,r)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let n=0,r=0,o=!0;if(this.forEachChild(k,(i,a)=>{t[i]=a.val(e),n++,o&&y.INTEGER_REGEXP_.test(i)?r=Math.max(r,Number(i)):o=!1}),!e&&o&&r<2*n){const i=[];for(const a in t)i[a]=t[a];return i}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+_o(this.getPriority().val())+":"),this.forEachChild(k,(t,n)=>{const r=n.hash();r!==""&&(e+=":"+t+":"+r)}),this.lazyHash_=e===""?"":qr(e)}return this.lazyHash_}getPredecessorChildName(e,t,n){const r=this.resolveIndex_(n);if(r){const o=r.getPredecessorKey(new w(e,t));return o?o.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const n=t.minKey();return n&&n.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new w(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const n=t.maxKey();return n&&n.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new w(t,this.children_.get(t)):null}forEachChild(e,t){const n=this.resolveIndex_(e);return n?n.inorderTraversal(r=>t(r.name,r.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const n=this.resolveIndex_(t);if(n)return n.getIteratorFrom(e,r=>r);{const r=this.children_.getIteratorFrom(e.name,w.Wrap);let o=r.peek();for(;o!=null&&t.compare(o,e)<0;)r.getNext(),o=r.peek();return r}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const n=this.resolveIndex_(t);if(n)return n.getReverseIteratorFrom(e,r=>r);{const r=this.children_.getReverseIteratorFrom(e.name,w.Wrap);let o=r.peek();for(;o!=null&&t.compare(o,e)>0;)r.getNext(),o=r.peek();return r}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===It?-1:0}withIndex(e){if(e===Ue||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new y(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===Ue||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const n=this.getIterator(k),r=t.getIterator(k);let o=n.getNext(),i=r.getNext();for(;o&&i;){if(o.name!==i.name||!o.node.equals(i.node))return!1;o=n.getNext(),i=r.getNext()}return o===null&&i===null}else return!1;else return!1}}resolveIndex_(e){return e===Ue?null:this.indexMap_.get(e.toString())}}y.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class tl extends y{constructor(){super(new H(ns),y.EMPTY_NODE,re.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return y.EMPTY_NODE}isEmpty(){return!1}}const It=new tl;Object.defineProperties(w,{MIN:{value:new w(ze,y.EMPTY_NODE)},MAX:{value:new w(De,It)}});po.__EMPTY_NODE=y.EMPTY_NODE;V.__childrenNodeConstructor=y;Yc(It);Jc(It);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nl=!0;function U(s,e=null){if(s===null)return y.EMPTY_NODE;if(typeof s=="object"&&".priority"in s&&(e=s[".priority"]),f(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof s=="object"&&".value"in s&&s[".value"]!==null&&(s=s[".value"]),typeof s!="object"||".sv"in s){const t=s;return new V(t,U(e))}if(!(s instanceof Array)&&nl){const t=[];let n=!1;if(j(s,(i,a)=>{if(i.substring(0,1)!=="."){const c=U(a);c.isEmpty()||(n=n||!c.getPriority().isEmpty(),t.push(new w(i,c)))}}),t.length===0)return y.EMPTY_NODE;const o=$t(t,Qc,i=>i.name,ns);if(n){const i=$t(t,k.getCompare());return new y(o,U(e),new re({".priority":i},{".priority":k}))}else return new y(o,U(e),re.Default)}else{let t=y.EMPTY_NODE;return j(s,(n,r)=>{if(ce(s,n)&&n.substring(0,1)!=="."){const o=U(r);(o.isLeafNode()||!o.isEmpty())&&(t=t.updateImmediateChild(n,o))}}),t.updatePriority(U(e))}}Kc(U);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sl extends nn{constructor(e){super(),this.indexPath_=e,f(!I(e)&&M(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const n=this.extractChild(e.node),r=this.extractChild(t.node),o=n.compareTo(r);return o===0?Qe(e.name,t.name):o}makePost(e,t){const n=U(e),r=y.EMPTY_NODE.updateChild(this.indexPath_,n);return new w(t,r)}maxPost(){const e=y.EMPTY_NODE.updateChild(this.indexPath_,It);return new w(De,e)}toString(){return mo(this.indexPath_,0).join("/")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rl extends nn{compare(e,t){const n=e.node.compareTo(t.node);return n===0?Qe(e.name,t.name):n}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return w.MIN}maxPost(){return w.MAX}makePost(e,t){const n=U(e);return new w(t,n)}toString(){return".value"}}const ol=new rl;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Eo(s){return{type:"value",snapshotNode:s}}function qe(s,e){return{type:"child_added",snapshotNode:e,childName:s}}function mt(s,e){return{type:"child_removed",snapshotNode:e,childName:s}}function ft(s,e,t){return{type:"child_changed",snapshotNode:e,childName:s,oldSnap:t}}function il(s,e){return{type:"child_moved",snapshotNode:e,childName:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ss{constructor(e){this.index_=e}updateChild(e,t,n,r,o,i){f(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const a=e.getImmediateChild(t);return a.getChild(r).equals(n.getChild(r))&&a.isEmpty()===n.isEmpty()||(i!=null&&(n.isEmpty()?e.hasChild(t)?i.trackChildChange(mt(t,a)):f(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):a.isEmpty()?i.trackChildChange(qe(t,n)):i.trackChildChange(ft(t,n,a))),e.isLeafNode()&&n.isEmpty())?e:e.updateImmediateChild(t,n).withIndex(this.index_)}updateFullNode(e,t,n){return n!=null&&(e.isLeafNode()||e.forEachChild(k,(r,o)=>{t.hasChild(r)||n.trackChildChange(mt(r,o))}),t.isLeafNode()||t.forEachChild(k,(r,o)=>{if(e.hasChild(r)){const i=e.getImmediateChild(r);i.equals(o)||n.trackChildChange(ft(r,o,i))}else n.trackChildChange(qe(r,o))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?y.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gt{constructor(e){this.indexedFilter_=new ss(e.getIndex()),this.index_=e.getIndex(),this.startPost_=gt.getStartPost_(e),this.endPost_=gt.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,n=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&n}updateChild(e,t,n,r,o,i){return this.matches(new w(t,n))||(n=y.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,n,r,o,i)}updateFullNode(e,t,n){t.isLeafNode()&&(t=y.EMPTY_NODE);let r=t.withIndex(this.index_);r=r.updatePriority(y.EMPTY_NODE);const o=this;return t.forEachChild(k,(i,a)=>{o.matches(new w(i,a))||(r=r.updateImmediateChild(i,y.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,r,n)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class al{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const n=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?n<=0:n<0},this.withinEndPost=t=>{const n=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?n<=0:n<0},this.rangedFilter_=new gt(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,n,r,o,i){return this.rangedFilter_.matches(new w(t,n))||(n=y.EMPTY_NODE),e.getImmediateChild(t).equals(n)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,n,r,o,i):this.fullLimitUpdateChild_(e,t,n,o,i)}updateFullNode(e,t,n){let r;if(t.isLeafNode()||t.isEmpty())r=y.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){r=y.EMPTY_NODE.withIndex(this.index_);let o;this.reverse_?o=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):o=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let i=0;for(;o.hasNext()&&i<this.limit_;){const a=o.getNext();if(this.withinDirectionalStart(a))if(this.withinDirectionalEnd(a))r=r.updateImmediateChild(a.name,a.node),i++;else break;else continue}}else{r=t.withIndex(this.index_),r=r.updatePriority(y.EMPTY_NODE);let o;this.reverse_?o=r.getReverseIterator(this.index_):o=r.getIterator(this.index_);let i=0;for(;o.hasNext();){const a=o.getNext();i<this.limit_&&this.withinDirectionalStart(a)&&this.withinDirectionalEnd(a)?i++:r=r.updateImmediateChild(a.name,y.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,r,n)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,n,r,o){let i;if(this.reverse_){const d=this.index_.getCompare();i=(u,m)=>d(m,u)}else i=this.index_.getCompare();const a=e;f(a.numChildren()===this.limit_,"");const c=new w(t,n),l=this.reverse_?a.getFirstChild(this.index_):a.getLastChild(this.index_),h=this.rangedFilter_.matches(c);if(a.hasChild(t)){const d=a.getImmediateChild(t);let u=r.getChildAfterChild(this.index_,l,this.reverse_);for(;u!=null&&(u.name===t||a.hasChild(u.name));)u=r.getChildAfterChild(this.index_,u,this.reverse_);const m=u==null?1:i(u,c);if(h&&!n.isEmpty()&&m>=0)return o!=null&&o.trackChildChange(ft(t,n,d)),a.updateImmediateChild(t,n);{o!=null&&o.trackChildChange(mt(t,d));const v=a.updateImmediateChild(t,y.EMPTY_NODE);return u!=null&&this.rangedFilter_.matches(u)?(o!=null&&o.trackChildChange(qe(u.name,u.node)),v.updateImmediateChild(u.name,u.node)):v}}else return n.isEmpty()?e:h&&i(l,c)>=0?(o!=null&&(o.trackChildChange(mt(l.name,l.node)),o.trackChildChange(qe(t,n))),a.updateImmediateChild(t,n).updateImmediateChild(l.name,y.EMPTY_NODE)):e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rs{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=k}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return f(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return f(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:ze}hasEnd(){return this.endSet_}getIndexEndValue(){return f(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return f(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:De}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return f(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===k}copy(){const e=new rs;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function cl(s){return s.loadsAllData()?new ss(s.getIndex()):s.hasLimit()?new al(s):new gt(s)}function rr(s){const e={};if(s.isDefault())return e;let t;if(s.index_===k?t="$priority":s.index_===ol?t="$value":s.index_===Ue?t="$key":(f(s.index_ instanceof sl,"Unrecognized index type!"),t=s.index_.toString()),e.orderBy=O(t),s.startSet_){const n=s.startAfterSet_?"startAfter":"startAt";e[n]=O(s.indexStartValue_),s.startNameSet_&&(e[n]+=","+O(s.indexStartName_))}if(s.endSet_){const n=s.endBeforeSet_?"endBefore":"endAt";e[n]=O(s.indexEndValue_),s.endNameSet_&&(e[n]+=","+O(s.indexEndName_))}return s.limitSet_&&(s.isViewFromLeft()?e.limitToFirst=s.limit_:e.limitToLast=s.limit_),e}function or(s){const e={};if(s.startSet_&&(e.sp=s.indexStartValue_,s.startNameSet_&&(e.sn=s.indexStartName_),e.sin=!s.startAfterSet_),s.endSet_&&(e.ep=s.indexEndValue_,s.endNameSet_&&(e.en=s.indexEndName_),e.ein=!s.endBeforeSet_),s.limitSet_){e.l=s.limit_;let t=s.viewFrom_;t===""&&(s.isViewFromLeft()?t="l":t="r"),e.vf=t}return s.index_!==k&&(e.i=s.index_.toString()),e}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zt extends lo{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(f(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,n,r){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=n,this.appCheckTokenProvider_=r,this.log_=wt("p:rest:"),this.listens_={}}listen(e,t,n,r){const o=e._path.toString();this.log_("Listen called for "+o+" "+e._queryIdentifier);const i=zt.getListenId_(e,n),a={};this.listens_[i]=a;const c=rr(e._queryParams);this.restRequest_(o+".json",c,(l,h)=>{let d=h;if(l===404&&(d=null,l=null),l===null&&this.onDataUpdate_(o,d,!1,n),$e(this.listens_,i)===a){let u;l?l===401?u="permission_denied":u="rest_error:"+l:u="ok",r(u,null)}})}unlisten(e,t){const n=zt.getListenId_(e,t);delete this.listens_[n]}get(e){const t=rr(e._queryParams),n=e._path.toString(),r=new en;return this.restRequest_(n+".json",t,(o,i)=>{let a=i;o===404&&(a=null,o=null),o===null?(this.onDataUpdate_(n,a,!1,null),r.resolve(a)):r.reject(new Error(a))}),r.promise}refreshAuthToken(e){}restRequest_(e,t={},n){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([r,o])=>{r&&r.accessToken&&(t.auth=r.accessToken),o&&o.token&&(t.ac=o.token);const i=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+ki(t);this.log_("Sending REST request for "+i);const a=new XMLHttpRequest;a.onreadystatechange=()=>{if(n&&a.readyState===4){this.log_("REST Response for "+i+" received. status:",a.status,"response:",a.responseText);let c=null;if(a.status>=200&&a.status<300){try{c=lt(a.responseText)}catch{W("Failed to parse JSON response for "+i+": "+a.responseText)}n(null,c)}else a.status!==401&&a.status!==404&&W("Got unsuccessful REST response for "+i+" Status: "+a.status),n(a.status);n=null}},a.open("GET",i,!0),a.send()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ll{constructor(){this.rootNode_=y.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qt(){return{value:null,children:new Map}}function Co(s,e,t){if(I(e))s.value=t,s.children.clear();else if(s.value!==null)s.value=s.value.updateChild(e,t);else{const n=M(e);s.children.has(n)||s.children.set(n,qt());const r=s.children.get(n);e=N(e),Co(r,e,t)}}function xn(s,e,t){s.value!==null?t(e,s.value):dl(s,(n,r)=>{const o=new R(e.toString()+"/"+n);xn(r,o,t)})}function dl(s,e){s.children.forEach((t,n)=>{e(n,t)})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ul{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t={...e};return this.last_&&j(this.last_,(n,r)=>{t[n]=t[n]-r}),this.last_=e,t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ir=10*1e3,hl=30*1e3,ml=5*60*1e3;class fl{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new ul(e);const n=ir+(hl-ir)*Math.random();ot(this.reportStats_.bind(this),Math.floor(n))}reportStats_(){const e=this.statsListener_.get(),t={};let n=!1;j(e,(r,o)=>{o>0&&ce(this.statsToReport_,r)&&(t[r]=o,n=!0)}),n&&this.server_.reportStats(t),ot(this.reportStats_.bind(this),Math.floor(Math.random()*2*ml))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Z;(function(s){s[s.OVERWRITE=0]="OVERWRITE",s[s.MERGE=1]="MERGE",s[s.ACK_USER_WRITE=2]="ACK_USER_WRITE",s[s.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(Z||(Z={}));function Mo(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function os(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function is(s){return{fromUser:!1,fromServer:!0,queryId:s,tagged:!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ht{constructor(e,t,n){this.path=e,this.affectedTree=t,this.revert=n,this.type=Z.ACK_USER_WRITE,this.source=Mo()}operationForChild(e){if(I(this.path)){if(this.affectedTree.value!=null)return f(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new R(e));return new Ht(T(),t,this.revert)}}else return f(M(this.path)===e,"operationForChild called for unrelated child."),new Ht(N(this.path),this.affectedTree,this.revert)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pt{constructor(e,t){this.source=e,this.path=t,this.type=Z.LISTEN_COMPLETE}operationForChild(e){return I(this.path)?new pt(this.source,T()):new pt(this.source,N(this.path))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ne{constructor(e,t,n){this.source=e,this.path=t,this.snap=n,this.type=Z.OVERWRITE}operationForChild(e){return I(this.path)?new Ne(this.source,T(),this.snap.getImmediateChild(e)):new Ne(this.source,N(this.path),this.snap)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e,t,n){this.source=e,this.path=t,this.children=n,this.type=Z.MERGE}operationForChild(e){if(I(this.path)){const t=this.children.subtree(new R(e));return t.isEmpty()?null:t.value?new Ne(this.source,T(),t.value):new _t(this.source,T(),t)}else return f(M(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new _t(this.source,N(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ge{constructor(e,t,n){this.node_=e,this.fullyInitialized_=t,this.filtered_=n}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(I(e))return this.isFullyInitialized()&&!this.filtered_;const t=M(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gl{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function pl(s,e,t,n){const r=[],o=[];return e.forEach(i=>{i.type==="child_changed"&&s.index_.indexedValueChanged(i.oldSnap,i.snapshotNode)&&o.push(il(i.childName,i.snapshotNode))}),et(s,r,"child_removed",e,n,t),et(s,r,"child_added",e,n,t),et(s,r,"child_moved",o,n,t),et(s,r,"child_changed",e,n,t),et(s,r,"value",e,n,t),r}function et(s,e,t,n,r,o){const i=n.filter(a=>a.type===t);i.sort((a,c)=>vl(s,a,c)),i.forEach(a=>{const c=_l(s,a,o);r.forEach(l=>{l.respondsTo(a.type)&&e.push(l.createEvent(c,s.query_))})})}function _l(s,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,s.index_)),e}function vl(s,e,t){if(e.childName==null||t.childName==null)throw je("Should only compare child_ events.");const n=new w(e.childName,e.snapshotNode),r=new w(t.childName,t.snapshotNode);return s.index_.compare(n,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sn(s,e){return{eventCache:s,serverCache:e}}function it(s,e,t,n){return sn(new ge(e,t,n),s.serverCache)}function wo(s,e,t,n){return sn(s.eventCache,new ge(e,t,n))}function Wt(s){return s.eventCache.isFullyInitialized()?s.eventCache.getNode():null}function Pe(s){return s.serverCache.isFullyInitialized()?s.serverCache.getNode():null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let En;const yl=()=>(En||(En=new H(rc)),En);class P{static fromObject(e){let t=new P(null);return j(e,(n,r)=>{t=t.set(new R(n),r)}),t}constructor(e,t=yl()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:T(),value:this.value};if(I(e))return null;{const n=M(e),r=this.children.get(n);if(r!==null){const o=r.findRootMostMatchingPathAndValue(N(e),t);return o!=null?{path:L(new R(n),o.path),value:o.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(I(e))return this;{const t=M(e),n=this.children.get(t);return n!==null?n.subtree(N(e)):new P(null)}}set(e,t){if(I(e))return new P(t,this.children);{const n=M(e),o=(this.children.get(n)||new P(null)).set(N(e),t),i=this.children.insert(n,o);return new P(this.value,i)}}remove(e){if(I(e))return this.children.isEmpty()?new P(null):new P(null,this.children);{const t=M(e),n=this.children.get(t);if(n){const r=n.remove(N(e));let o;return r.isEmpty()?o=this.children.remove(t):o=this.children.insert(t,r),this.value===null&&o.isEmpty()?new P(null):new P(this.value,o)}else return this}}get(e){if(I(e))return this.value;{const t=M(e),n=this.children.get(t);return n?n.get(N(e)):null}}setTree(e,t){if(I(e))return t;{const n=M(e),o=(this.children.get(n)||new P(null)).setTree(N(e),t);let i;return o.isEmpty()?i=this.children.remove(n):i=this.children.insert(n,o),new P(this.value,i)}}fold(e){return this.fold_(T(),e)}fold_(e,t){const n={};return this.children.inorderTraversal((r,o)=>{n[r]=o.fold_(L(e,r),t)}),t(e,this.value,n)}findOnPath(e,t){return this.findOnPath_(e,T(),t)}findOnPath_(e,t,n){const r=this.value?n(t,this.value):!1;if(r)return r;if(I(e))return null;{const o=M(e),i=this.children.get(o);return i?i.findOnPath_(N(e),L(t,o),n):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,T(),t)}foreachOnPath_(e,t,n){if(I(e))return this;{this.value&&n(t,this.value);const r=M(e),o=this.children.get(r);return o?o.foreachOnPath_(N(e),L(t,r),n):new P(null)}}foreach(e){this.foreach_(T(),e)}foreach_(e,t){this.children.inorderTraversal((n,r)=>{r.foreach_(L(e,n),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,n)=>{n.value&&e(t,n.value)})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ee{constructor(e){this.writeTree_=e}static empty(){return new ee(new P(null))}}function at(s,e,t){if(I(e))return new ee(new P(t));{const n=s.writeTree_.findRootMostValueAndPath(e);if(n!=null){const r=n.path;let o=n.value;const i=q(r,e);return o=o.updateChild(i,t),new ee(s.writeTree_.set(r,o))}else{const r=new P(t),o=s.writeTree_.setTree(e,r);return new ee(o)}}}function ar(s,e,t){let n=s;return j(t,(r,o)=>{n=at(n,L(e,r),o)}),n}function cr(s,e){if(I(e))return ee.empty();{const t=s.writeTree_.setTree(e,new P(null));return new ee(t)}}function On(s,e){return ke(s,e)!=null}function ke(s,e){const t=s.writeTree_.findRootMostValueAndPath(e);return t!=null?s.writeTree_.get(t.path).getChild(q(t.path,e)):null}function lr(s){const e=[],t=s.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(k,(n,r)=>{e.push(new w(n,r))}):s.writeTree_.children.inorderTraversal((n,r)=>{r.value!=null&&e.push(new w(n,r.value))}),e}function he(s,e){if(I(e))return s;{const t=ke(s,e);return t!=null?new ee(new P(t)):new ee(s.writeTree_.subtree(e))}}function Ln(s){return s.writeTree_.isEmpty()}function He(s,e){return Io(T(),s.writeTree_,e)}function Io(s,e,t){if(e.value!=null)return t.updateChild(s,e.value);{let n=null;return e.children.inorderTraversal((r,o)=>{r===".priority"?(f(o.value!==null,"Priority writes must always be leaf nodes"),n=o.value):t=Io(L(s,r),o,t)}),!t.getChild(s).isEmpty()&&n!==null&&(t=t.updateChild(L(s,".priority"),n)),t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rn(s,e){return Ro(e,s)}function bl(s,e,t,n,r){f(n>s.lastWriteId,"Stacking an older write on top of newer ones"),r===void 0&&(r=!0),s.allWrites.push({path:e,snap:t,writeId:n,visible:r}),r&&(s.visibleWrites=at(s.visibleWrites,e,t)),s.lastWriteId=n}function El(s,e){for(let t=0;t<s.allWrites.length;t++){const n=s.allWrites[t];if(n.writeId===e)return n}return null}function Cl(s,e){const t=s.allWrites.findIndex(a=>a.writeId===e);f(t>=0,"removeWrite called with nonexistent writeId.");const n=s.allWrites[t];s.allWrites.splice(t,1);let r=n.visible,o=!1,i=s.allWrites.length-1;for(;r&&i>=0;){const a=s.allWrites[i];a.visible&&(i>=t&&Ml(a,n.path)?r=!1:X(n.path,a.path)&&(o=!0)),i--}if(r){if(o)return wl(s),!0;if(n.snap)s.visibleWrites=cr(s.visibleWrites,n.path);else{const a=n.children;j(a,c=>{s.visibleWrites=cr(s.visibleWrites,L(n.path,c))})}return!0}else return!1}function Ml(s,e){if(s.snap)return X(s.path,e);for(const t in s.children)if(s.children.hasOwnProperty(t)&&X(L(s.path,t),e))return!0;return!1}function wl(s){s.visibleWrites=So(s.allWrites,Il,T()),s.allWrites.length>0?s.lastWriteId=s.allWrites[s.allWrites.length-1].writeId:s.lastWriteId=-1}function Il(s){return s.visible}function So(s,e,t){let n=ee.empty();for(let r=0;r<s.length;++r){const o=s[r];if(e(o)){const i=o.path;let a;if(o.snap)X(t,i)?(a=q(t,i),n=at(n,a,o.snap)):X(i,t)&&(a=q(i,t),n=at(n,T(),o.snap.getChild(a)));else if(o.children){if(X(t,i))a=q(t,i),n=ar(n,a,o.children);else if(X(i,t))if(a=q(i,t),I(a))n=ar(n,T(),o.children);else{const c=$e(o.children,M(a));if(c){const l=c.getChild(N(a));n=at(n,T(),l)}}}else throw je("WriteRecord should have .snap or .children")}}return n}function To(s,e,t,n,r){if(!n&&!r){const o=ke(s.visibleWrites,e);if(o!=null)return o;{const i=he(s.visibleWrites,e);if(Ln(i))return t;if(t==null&&!On(i,T()))return null;{const a=t||y.EMPTY_NODE;return He(i,a)}}}else{const o=he(s.visibleWrites,e);if(!r&&Ln(o))return t;if(!r&&t==null&&!On(o,T()))return null;{const i=function(l){return(l.visible||r)&&(!n||!~n.indexOf(l.writeId))&&(X(l.path,e)||X(e,l.path))},a=So(s.allWrites,i,e),c=t||y.EMPTY_NODE;return He(a,c)}}}function Sl(s,e,t){let n=y.EMPTY_NODE;const r=ke(s.visibleWrites,e);if(r)return r.isLeafNode()||r.forEachChild(k,(o,i)=>{n=n.updateImmediateChild(o,i)}),n;if(t){const o=he(s.visibleWrites,e);return t.forEachChild(k,(i,a)=>{const c=He(he(o,new R(i)),a);n=n.updateImmediateChild(i,c)}),lr(o).forEach(i=>{n=n.updateImmediateChild(i.name,i.node)}),n}else{const o=he(s.visibleWrites,e);return lr(o).forEach(i=>{n=n.updateImmediateChild(i.name,i.node)}),n}}function Tl(s,e,t,n,r){f(n||r,"Either existingEventSnap or existingServerSnap must exist");const o=L(e,t);if(On(s.visibleWrites,o))return null;{const i=he(s.visibleWrites,o);return Ln(i)?r.getChild(t):He(i,r.getChild(t))}}function Al(s,e,t,n){const r=L(e,t),o=ke(s.visibleWrites,r);if(o!=null)return o;if(n.isCompleteForChild(t)){const i=he(s.visibleWrites,r);return He(i,n.getNode().getImmediateChild(t))}else return null}function Rl(s,e){return ke(s.visibleWrites,e)}function Dl(s,e,t,n,r,o,i){let a;const c=he(s.visibleWrites,e),l=ke(c,T());if(l!=null)a=l;else if(t!=null)a=He(c,t);else return[];if(a=a.withIndex(i),!a.isEmpty()&&!a.isLeafNode()){const h=[],d=i.getCompare(),u=o?a.getReverseIteratorFrom(n,i):a.getIteratorFrom(n,i);let m=u.getNext();for(;m&&h.length<r;)d(m,n)!==0&&h.push(m),m=u.getNext();return h}else return[]}function Nl(){return{visibleWrites:ee.empty(),allWrites:[],lastWriteId:-1}}function jt(s,e,t,n){return To(s.writeTree,s.treePath,e,t,n)}function as(s,e){return Sl(s.writeTree,s.treePath,e)}function dr(s,e,t,n){return Tl(s.writeTree,s.treePath,e,t,n)}function Gt(s,e){return Rl(s.writeTree,L(s.treePath,e))}function Pl(s,e,t,n,r,o){return Dl(s.writeTree,s.treePath,e,t,n,r,o)}function cs(s,e,t){return Al(s.writeTree,s.treePath,e,t)}function Ao(s,e){return Ro(L(s.treePath,e),s.writeTree)}function Ro(s,e){return{treePath:s,writeTree:e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kl{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,n=e.childName;f(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),f(n!==".priority","Only non-priority child changes can be tracked.");const r=this.changeMap.get(n);if(r){const o=r.type;if(t==="child_added"&&o==="child_removed")this.changeMap.set(n,ft(n,e.snapshotNode,r.snapshotNode));else if(t==="child_removed"&&o==="child_added")this.changeMap.delete(n);else if(t==="child_removed"&&o==="child_changed")this.changeMap.set(n,mt(n,r.oldSnap));else if(t==="child_changed"&&o==="child_added")this.changeMap.set(n,qe(n,e.snapshotNode));else if(t==="child_changed"&&o==="child_changed")this.changeMap.set(n,ft(n,e.snapshotNode,r.oldSnap));else throw je("Illegal combination of changes: "+e+" occurred after "+r)}else this.changeMap.set(n,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xl{getCompleteChild(e){return null}getChildAfterChild(e,t,n){return null}}const Do=new xl;class ls{constructor(e,t,n=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=n}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const n=this.optCompleteServerCache_!=null?new ge(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return cs(this.writes_,e,n)}}getChildAfterChild(e,t,n){const r=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:Pe(this.viewCache_),o=Pl(this.writes_,r,t,1,n,e);return o.length===0?null:o[0]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ol(s){return{filter:s}}function Ll(s,e){f(e.eventCache.getNode().isIndexed(s.filter.getIndex()),"Event snap not indexed"),f(e.serverCache.getNode().isIndexed(s.filter.getIndex()),"Server snap not indexed")}function Fl(s,e,t,n,r){const o=new kl;let i,a;if(t.type===Z.OVERWRITE){const l=t;l.source.fromUser?i=Fn(s,e,l.path,l.snap,n,r,o):(f(l.source.fromServer,"Unknown source."),a=l.source.tagged||e.serverCache.isFiltered()&&!I(l.path),i=Qt(s,e,l.path,l.snap,n,r,a,o))}else if(t.type===Z.MERGE){const l=t;l.source.fromUser?i=Bl(s,e,l.path,l.children,n,r,o):(f(l.source.fromServer,"Unknown source."),a=l.source.tagged||e.serverCache.isFiltered(),i=Vn(s,e,l.path,l.children,n,r,a,o))}else if(t.type===Z.ACK_USER_WRITE){const l=t;l.revert?i=zl(s,e,l.path,n,r,o):i=Ul(s,e,l.path,l.affectedTree,n,r,o)}else if(t.type===Z.LISTEN_COMPLETE)i=$l(s,e,t.path,n,o);else throw je("Unknown operation type: "+t.type);const c=o.getChanges();return Vl(e,i,c),{viewCache:i,changes:c}}function Vl(s,e,t){const n=e.eventCache;if(n.isFullyInitialized()){const r=n.getNode().isLeafNode()||n.getNode().isEmpty(),o=Wt(s);(t.length>0||!s.eventCache.isFullyInitialized()||r&&!n.getNode().equals(o)||!n.getNode().getPriority().equals(o.getPriority()))&&t.push(Eo(Wt(e)))}}function No(s,e,t,n,r,o){const i=e.eventCache;if(Gt(n,t)!=null)return e;{let a,c;if(I(t))if(f(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const l=Pe(e),h=l instanceof y?l:y.EMPTY_NODE,d=as(n,h);a=s.filter.updateFullNode(e.eventCache.getNode(),d,o)}else{const l=jt(n,Pe(e));a=s.filter.updateFullNode(e.eventCache.getNode(),l,o)}else{const l=M(t);if(l===".priority"){f(fe(t)===1,"Can't have a priority with additional path components");const h=i.getNode();c=e.serverCache.getNode();const d=dr(n,t,h,c);d!=null?a=s.filter.updatePriority(h,d):a=i.getNode()}else{const h=N(t);let d;if(i.isCompleteForChild(l)){c=e.serverCache.getNode();const u=dr(n,t,i.getNode(),c);u!=null?d=i.getNode().getImmediateChild(l).updateChild(h,u):d=i.getNode().getImmediateChild(l)}else d=cs(n,l,e.serverCache);d!=null?a=s.filter.updateChild(i.getNode(),l,d,h,r,o):a=i.getNode()}}return it(e,a,i.isFullyInitialized()||I(t),s.filter.filtersNodes())}}function Qt(s,e,t,n,r,o,i,a){const c=e.serverCache;let l;const h=i?s.filter:s.filter.getIndexedFilter();if(I(t))l=h.updateFullNode(c.getNode(),n,null);else if(h.filtersNodes()&&!c.isFiltered()){const m=c.getNode().updateChild(t,n);l=h.updateFullNode(c.getNode(),m,null)}else{const m=M(t);if(!c.isCompleteForPath(t)&&fe(t)>1)return e;const p=N(t),S=c.getNode().getImmediateChild(m).updateChild(p,n);m===".priority"?l=h.updatePriority(c.getNode(),S):l=h.updateChild(c.getNode(),m,S,p,Do,null)}const d=wo(e,l,c.isFullyInitialized()||I(t),h.filtersNodes()),u=new ls(r,d,o);return No(s,d,t,r,u,a)}function Fn(s,e,t,n,r,o,i){const a=e.eventCache;let c,l;const h=new ls(r,e,o);if(I(t))l=s.filter.updateFullNode(e.eventCache.getNode(),n,i),c=it(e,l,!0,s.filter.filtersNodes());else{const d=M(t);if(d===".priority")l=s.filter.updatePriority(e.eventCache.getNode(),n),c=it(e,l,a.isFullyInitialized(),a.isFiltered());else{const u=N(t),m=a.getNode().getImmediateChild(d);let p;if(I(u))p=n;else{const v=h.getCompleteChild(d);v!=null?ho(u)===".priority"&&v.getChild(fo(u)).isEmpty()?p=v:p=v.updateChild(u,n):p=y.EMPTY_NODE}if(m.equals(p))c=e;else{const v=s.filter.updateChild(a.getNode(),d,p,u,h,i);c=it(e,v,a.isFullyInitialized(),s.filter.filtersNodes())}}}return c}function ur(s,e){return s.eventCache.isCompleteForChild(e)}function Bl(s,e,t,n,r,o,i){let a=e;return n.foreach((c,l)=>{const h=L(t,c);ur(e,M(h))&&(a=Fn(s,a,h,l,r,o,i))}),n.foreach((c,l)=>{const h=L(t,c);ur(e,M(h))||(a=Fn(s,a,h,l,r,o,i))}),a}function hr(s,e,t){return t.foreach((n,r)=>{e=e.updateChild(n,r)}),e}function Vn(s,e,t,n,r,o,i,a){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let c=e,l;I(t)?l=n:l=new P(null).setTree(t,n);const h=e.serverCache.getNode();return l.children.inorderTraversal((d,u)=>{if(h.hasChild(d)){const m=e.serverCache.getNode().getImmediateChild(d),p=hr(s,m,u);c=Qt(s,c,new R(d),p,r,o,i,a)}}),l.children.inorderTraversal((d,u)=>{const m=!e.serverCache.isCompleteForChild(d)&&u.value===null;if(!h.hasChild(d)&&!m){const p=e.serverCache.getNode().getImmediateChild(d),v=hr(s,p,u);c=Qt(s,c,new R(d),v,r,o,i,a)}}),c}function Ul(s,e,t,n,r,o,i){if(Gt(r,t)!=null)return e;const a=e.serverCache.isFiltered(),c=e.serverCache;if(n.value!=null){if(I(t)&&c.isFullyInitialized()||c.isCompleteForPath(t))return Qt(s,e,t,c.getNode().getChild(t),r,o,a,i);if(I(t)){let l=new P(null);return c.getNode().forEachChild(Ue,(h,d)=>{l=l.set(new R(h),d)}),Vn(s,e,t,l,r,o,a,i)}else return e}else{let l=new P(null);return n.foreach((h,d)=>{const u=L(t,h);c.isCompleteForPath(u)&&(l=l.set(h,c.getNode().getChild(u)))}),Vn(s,e,t,l,r,o,a,i)}}function $l(s,e,t,n,r){const o=e.serverCache,i=wo(e,o.getNode(),o.isFullyInitialized()||I(t),o.isFiltered());return No(s,i,t,n,Do,r)}function zl(s,e,t,n,r,o){let i;if(Gt(n,t)!=null)return e;{const a=new ls(n,e,r),c=e.eventCache.getNode();let l;if(I(t)||M(t)===".priority"){let h;if(e.serverCache.isFullyInitialized())h=jt(n,Pe(e));else{const d=e.serverCache.getNode();f(d instanceof y,"serverChildren would be complete if leaf node"),h=as(n,d)}h=h,l=s.filter.updateFullNode(c,h,o)}else{const h=M(t);let d=cs(n,h,e.serverCache);d==null&&e.serverCache.isCompleteForChild(h)&&(d=c.getImmediateChild(h)),d!=null?l=s.filter.updateChild(c,h,d,N(t),a,o):e.eventCache.getNode().hasChild(h)?l=s.filter.updateChild(c,h,y.EMPTY_NODE,N(t),a,o):l=c,l.isEmpty()&&e.serverCache.isFullyInitialized()&&(i=jt(n,Pe(e)),i.isLeafNode()&&(l=s.filter.updateFullNode(l,i,o)))}return i=e.serverCache.isFullyInitialized()||Gt(n,T())!=null,it(e,l,i,s.filter.filtersNodes())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ql{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const n=this.query_._queryParams,r=new ss(n.getIndex()),o=cl(n);this.processor_=Ol(o);const i=t.serverCache,a=t.eventCache,c=r.updateFullNode(y.EMPTY_NODE,i.getNode(),null),l=o.updateFullNode(y.EMPTY_NODE,a.getNode(),null),h=new ge(c,i.isFullyInitialized(),r.filtersNodes()),d=new ge(l,a.isFullyInitialized(),o.filtersNodes());this.viewCache_=sn(d,h),this.eventGenerator_=new gl(this.query_)}get query(){return this.query_}}function Hl(s){return s.viewCache_.serverCache.getNode()}function Wl(s){return Wt(s.viewCache_)}function jl(s,e){const t=Pe(s.viewCache_);return t&&(s.query._queryParams.loadsAllData()||!I(e)&&!t.getImmediateChild(M(e)).isEmpty())?t.getChild(e):null}function mr(s){return s.eventRegistrations_.length===0}function Gl(s,e){s.eventRegistrations_.push(e)}function fr(s,e,t){const n=[];if(t){f(e==null,"A cancel should cancel all event registrations.");const r=s.query._path;s.eventRegistrations_.forEach(o=>{const i=o.createCancelEvent(t,r);i&&n.push(i)})}if(e){let r=[];for(let o=0;o<s.eventRegistrations_.length;++o){const i=s.eventRegistrations_[o];if(!i.matches(e))r.push(i);else if(e.hasAnyCallback()){r=r.concat(s.eventRegistrations_.slice(o+1));break}}s.eventRegistrations_=r}else s.eventRegistrations_=[];return n}function gr(s,e,t,n){e.type===Z.MERGE&&e.source.queryId!==null&&(f(Pe(s.viewCache_),"We should always have a full cache before handling merges"),f(Wt(s.viewCache_),"Missing event cache, even though we have a server cache"));const r=s.viewCache_,o=Fl(s.processor_,r,e,t,n);return Ll(s.processor_,o.viewCache),f(o.viewCache.serverCache.isFullyInitialized()||!r.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),s.viewCache_=o.viewCache,Po(s,o.changes,o.viewCache.eventCache.getNode(),null)}function Ql(s,e){const t=s.viewCache_.eventCache,n=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(k,(o,i)=>{n.push(qe(o,i))}),t.isFullyInitialized()&&n.push(Eo(t.getNode())),Po(s,n,t.getNode(),e)}function Po(s,e,t,n){const r=n?[n]:s.eventRegistrations_;return pl(s.eventGenerator_,e,t,r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Yt;class ko{constructor(){this.views=new Map}}function Yl(s){f(!Yt,"__referenceConstructor has already been defined"),Yt=s}function Kl(){return f(Yt,"Reference.ts has not been loaded"),Yt}function Jl(s){return s.views.size===0}function ds(s,e,t,n){const r=e.source.queryId;if(r!==null){const o=s.views.get(r);return f(o!=null,"SyncTree gave us an op for an invalid query."),gr(o,e,t,n)}else{let o=[];for(const i of s.views.values())o=o.concat(gr(i,e,t,n));return o}}function xo(s,e,t,n,r){const o=e._queryIdentifier,i=s.views.get(o);if(!i){let a=jt(t,r?n:null),c=!1;a?c=!0:n instanceof y?(a=as(t,n),c=!1):(a=y.EMPTY_NODE,c=!1);const l=sn(new ge(a,c,!1),new ge(n,r,!1));return new ql(e,l)}return i}function Xl(s,e,t,n,r,o){const i=xo(s,e,n,r,o);return s.views.has(e._queryIdentifier)||s.views.set(e._queryIdentifier,i),Gl(i,t),Ql(i,t)}function Zl(s,e,t,n){const r=e._queryIdentifier,o=[];let i=[];const a=pe(s);if(r==="default")for(const[c,l]of s.views.entries())i=i.concat(fr(l,t,n)),mr(l)&&(s.views.delete(c),l.query._queryParams.loadsAllData()||o.push(l.query));else{const c=s.views.get(r);c&&(i=i.concat(fr(c,t,n)),mr(c)&&(s.views.delete(r),c.query._queryParams.loadsAllData()||o.push(c.query)))}return a&&!pe(s)&&o.push(new(Kl())(e._repo,e._path)),{removed:o,events:i}}function Oo(s){const e=[];for(const t of s.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function me(s,e){let t=null;for(const n of s.views.values())t=t||jl(n,e);return t}function Lo(s,e){if(e._queryParams.loadsAllData())return on(s);{const n=e._queryIdentifier;return s.views.get(n)}}function Fo(s,e){return Lo(s,e)!=null}function pe(s){return on(s)!=null}function on(s){for(const e of s.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Kt;function ed(s){f(!Kt,"__referenceConstructor has already been defined"),Kt=s}function td(){return f(Kt,"Reference.ts has not been loaded"),Kt}let nd=1;class pr{constructor(e){this.listenProvider_=e,this.syncPointTree_=new P(null),this.pendingWriteTree_=Nl(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function Vo(s,e,t,n,r){return bl(s.pendingWriteTree_,e,t,n,r),r?Tt(s,new Ne(Mo(),e,t)):[]}function Ae(s,e,t=!1){const n=El(s.pendingWriteTree_,e);if(Cl(s.pendingWriteTree_,e)){let o=new P(null);return n.snap!=null?o=o.set(T(),!0):j(n.children,i=>{o=o.set(new R(i),!0)}),Tt(s,new Ht(n.path,o,t))}else return[]}function St(s,e,t){return Tt(s,new Ne(os(),e,t))}function sd(s,e,t){const n=P.fromObject(t);return Tt(s,new _t(os(),e,n))}function rd(s,e){return Tt(s,new pt(os(),e))}function od(s,e,t){const n=hs(s,t);if(n){const r=ms(n),o=r.path,i=r.queryId,a=q(o,e),c=new pt(is(i),a);return fs(s,o,c)}else return[]}function Jt(s,e,t,n,r=!1){const o=e._path,i=s.syncPointTree_.get(o);let a=[];if(i&&(e._queryIdentifier==="default"||Fo(i,e))){const c=Zl(i,e,t,n);Jl(i)&&(s.syncPointTree_=s.syncPointTree_.remove(o));const l=c.removed;if(a=c.events,!r){const h=l.findIndex(u=>u._queryParams.loadsAllData())!==-1,d=s.syncPointTree_.findOnPath(o,(u,m)=>pe(m));if(h&&!d){const u=s.syncPointTree_.subtree(o);if(!u.isEmpty()){const m=cd(u);for(let p=0;p<m.length;++p){const v=m[p],S=v.query,A=zo(s,v);s.listenProvider_.startListening(ct(S),vt(s,S),A.hashFn,A.onComplete)}}}!d&&l.length>0&&!n&&(h?s.listenProvider_.stopListening(ct(e),null):l.forEach(u=>{const m=s.queryToTagMap.get(an(u));s.listenProvider_.stopListening(ct(u),m)}))}ld(s,l)}return a}function Bo(s,e,t,n){const r=hs(s,n);if(r!=null){const o=ms(r),i=o.path,a=o.queryId,c=q(i,e),l=new Ne(is(a),c,t);return fs(s,i,l)}else return[]}function id(s,e,t,n){const r=hs(s,n);if(r){const o=ms(r),i=o.path,a=o.queryId,c=q(i,e),l=P.fromObject(t),h=new _t(is(a),c,l);return fs(s,i,h)}else return[]}function Bn(s,e,t,n=!1){const r=e._path;let o=null,i=!1;s.syncPointTree_.foreachOnPath(r,(u,m)=>{const p=q(u,r);o=o||me(m,p),i=i||pe(m)});let a=s.syncPointTree_.get(r);a?(i=i||pe(a),o=o||me(a,T())):(a=new ko,s.syncPointTree_=s.syncPointTree_.set(r,a));let c;o!=null?c=!0:(c=!1,o=y.EMPTY_NODE,s.syncPointTree_.subtree(r).foreachChild((m,p)=>{const v=me(p,T());v&&(o=o.updateImmediateChild(m,v))}));const l=Fo(a,e);if(!l&&!e._queryParams.loadsAllData()){const u=an(e);f(!s.queryToTagMap.has(u),"View does not exist, but we have a tag");const m=dd();s.queryToTagMap.set(u,m),s.tagToQueryMap.set(m,u)}const h=rn(s.pendingWriteTree_,r);let d=Xl(a,e,t,h,o,c);if(!l&&!i&&!n){const u=Lo(a,e);d=d.concat(ud(s,e,u))}return d}function us(s,e,t){const r=s.pendingWriteTree_,o=s.syncPointTree_.findOnPath(e,(i,a)=>{const c=q(i,e),l=me(a,c);if(l)return l});return To(r,e,o,t,!0)}function ad(s,e){const t=e._path;let n=null;s.syncPointTree_.foreachOnPath(t,(l,h)=>{const d=q(l,t);n=n||me(h,d)});let r=s.syncPointTree_.get(t);r?n=n||me(r,T()):(r=new ko,s.syncPointTree_=s.syncPointTree_.set(t,r));const o=n!=null,i=o?new ge(n,!0,!1):null,a=rn(s.pendingWriteTree_,e._path),c=xo(r,e,a,o?i.getNode():y.EMPTY_NODE,o);return Wl(c)}function Tt(s,e){return Uo(e,s.syncPointTree_,null,rn(s.pendingWriteTree_,T()))}function Uo(s,e,t,n){if(I(s.path))return $o(s,e,t,n);{const r=e.get(T());t==null&&r!=null&&(t=me(r,T()));let o=[];const i=M(s.path),a=s.operationForChild(i),c=e.children.get(i);if(c&&a){const l=t?t.getImmediateChild(i):null,h=Ao(n,i);o=o.concat(Uo(a,c,l,h))}return r&&(o=o.concat(ds(r,s,n,t))),o}}function $o(s,e,t,n){const r=e.get(T());t==null&&r!=null&&(t=me(r,T()));let o=[];return e.children.inorderTraversal((i,a)=>{const c=t?t.getImmediateChild(i):null,l=Ao(n,i),h=s.operationForChild(i);h&&(o=o.concat($o(h,a,c,l)))}),r&&(o=o.concat(ds(r,s,n,t))),o}function zo(s,e){const t=e.query,n=vt(s,t);return{hashFn:()=>(Hl(e)||y.EMPTY_NODE).hash(),onComplete:r=>{if(r==="ok")return n?od(s,t._path,n):rd(s,t._path);{const o=ac(r,t);return Jt(s,t,null,o)}}}}function vt(s,e){const t=an(e);return s.queryToTagMap.get(t)}function an(s){return s._path.toString()+"$"+s._queryIdentifier}function hs(s,e){return s.tagToQueryMap.get(e)}function ms(s){const e=s.indexOf("$");return f(e!==-1&&e<s.length-1,"Bad queryKey."),{queryId:s.substr(e+1),path:new R(s.substr(0,e))}}function fs(s,e,t){const n=s.syncPointTree_.get(e);f(n,"Missing sync point for query tag that we're tracking");const r=rn(s.pendingWriteTree_,e);return ds(n,t,r,null)}function cd(s){return s.fold((e,t,n)=>{if(t&&pe(t))return[on(t)];{let r=[];return t&&(r=Oo(t)),j(n,(o,i)=>{r=r.concat(i)}),r}})}function ct(s){return s._queryParams.loadsAllData()&&!s._queryParams.isDefault()?new(td())(s._repo,s._path):s}function ld(s,e){for(let t=0;t<e.length;++t){const n=e[t];if(!n._queryParams.loadsAllData()){const r=an(n),o=s.queryToTagMap.get(r);s.queryToTagMap.delete(r),s.tagToQueryMap.delete(o)}}}function dd(){return nd++}function ud(s,e,t){const n=e._path,r=vt(s,e),o=zo(s,t),i=s.listenProvider_.startListening(ct(e),r,o.hashFn,o.onComplete),a=s.syncPointTree_.subtree(n);if(r)f(!pe(a.value),"If we're adding a query, it shouldn't be shadowed");else{const c=a.fold((l,h,d)=>{if(!I(l)&&h&&pe(h))return[on(h).query];{let u=[];return h&&(u=u.concat(Oo(h).map(m=>m.query))),j(d,(m,p)=>{u=u.concat(p)}),u}});for(let l=0;l<c.length;++l){const h=c[l];s.listenProvider_.stopListening(ct(h),vt(s,h))}}return i}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gs{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new gs(t)}node(){return this.node_}}class ps{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=L(this.path_,e);return new ps(this.syncTree_,t)}node(){return us(this.syncTree_,this.path_)}}const hd=function(s){return s=s||{},s.timestamp=s.timestamp||new Date().getTime(),s},_r=function(s,e,t){if(!s||typeof s!="object")return s;if(f(".sv"in s,"Unexpected leaf node or priority contents"),typeof s[".sv"]=="string")return md(s[".sv"],e,t);if(typeof s[".sv"]=="object")return fd(s[".sv"],e);f(!1,"Unexpected server value: "+JSON.stringify(s,null,2))},md=function(s,e,t){switch(s){case"timestamp":return t.timestamp;default:f(!1,"Unexpected server value: "+s)}},fd=function(s,e,t){s.hasOwnProperty("increment")||f(!1,"Unexpected server value: "+JSON.stringify(s,null,2));const n=s.increment;typeof n!="number"&&f(!1,"Unexpected increment value: "+n);const r=e.node();if(f(r!==null&&typeof r<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!r.isLeafNode())return n;const i=r.getValue();return typeof i!="number"?n:i+n},gd=function(s,e,t,n){return _s(e,new ps(t,s),n)},qo=function(s,e,t){return _s(s,new gs(e),t)};function _s(s,e,t){const n=s.getPriority().val(),r=_r(n,e.getImmediateChild(".priority"),t);let o;if(s.isLeafNode()){const i=s,a=_r(i.getValue(),e,t);return a!==i.getValue()||r!==i.getPriority().val()?new V(a,U(r)):s}else{const i=s;return o=i,r!==i.getPriority().val()&&(o=o.updatePriority(new V(r))),i.forEachChild(k,(a,c)=>{const l=_s(c,e.getImmediateChild(a),t);l!==c&&(o=o.updateImmediateChild(a,l))}),o}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vs{constructor(e="",t=null,n={children:{},childCount:0}){this.name=e,this.parent=t,this.node=n}}function ys(s,e){let t=e instanceof R?e:new R(e),n=s,r=M(t);for(;r!==null;){const o=$e(n.node.children,r)||{children:{},childCount:0};n=new vs(r,n,o),t=N(t),r=M(t)}return n}function Ke(s){return s.node.value}function Ho(s,e){s.node.value=e,Un(s)}function Wo(s){return s.node.childCount>0}function pd(s){return Ke(s)===void 0&&!Wo(s)}function cn(s,e){j(s.node.children,(t,n)=>{e(new vs(t,s,n))})}function jo(s,e,t,n){t&&e(s),cn(s,r=>{jo(r,e,!0)})}function _d(s,e,t){let n=s.parent;for(;n!==null;){if(e(n))return!0;n=n.parent}return!1}function At(s){return new R(s.parent===null?s.name:At(s.parent)+"/"+s.name)}function Un(s){s.parent!==null&&vd(s.parent,s.name,s)}function vd(s,e,t){const n=pd(t),r=ce(s.node.children,e);n&&r?(delete s.node.children[e],s.node.childCount--,Un(s)):!n&&!r&&(s.node.children[e]=t.node,s.node.childCount++,Un(s))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yd=/[\[\].#$\/\u0000-\u001F\u007F]/,bd=/[\[\].#$\u0000-\u001F\u007F]/,Cn=10*1024*1024,Go=function(s){return typeof s=="string"&&s.length!==0&&!yd.test(s)},Qo=function(s){return typeof s=="string"&&s.length!==0&&!bd.test(s)},Ed=function(s){return s&&(s=s.replace(/^\/*\.info(\/|$)/,"/")),Qo(s)},Cd=function(s,e,t,n){bs(Qn(s,"value"),e,t)},bs=function(s,e,t){const n=t instanceof R?new Uc(t,s):t;if(e===void 0)throw new Error(s+"contains undefined "+ve(n));if(typeof e=="function")throw new Error(s+"contains a function "+ve(n)+" with contents = "+e.toString());if(Hr(e))throw new Error(s+"contains "+e.toString()+" "+ve(n));if(typeof e=="string"&&e.length>Cn/3&&tn(e)>Cn)throw new Error(s+"contains a string greater than "+Cn+" utf8 bytes "+ve(n)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let r=!1,o=!1;if(j(e,(i,a)=>{if(i===".value")r=!0;else if(i!==".priority"&&i!==".sv"&&(o=!0,!Go(i)))throw new Error(s+" contains an invalid key ("+i+") "+ve(n)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);$c(n,i),bs(s,a,n),zc(n)}),r&&o)throw new Error(s+' contains ".value" child '+ve(n)+" in addition to actual children.")}},Yo=function(s,e,t,n){if(!Qo(t))throw new Error(Qn(s,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},Md=function(s,e,t,n){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),Yo(s,e,t)},wd=function(s,e){if(M(e)===".info")throw new Error(s+" failed = Can't modify data under /.info/")},Id=function(s,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!Go(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!Ed(t))throw new Error(Qn(s,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sd{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function Es(s,e){let t=null;for(let n=0;n<e.length;n++){const r=e[n],o=r.getPath();t!==null&&!es(o,t.path)&&(s.eventLists_.push(t),t=null),t===null&&(t={events:[],path:o}),t.events.push(r)}t&&s.eventLists_.push(t)}function Ko(s,e,t){Es(s,t),Jo(s,n=>es(n,e))}function te(s,e,t){Es(s,t),Jo(s,n=>X(n,e)||X(e,n))}function Jo(s,e){s.recursionDepth_++;let t=!0;for(let n=0;n<s.eventLists_.length;n++){const r=s.eventLists_[n];if(r){const o=r.path;e(o)?(Td(s.eventLists_[n]),s.eventLists_[n]=null):t=!1}}t&&(s.eventLists_=[]),s.recursionDepth_--}function Td(s){for(let e=0;e<s.events.length;e++){const t=s.events[e];if(t!==null){s.events[e]=null;const n=t.getEventRunner();rt&&z("event: "+t.toString()),Ye(n)}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ad="repo_interrupt",Rd=25;class Dd{constructor(e,t,n,r){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=n,this.appCheckProvider_=r,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new Sd,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=qt(),this.transactionQueueTree_=new vs,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function Nd(s,e,t){if(s.stats_=Xn(s.repoInfo_),s.forceRestClient_||uc())s.server_=new zt(s.repoInfo_,(n,r,o,i)=>{vr(s,n,r,o,i)},s.authTokenProvider_,s.appCheckProvider_),setTimeout(()=>yr(s,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{O(t)}catch(n){throw new Error("Invalid authOverride provided: "+n)}}s.persistentConnection_=new oe(s.repoInfo_,e,(n,r,o,i)=>{vr(s,n,r,o,i)},n=>{yr(s,n)},n=>{kd(s,n)},s.authTokenProvider_,s.appCheckProvider_,t),s.server_=s.persistentConnection_}s.authTokenProvider_.addTokenChangeListener(n=>{s.server_.refreshAuthToken(n)}),s.appCheckProvider_.addTokenChangeListener(n=>{s.server_.refreshAppCheckToken(n.token)}),s.statsReporter_=pc(s.repoInfo_,()=>new fl(s.stats_,s.server_)),s.infoData_=new ll,s.infoSyncTree_=new pr({startListening:(n,r,o,i)=>{let a=[];const c=s.infoData_.getNode(n._path);return c.isEmpty()||(a=St(s.infoSyncTree_,n._path,c),setTimeout(()=>{i("ok")},0)),a},stopListening:()=>{}}),Ms(s,"connected",!1),s.serverSyncTree_=new pr({startListening:(n,r,o,i)=>(s.server_.listen(n,o,r,(a,c)=>{const l=i(a,c);te(s.eventQueue_,n._path,l)}),[]),stopListening:(n,r)=>{s.server_.unlisten(n,r)}})}function Pd(s){const t=s.infoData_.getNode(new R(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function Cs(s){return hd({timestamp:Pd(s)})}function vr(s,e,t,n,r){s.dataUpdateCount++;const o=new R(e);t=s.interceptServerDataCallback_?s.interceptServerDataCallback_(e,t):t;let i=[];if(r)if(n){const c=Ot(t,l=>U(l));i=id(s.serverSyncTree_,o,c,r)}else{const c=U(t);i=Bo(s.serverSyncTree_,o,c,r)}else if(n){const c=Ot(t,l=>U(l));i=sd(s.serverSyncTree_,o,c)}else{const c=U(t);i=St(s.serverSyncTree_,o,c)}let a=o;i.length>0&&(a=dn(s,o)),te(s.eventQueue_,a,i)}function yr(s,e){Ms(s,"connected",e),e===!1&&Ld(s)}function kd(s,e){j(e,(t,n)=>{Ms(s,t,n)})}function Ms(s,e,t){const n=new R("/.info/"+e),r=U(t);s.infoData_.updateSnapshot(n,r);const o=St(s.infoSyncTree_,n,r);te(s.eventQueue_,n,o)}function Xo(s){return s.nextWriteId_++}function xd(s,e,t){const n=ad(s.serverSyncTree_,e);return n!=null?Promise.resolve(n):s.server_.get(e).then(r=>{const o=U(r).withIndex(e._queryParams.getIndex());Bn(s.serverSyncTree_,e,t,!0);let i;if(e._queryParams.loadsAllData())i=St(s.serverSyncTree_,e._path,o);else{const a=vt(s.serverSyncTree_,e);i=Bo(s.serverSyncTree_,e._path,o,a)}return te(s.eventQueue_,e._path,i),Jt(s.serverSyncTree_,e,t,null,!0),o},r=>(ln(s,"get for query "+O(e)+" failed: "+r),Promise.reject(new Error(r))))}function Od(s,e,t,n,r){ln(s,"set",{path:e.toString(),value:t,priority:n});const o=Cs(s),i=U(t,n),a=us(s.serverSyncTree_,e),c=qo(i,a,o),l=Xo(s),h=Vo(s.serverSyncTree_,e,c,l,!0);Es(s.eventQueue_,h),s.server_.put(e.toString(),i.val(!0),(u,m)=>{const p=u==="ok";p||W("set at "+e+" failed: "+u);const v=Ae(s.serverSyncTree_,l,!p);te(s.eventQueue_,e,v),Ud(s,r,u,m)});const d=si(s,e);dn(s,d),te(s.eventQueue_,d,[])}function Ld(s){ln(s,"onDisconnectEvents");const e=Cs(s),t=qt();xn(s.onDisconnect_,T(),(r,o)=>{const i=gd(r,o,s.serverSyncTree_,e);Co(t,r,i)});let n=[];xn(t,T(),(r,o)=>{n=n.concat(St(s.serverSyncTree_,r,o));const i=si(s,r);dn(s,i)}),s.onDisconnect_=qt(),te(s.eventQueue_,T(),n)}function Fd(s,e,t){let n;M(e._path)===".info"?n=Bn(s.infoSyncTree_,e,t):n=Bn(s.serverSyncTree_,e,t),Ko(s.eventQueue_,e._path,n)}function Vd(s,e,t){let n;M(e._path)===".info"?n=Jt(s.infoSyncTree_,e,t):n=Jt(s.serverSyncTree_,e,t),Ko(s.eventQueue_,e._path,n)}function Bd(s){s.persistentConnection_&&s.persistentConnection_.interrupt(Ad)}function ln(s,...e){let t="";s.persistentConnection_&&(t=s.persistentConnection_.id+":"),z(t,...e)}function Ud(s,e,t,n){e&&Ye(()=>{if(t==="ok")e(null);else{const r=(t||"error").toUpperCase();let o=r;n&&(o+=": "+n);const i=new Error(o);i.code=r,e(i)}})}function Zo(s,e,t){return us(s.serverSyncTree_,e,t)||y.EMPTY_NODE}function ws(s,e=s.transactionQueueTree_){if(e||un(s,e),Ke(e)){const t=ti(s,e);f(t.length>0,"Sending zero length transaction queue"),t.every(r=>r.status===0)&&$d(s,At(e),t)}else Wo(e)&&cn(e,t=>{ws(s,t)})}function $d(s,e,t){const n=t.map(l=>l.currentWriteId),r=Zo(s,e,n);let o=r;const i=r.hash();for(let l=0;l<t.length;l++){const h=t[l];f(h.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),h.status=1,h.retryCount++;const d=q(e,h.path);o=o.updateChild(d,h.currentOutputSnapshotRaw)}const a=o.val(!0),c=e;s.server_.put(c.toString(),a,l=>{ln(s,"transaction put response",{path:c.toString(),status:l});let h=[];if(l==="ok"){const d=[];for(let u=0;u<t.length;u++)t[u].status=2,h=h.concat(Ae(s.serverSyncTree_,t[u].currentWriteId)),t[u].onComplete&&d.push(()=>t[u].onComplete(null,!0,t[u].currentOutputSnapshotResolved)),t[u].unwatcher();un(s,ys(s.transactionQueueTree_,e)),ws(s,s.transactionQueueTree_),te(s.eventQueue_,e,h);for(let u=0;u<d.length;u++)Ye(d[u])}else{if(l==="datastale")for(let d=0;d<t.length;d++)t[d].status===3?t[d].status=4:t[d].status=0;else{W("transaction at "+c.toString()+" failed: "+l);for(let d=0;d<t.length;d++)t[d].status=4,t[d].abortReason=l}dn(s,e)}},i)}function dn(s,e){const t=ei(s,e),n=At(t),r=ti(s,t);return zd(s,r,n),n}function zd(s,e,t){if(e.length===0)return;const n=[];let r=[];const i=e.filter(a=>a.status===0).map(a=>a.currentWriteId);for(let a=0;a<e.length;a++){const c=e[a],l=q(t,c.path);let h=!1,d;if(f(l!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),c.status===4)h=!0,d=c.abortReason,r=r.concat(Ae(s.serverSyncTree_,c.currentWriteId,!0));else if(c.status===0)if(c.retryCount>=Rd)h=!0,d="maxretry",r=r.concat(Ae(s.serverSyncTree_,c.currentWriteId,!0));else{const u=Zo(s,c.path,i);c.currentInputSnapshot=u;const m=e[a].update(u.val());if(m!==void 0){bs("transaction failed: Data returned ",m,c.path);let p=U(m);typeof m=="object"&&m!=null&&ce(m,".priority")||(p=p.updatePriority(u.getPriority()));const S=c.currentWriteId,A=Cs(s),F=qo(p,u,A);c.currentOutputSnapshotRaw=p,c.currentOutputSnapshotResolved=F,c.currentWriteId=Xo(s),i.splice(i.indexOf(S),1),r=r.concat(Vo(s.serverSyncTree_,c.path,F,c.currentWriteId,c.applyLocally)),r=r.concat(Ae(s.serverSyncTree_,S,!0))}else h=!0,d="nodata",r=r.concat(Ae(s.serverSyncTree_,c.currentWriteId,!0))}te(s.eventQueue_,t,r),r=[],h&&(e[a].status=2,function(u){setTimeout(u,Math.floor(0))}(e[a].unwatcher),e[a].onComplete&&(d==="nodata"?n.push(()=>e[a].onComplete(null,!1,e[a].currentInputSnapshot)):n.push(()=>e[a].onComplete(new Error(d),!1,null))))}un(s,s.transactionQueueTree_);for(let a=0;a<n.length;a++)Ye(n[a]);ws(s,s.transactionQueueTree_)}function ei(s,e){let t,n=s.transactionQueueTree_;for(t=M(e);t!==null&&Ke(n)===void 0;)n=ys(n,t),e=N(e),t=M(e);return n}function ti(s,e){const t=[];return ni(s,e,t),t.sort((n,r)=>n.order-r.order),t}function ni(s,e,t){const n=Ke(e);if(n)for(let r=0;r<n.length;r++)t.push(n[r]);cn(e,r=>{ni(s,r,t)})}function un(s,e){const t=Ke(e);if(t){let n=0;for(let r=0;r<t.length;r++)t[r].status!==2&&(t[n]=t[r],n++);t.length=n,Ho(e,t.length>0?t:void 0)}cn(e,n=>{un(s,n)})}function si(s,e){const t=At(ei(s,e)),n=ys(s.transactionQueueTree_,e);return _d(n,r=>{Mn(s,r)}),Mn(s,n),jo(n,r=>{Mn(s,r)}),t}function Mn(s,e){const t=Ke(e);if(t){const n=[];let r=[],o=-1;for(let i=0;i<t.length;i++)t[i].status===3||(t[i].status===1?(f(o===i-1,"All SENT items should be at beginning of queue."),o=i,t[i].status=3,t[i].abortReason="set"):(f(t[i].status===0,"Unexpected transaction status in abort"),t[i].unwatcher(),r=r.concat(Ae(s.serverSyncTree_,t[i].currentWriteId,!0)),t[i].onComplete&&n.push(t[i].onComplete.bind(null,new Error("set"),!1,null))));o===-1?Ho(e,void 0):t.length=o+1,te(s.eventQueue_,At(e),r);for(let i=0;i<n.length;i++)Ye(n[i])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qd(s){let e="";const t=s.split("/");for(let n=0;n<t.length;n++)if(t[n].length>0){let r=t[n];try{r=decodeURIComponent(r.replace(/\+/g," "))}catch{}e+="/"+r}return e}function Hd(s){const e={};s.charAt(0)==="?"&&(s=s.substring(1));for(const t of s.split("&")){if(t.length===0)continue;const n=t.split("=");n.length===2?e[decodeURIComponent(n[0])]=decodeURIComponent(n[1]):W(`Invalid query segment '${t}' in query '${s}'`)}return e}const br=function(s,e){const t=Wd(s),n=t.namespace;t.domain==="firebase.com"&&ae(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!n||n==="undefined")&&t.domain!=="localhost"&&ae("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||nc();const r=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new no(t.host,t.secure,n,r,e,"",n!==t.subdomain),path:new R(t.pathString)}},Wd=function(s){let e="",t="",n="",r="",o="",i=!0,a="https",c=443;if(typeof s=="string"){let l=s.indexOf("//");l>=0&&(a=s.substring(0,l-1),s=s.substring(l+2));let h=s.indexOf("/");h===-1&&(h=s.length);let d=s.indexOf("?");d===-1&&(d=s.length),e=s.substring(0,Math.min(h,d)),h<d&&(r=qd(s.substring(h,d)));const u=Hd(s.substring(Math.min(s.length,d)));l=e.indexOf(":"),l>=0?(i=a==="https"||a==="wss",c=parseInt(e.substring(l+1),10)):l=e.length;const m=e.slice(0,l);if(m.toLowerCase()==="localhost")t="localhost";else if(m.split(".").length<=2)t=m;else{const p=e.indexOf(".");n=e.substring(0,p).toLowerCase(),t=e.substring(p+1),o=n}"ns"in u&&(o=u.ns)}return{host:e,port:c,domain:t,subdomain:n,secure:i,scheme:a,pathString:r,namespace:o}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jd{constructor(e,t,n,r){this.eventType=e,this.eventRegistration=t,this.snapshot=n,this.prevName=r}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+O(this.snapshot.exportVal())}}class Gd{constructor(e,t,n){this.eventRegistration=e,this.error=t,this.path=n}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ri{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return f(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Is{constructor(e,t,n,r){this._repo=e,this._path=t,this._queryParams=n,this._orderByCalled=r}get key(){return I(this._path)?null:ho(this._path)}get ref(){return new le(this._repo,this._path)}get _queryIdentifier(){const e=or(this._queryParams),t=Kn(e);return t==="{}"?"default":t}get _queryObject(){return or(this._queryParams)}isEqual(e){if(e=Ge(e),!(e instanceof Is))return!1;const t=this._repo===e._repo,n=es(this._path,e._path),r=this._queryIdentifier===e._queryIdentifier;return t&&n&&r}toJSON(){return this.toString()}toString(){return this._repo.toString()+Bc(this._path)}}class le extends Is{constructor(e,t){super(e,t,new rs,!1)}get parent(){const e=fo(this._path);return e===null?null:new le(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class yt{constructor(e,t,n){this._node=e,this.ref=t,this._index=n}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new R(e),n=$n(this.ref,e);return new yt(this._node.getChild(t),n,k)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(n,r)=>e(new yt(r,$n(this.ref,n),k)))}hasChild(e){const t=new R(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function Oe(s,e){return s=Ge(s),s._checkNotDeleted("ref"),e!==void 0?$n(s._root,e):s._root}function $n(s,e){return s=Ge(s),M(s._path)===null?Md("child","path",e):Yo("child","path",e),new le(s._repo,L(s._path,e))}function Er(s,e){s=Ge(s),wd("set",s._path),Cd("set",e,s._path);const t=new en;return Od(s._repo,s._path,e,null,t.wrapCallback(()=>{})),t.promise}function Cr(s){s=Ge(s);const e=new ri(()=>{}),t=new hn(e);return xd(s._repo,s,t).then(n=>new yt(n,new le(s._repo,s._path),s._queryParams.getIndex()))}class hn{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const n=t._queryParams.getIndex();return new jd("value",this,new yt(e.snapshotNode,new le(t._repo,t._path),n))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new Gd(this,e,t):null}matches(e){return e instanceof hn?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}function Qd(s,e,t,n,r){const o=new ri(t,void 0),i=new hn(o);return Fd(s._repo,s,i),()=>Vd(s._repo,s,i)}function Mr(s,e,t,n){return Qd(s,"value",e)}Yl(le);ed(le);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yd="FIREBASE_DATABASE_EMULATOR_HOST",zn={};let Kd=!1;function Jd(s,e,t,n){const r=e.lastIndexOf(":"),o=e.substring(0,r),i=Gn(o);s.repoInfo_=new no(e,i,s.repoInfo_.namespace,s.repoInfo_.webSocketOnly,s.repoInfo_.nodeAdmin,s.repoInfo_.persistenceKey,s.repoInfo_.includeNamespaceInQueryParams,!0,t),n&&(s.authTokenProvider_=n)}function Xd(s,e,t,n,r){let o=n||s.options.databaseURL;o===void 0&&(s.options.projectId||ae("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),z("Using default host for project ",s.options.projectId),o=`${s.options.projectId}-default-rtdb.firebaseio.com`);let i=br(o,r),a=i.repoInfo,c;typeof process<"u"&&$s&&(c=$s[Yd]),c?(o=`http://${c}?ns=${a.namespace}`,i=br(o,r),a=i.repoInfo):i.repoInfo.secure;const l=new mc(s.name,s.options,e);Id("Invalid Firebase Database URL",i),I(i.path)||ae("Database URL must point to the root of a Firebase Database (not including a child path).");const h=eu(a,s,l,new hc(s,t));return new tu(h,s)}function Zd(s,e){const t=zn[e];(!t||t[s.key]!==s)&&ae(`Database ${e}(${s.repoInfo_}) has already been deleted.`),Bd(s),delete t[s.key]}function eu(s,e,t,n){let r=zn[e.name];r||(r={},zn[e.name]=r);let o=r[s.toURLString()];return o&&ae("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),o=new Dd(s,Kd,t,n),r[s.toURLString()]=o,o}class tu{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(Nd(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new le(this._repo,T())),this._rootInternal}_delete(){return this._rootInternal!==null&&(Zd(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&ae("Cannot call "+e+" on a deleted database.")}}function nu(s=Fa(),e){const t=Pa(s,"database").getImmediate({identifier:e});if(!t._instanceStarted){const n=_i("database");n&&su(t,...n)}return t}function su(s,e,t,n={}){s=Ge(s),s._checkNotDeleted("useEmulator");const r=`${e}:${t}`,o=s._repoInternal;if(s._instanceStarted){if(r===s._repoInternal.repoInfo_.host&&Lt(n,o.repoInfo_.emulatorOptions))return;ae("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let i;if(o.repoInfo_.nodeAdmin)n.mockUserToken&&ae('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),i=new Pt(Pt.OWNER);else if(n.mockUserToken){const a=typeof n.mockUserToken=="string"?n.mockUserToken:yi(n.mockUserToken,s.app.options.projectId);i=new Pt(a)}Gn(e)&&(vi(e),Ci("Database",!0)),Jd(o,r,n,i)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ru(s){Ka(La),Vt(new dt("database",(e,{instanceIdentifier:t})=>{const n=e.getProvider("app").getImmediate(),r=e.getProvider("auth-internal"),o=e.getProvider("app-check-internal");return Xd(n,r,o,t)},"PUBLIC").setMultipleInstances(!0)),Ve(zs,qs,s),Ve(zs,qs,"esm2020")}oe.prototype.simpleListen=function(s,e){this.sendRequest("q",{p:s},e)};oe.prototype.echo=function(s,e){this.sendRequest("echo",{d:s},e)};ru();const qn={apiKey:"AIzaSyAfyPxvTvE7uLcpg84RU9FHjNtMFY60-WE",authDomain:"sistema-eleicao-igreja.firebaseapp.com",databaseURL:"https://sistema-eleicao-igreja-default-rtdb.firebaseio.com",projectId:"sistema-eleicao-igreja",storageBucket:"sistema-eleicao-igreja.firebasestorage.app",messagingSenderId:"98688924231",appId:"1:98688924231:web:01ddbbbf400393c2838f62"},nt=!qn.apiKey.includes("COLE_AQUI");let wr=null,Y=null;if(nt)try{wr=Vr(qn),Y=nu(wr),console.log("✅ Firebase inicializado com sucesso!"),console.log(`📡 Database URL: ${qn.databaseURL}`)}catch(s){console.error("❌ Erro ao inicializar Firebase:",s)}else console.warn("⚠️ Firebase não configurado!"),console.warn("📝 Abra src/config/firebase.ts e adicione suas credenciais"),console.warn("📚 Veja docs/CONFIGURACAO-FIREBASE-PASSO-A-PASSO.md");var x=(s=>(s.MEMBERS="MEMBERS",s.CONFIG="CONFIG",s))(x||{}),C=(s=>(s.MEMBER_ADDED="members:added",s.MEMBER_UPDATED="members:updated",s.MEMBER_DELETED="members:deleted",s.MEMBERS_IMPORTED="members:imported",s.CANDIDATE_ADDED="candidate:added",s.VOTE_CAST="vote:cast",s.RESULTS_UPDATED="results:updated",s.ATTENDANCE_MARKED="attendance:marked",s.ATTENDANCE_BULK_UPDATED="attendance:bulk-updated",s.ATTENDANCE_SAVED="attendance:saved",s.QUORUM_UPDATED="quorum:updated",s.QUORUM_CONFIG_REQUIRED="quorum:config:required",s.ERROR_OCCURRED="error:occurred",s.APP_INITIALIZED="app:initialized",s.APP_RESET="app:reset",s.SYNC_MEMBERS_UPDATED="sync:members:updated",s.SYNC_CONFIG_UPDATED="sync:config:updated",s))(C||{});const be=class be{constructor(){E(this,"eventSystem",Re.getInstance());E(this,"sessionId");E(this,"isEnabled",!1);E(this,"listeners",new Map);this.sessionId=`session-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,nt||console.warn("[RealtimeSync] Firebase não configurado - sincronização desabilitada")}static getInstance(){return be.instance||(be.instance=new be),be.instance}enable(){if(!nt||!Y){console.warn("[RealtimeSync] Não é possível ativar - Firebase não configurado");return}if(this.isEnabled){console.log("[RealtimeSync] Já está ativado");return}this.isEnabled=!0,this.setupListeners(),console.log(`[RealtimeSync] ✅ Ativado (Session: ${this.sessionId})`)}disable(){this.isEnabled=!1,this.removeAllListeners(),console.log("[RealtimeSync] ⏸️ Desativado")}isActive(){return this.isEnabled&&nt}async syncMembers(e){if(console.log("[RealtimeSync] 🔄 syncMembers chamado..."),!this.isActive()){console.warn("[RealtimeSync] ⚠️ Firebase está INATIVO! Sincronização ignorada.");return}if(!Y){console.warn("[RealtimeSync] ⚠️ Firebase database NÃO INICIALIZADO! Sincronização ignorada.");return}try{console.log(`[RealtimeSync] 📤 Sincronizando ${e.length} membros para Firebase...`);const t=Oe(Y,"members");await Er(t,{data:e,updatedBy:this.sessionId,timestamp:Date.now()}),console.log(`[RealtimeSync] ✅ ${e.length} membros sincronizados com sucesso!`)}catch(t){console.error("[RealtimeSync] ❌ ERRO ao sincronizar membros:",t)}}async syncConfig(e){if(!(!this.isActive()||!Y))try{const t=Oe(Y,"config"),n="quorum"in e?e:{quorum:e};await Er(t,{data:n,updatedBy:this.sessionId,timestamp:Date.now()}),console.log("[RealtimeSync] ✓ Configuração sincronizada")}catch(t){console.error("[RealtimeSync] ✗ Erro ao sincronizar configuração:",t)}}async loadInitialState(){var e;if(!this.isActive()||!Y)return console.log("[RealtimeSync] ⚠️ Firebase inativo ou não configurado"),{members:null,config:null};try{const[t,n]=await Promise.all([Cr(Oe(Y,"members/data")),Cr(Oe(Y,"config/data"))]);return console.log("[RealtimeSync] 🐛 DEBUG loadInitialState:",{membersExists:t.exists(),configExists:n.exists(),membersVal:t.exists()?`${((e=t.val())==null?void 0:e.length)||0} items`:null,configVal:n.exists()?"exists":null}),{members:t.exists()?t.val():null,config:n.exists()?n.val():null}}catch(t){return console.error("[RealtimeSync] ✗ Erro ao carregar estado inicial:",t),{members:null,config:null}}}setupListeners(){if(!Y)return;const e=Oe(Y,"members"),t=Mr(e,o=>{if(o.exists()){const i=o.val();i.updatedBy!==this.sessionId&&(console.log("[RealtimeSync] 🔄 Membros atualizados remotamente"),this.eventSystem.emit(C.SYNC_MEMBERS_UPDATED,i.data))}});this.listeners.set("members",t);const n=Oe(Y,"config"),r=Mr(n,o=>{if(o.exists()){const i=o.val();i&&i.updatedBy!==this.sessionId&&(console.log("[RealtimeSync] 🔄 Configuração atualizada remotamente"),this.eventSystem.emit(C.SYNC_CONFIG_UPDATED,i.data))}});this.listeners.set("config",r),console.log("[RealtimeSync] 👂 Listeners configurados (2)")}removeAllListeners(){this.listeners.forEach(e=>{e()}),this.listeners.clear(),console.log("[RealtimeSync] 🔇 Listeners removidos")}getStatus(){return{enabled:this.isEnabled,configured:nt,sessionId:this.sessionId,listeners:this.listeners.size}}};E(be,"instance");let K=be;class Xt{constructor(e=5*60*1e3){E(this,"cache",new Map);E(this,"defaultTTL");this.defaultTTL=e}set(e,t,n){const r={data:t,timestamp:new Date,ttl:n??this.defaultTTL};this.cache.set(e,r)}get(e){const t=this.cache.get(e);return t?Date.now()-t.timestamp.getTime()>t.ttl?(this.cache.delete(e),null):t.data:null}clear(){this.cache.clear()}cleanup(){const e=Date.now();for(const[t,n]of this.cache.entries())e-n.timestamp.getTime()>n.ttl&&this.cache.delete(t)}size(){return this.cache.size}}function ou(s,e){let t;return(...n)=>{clearTimeout(t),t=window.setTimeout(()=>s(...n),e)}}class Fe{static required(e){const t=e!=null&&e!=="";return{isValid:t,errors:t?[]:["Campo obrigatório"]}}static email(e){const n=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);return{isValid:n,errors:n?[]:["Email inválido"]}}static cpf(e){const t=e.replace(/\D/g,"");if(t.length!==11)return{isValid:!1,errors:["CPF deve ter 11 dígitos"]};if(/^(\d)\1{10}$/.test(t))return{isValid:!1,errors:["CPF inválido"]};let n=0;for(let o=0;o<9;o++)n+=parseInt(t.charAt(o))*(10-o);let r=11-n%11;if((r===10||r===11)&&(r=0),r!==parseInt(t.charAt(9)))return{isValid:!1,errors:["CPF inválido"]};n=0;for(let o=0;o<10;o++)n+=parseInt(t.charAt(o))*(11-o);return r=11-n%11,(r===10||r===11)&&(r=0),r!==parseInt(t.charAt(10))?{isValid:!1,errors:["CPF inválido"]}:{isValid:!0,errors:[]}}static combine(...e){const t=e.flatMap(n=>n.errors);return{isValid:t.length===0,errors:t}}static isValidCPF(e){return e?this.cpf(e).isValid:!0}static isValidEmail(e){return e?this.email(e).isValid:!0}}class se{static cpf(e){return e.replace(/\D/g,"").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4")}static rg(e){return e.replace(/\D/g,"").replace(/(\d{2})(\d{3})(\d{3})(\d{1})/,"$1.$2.$3-$4")}static phone(e){const t=e.replace(/\D/g,"");return t.length===11?t.replace(/(\d{2})(\d{5})(\d{4})/,"($1) $2-$3"):t.replace(/(\d{2})(\d{4})(\d{4})/,"($1) $2-$3")}static date(e){return new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(e)}}function Ir(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}class _{static log(e,t){const n=typeof e=="string"?new Error(e):e;this.errors.push({error:n,timestamp:new Date,context:t}),console.error(`[${t||"System"}]`,n),this.errors.length>100&&(this.errors=this.errors.slice(-100))}static getErrors(){return[...this.errors]}static clearErrors(){this.errors=[]}}E(_,"errors",[]);const tt={log:(s,...e)=>{},warn:(s,...e)=>{},error:(...s)=>{console.error(...s)},trace:(s,...e)=>{}},Ee=class Ee{constructor(){E(this,"cache",new Xt);E(this,"eventSystem",Re.getInstance())}static getInstance(){return Ee.instance||(Ee.instance=new Ee),Ee.instance}async getMembers(){try{const e=this.cache.get("all-members");if(e)return e;const t=localStorage.getItem(x.MEMBERS),n=t&&t!=="undefined"&&t!=="null"?JSON.parse(t):[];return this.cache.set("all-members",n),n}catch(e){return _.log(e,"MemberManager.getMembers"),[]}}async getMember(e){try{return(await this.getMembers()).find(n=>n.id===e)||null}catch(t){return _.log(t,"MemberManager.getMember"),null}}async addMember(e){try{const t=this.validateMember(e);if(!t.isValid)return{success:!1,error:t.errors.join(", ")};if(e.candidato&&e.candidato!==null&&e.tipo!=="Membro Comungante")return{success:!1,error:"Apenas Membros Comungantes podem ser candidatos a Presbítero ou Diácono"};const n=await this.getMembers();if(n.find(a=>a.nome===e.nome||e.cpf&&a.cpf===e.cpf))return{success:!1,error:"Membro já existe"};const o={id:Ir(),...e,cpf:e.cpf?se.cpf(e.cpf):void 0,rg:e.rg?se.rg(e.rg):void 0,telefone:e.telefone?se.phone(e.telefone):void 0};if(o.candidato&&(o.candidato==="Presbítero"||o.candidato==="Diácono"))try{const{VotingManager:a}=await ne(async()=>{const{VotingManager:l}=await Promise.resolve().then(()=>Nt);return{VotingManager:l}},void 0);a.getInstance().clearCache(),console.log("[MemberManager] ✅ Cache limpo ANTES de adicionar (candidato detectado)")}catch(a){_.log(a,"MemberManager.addMember - limpar cache")}const i=[...n,o];if(await this.saveMembers(i),this.eventSystem.emit(C.MEMBER_ADDED,o),console.log(`[MemberManager] ✅ Membro adicionado e evento emitido: ${o.nome}`),o.tipo==="Visitante"||o.tipo==="Membro Não-Comungante")try{const{AttendanceManager:a}=await ne(async()=>{const{AttendanceManager:l}=await Promise.resolve().then(()=>kt);return{AttendanceManager:l}},void 0);await a.getInstance().markPresence(o.id,!0)}catch(a){_.log(a,"MemberManager.addMember.markNonVotingMemberPresent")}return{success:!0,data:o}}catch(t){return _.log(t,"MemberManager.addMember"),{success:!1,error:"Erro interno ao adicionar membro"}}}async importFromCSV(e){try{const t=e.trim().split(`
`),n=t[0].split(",").map(l=>l.trim().toLowerCase());let r=0,o=0;const i=[];if(!n.includes("nome"))return{success:!1,totalProcessed:t.length-1,membersAdded:0,candidatesAdded:0,errors:['Header "nome" é obrigatório']};const a=await this.getMembers(),c=[];tt.log("CSV_IMPORT","[CSV Import] Total de linhas:",t.length),tt.log("CSV_IMPORT","[CSV Import] Headers:",n);for(let l=1;l<t.length;l++)try{const h=this.parseCSVLine(t[l]);tt.log("CSV_IMPORT",`[CSV Import] Linha ${l}:`,h);const d=this.mapCSVToMember(n,h);tt.log("CSV_IMPORT",`[CSV Import] Membro mapeado ${l}:`,d);const u=this.validateMember(d);if(!u.isValid){tt.warn("CSV_IMPORT",`[CSV Import] Validação falhou linha ${l+1}:`,u.errors),i.push(`Linha ${l+1}: ${u.errors.join(", ")}`);continue}const m=A=>(A==null?void 0:A.replace(/\D/g,""))||"",p=m(d.cpf);if(a.some(A=>A.nome.toLowerCase()===d.nome.toLowerCase()||p&&m(A.cpf)===p)||c.some(A=>A.nome.toLowerCase()===d.nome.toLowerCase()||p&&m(A.cpf)===p)){console.warn(`[CSV Import] Duplicata detectada linha ${l+1}`),i.push(`Linha ${l+1}: Membro já existe`);continue}const S={id:Ir(),...d,cpf:d.cpf?se.cpf(d.cpf):void 0,rg:d.rg?se.rg(d.rg):void 0,telefone:d.telefone?se.phone(d.telefone):void 0};console.log(`[CSV Import] Membro criado linha ${l}:`,S),c.push(S),r++,S.candidato&&(console.log("[CSV Import] Membro é candidato:",S.nome,S.candidato),o++)}catch(h){console.error(`[CSV Import] Erro ao processar linha ${l+1}:`,h),i.push(`Linha ${l+1}: Erro ao processar dados`)}if(console.log("[CSV Import] Total de novos membros:",c.length),console.log("[CSV Import] Candidatos detectados:",o),c.length>0){const l=[...a,...c];await this.saveMembers(l),c.forEach(v=>{this.eventSystem.emit(C.MEMBER_ADDED,v)}),console.log("[CSV Import] Iniciando criação de candidatos...");const{VotingManager:h}=await ne(async()=>{const{VotingManager:v}=await Promise.resolve().then(()=>Nt);return{VotingManager:v}},void 0),d=h.getInstance(),u=c.filter(v=>v.candidato&&(v.candidato==="Presbítero"||v.candidato==="Diácono")).length;u>0&&(d.clearCache(),console.log(`[CSV Import] ${u} candidatos importados, cache limpo`)),console.log("[CSV Import] Iniciando marcação de membros não-votantes...");const{AttendanceManager:m}=await ne(async()=>{const{AttendanceManager:v}=await Promise.resolve().then(()=>kt);return{AttendanceManager:v}},void 0),p=m.getInstance();for(const v of c)if(v.tipo==="Visitante"||v.tipo==="Membro Não-Comungante"){console.log(`[CSV Import] Marcando como presente (${v.tipo}): ${v.nome}`);try{await p.markPresence(v.id,!0),console.log(`[CSV Import] ✓ Membro marcado: ${v.nome}`)}catch(S){console.error(`[CSV Import] ✗ Erro ao marcar membro ${v.nome}:`,S)}}console.log("[CSV Import] Marcação de membros não-votantes concluída")}return{success:!0,totalProcessed:t.length-1,membersAdded:r,candidatesAdded:o,errors:i}}catch(t){return _.log(t,"MemberManager.importFromCSV"),{success:!1,totalProcessed:0,membersAdded:0,candidatesAdded:0,errors:["Erro interno na importação"]}}}validateMember(e){const t=[Fe.required(e.nome)];if(console.log("[CSV Import] Validando membro:",{nome:e.nome,cpf:e.cpf,email:e.email,hasCpf:!!e.cpf,hasEmail:!!e.email}),e.candidato&&e.tipo!=="Membro Comungante")return{isValid:!1,errors:["Apenas Membros Comungantes podem ser candidatos"]};if(e.cpf&&e.cpf.trim()!==""){const r=Fe.cpf(e.cpf);console.log(`[CSV Import] Validação CPF "${e.cpf}":`,r),t.push(r)}if(e.email&&e.email.trim()!==""){const r=Fe.email(e.email);console.log(`[CSV Import] Validação Email "${e.email}":`,r),t.push(r)}const n=Fe.combine(...t);return console.log("[CSV Import] Resultado validação final:",n),n}parseCSVLine(e){const t=[];let n="",r=!1;for(let o=0;o<e.length;o++){const i=e[o];if(i==='"'){r=!r;continue}else i===","&&!r?(t.push(n.trim()),n=""):n+=i}return t.push(n.trim()),t}mapCSVToMember(e,t){const n={};return e.forEach((r,o)=>{var a;const i=((a=t[o])==null?void 0:a.trim())||"";switch(r){case"nome":n.nome=i;break;case"tipo":i&&(n.tipo=i);break;case"cpf":i&&(n.cpf=i);break;case"rg":i&&(n.rg=i);break;case"candidato":i&&(n.candidato=i);break;case"email":i&&(n.email=i);break;case"telefone":i&&(n.telefone=i);break}}),n}async saveMembers(e){console.log("[MemberManager] 💾 Iniciando saveMembers..."),console.log("[MemberManager] 1️⃣ Atualizando memory cache..."),this.cache.set("all-members",e),console.log("[MemberManager] ✅ Memory cache atualizado!"),console.log("[MemberManager] 2️⃣ Atualizando localStorage..."),localStorage.setItem(x.MEMBERS,JSON.stringify(e)),console.log("[MemberManager] ✅ localStorage atualizado!"),console.log("[MemberManager] 3️⃣ Sincronizando com Firebase..."),K.getInstance().syncMembers(e),console.log("[MemberManager] ✅ Sincronização Firebase iniciada!")}async updateMember(e,t){try{const n=await this.getMembers(),r=n.findIndex(d=>d.id===e);if(r===-1)return{success:!1,error:"Membro não encontrado"};const o=n[r];if(t.candidato&&t.candidato!==null&&(t.tipo||o.tipo)!=="Membro Comungante")return{success:!1,error:"Apenas Membros Comungantes podem ser candidatos a Presbítero ou Diácono"};const i={...o,...t,id:e},a=[...n];a[r]=i;const c=o.candidato,l=i.candidato;if(c||l)try{const{VotingManager:d}=await ne(async()=>{const{VotingManager:m}=await Promise.resolve().then(()=>Nt);return{VotingManager:m}},void 0);d.getInstance().clearCache(),console.log("[MemberManager] ✅ Cache limpo ANTES de salvar (candidato detectado)")}catch(d){_.log(d,"MemberManager.updateMember - limpar cache")}return await this.saveMembers(a),this.eventSystem.emit(C.MEMBER_UPDATED,i),console.log(`[MemberManager] ✅ Membro atualizado e evento emitido: ${i.nome}`),{success:!0,data:i}}catch(n){return _.log(n,"MemberManager.updateMember"),{success:!1,error:"Erro interno ao atualizar membro"}}}async deleteMember(e){try{const t=await this.getMembers(),n=t.find(o=>o.id===e),r=t.filter(o=>o.id!==e);if(t.length===r.length)return{success:!1,error:"Membro não encontrado"};if(n!=null&&n.candidato)try{const{VotingManager:o}=await ne(async()=>{const{VotingManager:a}=await Promise.resolve().then(()=>Nt);return{VotingManager:a}},void 0);o.getInstance().clearCache(),console.log("[MemberManager] ✅ Cache limpo ANTES de deletar (candidato detectado)")}catch(o){_.log(o,"MemberManager.deleteMember - limpar cache")}await this.saveMembers(r);try{const{AttendanceManager:o}=await ne(async()=>{const{AttendanceManager:a}=await Promise.resolve().then(()=>kt);return{AttendanceManager:a}},void 0);await o.getInstance().removeMemberAttendance(e)}catch(o){_.log(o,"MemberManager.deleteMember - remover presença")}return this.eventSystem.emit(C.MEMBER_DELETED,e),console.log(`[MemberManager] ✅ Membro deletado e evento emitido: ${(n==null?void 0:n.nome)||e}`),{success:!0}}catch(t){return _.log(t,"MemberManager.deleteMember"),{success:!1,error:"Erro interno ao deletar membro"}}}async loadFromStorage(){this.cache.clear(),await this.getMembers()}async clearAll(){localStorage.removeItem(x.MEMBERS),this.cache.clear()}async getMemberCount(){return(await this.getMembers()).length}async getCandidates(){return(await this.getMembers()).filter(t=>t.candidato)}async searchMembers(e){const t=await this.getMembers(),n=e.toLowerCase();return t.filter(r=>{var o,i,a;return r.nome.toLowerCase().includes(n)||((o=r.cpf)==null?void 0:o.includes(e))||((i=r.rg)==null?void 0:i.includes(e))||((a=r.email)==null?void 0:a.toLowerCase().includes(n))})}async updateMemberVotes(e,t){try{const n=await this.getMembers(),r=n.find(l=>l.id===e);if(!r)return{success:!1,error:"Membro não encontrado"};if(!r.candidato)return{success:!1,error:"Membro não é candidato"};const o=r.votes||0,i=Math.max(0,o+t),a={...r,votes:i},c=n.map(l=>l.id===e?a:l);return console.log(`[MemberManager] 💾 Salvando membros atualizados... (${r.nome}: ${o} → ${i})`),await this.saveMembers(c),console.log("[MemberManager] ✅ Membros salvos com sucesso!"),console.log(`[MemberManager] ✅ Votos atualizados: ${r.nome} (${o} → ${i})`),{success:!0,data:a}}catch(n){return _.log(n,"MemberManager.updateMemberVotes"),{success:!1,error:"Erro ao atualizar votos"}}}async markMemberVoted(e,t){try{const n=await this.getMembers(),r=n.find(a=>a.id===e);if(!r)return{success:!1,error:"Membro não encontrado"};if(r.tipo!=="Membro Comungante")return{success:!1,error:"Apenas Membros Comungantes podem votar"};if(!r.presente)return{success:!1,error:"Membro deve estar presente para votar"};const o={...r,jaVotou:!0,votedFor:t},i=n.map(a=>a.id===e?o:a);return await this.saveMembers(i),console.log(`[MemberManager] ✅ Membro marcado como votou: ${r.nome}`),{success:!0,data:o}}catch(n){return _.log(n,"MemberManager.markMemberVoted"),{success:!1,error:"Erro ao marcar membro como votou"}}}async toggleMemberPresence(e){try{const t=await this.getMembers(),n=t.find(l=>l.id===e);if(!n)return{success:!1,error:"Membro não encontrado"};const r=!n.presente,o=new Date,i=r?se.date(o):null,a={...n,presente:r,horarioChegada:i},c=t.map(l=>l.id===e?a:l);return await this.saveMembers(c),this.eventSystem.emit(C.ATTENDANCE_MARKED,{memberId:e,present:r,timestamp:o}),console.log(`[MemberManager] ✅ Presença alternada: ${n.nome} (${n.presente} → ${r})`),{success:!0,data:a}}catch(t){return _.log(t,"MemberManager.toggleMemberPresence"),{success:!1,error:"Erro ao alternar presença"}}}async getCandidatesByRole(e){try{let n=(await this.getMembers()).filter(r=>r.candidato!==null&&r.candidato!==void 0);return e&&(n=n.filter(r=>r.candidato===e)),n}catch(t){return _.log(t,"MemberManager.getCandidatesByRole"),[]}}async getPresentMembers(){try{return(await this.getMembers()).filter(t=>t.presente===!0)}catch(e){return _.log(e,"MemberManager.getPresentMembers"),[]}}async getVoters(){try{return(await this.getMembers()).filter(t=>t.jaVotou===!0)}catch(e){return _.log(e,"MemberManager.getVoters"),[]}}async validateVoterEligibility(e){try{const t=await this.getMember(e);if(!t)return{isValid:!1,errors:["Membro não encontrado"]};const n=[];return t.tipo!=="Membro Comungante"&&n.push("Apenas Membros Comungantes podem votar"),t.presente||n.push("Membro deve estar presente para votar"),t.jaVotou&&n.push("Membro já votou"),{isValid:n.length===0,errors:n}}catch(t){return _.log(t,"MemberManager.validateVoterEligibility"),{isValid:!1,errors:["Erro ao validar elegibilidade"]}}}};E(Ee,"instance");let We=Ee;const Ce=class Ce{constructor(){E(this,"candidatesCache",new Xt);E(this,"votesCache",new Xt);E(this,"eventSystem",Re.getInstance());E(this,"memberManager",We.getInstance());E(this,"updateResults",ou(this._updateResults.bind(this),150))}static getInstance(){return Ce.instance||(Ce.instance=new Ce),Ce.instance}async getCandidates(e){try{const t=e||"all",n=this.candidatesCache.get(t);if(n)return console.log(`[VotingManager.getCandidates] ⚡ Retornando ${n.length} candidatos do cache (key: ${t})`),n;console.log(`[VotingManager.getCandidates] 🔄 Cache vazio, buscando de MEMBERS (key: ${t})`);let o=(await this.memberManager.getMembers()).filter(a=>a.candidato!==null&&a.candidato!==void 0);e&&(o=o.filter(a=>a.candidato===e));const i=o.map(a=>({id:a.id,name:a.nome,role:a.candidato,photoUrl:a.photoUrl,votes:a.votes||0,isElected:a.isElected||!1}));return this.candidatesCache.set(t,i),console.log(`[DEBUG VotingManager.getCandidates] ${i.length} candidatos carregados de MEMBERS`),i}catch(t){return _.log(t,"VotingManager.getCandidates"),[]}}async castVote(e,t){var n;try{const r=await this.getQuorumData();if(!r.isValid)return{success:!1,error:`Quórum não atingido. Necessário: ${r.minimumQuorum}, Presente: ${r.presentMembers}`};const o=await this.memberManager.validateVoterEligibility(t);if(!o.isValid)return{success:!1,error:o.errors.join(", ")};const i=await this.memberManager.getMember(e);if(!i||!i.candidato)return{success:!1,error:"Candidato não encontrado"};const a=await this.memberManager.updateMemberVotes(e,1);if(!a.success)return{success:!1,error:a.error||"Erro ao registrar voto"};const c=await this.memberManager.markMemberVoted(t,[e]);if(!c.success)return await this.memberManager.updateMemberVotes(e,-1),{success:!1,error:c.error||"Erro ao marcar eleitor"};console.log("[VotingManager] 🗑️ Limpando cache de candidatos..."),this.candidatesCache.clear(),console.log("[VotingManager] ✅ Cache limpo!"),console.log("[VotingManager] 📡 Emitindo evento VOTE_CAST..."),this.eventSystem.emit(C.VOTE_CAST,{candidateId:e,memberId:t}),console.log("[VotingManager] 📊 Atualizando resultados..."),this.updateResults();const l={candidateId:e,votes:((n=a.data)==null?void 0:n.votes)||0,lastUpdated:new Date};return console.log(`[VotingManager] ✅ Voto registrado: ${i.nome} agora tem ${l.votes} votos`),{success:!0,data:l}}catch(r){return _.log(r,"VotingManager.castVote"),{success:!1,error:"Erro interno ao computar voto"}}}async incrementVoteProjection(e){var t;try{console.log("[VotingManager] 🎥 Incrementando voto (projeção):",e);const n=await this.memberManager.getMember(e);if(!n||!n.candidato)return{success:!1,error:"Candidato não encontrado"};const o=(await this.getQuorumData()).presentMembers;if((n.votes||0)>=o)return{success:!1,error:"Número máximo atingido"};const a=await this.memberManager.updateMemberVotes(e,1);if(!a.success)return{success:!1,error:a.error||"Erro ao registrar voto"};this.candidatesCache.clear(),this.eventSystem.emit(C.VOTE_CAST,{candidateId:e,memberId:"projection"}),this.updateResults();const c={candidateId:e,votes:((t=a.data)==null?void 0:t.votes)||0,lastUpdated:new Date};return console.log(`[VotingManager] ✅ Voto incrementado (projeção): ${n.nome} = ${c.votes} votos`),{success:!0,data:c}}catch(n){return _.log(n,"VotingManager.incrementVoteProjection"),{success:!1,error:"Erro ao incrementar voto"}}}async decrementVoteProjection(e){var t;try{console.log("[VotingManager] 🎥 Decrementando voto (projeção):",e);const n=await this.memberManager.getMember(e);if(!n||!n.candidato)return{success:!1,error:"Candidato não encontrado"};if(!n.votes||n.votes===0)return{success:!1,error:"Candidato não possui votos para remover"};const r=await this.memberManager.updateMemberVotes(e,-1);if(!r.success)return{success:!1,error:r.error||"Erro ao remover voto"};this.candidatesCache.clear(),this.eventSystem.emit(C.VOTE_CAST,{candidateId:e,memberId:"projection"}),this.updateResults();const o={candidateId:e,votes:((t=r.data)==null?void 0:t.votes)||0,lastUpdated:new Date};return console.log(`[VotingManager] ✅ Voto decrementado (projeção): ${n.nome} = ${o.votes} votos`),{success:!0,data:o}}catch(n){return _.log(n,"VotingManager.decrementVoteProjection"),{success:!1,error:"Erro ao decrementar voto"}}}async resetVotesProjection(e){try{console.log("[VotingManager] 🎥 Resetando votos (projeção):",e);const t=await this.memberManager.getMember(e);if(!t||!t.candidato)return{success:!1,error:"Candidato não encontrado"};const n=t.votes||0;if(n===0)return{success:!0,data:{candidateId:e,votes:0,lastUpdated:new Date}};const r=await this.memberManager.updateMemberVotes(e,-n);if(!r.success)return{success:!1,error:r.error||"Erro ao resetar votos"};this.candidatesCache.clear(),this.eventSystem.emit(C.VOTE_CAST,{candidateId:e,memberId:"projection"}),this.updateResults();const o={candidateId:e,votes:0,lastUpdated:new Date};return console.log(`[VotingManager] ✅ Votos resetados (projeção): ${t.nome} = 0 votos`),{success:!0,data:o}}catch(t){return _.log(t,"VotingManager.resetVotesProjection"),{success:!1,error:"Erro ao resetar votos"}}}async removeVote(e,t){var n;try{const r=await this.memberManager.getMember(e);if(!r||!r.candidato)return{success:!1,error:"Candidato não encontrado"};if(!r.votes||r.votes<=0)return{success:!1,error:"Nenhum voto para remover"};const o=await this.memberManager.updateMemberVotes(e,-1);if(!o.success)return{success:!1,error:o.error||"Erro ao remover voto"};this.candidatesCache.clear(),this.eventSystem.emit(C.VOTE_CAST,{candidateId:e,memberId:t}),this.updateResults();const i={candidateId:e,votes:((n=o.data)==null?void 0:n.votes)||0,lastUpdated:new Date};return console.log(`[VotingManager] ✅ Voto removido: ${r.nome} agora tem ${i.votes} votos`),{success:!0,data:i.votes>0?i:null}}catch(r){return _.log(r,"VotingManager.removeVote"),{success:!1,error:"Erro interno ao remover voto"}}}async getVotes(){try{const e=this.votesCache.get("all-votes");if(e)return e;const n=(await this.getCandidates()).map(r=>({candidateId:r.id,votes:r.votes||0,lastUpdated:new Date}));return this.votesCache.set("all-votes",n),n}catch(e){return _.log(e,"VotingManager.getVotes"),[]}}async getQuorumConfig(){try{const e=localStorage.getItem(x.CONFIG);return!e||e==="undefined"||e==="null"?null:JSON.parse(e).quorum||null}catch(e){return _.log(e,"VotingManager.getQuorumConfig"),null}}async updateQuorumConfig(e){try{const t=localStorage.getItem(x.CONFIG),r={...t&&t!=="undefined"&&t!=="null"?JSON.parse(t):{quorum:e},quorum:e};return localStorage.setItem(x.CONFIG,JSON.stringify(r)),K.getInstance().syncConfig(r),this.eventSystem.emit(C.QUORUM_UPDATED,e),this.updateResults(),{success:!0}}catch(t){return _.log(t,"VotingManager.updateQuorumConfig"),{success:!1,error:"Erro ao atualizar configuração de quórum"}}}async getQuorumData(){try{const e=await this.getQuorumConfig();if(!e)return console.warn("[VotingManager.getQuorumData] ⚠️ Config não encontrada no localStorage"),console.warn("[VotingManager.getQuorumData] localStorage.CONFIG:",localStorage.getItem(x.CONFIG)),{totalMembers:0,presentMembers:0,minimumQuorum:0,votesRequired:0,isValid:!1};const{AttendanceManager:t}=await ne(async()=>{const{AttendanceManager:h}=await Promise.resolve().then(()=>kt);return{AttendanceManager:h}},void 0),r=await t.getInstance().getAttendanceStats();console.log("[VotingManager.getQuorumData] Stats recebidos:",r);const o=r.totalMembers,i=r.presentMembers,a=Math.ceil(o*e.minimumPercentage/100);let c;e.votesCriteria==="simple-majority"||e.votesRequiredPercentage===-1?c=Math.floor(i/2)+1:c=Math.ceil(i*e.votesRequiredPercentage/100);const l=i>=a;return{totalMembers:o,presentMembers:i,minimumQuorum:a,votesRequired:c,isValid:l}}catch(e){return _.log(e,"VotingManager.getQuorumData"),{totalMembers:0,presentMembers:0,minimumQuorum:0,votesRequired:0,isValid:!1}}}async getElectionResults(){try{const[e,t]=await Promise.all([this.memberManager.getCandidatesByRole(),this.getQuorumData()]),n=e.map(a=>({id:a.id,name:a.nome,role:a.candidato,photoUrl:a.photoUrl,votes:a.votes||0,isElected:t.isValid&&(a.votes||0)>=t.votesRequired})).sort((a,c)=>c.votes-a.votes),r=n.filter(a=>a.role==="Presbítero"),o=n.filter(a=>a.role==="Diácono"),i=e.reduce((a,c)=>a+(c.votes||0),0);return{presbyteros:r,diaconos:o,totalVotes:i,quorum:t,timestamp:new Date}}catch(e){return _.log(e,"VotingManager.getElectionResults"),{presbyteros:[],diaconos:[],totalVotes:0,quorum:{totalMembers:0,presentMembers:0,minimumQuorum:0,votesRequired:0,isValid:!1},timestamp:new Date}}}async _updateResults(){try{const e=await this.getElectionResults();this.eventSystem.emit(C.RESULTS_UPDATED,e)}catch(e){_.log(e,"VotingManager._updateResults")}}async loadFromStorage(){await Promise.all([this.getCandidates(),this.getVotes()])}clearCache(){console.log("[VotingManager] 🧹 Cache de candidatos limpo"),console.trace("[VotingManager] Stack trace do clearCache:"),this.candidatesCache.clear()}async clearAll(){this.candidatesCache.clear(),this.votesCache.clear()}async getCandidateById(e){return(await this.getCandidates()).find(n=>n.id===e)||null}async getTotalVotes(){return(await this.getVotes()).reduce((t,n)=>t+n.votes,0)}async getElectedCandidates(){const e=await this.getElectionResults();return[...e.presbyteros,...e.diaconos].filter(t=>t.isElected)}async resetVotes(){try{const t=(await this.memberManager.getMembers()).map(n=>({...n,votes:n.candidato?0:n.votes,jaVotou:!1,votedFor:[]}));return localStorage.setItem(x.MEMBERS,JSON.stringify(t)),K.getInstance().syncMembers(t),console.log("[VotingManager] ✅ Todos os votos foram resetados"),{success:!0}}catch(e){return _.log(e,"VotingManager.resetVotes"),{success:!1,error:"Erro ao resetar votos"}}}async getVotingStats(){try{const[e,t,n]=await Promise.all([this.memberManager.getCandidatesByRole(),this.memberManager.getPresentMembers(),this.memberManager.getVoters()]),r=e.reduce((c,l)=>c+(l.votes||0),0),o=n.length,i=t.filter(c=>c.tipo==="Membro Comungante").length,a=i-o;return{totalVotes:r,voters:o,abstentions:Math.max(0,a),presentMembers:i}}catch(e){return _.log(e,"VotingManager.getVotingStats"),{totalVotes:0,voters:0,abstentions:0,presentMembers:0}}}};E(Ce,"instance");let bt=Ce;const Nt=Object.freeze(Object.defineProperty({__proto__:null,VotingManager:bt},Symbol.toStringTag,{value:"Module"})),Me=class Me{constructor(){E(this,"cache",new Xt);E(this,"eventSystem",Re.getInstance());E(this,"memberManager",We.getInstance())}static getInstance(){return Me.instance||(Me.instance=new Me),Me.instance}async getAttendanceRecords(){try{const e=this.cache.get("all-attendance");if(e)return e;const n=(await this.memberManager.getMembers()).map(r=>({memberId:r.id,memberName:r.nome,present:r.presente||!1,arrivalTime:r.horarioChegada||null,timestamp:r.horarioChegada?new Date(r.horarioChegada):new Date}));return this.cache.set("all-attendance",n),n}catch(e){return _.log(e,"AttendanceManager.getAttendanceRecords"),[]}}async markPresence(e,t){try{const n=await this.memberManager.getMember(e);if(!n)return{success:!1,error:"Membro não encontrado"};if(n.presente===t){const a=new Date;return{success:!0,data:{memberId:e,memberName:n.nome,present:t,arrivalTime:n.horarioChegada||null,timestamp:a}}}const r=await this.memberManager.toggleMemberPresence(e);if(!r.success)return{success:!1,error:r.error};const o=new Date,i={memberId:e,memberName:r.data.nome,present:r.data.presente||!1,arrivalTime:r.data.horarioChegada||null,timestamp:o};return this.cache.clear(),{success:!0,data:i}}catch(n){return _.log(n,"AttendanceManager.markPresence"),{success:!1,error:"Erro interno ao marcar presença"}}}async togglePresence(e){try{const t=await this.memberManager.toggleMemberPresence(e);if(!t.success)return{success:!1,error:t.error};const n=t.data,r=new Date;return this.cache.clear(),{success:!0,data:{memberId:n.id,memberName:n.nome,present:n.presente||!1,arrivalTime:n.horarioChegada||null,timestamp:r}}}catch(t){return _.log(t,"AttendanceManager.togglePresence"),{success:!1,error:"Erro interno ao alternar presença"}}}async getAttendanceStats(){try{const[e,t]=await Promise.all([this.memberManager.getMembers(),this.memberManager.getPresentMembers()]);console.log("[AttendanceManager.getAttendanceStats] Total de membros carregados:",e.length),console.log("[AttendanceManager.getAttendanceStats] Membros presentes:",t.length);const n=e.filter(c=>c.tipo==="Membro Comungante");console.log("[AttendanceManager.getAttendanceStats] Membros Comungantes elegíveis:",n.length);const r=n.length,o=t.filter(c=>c.tipo==="Membro Comungante").length,i=r-o,a=r>0?o/r*100:0;return console.log("[AttendanceManager.getAttendanceStats] Resultado:",{totalMembers:r,presentMembers:o,absentMembers:i,attendanceRate:a}),{totalMembers:r,presentMembers:o,absentMembers:i,attendanceRate:a}}catch(e){return _.log(e,"AttendanceManager.getAttendanceStats"),{totalMembers:0,presentMembers:0,absentMembers:0,attendanceRate:0}}}async getPresentMembers(){try{return await this.memberManager.getPresentMembers()}catch(e){return _.log(e,"AttendanceManager.getPresentMembers"),[]}}async getAbsentMembers(){try{const[e,t]=await Promise.all([this.memberManager.getMembers(),this.getAttendanceRecords()]),n=t.filter(r=>r.present).map(r=>r.memberId);return e.filter(r=>!n.includes(r.id))}catch(e){return _.log(e,"AttendanceManager.getAbsentMembers"),[]}}async markAllPresent(){try{const e=await this.memberManager.getMembers(),t=[];for(const n of e){const r=await this.markPresence(n.id,!0);r.success&&r.data&&t.push(r.data)}return{success:!0,data:t}}catch(e){return _.log(e,"AttendanceManager.markAllPresent"),{success:!1,error:"Erro interno ao marcar todos como presentes"}}}async markAllAbsent(){try{const e=await this.memberManager.getMembers(),t=[];for(const n of e){const r=await this.markPresence(n.id,!1);r.success&&r.data&&t.push(r.data)}return{success:!0,data:t}}catch(e){return _.log(e,"AttendanceManager.markAllAbsent"),{success:!1,error:"Erro interno ao marcar todos como ausentes"}}}async getMemberAttendance(e){try{return(await this.getAttendanceRecords()).find(n=>n.memberId===e)||null}catch(t){return _.log(t,"AttendanceManager.getMemberAttendance"),null}}async initializeFromMembers(){try{const e=await this.memberManager.getMembers(),t=await this.getAttendanceRecords();let n=0;const r=[...t];for(const o of e)if(!t.some(a=>a.memberId===o.id)){const a={memberId:o.id,memberName:o.nome,present:!1,arrivalTime:null,timestamp:new Date};r.push(a),n++}return n>0&&await this.saveAttendanceRecords(r),{success:!0,data:n}}catch(e){return _.log(e,"AttendanceManager.initializeFromMembers"),{success:!1,error:"Erro interno ao inicializar presença"}}}async saveAttendanceRecords(e){this.eventSystem.emit(C.ATTENDANCE_SAVED,{count:e.length,timestamp:new Date})}async loadFromStorage(){await this.getAttendanceRecords()}async clearAll(){this.cache.clear()}async removeMemberAttendance(e){try{const t=await this.getAttendanceRecords(),n=t.filter(r=>r.memberId!==e);return t.length===n.length?{success:!0}:(await this.saveAttendanceRecords(n),{success:!0})}catch(t){return _.log(t,"AttendanceManager.removeMemberAttendance"),{success:!1,error:"Erro interno ao remover presença do membro"}}}async searchAttendance(e){try{const t=await this.getAttendanceRecords(),n=e.toLowerCase();return t.filter(r=>r.memberName.toLowerCase().includes(n))}catch(t){return _.log(t,"AttendanceManager.searchAttendance"),[]}}async getAttendanceByStatus(e){try{return(await this.getAttendanceRecords()).filter(n=>n.present===e)}catch(t){return _.log(t,"AttendanceManager.getAttendanceByStatus"),[]}}};E(Me,"instance");let Et=Me;const kt=Object.freeze(Object.defineProperty({__proto__:null,AttendanceManager:Et},Symbol.toStringTag,{value:"Module"}));function wn(s){const e=s.replace(/\D/g,"").substring(0,9);let t=0;for(let a=0;a<9;a++)t+=parseInt(e.charAt(a))*(10-a);let n=11-t%11;n>=10&&(n=0),t=0;const r=e+n;for(let a=0;a<10;a++)t+=parseInt(r.charAt(a))*(11-a);let o=11-t%11;return o>=10&&(o=0),(e+n+o).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4")}const we=class we{constructor(){E(this,"memberManager",We.getInstance());E(this,"votingManager",bt.getInstance());E(this,"attendanceManager",Et.getInstance())}static getInstance(){return we.instance||(we.instance=new we),we.instance}async generatePDFReport(){try{const{jsPDF:e}=await ne(async()=>{const{jsPDF:a}=await import("./vendor-BnABG2cI.js").then(c=>c.j);return{jsPDF:a}},[]),t=new e;t.setFont("helvetica"),this.addHeader(t);const[n,r]=await Promise.all([this.votingManager.getElectionResults(),this.attendanceManager.getAttendanceStats()]);let o=40;o=this.addQuorumSection(t,n.quorum,r,o),o=this.addCandidatesSection(t,"Presbíteros Eleitos",n.presbyteros,o),o=this.addCandidatesSection(t,"Diáconos Eleitos",n.diaconos,o),o>200&&(t.addPage(),o=20),o=await this.addAttendanceSection(t,o),this.addFooter(t);const i=new Date().toISOString().slice(0,19).replace(/:/g,"-");return t.save(`relatorio-eleicao-${i}.pdf`),{success:!0}}catch(e){return _.log(e,"ReportManager.generatePDFReport"),{success:!1,error:"Erro ao gerar relatório PDF"}}}addHeader(e){e.setFontSize(18),e.setFont("helvetica","bold"),e.text("RELATÓRIO DE ELEIÇÃO DE OFICIAIS",105,20,{align:"center"}),e.setFontSize(12),e.setFont("helvetica","normal"),e.text(`Data: ${se.date(new Date)}`,105,30,{align:"center"})}addQuorumSection(e,t,n,r){let o=r;return e.setFontSize(14),e.setFont("helvetica","bold"),e.text("DADOS DE QUÓRUM E PRESENÇA",20,o),o+=10,e.setFontSize(11),e.setFont("helvetica","normal"),[`Total de Membros: ${t.totalMembers}`,`Membros Presentes: ${t.presentMembers}`,`Quórum Mínimo Necessário: ${t.minimumQuorum}`,`Votos Necessários para Eleição: ${t.votesRequired}`,`Status do Quórum: ${t.isValid?"VÁLIDO":"INSUFICIENTE"}`,`Taxa de Presença: ${n.attendanceRate.toFixed(1)}%`].forEach(a=>{e.text(a,20,o),o+=6}),o+10}addCandidatesSection(e,t,n,r){let o=r;if(e.setFontSize(14),e.setFont("helvetica","bold"),e.text(t,20,o),o+=10,n.length===0)return e.setFontSize(11),e.setFont("helvetica","italic"),e.text("Nenhum candidato atingiu os votos necessários",20,o),o+15;e.setFontSize(11),e.setFont("helvetica","normal");const i=n.filter(a=>a.isElected);return i.length>0?i.forEach(a=>{e.text(`✓ ${a.name} - ${a.votes} votos`,20,o),o+=6}):(e.setFont("helvetica","italic"),e.text("Nenhum candidato atingiu os votos necessários",20,o),o+=6),n.length>0&&(o+=5,e.setFont("helvetica","bold"),e.text("Todos os candidatos:",20,o),o+=6,e.setFont("helvetica","normal"),n.forEach(a=>{const c=a.isElected?" (ELEITO)":"";e.text(`${a.name}: ${a.votes} votos${c}`,25,o),o+=5})),o+10}async addAttendanceSection(e,t){let n=t;e.setFontSize(14),e.setFont("helvetica","bold"),e.text("LISTA DE PRESENÇA",20,n),n+=10;try{const[r,o]=await Promise.all([this.attendanceManager.getPresentMembers(),this.attendanceManager.getAbsentMembers()]);if(r.length>0){e.setFontSize(12),e.setFont("helvetica","bold"),e.text("MEMBROS PRESENTES:",20,n),n+=8,e.setFontSize(10),e.setFont("helvetica","normal");for(const i of r){const a=await this.attendanceManager.getMemberAttendance(i.id),c=(a==null?void 0:a.arrivalTime)||"Horário não registrado";e.text(`• ${i.nome} - ${c}`,25,n),n+=5,n>270&&(e.addPage(),n=20)}}o.length>0&&(n+=10,e.setFontSize(12),e.setFont("helvetica","bold"),e.text("MEMBROS AUSENTES:",20,n),n+=8,e.setFontSize(10),e.setFont("helvetica","normal"),o.forEach(i=>{e.text(`• ${i.nome}`,25,n),n+=5,n>270&&(e.addPage(),n=20)}))}catch(r){_.log(r,"ReportManager.addAttendanceSection"),e.setFont("helvetica","italic"),e.text("Erro ao carregar dados de presença",20,n),n+=10}return n}addFooter(e){const t=e.internal.getNumberOfPages();for(let n=1;n<=t;n++)e.setPage(n),e.setFontSize(10),e.setFont("helvetica","normal"),e.text(`Página ${n} de ${t} - Relatório gerado em ${se.date(new Date)}`,105,285,{align:"center"})}async exportData(){try{const[e,t,n]=await Promise.all([this.memberManager.getMembers(),this.votingManager.getQuorumConfig(),this.votingManager.getElectionResults()]),o={members:e,config:{quorum:t||{minimumPercentage:50,votesRequiredPercentage:-1,presbyteroPositions:0,diaconoPositions:0},system:{version:"3.0.0",maxCandidates:100,batchSize:50,cacheTimeout:3e5,autosaveInterval:6e4}},quorum:n.quorum,results:n,exportDate:new Date,version:"3.0.0"},i=JSON.stringify(o,null,2),a=new Blob([i],{type:"application/json"}),c=URL.createObjectURL(a),l=document.createElement("a");return l.href=c,l.download=`dados-eleicao-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(l),l.click(),document.body.removeChild(l),URL.revokeObjectURL(c),{success:!0,data:i}}catch(e){return _.log(e,"ReportManager.exportData"),{success:!1,error:"Erro ao exportar dados"}}}async importData(e){try{const t=JSON.parse(e);if(!t.members)return{success:!1,error:"Arquivo de dados inválido"};await Promise.all([this.memberManager.clearAll(),this.votingManager.clearAll(),this.attendanceManager.clearAll()]);for(const n of t.members)await this.memberManager.addMember(n);return t.config&&await this.votingManager.updateQuorumConfig(t.config.quorum),{success:!0}}catch(t){return _.log(t,"ReportManager.importData"),{success:!1,error:"Erro ao importar dados"}}}async generateCSVTemplate(){const e=["nome","tipo","cpf","rg","candidato","email","telefone"],t=wn("111.444.777"),n=wn("123.456.789"),r=wn("987.654.321");console.log("[Template CSV] CPFs gerados e validados:",{cpf1:t,cpf2:n,cpf3:r});const o=[["João Silva","Membro Comungante",t,"12.345.678-9","Presbítero","joao@email.com","(11) 99999-9999"],["Maria Santos","Membro Comungante",n,"98.765.432-1","Diácono","maria@email.com","(11) 88888-8888"],["José Oliveira","Visitante",r,"45.678.912-3","","jose@email.com","(11) 77777-7777"]];return[e.join(","),...o.map(a=>a.join(","))].join(`
`)}async downloadCSVTemplate(){try{const e=await this.generateCSVTemplate(),t=new Blob([e],{type:"text/csv;charset=utf-8;"}),n=URL.createObjectURL(t),r=document.createElement("a");r.href=n,r.download="template-membros.csv",document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(n)}catch(e){_.log(e,"ReportManager.downloadCSVTemplate")}}};E(we,"instance");let Hn=we;function iu(){console.log("[Migration] Iniciando migração para formato unificado...");const s=[];let e=0;try{const t=localStorage.getItem("MEMBERS"),n=localStorage.getItem("CANDIDATES");if(!t)return console.log("[Migration] Nenhum membro encontrado. Nada a migrar."),{success:!0,migrated:0,errors:[]};const r=JSON.parse(t);if(!n)return console.log("[Migration] Nenhum candidato antigo encontrado. Membros já no formato correto."),{success:!0,migrated:0,errors:[]};const o=JSON.parse(n);console.log("[Migration] Formato antigo detectado. Iniciando migração...");let i=[];return Array.isArray(o)?i=o:(o.presbyteros||o.diaconos)&&(i=[...o.presbyteros||[],...o.diaconos||[]]),console.log(`[Migration] ${i.length} candidatos encontrados no formato antigo`),i.forEach(c=>{const l=r.find(h=>h.nome===c.name||h.id===c.id);if(l)l.candidato=c.role,l.photoUrl=c.photoUrl,l.votes=c.votes||0,l.isElected=c.isElected||!1,e++,console.log(`[Migration] ✓ Migrado: ${l.nome} (${c.role})`);else{const h=`Candidato "${c.name}" não encontrado como membro`;s.push(h),console.warn(`[Migration] ⚠ ${h}`)}}),localStorage.setItem("MEMBERS",JSON.stringify(r)),console.log(`[Migration] Membros atualizados salvos (${r.length} total)`),localStorage.removeItem("CANDIDATES"),console.log("[Migration] Storage antigo 'CANDIDATES' removido"),["election-members","election-candidates"].forEach(c=>{localStorage.getItem(c)&&(localStorage.removeItem(c),console.log(`[Migration] Cache obsoleto '${c}' removido`))}),console.log(`[Migration] ✅ Migração concluída: ${e} candidatos unificados`),{success:!0,migrated:e,errors:s}}catch(t){return console.error("[Migration] ❌ Erro durante migração:",t),{success:!1,migrated:e,errors:[...s,t.message]}}}function au(){const s=localStorage.getItem("CANDIDATES")!==null,e=localStorage.getItem("election-members")!==null;return s||e}function cu(){if(au()){console.log("[Migration] Formato antigo detectado. Executando migração automática...");const s=iu();s.success?(console.log(`[Migration] ✅ Migração automática concluída: ${s.migrated} candidatos`),s.errors.length>0&&console.warn(`[Migration] ⚠ ${s.errors.length} avisos:`,s.errors)):console.error("[Migration] ❌ Falha na migração automática")}else console.log("[Migration] Dados já no formato correto")}const Ie=class Ie{constructor(){E(this,"eventSystem",Re.getInstance());E(this,"memberManager",We.getInstance());E(this,"votingManager",bt.getInstance());E(this,"attendanceManager",Et.getInstance());E(this,"reportManager",Hn.getInstance());E(this,"isInitialized",!1)}static getInstance(){return Ie.instance||(Ie.instance=new Ie),Ie.instance}get events(){return this.eventSystem}async initialize(){if(this.isInitialized)return console.log("[ElectionApp] Já inicializado, pulando..."),{success:!0};try{return console.log("[ElectionApp] Executando migração automática..."),cu(),console.log("[ElectionApp] Configurando listeners de eventos..."),this.setupEventListeners(),console.log("[ElectionApp] Ativando sincronização em tempo real..."),K.getInstance().enable(),console.log("[ElectionApp] � Sincronizando com Firebase (SSOT)..."),await this.syncFromFirebaseBeforeRender(),console.log("[ElectionApp] 🔍 Verificando configuração de quórum no Firebase..."),await this.checkQuorumConfiguration(),console.log("[ElectionApp] Carregando dados iniciais..."),await this.loadInitialData(),console.log("[ElectionApp] Configurando listeners de sincronização..."),this.setupSyncListeners(),this.isInitialized=!0,console.log("[ElectionApp] Emitindo evento APP_INITIALIZED..."),this.eventSystem.emit(C.APP_INITIALIZED,{timestamp:new Date,message:"Sistema inicializado com sucesso"}),console.log("[ElectionApp] ✓ Inicialização completa!"),console.log(`[ElectionApp] 📡 Sincronização: ${K.getInstance().isActive()?"ATIVA":"INATIVA"}`),{success:!0}}catch(e){return console.error("[ElectionApp] ✗ Erro na inicialização:",e),_.log(e,"ElectionApp.initialize"),{success:!1,error:"Erro ao inicializar sistema"}}}async checkQuorumConfiguration(){try{const e=await K.getInstance().loadInitialState();!!e.config?console.log("[ElectionApp] ✓ Configuração de quórum encontrada no Firebase:",e.config):(console.log("[ElectionApp] ⚠️ Nenhuma configuração de quórum no Firebase!"),console.log("[ElectionApp] 📋 Abrindo modal de configuração automaticamente..."),this.eventSystem.emit(C.QUORUM_CONFIG_REQUIRED,{reason:"no_config_on_firebase",source:"checkQuorum"}))}catch(e){console.error("[ElectionApp] ✗ Erro ao verificar configuração de quórum:",e),_.log(e,"ElectionApp.checkQuorumConfiguration")}}setupEventListeners(){this.eventSystem.on(C.MEMBERS_IMPORTED,this.handleMembersImported.bind(this)),this.eventSystem.on(C.MEMBER_ADDED,this.handleMemberAdded.bind(this)),this.eventSystem.on(C.MEMBER_UPDATED,this.handleMemberUpdated.bind(this)),this.eventSystem.on(C.VOTE_CAST,this.handleVoteCast.bind(this)),this.eventSystem.on(C.CANDIDATE_ADDED,this.handleCandidateAdded.bind(this)),this.eventSystem.on(C.RESULTS_UPDATED,this.handleResultsUpdated.bind(this)),this.eventSystem.on(C.ATTENDANCE_MARKED,this.handleAttendanceMarked.bind(this)),this.eventSystem.on(C.ATTENDANCE_BULK_UPDATED,this.handleBulkAttendanceUpdate.bind(this)),this.eventSystem.on(C.ERROR_OCCURRED,this.handleError.bind(this))}setupSyncListeners(){this.eventSystem.on(C.SYNC_MEMBERS_UPDATED,e=>{console.log("[ElectionApp] 🔄 Membros atualizados remotamente"),localStorage.setItem(x.MEMBERS,JSON.stringify(e)),this.memberManager.loadFromStorage(),this.attendanceManager.loadFromStorage(),this.votingManager.loadFromStorage(),this.eventSystem.emit(C.MEMBERS_IMPORTED,{count:e.length}),this.eventSystem.emit(C.ATTENDANCE_SAVED,{count:e.filter(t=>t.presente).length,timestamp:new Date})}),this.eventSystem.on(C.SYNC_CONFIG_UPDATED,e=>{if(console.log("[ElectionApp] 🔄 Configurações atualizadas remotamente"),!e){console.warn("[ElectionApp] ⚠️ ConfigData é undefined, ignorando atualização");return}localStorage.setItem(x.CONFIG,JSON.stringify(e)),this.votingManager.loadFromStorage(),e.quorum&&this.eventSystem.emit(C.QUORUM_UPDATED,e.quorum)}),console.log("[ElectionApp] 👂 Listeners de sincronização configurados")}async loadInitialData(){try{await Promise.all([this.memberManager.loadFromStorage(),this.votingManager.loadFromStorage(),this.attendanceManager.loadFromStorage()])}catch(e){_.log(e,"ElectionApp.loadInitialData")}}async syncFromFirebaseBeforeRender(){var e;try{console.log("[ElectionApp] 📡 Conectando ao Firebase (SSOT)...");const t=await K.getInstance().loadInitialState();console.log("[ElectionApp] 🐛 DEBUG firebaseData:",{members:t.members?`${t.members.length} items`:null,config:t.config?"exists":null,membersType:typeof t.members,configType:typeof t.config});let n=!1,r=!1;if(t.members&&t.members.length>0){const o=localStorage.getItem(x.MEMBERS);o&&o!=="[]"?(console.log(`[ElectionApp] 🔄 Sobrescrevendo cache local com ${t.members.length} membros do Firebase (SSOT)`),localStorage.setItem(x.MEMBERS,JSON.stringify(t.members)),n=!0):(console.log(`[ElectionApp] 📦 localStorage vazio - hidratando ${t.members.length} membros do Firebase`),localStorage.setItem(x.MEMBERS,JSON.stringify(t.members)),n=!0)}else console.log("[ElectionApp] ℹ️ Firebase não tem membros cadastrados");if(t.config){const o=localStorage.getItem(x.CONFIG);o&&o!=="undefined"&&o!=="null"?(console.log("[ElectionApp] 🔄 Sobrescrevendo cache local com config do Firebase (SSOT)"),localStorage.setItem(x.CONFIG,JSON.stringify(t.config)),r=!0):(console.log("[ElectionApp] 📦 localStorage vazio - hidratando config do Firebase"),localStorage.setItem(x.CONFIG,JSON.stringify(t.config)),r=!0)}else{console.log("[ElectionApp] ℹ️ Firebase não tem configuração de quórum");const o=localStorage.getItem(x.CONFIG);o&&o!=="undefined"&&o!=="null"?console.log("[ElectionApp] ✓ Config encontrada no localStorage (Firebase sync não necessário)"):(console.log("[ElectionApp] ⚠️ Nenhuma configuração encontrada (Firebase e localStorage vazios)"),console.log("[ElectionApp] 📋 Emitindo evento QUORUM_CONFIG_REQUIRED..."),setTimeout(()=>{this.eventSystem.emit(C.QUORUM_CONFIG_REQUIRED,{reason:"no_config_found",source:"firebase_sync"})},500))}if(n&&(console.log("[ElectionApp] 🔃 Recarregando managers de membros..."),await this.memberManager.loadFromStorage(),await this.attendanceManager.loadFromStorage(),await this.votingManager.loadFromStorage()),r&&(console.log("[ElectionApp] 🔃 Recarregando manager de configuração..."),await this.votingManager.loadFromStorage()),n||r)console.log("[ElectionApp] ✅ Sincronização completa - dados atualizados do Firebase (SSOT)"),n&&this.eventSystem.emit(C.MEMBERS_IMPORTED,{count:((e=t.members)==null?void 0:e.length)||0});else{const o=t.members&&t.members.length>0,i=!!t.config;console.log(!o&&!i?"[ElectionApp] ℹ️ Firebase vazio - usando dados do localStorage (se existirem)":"[ElectionApp] ✅ localStorage já sincronizado com Firebase")}}catch(t){console.error("[ElectionApp] ✗ Erro ao sincronizar com Firebase:",t),_.log(t,"ElectionApp.syncFromFirebaseBeforeRender"),console.warn("[ElectionApp] ⚠️ Continuando com dados locais (Firebase indisponível)")}}async setupDefaultQuorum(){try{if(!await this.votingManager.getQuorumConfig()){const t={minimumPercentage:50,votesRequiredPercentage:60,presbyteroPositions:3,diaconoPositions:6};await this.votingManager.updateQuorumConfig(t)}}catch(e){_.log(e,"ElectionApp.setupDefaultQuorum")}}handleMembersImported(e){console.log(`${e.count} membros importados`),e.errors&&e.errors.length>0&&console.warn("Erros na importação:",e.errors)}handleMemberAdded(e){console.log(`Membro adicionado: ${e.nome}`)}handleMemberUpdated(e){console.log(`Membro atualizado: ${e.nome}`)}handleVoteCast(e){console.log(`Voto registrado - Candidato: ${e.candidateId}, Membro: ${e.memberId}`)}handleCandidateAdded(e){console.log(`Candidato adicionado: ${e.name} (${e.role})`)}handleResultsUpdated(e){console.log("Resultados atualizados:",e)}handleAttendanceMarked(e){const t=e.present?"presente":"ausente";console.log(`Presença marcada - Membro: ${e.memberId}, Status: ${t}`)}handleBulkAttendanceUpdate(e){console.log(`${e.updated} presenças atualizadas em lote`),e.errors&&e.errors.length>0&&console.warn("Erros na atualização:",e.errors)}handleError(e){console.error(`Erro no sistema [${e.context}]:`,e.message)}async importMembers(e){return await this.memberManager.importFromCSV(e)}async exportData(){return await this.reportManager.exportData()}async importData(e){return await this.reportManager.importData(e)}async generateReport(){return await this.reportManager.generatePDFReport()}async downloadTemplate(){await this.reportManager.downloadCSVTemplate()}async addMember(e){return await this.memberManager.addMember(e)}async updateMember(e,t){return await this.memberManager.updateMember(e,t)}async deleteMember(e){return await this.memberManager.deleteMember(e)}async getMembers(){return await this.memberManager.getMembers()}async searchMembers(e){return await this.memberManager.searchMembers(e)}async getCandidates(){return await this.votingManager.getCandidates()}async castVote(e,t){return await this.votingManager.castVote(e,t)}async removeVote(e,t){return await this.votingManager.removeVote(e,t)}async incrementVoteProjection(e){return await this.votingManager.incrementVoteProjection(e)}async decrementVoteProjection(e){return await this.votingManager.decrementVoteProjection(e)}async resetVotesProjection(e){return await this.votingManager.resetVotesProjection(e)}async getElectionResults(){return await this.votingManager.getElectionResults()}async markAttendance(e,t=!0){return await this.attendanceManager.markPresence(e,t)}async toggleAttendance(e){return await this.attendanceManager.togglePresence(e)}async getAttendanceRecords(){return await this.attendanceManager.getAttendanceRecords()}async getAttendanceStats(){return await this.attendanceManager.getAttendanceStats()}async getPresentMembers(){return await this.attendanceManager.getPresentMembers()}async getAbsentMembers(){return await this.attendanceManager.getAbsentMembers()}async markAllPresent(){var t;const e=await this.attendanceManager.markAllPresent();return{success:e.success,updated:(t=e.data)==null?void 0:t.length,error:e.error}}async markAllAbsent(){var t;const e=await this.attendanceManager.markAllAbsent();return{success:e.success,updated:(t=e.data)==null?void 0:t.length,error:e.error}}async updateQuorumConfig(e){return await this.votingManager.updateQuorumConfig(e)}async getQuorumConfig(){return await this.votingManager.getQuorumConfig()}async validateData(){const e=[];try{const t=await this.getMembers();for(const o of t)Fe.isValidCPF(o.cpf)||e.push(`CPF inválido para ${o.nome}: ${o.cpf}`),Fe.isValidEmail(o.email)||e.push(`Email inválido para ${o.nome}: ${o.email}`);const n=await this.getCandidates();for(const o of n)(!o.name||o.name.trim().length===0)&&e.push(`Nome de candidato inválido: ${o.name}`);const r=await this.getQuorumConfig();r?((r.minimumPercentage<=0||r.minimumPercentage>100)&&e.push("Percentual mínimo de quórum deve estar entre 1 e 100"),(r.votesRequiredPercentage<=0||r.votesRequiredPercentage>100)&&e.push("Percentual de votos necessários deve estar entre 1 e 100")):e.push("Configuração de quórum não encontrada")}catch(t){_.log(t,"ElectionApp.validateData"),e.push("Erro durante validação dos dados")}return{isValid:e.length===0,errors:e}}async resetElection(){try{const e=await this.votingManager.resetVotes();if(!e.success)return e;const n=(await this.memberManager.getMembers()).map(r=>({...r,presente:!1,horarioChegada:null}));return localStorage.setItem(x.MEMBERS,JSON.stringify(n)),K.getInstance().syncMembers(n),console.log("[ElectionApp] ✅ Eleição resetada: votos e presença zerados"),this.eventSystem.emit(C.APP_RESET,{timestamp:new Date,message:"Eleição resetada"}),{success:!0}}catch(e){return _.log(e,"ElectionApp.resetElection"),{success:!1,error:"Erro ao resetar eleição"}}}async resetSystem(){try{return await Promise.all([this.memberManager.clearAll(),this.votingManager.clearAll(),this.attendanceManager.clearAll()]),await this.setupDefaultQuorum(),this.eventSystem.emit(C.APP_RESET,{timestamp:new Date,message:"Sistema reiniciado"}),{success:!0}}catch(e){return _.log(e,"ElectionApp.resetSystem"),{success:!1,error:"Erro ao reiniciar sistema"}}}async clearCandidatesCache(){this.votingManager.clearCache()}async getSystemHealth(){const e=[];try{const t=localStorage.getItem(x.MEMBERS);if(!t)e.push({name:"localStorage MEMBERS",status:"ERROR",message:"Dados de membros não encontrados"});else{const l=JSON.parse(t);e.push({name:"localStorage MEMBERS",status:"OK",message:`${l.length} membros encontrados`})}const n=K.getInstance().isActive();e.push({name:"Firebase Sync",status:n?"OK":"ERROR",message:n?"Ativo":"Inativo"});const r=await this.memberManager.getCandidatesByRole();e.push({name:"Candidatos",status:"OK",message:`${r.length} candidatos registrados`});const o=r.reduce((l,h)=>l+(h.votes||0),0),i=await this.memberManager.getVoters();e.push({name:"Votos",status:"OK",message:`${o} votos de ${i.length} eleitores`});const a=await this.votingManager.getQuorumConfig();return a?e.push({name:"Quórum",status:"OK",message:`${a.minimumPercentage}% mínimo`}):e.push({name:"Quórum",status:"ERROR",message:"Configuração não encontrada"}),{isHealthy:e.every(l=>l.status==="OK"),checks:e}}catch(t){return _.log(t,"ElectionApp.getSystemHealth"),e.push({name:"System",status:"ERROR",message:"Erro ao verificar integridade"}),{isHealthy:!1,checks:e}}}destroy(){this.eventSystem.removeAllListeners(),this.isInitialized=!1}};E(Ie,"instance");let Wn=Ie;const b=Wn.getInstance(),Q=class Q{constructor(){E(this,"container",null);E(this,"notifications",new Map);E(this,"idCounter",0);this.initialize()}static getInstance(){return Q.instance||(Q.instance=new Q),Q.instance}initialize(){this.container=document.getElementById("notifications"),this.container||(this.container=document.createElement("div"),this.container.id="notifications",this.container.className="notifications-container",document.body.appendChild(this.container))}static show(e,t="info",n={}){return Q.getInstance().show(e,t,n)}show(e,t="info",n={}){const r=`notification-${++this.idCounter}`,o={duration:t==="error"?5e3:3e3,closable:!0,persistent:!1,...n},i={id:r,message:e,type:t,timestamp:new Date,options:o};return this.notifications.set(r,i),this.renderNotification(i),!o.persistent&&o.duration&&setTimeout(()=>{this.remove(r)},o.duration),r}renderNotification(e){if(!this.container)return;const t=document.createElement("div");if(t.id=e.id,t.className=`notification notification-${e.type}`,t.innerHTML=`
      <div class="notification-content">
        <div class="notification-icon">
          ${this.getIcon(e.type)}
        </div>
        <div class="notification-message">
          ${this.escapeHtml(e.message)}
        </div>
        ${e.options.closable?`
          <button class="notification-close" title="Fechar">
            <span class="material-icons md-18">close</span>
          </button>
        `:""}
      </div>
    `,e.options.closable){const n=t.querySelector(".notification-close");n==null||n.addEventListener("click",()=>{this.remove(e.id)})}this.container.appendChild(t),requestAnimationFrame(()=>{t.classList.add("notification-enter")})}remove(e){if(!this.notifications.get(e))return;const n=document.getElementById(e);n?(n.classList.add("notification-exit"),setTimeout(()=>{n.remove(),this.notifications.delete(e)},300)):this.notifications.delete(e)}clear(){Array.from(this.notifications.keys()).forEach(e=>{this.remove(e)})}success(e,t){return this.show(e,"success",t)}error(e,t){return this.show(e,"error",{persistent:!0,...t})}warning(e,t){return this.show(e,"warning",t)}info(e,t){return this.show(e,"info",t)}getIcon(e){const t={success:'<span class="material-icons md-20">check_circle</span>',error:'<span class="material-icons md-20">error</span>',warning:'<span class="material-icons md-20">warning</span>',info:'<span class="material-icons md-20">info</span>'};return t[e]||t.info}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}static success(e,t){return Q.getInstance().success(e,t)}static error(e,t){return Q.getInstance().error(e,t)}static warning(e,t){return Q.getInstance().warning(e,t)}static info(e,t){return Q.getInstance().info(e,t)}static clear(){Q.getInstance().clear()}};E(Q,"instance");let g=Q;const Se=class Se{constructor(){E(this,"debounceTimers",new Map);E(this,"lastFocusedElement",null);E(this,"activeModal",null)}static getInstance(){return Se.instance||(Se.instance=new Se),Se.instance}async initialize(){console.log("[UIManager] Configurando event listeners..."),this.setupEventListeners(),console.log("[UIManager] Configurando navegação de abas..."),this.setupTabNavigation(),console.log("[UIManager] Configurando modais..."),this.setupModals(),console.log("[UIManager] Configurando listeners de eventos do sistema..."),this.setupSystemEventListeners(),console.log("[UIManager] Carregando dados iniciais..."),await this.loadInitialData(),console.log("[UIManager] Inicializando preferências..."),this.initializeDarkMode(),console.log("[UIManager] ✓ Inicialização completa!")}async openQuorumConfigModal(){console.log("[UIManager] 📋 Abrindo modal de configuração de quórum..."),await this.handleConfigQuorum()}initializeDarkMode(){const e=localStorage.getItem("darkMode")==="true",t=document.getElementById("dark-mode-toggle");e&&(document.body.classList.add("dark-mode"),t&&(t.checked=!0))}setupEventListeners(){var e,t,n,r,o,i,a,c,l,h,d,u,m,p,v,S,A,F,$,G,Ss,Ts;(e=document.getElementById("export-btn"))==null||e.addEventListener("click",this.handleExport.bind(this)),(t=document.getElementById("import-btn"))==null||t.addEventListener("click",this.handleImport.bind(this)),(n=document.getElementById("report-btn"))==null||n.addEventListener("click",this.handleReport.bind(this)),(r=document.getElementById("settings-btn"))==null||r.addEventListener("click",this.handleSettings.bind(this)),(o=document.getElementById("download-template"))==null||o.addEventListener("click",this.handleDownloadTemplate.bind(this)),(i=document.getElementById("import-csv"))==null||i.addEventListener("click",this.handleImportCSV.bind(this)),(a=document.getElementById("add-member"))==null||a.addEventListener("click",this.handleAddMember.bind(this)),(c=document.getElementById("member-search"))==null||c.addEventListener("input",this.handleMemberSearch.bind(this)),(l=document.getElementById("add-candidate"))==null||l.addEventListener("click",this.handleAddCandidate.bind(this)),(h=document.getElementById("fullscreen-presbyteros"))==null||h.addEventListener("click",()=>this.openFullscreen("Presbítero")),(d=document.getElementById("fullscreen-diaconos"))==null||d.addEventListener("click",()=>this.openFullscreen("Diácono")),(u=document.getElementById("exit-fullscreen"))==null||u.addEventListener("click",this.closeFullscreen.bind(this)),(m=document.getElementById("upload-photo-btn"))==null||m.addEventListener("click",()=>{var As;(As=document.getElementById("candidate-photo"))==null||As.click()}),(p=document.getElementById("candidate-photo"))==null||p.addEventListener("change",this.handlePhotoUpload.bind(this)),(v=document.getElementById("remove-photo-btn"))==null||v.addEventListener("click",this.handleRemovePhoto.bind(this)),(S=document.getElementById("config-quorum"))==null||S.addEventListener("click",this.handleConfigQuorum.bind(this)),(A=document.getElementById("mark-all-present"))==null||A.addEventListener("click",this.handleMarkAllPresent.bind(this)),(F=document.getElementById("mark-all-absent"))==null||F.addEventListener("click",this.handleMarkAllAbsent.bind(this)),($=document.getElementById("attendance-search"))==null||$.addEventListener("input",this.handleAttendanceSearch.bind(this)),(G=document.getElementById("refresh-results"))==null||G.addEventListener("click",this.handleRefreshResults.bind(this)),(Ss=document.getElementById("csv-file-input"))==null||Ss.addEventListener("change",this.handleCSVFileSelected.bind(this)),(Ts=document.getElementById("json-file-input"))==null||Ts.addEventListener("change",this.handleJSONFileSelected.bind(this)),this.setupInfoTooltips()}setupTabNavigation(){document.querySelectorAll(".nav-tab").forEach(t=>{t.addEventListener("click",n=>{const o=n.currentTarget.dataset.tab;o&&this.switchTab(o)})})}setupModals(){var e,t,n,r;document.querySelectorAll(".modal-close, .modal-cancel").forEach(o=>{o.addEventListener("click",this.closeAllModals.bind(this))}),(e=document.getElementById("member-form"))==null||e.addEventListener("submit",this.handleMemberSubmit.bind(this)),(t=document.getElementById("candidate-form"))==null||t.addEventListener("submit",this.handleCandidateSubmit.bind(this)),(n=document.getElementById("quorum-form"))==null||n.addEventListener("submit",this.handleQuorumSubmit.bind(this)),(r=document.getElementById("dark-mode-toggle"))==null||r.addEventListener("change",this.handleDarkModeToggle.bind(this)),document.querySelectorAll(".modal").forEach(o=>{o.addEventListener("click",i=>{i.target===o&&this.closeAllModals()}),o.addEventListener("keydown",i=>this.handleFocusTrap(i))})}setupSystemEventListeners(){b.events.on(C.MEMBERS_IMPORTED,async e=>{console.log(`[UIManager] 📥 Evento MEMBERS_IMPORTED recebido: ${e.count} membros carregados do Firebase`),this.debouncedUpdateStats();const t=this.getCurrentTab();t==="members"?(console.log("[UIManager] 🔄 Recarregando aba Membros..."),await this.loadMembersData()):t==="candidates"?(console.log("[UIManager] 🔄 Recarregando aba Candidatos..."),await this.loadCandidatesData()):t==="attendance"?(console.log("[UIManager] 🔄 Recarregando aba Presença..."),await this.loadAttendanceData()):t==="voting"?(console.log("[UIManager] 🔄 Recarregando aba Votação..."),await this.loadVotingData()):t==="results"&&(console.log("[UIManager] 🔄 Recarregando aba Resultados..."),await this.loadResultsData()),console.log("[UIManager] ✅ UI atualizada com dados carregados do Firebase")}),b.events.on(C.MEMBER_UPDATED,async e=>{console.log("[UIManager] Evento MEMBER_UPDATED recebido:",e.nome,"candidato:",e.candidato),await this.loadCandidatesData(),console.log("[UIManager] ✓ Aba Candidatos sincronizada")}),b.events.on(C.MEMBER_DELETED,async()=>{console.log("[UIManager] Evento MEMBER_DELETED recebido, sincronizando..."),await this.loadCandidatesData(),console.log("[UIManager] ✓ Aba Candidatos sincronizada")}),b.events.on(C.ATTENDANCE_SAVED,async()=>{console.log("[UIManager] Evento ATTENDANCE_SAVED recebido, atualizando UI..."),this.debouncedUpdateStats();const e=this.getCurrentTab();e==="attendance"?await this.loadAttendanceData():e==="voting"&&await this.loadVotingData(),console.log("[UIManager] ✓ Contador de presença e quórum atualizados")}),b.events.on(C.SYNC_MEMBERS_UPDATED,async e=>{console.log("[UIManager] Evento SYNC_MEMBERS_UPDATED recebido do Firebase:",e.length,"membros"),this.debouncedUpdateStats();const t=this.getCurrentTab();t==="members"?await this.loadMembersData():t==="candidates"?await this.loadCandidatesData():t==="attendance"?await this.loadAttendanceData():t==="voting"?await this.loadVotingData():t==="results"&&await this.loadResultsData(),console.log("[UIManager] ✓ UI sincronizada com dados do Firebase")}),b.events.on(C.SYNC_CONFIG_UPDATED,async()=>{console.log("[UIManager] Evento SYNC_CONFIG_UPDATED recebido do Firebase"),this.getCurrentTab()==="voting"&&await this.loadVotingData(),console.log("[UIManager] ✓ Configurações sincronizadas com Firebase")}),b.events.on(C.QUORUM_CONFIG_REQUIRED,async e=>{console.log("[UIManager] 📋 Evento QUORUM_CONFIG_REQUIRED recebido:",e),console.log("[UIManager] ⚠️ Nenhuma configuração de quórum encontrada!"),console.log("[UIManager] 🔓 Abrindo modal de configuração automaticamente..."),await this.handleConfigQuorum()})}getCurrentTab(){const e=document.querySelector(".nav-tab.active");return(e==null?void 0:e.getAttribute("data-tab"))||"members"}setupInfoTooltips(){document.querySelectorAll(".info-icon-btn").forEach(e=>{e.addEventListener("click",t=>{t.preventDefault();const n=t.currentTarget,r=n.dataset.info;if(!r)return;const o=document.getElementById(r);o&&(o.style.display==="none"||!o.style.display?(o.style.display="block",n.classList.add("active")):(o.style.display="none",n.classList.remove("active")))})}),document.addEventListener("click",e=>{const t=e.target;!t.closest(".info-icon-btn")&&!t.closest(".info-tooltip")&&(document.querySelectorAll(".info-tooltip").forEach(n=>{n.style.display="none"}),document.querySelectorAll(".info-icon-btn").forEach(n=>{n.classList.remove("active")}))})}switchTab(e){var t,n;document.querySelectorAll(".nav-tab").forEach(r=>{r.classList.remove("active")}),(t=document.querySelector(`[data-tab="${e}"]`))==null||t.classList.add("active"),document.querySelectorAll(".tab-content").forEach(r=>{r.classList.remove("active")}),(n=document.getElementById(`${e}-tab`))==null||n.classList.add("active"),this.loadTabData(e)}async loadTabData(e){try{switch(e){case"members":await this.loadMembersData();break;case"candidates":await this.loadCandidatesData();break;case"voting":await this.loadVotingData();break;case"attendance":await this.loadAttendanceData();break;case"results":await this.loadResultsData();break}}catch(t){console.error(`Erro ao carregar dados da aba ${e}:`,t),g.error(`Erro ao carregar dados da aba ${e}`)}}async loadInitialData(){console.log("[UIManager] Carregando dados de membros..."),await this.loadMembersData(),console.log("[UIManager] ✓ Dados iniciais carregados!")}async loadMembersData(){const e=await b.getMembers();await this.renderMembersTable(e),await this.updateStats()}async renderMembersTable(e){const t=document.getElementById("members-tbody");if(!t)return;if(t.innerHTML="",e.length===0){t.innerHTML=`
        <tr>
          <td colspan="6" class="text-center">
            Nenhum membro cadastrado. 
            <button class="btn btn-link" onclick="document.getElementById('add-member')?.click()">
              Adicionar primeiro membro
            </button>
          </td>
        </tr>
      `;return}[...e].sort((r,o)=>r.nome.localeCompare(o.nome,"pt-BR",{sensitivity:"base"})).forEach(r=>{const o=r.presente||!1,i=document.createElement("tr");i.innerHTML=`
        <td>${this.escapeHtml(r.nome)}</td>
        <td>${r.tipo||"-"}</td>
        <td>${r.candidato||"-"}</td>
        <td>
          <label class="toggle-switch">
            <input type="checkbox" data-member-id="${r.id}" class="attendance-toggle" ${o?"checked":""}>
            <span class="toggle-slider"></span>
          </label>
        </td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="editMember('${r.id}')" title="Editar">
            <span class="material-icons md-18">edit</span>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteMember('${r.id}')" title="Excluir">
            <span class="material-icons md-18">delete</span>
          </button>
        </td>
      `,t.appendChild(i)}),t.querySelectorAll(".attendance-toggle").forEach(r=>{r.addEventListener("change",this.handleAttendanceToggle.bind(this))})}debounce(e,t,n){const r=this.debounceTimers.get(e);r&&clearTimeout(r);const o=window.setTimeout(()=>{t(),this.debounceTimers.delete(e)},n);this.debounceTimers.set(e,o)}async handleMemberSearch(e){const n=e.target.value.trim();this.debounce("member-search",async()=>{if(n.length===0)await this.loadMembersData();else{const r=await b.searchMembers(n);await this.renderMembersTable(r)}},300)}async handleAttendanceToggle(e){const t=e.target,n=t.dataset.memberId;if(n)try{const r=await b.markAttendance(n,t.checked);r.success?await this.updateStats():(t.checked=!t.checked,g.error(r.error||"Erro ao atualizar presença"))}catch{t.checked=!t.checked,g.error("Erro ao atualizar presença")}}async handleAddMember(){const e=document.getElementById("member-form");e&&delete e.dataset.editingId,this.showModal("member-modal"),this.clearForm("member-form"),document.getElementById("member-modal-title").textContent="Adicionar Membro";const t=document.getElementById("member-type"),n=document.getElementById("member-candidate");if(t&&n){const r=()=>{const o=t.value==="Membro Comungante";n.disabled=!o,o?n.title="":(n.value="",n.title="Apenas Membros Comungantes podem ser candidatos")};r(),t.removeEventListener("change",r),t.addEventListener("change",r)}}async handleAddCandidate(){var l;await this.populateMemberSelect(),this.clearForm("candidate-form");const e=document.getElementById("candidate-member"),t=(l=document.querySelector("#candidate-member"))==null?void 0:l.closest(".form-group"),n=document.getElementById("candidate-role"),r=n==null?void 0:n.closest(".form-group"),o=document.getElementById("candidate-info-group");t&&(t.style.display="block"),r&&(r.style.display="block"),o&&(o.style.display="none"),e&&(e.required=!0),n&&(n.required=!0);const i=document.getElementById("candidate-modal-title");i&&(i.textContent="Novo Candidato");const a=document.getElementById("candidate-photo-preview"),c=document.getElementById("remove-photo-btn");a&&(a.innerHTML='<span class="material-icons md-48">person</span>',a.style.display="flex"),c&&(c.style.display="none"),this.showModal("candidate-modal")}async populateMemberSelect(){const e=await b.getMembers(),t=document.getElementById("candidate-member"),n=document.getElementById("member-search-input"),r=document.getElementById("no-members-message");if(!t)return;const o=e.filter(i=>i.tipo==="Membro Comungante"&&!i.candidato);t.availableMembers=o,this.renderMemberOptions(o,t),o.length===0?(r&&(r.style.display="block"),t.disabled=!0,n&&(n.disabled=!0)):(r&&(r.style.display="none"),t.disabled=!1,n&&(n.disabled=!1,n.value="",n.removeEventListener("input",this.handleMemberSearchInput),n.addEventListener("input",this.handleMemberSearchInput.bind(this))))}renderMemberOptions(e,t){if(t.innerHTML="",e.length===0){const n=document.createElement("option");n.value="",n.textContent="Nenhum membro disponível",n.disabled=!0,n.selected=!0,t.appendChild(n);return}e.forEach(n=>{const r=document.createElement("option");r.value=n.id,r.textContent=n.nome,r.dataset.memberData=JSON.stringify(n),t.appendChild(r)})}handleMemberSearchInput(e){const n=e.target.value.toLowerCase().trim(),r=document.getElementById("candidate-member");if(!r)return;const o=r.availableMembers||[];if(n==="")this.renderMemberOptions(o,r);else{const i=o.filter(a=>a.nome.toLowerCase().includes(n));this.renderMemberOptions(i,r)}}async handleMemberSubmit(e){e.preventDefault();const t=e.target,n=new FormData(t),r=t.dataset.editingId,o=n.get("type"),i=n.get("candidate")||null;if(i&&o!=="Membro Comungante"){g.error("Apenas Membros Comungantes podem ser candidatos a Presbítero ou Diácono");return}const a={nome:n.get("name"),tipo:o,cpf:n.get("cpf"),rg:n.get("rg"),email:n.get("email"),telefone:n.get("phone"),candidato:i};try{let c;r?(c=await b.updateMember(r,a),c.success?(g.success("Membro atualizado com sucesso!"),delete t.dataset.editingId,this.closeAllModals(),await this.loadMembersData(),await this.updateStats(),await this.loadCandidatesData()):g.error(c.error||"Erro ao atualizar membro")):(c=await b.addMember(a),c.success?(g.success("Membro adicionado com sucesso!"),this.closeAllModals(),await this.loadMembersData(),await this.updateStats()):g.error(c.error||"Erro ao adicionar membro"))}catch(c){console.error("Erro ao salvar membro:",c),g.error("Erro ao salvar membro")}}async handleDownloadTemplate(){try{await b.downloadTemplate(),g.success("Template CSV baixado com sucesso!")}catch{g.error("Erro ao baixar template")}}handleImportCSV(){var e;(e=document.getElementById("csv-file-input"))==null||e.click()}async handleCSVFileSelected(e){var r,o;const t=e.target,n=(r=t.files)==null?void 0:r[0];if(n){try{const i=await this.readFileAsText(n);console.log("[UIManager] Conteúdo do CSV:",i);const a=await b.importMembers(i);if(console.log("[UIManager] Resultado da importação:",a),a.success){const c=a.candidatesAdded>0?`${a.membersAdded} membros e ${a.candidatesAdded} candidatos importados!`:`${a.membersAdded} membros importados com sucesso!`;g.success(c),a.errors&&a.errors.length>0&&(console.warn("[UIManager] ⚠️ Erros/Avisos na importação:",a.errors),a.errors.forEach(l=>{console.error(`  - ${l}`)}),g.warning(`Importação concluída com ${a.errors.length} aviso(s). Veja o console para detalhes.`)),await this.loadMembersData()}else console.error("[UIManager] ✗ Falha na importação:",a.errors),g.error(`Erro na importação do CSV: ${((o=a.errors)==null?void 0:o[0])||"Erro desconhecido"}`)}catch(i){console.error("[UIManager] ✗ Exceção ao processar CSV:",i),g.error("Erro ao processar arquivo CSV")}t.value=""}}handleSettings(){this.showModal("settings-modal")}handleDarkModeToggle(e){e.target.checked?(document.body.classList.add("dark-mode"),localStorage.setItem("darkMode","true"),g.success("Modo noturno ativado")):(document.body.classList.remove("dark-mode"),localStorage.setItem("darkMode","false"),g.success("Modo claro ativado"))}async handleExport(){try{const e=await b.exportData();e.success?g.success("Dados exportados com sucesso!"):g.error(e.error||"Erro ao exportar dados")}catch{g.error("Erro ao exportar dados")}}handleImport(){var e;(e=document.getElementById("json-file-input"))==null||e.click()}async handleJSONFileSelected(e){var r;const t=e.target,n=(r=t.files)==null?void 0:r[0];if(n){try{const o=await this.readFileAsText(n),i=await b.importData(o);i.success?(g.success("Dados importados com sucesso!"),await this.loadInitialData()):g.error(i.error||"Erro ao importar dados")}catch{g.error("Erro ao processar arquivo de dados")}t.value=""}}async handleReport(){try{g.info("Gerando relatório PDF...");const e=await b.generateReport();e.success?g.success("Relatório gerado com sucesso!"):g.error(e.error||"Erro ao gerar relatório")}catch{g.error("Erro ao gerar relatório")}}showModal(e){if(this.activeModal=document.getElementById(e),!this.activeModal)return;this.lastFocusedElement=document.activeElement,this.activeModal.classList.add("modal-active"),document.body.classList.add("modal-open");const t=this.activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),n=Array.from(t).find(r=>!r.hasAttribute("disabled")&&r.offsetParent!==null);requestAnimationFrame(()=>{n==null||n.focus()})}closeAllModals(){document.querySelectorAll(".modal").forEach(t=>{t.classList.remove("modal-active")}),document.body.classList.remove("modal-open"),this.activeModal=null,this.lastFocusedElement&&(this.lastFocusedElement.focus(),this.lastFocusedElement=null);const e=document.getElementById("member-form");e&&e.dataset.editingId&&delete e.dataset.editingId}handleFocusTrap(e){if(e.key!=="Tab"||!this.activeModal)return;const t=Array.from(this.activeModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(o=>!o.hasAttribute("disabled")&&o.offsetParent!==null);if(t.length===0)return;const n=t[0],r=t[t.length-1];e.shiftKey?document.activeElement===n&&(r.focus(),e.preventDefault()):document.activeElement===r&&(n.focus(),e.preventDefault())}clearForm(e){const t=document.getElementById(e);t&&(t.reset(),t.dataset.editingId&&delete t.dataset.editingId)}async readFileAsText(e){return new Promise((t,n)=>{const r=new FileReader;r.onload=()=>t(r.result),r.onerror=()=>n(new Error("Erro ao ler arquivo")),r.readAsText(e)})}escapeHtml(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}debouncedUpdateStats(){const e=this.debounceTimers.get("updateStats");e&&clearTimeout(e);const t=window.setTimeout(()=>{this.updateStats(),this.debounceTimers.delete("updateStats")},100);this.debounceTimers.set("updateStats",t)}async updateStats(){var e,t,n,r;try{const[o,i]=await Promise.all([b.getMembers(),b.getAttendanceStats()]),a=o.filter(h=>h.tipo==="Membro Comungante"),l=o.filter(h=>h.tipo==="Membro Não-Comungante"||h.tipo==="Visitante").filter(h=>h.presente===!0).length;console.log("[updateStats] Attendance stats:",i),console.log("[updateStats] Membros Comungantes:",a.length),console.log("[updateStats] Não-votantes presentes:",l),this.updateElement("total-members",a.length.toString()),this.updateElement("present-members",((e=i.presentMembers)==null?void 0:e.toString())||"0"),this.updateElement("candidate-members",l.toString()),this.updateElement("attendance-rate",`${((t=i.attendanceRate)==null?void 0:t.toFixed(1))||0}%`),this.updateElement("attendance-present",((n=i.presentMembers)==null?void 0:n.toString())||"0"),this.updateElement("attendance-absent",((r=i.absentMembers)==null?void 0:r.toString())||"0")}catch(o){console.error("Erro ao atualizar estatísticas:",o)}}updateElement(e,t){const n=document.getElementById(e);n&&(n.textContent=t)}async loadCandidatesData(){try{console.log("[DEBUG loadCandidatesData] Carregando candidatos...");const e=await b.getCandidates();console.log("[DEBUG loadCandidatesData] Candidatos carregados:",e.map(i=>{var a;return{id:i.id,name:i.name,role:i.role,hasPhotoUrl:!!i.photoUrl,photoUrlLength:(a=i.photoUrl)==null?void 0:a.length}}));const t=e.filter(i=>i.role==="Presbítero"),n=e.filter(i=>i.role==="Diácono"),r=document.getElementById("presbyteros-list");r&&(t.length===0?r.innerHTML=`
            <div class="empty-state">
              <span class="material-icons md-48">person_off</span>
              <p>Nenhum candidato a Presbítero cadastrado</p>
            </div>
          `:r.innerHTML=t.map(i=>this.renderCandidateCard(i)).join(""));const o=document.getElementById("diaconos-list");o&&(n.length===0?o.innerHTML=`
            <div class="empty-state">
              <span class="material-icons md-48">person_off</span>
              <p>Nenhum candidato a Diácono cadastrado</p>
            </div>
          `:o.innerHTML=n.map(i=>this.renderCandidateCard(i)).join("")),this.attachCandidateEventListeners()}catch(e){console.error("Error loading candidates:",e),g.show("Erro ao carregar candidatos","error")}}renderCandidateCard(e){var n,r;console.log("[DEBUG renderCandidateCard] Renderizando card:",{id:e.id,name:e.name,hasPhotoUrl:!!e.photoUrl,photoUrlLength:(n=e.photoUrl)==null?void 0:n.length,photoUrlStart:(r=e.photoUrl)==null?void 0:r.substring(0,30)});const t=e.photoUrl?`<img src="${e.photoUrl}" alt="${e.name}" />`:'<span class="material-icons">person</span>';return console.log("[DEBUG renderCandidateCard] photoHtml gerado:",t.substring(0,100)),`
      <div class="candidate-card" data-id="${e.id}">
        <div class="candidate-photo">
          ${t}
        </div>
        <div class="candidate-info">
          <h4>${e.name}</h4>
          <p class="candidate-votes-label">Votos</p>
          <p class="candidate-votes">${e.votes}</p>
        </div>
        <div class="candidate-actions">
          <button class="btn btn-sm btn-secondary edit-candidate" data-id="${e.id}" title="Editar candidato">
            <span class="material-icons md-18">edit</span>
          </button>
          <button class="btn btn-sm btn-danger remove-candidate" data-id="${e.id}" data-role="${e.role}" title="Remover candidato">
            <span class="material-icons md-18">delete</span>
          </button>
        </div>
      </div>
    `}attachCandidateEventListeners(){document.querySelectorAll(".edit-candidate").forEach(e=>{e.addEventListener("click",async t=>{const r=t.currentTarget.dataset.id;r&&await this.handleEditCandidate(r)})}),document.querySelectorAll(".remove-candidate").forEach(e=>{e.addEventListener("click",async t=>{const n=t.currentTarget,r=n.dataset.id,o=n.dataset.role;r&&o&&await this.handleRemoveCandidate(r,o)})})}async handleEditCandidate(e){var A,F,$;const n=(await b.getCandidates()).find(G=>G.id===e);if(!n){g.show("Candidato não encontrado","error");return}const o=(await b.getMembers()).find(G=>G.id===n.id);if(!o){g.show("Membro correspondente não encontrado","error"),console.error(`[DEBUG] Membro não encontrado para candidate.id=${n.id}`);return}const i=document.getElementById("candidate-form"),a=document.getElementById("candidate-member"),c=(A=document.querySelector("#candidate-member"))==null?void 0:A.closest(".form-group"),l=document.getElementById("candidate-role"),h=l==null?void 0:l.closest(".form-group"),d=document.getElementById("candidate-photo-preview"),u=document.getElementById("remove-photo-btn");if(!i||!l){g.show("Erro ao abrir formulário","error");return}c&&(c.style.display="none"),h&&(h.style.display="none"),a&&(a.required=!1),l&&(l.required=!1);let m=document.getElementById("candidate-info-group");m||(m=document.createElement("div"),m.id="candidate-info-group",m.innerHTML=`
        <div class="form-group">
          <label>Nome do Candidato</label>
          <input
            type="text"
            id="candidate-info-name"
            class="form-input"
            readonly
            style="background-color: var(--gray-100); cursor: not-allowed;"
          />
        </div>
        <div class="form-group">
          <label>Cargo</label>
          <input
            type="text"
            id="candidate-info-role"
            class="form-input"
            readonly
            style="background-color: var(--gray-100); cursor: not-allowed;"
          />
        </div>
      `,h==null||h.insertAdjacentElement("beforebegin",m));const p=document.getElementById("candidate-info-name"),v=document.getElementById("candidate-info-role");p&&v&&(p.value=n.name,v.value=n.role==="Presbítero"?"Presbítero":"Diácono",m.style.display="block"),i.dataset.candidateRole=n.role,n.photoUrl&&d?(d.innerHTML=`<img src="${n.photoUrl}" alt="Foto do candidato" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />`,d.style.display="flex",u&&(u.style.display="inline-flex")):(d.innerHTML='<span class="material-icons md-48">person</span>',d.style.display="flex",u&&(u.style.display="none")),i.dataset.editingId=e,i.dataset.memberId=o.id,i.dataset.candidateRole=n.role,n.photoUrl?i.dataset.photoUrl=n.photoUrl:delete i.dataset.photoUrl,console.log("[DEBUG handleEditCandidate] Abrindo modal de edição:",{candidateId:e,name:n.name,role:n.role,hasPhoto:!!n.photoUrl,photoUrlLength:(F=n.photoUrl)==null?void 0:F.length,datasetPhotoUrl:($=i.dataset.photoUrl)==null?void 0:$.substring(0,50)});const S=document.getElementById("candidate-modal-title");S&&(S.textContent="Editar Candidato"),this.showModal("candidate-modal")}async handlePhotoUpload(e){var o;const n=(o=e.target.files)==null?void 0:o[0];if(!n)return;if(!n.type.startsWith("image/")){g.show("Por favor, selecione uma imagem válida","error");return}if(n.size>2*1024*1024){g.show("A imagem deve ter no máximo 2MB","error");return}const r=new FileReader;r.onload=i=>{var d;const a=(d=i.target)==null?void 0:d.result,c=document.getElementById("candidate-photo-preview"),l=document.getElementById("remove-photo-btn");c&&(c.innerHTML=`<img src="${a}" alt="Foto do candidato" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />`),l&&(l.style.display="inline-flex");const h=document.getElementById("candidate-form");h&&(h.dataset.photoUrl=a,console.log("[DEBUG handlePhotoUpload] Foto carregada:",{fileSize:n.size,fileType:n.type,photoUrlLength:a.length,photoUrlPreview:a.substring(0,50)+"..."}))},r.readAsDataURL(n)}handleRemovePhoto(){const e=document.getElementById("candidate-photo-preview"),t=document.getElementById("remove-photo-btn"),n=document.getElementById("candidate-photo"),r=document.getElementById("candidate-form");e&&(e.innerHTML='<span class="material-icons md-48">person</span>'),t&&(t.style.display="none"),n&&(n.value=""),r&&(r.dataset.photoUrl="")}openFullscreen(e){console.log("[openFullscreen] Iniciando com role:",e);const t=document.getElementById("fullscreen-view"),n=document.getElementById("fullscreen-candidates-grid"),r=document.getElementById("fullscreen-role-title");if(console.log("[openFullscreen] Elementos:",{fullscreenView:!!t,candidatesGrid:!!n,roleTitle:!!r}),!t||!n||!r){console.error("[openFullscreen] Elementos não encontrados!");return}r.textContent=e==="Presbítero"?"Presbíteros":"Diáconos",this.renderFullscreenCandidates(e,n),t.style.display="flex",t.requestFullscreen&&t.requestFullscreen().catch(o=>{console.error("Erro ao entrar em fullscreen:",o)})}closeFullscreen(){const e=document.getElementById("fullscreen-view");e&&(document.fullscreenElement&&document.exitFullscreen(),e.style.display="none")}async renderFullscreenCandidates(e,t){const r=(await b.getCandidates()).filter(o=>o.role===e);if(r.length===0){t.innerHTML=`
        <div class="empty-state">
          <span class="material-icons md-48">person_off</span>
          <p>Nenhum candidato cadastrado</p>
        </div>
      `;return}t.innerHTML=r.map(o=>{const i=o.photoUrl?`<img src="${o.photoUrl}" alt="${o.name}" />`:'<span class="material-icons">person</span>';return`
          <div class="fullscreen-candidate-card" data-id="${o.id}">
            <div class="fullscreen-candidate-photo" data-id="${o.id}">
              ${i}
            </div>
            <h3 class="fullscreen-candidate-name">${o.name}</h3>
            <div class="fullscreen-candidate-votes">${o.votes}</div>
          </div>
        `}).join(""),this.attachFullscreenSyncListeners()}attachFullscreenSyncListeners(){console.log("[UIManager] 🎥 Projeção configurada apenas para visualização")}async handleRemoveCandidate(e,t){if(!confirm(`Tem certeza que deseja remover este candidato a ${t}?`))return;const n=await b.updateMember(e,{candidato:null});n.success?(g.show("Candidato removido com sucesso","success"),await this.loadCandidatesData(),await this.loadMembersData()):g.show(n.error||"Erro ao remover candidato","error")}async loadVotingData(){try{console.log("[UIManager] Carregando dados de votação...");const[e,t,n]=await Promise.all([b.getElectionResults(),b.getCandidates(),b.getQuorumConfig()]);console.log("[UIManager] Dados de quórum recebidos:",e.quorum),this.renderQuorumStatus(e.quorum),this.applyQuorumBlur(e.quorum.isValid);const r=t.filter(c=>c.role==="Presbítero"),o=t.filter(c=>c.role==="Diácono"),i=(n==null?void 0:n.presbyteroPositions)||3,a=(n==null?void 0:n.diaconoPositions)||6;this.renderVotingCards("voting-presbyteros",r,e.quorum.votesRequired,i,e.quorum.isValid),this.renderVotingCards("voting-diaconos",o,e.quorum.votesRequired,a,e.quorum.isValid),console.log("[UIManager] ✓ Dados de votação carregados")}catch(e){console.error("[UIManager] Erro ao carregar dados de votação:",e),g.error("Erro ao carregar dados de votação")}}renderQuorumStatus(e){const t=document.getElementById("quorum-info");if(!t)return;const n=e.isValid?"status-valid":"status-invalid",r=e.isValid?"✓ VÁLIDO":"✗ INSUFICIENTE";t.innerHTML=`
      <div class="quorum-grid">
        <div class="quorum-item">
          <span class="quorum-label">Total de Membros</span>
          <span class="quorum-value">${e.totalMembers}</span>
        </div>
        <div class="quorum-item">
          <span class="quorum-label">Presentes</span>
          <span class="quorum-value">${e.presentMembers}</span>
        </div>
        <div class="quorum-item">
          <span class="quorum-label">Quórum Mínimo</span>
          <span class="quorum-value">${e.minimumQuorum}</span>
        </div>
        <div class="quorum-item">
          <span class="quorum-label">Votos Necessários</span>
          <span class="quorum-value">${e.votesRequired}</span>
        </div>
        <div class="quorum-item quorum-status-item quorum-status-highlight ${n}">
          <span class="quorum-label">Status do Quórum</span>
          <span class="quorum-value">
            ${r}
          </span>
        </div>
      </div>
    `}applyQuorumBlur(e){document.querySelectorAll(".voting-category").forEach(n=>{e?n.classList.remove("quorum-blur"):n.classList.add("quorum-blur")}),this.toggleQuorumMessage(!e)}toggleQuorumMessage(e){const t=document.getElementById("voting-tab");if(!t)return;let n=t.querySelector(".quorum-insufficient-message");if(e){if(!n){n=document.createElement("div"),n.className="quorum-insufficient-message",n.innerHTML=`
          <div class="info-banner">
            <div class="info-banner-icon">
              <span class="material-icons">warning</span>
            </div>
            <div class="info-banner-content">
              <div class="info-banner-title">Quórum Insuficiente</div>
              <div class="info-banner-text">
                O número mínimo de membros presentes não foi atingido. A votação está temporariamente bloqueada até que o quórum seja alcançado.
              </div>
            </div>
          </div>
        `;const r=t.querySelector(".quorum-card");r&&r.insertAdjacentElement("afterend",n)}n.style.display="block"}else n&&(n.style.display="none")}renderVotingCards(e,t,n,r,o=!0){const i=document.getElementById(e);if(!i)return;const a=[...t].sort((d,u)=>d.name.localeCompare(u.name,"pt-BR"));if(a.length===0){i.innerHTML=`
        <div class="empty-state">
          <span class="material-icons md-48">inbox</span>
          <p>Nenhum candidato cadastrado para este cargo</p>
          <small style="color: var(--gray-500); margin-top: 0.5rem;">
            Vagas disponíveis: ${r}
          </small>
        </div>
      `;return}const c=a.map(d=>{const u=o&&d.votes>=n,m=u?'<span class="elected-badge"><span class="material-icons md-18">check_circle</span> ELEITO</span>':"",p=d.photoUrl?`<img src="${d.photoUrl}" alt="${d.name}" class="voting-card-photo" />`:'<div class="voting-card-photo-placeholder"><span class="material-icons md-48">person</span></div>';return`
          <div class="voting-card ${u?"elected":""}">
            <div class="voting-card-header">
              ${p}
              ${m}
            </div>
            <div class="voting-card-body">
              <h4 class="voting-card-name">${d.name}</h4>
              <div class="voting-card-votes">
                <span class="votes-label">Votos</span>
                <span class="votes-count">${d.votes}</span>
              </div>
            </div>
            <div class="voting-card-actions">
              <button class="btn-vote btn-vote-decrease" data-candidate-id="${d.id}" data-action="decrease" ${o?"":"disabled"}>
                <span class="material-icons md-24">remove</span>
              </button>
              <button class="btn-vote btn-vote-reset" data-candidate-id="${d.id}" data-action="reset" title="Resetar votos" ${o?"":"disabled"}>
                <span class="material-icons md-24">refresh</span>
              </button>
              <button class="btn-vote btn-vote-increase" data-candidate-id="${d.id}" data-action="increase" ${o?"":"disabled"}>
                <span class="material-icons md-24">add</span>
              </button>
            </div>
          </div>
        `}),l=[],h=Math.max(0,r-a.length);for(let d=0;d<h;d++)l.push(`
        <div class="voting-card voting-card-empty">
          <div class="voting-card-header">
            <div class="voting-card-photo-placeholder">
              <span class="material-icons md-48" style="opacity: 0.3;">person_outline</span>
            </div>
          </div>
          <div class="voting-card-body">
            <h4 class="voting-card-name" style="color: var(--gray-400);">Vaga Disponível</h4>
            <div class="voting-card-votes">
              <span class="votes-label" style="opacity: 0.5;">Aguardando candidato</span>
            </div>
          </div>
        </div>
      `);i.innerHTML=[...c,...l].join(""),o?(i.querySelectorAll(".btn-vote").forEach(d=>{d.addEventListener("click",this.handleVoteAction.bind(this))}),i.querySelectorAll(".voting-card-header").forEach(d=>{const u=d.closest(".voting-card");u!=null&&u.classList.contains("voting-card-empty")||(d.addEventListener("click",async()=>{const m=u==null?void 0:u.querySelector(".btn-vote-increase");m&&m.click()}),d.style.cursor="pointer")})):i.querySelectorAll(".voting-card-header").forEach(d=>{d.style.cursor="not-allowed"})}async handleVoteAction(e){e.preventDefault();const t=e.currentTarget,n=t.dataset.candidateId,r=t.dataset.action;if(console.log("[UIManager] 🎯 handleVoteAction:",{candidateId:n,action:r}),!n||!r)return;if(!(await b.getElectionResults()).quorum.isValid){g.warning("Não é possível votar enquanto o quórum estiver insuficiente");return}try{if(r==="increase"){console.log("[UIManager] ➕ Adicionando voto (projeção)...");const i=await b.incrementVoteProjection(n);if(console.log("[UIManager] Resultado incrementVoteProjection:",i),i.success)g.show("Voto adicionado","success");else{g.error(i.error||"Erro ao adicionar voto");return}}else if(r==="decrease"){console.log("[UIManager] ➖ Removendo voto (projeção)...");const i=await b.decrementVoteProjection(n);if(console.log("[UIManager] Resultado decrementVoteProjection:",i),i.success)g.show("Voto removido","success");else{g.error(i.error||"Erro ao remover voto");return}}else if(r==="reset"){if(!confirm("Tem certeza que deseja resetar os votos deste candidato?"))return;console.log("[UIManager] 🔄 Resetando votos (projeção)...");const i=await b.resetVotesProjection(n);if(console.log("[UIManager] Resultado resetVotesProjection:",i),i.success)g.show("Votos resetados","success");else{g.error(i.error||"Erro ao resetar votos");return}}console.log("[UIManager] 🔄 Recarregando dados de votação..."),await this.loadVotingData(),console.log("[UIManager] ✅ Dados de votação recarregados!")}catch(i){console.error("[UIManager] Erro ao processar voto:",i),g.error("Erro ao processar voto")}}async loadAttendanceData(){try{console.log("[UIManager] Recarregando dados de presença..."),await this.loadMembersData(),console.log("[UIManager] ✓ Dados de presença recarregados")}catch(e){console.error("[UIManager] Erro ao recarregar dados de presença:",e)}}async loadResultsData(){try{const e=await b.getElectionResults(),t=document.getElementById("elected-presbyteros");t&&(e.presbyteros.length===0?t.innerHTML='<p class="empty-message">Nenhum presbítero eleito ainda</p>':t.innerHTML=e.presbyteros.map(o=>`
              <div class="elected-item">
                <span class="material-icons md-18">how_to_vote</span>
                <strong>${o.name}</strong>
                <span class="vote-count">${o.votes} votos</span>
              </div>
            `).join(""));const n=document.getElementById("elected-diaconos");n&&(e.diaconos.length===0?n.innerHTML='<p class="empty-message">Nenhum diácono eleito ainda</p>':n.innerHTML=e.diaconos.map(o=>`
              <div class="elected-item">
                <span class="material-icons md-18">how_to_vote</span>
                <strong>${o.name}</strong>
                <span class="vote-count">${o.votes} votos</span>
              </div>
            `).join(""));const r=document.getElementById("detailed-results-content");if(r){const o=[...e.presbyteros,...e.diaconos];o.length===0?r.innerHTML='<p class="empty-message">Nenhum candidato registrado</p>':r.innerHTML=`
            <div class="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Candidato</th>
                    <th>Cargo</th>
                    <th>Votos</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${o.sort((i,a)=>a.votes-i.votes).map(i=>`
                      <tr>
                        <td>${i.name}</td>
                        <td>${i.role}</td>
                        <td class="text-center">${i.votes}</td>
                        <td class="text-center">
                          ${i.isElected?'<span class="badge badge-success">Eleito</span>':'<span class="badge badge-secondary">Não Eleito</span>'}
                        </td>
                      </tr>
                    `).join("")}
                </tbody>
              </table>
            </div>
            <div class="results-summary-stats">
              <p><strong>Total de votos:</strong> ${e.totalVotes}</p>
              <p><strong>Quórum:</strong> ${e.quorum.isValid?"✅ Válido":"❌ Inválido"}</p>
              <p><strong>Presentes:</strong> ${e.quorum.presentMembers} / ${e.quorum.totalMembers}</p>
            </div>
          `}console.log("[UIManager] ✓ Resultados carregados")}catch(e){console.error("[UIManager] Erro ao carregar resultados:",e),g.error("Erro ao carregar resultados da eleição")}}async handleCandidateSubmit(e){var l;e.preventDefault();const t=e.target,n=document.getElementById("candidate-member"),r=document.getElementById("candidate-role"),o=t.dataset.editingId,i=t.dataset.photoUrl;console.log("[DEBUG handleCandidateSubmit] Iniciando submit:",{editingId:o,photoUrl:(i==null?void 0:i.substring(0,50))+"...",photoUrlType:typeof i,photoUrlLength:i==null?void 0:i.length,hasPhotoUrl:!!i,datasetKeys:Object.keys(t.dataset)});let a,c;if(o){if(c=t.dataset.memberId||"",a=t.dataset.candidateRole||"",!c){g.show("Erro: membro não identificado","error");return}if(!a){g.show("Erro: cargo não identificado","error");return}}else{if(!n||!r)return;if(c=n.value,a=r.value,!c){g.show("Por favor, selecione um membro","error");return}if(!a){g.show("Por favor, selecione um cargo","error");return}}if(o){console.log("[DEBUG handleCandidateSubmit] Atualizando candidato:",{editingId:o,hasPhotoUrl:!!i,photoUrlLength:i==null?void 0:i.length});const h={};i!==void 0&&(h.photoUrl=i||void 0);const d=await b.updateMember(o,h);if(!d.success){g.show(d.error||"Erro ao atualizar candidato","error");return}console.log("[DEBUG handleCandidateSubmit] Candidato atualizado:",{id:o,hasPhotoUrl:!!h.photoUrl,photoUrlLength:(l=h.photoUrl)==null?void 0:l.length}),g.show("Foto atualizada com sucesso","success")}else{const h=await b.updateMember(c,{candidato:a,photoUrl:i});if(h.success)g.show("Candidato adicionado com sucesso","success"),console.log(`[UIManager] Membro ${c} marcado como candidato ${a}`);else{g.show(h.error||"Erro ao adicionar candidato","error");return}}delete t.dataset.editingId,delete t.dataset.photoUrl,delete t.dataset.memberId,delete t.dataset.candidateRole,this.clearForm("candidate-form"),this.closeAllModals(),await this.loadCandidatesData(),await this.loadMembersData()}async handleConfigQuorum(){try{console.log("[UIManager] Carregando configuração do Firebase...");const e=await K.getInstance().loadInitialState();e.config&&(console.log("[UIManager] ✓ Configuração sincronizada do Firebase"),localStorage.setItem(x.CONFIG,JSON.stringify(e.config)));const t=await b.getQuorumConfig(),n=await b.getAttendanceStats(),r=document.getElementById("quorum-modal");if(!r)return;if(r.classList.add("modal-active"),t){document.getElementById("minimum-percentage").value=t.minimumPercentage.toString();const o=document.getElementById("votes-criteria"),i=document.getElementById("votes-percentage"),a=document.getElementById("custom-percentage-group");t.votesCriteria==="simple-majority"||t.votesRequiredPercentage===-1?(o.value="simple-majority",a&&(a.style.display="none")):(o.value="custom",i.value=t.votesRequiredPercentage.toString(),a&&(a.style.display="block")),document.getElementById("presbítero-positions").value=t.presbyteroPositions.toString(),document.getElementById("diacono-positions").value=t.diaconoPositions.toString()}this.setupQuorumPreview(n)}catch(e){console.error("Erro ao abrir configuração de quórum:",e),g.error("Erro ao carregar configurações")}}setupQuorumPreview(e){const t=["minimum-percentage","votes-criteria","votes-percentage","presbítero-positions","diacono-positions"],n=()=>{const i=parseFloat(document.getElementById("minimum-percentage").value||"50"),a=document.getElementById("votes-criteria").value,c=parseFloat(document.getElementById("votes-percentage").value||"60"),l=parseInt(document.getElementById("presbítero-positions").value||"3"),h=parseInt(document.getElementById("diacono-positions").value||"6"),d=e.totalMembers,u=e.presentMembers,m=Math.ceil(d*i/100);let p;a==="simple-majority"?p=Math.floor(u/2)+1:p=Math.ceil(u*c/100);const v=l+h,S=document.getElementById("minimum-percentage-hint");S&&(S.textContent=`Com ${d} membros, é necessário pelo menos ${m} presentes`);const A=document.getElementById("votes-percentage-hint");A&&(a==="simple-majority"?A.textContent=`Com ${u} presentes, cada candidato precisa de ${p} votos (maioria simples)`:A.textContent=`Com ${u} presentes, cada candidato precisa de ${p} votos para ser eleito`);const F=document.getElementById("preview-quorum");F&&(F.textContent=`${m} membros`);const $=document.getElementById("preview-votes");$&&($.textContent=`${p} votos`);const G=document.getElementById("preview-positions");G&&(G.textContent=`${v} oficiais`)},r=document.getElementById("votes-criteria"),o=document.getElementById("custom-percentage-group");r&&o&&r.addEventListener("change",i=>{i.target.value==="custom"?o.style.display="block":o.style.display="none",n()}),t.forEach(i=>{const a=document.getElementById(i);a&&a.addEventListener("input",n)}),n()}async handleQuorumSubmit(e){e.preventDefault();const t=e.target,n=new FormData(t),r=n.get("votesCriteria"),o={minimumPercentage:parseFloat(n.get("minimumPercentage")),votesCriteria:r,votesRequiredPercentage:r==="simple-majority"?-1:parseFloat(n.get("votesPercentage")),presbyteroPositions:parseInt(n.get("presbiteroPositions")),diaconoPositions:parseInt(n.get("diaconoPositions"))};if(o.minimumPercentage<.01||o.minimumPercentage>100){g.error("Percentual de presença deve estar entre 0.01% e 100%");return}if(r==="custom"&&(o.votesRequiredPercentage<.01||o.votesRequiredPercentage>100)){g.error("Percentual de votos deve estar entre 0.01% e 100%");return}if(o.presbyteroPositions<1||o.diaconoPositions<1){g.error("Deve haver pelo menos 1 vaga por cargo");return}try{const i=await b.updateQuorumConfig(o);if(i.success){g.success("Configurações de quórum atualizadas!"),this.closeAllModals();const a=document.querySelector(".tab-content.active");(a==null?void 0:a.id)==="voting-tab"&&await this.loadVotingData()}else g.error(i.error||"Erro ao salvar configurações")}catch(i){console.error("Erro ao salvar configurações de quórum:",i),g.error("Erro ao salvar configurações")}}async handleMarkAllPresent(){try{const e=await b.markAllPresent();e.success?(g.success(`${e.updated||0} membros marcados como presentes`),await this.loadAttendanceData()):g.error(e.error||"Erro ao marcar presenças")}catch(e){console.error("[UIManager] Erro ao marcar todos presentes:",e),g.error("Erro ao marcar todos como presentes")}}async handleMarkAllAbsent(){try{const e=await b.markAllAbsent();e.success?(g.success(`${e.updated||0} membros marcados como ausentes`),await this.loadAttendanceData()):g.error(e.error||"Erro ao marcar ausências")}catch(e){console.error("[UIManager] Erro ao marcar todos ausentes:",e),g.error("Erro ao marcar todos como ausentes")}}async handleAttendanceSearch(e){const n=e.target.value.trim().toLowerCase();this.debounce("attendance-search",async()=>{const r=await b.getMembers();if(n.length===0)await this.renderMembersTable(r);else{const o=r.filter(i=>{var l;const a=i.nome.toLowerCase().includes(n),c=((l=i.cpf)==null?void 0:l.includes(n))||!1;return a||c});await this.renderMembersTable(o)}},300)}async handleRefreshResults(){try{await this.loadResultsData(),g.success("Resultados atualizados")}catch(e){console.error("[UIManager] Erro ao atualizar resultados:",e),g.error("Erro ao atualizar resultados")}}};E(Se,"instance");let Zt=Se;window.editMember=async s=>{try{const t=(await b.getMembers()).find(c=>c.id===s);if(!t){g.error("Membro não encontrado");return}const n=document.getElementById("member-modal"),r=document.getElementById("member-form"),o=document.getElementById("member-modal-title");if(!n||!r||!o)return;o.textContent="Editar Membro",document.getElementById("member-name").value=t.nome,document.getElementById("member-type").value=t.tipo||"",document.getElementById("member-cpf").value=t.cpf||"",document.getElementById("member-rg").value=t.rg||"",document.getElementById("member-email").value=t.email||"",document.getElementById("member-phone").value=t.telefone||"",document.getElementById("member-candidate").value=t.candidato||"";const i=document.getElementById("member-type"),a=document.getElementById("member-candidate");if(i&&a){const c=()=>{const l=i.value==="Membro Comungante";a.disabled=!l,l?a.title="":(a.value="",a.title="Apenas Membros Comungantes podem ser candidatos")};c(),i.removeEventListener("change",c),i.addEventListener("change",c)}r.dataset.editingId=s,n.classList.add("modal-active"),document.body.classList.add("modal-open")}catch(e){console.error("Erro ao editar membro:",e),g.error("Erro ao carregar dados do membro")}};window.deleteMember=async s=>{try{const t=(await b.getMembers()).find(o=>o.id===s);if(!t){g.error("Membro não encontrado");return}if(!confirm(`Tem certeza que deseja excluir o membro "${t.nome}"?

Esta ação não pode ser desfeita.`))return;const r=await b.deleteMember(s);if(r.success){g.success(`Membro "${t.nome}" excluído com sucesso!`);const o=Zt.getInstance();await o.loadMembersData(),await o.updateStats()}else g.error(r.error||"Erro ao excluir membro")}catch(e){console.error("Erro ao deletar membro:",e),g.error("Erro ao excluir membro")}};function lu(){try{const s="ELECTION_APP_CANDIDATES";localStorage.getItem(s)&&(console.log("[Migration] Removendo storage obsoleto:",s),localStorage.removeItem(s),console.log("[Migration] ✓ Storage CANDIDATES removido - agora usa apenas MEMBERS"))}catch(s){console.warn("[Migration] Erro ao remover storage obsoleto:",s)}}document.addEventListener("DOMContentLoaded",async()=>{try{lu();const s=document.getElementById("loading-screen"),e=document.getElementById("app");if(!s||!e)throw new Error("Elementos DOM essenciais não encontrados");g.getInstance(),console.log("[Main] 1/4 - Inicializando sistema de eleição...");const t=await b.initialize();if(console.log("[Main] ElectionApp inicializado:",t),!t.success)throw new Error(t.error||"Erro desconhecido na inicialização");console.log("[Main] 2/4 - Inicializando interface...");const n=Zt.getInstance();console.log("[Main] UIManager instanciado"),console.log("[Main] 3/4 - Carregando dados iniciais da UI..."),await n.initialize(),console.log("[Main] UIManager inicializado"),console.log("[Main] 4/4 - Exibindo interface..."),s.style.display="none",e.style.display="block",console.log("[Main] ✓ Sistema inicializado com sucesso!"),g.show("Sistema inicializado com sucesso!","success",{duration:3e3})}catch(s){console.error("Erro fatal na inicialização:",s),_.log(s,"main.ts.initialize");const e=document.getElementById("loading-screen");e&&(e.innerHTML=`
        <div class="error-container">
          <h2>Erro na Inicialização</h2>
          <p>${s.message}</p>
          <button onclick="location.reload()" class="btn btn-primary">
            Tentar Novamente
          </button>
        </div>
      `)}});window.addEventListener("error",s=>{_.log(s.error,"window.error"),g.show("Ocorreu um erro inesperado. Verifique o console para mais detalhes.","error")});window.addEventListener("unhandledrejection",s=>{_.log(new Error(s.reason),"window.unhandledrejection"),g.show("Erro em operação assíncrona. Verifique o console para mais detalhes.","error")});"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").then(s=>{console.log("[PWA] Service Worker registrado:",s.scope)}).catch(s=>{console.error("[PWA] Falha ao registrar Service Worker:",s)})});try{window.electionApp=b,window.ErrorHandler=_}catch{}
//# sourceMappingURL=index-Bci_j_ZI.js.map
