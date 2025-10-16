import{o as so}from"./vendor-mpHdot-v.js";const io=()=>{};var cs={};/**
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
 */const si={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
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
 */const f=function(n,e){if(!n)throw De(e)},De=function(n){return new Error("Firebase Database ("+si.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
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
 */const ii=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let i=n.charCodeAt(s);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&s+1<n.length&&(n.charCodeAt(s+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++s)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},ro=function(n){const e=[];let t=0,s=0;for(;t<n.length;){const i=n[t++];if(i<128)e[s++]=String.fromCharCode(i);else if(i>191&&i<224){const r=n[t++];e[s++]=String.fromCharCode((i&31)<<6|r&63)}else if(i>239&&i<365){const r=n[t++],o=n[t++],a=n[t++],l=((i&7)<<18|(r&63)<<12|(o&63)<<6|a&63)-65536;e[s++]=String.fromCharCode(55296+(l>>10)),e[s++]=String.fromCharCode(56320+(l&1023))}else{const r=n[t++],o=n[t++];e[s++]=String.fromCharCode((i&15)<<12|(r&63)<<6|o&63)}}return e.join("")},Tn={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let i=0;i<n.length;i+=3){const r=n[i],o=i+1<n.length,a=o?n[i+1]:0,l=i+2<n.length,c=l?n[i+2]:0,d=r>>2,u=(r&3)<<4|a>>4;let h=(a&15)<<2|c>>6,_=c&63;l||(_=64,o||(h=64)),s.push(t[d],t[u],t[h],t[_])}return s.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(ii(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):ro(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let i=0;i<n.length;){const r=t[n.charAt(i++)],a=i<n.length?t[n.charAt(i)]:0;++i;const c=i<n.length?t[n.charAt(i)]:64;++i;const u=i<n.length?t[n.charAt(i)]:64;if(++i,r==null||a==null||c==null||u==null)throw new oo;const h=r<<2|a>>4;if(s.push(h),c!==64){const _=a<<4&240|c>>2;if(s.push(_),u!==64){const p=c<<6&192|u;s.push(p)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class oo extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ri=function(n){const e=ii(n);return Tn.encodeByteArray(e,!0)},Ct=function(n){return ri(n).replace(/\./g,"")},ln=function(n){try{return Tn.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function ao(n){return oi(void 0,n)}function oi(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!lo(t)||(n[t]=oi(n[t],e[t]));return n}function lo(n){return n!=="__proto__"}/**
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
 */function co(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const ho=()=>co().__FIREBASE_DEFAULTS__,uo=()=>{if(typeof process>"u"||typeof cs>"u")return;const n=cs.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},fo=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&ln(n[1]);return e&&JSON.parse(e)},ai=()=>{try{return io()||ho()||uo()||fo()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},_o=n=>{var e,t;return(t=(e=ai())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},li=n=>{const e=_o(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),s]:[e.substring(0,t),s]},ci=()=>{var n;return(n=ai())==null?void 0:n.config};/**
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
 */class Lt{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,s)=>{t?this.reject(t):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,s))}}}/**
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
 */function ot(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function hi(n){return(await fetch(n,{credentials:"include"})).ok}/**
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
 */function ui(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},s=e||"demo-project",i=n.iat||0,r=n.sub||n.user_id;if(!r)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${s}`,aud:s,iat:i,exp:i+3600,auth_time:i,sub:r,user_id:r,firebase:{sign_in_provider:"custom",identities:{}},...n};return[Ct(JSON.stringify(t)),Ct(JSON.stringify(o)),""].join(".")}const Ve={};function po(){const n={prod:[],emulator:[]};for(const e of Object.keys(Ve))Ve[e]?n.emulator.push(e):n.prod.push(e);return n}function go(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let hs=!1;function di(n,e){if(typeof window>"u"||typeof document>"u"||!ot(window.location.host)||Ve[n]===e||Ve[n]||hs)return;Ve[n]=e;function t(h){return`__firebase__banner__${h}`}const s="__firebase__banner",r=po().prod.length>0;function o(){const h=document.getElementById(s);h&&h.remove()}function a(h){h.style.display="flex",h.style.background="#7faaf0",h.style.position="fixed",h.style.bottom="5px",h.style.left="5px",h.style.padding=".5em",h.style.borderRadius="5px",h.style.alignItems="center"}function l(h,_){h.setAttribute("width","24"),h.setAttribute("id",_),h.setAttribute("height","24"),h.setAttribute("viewBox","0 0 24 24"),h.setAttribute("fill","none"),h.style.marginLeft="-6px"}function c(){const h=document.createElement("span");return h.style.cursor="pointer",h.style.marginLeft="16px",h.style.fontSize="24px",h.innerHTML=" &times;",h.onclick=()=>{hs=!0,o()},h}function d(h,_){h.setAttribute("id",_),h.innerText="Learn more",h.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",h.setAttribute("target","__blank"),h.style.paddingLeft="5px",h.style.textDecoration="underline"}function u(){const h=go(s),_=t("text"),p=document.getElementById(_)||document.createElement("span"),m=t("learnmore"),E=document.getElementById(m)||document.createElement("a"),U=t("preprendIcon"),F=document.getElementById(U)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(h.created){const D=h.element;a(D),d(E,m);const P=c();l(F,U),D.append(F,p,E,P),document.body.appendChild(D)}r?(p.innerText="Preview backend disconnected.",F.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
</defs>`,p.innerText="Preview backend running in this workspace."),p.setAttribute("id",_)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",u):u()}/**
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
 */function mo(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function fi(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(mo())}function yo(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Co(){return si.NODE_ADMIN===!0}function vo(){try{return typeof indexedDB=="object"}catch{return!1}}function Eo(){return new Promise((n,e)=>{try{let t=!0;const s="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(s);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(s),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var r;e(((r=i.error)==null?void 0:r.message)||"")}}catch(t){e(t)}})}/**
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
 */const wo="FirebaseError";class Pe extends Error{constructor(e,t,s){super(t),this.code=e,this.customData=s,this.name=wo,Object.setPrototypeOf(this,Pe.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,_i.prototype.create)}}class _i{constructor(e,t,s){this.service=e,this.serviceName=t,this.errors=s}create(e,...t){const s=t[0]||{},i=`${this.service}/${e}`,r=this.errors[e],o=r?bo(r,s):"Error",a=`${this.serviceName}: ${o} (${i}).`;return new Pe(i,a,s)}}function bo(n,e){return n.replace(Io,(t,s)=>{const i=e[s];return i!=null?String(i):`<${s}?>`})}const Io=/\{\$([^}]+)}/g;/**
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
 */function Ke(n){return JSON.parse(n)}function k(n){return JSON.stringify(n)}/**
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
 */const pi=function(n){let e={},t={},s={},i="";try{const r=n.split(".");e=Ke(ln(r[0])||""),t=Ke(ln(r[1])||""),i=r[2],s=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:s,signature:i}},To=function(n){const e=pi(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},So=function(n){const e=pi(n).claims;return typeof e=="object"&&e.admin===!0};/**
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
 */function se(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function Re(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function us(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function vt(n,e,t){const s={};for(const i in n)Object.prototype.hasOwnProperty.call(n,i)&&(s[i]=e.call(t,n[i],i,n));return s}function Et(n,e){if(n===e)return!0;const t=Object.keys(n),s=Object.keys(e);for(const i of t){if(!s.includes(i))return!1;const r=n[i],o=e[i];if(ds(r)&&ds(o)){if(!Et(r,o))return!1}else if(r!==o)return!1}for(const i of s)if(!t.includes(i))return!1;return!0}function ds(n){return n!==null&&typeof n=="object"}/**
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
 */function Ro(n){const e=[];for(const[t,s]of Object.entries(n))Array.isArray(s)?s.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}/**
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
 */class No{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const s=this.W_;if(typeof e=="string")for(let u=0;u<16;u++)s[u]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let u=0;u<16;u++)s[u]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let u=16;u<80;u++){const h=s[u-3]^s[u-8]^s[u-14]^s[u-16];s[u]=(h<<1|h>>>31)&4294967295}let i=this.chain_[0],r=this.chain_[1],o=this.chain_[2],a=this.chain_[3],l=this.chain_[4],c,d;for(let u=0;u<80;u++){u<40?u<20?(c=a^r&(o^a),d=1518500249):(c=r^o^a,d=1859775393):u<60?(c=r&o|a&(r|o),d=2400959708):(c=r^o^a,d=3395469782);const h=(i<<5|i>>>27)+c+l+d+s[u]&4294967295;l=a,a=o,o=(r<<30|r>>>2)&4294967295,r=i,i=h}this.chain_[0]=this.chain_[0]+i&4294967295,this.chain_[1]=this.chain_[1]+r&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+a&4294967295,this.chain_[4]=this.chain_[4]+l&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const s=t-this.blockSize;let i=0;const r=this.buf_;let o=this.inbuf_;for(;i<t;){if(o===0)for(;i<=s;)this.compress_(e,i),i+=this.blockSize;if(typeof e=="string"){for(;i<t;)if(r[o]=e.charCodeAt(i),++o,++i,o===this.blockSize){this.compress_(r),o=0;break}}else for(;i<t;)if(r[o]=e[i],++o,++i,o===this.blockSize){this.compress_(r),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let i=this.blockSize-1;i>=56;i--)this.buf_[i]=t&255,t/=256;this.compress_(this.buf_);let s=0;for(let i=0;i<5;i++)for(let r=24;r>=0;r-=8)e[s]=this.chain_[i]>>r&255,++s;return e}}function Sn(n,e){return`${n} failed: ${e} argument `}/**
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
 */const Ao=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let i=n.charCodeAt(s);if(i>=55296&&i<=56319){const r=i-55296;s++,f(s<n.length,"Surrogate pair missing trail surrogate.");const o=n.charCodeAt(s)-56320;i=65536+(r<<10)+o}i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):i<65536?(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},Ft=function(n){let e=0;for(let t=0;t<n.length;t++){const s=n.charCodeAt(t);s<128?e++:s<2048?e+=2:s>=55296&&s<=56319?(e+=4,t++):e+=3}return e};/**
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
 */function Q(n){return n&&n._delegate?n._delegate:n}class Ne{constructor(e,t,s){this.name=e,this.instanceFactory=t,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const fe="[DEFAULT]";/**
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
 */class ko{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const s=new Lt;if(this.instancesDeferred.set(t,s),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&s.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Do(e))try{this.getOrInitializeService({instanceIdentifier:fe})}catch{}for(const[t,s]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const r=this.getOrInitializeService({instanceIdentifier:i});s.resolve(r)}catch{}}}}clearInstance(e=fe){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=fe){return this.instances.has(e)}getOptions(e=fe){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:s,options:t});for(const[r,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(r);s===a&&o.resolve(i)}return i}onInit(e,t){const s=this.normalizeInstanceIdentifier(t),i=this.onInitCallbacks.get(s)??new Set;i.add(e),this.onInitCallbacks.set(s,i);const r=this.instances.get(s);return r&&e(r,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const s=this.onInitCallbacks.get(t);if(s)for(const i of s)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:xo(e),options:t}),this.instances.set(e,s),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=fe){return this.component?this.component.multipleInstances?e:fe:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function xo(n){return n===fe?void 0:n}function Do(n){return n.instantiationMode==="EAGER"}/**
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
 */class Po{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new ko(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var I;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(I||(I={}));const Oo={debug:I.DEBUG,verbose:I.VERBOSE,info:I.INFO,warn:I.WARN,error:I.ERROR,silent:I.SILENT},Mo=I.INFO,Lo={[I.DEBUG]:"log",[I.VERBOSE]:"log",[I.INFO]:"info",[I.WARN]:"warn",[I.ERROR]:"error"},Fo=(n,e,...t)=>{if(e<n.logLevel)return;const s=new Date().toISOString(),i=Lo[e];if(i)console[i](`[${s}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class gi{constructor(e){this.name=e,this._logLevel=Mo,this._logHandler=Fo,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in I))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Oo[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,I.DEBUG,...e),this._logHandler(this,I.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,I.VERBOSE,...e),this._logHandler(this,I.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,I.INFO,...e),this._logHandler(this,I.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,I.WARN,...e),this._logHandler(this,I.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,I.ERROR,...e),this._logHandler(this,I.ERROR,...e)}}/**
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
 */class Uo{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Bo(t)){const s=t.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(t=>t).join(" ")}}function Bo(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const cn="@firebase/app",fs="0.14.4";/**
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
 */const te=new gi("@firebase/app"),Wo="@firebase/app-compat",Ho="@firebase/analytics-compat",Vo="@firebase/analytics",$o="@firebase/app-check-compat",Go="@firebase/app-check",zo="@firebase/auth",qo="@firebase/auth-compat",jo="@firebase/database",Yo="@firebase/data-connect",Ko="@firebase/database-compat",Qo="@firebase/functions",Xo="@firebase/functions-compat",Jo="@firebase/installations",Zo="@firebase/installations-compat",ea="@firebase/messaging",ta="@firebase/messaging-compat",na="@firebase/performance",sa="@firebase/performance-compat",ia="@firebase/remote-config",ra="@firebase/remote-config-compat",oa="@firebase/storage",aa="@firebase/storage-compat",la="@firebase/firestore",ca="@firebase/ai",ha="@firebase/firestore-compat",ua="firebase",da="12.4.0";/**
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
 */const hn="[DEFAULT]",fa={[cn]:"fire-core",[Wo]:"fire-core-compat",[Vo]:"fire-analytics",[Ho]:"fire-analytics-compat",[Go]:"fire-app-check",[$o]:"fire-app-check-compat",[zo]:"fire-auth",[qo]:"fire-auth-compat",[jo]:"fire-rtdb",[Yo]:"fire-data-connect",[Ko]:"fire-rtdb-compat",[Qo]:"fire-fn",[Xo]:"fire-fn-compat",[Jo]:"fire-iid",[Zo]:"fire-iid-compat",[ea]:"fire-fcm",[ta]:"fire-fcm-compat",[na]:"fire-perf",[sa]:"fire-perf-compat",[ia]:"fire-rc",[ra]:"fire-rc-compat",[oa]:"fire-gcs",[aa]:"fire-gcs-compat",[la]:"fire-fst",[ha]:"fire-fst-compat",[ca]:"fire-vertex","fire-js":"fire-js",[ua]:"fire-js-all"};/**
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
 */const wt=new Map,_a=new Map,un=new Map;function _s(n,e){try{n.container.addComponent(e)}catch(t){te.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Qe(n){const e=n.name;if(un.has(e))return te.debug(`There were multiple attempts to register component ${e}.`),!1;un.set(e,n);for(const t of wt.values())_s(t,n);for(const t of _a.values())_s(t,n);return!0}function mi(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function yi(n){return n==null?!1:n.settings!==void 0}/**
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
 */const pa={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},oe=new _i("app","Firebase",pa);/**
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
 */class ga{constructor(e,t,s){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new Ne("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw oe.create("app-deleted",{appName:this._name})}}/**
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
 */const Ci=da;function ma(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const s={name:hn,automaticDataCollectionEnabled:!0,...e},i=s.name;if(typeof i!="string"||!i)throw oe.create("bad-app-name",{appName:String(i)});if(t||(t=ci()),!t)throw oe.create("no-options");const r=wt.get(i);if(r){if(Et(t,r.options)&&Et(s,r.config))return r;throw oe.create("duplicate-app",{appName:i})}const o=new Po(i);for(const l of un.values())o.addComponent(l);const a=new ga(t,s,o);return wt.set(i,a),a}function vi(n=hn){const e=wt.get(n);if(!e&&n===hn&&ci())return ma();if(!e)throw oe.create("no-app",{appName:n});return e}function ae(n,e,t){let s=fa[n]??n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),r=e.match(/\s|\//);if(i||r){const o=[`Unable to register library "${s}" with version "${e}":`];i&&o.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&r&&o.push("and"),r&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),te.warn(o.join(" "));return}Qe(new Ne(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const ya="firebase-heartbeat-database",Ca=1,Xe="firebase-heartbeat-store";let Xt=null;function Ei(){return Xt||(Xt=so(ya,Ca,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Xe)}catch(t){console.warn(t)}}}}).catch(n=>{throw oe.create("idb-open",{originalErrorMessage:n.message})})),Xt}async function va(n){try{const t=(await Ei()).transaction(Xe),s=await t.objectStore(Xe).get(wi(n));return await t.done,s}catch(e){if(e instanceof Pe)te.warn(e.message);else{const t=oe.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});te.warn(t.message)}}}async function ps(n,e){try{const s=(await Ei()).transaction(Xe,"readwrite");await s.objectStore(Xe).put(e,wi(n)),await s.done}catch(t){if(t instanceof Pe)te.warn(t.message);else{const s=oe.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});te.warn(s.message)}}}function wi(n){return`${n.name}!${n.options.appId}`}/**
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
 */const Ea=1024,wa=30;class ba{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new Ta(t),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),r=gs();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===r||this._heartbeatsCache.heartbeats.some(o=>o.date===r))return;if(this._heartbeatsCache.heartbeats.push({date:r,agent:i}),this._heartbeatsCache.heartbeats.length>wa){const o=Sa(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){te.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=gs(),{heartbeatsToSend:s,unsentEntries:i}=Ia(this._heartbeatsCache.heartbeats),r=Ct(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(t){return te.warn(t),""}}}function gs(){return new Date().toISOString().substring(0,10)}function Ia(n,e=Ea){const t=[];let s=n.slice();for(const i of n){const r=t.find(o=>o.agent===i.agent);if(r){if(r.dates.push(i.date),ms(t)>e){r.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),ms(t)>e){t.pop();break}s=s.slice(1)}return{heartbeatsToSend:t,unsentEntries:s}}class Ta{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return vo()?Eo().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await va(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return ps(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return ps(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function ms(n){return Ct(JSON.stringify({version:2,heartbeats:n})).length}function Sa(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let s=1;s<n.length;s++)n[s].date<t&&(t=n[s].date,e=s);return e}/**
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
 */function Ra(n){Qe(new Ne("platform-logger",e=>new Uo(e),"PRIVATE")),Qe(new Ne("heartbeat",e=>new ba(e),"PRIVATE")),ae(cn,fs,n),ae(cn,fs,"esm2020"),ae("fire-js","")}Ra("");var Na="firebase",Aa="12.4.0";/**
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
 */ae(Na,Aa,"app");var ys={};const Cs="@firebase/database",vs="1.1.0";/**
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
 */let bi="";function ka(n){bi=n}/**
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
 */class xa{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),k(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Ke(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
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
 */class Da{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return se(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
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
 */const Ii=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new xa(e)}}catch{}return new Da},pe=Ii("localStorage"),Pa=Ii("sessionStorage");/**
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
 */const Te=new gi("@firebase/database"),Oa=function(){let n=1;return function(){return n++}}(),Ti=function(n){const e=Ao(n),t=new No;t.update(e);const s=t.digest();return Tn.encodeByteArray(s)},at=function(...n){let e="";for(let t=0;t<n.length;t++){const s=n[t];Array.isArray(s)||s&&typeof s=="object"&&typeof s.length=="number"?e+=at.apply(null,s):typeof s=="object"?e+=k(s):e+=s,e+=" "}return e};let $e=null,Es=!0;const Ma=function(n,e){f(!0,"Can't turn on custom loggers persistently."),Te.logLevel=I.VERBOSE,$e=Te.log.bind(Te)},B=function(...n){if(Es===!0&&(Es=!1,$e===null&&Pa.get("logging_enabled")===!0&&Ma()),$e){const e=at.apply(null,n);$e(e)}},lt=function(n){return function(...e){B(n,...e)}},dn=function(...n){const e="FIREBASE INTERNAL ERROR: "+at(...n);Te.error(e)},ne=function(...n){const e=`FIREBASE FATAL ERROR: ${at(...n)}`;throw Te.error(e),new Error(e)},$=function(...n){const e="FIREBASE WARNING: "+at(...n);Te.warn(e)},La=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&$("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},Si=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},Fa=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},Ae="[MIN_NAME]",ye="[MAX_NAME]",Oe=function(n,e){if(n===e)return 0;if(n===Ae||e===ye)return-1;if(e===Ae||n===ye)return 1;{const t=ws(n),s=ws(e);return t!==null?s!==null?t-s===0?n.length-e.length:t-s:-1:s!==null?1:n<e?-1:1}},Ua=function(n,e){return n===e?0:n<e?-1:1},Fe=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+k(e))},Rn=function(n){if(typeof n!="object"||n===null)return k(n);const e=[];for(const s in n)e.push(s);e.sort();let t="{";for(let s=0;s<e.length;s++)s!==0&&(t+=","),t+=k(e[s]),t+=":",t+=Rn(n[e[s]]);return t+="}",t},Ri=function(n,e){const t=n.length;if(t<=e)return[n];const s=[];for(let i=0;i<t;i+=e)i+e>t?s.push(n.substring(i,t)):s.push(n.substring(i,i+e));return s};function G(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const Ni=function(n){f(!Si(n),"Invalid JSON number");const e=11,t=52,s=(1<<e-1)-1;let i,r,o,a,l;n===0?(r=0,o=0,i=1/n===-1/0?1:0):(i=n<0,n=Math.abs(n),n>=Math.pow(2,1-s)?(a=Math.min(Math.floor(Math.log(n)/Math.LN2),s),r=a+s,o=Math.round(n*Math.pow(2,t-a)-Math.pow(2,t))):(r=0,o=Math.round(n/Math.pow(2,1-s-t))));const c=[];for(l=t;l;l-=1)c.push(o%2?1:0),o=Math.floor(o/2);for(l=e;l;l-=1)c.push(r%2?1:0),r=Math.floor(r/2);c.push(i?1:0),c.reverse();const d=c.join("");let u="";for(l=0;l<64;l+=8){let h=parseInt(d.substr(l,8),2).toString(16);h.length===1&&(h="0"+h),u=u+h}return u.toLowerCase()},Ba=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},Wa=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function Ha(n,e){let t="Unknown Error";n==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":n==="permission_denied"?t="Client doesn't have permission to access the desired data.":n==="unavailable"&&(t="The service is unavailable");const s=new Error(n+" at "+e._path.toString()+": "+t);return s.code=n.toUpperCase(),s}const Va=new RegExp("^-?(0*)\\d{1,10}$"),$a=-2147483648,Ga=2147483647,ws=function(n){if(Va.test(n)){const e=Number(n);if(e>=$a&&e<=Ga)return e}return null},Me=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw $("Exception was thrown by user callback.",t),e},Math.floor(0))}},za=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},Ge=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
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
 */class qa{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,yi(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(s=>this.appCheck=s)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,s)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)==null||t.get().then(s=>s.addTokenListener(e))}notifyForInvalidToken(){$(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
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
 */class ja{constructor(e,t,s){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=s,this.auth_=null,this.auth_=s.getImmediate({optional:!0}),this.auth_||s.onInit(i=>this.auth_=i)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(B("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,s)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',$(e)}}class yt{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}yt.OWNER="owner";/**
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
 */const Nn="5",Ai="v",ki="s",xi="r",Di="f",Pi=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,Oi="ls",Mi="p",fn="ac",Li="websocket",Fi="long_polling";/**
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
 */class Ui{constructor(e,t,s,i,r=!1,o="",a=!1,l=!1,c=null){this.secure=t,this.namespace=s,this.webSocketOnly=i,this.nodeAdmin=r,this.persistenceKey=o,this.includeNamespaceInQueryParams=a,this.isUsingEmulator=l,this.emulatorOptions=c,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=pe.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&pe.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function Ya(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function Bi(n,e,t){f(typeof e=="string","typeof type must == string"),f(typeof t=="object","typeof params must == object");let s;if(e===Li)s=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Fi)s=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);Ya(n)&&(t.ns=n.namespace);const i=[];return G(t,(r,o)=>{i.push(r+"="+o)}),s+i.join("&")}/**
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
 */class Ka{constructor(){this.counters_={}}incrementCounter(e,t=1){se(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return ao(this.counters_)}}/**
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
 */const Jt={},Zt={};function An(n){const e=n.toString();return Jt[e]||(Jt[e]=new Ka),Jt[e]}function Qa(n,e){const t=n.toString();return Zt[t]||(Zt[t]=e()),Zt[t]}/**
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
 */class Xa{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const s=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let i=0;i<s.length;++i)s[i]&&Me(()=>{this.onMessage_(s[i])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
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
 */const bs="start",Ja="close",Za="pLPCommand",el="pRTLPCB",Wi="id",Hi="pw",Vi="ser",tl="cb",nl="seg",sl="ts",il="d",rl="dframe",$i=1870,Gi=30,ol=$i-Gi,al=25e3,ll=3e4;class Ie{constructor(e,t,s,i,r,o,a){this.connId=e,this.repoInfo=t,this.applicationId=s,this.appCheckToken=i,this.authToken=r,this.transportSessionId=o,this.lastSessionId=a,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=lt(e),this.stats_=An(t),this.urlFn=l=>(this.appCheckToken&&(l[fn]=this.appCheckToken),Bi(t,Fi,l))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new Xa(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(ll)),Fa(()=>{if(this.isClosed_)return;this.scriptTagHolder=new kn((...r)=>{const[o,a,l,c,d]=r;if(this.incrementIncomingBytes_(r),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===bs)this.id=a,this.password=l;else if(o===Ja)a?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(a,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...r)=>{const[o,a]=r;this.incrementIncomingBytes_(r),this.myPacketOrderer.handleResponse(o,a)},()=>{this.onClosed_()},this.urlFn);const s={};s[bs]="t",s[Vi]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(s[tl]=this.scriptTagHolder.uniqueCallbackIdentifier),s[Ai]=Nn,this.transportSessionId&&(s[ki]=this.transportSessionId),this.lastSessionId&&(s[Oi]=this.lastSessionId),this.applicationId&&(s[Mi]=this.applicationId),this.appCheckToken&&(s[fn]=this.appCheckToken),typeof location<"u"&&location.hostname&&Pi.test(location.hostname)&&(s[xi]=Di);const i=this.urlFn(s);this.log_("Connecting via long-poll to "+i),this.scriptTagHolder.addTag(i,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){Ie.forceAllow_=!0}static forceDisallow(){Ie.forceDisallow_=!0}static isAvailable(){return Ie.forceAllow_?!0:!Ie.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!Ba()&&!Wa()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=k(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=ri(t),i=Ri(s,ol);for(let r=0;r<i.length;r++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,i.length,i[r]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const s={};s[rl]="t",s[Wi]=e,s[Hi]=t,this.myDisconnFrame.src=this.urlFn(s),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=k(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class kn{constructor(e,t,s,i){this.onDisconnect=s,this.urlFn=i,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=Oa(),window[Za+this.uniqueCallbackIdentifier]=e,window[el+this.uniqueCallbackIdentifier]=t,this.myIFrame=kn.createIFrame_();let r="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(r='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+r+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(a){B("frame writing exception"),a.stack&&B(a.stack),B(a)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||B("No IE domain setting required")}catch{const s=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+s+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[Wi]=this.myID,e[Hi]=this.myPW,e[Vi]=this.currentSerial;let t=this.urlFn(e),s="",i=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+Gi+s.length<=$i;){const o=this.pendingSegs.shift();s=s+"&"+nl+i+"="+o.seg+"&"+sl+i+"="+o.ts+"&"+il+i+"="+o.d,i++}return t=t+s,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,s){this.pendingSegs.push({seg:e,ts:t,d:s}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const s=()=>{this.outstandingRequests.delete(t),this.newRequest_()},i=setTimeout(s,Math.floor(al)),r=()=>{clearTimeout(i),s()};this.addTag(e,r)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const s=this.myIFrame.doc.createElement("script");s.type="text/javascript",s.async=!0,s.src=e,s.onload=s.onreadystatechange=function(){const i=s.readyState;(!i||i==="loaded"||i==="complete")&&(s.onload=s.onreadystatechange=null,s.parentNode&&s.parentNode.removeChild(s),t())},s.onerror=()=>{B("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(s)}catch{}},Math.floor(1))}}/**
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
 */const cl=16384,hl=45e3;let bt=null;typeof MozWebSocket<"u"?bt=MozWebSocket:typeof WebSocket<"u"&&(bt=WebSocket);class q{constructor(e,t,s,i,r,o,a){this.connId=e,this.applicationId=s,this.appCheckToken=i,this.authToken=r,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=lt(this.connId),this.stats_=An(t),this.connURL=q.connectionURL_(t,o,a,i,s),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,s,i,r){const o={};return o[Ai]=Nn,typeof location<"u"&&location.hostname&&Pi.test(location.hostname)&&(o[xi]=Di),t&&(o[ki]=t),s&&(o[Oi]=s),i&&(o[fn]=i),r&&(o[Mi]=r),Bi(e,Li,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,pe.set("previous_websocket_failure",!0);try{let s;Co(),this.mySock=new bt(this.connURL,[],s)}catch(s){this.log_("Error instantiating WebSocket.");const i=s.message||s.data;i&&this.log_(i),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=s=>{this.handleIncomingFrame(s)},this.mySock.onerror=s=>{this.log_("WebSocket error.  Closing connection.");const i=s.message||s.data;i&&this.log_(i),this.onClosed_()}}start(){}static forceDisallow(){q.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,s=navigator.userAgent.match(t);s&&s.length>1&&parseFloat(s[1])<4.4&&(e=!0)}return!e&&bt!==null&&!q.forceDisallow_}static previouslyFailed(){return pe.isInMemoryStorage||pe.get("previous_websocket_failure")===!0}markConnectionHealthy(){pe.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const s=Ke(t);this.onMessage(s)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(f(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const s=this.extractFrameCount_(t);s!==null&&this.appendFrame_(s)}}send(e){this.resetKeepAlive();const t=k(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=Ri(t,cl);s.length>1&&this.sendString_(String(s.length));for(let i=0;i<s.length;i++)this.sendString_(s[i])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(hl))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}q.responsesRequiredToBeHealthy=2;q.healthyTimeout=3e4;/**
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
 */class Je{static get ALL_TRANSPORTS(){return[Ie,q]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=q&&q.isAvailable();let s=t&&!q.previouslyFailed();if(e.webSocketOnly&&(t||$("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),s=!0),s)this.transports_=[q];else{const i=this.transports_=[];for(const r of Je.ALL_TRANSPORTS)r&&r.isAvailable()&&i.push(r);Je.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}Je.globalTransportInitialized_=!1;/**
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
 */const ul=6e4,dl=5e3,fl=10*1024,_l=100*1024,en="t",Is="d",pl="s",Ts="r",gl="e",Ss="o",Rs="a",Ns="n",As="p",ml="h";class yl{constructor(e,t,s,i,r,o,a,l,c,d){this.id=e,this.repoInfo_=t,this.applicationId_=s,this.appCheckToken_=i,this.authToken_=r,this.onMessage_=o,this.onReady_=a,this.onDisconnect_=l,this.onKill_=c,this.lastSessionId=d,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=lt("c:"+this.id+":"),this.transportManager_=new Je(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),s=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,s)},Math.floor(0));const i=e.healthyTimeout||0;i>0&&(this.healthyTimeout_=Ge(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>_l?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>fl?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(i)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(en in e){const t=e[en];t===Rs?this.upgradeIfSecondaryHealthy_():t===Ts?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===Ss&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=Fe("t",e),s=Fe("d",e);if(t==="c")this.onSecondaryControl_(s);else if(t==="d")this.pendingDataMessages.push(s);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:As,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:Rs,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Ns,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=Fe("t",e),s=Fe("d",e);t==="c"?this.onControl_(s):t==="d"&&this.onDataMessage_(s)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=Fe(en,e);if(Is in e){const s=e[Is];if(t===ml){const i={...s};this.repoInfo_.isUsingEmulator&&(i.h=this.repoInfo_.host),this.onHandshake_(i)}else if(t===Ns){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let i=0;i<this.pendingDataMessages.length;++i)this.onDataMessage_(this.pendingDataMessages[i]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===pl?this.onConnectionShutdown_(s):t===Ts?this.onReset_(s):t===gl?dn("Server Error: "+s):t===Ss?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):dn("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,s=e.v,i=e.h;this.sessionId=e.s,this.repoInfo_.host=i,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),Nn!==s&&$("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),s=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,s),Ge(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(ul))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):Ge(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(dl))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:As,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(pe.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
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
 */class zi{put(e,t,s,i){}merge(e,t,s,i){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,s){}onDisconnectMerge(e,t,s){}onDisconnectCancel(e,t){}reportStats(e){}}/**
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
 */class qi{constructor(e){this.allowedEvents_=e,this.listeners_={},f(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const s=[...this.listeners_[e]];for(let i=0;i<s.length;i++)s[i].callback.apply(s[i].context,t)}}on(e,t,s){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:s});const i=this.getInitialEvent(e);i&&t.apply(s,i)}off(e,t,s){this.validateEventType_(e);const i=this.listeners_[e]||[];for(let r=0;r<i.length;r++)if(i[r].callback===t&&(!s||s===i[r].context)){i.splice(r,1);return}}validateEventType_(e){f(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
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
 */class It extends qi{static getInstance(){return new It}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!fi()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return f(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
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
 */const ks=32,xs=768;class b{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let s=0;for(let i=0;i<this.pieces_.length;i++)this.pieces_[i].length>0&&(this.pieces_[s]=this.pieces_[i],s++);this.pieces_.length=s,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function w(){return new b("")}function y(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function he(n){return n.pieces_.length-n.pieceNum_}function T(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new b(n.pieces_,e)}function ji(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function Cl(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function Yi(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function Ki(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new b(e,0)}function x(n,e){const t=[];for(let s=n.pieceNum_;s<n.pieces_.length;s++)t.push(n.pieces_[s]);if(e instanceof b)for(let s=e.pieceNum_;s<e.pieces_.length;s++)t.push(e.pieces_[s]);else{const s=e.split("/");for(let i=0;i<s.length;i++)s[i].length>0&&t.push(s[i])}return new b(t,0)}function v(n){return n.pieceNum_>=n.pieces_.length}function H(n,e){const t=y(n),s=y(e);if(t===null)return e;if(t===s)return H(T(n),T(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function xn(n,e){if(he(n)!==he(e))return!1;for(let t=n.pieceNum_,s=e.pieceNum_;t<=n.pieces_.length;t++,s++)if(n.pieces_[t]!==e.pieces_[s])return!1;return!0}function j(n,e){let t=n.pieceNum_,s=e.pieceNum_;if(he(n)>he(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[s])return!1;++t,++s}return!0}class vl{constructor(e,t){this.errorPrefix_=t,this.parts_=Yi(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let s=0;s<this.parts_.length;s++)this.byteLength_+=Ft(this.parts_[s]);Qi(this)}}function El(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=Ft(e),Qi(n)}function wl(n){const e=n.parts_.pop();n.byteLength_-=Ft(e),n.parts_.length>0&&(n.byteLength_-=1)}function Qi(n){if(n.byteLength_>xs)throw new Error(n.errorPrefix_+"has a key path longer than "+xs+" bytes ("+n.byteLength_+").");if(n.parts_.length>ks)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+ks+") or object contains a cycle "+_e(n))}function _e(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
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
 */class Dn extends qi{static getInstance(){return new Dn}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const s=!document[e];s!==this.visible_&&(this.visible_=s,this.trigger("visible",s))},!1)}getInitialEvent(e){return f(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
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
 */const Ue=1e3,bl=60*5*1e3,Ds=30*1e3,Il=1.3,Tl=3e4,Sl="server_kill",Ps=3;class ee extends zi{constructor(e,t,s,i,r,o,a,l){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=s,this.onConnectStatus_=i,this.onServerInfoUpdate_=r,this.authTokenProvider_=o,this.appCheckTokenProvider_=a,this.authOverride_=l,this.id=ee.nextPersistentConnectionId_++,this.log_=lt("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Ue,this.maxReconnectDelay_=bl,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,l)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");Dn.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&It.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,s){const i=++this.requestNumber_,r={r:i,a:e,b:t};this.log_(k(r)),f(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(r),s&&(this.requestCBHash_[i]=s)}get(e){this.initConnection_();const t=new Lt,i={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const a=o.d;o.s==="ok"?t.resolve(a):t.reject(a)}};this.outstandingGets_.push(i),this.outstandingGetCount_++;const r=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(r),t.promise}listen(e,t,s,i){this.initConnection_();const r=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+r),this.listens.has(o)||this.listens.set(o,new Map),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),f(!this.listens.get(o).has(r),"listen() called twice for same path/queryId.");const a={onComplete:i,hashFn:t,query:e,tag:s};this.listens.get(o).set(r,a),this.connected_&&this.sendListen_(a)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,s=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(s)})}sendListen_(e){const t=e.query,s=t._path.toString(),i=t._queryIdentifier;this.log_("Listen on "+s+" for "+i);const r={p:s},o="q";e.tag&&(r.q=t._queryObject,r.t=e.tag),r.h=e.hashFn(),this.sendRequest(o,r,a=>{const l=a.d,c=a.s;ee.warnOnListenWarnings_(l,t),(this.listens.get(s)&&this.listens.get(s).get(i))===e&&(this.log_("listen response",a),c!=="ok"&&this.removeListen_(s,i),e.onComplete&&e.onComplete(c,l))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&se(e,"w")){const s=Re(e,"w");if(Array.isArray(s)&&~s.indexOf("no_index")){const i='".indexOn": "'+t._queryParams.getIndex().toString()+'"',r=t._path.toString();$(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${i} at ${r} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||So(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=Ds)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=To(e)?"auth":"gauth",s={cred:e};this.authOverride_===null?s.noauth=!0:typeof this.authOverride_=="object"&&(s.authvar=this.authOverride_),this.sendRequest(t,s,i=>{const r=i.s,o=i.d||"error";this.authToken_===e&&(r==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(r,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,s=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,s)})}unlisten(e,t){const s=e._path.toString(),i=e._queryIdentifier;this.log_("Unlisten called for "+s+" "+i),f(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(s,i)&&this.connected_&&this.sendUnlisten_(s,i,e._queryObject,t)}sendUnlisten_(e,t,s,i){this.log_("Unlisten on "+e+" for "+t);const r={p:e},o="n";i&&(r.q=s,r.t=i),this.sendRequest(o,r)}onDisconnectPut(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:s})}onDisconnectMerge(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:s})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,s,i){const r={p:t,d:s};this.log_("onDisconnect "+e,r),this.sendRequest(e,r,o=>{i&&setTimeout(()=>{i(o.s,o.d)},Math.floor(0))})}put(e,t,s,i){this.putInternal("p",e,t,s,i)}merge(e,t,s,i){this.putInternal("m",e,t,s,i)}putInternal(e,t,s,i,r){this.initConnection_();const o={p:t,d:s};r!==void 0&&(o.h=r),this.outstandingPuts_.push({action:e,request:o,onComplete:i}),this.outstandingPutCount_++;const a=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(a):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,s=this.outstandingPuts_[e].request,i=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,s,r=>{this.log_(t+" response",r),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),i&&i(r.s,r.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,s=>{if(s.s!=="ok"){const r=s.d;this.log_("reportStats","Error sending stats: "+r)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+k(e));const t=e.r,s=this.requestCBHash_[t];s&&(delete this.requestCBHash_[t],s(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):dn("Unrecognized action received from server: "+k(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){f(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Ue,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Ue,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>Tl&&(this.reconnectDelay_=Ue),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*Il)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),s=this.onRealtimeDisconnect_.bind(this),i=this.id+":"+ee.nextConnectionId_++,r=this.lastSessionId;let o=!1,a=null;const l=function(){a?a.close():(o=!0,s())},c=function(u){f(a,"sendRequest call when we're not connected not allowed."),a.sendRequest(u)};this.realtime_={close:l,sendRequest:c};const d=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[u,h]=await Promise.all([this.authTokenProvider_.getToken(d),this.appCheckTokenProvider_.getToken(d)]);o?B("getToken() completed but was canceled"):(B("getToken() completed. Creating connection."),this.authToken_=u&&u.accessToken,this.appCheckToken_=h&&h.token,a=new yl(i,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,s,_=>{$(_+" ("+this.repoInfo_.toString()+")"),this.interrupt(Sl)},r))}catch(u){this.log_("Failed to get token: "+u),o||(this.repoInfo_.nodeAdmin&&$(u),l())}}}interrupt(e){B("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){B("Resuming connection for reason: "+e),delete this.interruptReasons_[e],us(this.interruptReasons_)&&(this.reconnectDelay_=Ue,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let s;t?s=t.map(r=>Rn(r)).join("$"):s="default";const i=this.removeListen_(e,s);i&&i.onComplete&&i.onComplete("permission_denied")}removeListen_(e,t){const s=new b(e).toString();let i;if(this.listens.has(s)){const r=this.listens.get(s);i=r.get(t),r.delete(t),r.size===0&&this.listens.delete(s)}else i=void 0;return i}onAuthRevoked_(e,t){B("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=Ps&&(this.reconnectDelay_=Ds,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){B("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=Ps&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+bi.replace(/\./g,"-")]=1,fi()?e["framework.cordova"]=1:yo()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=It.getInstance().currentlyOnline();return us(this.interruptReasons_)&&e}}ee.nextPersistentConnectionId_=0;ee.nextConnectionId_=0;/**
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
 */class C{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new C(e,t)}}/**
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
 */class Ut{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const s=new C(Ae,e),i=new C(Ae,t);return this.compare(s,i)!==0}minPost(){return C.MIN}}/**
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
 */let _t;class Xi extends Ut{static get __EMPTY_NODE(){return _t}static set __EMPTY_NODE(e){_t=e}compare(e,t){return Oe(e.name,t.name)}isDefinedOn(e){throw De("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return C.MIN}maxPost(){return new C(ye,_t)}makePost(e,t){return f(typeof e=="string","KeyIndex indexValue must always be a string."),new C(e,_t)}toString(){return".key"}}const Se=new Xi;/**
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
 */class pt{constructor(e,t,s,i,r=null){this.isReverse_=i,this.resultGenerator_=r,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?s(e.key,t):1,i&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class M{constructor(e,t,s,i,r){this.key=e,this.value=t,this.color=s??M.RED,this.left=i??V.EMPTY_NODE,this.right=r??V.EMPTY_NODE}copy(e,t,s,i,r){return new M(e??this.key,t??this.value,s??this.color,i??this.left,r??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let i=this;const r=s(e,i.key);return r<0?i=i.copy(null,null,null,i.left.insert(e,t,s),null):r===0?i=i.copy(null,t,null,null,null):i=i.copy(null,null,null,null,i.right.insert(e,t,s)),i.fixUp_()}removeMin_(){if(this.left.isEmpty())return V.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let s,i;if(s=this,t(e,s.key)<0)!s.left.isEmpty()&&!s.left.isRed_()&&!s.left.left.isRed_()&&(s=s.moveRedLeft_()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed_()&&(s=s.rotateRight_()),!s.right.isEmpty()&&!s.right.isRed_()&&!s.right.left.isRed_()&&(s=s.moveRedRight_()),t(e,s.key)===0){if(s.right.isEmpty())return V.EMPTY_NODE;i=s.right.min_(),s=s.copy(i.key,i.value,null,null,s.right.removeMin_())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,M.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,M.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}M.RED=!0;M.BLACK=!1;class Rl{copy(e,t,s,i,r){return this}insert(e,t,s){return new M(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class V{constructor(e,t=V.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new V(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,M.BLACK,null,null))}remove(e){return new V(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,M.BLACK,null,null))}get(e){let t,s=this.root_;for(;!s.isEmpty();){if(t=this.comparator_(e,s.key),t===0)return s.value;t<0?s=s.left:t>0&&(s=s.right)}return null}getPredecessorKey(e){let t,s=this.root_,i=null;for(;!s.isEmpty();)if(t=this.comparator_(e,s.key),t===0){if(s.left.isEmpty())return i?i.key:null;for(s=s.left;!s.right.isEmpty();)s=s.right;return s.key}else t<0?s=s.left:t>0&&(i=s,s=s.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new pt(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new pt(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new pt(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new pt(this.root_,null,this.comparator_,!0,e)}}V.EMPTY_NODE=new Rl;/**
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
 */function Nl(n,e){return Oe(n.name,e.name)}function Pn(n,e){return Oe(n,e)}/**
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
 */let _n;function Al(n){_n=n}const Ji=function(n){return typeof n=="number"?"number:"+Ni(n):"string:"+n},Zi=function(n){if(n.isLeafNode()){const e=n.val();f(typeof e=="string"||typeof e=="number"||typeof e=="object"&&se(e,".sv"),"Priority must be a string or number.")}else f(n===_n||n.isEmpty(),"priority of unexpected type.");f(n===_n||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
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
 */let Os;class O{static set __childrenNodeConstructor(e){Os=e}static get __childrenNodeConstructor(){return Os}constructor(e,t=O.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,f(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),Zi(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new O(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:O.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return v(e)?this:y(e)===".priority"?this.priorityNode_:O.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:O.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const s=y(e);return s===null?t:t.isEmpty()&&s!==".priority"?this:(f(s!==".priority"||he(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(s,O.__childrenNodeConstructor.EMPTY_NODE.updateChild(T(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+Ji(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=Ni(this.value_):e+=this.value_,this.lazyHash_=Ti(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===O.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof O.__childrenNodeConstructor?-1:(f(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,s=typeof this.value_,i=O.VALUE_TYPE_ORDER.indexOf(t),r=O.VALUE_TYPE_ORDER.indexOf(s);return f(i>=0,"Unknown leaf type: "+t),f(r>=0,"Unknown leaf type: "+s),i===r?s==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:r-i}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}O.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
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
 */let er,tr;function kl(n){er=n}function xl(n){tr=n}class Dl extends Ut{compare(e,t){const s=e.node.getPriority(),i=t.node.getPriority(),r=s.compareTo(i);return r===0?Oe(e.name,t.name):r}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return C.MIN}maxPost(){return new C(ye,new O("[PRIORITY-POST]",tr))}makePost(e,t){const s=er(e);return new C(t,new O("[PRIORITY-POST]",s))}toString(){return".priority"}}const R=new Dl;/**
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
 */const Pl=Math.log(2);class Ol{constructor(e){const t=r=>parseInt(Math.log(r)/Pl,10),s=r=>parseInt(Array(r+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const i=s(this.count);this.bits_=e+1&i}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Tt=function(n,e,t,s){n.sort(e);const i=function(l,c){const d=c-l;let u,h;if(d===0)return null;if(d===1)return u=n[l],h=t?t(u):u,new M(h,u.node,M.BLACK,null,null);{const _=parseInt(d/2,10)+l,p=i(l,_),m=i(_+1,c);return u=n[_],h=t?t(u):u,new M(h,u.node,M.BLACK,p,m)}},r=function(l){let c=null,d=null,u=n.length;const h=function(p,m){const E=u-p,U=u;u-=p;const F=i(E+1,U),D=n[E],P=t?t(D):D;_(new M(P,D.node,m,null,F))},_=function(p){c?(c.left=p,c=p):(d=p,c=p)};for(let p=0;p<l.count;++p){const m=l.nextBitIsOne(),E=Math.pow(2,l.count-(p+1));m?h(E,M.BLACK):(h(E,M.BLACK),h(E,M.RED))}return d},o=new Ol(n.length),a=r(o);return new V(s||e,a)};/**
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
 */let tn;const be={};class Z{static get Default(){return f(be&&R,"ChildrenNode.ts has not been loaded"),tn=tn||new Z({".priority":be},{".priority":R}),tn}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=Re(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof V?t:null}hasIndex(e){return se(this.indexSet_,e.toString())}addIndex(e,t){f(e!==Se,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const s=[];let i=!1;const r=t.getIterator(C.Wrap);let o=r.getNext();for(;o;)i=i||e.isDefinedOn(o.node),s.push(o),o=r.getNext();let a;i?a=Tt(s,e.getCompare()):a=be;const l=e.toString(),c={...this.indexSet_};c[l]=e;const d={...this.indexes_};return d[l]=a,new Z(d,c)}addToIndexes(e,t){const s=vt(this.indexes_,(i,r)=>{const o=Re(this.indexSet_,r);if(f(o,"Missing index implementation for "+r),i===be)if(o.isDefinedOn(e.node)){const a=[],l=t.getIterator(C.Wrap);let c=l.getNext();for(;c;)c.name!==e.name&&a.push(c),c=l.getNext();return a.push(e),Tt(a,o.getCompare())}else return be;else{const a=t.get(e.name);let l=i;return a&&(l=l.remove(new C(e.name,a))),l.insert(e,e.node)}});return new Z(s,this.indexSet_)}removeFromIndexes(e,t){const s=vt(this.indexes_,i=>{if(i===be)return i;{const r=t.get(e.name);return r?i.remove(new C(e.name,r)):i}});return new Z(s,this.indexSet_)}}/**
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
 */let Be;class g{static get EMPTY_NODE(){return Be||(Be=new g(new V(Pn),null,Z.Default))}constructor(e,t,s){this.children_=e,this.priorityNode_=t,this.indexMap_=s,this.lazyHash_=null,this.priorityNode_&&Zi(this.priorityNode_),this.children_.isEmpty()&&f(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Be}updatePriority(e){return this.children_.isEmpty()?this:new g(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Be:t}}getChild(e){const t=y(e);return t===null?this:this.getImmediateChild(t).getChild(T(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(f(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const s=new C(e,t);let i,r;t.isEmpty()?(i=this.children_.remove(e),r=this.indexMap_.removeFromIndexes(s,this.children_)):(i=this.children_.insert(e,t),r=this.indexMap_.addToIndexes(s,this.children_));const o=i.isEmpty()?Be:this.priorityNode_;return new g(i,o,r)}}updateChild(e,t){const s=y(e);if(s===null)return t;{f(y(e)!==".priority"||he(e)===1,".priority must be the last token in a path");const i=this.getImmediateChild(s).updateChild(T(e),t);return this.updateImmediateChild(s,i)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let s=0,i=0,r=!0;if(this.forEachChild(R,(o,a)=>{t[o]=a.val(e),s++,r&&g.INTEGER_REGEXP_.test(o)?i=Math.max(i,Number(o)):r=!1}),!e&&r&&i<2*s){const o=[];for(const a in t)o[a]=t[a];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+Ji(this.getPriority().val())+":"),this.forEachChild(R,(t,s)=>{const i=s.hash();i!==""&&(e+=":"+t+":"+i)}),this.lazyHash_=e===""?"":Ti(e)}return this.lazyHash_}getPredecessorChildName(e,t,s){const i=this.resolveIndex_(s);if(i){const r=i.getPredecessorKey(new C(e,t));return r?r.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.minKey();return s&&s.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new C(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.maxKey();return s&&s.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new C(t,this.children_.get(t)):null}forEachChild(e,t){const s=this.resolveIndex_(e);return s?s.inorderTraversal(i=>t(i.name,i.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getIteratorFrom(e,i=>i);{const i=this.children_.getIteratorFrom(e.name,C.Wrap);let r=i.peek();for(;r!=null&&t.compare(r,e)<0;)i.getNext(),r=i.peek();return i}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getReverseIteratorFrom(e,i=>i);{const i=this.children_.getReverseIteratorFrom(e.name,C.Wrap);let r=i.peek();for(;r!=null&&t.compare(r,e)>0;)i.getNext(),r=i.peek();return i}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===ct?-1:0}withIndex(e){if(e===Se||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new g(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===Se||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const s=this.getIterator(R),i=t.getIterator(R);let r=s.getNext(),o=i.getNext();for(;r&&o;){if(r.name!==o.name||!r.node.equals(o.node))return!1;r=s.getNext(),o=i.getNext()}return r===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===Se?null:this.indexMap_.get(e.toString())}}g.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class Ml extends g{constructor(){super(new V(Pn),g.EMPTY_NODE,Z.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return g.EMPTY_NODE}isEmpty(){return!1}}const ct=new Ml;Object.defineProperties(C,{MIN:{value:new C(Ae,g.EMPTY_NODE)},MAX:{value:new C(ye,ct)}});Xi.__EMPTY_NODE=g.EMPTY_NODE;O.__childrenNodeConstructor=g;Al(ct);xl(ct);/**
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
 */const Ll=!0;function L(n,e=null){if(n===null)return g.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),f(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new O(t,L(e))}if(!(n instanceof Array)&&Ll){const t=[];let s=!1;if(G(n,(o,a)=>{if(o.substring(0,1)!=="."){const l=L(a);l.isEmpty()||(s=s||!l.getPriority().isEmpty(),t.push(new C(o,l)))}}),t.length===0)return g.EMPTY_NODE;const r=Tt(t,Nl,o=>o.name,Pn);if(s){const o=Tt(t,R.getCompare());return new g(r,L(e),new Z({".priority":o},{".priority":R}))}else return new g(r,L(e),Z.Default)}else{let t=g.EMPTY_NODE;return G(n,(s,i)=>{if(se(n,s)&&s.substring(0,1)!=="."){const r=L(i);(r.isLeafNode()||!r.isEmpty())&&(t=t.updateImmediateChild(s,r))}}),t.updatePriority(L(e))}}kl(L);/**
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
 */class Fl extends Ut{constructor(e){super(),this.indexPath_=e,f(!v(e)&&y(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const s=this.extractChild(e.node),i=this.extractChild(t.node),r=s.compareTo(i);return r===0?Oe(e.name,t.name):r}makePost(e,t){const s=L(e),i=g.EMPTY_NODE.updateChild(this.indexPath_,s);return new C(t,i)}maxPost(){const e=g.EMPTY_NODE.updateChild(this.indexPath_,ct);return new C(ye,e)}toString(){return Yi(this.indexPath_,0).join("/")}}/**
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
 */class Ul extends Ut{compare(e,t){const s=e.node.compareTo(t.node);return s===0?Oe(e.name,t.name):s}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return C.MIN}maxPost(){return C.MAX}makePost(e,t){const s=L(e);return new C(t,s)}toString(){return".value"}}const Bl=new Ul;/**
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
 */function nr(n){return{type:"value",snapshotNode:n}}function ke(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function Ze(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function et(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function Wl(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
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
 */class On{constructor(e){this.index_=e}updateChild(e,t,s,i,r,o){f(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const a=e.getImmediateChild(t);return a.getChild(i).equals(s.getChild(i))&&a.isEmpty()===s.isEmpty()||(o!=null&&(s.isEmpty()?e.hasChild(t)?o.trackChildChange(Ze(t,a)):f(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):a.isEmpty()?o.trackChildChange(ke(t,s)):o.trackChildChange(et(t,s,a))),e.isLeafNode()&&s.isEmpty())?e:e.updateImmediateChild(t,s).withIndex(this.index_)}updateFullNode(e,t,s){return s!=null&&(e.isLeafNode()||e.forEachChild(R,(i,r)=>{t.hasChild(i)||s.trackChildChange(Ze(i,r))}),t.isLeafNode()||t.forEachChild(R,(i,r)=>{if(e.hasChild(i)){const o=e.getImmediateChild(i);o.equals(r)||s.trackChildChange(et(i,r,o))}else s.trackChildChange(ke(i,r))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?g.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
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
 */class tt{constructor(e){this.indexedFilter_=new On(e.getIndex()),this.index_=e.getIndex(),this.startPost_=tt.getStartPost_(e),this.endPost_=tt.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,s=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&s}updateChild(e,t,s,i,r,o){return this.matches(new C(t,s))||(s=g.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,s,i,r,o)}updateFullNode(e,t,s){t.isLeafNode()&&(t=g.EMPTY_NODE);let i=t.withIndex(this.index_);i=i.updatePriority(g.EMPTY_NODE);const r=this;return t.forEachChild(R,(o,a)=>{r.matches(new C(o,a))||(i=i.updateImmediateChild(o,g.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,i,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
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
 */class Hl{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const s=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?s<=0:s<0},this.withinEndPost=t=>{const s=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?s<=0:s<0},this.rangedFilter_=new tt(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,s,i,r,o){return this.rangedFilter_.matches(new C(t,s))||(s=g.EMPTY_NODE),e.getImmediateChild(t).equals(s)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,s,i,r,o):this.fullLimitUpdateChild_(e,t,s,r,o)}updateFullNode(e,t,s){let i;if(t.isLeafNode()||t.isEmpty())i=g.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){i=g.EMPTY_NODE.withIndex(this.index_);let r;this.reverse_?r=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):r=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let o=0;for(;r.hasNext()&&o<this.limit_;){const a=r.getNext();if(this.withinDirectionalStart(a))if(this.withinDirectionalEnd(a))i=i.updateImmediateChild(a.name,a.node),o++;else break;else continue}}else{i=t.withIndex(this.index_),i=i.updatePriority(g.EMPTY_NODE);let r;this.reverse_?r=i.getReverseIterator(this.index_):r=i.getIterator(this.index_);let o=0;for(;r.hasNext();){const a=r.getNext();o<this.limit_&&this.withinDirectionalStart(a)&&this.withinDirectionalEnd(a)?o++:i=i.updateImmediateChild(a.name,g.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,i,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,s,i,r){let o;if(this.reverse_){const u=this.index_.getCompare();o=(h,_)=>u(_,h)}else o=this.index_.getCompare();const a=e;f(a.numChildren()===this.limit_,"");const l=new C(t,s),c=this.reverse_?a.getFirstChild(this.index_):a.getLastChild(this.index_),d=this.rangedFilter_.matches(l);if(a.hasChild(t)){const u=a.getImmediateChild(t);let h=i.getChildAfterChild(this.index_,c,this.reverse_);for(;h!=null&&(h.name===t||a.hasChild(h.name));)h=i.getChildAfterChild(this.index_,h,this.reverse_);const _=h==null?1:o(h,l);if(d&&!s.isEmpty()&&_>=0)return r!=null&&r.trackChildChange(et(t,s,u)),a.updateImmediateChild(t,s);{r!=null&&r.trackChildChange(Ze(t,u));const m=a.updateImmediateChild(t,g.EMPTY_NODE);return h!=null&&this.rangedFilter_.matches(h)?(r!=null&&r.trackChildChange(ke(h.name,h.node)),m.updateImmediateChild(h.name,h.node)):m}}else return s.isEmpty()?e:d&&o(c,l)>=0?(r!=null&&(r.trackChildChange(Ze(c.name,c.node)),r.trackChildChange(ke(t,s))),a.updateImmediateChild(t,s).updateImmediateChild(c.name,g.EMPTY_NODE)):e}}/**
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
 */class Mn{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=R}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return f(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return f(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:Ae}hasEnd(){return this.endSet_}getIndexEndValue(){return f(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return f(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:ye}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return f(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===R}copy(){const e=new Mn;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function Vl(n){return n.loadsAllData()?new On(n.getIndex()):n.hasLimit()?new Hl(n):new tt(n)}function Ms(n){const e={};if(n.isDefault())return e;let t;if(n.index_===R?t="$priority":n.index_===Bl?t="$value":n.index_===Se?t="$key":(f(n.index_ instanceof Fl,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=k(t),n.startSet_){const s=n.startAfterSet_?"startAfter":"startAt";e[s]=k(n.indexStartValue_),n.startNameSet_&&(e[s]+=","+k(n.indexStartName_))}if(n.endSet_){const s=n.endBeforeSet_?"endBefore":"endAt";e[s]=k(n.indexEndValue_),n.endNameSet_&&(e[s]+=","+k(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function Ls(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==R&&(e.i=n.index_.toString()),e}/**
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
 */class St extends zi{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(f(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,s,i){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=s,this.appCheckTokenProvider_=i,this.log_=lt("p:rest:"),this.listens_={}}listen(e,t,s,i){const r=e._path.toString();this.log_("Listen called for "+r+" "+e._queryIdentifier);const o=St.getListenId_(e,s),a={};this.listens_[o]=a;const l=Ms(e._queryParams);this.restRequest_(r+".json",l,(c,d)=>{let u=d;if(c===404&&(u=null,c=null),c===null&&this.onDataUpdate_(r,u,!1,s),Re(this.listens_,o)===a){let h;c?c===401?h="permission_denied":h="rest_error:"+c:h="ok",i(h,null)}})}unlisten(e,t){const s=St.getListenId_(e,t);delete this.listens_[s]}get(e){const t=Ms(e._queryParams),s=e._path.toString(),i=new Lt;return this.restRequest_(s+".json",t,(r,o)=>{let a=o;r===404&&(a=null,r=null),r===null?(this.onDataUpdate_(s,a,!1,null),i.resolve(a)):i.reject(new Error(a))}),i.promise}refreshAuthToken(e){}restRequest_(e,t={},s){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([i,r])=>{i&&i.accessToken&&(t.auth=i.accessToken),r&&r.token&&(t.ac=r.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+Ro(t);this.log_("Sending REST request for "+o);const a=new XMLHttpRequest;a.onreadystatechange=()=>{if(s&&a.readyState===4){this.log_("REST Response for "+o+" received. status:",a.status,"response:",a.responseText);let l=null;if(a.status>=200&&a.status<300){try{l=Ke(a.responseText)}catch{$("Failed to parse JSON response for "+o+": "+a.responseText)}s(null,l)}else a.status!==401&&a.status!==404&&$("Got unsuccessful REST response for "+o+" Status: "+a.status),s(a.status);s=null}},a.open("GET",o,!0),a.send()})}}/**
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
 */class $l{constructor(){this.rootNode_=g.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
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
 */function Rt(){return{value:null,children:new Map}}function sr(n,e,t){if(v(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const s=y(e);n.children.has(s)||n.children.set(s,Rt());const i=n.children.get(s);e=T(e),sr(i,e,t)}}function pn(n,e,t){n.value!==null?t(e,n.value):Gl(n,(s,i)=>{const r=new b(e.toString()+"/"+s);pn(i,r,t)})}function Gl(n,e){n.children.forEach((t,s)=>{e(s,t)})}/**
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
 */class zl{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t={...e};return this.last_&&G(this.last_,(s,i)=>{t[s]=t[s]-i}),this.last_=e,t}}/**
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
 */const Fs=10*1e3,ql=30*1e3,jl=5*60*1e3;class Yl{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new zl(e);const s=Fs+(ql-Fs)*Math.random();Ge(this.reportStats_.bind(this),Math.floor(s))}reportStats_(){const e=this.statsListener_.get(),t={};let s=!1;G(e,(i,r)=>{r>0&&se(this.statsToReport_,i)&&(t[i]=r,s=!0)}),s&&this.server_.reportStats(t),Ge(this.reportStats_.bind(this),Math.floor(Math.random()*2*jl))}}/**
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
 */var Y;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(Y||(Y={}));function ir(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function Ln(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function Fn(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
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
 */class Nt{constructor(e,t,s){this.path=e,this.affectedTree=t,this.revert=s,this.type=Y.ACK_USER_WRITE,this.source=ir()}operationForChild(e){if(v(this.path)){if(this.affectedTree.value!=null)return f(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new b(e));return new Nt(w(),t,this.revert)}}else return f(y(this.path)===e,"operationForChild called for unrelated child."),new Nt(T(this.path),this.affectedTree,this.revert)}}/**
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
 */class nt{constructor(e,t){this.source=e,this.path=t,this.type=Y.LISTEN_COMPLETE}operationForChild(e){return v(this.path)?new nt(this.source,w()):new nt(this.source,T(this.path))}}/**
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
 */class Ce{constructor(e,t,s){this.source=e,this.path=t,this.snap=s,this.type=Y.OVERWRITE}operationForChild(e){return v(this.path)?new Ce(this.source,w(),this.snap.getImmediateChild(e)):new Ce(this.source,T(this.path),this.snap)}}/**
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
 */class st{constructor(e,t,s){this.source=e,this.path=t,this.children=s,this.type=Y.MERGE}operationForChild(e){if(v(this.path)){const t=this.children.subtree(new b(e));return t.isEmpty()?null:t.value?new Ce(this.source,w(),t.value):new st(this.source,w(),t)}else return f(y(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new st(this.source,T(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
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
 */class ue{constructor(e,t,s){this.node_=e,this.fullyInitialized_=t,this.filtered_=s}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(v(e))return this.isFullyInitialized()&&!this.filtered_;const t=y(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
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
 */class Kl{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function Ql(n,e,t,s){const i=[],r=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&r.push(Wl(o.childName,o.snapshotNode))}),We(n,i,"child_removed",e,s,t),We(n,i,"child_added",e,s,t),We(n,i,"child_moved",r,s,t),We(n,i,"child_changed",e,s,t),We(n,i,"value",e,s,t),i}function We(n,e,t,s,i,r){const o=s.filter(a=>a.type===t);o.sort((a,l)=>Jl(n,a,l)),o.forEach(a=>{const l=Xl(n,a,r);i.forEach(c=>{c.respondsTo(a.type)&&e.push(c.createEvent(l,n.query_))})})}function Xl(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function Jl(n,e,t){if(e.childName==null||t.childName==null)throw De("Should only compare child_ events.");const s=new C(e.childName,e.snapshotNode),i=new C(t.childName,t.snapshotNode);return n.index_.compare(s,i)}/**
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
 */function Bt(n,e){return{eventCache:n,serverCache:e}}function ze(n,e,t,s){return Bt(new ue(e,t,s),n.serverCache)}function rr(n,e,t,s){return Bt(n.eventCache,new ue(e,t,s))}function At(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function ve(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
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
 */let nn;const Zl=()=>(nn||(nn=new V(Ua)),nn);class S{static fromObject(e){let t=new S(null);return G(e,(s,i)=>{t=t.set(new b(s),i)}),t}constructor(e,t=Zl()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:w(),value:this.value};if(v(e))return null;{const s=y(e),i=this.children.get(s);if(i!==null){const r=i.findRootMostMatchingPathAndValue(T(e),t);return r!=null?{path:x(new b(s),r.path),value:r.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(v(e))return this;{const t=y(e),s=this.children.get(t);return s!==null?s.subtree(T(e)):new S(null)}}set(e,t){if(v(e))return new S(t,this.children);{const s=y(e),r=(this.children.get(s)||new S(null)).set(T(e),t),o=this.children.insert(s,r);return new S(this.value,o)}}remove(e){if(v(e))return this.children.isEmpty()?new S(null):new S(null,this.children);{const t=y(e),s=this.children.get(t);if(s){const i=s.remove(T(e));let r;return i.isEmpty()?r=this.children.remove(t):r=this.children.insert(t,i),this.value===null&&r.isEmpty()?new S(null):new S(this.value,r)}else return this}}get(e){if(v(e))return this.value;{const t=y(e),s=this.children.get(t);return s?s.get(T(e)):null}}setTree(e,t){if(v(e))return t;{const s=y(e),r=(this.children.get(s)||new S(null)).setTree(T(e),t);let o;return r.isEmpty()?o=this.children.remove(s):o=this.children.insert(s,r),new S(this.value,o)}}fold(e){return this.fold_(w(),e)}fold_(e,t){const s={};return this.children.inorderTraversal((i,r)=>{s[i]=r.fold_(x(e,i),t)}),t(e,this.value,s)}findOnPath(e,t){return this.findOnPath_(e,w(),t)}findOnPath_(e,t,s){const i=this.value?s(t,this.value):!1;if(i)return i;if(v(e))return null;{const r=y(e),o=this.children.get(r);return o?o.findOnPath_(T(e),x(t,r),s):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,w(),t)}foreachOnPath_(e,t,s){if(v(e))return this;{this.value&&s(t,this.value);const i=y(e),r=this.children.get(i);return r?r.foreachOnPath_(T(e),x(t,i),s):new S(null)}}foreach(e){this.foreach_(w(),e)}foreach_(e,t){this.children.inorderTraversal((s,i)=>{i.foreach_(x(e,s),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,s)=>{s.value&&e(t,s.value)})}}/**
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
 */class K{constructor(e){this.writeTree_=e}static empty(){return new K(new S(null))}}function qe(n,e,t){if(v(e))return new K(new S(t));{const s=n.writeTree_.findRootMostValueAndPath(e);if(s!=null){const i=s.path;let r=s.value;const o=H(i,e);return r=r.updateChild(o,t),new K(n.writeTree_.set(i,r))}else{const i=new S(t),r=n.writeTree_.setTree(e,i);return new K(r)}}}function Us(n,e,t){let s=n;return G(t,(i,r)=>{s=qe(s,x(e,i),r)}),s}function Bs(n,e){if(v(e))return K.empty();{const t=n.writeTree_.setTree(e,new S(null));return new K(t)}}function gn(n,e){return we(n,e)!=null}function we(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(H(t.path,e)):null}function Ws(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(R,(s,i)=>{e.push(new C(s,i))}):n.writeTree_.children.inorderTraversal((s,i)=>{i.value!=null&&e.push(new C(s,i.value))}),e}function le(n,e){if(v(e))return n;{const t=we(n,e);return t!=null?new K(new S(t)):new K(n.writeTree_.subtree(e))}}function mn(n){return n.writeTree_.isEmpty()}function xe(n,e){return or(w(),n.writeTree_,e)}function or(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let s=null;return e.children.inorderTraversal((i,r)=>{i===".priority"?(f(r.value!==null,"Priority writes must always be leaf nodes"),s=r.value):t=or(x(n,i),r,t)}),!t.getChild(n).isEmpty()&&s!==null&&(t=t.updateChild(x(n,".priority"),s)),t}}/**
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
 */function Wt(n,e){return hr(e,n)}function ec(n,e,t,s,i){f(s>n.lastWriteId,"Stacking an older write on top of newer ones"),i===void 0&&(i=!0),n.allWrites.push({path:e,snap:t,writeId:s,visible:i}),i&&(n.visibleWrites=qe(n.visibleWrites,e,t)),n.lastWriteId=s}function tc(n,e){for(let t=0;t<n.allWrites.length;t++){const s=n.allWrites[t];if(s.writeId===e)return s}return null}function nc(n,e){const t=n.allWrites.findIndex(a=>a.writeId===e);f(t>=0,"removeWrite called with nonexistent writeId.");const s=n.allWrites[t];n.allWrites.splice(t,1);let i=s.visible,r=!1,o=n.allWrites.length-1;for(;i&&o>=0;){const a=n.allWrites[o];a.visible&&(o>=t&&sc(a,s.path)?i=!1:j(s.path,a.path)&&(r=!0)),o--}if(i){if(r)return ic(n),!0;if(s.snap)n.visibleWrites=Bs(n.visibleWrites,s.path);else{const a=s.children;G(a,l=>{n.visibleWrites=Bs(n.visibleWrites,x(s.path,l))})}return!0}else return!1}function sc(n,e){if(n.snap)return j(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&j(x(n.path,t),e))return!0;return!1}function ic(n){n.visibleWrites=ar(n.allWrites,rc,w()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function rc(n){return n.visible}function ar(n,e,t){let s=K.empty();for(let i=0;i<n.length;++i){const r=n[i];if(e(r)){const o=r.path;let a;if(r.snap)j(t,o)?(a=H(t,o),s=qe(s,a,r.snap)):j(o,t)&&(a=H(o,t),s=qe(s,w(),r.snap.getChild(a)));else if(r.children){if(j(t,o))a=H(t,o),s=Us(s,a,r.children);else if(j(o,t))if(a=H(o,t),v(a))s=Us(s,w(),r.children);else{const l=Re(r.children,y(a));if(l){const c=l.getChild(T(a));s=qe(s,w(),c)}}}else throw De("WriteRecord should have .snap or .children")}}return s}function lr(n,e,t,s,i){if(!s&&!i){const r=we(n.visibleWrites,e);if(r!=null)return r;{const o=le(n.visibleWrites,e);if(mn(o))return t;if(t==null&&!gn(o,w()))return null;{const a=t||g.EMPTY_NODE;return xe(o,a)}}}else{const r=le(n.visibleWrites,e);if(!i&&mn(r))return t;if(!i&&t==null&&!gn(r,w()))return null;{const o=function(c){return(c.visible||i)&&(!s||!~s.indexOf(c.writeId))&&(j(c.path,e)||j(e,c.path))},a=ar(n.allWrites,o,e),l=t||g.EMPTY_NODE;return xe(a,l)}}}function oc(n,e,t){let s=g.EMPTY_NODE;const i=we(n.visibleWrites,e);if(i)return i.isLeafNode()||i.forEachChild(R,(r,o)=>{s=s.updateImmediateChild(r,o)}),s;if(t){const r=le(n.visibleWrites,e);return t.forEachChild(R,(o,a)=>{const l=xe(le(r,new b(o)),a);s=s.updateImmediateChild(o,l)}),Ws(r).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}else{const r=le(n.visibleWrites,e);return Ws(r).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}}function ac(n,e,t,s,i){f(s||i,"Either existingEventSnap or existingServerSnap must exist");const r=x(e,t);if(gn(n.visibleWrites,r))return null;{const o=le(n.visibleWrites,r);return mn(o)?i.getChild(t):xe(o,i.getChild(t))}}function lc(n,e,t,s){const i=x(e,t),r=we(n.visibleWrites,i);if(r!=null)return r;if(s.isCompleteForChild(t)){const o=le(n.visibleWrites,i);return xe(o,s.getNode().getImmediateChild(t))}else return null}function cc(n,e){return we(n.visibleWrites,e)}function hc(n,e,t,s,i,r,o){let a;const l=le(n.visibleWrites,e),c=we(l,w());if(c!=null)a=c;else if(t!=null)a=xe(l,t);else return[];if(a=a.withIndex(o),!a.isEmpty()&&!a.isLeafNode()){const d=[],u=o.getCompare(),h=r?a.getReverseIteratorFrom(s,o):a.getIteratorFrom(s,o);let _=h.getNext();for(;_&&d.length<i;)u(_,s)!==0&&d.push(_),_=h.getNext();return d}else return[]}function uc(){return{visibleWrites:K.empty(),allWrites:[],lastWriteId:-1}}function kt(n,e,t,s){return lr(n.writeTree,n.treePath,e,t,s)}function Un(n,e){return oc(n.writeTree,n.treePath,e)}function Hs(n,e,t,s){return ac(n.writeTree,n.treePath,e,t,s)}function xt(n,e){return cc(n.writeTree,x(n.treePath,e))}function dc(n,e,t,s,i,r){return hc(n.writeTree,n.treePath,e,t,s,i,r)}function Bn(n,e,t){return lc(n.writeTree,n.treePath,e,t)}function cr(n,e){return hr(x(n.treePath,e),n.writeTree)}function hr(n,e){return{treePath:n,writeTree:e}}/**
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
 */class fc{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,s=e.childName;f(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),f(s!==".priority","Only non-priority child changes can be tracked.");const i=this.changeMap.get(s);if(i){const r=i.type;if(t==="child_added"&&r==="child_removed")this.changeMap.set(s,et(s,e.snapshotNode,i.snapshotNode));else if(t==="child_removed"&&r==="child_added")this.changeMap.delete(s);else if(t==="child_removed"&&r==="child_changed")this.changeMap.set(s,Ze(s,i.oldSnap));else if(t==="child_changed"&&r==="child_added")this.changeMap.set(s,ke(s,e.snapshotNode));else if(t==="child_changed"&&r==="child_changed")this.changeMap.set(s,et(s,e.snapshotNode,i.oldSnap));else throw De("Illegal combination of changes: "+e+" occurred after "+i)}else this.changeMap.set(s,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
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
 */class _c{getCompleteChild(e){return null}getChildAfterChild(e,t,s){return null}}const ur=new _c;class Wn{constructor(e,t,s=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=s}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const s=this.optCompleteServerCache_!=null?new ue(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return Bn(this.writes_,e,s)}}getChildAfterChild(e,t,s){const i=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:ve(this.viewCache_),r=dc(this.writes_,i,t,1,s,e);return r.length===0?null:r[0]}}/**
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
 */function pc(n){return{filter:n}}function gc(n,e){f(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),f(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function mc(n,e,t,s,i){const r=new fc;let o,a;if(t.type===Y.OVERWRITE){const c=t;c.source.fromUser?o=yn(n,e,c.path,c.snap,s,i,r):(f(c.source.fromServer,"Unknown source."),a=c.source.tagged||e.serverCache.isFiltered()&&!v(c.path),o=Dt(n,e,c.path,c.snap,s,i,a,r))}else if(t.type===Y.MERGE){const c=t;c.source.fromUser?o=Cc(n,e,c.path,c.children,s,i,r):(f(c.source.fromServer,"Unknown source."),a=c.source.tagged||e.serverCache.isFiltered(),o=Cn(n,e,c.path,c.children,s,i,a,r))}else if(t.type===Y.ACK_USER_WRITE){const c=t;c.revert?o=wc(n,e,c.path,s,i,r):o=vc(n,e,c.path,c.affectedTree,s,i,r)}else if(t.type===Y.LISTEN_COMPLETE)o=Ec(n,e,t.path,s,r);else throw De("Unknown operation type: "+t.type);const l=r.getChanges();return yc(e,o,l),{viewCache:o,changes:l}}function yc(n,e,t){const s=e.eventCache;if(s.isFullyInitialized()){const i=s.getNode().isLeafNode()||s.getNode().isEmpty(),r=At(n);(t.length>0||!n.eventCache.isFullyInitialized()||i&&!s.getNode().equals(r)||!s.getNode().getPriority().equals(r.getPriority()))&&t.push(nr(At(e)))}}function dr(n,e,t,s,i,r){const o=e.eventCache;if(xt(s,t)!=null)return e;{let a,l;if(v(t))if(f(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const c=ve(e),d=c instanceof g?c:g.EMPTY_NODE,u=Un(s,d);a=n.filter.updateFullNode(e.eventCache.getNode(),u,r)}else{const c=kt(s,ve(e));a=n.filter.updateFullNode(e.eventCache.getNode(),c,r)}else{const c=y(t);if(c===".priority"){f(he(t)===1,"Can't have a priority with additional path components");const d=o.getNode();l=e.serverCache.getNode();const u=Hs(s,t,d,l);u!=null?a=n.filter.updatePriority(d,u):a=o.getNode()}else{const d=T(t);let u;if(o.isCompleteForChild(c)){l=e.serverCache.getNode();const h=Hs(s,t,o.getNode(),l);h!=null?u=o.getNode().getImmediateChild(c).updateChild(d,h):u=o.getNode().getImmediateChild(c)}else u=Bn(s,c,e.serverCache);u!=null?a=n.filter.updateChild(o.getNode(),c,u,d,i,r):a=o.getNode()}}return ze(e,a,o.isFullyInitialized()||v(t),n.filter.filtersNodes())}}function Dt(n,e,t,s,i,r,o,a){const l=e.serverCache;let c;const d=o?n.filter:n.filter.getIndexedFilter();if(v(t))c=d.updateFullNode(l.getNode(),s,null);else if(d.filtersNodes()&&!l.isFiltered()){const _=l.getNode().updateChild(t,s);c=d.updateFullNode(l.getNode(),_,null)}else{const _=y(t);if(!l.isCompleteForPath(t)&&he(t)>1)return e;const p=T(t),E=l.getNode().getImmediateChild(_).updateChild(p,s);_===".priority"?c=d.updatePriority(l.getNode(),E):c=d.updateChild(l.getNode(),_,E,p,ur,null)}const u=rr(e,c,l.isFullyInitialized()||v(t),d.filtersNodes()),h=new Wn(i,u,r);return dr(n,u,t,i,h,a)}function yn(n,e,t,s,i,r,o){const a=e.eventCache;let l,c;const d=new Wn(i,e,r);if(v(t))c=n.filter.updateFullNode(e.eventCache.getNode(),s,o),l=ze(e,c,!0,n.filter.filtersNodes());else{const u=y(t);if(u===".priority")c=n.filter.updatePriority(e.eventCache.getNode(),s),l=ze(e,c,a.isFullyInitialized(),a.isFiltered());else{const h=T(t),_=a.getNode().getImmediateChild(u);let p;if(v(h))p=s;else{const m=d.getCompleteChild(u);m!=null?ji(h)===".priority"&&m.getChild(Ki(h)).isEmpty()?p=m:p=m.updateChild(h,s):p=g.EMPTY_NODE}if(_.equals(p))l=e;else{const m=n.filter.updateChild(a.getNode(),u,p,h,d,o);l=ze(e,m,a.isFullyInitialized(),n.filter.filtersNodes())}}}return l}function Vs(n,e){return n.eventCache.isCompleteForChild(e)}function Cc(n,e,t,s,i,r,o){let a=e;return s.foreach((l,c)=>{const d=x(t,l);Vs(e,y(d))&&(a=yn(n,a,d,c,i,r,o))}),s.foreach((l,c)=>{const d=x(t,l);Vs(e,y(d))||(a=yn(n,a,d,c,i,r,o))}),a}function $s(n,e,t){return t.foreach((s,i)=>{e=e.updateChild(s,i)}),e}function Cn(n,e,t,s,i,r,o,a){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let l=e,c;v(t)?c=s:c=new S(null).setTree(t,s);const d=e.serverCache.getNode();return c.children.inorderTraversal((u,h)=>{if(d.hasChild(u)){const _=e.serverCache.getNode().getImmediateChild(u),p=$s(n,_,h);l=Dt(n,l,new b(u),p,i,r,o,a)}}),c.children.inorderTraversal((u,h)=>{const _=!e.serverCache.isCompleteForChild(u)&&h.value===null;if(!d.hasChild(u)&&!_){const p=e.serverCache.getNode().getImmediateChild(u),m=$s(n,p,h);l=Dt(n,l,new b(u),m,i,r,o,a)}}),l}function vc(n,e,t,s,i,r,o){if(xt(i,t)!=null)return e;const a=e.serverCache.isFiltered(),l=e.serverCache;if(s.value!=null){if(v(t)&&l.isFullyInitialized()||l.isCompleteForPath(t))return Dt(n,e,t,l.getNode().getChild(t),i,r,a,o);if(v(t)){let c=new S(null);return l.getNode().forEachChild(Se,(d,u)=>{c=c.set(new b(d),u)}),Cn(n,e,t,c,i,r,a,o)}else return e}else{let c=new S(null);return s.foreach((d,u)=>{const h=x(t,d);l.isCompleteForPath(h)&&(c=c.set(d,l.getNode().getChild(h)))}),Cn(n,e,t,c,i,r,a,o)}}function Ec(n,e,t,s,i){const r=e.serverCache,o=rr(e,r.getNode(),r.isFullyInitialized()||v(t),r.isFiltered());return dr(n,o,t,s,ur,i)}function wc(n,e,t,s,i,r){let o;if(xt(s,t)!=null)return e;{const a=new Wn(s,e,i),l=e.eventCache.getNode();let c;if(v(t)||y(t)===".priority"){let d;if(e.serverCache.isFullyInitialized())d=kt(s,ve(e));else{const u=e.serverCache.getNode();f(u instanceof g,"serverChildren would be complete if leaf node"),d=Un(s,u)}d=d,c=n.filter.updateFullNode(l,d,r)}else{const d=y(t);let u=Bn(s,d,e.serverCache);u==null&&e.serverCache.isCompleteForChild(d)&&(u=l.getImmediateChild(d)),u!=null?c=n.filter.updateChild(l,d,u,T(t),a,r):e.eventCache.getNode().hasChild(d)?c=n.filter.updateChild(l,d,g.EMPTY_NODE,T(t),a,r):c=l,c.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=kt(s,ve(e)),o.isLeafNode()&&(c=n.filter.updateFullNode(c,o,r)))}return o=e.serverCache.isFullyInitialized()||xt(s,w())!=null,ze(e,c,o,n.filter.filtersNodes())}}/**
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
 */class bc{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const s=this.query_._queryParams,i=new On(s.getIndex()),r=Vl(s);this.processor_=pc(r);const o=t.serverCache,a=t.eventCache,l=i.updateFullNode(g.EMPTY_NODE,o.getNode(),null),c=r.updateFullNode(g.EMPTY_NODE,a.getNode(),null),d=new ue(l,o.isFullyInitialized(),i.filtersNodes()),u=new ue(c,a.isFullyInitialized(),r.filtersNodes());this.viewCache_=Bt(u,d),this.eventGenerator_=new Kl(this.query_)}get query(){return this.query_}}function Ic(n){return n.viewCache_.serverCache.getNode()}function Tc(n){return At(n.viewCache_)}function Sc(n,e){const t=ve(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!v(e)&&!t.getImmediateChild(y(e)).isEmpty())?t.getChild(e):null}function Gs(n){return n.eventRegistrations_.length===0}function Rc(n,e){n.eventRegistrations_.push(e)}function zs(n,e,t){const s=[];if(t){f(e==null,"A cancel should cancel all event registrations.");const i=n.query._path;n.eventRegistrations_.forEach(r=>{const o=r.createCancelEvent(t,i);o&&s.push(o)})}if(e){let i=[];for(let r=0;r<n.eventRegistrations_.length;++r){const o=n.eventRegistrations_[r];if(!o.matches(e))i.push(o);else if(e.hasAnyCallback()){i=i.concat(n.eventRegistrations_.slice(r+1));break}}n.eventRegistrations_=i}else n.eventRegistrations_=[];return s}function qs(n,e,t,s){e.type===Y.MERGE&&e.source.queryId!==null&&(f(ve(n.viewCache_),"We should always have a full cache before handling merges"),f(At(n.viewCache_),"Missing event cache, even though we have a server cache"));const i=n.viewCache_,r=mc(n.processor_,i,e,t,s);return gc(n.processor_,r.viewCache),f(r.viewCache.serverCache.isFullyInitialized()||!i.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=r.viewCache,fr(n,r.changes,r.viewCache.eventCache.getNode(),null)}function Nc(n,e){const t=n.viewCache_.eventCache,s=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(R,(r,o)=>{s.push(ke(r,o))}),t.isFullyInitialized()&&s.push(nr(t.getNode())),fr(n,s,t.getNode(),e)}function fr(n,e,t,s){const i=s?[s]:n.eventRegistrations_;return Ql(n.eventGenerator_,e,t,i)}/**
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
 */let Pt;class _r{constructor(){this.views=new Map}}function Ac(n){f(!Pt,"__referenceConstructor has already been defined"),Pt=n}function kc(){return f(Pt,"Reference.ts has not been loaded"),Pt}function xc(n){return n.views.size===0}function Hn(n,e,t,s){const i=e.source.queryId;if(i!==null){const r=n.views.get(i);return f(r!=null,"SyncTree gave us an op for an invalid query."),qs(r,e,t,s)}else{let r=[];for(const o of n.views.values())r=r.concat(qs(o,e,t,s));return r}}function pr(n,e,t,s,i){const r=e._queryIdentifier,o=n.views.get(r);if(!o){let a=kt(t,i?s:null),l=!1;a?l=!0:s instanceof g?(a=Un(t,s),l=!1):(a=g.EMPTY_NODE,l=!1);const c=Bt(new ue(a,l,!1),new ue(s,i,!1));return new bc(e,c)}return o}function Dc(n,e,t,s,i,r){const o=pr(n,e,s,i,r);return n.views.has(e._queryIdentifier)||n.views.set(e._queryIdentifier,o),Rc(o,t),Nc(o,t)}function Pc(n,e,t,s){const i=e._queryIdentifier,r=[];let o=[];const a=de(n);if(i==="default")for(const[l,c]of n.views.entries())o=o.concat(zs(c,t,s)),Gs(c)&&(n.views.delete(l),c.query._queryParams.loadsAllData()||r.push(c.query));else{const l=n.views.get(i);l&&(o=o.concat(zs(l,t,s)),Gs(l)&&(n.views.delete(i),l.query._queryParams.loadsAllData()||r.push(l.query)))}return a&&!de(n)&&r.push(new(kc())(e._repo,e._path)),{removed:r,events:o}}function gr(n){const e=[];for(const t of n.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function ce(n,e){let t=null;for(const s of n.views.values())t=t||Sc(s,e);return t}function mr(n,e){if(e._queryParams.loadsAllData())return Ht(n);{const s=e._queryIdentifier;return n.views.get(s)}}function yr(n,e){return mr(n,e)!=null}function de(n){return Ht(n)!=null}function Ht(n){for(const e of n.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
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
 */let Ot;function Oc(n){f(!Ot,"__referenceConstructor has already been defined"),Ot=n}function Mc(){return f(Ot,"Reference.ts has not been loaded"),Ot}let Lc=1;class js{constructor(e){this.listenProvider_=e,this.syncPointTree_=new S(null),this.pendingWriteTree_=uc(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function Cr(n,e,t,s,i){return ec(n.pendingWriteTree_,e,t,s,i),i?ut(n,new Ce(ir(),e,t)):[]}function ge(n,e,t=!1){const s=tc(n.pendingWriteTree_,e);if(nc(n.pendingWriteTree_,e)){let r=new S(null);return s.snap!=null?r=r.set(w(),!0):G(s.children,o=>{r=r.set(new b(o),!0)}),ut(n,new Nt(s.path,r,t))}else return[]}function ht(n,e,t){return ut(n,new Ce(Ln(),e,t))}function Fc(n,e,t){const s=S.fromObject(t);return ut(n,new st(Ln(),e,s))}function Uc(n,e){return ut(n,new nt(Ln(),e))}function Bc(n,e,t){const s=$n(n,t);if(s){const i=Gn(s),r=i.path,o=i.queryId,a=H(r,e),l=new nt(Fn(o),a);return zn(n,r,l)}else return[]}function Mt(n,e,t,s,i=!1){const r=e._path,o=n.syncPointTree_.get(r);let a=[];if(o&&(e._queryIdentifier==="default"||yr(o,e))){const l=Pc(o,e,t,s);xc(o)&&(n.syncPointTree_=n.syncPointTree_.remove(r));const c=l.removed;if(a=l.events,!i){const d=c.findIndex(h=>h._queryParams.loadsAllData())!==-1,u=n.syncPointTree_.findOnPath(r,(h,_)=>de(_));if(d&&!u){const h=n.syncPointTree_.subtree(r);if(!h.isEmpty()){const _=Vc(h);for(let p=0;p<_.length;++p){const m=_[p],E=m.query,U=br(n,m);n.listenProvider_.startListening(je(E),it(n,E),U.hashFn,U.onComplete)}}}!u&&c.length>0&&!s&&(d?n.listenProvider_.stopListening(je(e),null):c.forEach(h=>{const _=n.queryToTagMap.get(Vt(h));n.listenProvider_.stopListening(je(h),_)}))}$c(n,c)}return a}function vr(n,e,t,s){const i=$n(n,s);if(i!=null){const r=Gn(i),o=r.path,a=r.queryId,l=H(o,e),c=new Ce(Fn(a),l,t);return zn(n,o,c)}else return[]}function Wc(n,e,t,s){const i=$n(n,s);if(i){const r=Gn(i),o=r.path,a=r.queryId,l=H(o,e),c=S.fromObject(t),d=new st(Fn(a),l,c);return zn(n,o,d)}else return[]}function vn(n,e,t,s=!1){const i=e._path;let r=null,o=!1;n.syncPointTree_.foreachOnPath(i,(h,_)=>{const p=H(h,i);r=r||ce(_,p),o=o||de(_)});let a=n.syncPointTree_.get(i);a?(o=o||de(a),r=r||ce(a,w())):(a=new _r,n.syncPointTree_=n.syncPointTree_.set(i,a));let l;r!=null?l=!0:(l=!1,r=g.EMPTY_NODE,n.syncPointTree_.subtree(i).foreachChild((_,p)=>{const m=ce(p,w());m&&(r=r.updateImmediateChild(_,m))}));const c=yr(a,e);if(!c&&!e._queryParams.loadsAllData()){const h=Vt(e);f(!n.queryToTagMap.has(h),"View does not exist, but we have a tag");const _=Gc();n.queryToTagMap.set(h,_),n.tagToQueryMap.set(_,h)}const d=Wt(n.pendingWriteTree_,i);let u=Dc(a,e,t,d,r,l);if(!c&&!o&&!s){const h=mr(a,e);u=u.concat(zc(n,e,h))}return u}function Vn(n,e,t){const i=n.pendingWriteTree_,r=n.syncPointTree_.findOnPath(e,(o,a)=>{const l=H(o,e),c=ce(a,l);if(c)return c});return lr(i,e,r,t,!0)}function Hc(n,e){const t=e._path;let s=null;n.syncPointTree_.foreachOnPath(t,(c,d)=>{const u=H(c,t);s=s||ce(d,u)});let i=n.syncPointTree_.get(t);i?s=s||ce(i,w()):(i=new _r,n.syncPointTree_=n.syncPointTree_.set(t,i));const r=s!=null,o=r?new ue(s,!0,!1):null,a=Wt(n.pendingWriteTree_,e._path),l=pr(i,e,a,r?o.getNode():g.EMPTY_NODE,r);return Tc(l)}function ut(n,e){return Er(e,n.syncPointTree_,null,Wt(n.pendingWriteTree_,w()))}function Er(n,e,t,s){if(v(n.path))return wr(n,e,t,s);{const i=e.get(w());t==null&&i!=null&&(t=ce(i,w()));let r=[];const o=y(n.path),a=n.operationForChild(o),l=e.children.get(o);if(l&&a){const c=t?t.getImmediateChild(o):null,d=cr(s,o);r=r.concat(Er(a,l,c,d))}return i&&(r=r.concat(Hn(i,n,s,t))),r}}function wr(n,e,t,s){const i=e.get(w());t==null&&i!=null&&(t=ce(i,w()));let r=[];return e.children.inorderTraversal((o,a)=>{const l=t?t.getImmediateChild(o):null,c=cr(s,o),d=n.operationForChild(o);d&&(r=r.concat(wr(d,a,l,c)))}),i&&(r=r.concat(Hn(i,n,s,t))),r}function br(n,e){const t=e.query,s=it(n,t);return{hashFn:()=>(Ic(e)||g.EMPTY_NODE).hash(),onComplete:i=>{if(i==="ok")return s?Bc(n,t._path,s):Uc(n,t._path);{const r=Ha(i,t);return Mt(n,t,null,r)}}}}function it(n,e){const t=Vt(e);return n.queryToTagMap.get(t)}function Vt(n){return n._path.toString()+"$"+n._queryIdentifier}function $n(n,e){return n.tagToQueryMap.get(e)}function Gn(n){const e=n.indexOf("$");return f(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new b(n.substr(0,e))}}function zn(n,e,t){const s=n.syncPointTree_.get(e);f(s,"Missing sync point for query tag that we're tracking");const i=Wt(n.pendingWriteTree_,e);return Hn(s,t,i,null)}function Vc(n){return n.fold((e,t,s)=>{if(t&&de(t))return[Ht(t)];{let i=[];return t&&(i=gr(t)),G(s,(r,o)=>{i=i.concat(o)}),i}})}function je(n){return n._queryParams.loadsAllData()&&!n._queryParams.isDefault()?new(Mc())(n._repo,n._path):n}function $c(n,e){for(let t=0;t<e.length;++t){const s=e[t];if(!s._queryParams.loadsAllData()){const i=Vt(s),r=n.queryToTagMap.get(i);n.queryToTagMap.delete(i),n.tagToQueryMap.delete(r)}}}function Gc(){return Lc++}function zc(n,e,t){const s=e._path,i=it(n,e),r=br(n,t),o=n.listenProvider_.startListening(je(e),i,r.hashFn,r.onComplete),a=n.syncPointTree_.subtree(s);if(i)f(!de(a.value),"If we're adding a query, it shouldn't be shadowed");else{const l=a.fold((c,d,u)=>{if(!v(c)&&d&&de(d))return[Ht(d).query];{let h=[];return d&&(h=h.concat(gr(d).map(_=>_.query))),G(u,(_,p)=>{h=h.concat(p)}),h}});for(let c=0;c<l.length;++c){const d=l[c];n.listenProvider_.stopListening(je(d),it(n,d))}}return o}/**
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
 */class qn{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new qn(t)}node(){return this.node_}}class jn{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=x(this.path_,e);return new jn(this.syncTree_,t)}node(){return Vn(this.syncTree_,this.path_)}}const qc=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},Ys=function(n,e,t){if(!n||typeof n!="object")return n;if(f(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return jc(n[".sv"],e,t);if(typeof n[".sv"]=="object")return Yc(n[".sv"],e);f(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},jc=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:f(!1,"Unexpected server value: "+n)}},Yc=function(n,e,t){n.hasOwnProperty("increment")||f(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const s=n.increment;typeof s!="number"&&f(!1,"Unexpected increment value: "+s);const i=e.node();if(f(i!==null&&typeof i<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!i.isLeafNode())return s;const o=i.getValue();return typeof o!="number"?s:o+s},Kc=function(n,e,t,s){return Yn(e,new jn(t,n),s)},Ir=function(n,e,t){return Yn(n,new qn(e),t)};function Yn(n,e,t){const s=n.getPriority().val(),i=Ys(s,e.getImmediateChild(".priority"),t);let r;if(n.isLeafNode()){const o=n,a=Ys(o.getValue(),e,t);return a!==o.getValue()||i!==o.getPriority().val()?new O(a,L(i)):n}else{const o=n;return r=o,i!==o.getPriority().val()&&(r=r.updatePriority(new O(i))),o.forEachChild(R,(a,l)=>{const c=Yn(l,e.getImmediateChild(a),t);c!==l&&(r=r.updateImmediateChild(a,c))}),r}}/**
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
 */class Kn{constructor(e="",t=null,s={children:{},childCount:0}){this.name=e,this.parent=t,this.node=s}}function Qn(n,e){let t=e instanceof b?e:new b(e),s=n,i=y(t);for(;i!==null;){const r=Re(s.node.children,i)||{children:{},childCount:0};s=new Kn(i,s,r),t=T(t),i=y(t)}return s}function Le(n){return n.node.value}function Tr(n,e){n.node.value=e,En(n)}function Sr(n){return n.node.childCount>0}function Qc(n){return Le(n)===void 0&&!Sr(n)}function $t(n,e){G(n.node.children,(t,s)=>{e(new Kn(t,n,s))})}function Rr(n,e,t,s){t&&e(n),$t(n,i=>{Rr(i,e,!0)})}function Xc(n,e,t){let s=n.parent;for(;s!==null;){if(e(s))return!0;s=s.parent}return!1}function dt(n){return new b(n.parent===null?n.name:dt(n.parent)+"/"+n.name)}function En(n){n.parent!==null&&Jc(n.parent,n.name,n)}function Jc(n,e,t){const s=Qc(t),i=se(n.node.children,e);s&&i?(delete n.node.children[e],n.node.childCount--,En(n)):!s&&!i&&(n.node.children[e]=t.node,n.node.childCount++,En(n))}/**
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
 */const Zc=/[\[\].#$\/\u0000-\u001F\u007F]/,eh=/[\[\].#$\u0000-\u001F\u007F]/,sn=10*1024*1024,Nr=function(n){return typeof n=="string"&&n.length!==0&&!Zc.test(n)},Ar=function(n){return typeof n=="string"&&n.length!==0&&!eh.test(n)},th=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),Ar(n)},nh=function(n,e,t,s){Xn(Sn(n,"value"),e,t)},Xn=function(n,e,t){const s=t instanceof b?new vl(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+_e(s));if(typeof e=="function")throw new Error(n+"contains a function "+_e(s)+" with contents = "+e.toString());if(Si(e))throw new Error(n+"contains "+e.toString()+" "+_e(s));if(typeof e=="string"&&e.length>sn/3&&Ft(e)>sn)throw new Error(n+"contains a string greater than "+sn+" utf8 bytes "+_e(s)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let i=!1,r=!1;if(G(e,(o,a)=>{if(o===".value")i=!0;else if(o!==".priority"&&o!==".sv"&&(r=!0,!Nr(o)))throw new Error(n+" contains an invalid key ("+o+") "+_e(s)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);El(s,o),Xn(n,a,s),wl(s)}),i&&r)throw new Error(n+' contains ".value" child '+_e(s)+" in addition to actual children.")}},kr=function(n,e,t,s){if(!Ar(t))throw new Error(Sn(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},sh=function(n,e,t,s){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),kr(n,e,t)},ih=function(n,e){if(y(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},rh=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!Nr(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!th(t))throw new Error(Sn(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
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
 */class oh{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function Jn(n,e){let t=null;for(let s=0;s<e.length;s++){const i=e[s],r=i.getPath();t!==null&&!xn(r,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:r}),t.events.push(i)}t&&n.eventLists_.push(t)}function xr(n,e,t){Jn(n,t),Dr(n,s=>xn(s,e))}function J(n,e,t){Jn(n,t),Dr(n,s=>j(s,e)||j(e,s))}function Dr(n,e){n.recursionDepth_++;let t=!0;for(let s=0;s<n.eventLists_.length;s++){const i=n.eventLists_[s];if(i){const r=i.path;e(r)?(ah(n.eventLists_[s]),n.eventLists_[s]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function ah(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const s=t.getEventRunner();$e&&B("event: "+t.toString()),Me(s)}}}/**
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
 */const lh="repo_interrupt",ch=25;class hh{constructor(e,t,s,i){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=s,this.appCheckProvider_=i,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new oh,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=Rt(),this.transactionQueueTree_=new Kn,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function uh(n,e,t){if(n.stats_=An(n.repoInfo_),n.forceRestClient_||za())n.server_=new St(n.repoInfo_,(s,i,r,o)=>{Ks(n,s,i,r,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>Qs(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{k(t)}catch(s){throw new Error("Invalid authOverride provided: "+s)}}n.persistentConnection_=new ee(n.repoInfo_,e,(s,i,r,o)=>{Ks(n,s,i,r,o)},s=>{Qs(n,s)},s=>{fh(n,s)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(s=>{n.server_.refreshAuthToken(s)}),n.appCheckProvider_.addTokenChangeListener(s=>{n.server_.refreshAppCheckToken(s.token)}),n.statsReporter_=Qa(n.repoInfo_,()=>new Yl(n.stats_,n.server_)),n.infoData_=new $l,n.infoSyncTree_=new js({startListening:(s,i,r,o)=>{let a=[];const l=n.infoData_.getNode(s._path);return l.isEmpty()||(a=ht(n.infoSyncTree_,s._path,l),setTimeout(()=>{o("ok")},0)),a},stopListening:()=>{}}),es(n,"connected",!1),n.serverSyncTree_=new js({startListening:(s,i,r,o)=>(n.server_.listen(s,r,i,(a,l)=>{const c=o(a,l);J(n.eventQueue_,s._path,c)}),[]),stopListening:(s,i)=>{n.server_.unlisten(s,i)}})}function dh(n){const t=n.infoData_.getNode(new b(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function Zn(n){return qc({timestamp:dh(n)})}function Ks(n,e,t,s,i){n.dataUpdateCount++;const r=new b(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(i)if(s){const l=vt(t,c=>L(c));o=Wc(n.serverSyncTree_,r,l,i)}else{const l=L(t);o=vr(n.serverSyncTree_,r,l,i)}else if(s){const l=vt(t,c=>L(c));o=Fc(n.serverSyncTree_,r,l)}else{const l=L(t);o=ht(n.serverSyncTree_,r,l)}let a=r;o.length>0&&(a=zt(n,r)),J(n.eventQueue_,a,o)}function Qs(n,e){es(n,"connected",e),e===!1&&gh(n)}function fh(n,e){G(e,(t,s)=>{es(n,t,s)})}function es(n,e,t){const s=new b("/.info/"+e),i=L(t);n.infoData_.updateSnapshot(s,i);const r=ht(n.infoSyncTree_,s,i);J(n.eventQueue_,s,r)}function Pr(n){return n.nextWriteId_++}function _h(n,e,t){const s=Hc(n.serverSyncTree_,e);return s!=null?Promise.resolve(s):n.server_.get(e).then(i=>{const r=L(i).withIndex(e._queryParams.getIndex());vn(n.serverSyncTree_,e,t,!0);let o;if(e._queryParams.loadsAllData())o=ht(n.serverSyncTree_,e._path,r);else{const a=it(n.serverSyncTree_,e);o=vr(n.serverSyncTree_,e._path,r,a)}return J(n.eventQueue_,e._path,o),Mt(n.serverSyncTree_,e,t,null,!0),r},i=>(Gt(n,"get for query "+k(e)+" failed: "+i),Promise.reject(new Error(i))))}function ph(n,e,t,s,i){Gt(n,"set",{path:e.toString(),value:t,priority:s});const r=Zn(n),o=L(t,s),a=Vn(n.serverSyncTree_,e),l=Ir(o,a,r),c=Pr(n),d=Cr(n.serverSyncTree_,e,l,c,!0);Jn(n.eventQueue_,d),n.server_.put(e.toString(),o.val(!0),(h,_)=>{const p=h==="ok";p||$("set at "+e+" failed: "+h);const m=ge(n.serverSyncTree_,c,!p);J(n.eventQueue_,e,m),vh(n,i,h,_)});const u=Ur(n,e);zt(n,u),J(n.eventQueue_,u,[])}function gh(n){Gt(n,"onDisconnectEvents");const e=Zn(n),t=Rt();pn(n.onDisconnect_,w(),(i,r)=>{const o=Kc(i,r,n.serverSyncTree_,e);sr(t,i,o)});let s=[];pn(t,w(),(i,r)=>{s=s.concat(ht(n.serverSyncTree_,i,r));const o=Ur(n,i);zt(n,o)}),n.onDisconnect_=Rt(),J(n.eventQueue_,w(),s)}function mh(n,e,t){let s;y(e._path)===".info"?s=vn(n.infoSyncTree_,e,t):s=vn(n.serverSyncTree_,e,t),xr(n.eventQueue_,e._path,s)}function yh(n,e,t){let s;y(e._path)===".info"?s=Mt(n.infoSyncTree_,e,t):s=Mt(n.serverSyncTree_,e,t),xr(n.eventQueue_,e._path,s)}function Ch(n){n.persistentConnection_&&n.persistentConnection_.interrupt(lh)}function Gt(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),B(t,...e)}function vh(n,e,t,s){e&&Me(()=>{if(t==="ok")e(null);else{const i=(t||"error").toUpperCase();let r=i;s&&(r+=": "+s);const o=new Error(r);o.code=i,e(o)}})}function Or(n,e,t){return Vn(n.serverSyncTree_,e,t)||g.EMPTY_NODE}function ts(n,e=n.transactionQueueTree_){if(e||qt(n,e),Le(e)){const t=Lr(n,e);f(t.length>0,"Sending zero length transaction queue"),t.every(i=>i.status===0)&&Eh(n,dt(e),t)}else Sr(e)&&$t(e,t=>{ts(n,t)})}function Eh(n,e,t){const s=t.map(c=>c.currentWriteId),i=Or(n,e,s);let r=i;const o=i.hash();for(let c=0;c<t.length;c++){const d=t[c];f(d.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),d.status=1,d.retryCount++;const u=H(e,d.path);r=r.updateChild(u,d.currentOutputSnapshotRaw)}const a=r.val(!0),l=e;n.server_.put(l.toString(),a,c=>{Gt(n,"transaction put response",{path:l.toString(),status:c});let d=[];if(c==="ok"){const u=[];for(let h=0;h<t.length;h++)t[h].status=2,d=d.concat(ge(n.serverSyncTree_,t[h].currentWriteId)),t[h].onComplete&&u.push(()=>t[h].onComplete(null,!0,t[h].currentOutputSnapshotResolved)),t[h].unwatcher();qt(n,Qn(n.transactionQueueTree_,e)),ts(n,n.transactionQueueTree_),J(n.eventQueue_,e,d);for(let h=0;h<u.length;h++)Me(u[h])}else{if(c==="datastale")for(let u=0;u<t.length;u++)t[u].status===3?t[u].status=4:t[u].status=0;else{$("transaction at "+l.toString()+" failed: "+c);for(let u=0;u<t.length;u++)t[u].status=4,t[u].abortReason=c}zt(n,e)}},o)}function zt(n,e){const t=Mr(n,e),s=dt(t),i=Lr(n,t);return wh(n,i,s),s}function wh(n,e,t){if(e.length===0)return;const s=[];let i=[];const o=e.filter(a=>a.status===0).map(a=>a.currentWriteId);for(let a=0;a<e.length;a++){const l=e[a],c=H(t,l.path);let d=!1,u;if(f(c!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),l.status===4)d=!0,u=l.abortReason,i=i.concat(ge(n.serverSyncTree_,l.currentWriteId,!0));else if(l.status===0)if(l.retryCount>=ch)d=!0,u="maxretry",i=i.concat(ge(n.serverSyncTree_,l.currentWriteId,!0));else{const h=Or(n,l.path,o);l.currentInputSnapshot=h;const _=e[a].update(h.val());if(_!==void 0){Xn("transaction failed: Data returned ",_,l.path);let p=L(_);typeof _=="object"&&_!=null&&se(_,".priority")||(p=p.updatePriority(h.getPriority()));const E=l.currentWriteId,U=Zn(n),F=Ir(p,h,U);l.currentOutputSnapshotRaw=p,l.currentOutputSnapshotResolved=F,l.currentWriteId=Pr(n),o.splice(o.indexOf(E),1),i=i.concat(Cr(n.serverSyncTree_,l.path,F,l.currentWriteId,l.applyLocally)),i=i.concat(ge(n.serverSyncTree_,E,!0))}else d=!0,u="nodata",i=i.concat(ge(n.serverSyncTree_,l.currentWriteId,!0))}J(n.eventQueue_,t,i),i=[],d&&(e[a].status=2,function(h){setTimeout(h,Math.floor(0))}(e[a].unwatcher),e[a].onComplete&&(u==="nodata"?s.push(()=>e[a].onComplete(null,!1,e[a].currentInputSnapshot)):s.push(()=>e[a].onComplete(new Error(u),!1,null))))}qt(n,n.transactionQueueTree_);for(let a=0;a<s.length;a++)Me(s[a]);ts(n,n.transactionQueueTree_)}function Mr(n,e){let t,s=n.transactionQueueTree_;for(t=y(e);t!==null&&Le(s)===void 0;)s=Qn(s,t),e=T(e),t=y(e);return s}function Lr(n,e){const t=[];return Fr(n,e,t),t.sort((s,i)=>s.order-i.order),t}function Fr(n,e,t){const s=Le(e);if(s)for(let i=0;i<s.length;i++)t.push(s[i]);$t(e,i=>{Fr(n,i,t)})}function qt(n,e){const t=Le(e);if(t){let s=0;for(let i=0;i<t.length;i++)t[i].status!==2&&(t[s]=t[i],s++);t.length=s,Tr(e,t.length>0?t:void 0)}$t(e,s=>{qt(n,s)})}function Ur(n,e){const t=dt(Mr(n,e)),s=Qn(n.transactionQueueTree_,e);return Xc(s,i=>{rn(n,i)}),rn(n,s),Rr(s,i=>{rn(n,i)}),t}function rn(n,e){const t=Le(e);if(t){const s=[];let i=[],r=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(f(r===o-1,"All SENT items should be at beginning of queue."),r=o,t[o].status=3,t[o].abortReason="set"):(f(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),i=i.concat(ge(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&s.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));r===-1?Tr(e,void 0):t.length=r+1,J(n.eventQueue_,dt(e),i);for(let o=0;o<s.length;o++)Me(s[o])}}/**
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
 */function bh(n){let e="";const t=n.split("/");for(let s=0;s<t.length;s++)if(t[s].length>0){let i=t[s];try{i=decodeURIComponent(i.replace(/\+/g," "))}catch{}e+="/"+i}return e}function Ih(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const s=t.split("=");s.length===2?e[decodeURIComponent(s[0])]=decodeURIComponent(s[1]):$(`Invalid query segment '${t}' in query '${n}'`)}return e}const Xs=function(n,e){const t=Th(n),s=t.namespace;t.domain==="firebase.com"&&ne(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!s||s==="undefined")&&t.domain!=="localhost"&&ne("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||La();const i=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new Ui(t.host,t.secure,s,i,e,"",s!==t.subdomain),path:new b(t.pathString)}},Th=function(n){let e="",t="",s="",i="",r="",o=!0,a="https",l=443;if(typeof n=="string"){let c=n.indexOf("//");c>=0&&(a=n.substring(0,c-1),n=n.substring(c+2));let d=n.indexOf("/");d===-1&&(d=n.length);let u=n.indexOf("?");u===-1&&(u=n.length),e=n.substring(0,Math.min(d,u)),d<u&&(i=bh(n.substring(d,u)));const h=Ih(n.substring(Math.min(n.length,u)));c=e.indexOf(":"),c>=0?(o=a==="https"||a==="wss",l=parseInt(e.substring(c+1),10)):c=e.length;const _=e.slice(0,c);if(_.toLowerCase()==="localhost")t="localhost";else if(_.split(".").length<=2)t=_;else{const p=e.indexOf(".");s=e.substring(0,p).toLowerCase(),t=e.substring(p+1),r=s}"ns"in h&&(r=h.ns)}return{host:e,port:l,domain:t,subdomain:s,secure:o,scheme:a,pathString:i,namespace:r}};/**
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
 */class Sh{constructor(e,t,s,i){this.eventType=e,this.eventRegistration=t,this.snapshot=s,this.prevName=i}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+k(this.snapshot.exportVal())}}class Rh{constructor(e,t,s){this.eventRegistration=e,this.error=t,this.path=s}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
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
 */class Br{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return f(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
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
 */class ns{constructor(e,t,s,i){this._repo=e,this._path=t,this._queryParams=s,this._orderByCalled=i}get key(){return v(this._path)?null:ji(this._path)}get ref(){return new ie(this._repo,this._path)}get _queryIdentifier(){const e=Ls(this._queryParams),t=Rn(e);return t==="{}"?"default":t}get _queryObject(){return Ls(this._queryParams)}isEqual(e){if(e=Q(e),!(e instanceof ns))return!1;const t=this._repo===e._repo,s=xn(this._path,e._path),i=this._queryIdentifier===e._queryIdentifier;return t&&s&&i}toJSON(){return this.toString()}toString(){return this._repo.toString()+Cl(this._path)}}class ie extends ns{constructor(e,t){super(e,t,new Mn,!1)}get parent(){const e=Ki(this._path);return e===null?null:new ie(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class rt{constructor(e,t,s){this._node=e,this.ref=t,this._index=s}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new b(e),s=wn(this.ref,e);return new rt(this._node.getChild(t),s,R)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(s,i)=>e(new rt(i,wn(this.ref,s),R)))}hasChild(e){const t=new b(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function Qu(n,e){return n=Q(n),n._checkNotDeleted("ref"),e!==void 0?wn(n._root,e):n._root}function wn(n,e){return n=Q(n),y(n._path)===null?sh("child","path",e):kr("child","path",e),new ie(n._repo,x(n._path,e))}function Xu(n,e){n=Q(n),ih("set",n._path),nh("set",e,n._path);const t=new Lt;return ph(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}function Ju(n){n=Q(n);const e=new Br(()=>{}),t=new jt(e);return _h(n._repo,n,t).then(s=>new rt(s,new ie(n._repo,n._path),n._queryParams.getIndex()))}class jt{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const s=t._queryParams.getIndex();return new Sh("value",this,new rt(e.snapshotNode,new ie(t._repo,t._path),s))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new Rh(this,e,t):null}matches(e){return e instanceof jt?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}function Nh(n,e,t,s,i){const r=new Br(t,void 0),o=new jt(r);return mh(n._repo,n,o),()=>yh(n._repo,n,o)}function Zu(n,e,t,s){return Nh(n,"value",e)}Ac(ie);Oc(ie);/**
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
 */const Ah="FIREBASE_DATABASE_EMULATOR_HOST",bn={};let kh=!1;function xh(n,e,t,s){const i=e.lastIndexOf(":"),r=e.substring(0,i),o=ot(r);n.repoInfo_=new Ui(e,o,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0,t),s&&(n.authTokenProvider_=s)}function Dh(n,e,t,s,i){let r=s||n.options.databaseURL;r===void 0&&(n.options.projectId||ne("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),B("Using default host for project ",n.options.projectId),r=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=Xs(r,i),a=o.repoInfo,l;typeof process<"u"&&ys&&(l=ys[Ah]),l?(r=`http://${l}?ns=${a.namespace}`,o=Xs(r,i),a=o.repoInfo):o.repoInfo.secure;const c=new ja(n.name,n.options,e);rh("Invalid Firebase Database URL",o),v(o.path)||ne("Database URL must point to the root of a Firebase Database (not including a child path).");const d=Oh(a,n,c,new qa(n,t));return new Mh(d,n)}function Ph(n,e){const t=bn[e];(!t||t[n.key]!==n)&&ne(`Database ${e}(${n.repoInfo_}) has already been deleted.`),Ch(n),delete t[n.key]}function Oh(n,e,t,s){let i=bn[e.name];i||(i={},bn[e.name]=i);let r=i[n.toURLString()];return r&&ne("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),r=new hh(n,kh,t,s),i[n.toURLString()]=r,r}class Mh{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(uh(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new ie(this._repo,w())),this._rootInternal}_delete(){return this._rootInternal!==null&&(Ph(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&ne("Cannot call "+e+" on a deleted database.")}}function ed(n=vi(),e){const t=mi(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const s=li("database");s&&Lh(t,...s)}return t}function Lh(n,e,t,s={}){n=Q(n),n._checkNotDeleted("useEmulator");const i=`${e}:${t}`,r=n._repoInternal;if(n._instanceStarted){if(i===n._repoInternal.repoInfo_.host&&Et(s,r.repoInfo_.emulatorOptions))return;ne("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let o;if(r.repoInfo_.nodeAdmin)s.mockUserToken&&ne('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),o=new yt(yt.OWNER);else if(s.mockUserToken){const a=typeof s.mockUserToken=="string"?s.mockUserToken:ui(s.mockUserToken,n.app.options.projectId);o=new yt(a)}ot(e)&&(hi(e),di("Database",!0)),xh(r,i,s,o)}/**
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
 */function Fh(n){ka(Ci),Qe(new Ne("database",(e,{instanceIdentifier:t})=>{const s=e.getProvider("app").getImmediate(),i=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return Dh(s,i,r,t)},"PUBLIC").setMultipleInstances(!0)),ae(Cs,vs,n),ae(Cs,vs,"esm2020")}ee.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};ee.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};Fh();/**
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
 */const Wr="firebasestorage.googleapis.com",Hr="storageBucket",Uh=2*60*1e3,Bh=10*60*1e3;/**
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
 */class A extends Pe{constructor(e,t,s=0){super(on(e),`Firebase Storage: ${t} (${on(e)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,A.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return on(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var N;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(N||(N={}));function on(n){return"storage/"+n}function ss(){const n="An unknown error occurred, please check the error payload for server response.";return new A(N.UNKNOWN,n)}function Wh(n){return new A(N.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function Hh(n){return new A(N.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function Vh(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new A(N.UNAUTHENTICATED,n)}function $h(){return new A(N.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function Gh(n){return new A(N.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function zh(){return new A(N.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function qh(){return new A(N.CANCELED,"User canceled the upload/download.")}function jh(n){return new A(N.INVALID_URL,"Invalid URL '"+n+"'.")}function Yh(n){return new A(N.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function Kh(){return new A(N.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Hr+"' property when initializing the app?")}function Qh(){return new A(N.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function Xh(){return new A(N.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Jh(n){return new A(N.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function In(n){return new A(N.INVALID_ARGUMENT,n)}function Vr(){return new A(N.APP_DELETED,"The Firebase app was deleted.")}function Zh(n){return new A(N.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Ye(n,e){return new A(N.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function He(n){throw new A(N.INTERNAL_ERROR,"Internal error: "+n)}/**
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
 */class z{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let s;try{s=z.makeFromUrl(e,t)}catch{return new z(e,"")}if(s.path==="")return s;throw Yh(e)}static makeFromUrl(e,t){let s=null;const i="([A-Za-z0-9.\\-_]+)";function r(P){P.path.charAt(P.path.length-1)==="/"&&(P.path_=P.path_.slice(0,-1))}const o="(/(.*))?$",a=new RegExp("^gs://"+i+o,"i"),l={bucket:1,path:3};function c(P){P.path_=decodeURIComponent(P.path)}const d="v[A-Za-z0-9_]+",u=t.replace(/[.]/g,"\\."),h="(/([^?#]*).*)?$",_=new RegExp(`^https?://${u}/${d}/b/${i}/o${h}`,"i"),p={bucket:1,path:3},m=t===Wr?"(?:storage.googleapis.com|storage.cloud.google.com)":t,E="([^?#]*)",U=new RegExp(`^https?://${m}/${i}/${E}`,"i"),D=[{regex:a,indices:l,postModify:r},{regex:_,indices:p,postModify:c},{regex:U,indices:{bucket:1,path:2},postModify:c}];for(let P=0;P<D.length;P++){const ft=D[P],Kt=ft.regex.exec(e);if(Kt){const no=Kt[ft.indices.bucket];let Qt=Kt[ft.indices.path];Qt||(Qt=""),s=new z(no,Qt),ft.postModify(s);break}}if(s==null)throw jh(e);return s}}class eu{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
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
 */function tu(n,e,t){let s=1,i=null,r=null,o=!1,a=0;function l(){return a===2}let c=!1;function d(...E){c||(c=!0,e.apply(null,E))}function u(E){i=setTimeout(()=>{i=null,n(_,l())},E)}function h(){r&&clearTimeout(r)}function _(E,...U){if(c){h();return}if(E){h(),d.call(null,E,...U);return}if(l()||o){h(),d.call(null,E,...U);return}s<64&&(s*=2);let D;a===1?(a=2,D=0):D=(s+Math.random())*1e3,u(D)}let p=!1;function m(E){p||(p=!0,h(),!c&&(i!==null?(E||(a=2),clearTimeout(i),u(0)):E||(a=1)))}return u(0),r=setTimeout(()=>{o=!0,m(!0)},t),m}function nu(n){n(!1)}/**
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
 */function su(n){return n!==void 0}function iu(n){return typeof n=="object"&&!Array.isArray(n)}function is(n){return typeof n=="string"||n instanceof String}function Js(n){return rs()&&n instanceof Blob}function rs(){return typeof Blob<"u"}function Zs(n,e,t,s){if(s<e)throw In(`Invalid value for '${n}'. Expected ${e} or greater.`);if(s>t)throw In(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
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
 */function Yt(n,e,t){let s=e;return t==null&&(s=`https://${e}`),`${t}://${s}/v0${n}`}function $r(n){const e=encodeURIComponent;let t="?";for(const s in n)if(n.hasOwnProperty(s)){const i=e(s)+"="+e(n[s]);t=t+i+"&"}return t=t.slice(0,-1),t}var me;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(me||(me={}));/**
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
 */function ru(n,e){const t=n>=500&&n<600,i=[408,429].indexOf(n)!==-1,r=e.indexOf(n)!==-1;return t||i||r}/**
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
 */class ou{constructor(e,t,s,i,r,o,a,l,c,d,u,h=!0,_=!1){this.url_=e,this.method_=t,this.headers_=s,this.body_=i,this.successCodes_=r,this.additionalRetryCodes_=o,this.callback_=a,this.errorCallback_=l,this.timeout_=c,this.progressCallback_=d,this.connectionFactory_=u,this.retry=h,this.isUsingEmulator=_,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((p,m)=>{this.resolve_=p,this.reject_=m,this.start_()})}start_(){const e=(s,i)=>{if(i){s(!1,new gt(!1,null,!0));return}const r=this.connectionFactory_();this.pendingConnection_=r;const o=a=>{const l=a.loaded,c=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,c)};this.progressCallback_!==null&&r.addUploadProgressListener(o),r.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&r.removeUploadProgressListener(o),this.pendingConnection_=null;const a=r.getErrorCode()===me.NO_ERROR,l=r.getStatus();if(!a||ru(l,this.additionalRetryCodes_)&&this.retry){const d=r.getErrorCode()===me.ABORT;s(!1,new gt(!1,null,d));return}const c=this.successCodes_.indexOf(l)!==-1;s(!0,new gt(c,r))})},t=(s,i)=>{const r=this.resolve_,o=this.reject_,a=i.connection;if(i.wasSuccessCode)try{const l=this.callback_(a,a.getResponse());su(l)?r(l):r()}catch(l){o(l)}else if(a!==null){const l=ss();l.serverResponse=a.getErrorText(),this.errorCallback_?o(this.errorCallback_(a,l)):o(l)}else if(i.canceled){const l=this.appDelete_?Vr():qh();o(l)}else{const l=zh();o(l)}};this.canceled_?t(!1,new gt(!1,null,!0)):this.backoffId_=tu(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&nu(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class gt{constructor(e,t,s){this.wasSuccessCode=e,this.connection=t,this.canceled=!!s}}function au(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function lu(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function cu(n,e){e&&(n["X-Firebase-GMPID"]=e)}function hu(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function uu(n,e,t,s,i,r,o=!0,a=!1){const l=$r(n.urlParams),c=n.url+l,d=Object.assign({},n.headers);return cu(d,e),au(d,t),lu(d,r),hu(d,s),new ou(c,n.method,d,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,i,o,a)}/**
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
 */function du(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function fu(...n){const e=du();if(e!==void 0){const t=new e;for(let s=0;s<n.length;s++)t.append(n[s]);return t.getBlob()}else{if(rs())return new Blob(n);throw new A(N.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function _u(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
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
 */function pu(n){if(typeof atob>"u")throw Jh("base-64");return atob(n)}/**
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
 */const X={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class an{constructor(e,t){this.data=e,this.contentType=t||null}}function gu(n,e){switch(n){case X.RAW:return new an(Gr(e));case X.BASE64:case X.BASE64URL:return new an(zr(n,e));case X.DATA_URL:return new an(yu(e),Cu(e))}throw ss()}function Gr(n){const e=[];for(let t=0;t<n.length;t++){let s=n.charCodeAt(t);if(s<=127)e.push(s);else if(s<=2047)e.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const r=s,o=n.charCodeAt(++t);s=65536|(r&1023)<<10|o&1023,e.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?e.push(239,191,189):e.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(e)}function mu(n){let e;try{e=decodeURIComponent(n)}catch{throw Ye(X.DATA_URL,"Malformed data URL.")}return Gr(e)}function zr(n,e){switch(n){case X.BASE64:{const i=e.indexOf("-")!==-1,r=e.indexOf("_")!==-1;if(i||r)throw Ye(n,"Invalid character '"+(i?"-":"_")+"' found: is it base64url encoded?");break}case X.BASE64URL:{const i=e.indexOf("+")!==-1,r=e.indexOf("/")!==-1;if(i||r)throw Ye(n,"Invalid character '"+(i?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=pu(e)}catch(i){throw i.message.includes("polyfill")?i:Ye(n,"Invalid character found")}const s=new Uint8Array(t.length);for(let i=0;i<t.length;i++)s[i]=t.charCodeAt(i);return s}class qr{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw Ye(X.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=t[1]||null;s!=null&&(this.base64=vu(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=e.substring(e.indexOf(",")+1)}}function yu(n){const e=new qr(n);return e.base64?zr(X.BASE64,e.rest):mu(e.rest)}function Cu(n){return new qr(n).contentType}function vu(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
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
 */class re{constructor(e,t){let s=0,i="";Js(e)?(this.data_=e,s=e.size,i=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),s=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),s=e.length),this.size_=s,this.type_=i}size(){return this.size_}type(){return this.type_}slice(e,t){if(Js(this.data_)){const s=this.data_,i=_u(s,e,t);return i===null?null:new re(i)}else{const s=new Uint8Array(this.data_.buffer,e,t-e);return new re(s,!0)}}static getBlob(...e){if(rs()){const t=e.map(s=>s instanceof re?s.data_:s);return new re(fu.apply(null,t))}else{const t=e.map(o=>is(o)?gu(X.RAW,o).data:o.data_);let s=0;t.forEach(o=>{s+=o.byteLength});const i=new Uint8Array(s);let r=0;return t.forEach(o=>{for(let a=0;a<o.length;a++)i[r++]=o[a]}),new re(i,!0)}}uploadData(){return this.data_}}/**
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
 */function jr(n){let e;try{e=JSON.parse(n)}catch{return null}return iu(e)?e:null}/**
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
 */function Eu(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function wu(n,e){const t=e.split("/").filter(s=>s.length>0).join("/");return n.length===0?t:n+"/"+t}function Yr(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
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
 */function bu(n,e){return e}class W{constructor(e,t,s,i){this.server=e,this.local=t||e,this.writable=!!s,this.xform=i||bu}}let mt=null;function Iu(n){return!is(n)||n.length<2?n:Yr(n)}function Kr(){if(mt)return mt;const n=[];n.push(new W("bucket")),n.push(new W("generation")),n.push(new W("metageneration")),n.push(new W("name","fullPath",!0));function e(r,o){return Iu(o)}const t=new W("name");t.xform=e,n.push(t);function s(r,o){return o!==void 0?Number(o):o}const i=new W("size");return i.xform=s,n.push(i),n.push(new W("timeCreated")),n.push(new W("updated")),n.push(new W("md5Hash",null,!0)),n.push(new W("cacheControl",null,!0)),n.push(new W("contentDisposition",null,!0)),n.push(new W("contentEncoding",null,!0)),n.push(new W("contentLanguage",null,!0)),n.push(new W("contentType",null,!0)),n.push(new W("metadata","customMetadata",!0)),mt=n,mt}function Tu(n,e){function t(){const s=n.bucket,i=n.fullPath,r=new z(s,i);return e._makeStorageReference(r)}Object.defineProperty(n,"ref",{get:t})}function Su(n,e,t){const s={};s.type="file";const i=t.length;for(let r=0;r<i;r++){const o=t[r];s[o.local]=o.xform(s,e[o.server])}return Tu(s,n),s}function Qr(n,e,t){const s=jr(e);return s===null?null:Su(n,s,t)}function Ru(n,e,t,s){const i=jr(e);if(i===null||!is(i.downloadTokens))return null;const r=i.downloadTokens;if(r.length===0)return null;const o=encodeURIComponent;return r.split(",").map(c=>{const d=n.bucket,u=n.fullPath,h="/b/"+o(d)+"/o/"+o(u),_=Yt(h,t,s),p=$r({alt:"media",token:c});return _+p})[0]}function Nu(n,e){const t={},s=e.length;for(let i=0;i<s;i++){const r=e[i];r.writable&&(t[r.server]=n[r.local])}return JSON.stringify(t)}class os{constructor(e,t,s,i){this.url=e,this.method=t,this.handler=s,this.timeout=i,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function Xr(n){if(!n)throw ss()}function Au(n,e){function t(s,i){const r=Qr(n,i,e);return Xr(r!==null),r}return t}function ku(n,e){function t(s,i){const r=Qr(n,i,e);return Xr(r!==null),Ru(r,i,n.host,n._protocol)}return t}function Jr(n){function e(t,s){let i;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?i=$h():i=Vh():t.getStatus()===402?i=Hh(n.bucket):t.getStatus()===403?i=Gh(n.path):i=s,i.status=t.getStatus(),i.serverResponse=s.serverResponse,i}return e}function Zr(n){const e=Jr(n);function t(s,i){let r=e(s,i);return s.getStatus()===404&&(r=Wh(n.path)),r.serverResponse=i.serverResponse,r}return t}function xu(n,e,t){const s=e.fullServerUrl(),i=Yt(s,n.host,n._protocol),r="GET",o=n.maxOperationRetryTime,a=new os(i,r,ku(n,t),o);return a.errorHandler=Zr(e),a}function Du(n,e){const t=e.fullServerUrl(),s=Yt(t,n.host,n._protocol),i="DELETE",r=n.maxOperationRetryTime;function o(l,c){}const a=new os(s,i,o,r);return a.successCodes=[200,204],a.errorHandler=Zr(e),a}function Pu(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function Ou(n,e,t){const s=Object.assign({},t);return s.fullPath=n.path,s.size=e.size(),s.contentType||(s.contentType=Pu(null,e)),s}function Mu(n,e,t,s,i){const r=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function a(){let D="";for(let P=0;P<2;P++)D=D+Math.random().toString().slice(2);return D}const l=a();o["Content-Type"]="multipart/related; boundary="+l;const c=Ou(e,s,i),d=Nu(c,t),u="--"+l+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+d+`\r
--`+l+`\r
Content-Type: `+c.contentType+`\r
\r
`,h=`\r
--`+l+"--",_=re.getBlob(u,s,h);if(_===null)throw Qh();const p={name:c.fullPath},m=Yt(r,n.host,n._protocol),E="POST",U=n.maxUploadRetryTime,F=new os(m,E,Au(n,t),U);return F.urlParams=p,F.headers=o,F.body=_.uploadData(),F.errorHandler=Jr(e),F}class Lu{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=me.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=me.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=me.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,s,i,r){if(this.sent_)throw He("cannot .send() more than once");if(ot(e)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),r!==void 0)for(const o in r)r.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,r[o].toString());return i!==void 0?this.xhr_.send(i):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw He("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw He("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw He("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw He("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class Fu extends Lu{initXhr(){this.xhr_.responseType="text"}}function as(){return new Fu}/**
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
 */class Ee{constructor(e,t){this._service=e,t instanceof z?this._location=t:this._location=z.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new Ee(e,t)}get root(){const e=new z(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Yr(this._location.path)}get storage(){return this._service}get parent(){const e=Eu(this._location.path);if(e===null)return null;const t=new z(this._location.bucket,e);return new Ee(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw Zh(e)}}function Uu(n,e,t){n._throwIfRoot("uploadBytes");const s=Mu(n.storage,n._location,Kr(),new re(e,!0),t);return n.storage.makeRequestWithTokens(s,as).then(i=>({metadata:i,ref:n}))}function Bu(n){n._throwIfRoot("getDownloadURL");const e=xu(n.storage,n._location,Kr());return n.storage.makeRequestWithTokens(e,as).then(t=>{if(t===null)throw Xh();return t})}function Wu(n){n._throwIfRoot("deleteObject");const e=Du(n.storage,n._location);return n.storage.makeRequestWithTokens(e,as)}function Hu(n,e){const t=wu(n._location.path,e),s=new z(n._location.bucket,t);return new Ee(n.storage,s)}/**
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
 */function Vu(n){return/^[A-Za-z]+:\/\//.test(n)}function $u(n,e){return new Ee(n,e)}function eo(n,e){if(n instanceof ls){const t=n;if(t._bucket==null)throw Kh();const s=new Ee(t,t._bucket);return e!=null?eo(s,e):s}else return e!==void 0?Hu(n,e):n}function Gu(n,e){if(e&&Vu(e)){if(n instanceof ls)return $u(n,e);throw In("To use ref(service, url), the first argument must be a Storage instance.")}else return eo(n,e)}function ei(n,e){const t=e==null?void 0:e[Hr];return t==null?null:z.makeFromBucketSpec(t,n)}function zu(n,e,t,s={}){n.host=`${e}:${t}`;const i=ot(e);i&&(hi(`https://${n.host}/b`),di("Storage",!0)),n._isUsingEmulator=!0,n._protocol=i?"https":"http";const{mockUserToken:r}=s;r&&(n._overrideAuthToken=typeof r=="string"?r:ui(r,n.app.options.projectId))}class ls{constructor(e,t,s,i,r,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=s,this._url=i,this._firebaseVersion=r,this._isUsingEmulator=o,this._bucket=null,this._host=Wr,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=Uh,this._maxUploadRetryTime=Bh,this._requests=new Set,i!=null?this._bucket=z.makeFromBucketSpec(i,this._host):this._bucket=ei(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=z.makeFromBucketSpec(this._url,e):this._bucket=ei(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){Zs("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){Zs("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(yi(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new Ee(this,e)}_makeRequest(e,t,s,i,r=!0){if(this._deleted)return new eu(Vr());{const o=uu(e,this._appId,s,i,t,this._firebaseVersion,r,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[s,i]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,s,i).getPromise()}}const ti="@firebase/storage",ni="0.14.0";/**
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
 */const to="storage";function td(n,e,t){return n=Q(n),Uu(n,e,t)}function nd(n){return n=Q(n),Bu(n)}function sd(n){return n=Q(n),Wu(n)}function id(n,e){return n=Q(n),Gu(n,e)}function rd(n=vi(),e){n=Q(n);const s=mi(n,to).getImmediate({identifier:e}),i=li("storage");return i&&qu(s,...i),s}function qu(n,e,t,s={}){zu(n,e,t,s)}function ju(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),s=n.getProvider("auth-internal"),i=n.getProvider("app-check-internal");return new ls(t,s,i,e,Ci)}function Yu(){Qe(new Ne(to,ju,"PUBLIC").setMultipleInstances(!0)),ae(ti,ni,""),ae(ti,ni,"esm2020")}Yu();export{rd as a,Ju as b,id as c,nd as d,sd as e,ed as g,ma as i,Zu as o,Qu as r,Xu as s,td as u};
//# sourceMappingURL=firebase-CYLAFpjR.js.map
