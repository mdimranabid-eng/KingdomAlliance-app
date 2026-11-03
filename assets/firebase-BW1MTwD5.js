import{o as ra,d as hc}from"./vendor-BjSgNrzb.js";const YE=()=>{};var Rd={};/**
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
 */const Jp={NODE_ADMIN:!1,SDK_VERSION:"${JSCORE_VERSION}"};/**
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
 */const D=function(n,e){if(!n)throw Hs(e)},Hs=function(n){return new Error("Firebase Database ("+Jp.SDK_VERSION+") INTERNAL ASSERT FAILED: "+n)};/**
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
 */const Xp=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let r=n.charCodeAt(s);r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):(r&64512)===55296&&s+1<n.length&&(n.charCodeAt(s+1)&64512)===56320?(r=65536+((r&1023)<<10)+(n.charCodeAt(++s)&1023),e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},JE=function(n){const e=[];let t=0,s=0;for(;t<n.length;){const r=n[t++];if(r<128)e[s++]=String.fromCharCode(r);else if(r>191&&r<224){const i=n[t++];e[s++]=String.fromCharCode((r&31)<<6|i&63)}else if(r>239&&r<365){const i=n[t++],o=n[t++],c=n[t++],l=((r&7)<<18|(i&63)<<12|(o&63)<<6|c&63)-65536;e[s++]=String.fromCharCode(55296+(l>>10)),e[s++]=String.fromCharCode(56320+(l&1023))}else{const i=n[t++],o=n[t++];e[s++]=String.fromCharCode((r&15)<<12|(i&63)<<6|o&63)}}return e.join("")},vl={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let r=0;r<n.length;r+=3){const i=n[r],o=r+1<n.length,c=o?n[r+1]:0,l=r+2<n.length,u=l?n[r+2]:0,f=i>>2,p=(i&3)<<4|c>>4;let m=(c&15)<<2|u>>6,T=u&63;l||(T=64,o||(m=64)),s.push(t[f],t[p],t[m],t[T])}return s.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Xp(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):JE(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let r=0;r<n.length;){const i=t[n.charAt(r++)],c=r<n.length?t[n.charAt(r)]:0;++r;const u=r<n.length?t[n.charAt(r)]:64;++r;const p=r<n.length?t[n.charAt(r)]:64;if(++r,i==null||c==null||u==null||p==null)throw new XE;const m=i<<2|c>>4;if(s.push(m),u!==64){const T=c<<4&240|u>>2;if(s.push(T),p!==64){const S=u<<6&192|p;s.push(S)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class XE extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Zp=function(n){const e=Xp(n);return vl.encodeByteArray(e,!0)},_o=function(n){return Zp(n).replace(/\./g,"")},yo=function(n){try{return vl.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function ZE(n){return em(void 0,n)}function em(n,e){if(!(e instanceof Object))return e;switch(e.constructor){case Date:const t=e;return new Date(t.getTime());case Object:n===void 0&&(n={});break;case Array:n=[];break;default:return e}for(const t in e)!e.hasOwnProperty(t)||!eT(t)||(n[t]=em(n[t],e[t]));return n}function eT(n){return n!=="__proto__"}/**
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
 */function tT(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const nT=()=>tT().__FIREBASE_DEFAULTS__,sT=()=>{if(typeof process>"u"||typeof Rd>"u")return;const n=Rd.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},rT=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&yo(n[1]);return e&&JSON.parse(e)},ia=()=>{try{return YE()||nT()||sT()||rT()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},tm=n=>{var e,t;return(t=(e=ia())==null?void 0:e.emulatorHosts)==null?void 0:t[n]},oa=n=>{const e=tm(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),s]:[e.substring(0,t),s]},nm=()=>{var n;return(n=ia())==null?void 0:n.config},sm=n=>{var e;return(e=ia())==null?void 0:e[`_${n}`]};/**
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
 */class Ft{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,s)=>{t?this.reject(t):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,s))}}}/**
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
 */function Al(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},s=e||"demo-project",r=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o={iss:`https://securetoken.google.com/${s}`,aud:s,iat:r,exp:r+3600,auth_time:r,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}},...n};return[_o(JSON.stringify(t)),_o(JSON.stringify(o)),""].join(".")}/**
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
 */function We(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Rl(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(We())}function iT(){var e;const n=(e=ia())==null?void 0:e.forceEnvironment;if(n==="node")return!0;if(n==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function oT(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function aT(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function rm(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function cT(){const n=We();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function lT(){return Jp.NODE_ADMIN===!0}function uT(){return!iT()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function im(){try{return typeof indexedDB=="object"}catch{return!1}}function om(){return new Promise((n,e)=>{try{let t=!0;const s="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(s);r.onsuccess=()=>{r.result.close(),t||self.indexedDB.deleteDatabase(s),n(!0)},r.onupgradeneeded=()=>{t=!1},r.onerror=()=>{var i;e(((i=r.error)==null?void 0:i.message)||"")}}catch(t){e(t)}})}function hT(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
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
 */const dT="FirebaseError";class dt extends Error{constructor(e,t,s){super(t),this.code=e,this.customData=s,this.name=dT,Object.setPrototypeOf(this,dt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,os.prototype.create)}}class os{constructor(e,t,s){this.service=e,this.serviceName=t,this.errors=s}create(e,...t){const s=t[0]||{},r=`${this.service}/${e}`,i=this.errors[e],o=i?fT(i,s):"Error",c=`${this.serviceName}: ${o} (${r}).`;return new dt(r,c,s)}}function fT(n,e){return n.replace(pT,(t,s)=>{const r=e[s];return r!=null?String(r):`<${s}?>`})}const pT=/\{\$([^}]+)}/g;/**
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
 */function Hr(n){return JSON.parse(n)}function Oe(n){return JSON.stringify(n)}/**
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
 */const am=function(n){let e={},t={},s={},r="";try{const i=n.split(".");e=Hr(yo(i[0])||""),t=Hr(yo(i[1])||""),r=i[2],s=t.d||{},delete t.d}catch{}return{header:e,claims:t,data:s,signature:r}},mT=function(n){const e=am(n),t=e.claims;return!!t&&typeof t=="object"&&t.hasOwnProperty("iat")},gT=function(n){const e=am(n).claims;return typeof e=="object"&&e.admin===!0};/**
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
 */function Vt(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function Ds(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]}function Eo(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function To(n,e,t){const s={};for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&(s[r]=e.call(t,n[r],r,n));return s}function Nt(n,e){if(n===e)return!0;const t=Object.keys(n),s=Object.keys(e);for(const r of t){if(!s.includes(r))return!1;const i=n[r],o=e[r];if(Cd(i)&&Cd(o)){if(!Nt(i,o))return!1}else if(i!==o)return!1}for(const r of s)if(!t.includes(r))return!1;return!0}function Cd(n){return n!==null&&typeof n=="object"}/**
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
 */function Gs(n){const e=[];for(const[t,s]of Object.entries(n))Array.isArray(s)?s.forEach(r=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function Sr(n){const e={};return n.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[r,i]=s.split("=");e[decodeURIComponent(r)]=decodeURIComponent(i)}}),e}function br(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}/**
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
 */class _T{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=512/8,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const s=this.W_;if(typeof e=="string")for(let p=0;p<16;p++)s[p]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let p=0;p<16;p++)s[p]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let p=16;p<80;p++){const m=s[p-3]^s[p-8]^s[p-14]^s[p-16];s[p]=(m<<1|m>>>31)&4294967295}let r=this.chain_[0],i=this.chain_[1],o=this.chain_[2],c=this.chain_[3],l=this.chain_[4],u,f;for(let p=0;p<80;p++){p<40?p<20?(u=c^i&(o^c),f=1518500249):(u=i^o^c,f=1859775393):p<60?(u=i&o|c&(i|o),f=2400959708):(u=i^o^c,f=3395469782);const m=(r<<5|r>>>27)+u+l+f+s[p]&4294967295;l=c,c=o,o=(i<<30|i>>>2)&4294967295,i=r,r=m}this.chain_[0]=this.chain_[0]+r&4294967295,this.chain_[1]=this.chain_[1]+i&4294967295,this.chain_[2]=this.chain_[2]+o&4294967295,this.chain_[3]=this.chain_[3]+c&4294967295,this.chain_[4]=this.chain_[4]+l&4294967295}update(e,t){if(e==null)return;t===void 0&&(t=e.length);const s=t-this.blockSize;let r=0;const i=this.buf_;let o=this.inbuf_;for(;r<t;){if(o===0)for(;r<=s;)this.compress_(e,r),r+=this.blockSize;if(typeof e=="string"){for(;r<t;)if(i[o]=e.charCodeAt(r),++o,++r,o===this.blockSize){this.compress_(i),o=0;break}}else for(;r<t;)if(i[o]=e[r],++o,++r,o===this.blockSize){this.compress_(i),o=0;break}}this.inbuf_=o,this.total_+=t}digest(){const e=[];let t=this.total_*8;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let r=this.blockSize-1;r>=56;r--)this.buf_[r]=t&255,t/=256;this.compress_(this.buf_);let s=0;for(let r=0;r<5;r++)for(let i=24;i>=0;i-=8)e[s]=this.chain_[r]>>i&255,++s;return e}}function yT(n,e){const t=new ET(n,e);return t.subscribe.bind(t)}class ET{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,s){let r;if(e===void 0&&t===void 0&&s===void 0)throw new Error("Missing Observer.");TT(e,["next","error","complete"])?r=e:r={next:e,error:t,complete:s},r.next===void 0&&(r.next=dc),r.error===void 0&&(r.error=dc),r.complete===void 0&&(r.complete=dc);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function TT(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function dc(){}function Os(n,e){return`${n} failed: ${e} argument `}/**
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
 */const wT=function(n){const e=[];let t=0;for(let s=0;s<n.length;s++){let r=n.charCodeAt(s);if(r>=55296&&r<=56319){const i=r-55296;s++,D(s<n.length,"Surrogate pair missing trail surrogate.");const o=n.charCodeAt(s)-56320;r=65536+(i<<10)+o}r<128?e[t++]=r:r<2048?(e[t++]=r>>6|192,e[t++]=r&63|128):r<65536?(e[t++]=r>>12|224,e[t++]=r>>6&63|128,e[t++]=r&63|128):(e[t++]=r>>18|240,e[t++]=r>>12&63|128,e[t++]=r>>6&63|128,e[t++]=r&63|128)}return e},aa=function(n){let e=0;for(let t=0;t<n.length;t++){const s=n.charCodeAt(t);s<128?e++:s<2048?e+=2:s>=55296&&s<=56319?(e+=4,t++):e+=3}return e};/**
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
 */function W(n){return n&&n._delegate?n._delegate:n}/**
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
 */function wt(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function ui(n){return(await fetch(n,{credentials:"include"})).ok}class tt{constructor(e,t,s){this.name=e,this.instanceFactory=t,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Un="[DEFAULT]";/**
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
 */class IT{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const s=new Ft;if(this.instancesDeferred.set(t,s),this.isInitialized(t)||this.shouldAutoInitialize())try{const r=this.getOrInitializeService({instanceIdentifier:t});r&&s.resolve(r)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){const t=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(e==null?void 0:e.optional)??!1;if(this.isInitialized(t)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:t})}catch(r){if(s)return null;throw r}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(AT(e))try{this.getOrInitializeService({instanceIdentifier:Un})}catch{}for(const[t,s]of this.instancesDeferred.entries()){const r=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:r});s.resolve(i)}catch{}}}}clearInstance(e=Un){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Un){return this.instances.has(e)}getOptions(e=Un){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const r=this.getOrInitializeService({instanceIdentifier:s,options:t});for(const[i,o]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(i);s===c&&o.resolve(r)}return r}onInit(e,t){const s=this.normalizeInstanceIdentifier(t),r=this.onInitCallbacks.get(s)??new Set;r.add(e),this.onInitCallbacks.set(s,r);const i=this.instances.get(s);return i&&e(i,s),()=>{r.delete(e)}}invokeOnInitCallbacks(e,t){const s=this.onInitCallbacks.get(t);if(s)for(const r of s)try{r(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:vT(e),options:t}),this.instances.set(e,s),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=Un){return this.component?this.component.multipleInstances?e:Un:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function vT(n){return n===Un?void 0:n}function AT(n){return n.instantiationMode==="EAGER"}/**
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
 */class RT{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new IT(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var Y;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(Y||(Y={}));const CT={debug:Y.DEBUG,verbose:Y.VERBOSE,info:Y.INFO,warn:Y.WARN,error:Y.ERROR,silent:Y.SILENT},ST=Y.INFO,bT={[Y.DEBUG]:"log",[Y.VERBOSE]:"log",[Y.INFO]:"info",[Y.WARN]:"warn",[Y.ERROR]:"error"},PT=(n,e,...t)=>{if(e<n.logLevel)return;const s=new Date().toISOString(),r=bT[e];if(r)console[r](`[${s}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ca{constructor(e){this.name=e,this._logLevel=ST,this._logHandler=PT,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Y))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?CT[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Y.DEBUG,...e),this._logHandler(this,Y.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Y.VERBOSE,...e),this._logHandler(this,Y.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Y.INFO,...e),this._logHandler(this,Y.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Y.WARN,...e),this._logHandler(this,Y.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Y.ERROR,...e),this._logHandler(this,Y.ERROR,...e)}}/**
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
 */class kT{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(NT(t)){const s=t.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(t=>t).join(" ")}}function NT(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Mc="@firebase/app",Sd="0.14.12";/**
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
 */const jt=new ca("@firebase/app"),DT="@firebase/app-compat",OT="@firebase/analytics-compat",VT="@firebase/analytics",MT="@firebase/app-check-compat",xT="@firebase/app-check",LT="@firebase/auth",FT="@firebase/auth-compat",UT="@firebase/database",BT="@firebase/data-connect",qT="@firebase/database-compat",$T="@firebase/functions",WT="@firebase/functions-compat",jT="@firebase/installations",HT="@firebase/installations-compat",GT="@firebase/messaging",zT="@firebase/messaging-compat",KT="@firebase/performance",QT="@firebase/performance-compat",YT="@firebase/remote-config",JT="@firebase/remote-config-compat",XT="@firebase/storage",ZT="@firebase/storage-compat",ew="@firebase/firestore",tw="@firebase/ai",nw="@firebase/firestore-compat",sw="firebase",rw="12.13.0";/**
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
 */const xc="[DEFAULT]",iw={[Mc]:"fire-core",[DT]:"fire-core-compat",[VT]:"fire-analytics",[OT]:"fire-analytics-compat",[xT]:"fire-app-check",[MT]:"fire-app-check-compat",[LT]:"fire-auth",[FT]:"fire-auth-compat",[UT]:"fire-rtdb",[BT]:"fire-data-connect",[qT]:"fire-rtdb-compat",[$T]:"fire-fn",[WT]:"fire-fn-compat",[jT]:"fire-iid",[HT]:"fire-iid-compat",[GT]:"fire-fcm",[zT]:"fire-fcm-compat",[KT]:"fire-perf",[QT]:"fire-perf-compat",[YT]:"fire-rc",[JT]:"fire-rc-compat",[XT]:"fire-gcs",[ZT]:"fire-gcs-compat",[ew]:"fire-fst",[nw]:"fire-fst-compat",[tw]:"fire-vertex","fire-js":"fire-js",[sw]:"fire-js-all"};/**
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
 */const wo=new Map,ow=new Map,Lc=new Map;function bd(n,e){try{n.container.addComponent(e)}catch(t){jt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function ct(n){const e=n.name;if(Lc.has(e))return jt.debug(`There were multiple attempts to register component ${e}.`),!1;Lc.set(e,n);for(const t of wo.values())bd(t,n);for(const t of ow.values())bd(t,n);return!0}function Jt(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function qe(n){return n==null?!1:n.settings!==void 0}/**
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
 */const aw={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},fn=new os("app","Firebase",aw);/**
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
 */class cw{constructor(e,t,s){this._isDeleted=!1,this._options={...e},this._config={...t},this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new tt("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw fn.create("app-deleted",{appName:this._name})}}/**
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
 */const Pn=rw;function lw(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const s={name:xc,automaticDataCollectionEnabled:!0,...e},r=s.name;if(typeof r!="string"||!r)throw fn.create("bad-app-name",{appName:String(r)});if(t||(t=nm()),!t)throw fn.create("no-options");const i=wo.get(r);if(i){if(Nt(t,i.options)&&Nt(s,i.config))return i;throw fn.create("duplicate-app",{appName:r})}const o=new RT(r);for(const l of Lc.values())o.addComponent(l);const c=new cw(t,s,o);return wo.set(r,c),c}function zs(n=xc){const e=wo.get(n);if(!e&&n===xc&&nm())return lw();if(!e)throw fn.create("no-app",{appName:n});return e}function Ve(n,e,t){let s=iw[n]??n;t&&(s+=`-${t}`);const r=s.match(/\s|\//),i=e.match(/\s|\//);if(r||i){const o=[`Unable to register library "${s}" with version "${e}":`];r&&o.push(`library name "${s}" contains illegal characters (whitespace or "/")`),r&&i&&o.push("and"),i&&o.push(`version name "${e}" contains illegal characters (whitespace or "/")`),jt.warn(o.join(" "));return}ct(new tt(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const uw="firebase-heartbeat-database",hw=1,Gr="firebase-heartbeat-store";let fc=null;function cm(){return fc||(fc=ra(uw,hw,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Gr)}catch(t){console.warn(t)}}}}).catch(n=>{throw fn.create("idb-open",{originalErrorMessage:n.message})})),fc}async function dw(n){try{const t=(await cm()).transaction(Gr),s=await t.objectStore(Gr).get(lm(n));return await t.done,s}catch(e){if(e instanceof dt)jt.warn(e.message);else{const t=fn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});jt.warn(t.message)}}}async function Pd(n,e){try{const s=(await cm()).transaction(Gr,"readwrite");await s.objectStore(Gr).put(e,lm(n)),await s.done}catch(t){if(t instanceof dt)jt.warn(t.message);else{const s=fn.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});jt.warn(s.message)}}}function lm(n){return`${n.name}!${n.options.appId}`}/**
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
 */const fw=1024,pw=30;class mw{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new _w(t),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,t;try{const r=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=kd();if(((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)==null?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i))return;if(this._heartbeatsCache.heartbeats.push({date:i,agent:r}),this._heartbeatsCache.heartbeats.length>pw){const o=yw(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(o,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){jt.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)==null?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=kd(),{heartbeatsToSend:s,unsentEntries:r}=gw(this._heartbeatsCache.heartbeats),i=_o(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=t,r.length>0?(this._heartbeatsCache.heartbeats=r,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return jt.warn(t),""}}}function kd(){return new Date().toISOString().substring(0,10)}function gw(n,e=fw){const t=[];let s=n.slice();for(const r of n){const i=t.find(o=>o.agent===r.agent);if(i){if(i.dates.push(r.date),Nd(t)>e){i.dates.pop();break}}else if(t.push({agent:r.agent,dates:[r.date]}),Nd(t)>e){t.pop();break}s=s.slice(1)}return{heartbeatsToSend:t,unsentEntries:s}}class _w{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return im()?om().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await dw(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return Pd(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){const s=await this.read();return Pd(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Nd(n){return _o(JSON.stringify({version:2,heartbeats:n})).length}function yw(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let s=1;s<n.length;s++)n[s].date<t&&(t=n[s].date,e=s);return e}/**
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
 */function Ew(n){ct(new tt("platform-logger",e=>new kT(e),"PRIVATE")),ct(new tt("heartbeat",e=>new mw(e),"PRIVATE")),Ve(Mc,Sd,n),Ve(Mc,Sd,"esm2020"),Ve("fire-js","")}Ew("");function um(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Tw=um,hm=new os("auth","Firebase",um());/**
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
 */const Io=new ca("@firebase/auth");function ww(n,...e){Io.logLevel<=Y.WARN&&Io.warn(`Auth (${Pn}): ${n}`,...e)}function io(n,...e){Io.logLevel<=Y.ERROR&&Io.error(`Auth (${Pn}): ${n}`,...e)}/**
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
 */function nt(n,...e){throw Sl(n,...e)}function _t(n,...e){return Sl(n,...e)}function Cl(n,e,t){const s={...Tw(),[e]:t};return new os("auth","Firebase",s).create(e,{appName:n.name})}function $t(n){return Cl(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Iw(n,e,t){const s=t;if(!(e instanceof s))throw s.name!==e.constructor.name&&nt(n,"argument-error"),Cl(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function Sl(n,...e){if(typeof n!="string"){const t=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=n.name),n._errorFactory.create(t,...s)}return hm.create(n,...e)}function x(n,e,...t){if(!n)throw Sl(e,...t)}function Rt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw io(e),new Error(e)}function Ht(n,e){n||Rt(e)}/**
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
 */function Fc(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.href)||""}function vw(){return Dd()==="http:"||Dd()==="https:"}function Dd(){var n;return typeof self<"u"&&((n=self.location)==null?void 0:n.protocol)||null}/**
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
 */function Aw(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(vw()||aT()||"connection"in navigator)?navigator.onLine:!0}function Rw(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class hi{constructor(e,t){this.shortDelay=e,this.longDelay=t,Ht(t>e,"Short delay should be less than long delay!"),this.isMobile=Rl()||rm()}get(){return Aw()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function bl(n,e){Ht(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class dm{static initialize(e,t,s){this.fetchImpl=e,t&&(this.headersImpl=t),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Rt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Rt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Rt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Cw={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Sw=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],bw=new hi(3e4,6e4);function ft(n,e){return n.tenantId&&!e.tenantId?{...e,tenantId:n.tenantId}:e}async function lt(n,e,t,s,r={}){return fm(n,r,async()=>{let i={},o={};s&&(e==="GET"?o=s:i={body:JSON.stringify(s)});const c=Gs({key:n.config.apiKey,...o}).slice(1),l=await n._getAdditionalHeaders();l["Content-Type"]="application/json",n.languageCode&&(l["X-Firebase-Locale"]=n.languageCode);const u={method:e,headers:l,...i};return oT()||(u.referrerPolicy="no-referrer"),n.emulatorConfig&&wt(n.emulatorConfig.host)&&(u.credentials="include"),dm.fetch()(await pm(n,n.config.apiHost,t,c),u)})}async function fm(n,e,t){n._canInitEmulator=!1;const s={...Cw,...e};try{const r=new kw(n),i=await Promise.race([t(),r.promise]);r.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw Ki(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const c=i.ok?o.errorMessage:o.error.message,[l,u]=c.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ki(n,"credential-already-in-use",o);if(l==="EMAIL_EXISTS")throw Ki(n,"email-already-in-use",o);if(l==="USER_DISABLED")throw Ki(n,"user-disabled",o);const f=s[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw Cl(n,f,u);nt(n,f)}}catch(r){if(r instanceof dt)throw r;nt(n,"network-request-failed",{message:String(r)})}}async function di(n,e,t,s,r={}){const i=await lt(n,e,t,s,r);return"mfaPendingCredential"in i&&nt(n,"multi-factor-auth-required",{_serverResponse:i}),i}async function pm(n,e,t,s){const r=`${e}${t}?${s}`,i=n,o=i.config.emulator?bl(n.config,r):`${n.config.apiScheme}://${r}`;return Sw.includes(t)&&(await i._persistenceManagerAvailable,i._getPersistenceType()==="COOKIE")?i._getPersistence()._getFinalTarget(o).toString():o}function Pw(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class kw{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,s)=>{this.timer=setTimeout(()=>s(_t(this.auth,"network-request-failed")),bw.get())})}}function Ki(n,e,t){const s={appName:n.name};t.email&&(s.email=t.email),t.phoneNumber&&(s.phoneNumber=t.phoneNumber);const r=_t(n,e,s);return r.customData._tokenResponse=t,r}function Od(n){return n!==void 0&&n.enterprise!==void 0}class Nw{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return Pw(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function Dw(n,e){return lt(n,"GET","/v2/recaptchaConfig",ft(n,e))}/**
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
 */async function Ow(n,e){return lt(n,"POST","/v1/accounts:delete",e)}async function vo(n,e){return lt(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function Or(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function Vw(n,e=!1){const t=W(n),s=await t.getIdToken(e),r=Pl(s);x(r&&r.exp&&r.auth_time&&r.iat,t.auth,"internal-error");const i=typeof r.firebase=="object"?r.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:r,token:s,authTime:Or(pc(r.auth_time)),issuedAtTime:Or(pc(r.iat)),expirationTime:Or(pc(r.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function pc(n){return Number(n)*1e3}function Pl(n){const[e,t,s]=n.split(".");if(e===void 0||t===void 0||s===void 0)return io("JWT malformed, contained fewer than 3 sections"),null;try{const r=yo(t);return r?JSON.parse(r):(io("Failed to decode base64 JWT payload"),null)}catch(r){return io("Caught error parsing JWT payload as JSON",r==null?void 0:r.toString()),null}}function Vd(n){const e=Pl(n);return x(e,"internal-error"),x(typeof e.exp<"u","internal-error"),x(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function En(n,e,t=!1){if(t)return e;try{return await e}catch(s){throw s instanceof dt&&Mw(s)&&n.auth.currentUser===n&&await n.auth.signOut(),s}}function Mw({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class xw{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){const t=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),t}else{this.errorBackoff=3e4;const s=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Uc{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Or(this.lastLoginAt),this.creationTime=Or(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Ao(n){var p;const e=n.auth,t=await n.getIdToken(),s=await En(n,vo(e,{idToken:t}));x(s==null?void 0:s.users.length,e,"internal-error");const r=s.users[0];n._notifyReloadListener(r);const i=(p=r.providerUserInfo)!=null&&p.length?mm(r.providerUserInfo):[],o=Fw(n.providerData,i),c=n.isAnonymous,l=!(n.email&&r.passwordHash)&&!(o!=null&&o.length),u=c?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:o,metadata:new Uc(r.createdAt,r.lastLoginAt),isAnonymous:u};Object.assign(n,f)}async function Lw(n){const e=W(n);await Ao(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Fw(n,e){return[...n.filter(s=>!e.some(r=>r.providerId===s.providerId)),...e]}function mm(n){return n.map(({providerId:e,...t})=>({providerId:e,uid:t.rawId||"",displayName:t.displayName||null,email:t.email||null,phoneNumber:t.phoneNumber||null,photoURL:t.photoUrl||null}))}/**
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
 */async function Uw(n,e){const t=await fm(n,{},async()=>{const s=Gs({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:i}=n.config,o=await pm(n,r,"/v1/token",`key=${i}`),c=await n._getAdditionalHeaders();c["Content-Type"]="application/x-www-form-urlencoded";const l={method:"POST",headers:c,body:s};return n.emulatorConfig&&wt(n.emulatorConfig.host)&&(l.credentials="include"),dm.fetch()(o,l)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Bw(n,e){return lt(n,"POST","/v2/accounts:revokeToken",ft(n,e))}/**
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
 */class As{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){x(e.idToken,"internal-error"),x(typeof e.idToken<"u","internal-error"),x(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Vd(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){x(e.length!==0,"internal-error");const t=Vd(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(x(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:s,refreshToken:r,expiresIn:i}=await Uw(e,t);this.updateTokensAndExpiration(s,r,Number(i))}updateTokensAndExpiration(e,t,s){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,t){const{refreshToken:s,accessToken:r,expirationTime:i}=t,o=new As;return s&&(x(typeof s=="string","internal-error",{appName:e}),o.refreshToken=s),r&&(x(typeof r=="string","internal-error",{appName:e}),o.accessToken=r),i&&(x(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new As,this.toJSON())}_performRefresh(){return Rt("not implemented")}}/**
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
 */function on(n,e){x(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class mt{constructor({uid:e,auth:t,stsTokenManager:s,...r}){this.providerId="firebase",this.proactiveRefresh=new xw(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=t,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Uc(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){const t=await En(this,this.stsTokenManager.getToken(this.auth,e));return x(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return Vw(this,e)}reload(){return Lw(this)}_assign(e){this!==e&&(x(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>({...t})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new mt({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return t.metadata._copy(this.metadata),t}_onReload(e){x(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),t&&await Ao(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(qe(this.auth.app))return Promise.reject($t(this.auth));const e=await this.getIdToken();return await En(this,Ow(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){const s=t.displayName??void 0,r=t.email??void 0,i=t.phoneNumber??void 0,o=t.photoURL??void 0,c=t.tenantId??void 0,l=t._redirectEventId??void 0,u=t.createdAt??void 0,f=t.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:T,providerData:S,stsTokenManager:k}=t;x(p&&k,e,"internal-error");const N=As.fromJSON(this.name,k);x(typeof p=="string",e,"internal-error"),on(s,e.name),on(r,e.name),x(typeof m=="boolean",e,"internal-error"),x(typeof T=="boolean",e,"internal-error"),on(i,e.name),on(o,e.name),on(c,e.name),on(l,e.name),on(u,e.name),on(f,e.name);const $=new mt({uid:p,auth:e,email:r,emailVerified:m,displayName:s,isAnonymous:T,photoURL:o,phoneNumber:i,tenantId:c,stsTokenManager:N,createdAt:u,lastLoginAt:f});return S&&Array.isArray(S)&&($.providerData=S.map(j=>({...j}))),l&&($._redirectEventId=l),$}static async _fromIdTokenResponse(e,t,s=!1){const r=new As;r.updateFromServerResponse(t);const i=new mt({uid:t.localId,auth:e,stsTokenManager:r,isAnonymous:s});return await Ao(i),i}static async _fromGetAccountInfoResponse(e,t,s){const r=t.users[0];x(r.localId!==void 0,"internal-error");const i=r.providerUserInfo!==void 0?mm(r.providerUserInfo):[],o=!(r.email&&r.passwordHash)&&!(i!=null&&i.length),c=new As;c.updateFromIdToken(s);const l=new mt({uid:r.localId,auth:e,stsTokenManager:c,isAnonymous:o}),u={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new Uc(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!(i!=null&&i.length)};return Object.assign(l,u),l}}/**
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
 */const Md=new Map;function Ut(n){Ht(n instanceof Function,"Expected a class definition");let e=Md.get(n);return e?(Ht(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Md.set(n,e),e)}/**
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
 */class gm{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}gm.type="NONE";const xd=gm;/**
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
 */function oo(n,e,t){return`firebase:${n}:${e}:${t}`}class Rs{constructor(e,t,s){this.persistence=e,this.auth=t,this.userKey=s;const{config:r,name:i}=this.auth;this.fullUserKey=oo(this.userKey,r.apiKey,i),this.fullPersistenceKey=oo("persistence",r.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await vo(this.auth,{idToken:e}).catch(()=>{});return t?mt._fromGetAccountInfoResponse(this.auth,t,e):null}return mt._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,s="authUser"){if(!t.length)return new Rs(Ut(xd),e,s);const r=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=r[0]||Ut(xd);const o=oo(s,e.config.apiKey,e.name);let c=null;for(const u of t)try{const f=await u._get(o);if(f){let p;if(typeof f=="string"){const m=await vo(e,{idToken:f}).catch(()=>{});if(!m)break;p=await mt._fromGetAccountInfoResponse(e,m,f)}else p=mt._fromJSON(e,f);u!==i&&(c=p),i=u;break}}catch{}const l=r.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!l.length?new Rs(i,e,s):(i=l[0],c&&await i._set(o,c.toJSON()),await Promise.all(t.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new Rs(i,e,s))}}/**
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
 */function Ld(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Tm(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(_m(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Im(e))return"Blackberry";if(vm(e))return"Webos";if(ym(e))return"Safari";if((e.includes("chrome/")||Em(e))&&!e.includes("edge/"))return"Chrome";if(wm(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=n.match(t);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function _m(n=We()){return/firefox\//i.test(n)}function ym(n=We()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Em(n=We()){return/crios\//i.test(n)}function Tm(n=We()){return/iemobile/i.test(n)}function wm(n=We()){return/android/i.test(n)}function Im(n=We()){return/blackberry/i.test(n)}function vm(n=We()){return/webos/i.test(n)}function kl(n=We()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function qw(n=We()){var e;return kl(n)&&!!((e=window.navigator)!=null&&e.standalone)}function $w(){return cT()&&document.documentMode===10}function Am(n=We()){return kl(n)||wm(n)||vm(n)||Im(n)||/windows phone/i.test(n)||Tm(n)}/**
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
 */function Rm(n,e=[]){let t;switch(n){case"Browser":t=Ld(We());break;case"Worker":t=`${Ld(We())}-${n}`;break;default:t=n}const s=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Pn}/${s}`}/**
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
 */class Ww{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const s=i=>new Promise((o,c)=>{try{const l=e(i);o(l)}catch(l){c(l)}});s.onAbort=t,this.queue.push(s);const r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const s of this.queue)await s(e),s.onAbort&&t.push(s.onAbort)}catch(s){t.reverse();for(const r of t)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */async function jw(n,e={}){return lt(n,"GET","/v2/passwordPolicy",ft(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
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
 */const Hw=6;class Gw{constructor(e){var s;const t=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=t.minPasswordLength??Hw,t.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=t.maxPasswordLength),t.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=t.containsLowercaseCharacter),t.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=t.containsUppercaseCharacter),t.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=t.containsNumericCharacter),t.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=t.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=((s=e.allowedNonAlphanumericCharacters)==null?void 0:s.join(""))??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){const t={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,t),this.validatePasswordCharacterOptions(e,t),t.isValid&&(t.isValid=t.meetsMinPasswordLength??!0),t.isValid&&(t.isValid=t.meetsMaxPasswordLength??!0),t.isValid&&(t.isValid=t.containsLowercaseLetter??!0),t.isValid&&(t.isValid=t.containsUppercaseLetter??!0),t.isValid&&(t.isValid=t.containsNumericCharacter??!0),t.isValid&&(t.isValid=t.containsNonAlphanumericCharacter??!0),t}validatePasswordLengthOptions(e,t){const s=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;s&&(t.meetsMinPasswordLength=e.length>=s),r&&(t.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let s;for(let r=0;r<e.length;r++)s=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(t,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,t,s,r,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class zw{constructor(e,t,s,r){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=s,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Fd(this),this.idTokenSubscription=new Fd(this),this.beforeStateQueue=new Ww(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=hm,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(i=>this._resolvePersistenceManagerAvailable=i)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Ut(t)),this._initializationPromise=this.queue(async()=>{var s,r,i;if(!this._deleted&&(this.persistenceManager=await Rs.create(this,e),(s=this._resolvePersistenceManagerAvailable)==null||s.call(this),!this._deleted)){if((r=this._popupRedirectResolver)!=null&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)==null?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await vo(this,{idToken:e}),s=await mt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(s)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var i;if(qe(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(c,c))}):this.directlySetCurrentUser(null)}const t=await this.assertedPersistence.getCurrentUser();let s=t,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(i=this.redirectUser)==null?void 0:i._redirectEventId,c=s==null?void 0:s._redirectEventId,l=await this.tryRedirectSignIn(e);(!o||o===c)&&(l!=null&&l.user)&&(s=l.user,r=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=t,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return x(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Ao(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Rw()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(qe(this.app))return Promise.reject($t(this));const t=e?W(e):null;return t&&x(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&x(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return qe(this.app)?Promise.reject($t(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return qe(this.app)?Promise.reject($t(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ut(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await jw(this),t=new Gw(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new os("auth","Firebase",e())}onAuthStateChanged(e,t,s){return this.registerStateListener(this.authStateSubscription,e,t,s)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,s){return this.registerStateListener(this.idTokenSubscription,e,t,s)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(s.tenantId=this.tenantId),await Bw(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)==null?void 0:e.toJSON()}}async _setRedirectUser(e,t){const s=await this.getOrInitRedirectPersistenceManager(t);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Ut(e)||this._popupRedirectResolver;x(t,this,"argument-error"),this.redirectPersistenceManager=await Rs.create(this,[Ut(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,s;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)==null?void 0:t._redirectEventId)===e?this._currentUser:((s=this.redirectUser)==null?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const e=((t=this.currentUser)==null?void 0:t.uid)??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,s,r){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(x(c,this,"internal-error"),c.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const l=e.addObserver(t,s,r);return()=>{o=!0,l()}}else{const l=e.addObserver(t);return()=>{o=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return x(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Rm(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var r;const e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);const t=await((r=this.heartbeatServiceProvider.getImmediate({optional:!0}))==null?void 0:r.getHeartbeatsHeader());t&&(e["X-Firebase-Client"]=t);const s=await this._getAppCheckToken();return s&&(e["X-Firebase-AppCheck"]=s),e}async _getAppCheckToken(){var t;if(qe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))==null?void 0:t.getToken());return e!=null&&e.error&&ww(`Error while retrieving App Check token: ${e.error}`),e==null?void 0:e.token}}function Xt(n){return W(n)}class Fd{constructor(e){this.auth=e,this.observer=null,this.addObserver=yT(t=>this.observer=t)}get next(){return x(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let la={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Kw(n){la=n}function Cm(n){return la.loadJS(n)}function Qw(){return la.recaptchaEnterpriseScript}function Yw(){return la.gapiScript}function Jw(n){return`__${n}${Math.floor(Math.random()*1e6)}`}class Xw{constructor(){this.enterprise=new Zw}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class Zw{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const eI="recaptcha-enterprise",Sm="NO_RECAPTCHA";class tI{constructor(e){this.type=eI,this.auth=Xt(e)}async verify(e="verify",t=!1){async function s(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,c)=>{Dw(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)c(new Error("recaptcha Enterprise site key undefined"));else{const u=new Nw(l);return i.tenantId==null?i._agentRecaptchaConfig=u:i._tenantRecaptchaConfigs[i.tenantId]=u,o(u.siteKey)}}).catch(l=>{c(l)})})}function r(i,o,c){const l=window.grecaptcha;Od(l)?l.enterprise.ready(()=>{l.enterprise.execute(i,{action:e}).then(u=>{o(u)}).catch(()=>{o(Sm)})}):c(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new Xw().execute("siteKey",{action:"verify"}):new Promise((i,o)=>{s(this.auth).then(c=>{if(!t&&Od(window.grecaptcha))r(c,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let l=Qw();l.length!==0&&(l+=c),Cm(l).then(()=>{r(c,i,o)}).catch(u=>{o(u)})}}).catch(c=>{o(c)})})}}async function Ud(n,e,t,s=!1,r=!1){const i=new tI(n);let o;if(r)o=Sm;else try{o=await i.verify(t)}catch{o=await i.verify(t,!0)}const c={...e};if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in c){const l=c.phoneEnrollmentInfo.phoneNumber,u=c.phoneEnrollmentInfo.recaptchaToken;Object.assign(c,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:u,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in c){const l=c.phoneSignInInfo.recaptchaToken;Object.assign(c,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:o,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return c}return s?Object.assign(c,{captchaResp:o}):Object.assign(c,{captchaResponse:o}),Object.assign(c,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(c,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),c}async function Bc(n,e,t,s,r){var i;if((i=n._getRecaptchaConfig())!=null&&i.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const o=await Ud(n,e,t,t==="getOobCode");return s(n,o)}else return s(n,e).catch(async o=>{if(o.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const c=await Ud(n,e,t,t==="getOobCode");return s(n,c)}else return Promise.reject(o)})}/**
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
 */function nI(n,e){const t=Jt(n,"auth");if(t.isInitialized()){const r=t.getImmediate(),i=t.getOptions();if(Nt(i,e??{}))return r;nt(r,"already-initialized")}return t.initialize({options:e})}function sI(n,e){const t=(e==null?void 0:e.persistence)||[],s=(Array.isArray(t)?t:[t]).map(Ut);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function rI(n,e,t){const s=Xt(n);x(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const r=!1,i=bm(e),{host:o,port:c}=iI(e),l=c===null?"":`:${c}`,u={url:`${i}//${o}${l}/`},f=Object.freeze({host:o,port:c,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!s._canInitEmulator){x(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),x(Nt(u,s.config.emulator)&&Nt(f,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=u,s.emulatorConfig=f,s.settings.appVerificationDisabledForTesting=!0,wt(o)?ui(`${i}//${o}${l}`):oI()}function bm(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function iI(n){const e=bm(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const s=t[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(s);if(r){const i=r[1];return{host:i,port:Bd(s.substr(i.length+1))}}else{const[i,o]=s.split(":");return{host:i,port:Bd(o)}}}function Bd(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function oI(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class Nl{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Rt("not implemented")}_getIdTokenResponse(e){return Rt("not implemented")}_linkToIdToken(e,t){return Rt("not implemented")}_getReauthenticationResolver(e){return Rt("not implemented")}}async function aI(n,e){return lt(n,"POST","/v1/accounts:signUp",e)}/**
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
 */async function cI(n,e){return di(n,"POST","/v1/accounts:signInWithPassword",ft(n,e))}/**
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
 */async function lI(n,e){return di(n,"POST","/v1/accounts:signInWithEmailLink",ft(n,e))}async function uI(n,e){return di(n,"POST","/v1/accounts:signInWithEmailLink",ft(n,e))}/**
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
 */class zr extends Nl{constructor(e,t,s,r=null){super("password",s),this._email=e,this._password=t,this._tenantId=r}static _fromEmailAndPassword(e,t){return new zr(e,t,"password")}static _fromEmailAndCode(e,t,s=null){return new zr(e,t,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Bc(e,t,"signInWithPassword",cI);case"emailLink":return lI(e,{email:this._email,oobCode:this._password});default:nt(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const s={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Bc(e,s,"signUpPassword",aI);case"emailLink":return uI(e,{idToken:t,email:this._email,oobCode:this._password});default:nt(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
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
 */async function Cs(n,e){return di(n,"POST","/v1/accounts:signInWithIdp",ft(n,e))}/**
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
 */const hI="http://localhost";class Qn extends Nl{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Qn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):nt("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:r,...i}=t;if(!s||!r)return null;const o=new Qn(s,r);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return Cs(e,t)}_linkToIdToken(e,t){const s=this.buildRequest();return s.idToken=t,Cs(e,s)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Cs(e,t)}buildRequest(){const e={requestUri:hI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Gs(t)}return e}}/**
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
 */function dI(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function fI(n){const e=Sr(br(n)).link,t=e?Sr(br(e)).deep_link_id:null,s=Sr(br(n)).deep_link_id;return(s?Sr(br(s)).link:null)||s||t||e||n}class Dl{constructor(e){const t=Sr(br(e)),s=t.apiKey??null,r=t.oobCode??null,i=dI(t.mode??null);x(s&&r&&i,"argument-error"),this.apiKey=s,this.operation=i,this.code=r,this.continueUrl=t.continueUrl??null,this.languageCode=t.lang??null,this.tenantId=t.tenantId??null}static parseLink(e){const t=fI(e);try{return new Dl(t)}catch{return null}}}/**
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
 */class Ks{constructor(){this.providerId=Ks.PROVIDER_ID}static credential(e,t){return zr._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const s=Dl.parseLink(t);return x(s,"argument-error"),zr._fromEmailAndCode(e,s.code,s.tenantId)}}Ks.PROVIDER_ID="password";Ks.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Ks.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
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
 */class Ol{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class fi extends Ol{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class an extends fi{constructor(){super("facebook.com")}static credential(e){return Qn._fromParams({providerId:an.PROVIDER_ID,signInMethod:an.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return an.credentialFromTaggedObject(e)}static credentialFromError(e){return an.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return an.credential(e.oauthAccessToken)}catch{return null}}}an.FACEBOOK_SIGN_IN_METHOD="facebook.com";an.PROVIDER_ID="facebook.com";/**
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
 */class cn extends fi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Qn._fromParams({providerId:cn.PROVIDER_ID,signInMethod:cn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return cn.credentialFromTaggedObject(e)}static credentialFromError(e){return cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:s}=e;if(!t&&!s)return null;try{return cn.credential(t,s)}catch{return null}}}cn.GOOGLE_SIGN_IN_METHOD="google.com";cn.PROVIDER_ID="google.com";/**
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
 */class ln extends fi{constructor(){super("github.com")}static credential(e){return Qn._fromParams({providerId:ln.PROVIDER_ID,signInMethod:ln.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return ln.credentialFromTaggedObject(e)}static credentialFromError(e){return ln.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return ln.credential(e.oauthAccessToken)}catch{return null}}}ln.GITHUB_SIGN_IN_METHOD="github.com";ln.PROVIDER_ID="github.com";/**
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
 */class un extends fi{constructor(){super("twitter.com")}static credential(e,t){return Qn._fromParams({providerId:un.PROVIDER_ID,signInMethod:un.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return un.credentialFromTaggedObject(e)}static credentialFromError(e){return un.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:s}=e;if(!t||!s)return null;try{return un.credential(t,s)}catch{return null}}}un.TWITTER_SIGN_IN_METHOD="twitter.com";un.PROVIDER_ID="twitter.com";/**
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
 */async function pI(n,e){return di(n,"POST","/v1/accounts:signUp",ft(n,e))}/**
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
 */class Gt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,s,r=!1){const i=await mt._fromIdTokenResponse(e,s,r),o=qd(s);return new Gt({user:i,providerId:o,_tokenResponse:s,operationType:t})}static async _forOperation(e,t,s){await e._updateTokensIfNecessary(s,!0);const r=qd(s);return new Gt({user:e,providerId:r,_tokenResponse:s,operationType:t})}}function qd(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */class Ro extends dt{constructor(e,t,s,r){super(t.code,t.message),this.operationType=s,this.user=r,Object.setPrototypeOf(this,Ro.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:t.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,t,s,r){return new Ro(e,t,s,r)}}function Pm(n,e,t,s){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Ro._fromErrorAndOperation(n,i,e,s):i})}async function mI(n,e,t=!1){const s=await En(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Gt._forOperation(n,"link",s)}/**
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
 */async function gI(n,e,t=!1){const{auth:s}=n;if(qe(s.app))return Promise.reject($t(s));const r="reauthenticate";try{const i=await En(n,Pm(s,r,e,n),t);x(i.idToken,s,"internal-error");const o=Pl(i.idToken);x(o,s,"internal-error");const{sub:c}=o;return x(n.uid===c,s,"user-mismatch"),Gt._forOperation(n,r,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&nt(s,"user-mismatch"),i}}/**
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
 */async function km(n,e,t=!1){if(qe(n.app))return Promise.reject($t(n));const s="signIn",r=await Pm(n,s,e),i=await Gt._fromIdTokenResponse(n,s,r);return t||await n._updateCurrentUser(i.user),i}async function _I(n,e){return km(Xt(n),e)}/**
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
 */class ua{constructor(e,t){this.factorId=e,this.uid=t.mfaEnrollmentId,this.enrollmentTime=new Date(t.enrolledAt).toUTCString(),this.displayName=t.displayName}static _fromServerResponse(e,t){return"phoneInfo"in t?Vl._fromServerResponse(e,t):"totpInfo"in t?Ml._fromServerResponse(e,t):nt(e,"internal-error")}}class Vl extends ua{constructor(e){super("phone",e),this.phoneNumber=e.phoneInfo}static _fromServerResponse(e,t){return new Vl(t)}}class Ml extends ua{constructor(e){super("totp",e)}static _fromServerResponse(e,t){return new Ml(t)}}/**
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
 */async function Nm(n){const e=Xt(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function AD(n,e,t){if(qe(n.app))return Promise.reject($t(n));const s=Xt(n),o=await Bc(s,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",pI).catch(l=>{throw l.code==="auth/password-does-not-meet-requirements"&&Nm(n),l}),c=await Gt._fromIdTokenResponse(s,"signIn",o);return await s._updateCurrentUser(c.user),c}function RD(n,e,t){return qe(n.app)?Promise.reject($t(n)):_I(W(n),Ks.credential(e,t)).catch(async s=>{throw s.code==="auth/password-does-not-meet-requirements"&&Nm(n),s})}/**
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
 */async function yI(n,e){return lt(n,"POST","/v1/accounts:update",e)}/**
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
 */async function CD(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const s=W(n),i={idToken:await s.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await En(s,yI(s.auth,i));s.displayName=o.displayName||null,s.photoURL=o.photoUrl||null;const c=s.providerData.find(({providerId:l})=>l==="password");c&&(c.displayName=s.displayName,c.photoURL=s.photoURL),await s._updateTokensIfNecessary(o)}/**
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
 */function SD(n,e){return W(n).setPersistence(e)}function EI(n,e,t,s){return W(n).onIdTokenChanged(e,t,s)}function TI(n,e,t){return W(n).beforeAuthStateChanged(e,t)}function bD(n,e,t,s){return W(n).onAuthStateChanged(e,t,s)}function PD(n){return W(n).signOut()}/**
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
 */class qn{constructor(e,t,s){this.type=e,this.credential=t,this.user=s}static _fromIdtoken(e,t){return new qn("enroll",e,t)}static _fromMfaPendingCredential(e){return new qn("signin",e)}toJSON(){return{multiFactorSession:{[this.type==="enroll"?"idToken":"pendingCredential"]:this.credential}}}static fromJSON(e){var t,s;if(e!=null&&e.multiFactorSession){if((t=e.multiFactorSession)!=null&&t.pendingCredential)return qn._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);if((s=e.multiFactorSession)!=null&&s.idToken)return qn._fromIdtoken(e.multiFactorSession.idToken)}return null}}/**
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
 */class xl{constructor(e,t,s){this.session=e,this.hints=t,this.signInResolver=s}static _fromError(e,t){const s=Xt(e),r=t.customData._serverResponse,i=(r.mfaInfo||[]).map(c=>ua._fromServerResponse(s,c));x(r.mfaPendingCredential,s,"internal-error");const o=qn._fromMfaPendingCredential(r.mfaPendingCredential);return new xl(o,i,async c=>{const l=await c._process(s,o);delete r.mfaInfo,delete r.mfaPendingCredential;const u={...r,idToken:l.idToken,refreshToken:l.refreshToken};switch(t.operationType){case"signIn":const f=await Gt._fromIdTokenResponse(s,t.operationType,u);return await s._updateCurrentUser(f.user),f;case"reauthenticate":return x(t.user,s,"internal-error"),Gt._forOperation(t.user,t.operationType,u);default:nt(s,"internal-error")}})}async resolveSignIn(e){const t=e;return this.signInResolver(t)}}function kD(n,e){var r;const t=W(n),s=e;return x(e.customData.operationType,t,"argument-error"),x((r=s.customData._serverResponse)==null?void 0:r.mfaPendingCredential,t,"argument-error"),xl._fromError(t,s)}function wI(n,e){return lt(n,"POST","/v2/accounts/mfaEnrollment:start",ft(n,e))}function II(n,e){return lt(n,"POST","/v2/accounts/mfaEnrollment:finalize",ft(n,e))}function vI(n,e){return lt(n,"POST","/v2/accounts/mfaEnrollment:withdraw",ft(n,e))}class Ll{constructor(e){this.user=e,this.enrolledFactors=[],e._onReload(t=>{t.mfaInfo&&(this.enrolledFactors=t.mfaInfo.map(s=>ua._fromServerResponse(e.auth,s)))})}static _fromUser(e){return new Ll(e)}async getSession(){return qn._fromIdtoken(await this.user.getIdToken(),this.user)}async enroll(e,t){const s=e,r=await this.getSession(),i=await En(this.user,s._process(this.user.auth,r,t));return await this.user._updateTokensIfNecessary(i),this.user.reload()}async unenroll(e){const t=typeof e=="string"?e:e.uid,s=await this.user.getIdToken();try{const r=await En(this.user,vI(this.user.auth,{idToken:s,mfaEnrollmentId:t}));this.enrolledFactors=this.enrolledFactors.filter(({uid:i})=>i!==t),await this.user._updateTokensIfNecessary(r),await this.user.reload()}catch(r){throw r}}}const mc=new WeakMap;function ND(n){const e=W(n);return mc.has(e)||mc.set(e,Ll._fromUser(e)),mc.get(e)}const Co="__sak";/**
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
 */class Dm{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Co,"1"),this.storage.removeItem(Co),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const AI=1e3,RI=10;class Om extends Dm{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Am(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const s=this.storage.getItem(t),r=this.localCache[t];s!==r&&e(t,r,s)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,c,l)=>{this.notifyListeners(o,l)});return}const s=e.key;t?this.detachListener():this.stopPolling();const r=()=>{const o=this.storage.getItem(s);!t&&this.localCache[s]===o||this.notifyListeners(s,o)},i=this.storage.getItem(s);$w()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,RI):r()}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:s}),!0)})},AI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Om.type="LOCAL";const CI=Om;/**
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
 */class Vm extends Dm{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Vm.type="SESSION";const Mm=Vm;/**
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
 */function SI(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class ha{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(r=>r.isListeningto(e));if(t)return t;const s=new ha(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:s,eventType:r,data:i}=t.data,o=this.handlersMap[r];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:s,eventType:r});const c=Array.from(o).map(async u=>u(t.origin,i)),l=await SI(c);t.ports[0].postMessage({status:"done",eventId:s,eventType:r,response:l})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ha.receivers=[];/**
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
 */function Fl(n="",e=10){let t="";for(let s=0;s<e;s++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class bI{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,s=50){const r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let i,o;return new Promise((c,l)=>{const u=Fl("",20);r.port1.start();const f=setTimeout(()=>{l(new Error("unsupported_event"))},s);o={messageChannel:r,onMessage(p){const m=p;if(m.data.eventId===u)switch(m.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),c(m.data.response);break;default:clearTimeout(f),clearTimeout(i),l(new Error("invalid_response"));break}}},this.handlers.add(o),r.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[r.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
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
 */function St(){return window}function PI(n){St().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */function xm(){return typeof St().WorkerGlobalScope<"u"&&typeof St().importScripts=="function"}async function kI(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function NI(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)==null?void 0:n.controller)||null}function DI(){return xm()?self:null}/**
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
 */const Lm="firebaseLocalStorageDb",OI=1,So="firebaseLocalStorage",Fm="fbase_key";class pi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function da(n,e){return n.transaction([So],e?"readwrite":"readonly").objectStore(So)}function VI(){const n=indexedDB.deleteDatabase(Lm);return new pi(n).toPromise()}function qc(){const n=indexedDB.open(Lm,OI);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const s=n.result;try{s.createObjectStore(So,{keyPath:Fm})}catch(r){t(r)}}),n.addEventListener("success",async()=>{const s=n.result;s.objectStoreNames.contains(So)?e(s):(s.close(),await VI(),e(await qc()))})})}async function $d(n,e,t){const s=da(n,!0).put({[Fm]:e,value:t});return new pi(s).toPromise()}async function MI(n,e){const t=da(n,!1).get(e),s=await new pi(t).toPromise();return s===void 0?null:s.value}function Wd(n,e){const t=da(n,!0).delete(e);return new pi(t).toPromise()}const xI=800,LI=3;class Um{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await qc(),this.db)}async _withRetries(e){let t=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(t++>LI)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return xm()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ha._getInstance(DI()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var t,s;if(this.activeServiceWorker=await kI(),!this.activeServiceWorker)return;this.sender=new bI(this.activeServiceWorker);const e=await this.sender._send("ping",{},800);e&&(t=e[0])!=null&&t.fulfilled&&(s=e[0])!=null&&s.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||NI()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await qc();return await $d(e,Co,"1"),await Wd(e,Co),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(s=>$d(s,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(s=>MI(s,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Wd(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(r=>{const i=da(r,!1).getAll();return new pi(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],s=new Set;if(e.length!==0)for(const{fbase_key:r,value:i}of e)s.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(i)&&(this.notifyListeners(r,i),t.push(r));for(const r of Object.keys(this.localCache))this.localCache[r]&&!s.has(r)&&(this.notifyListeners(r,null),t.push(r));return t}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const r of Array.from(s))r(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),xI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Um.type="LOCAL";const FI=Um;function UI(n,e){return lt(n,"POST","/v2/accounts/mfaSignIn:finalize",ft(n,e))}new hi(3e4,6e4);/**
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
 */function Bm(n,e){return e?Ut(e):(x(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class Ul extends Nl{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Cs(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Cs(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Cs(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function BI(n){return km(n.auth,new Ul(n),n.bypassAuthState)}function qI(n){const{auth:e,user:t}=n;return x(t,e,"internal-error"),gI(t,new Ul(n),n.bypassAuthState)}async function $I(n){const{auth:e,user:t}=n;return x(t,e,"internal-error"),mI(t,new Ul(n),n.bypassAuthState)}/**
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
 */class qm{constructor(e,t,s,r,i=!1){this.auth=e,this.resolver=s,this.user=r,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:s,postBody:r,tenantId:i,error:o,type:c}=e;if(o){this.reject(o);return}const l={auth:this.auth,requestUri:t,sessionId:s,tenantId:i||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(l))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return BI;case"linkViaPopup":case"linkViaRedirect":return $I;case"reauthViaPopup":case"reauthViaRedirect":return qI;default:nt(this.auth,"internal-error")}}resolve(e){Ht(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Ht(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const WI=new hi(2e3,1e4);async function DD(n,e,t){if(qe(n.app))return Promise.reject(_t(n,"operation-not-supported-in-this-environment"));const s=Xt(n);Iw(n,e,Ol);const r=Bm(s,t);return new $n(s,"signInViaPopup",e,r).executeNotNull()}class $n extends qm{constructor(e,t,s,r,i){super(e,t,r,i),this.provider=s,this.authWindow=null,this.pollId=null,$n.currentPopupAction&&$n.currentPopupAction.cancel(),$n.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return x(e,this.auth,"internal-error"),e}async onExecution(){Ht(this.filter.length===1,"Popup operations only handle one event");const e=Fl();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(_t(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)==null?void 0:e.associatedEvent)||null}cancel(){this.reject(_t(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,$n.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,s;if((s=(t=this.authWindow)==null?void 0:t.window)!=null&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(_t(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,WI.get())};e()}}$n.currentPopupAction=null;/**
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
 */const jI="pendingRedirect",ao=new Map;class HI extends qm{constructor(e,t,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,s),this.eventId=null}async execute(){let e=ao.get(this.auth._key());if(!e){try{const s=await GI(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(t){e=()=>Promise.reject(t)}ao.set(this.auth._key(),e)}return this.bypassAuthState||ao.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function GI(n,e){const t=QI(e),s=KI(n);if(!await s._isAvailable())return!1;const r=await s._get(t)==="true";return await s._remove(t),r}function zI(n,e){ao.set(n._key(),e)}function KI(n){return Ut(n._redirectPersistence)}function QI(n){return oo(jI,n.config.apiKey,n.name)}async function YI(n,e,t=!1){if(qe(n.app))return Promise.reject($t(n));const s=Xt(n),r=Bm(s,e),o=await new HI(s,r,t).execute();return o&&!t&&(delete o.user._redirectEventId,await s._persistUserIfCurrent(o.user),await s._setRedirectUser(null,e)),o}/**
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
 */const JI=600*1e3;class XI{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(t=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!ZI(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var s;if(e.error&&!$m(e)){const r=((s=e.error.code)==null?void 0:s.split("auth/")[1])||"internal-error";t.onError(_t(this.auth,r))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const s=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=JI&&this.cachedEventUids.clear(),this.cachedEventUids.has(jd(e))}saveEventToCache(e){this.cachedEventUids.add(jd(e)),this.lastProcessedEventTime=Date.now()}}function jd(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function $m({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function ZI(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return $m(n);default:return!1}}/**
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
 */async function ev(n,e={}){return lt(n,"GET","/v1/projects",e)}/**
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
 */const tv=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,nv=/^https?/;async function sv(n){if(n.config.emulator)return;const{authorizedDomains:e}=await ev(n);for(const t of e)try{if(rv(t))return}catch{}nt(n,"unauthorized-domain")}function rv(n){const e=Fc(),{protocol:t,hostname:s}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&s===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===s}if(!nv.test(t))return!1;if(tv.test(n))return s===n;const r=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const iv=new hi(3e4,6e4);function Hd(){const n=St().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function ov(n){return new Promise((e,t)=>{var r,i,o;function s(){Hd(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Hd(),t(_t(n,"network-request-failed"))},timeout:iv.get()})}if((i=(r=St().gapi)==null?void 0:r.iframes)!=null&&i.Iframe)e(gapi.iframes.getContext());else if((o=St().gapi)!=null&&o.load)s();else{const c=Jw("iframefcb");return St()[c]=()=>{gapi.load?s():t(_t(n,"network-request-failed"))},Cm(`${Yw()}?onload=${c}`).catch(l=>t(l))}}).catch(e=>{throw co=null,e})}let co=null;function av(n){return co=co||ov(n),co}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const cv=new hi(5e3,15e3),lv="__/auth/iframe",uv="emulator/auth/iframe",hv={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},dv=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function fv(n){const e=n.config;x(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?bl(e,uv):`https://${n.config.authDomain}/${lv}`,s={apiKey:e.apiKey,appName:n.name,v:Pn},r=dv.get(n.config.apiHost);r&&(s.eid=r);const i=n._getFrameworks();return i.length&&(s.fw=i.join(",")),`${t}?${Gs(s).slice(1)}`}async function pv(n){const e=await av(n),t=St().gapi;return x(t,n,"internal-error"),e.open({where:document.body,url:fv(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:hv,dontclear:!0},s=>new Promise(async(r,i)=>{await s.restyle({setHideOnLeave:!1});const o=_t(n,"network-request-failed"),c=St().setTimeout(()=>{i(o)},cv.get());function l(){St().clearTimeout(c),r(s)}s.ping(l).then(l,()=>{i(o)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const mv={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},gv=500,_v=600,yv="_blank",Ev="http://localhost";class Gd{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function Tv(n,e,t,s=gv,r=_v){const i=Math.max((window.screen.availHeight-r)/2,0).toString(),o=Math.max((window.screen.availWidth-s)/2,0).toString();let c="";const l={...mv,width:s.toString(),height:r.toString(),top:i,left:o},u=We().toLowerCase();t&&(c=Em(u)?yv:t),_m(u)&&(e=e||Ev,l.scrollbars="yes");const f=Object.entries(l).reduce((m,[T,S])=>`${m}${T}=${S},`,"");if(qw(u)&&c!=="_self")return wv(e||"",c),new Gd(null);const p=window.open(e||"",c,f);x(p,n,"popup-blocked");try{p.focus()}catch{}return new Gd(p)}function wv(n,e){const t=document.createElement("a");t.href=n,t.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(s)}/**
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
 */const Iv="__/auth/handler",vv="emulator/auth/handler",Av=encodeURIComponent("fac");async function zd(n,e,t,s,r,i){x(n.config.authDomain,n,"auth-domain-config-required"),x(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:s,v:Pn,eventId:r};if(e instanceof Ol){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",Eo(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,p]of Object.entries({}))o[f]=p}if(e instanceof fi){const f=e.getScopes().filter(p=>p!=="");f.length>0&&(o.scopes=f.join(","))}n.tenantId&&(o.tid=n.tenantId);const c=o;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const l=await n._getAppCheckToken(),u=l?`#${Av}=${encodeURIComponent(l)}`:"";return`${Rv(n)}?${Gs(c).slice(1)}${u}`}function Rv({config:n}){return n.emulator?bl(n,vv):`https://${n.authDomain}/${Iv}`}/**
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
 */const gc="webStorageSupport";class Cv{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Mm,this._completeRedirectFn=YI,this._overrideRedirectResult=zI}async _openPopup(e,t,s,r){var o;Ht((o=this.eventManagers[e._key()])==null?void 0:o.manager,"_initialize() not called before _openPopup()");const i=await zd(e,t,s,Fc(),r);return Tv(e,i,Fl())}async _openRedirect(e,t,s,r){await this._originValidation(e);const i=await zd(e,t,s,Fc(),r);return PI(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:r,promise:i}=this.eventManagers[t];return r?Promise.resolve(r):(Ht(i,"If manager is not set, promise should be"),i)}const s=this.initAndGetManager(e);return this.eventManagers[t]={promise:s},s.catch(()=>{delete this.eventManagers[t]}),s}async initAndGetManager(e){const t=await pv(e),s=new XI(e);return t.register("authEvent",r=>(x(r==null?void 0:r.authEvent,e,"invalid-auth-event"),{status:s.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=t,s}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(gc,{type:gc},r=>{var o;const i=(o=r==null?void 0:r[0])==null?void 0:o[gc];i!==void 0&&t(!!i),nt(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=sv(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Am()||ym()||kl()}}const Sv=Cv;class bv{constructor(e){this.factorId=e}_process(e,t,s){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,s);case"signin":return this._finalizeSignIn(e,t.credential);default:return Rt("unexpected MultiFactorSessionType")}}}class Pv{static assertionForEnrollment(e,t){return Kr._fromSecret(e,t)}static assertionForSignIn(e,t){return Kr._fromEnrollmentId(e,t)}static async generateSecret(e){var r;const t=e;x(typeof((r=t.user)==null?void 0:r.auth)<"u","internal-error");const s=await wI(t.user.auth,{idToken:t.credential,totpEnrollmentInfo:{}});return Bl._fromStartTotpMfaEnrollmentResponse(s,t.user.auth)}}Pv.FACTOR_ID="totp";class Kr extends bv{constructor(e,t,s){super("totp"),this.otp=e,this.enrollmentId=t,this.secret=s}static _fromSecret(e,t){return new Kr(t,void 0,e)}static _fromEnrollmentId(e,t){return new Kr(t,e)}async _finalizeEnroll(e,t,s){return x(typeof this.secret<"u",e,"argument-error"),II(e,{idToken:t,displayName:s,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,t){x(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");const s={verificationCode:this.otp};return UI(e,{mfaPendingCredential:t,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:s})}}class Bl{constructor(e,t,s,r,i,o,c){this.sessionInfo=o,this.auth=c,this.secretKey=e,this.hashingAlgorithm=t,this.codeLength=s,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=i}static _fromStartTotpMfaEnrollmentResponse(e,t){return new Bl(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,t)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,t){var r;let s=!1;return(Qi(e)||Qi(t))&&(s=!0),s&&(Qi(e)&&(e=((r=this.auth.currentUser)==null?void 0:r.email)||"unknownuser"),Qi(t)&&(t=this.auth.name)),`otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}}function Qi(n){return typeof n>"u"||(n==null?void 0:n.length)===0}var Kd="@firebase/auth",Qd="1.13.1";/**
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
 */class kv{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)==null?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){x(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Nv(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Dv(n){ct(new tt("auth",(e,{options:t})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:c}=s.options;x(o&&!o.includes(":"),"invalid-api-key",{appName:s.name});const l={apiKey:o,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Rm(n)},u=new zw(s,r,i,l);return sI(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,s)=>{e.getProvider("auth-internal").initialize()})),ct(new tt("auth-internal",e=>{const t=Xt(e.getProvider("auth").getImmediate());return(s=>new kv(s))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Ve(Kd,Qd,Nv(n)),Ve(Kd,Qd,"esm2020")}/**
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
 */const Ov=300,Vv=sm("authIdTokenMaxAge")||Ov;let Yd=null;const Mv=n=>async e=>{const t=e&&await e.getIdTokenResult(),s=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(s&&s>Vv)return;const r=t==null?void 0:t.token;Yd!==r&&(Yd=r,await fetch(n,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function OD(n=zs()){const e=Jt(n,"auth");if(e.isInitialized())return e.getImmediate();const t=nI(n,{popupRedirectResolver:Sv,persistence:[FI,CI,Mm]}),s=sm("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(s,location.origin);if(location.origin===i.origin){const o=Mv(i.toString());TI(t,o,()=>o(t.currentUser)),EI(t,c=>o(c))}}const r=tm("auth");return r&&rI(t,`http://${r}`),t}function xv(){var n;return((n=document.getElementsByTagName("head"))==null?void 0:n[0])??document}Kw({loadJS(n){return new Promise((e,t)=>{const s=document.createElement("script");s.setAttribute("src",n),s.onload=e,s.onerror=r=>{const i=_t("internal-error");i.customData=r,t(i)},s.type="text/javascript",s.charset="UTF-8",xv().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Dv("Browser");const Wm="@firebase/installations",ql="0.6.22";/**
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
 */const jm=1e4,Hm=`w:${ql}`,Gm="FIS_v2",Lv="https://firebaseinstallations.googleapis.com/v1",Fv=3600*1e3,Uv="installations",Bv="Installations";/**
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
 */const qv={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},Yn=new os(Uv,Bv,qv);function zm(n){return n instanceof dt&&n.code.includes("request-failed")}/**
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
 */function Km({projectId:n}){return`${Lv}/projects/${n}/installations`}function Qm(n){return{token:n.token,requestStatus:2,expiresIn:Wv(n.expiresIn),creationTime:Date.now()}}async function Ym(n,e){const s=(await e.json()).error;return Yn.create("request-failed",{requestName:n,serverCode:s.code,serverMessage:s.message,serverStatus:s.status})}function Jm({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function $v(n,{refreshToken:e}){const t=Jm(n);return t.append("Authorization",jv(e)),t}async function Xm(n){const e=await n();return e.status>=500&&e.status<600?n():e}function Wv(n){return Number(n.replace("s","000"))}function jv(n){return`${Gm} ${n}`}/**
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
 */async function Hv({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const s=Km(n),r=Jm(n),i=e.getImmediate({optional:!0});if(i){const u=await i.getHeartbeatsHeader();u&&r.append("x-firebase-client",u)}const o={fid:t,authVersion:Gm,appId:n.appId,sdkVersion:Hm},c={method:"POST",headers:r,body:JSON.stringify(o)},l=await Xm(()=>fetch(s,c));if(l.ok){const u=await l.json();return{fid:u.fid||t,registrationStatus:2,refreshToken:u.refreshToken,authToken:Qm(u.authToken)}}else throw await Ym("Create Installation",l)}/**
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
 */function Zm(n){return new Promise(e=>{setTimeout(e,n)})}/**
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
 */function Gv(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
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
 */const zv=/^[cdef][\w-]{21}$/,$c="";function Kv(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=Qv(n);return zv.test(t)?t:$c}catch{return $c}}function Qv(n){return Gv(n).substr(0,22)}/**
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
 */function fa(n){return`${n.appName}!${n.appId}`}/**
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
 */const eg=new Map;function tg(n,e){const t=fa(n);ng(t,e),Yv(t,e)}function ng(n,e){const t=eg.get(n);if(t)for(const s of t)s(e)}function Yv(n,e){const t=Jv();t&&t.postMessage({key:n,fid:e}),Xv()}let Wn=null;function Jv(){return!Wn&&"BroadcastChannel"in self&&(Wn=new BroadcastChannel("[Firebase] FID Change"),Wn.onmessage=n=>{ng(n.data.key,n.data.fid)}),Wn}function Xv(){eg.size===0&&Wn&&(Wn.close(),Wn=null)}/**
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
 */const Zv="firebase-installations-database",eA=1,Jn="firebase-installations-store";let _c=null;function $l(){return _c||(_c=ra(Zv,eA,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(Jn)}}})),_c}async function bo(n,e){const t=fa(n),r=(await $l()).transaction(Jn,"readwrite"),i=r.objectStore(Jn),o=await i.get(t);return await i.put(e,t),await r.done,(!o||o.fid!==e.fid)&&tg(n,e.fid),e}async function sg(n){const e=fa(n),s=(await $l()).transaction(Jn,"readwrite");await s.objectStore(Jn).delete(e),await s.done}async function pa(n,e){const t=fa(n),r=(await $l()).transaction(Jn,"readwrite"),i=r.objectStore(Jn),o=await i.get(t),c=e(o);return c===void 0?await i.delete(t):await i.put(c,t),await r.done,c&&(!o||o.fid!==c.fid)&&tg(n,c.fid),c}/**
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
 */async function Wl(n){let e;const t=await pa(n.appConfig,s=>{const r=tA(s),i=nA(n,r);return e=i.registrationPromise,i.installationEntry});return t.fid===$c?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function tA(n){const e=n||{fid:Kv(),registrationStatus:0};return rg(e)}function nA(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const r=Promise.reject(Yn.create("app-offline"));return{installationEntry:e,registrationPromise:r}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},s=sA(n,t);return{installationEntry:t,registrationPromise:s}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:rA(n)}:{installationEntry:e}}async function sA(n,e){try{const t=await Hv(n,e);return bo(n.appConfig,t)}catch(t){throw zm(t)&&t.customData.serverCode===409?await sg(n.appConfig):await bo(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function rA(n){let e=await Jd(n.appConfig);for(;e.registrationStatus===1;)await Zm(100),e=await Jd(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:s}=await Wl(n);return s||t}return e}function Jd(n){return pa(n,e=>{if(!e)throw Yn.create("installation-not-found");return rg(e)})}function rg(n){return iA(n)?{fid:n.fid,registrationStatus:0}:n}function iA(n){return n.registrationStatus===1&&n.registrationTime+jm<Date.now()}/**
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
 */async function oA({appConfig:n,heartbeatServiceProvider:e},t){const s=aA(n,t),r=$v(n,t),i=e.getImmediate({optional:!0});if(i){const u=await i.getHeartbeatsHeader();u&&r.append("x-firebase-client",u)}const o={installation:{sdkVersion:Hm,appId:n.appId}},c={method:"POST",headers:r,body:JSON.stringify(o)},l=await Xm(()=>fetch(s,c));if(l.ok){const u=await l.json();return Qm(u)}else throw await Ym("Generate Auth Token",l)}function aA(n,{fid:e}){return`${Km(n)}/${e}/authTokens:generate`}/**
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
 */async function jl(n,e=!1){let t;const s=await pa(n.appConfig,i=>{if(!ig(i))throw Yn.create("not-registered");const o=i.authToken;if(!e&&uA(o))return i;if(o.requestStatus===1)return t=cA(n,e),i;{if(!navigator.onLine)throw Yn.create("app-offline");const c=dA(i);return t=lA(n,c),c}});return t?await t:s.authToken}async function cA(n,e){let t=await Xd(n.appConfig);for(;t.authToken.requestStatus===1;)await Zm(100),t=await Xd(n.appConfig);const s=t.authToken;return s.requestStatus===0?jl(n,e):s}function Xd(n){return pa(n,e=>{if(!ig(e))throw Yn.create("not-registered");const t=e.authToken;return fA(t)?{...e,authToken:{requestStatus:0}}:e})}async function lA(n,e){try{const t=await oA(n,e),s={...e,authToken:t};return await bo(n.appConfig,s),t}catch(t){if(zm(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await sg(n.appConfig);else{const s={...e,authToken:{requestStatus:0}};await bo(n.appConfig,s)}throw t}}function ig(n){return n!==void 0&&n.registrationStatus===2}function uA(n){return n.requestStatus===2&&!hA(n)}function hA(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+Fv}function dA(n){const e={requestStatus:1,requestTime:Date.now()};return{...n,authToken:e}}function fA(n){return n.requestStatus===1&&n.requestTime+jm<Date.now()}/**
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
 */async function pA(n){const e=n,{installationEntry:t,registrationPromise:s}=await Wl(e);return s?s.catch(console.error):jl(e).catch(console.error),t.fid}/**
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
 */async function mA(n,e=!1){const t=n;return await gA(t),(await jl(t,e)).token}async function gA(n){const{registrationPromise:e}=await Wl(n);e&&await e}/**
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
 */function _A(n){if(!n||!n.options)throw yc("App Configuration");if(!n.name)throw yc("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw yc(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function yc(n){return Yn.create("missing-app-config-values",{valueName:n})}/**
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
 */const og="installations",yA="installations-internal",EA=n=>{const e=n.getProvider("app").getImmediate(),t=_A(e),s=Jt(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:s,_delete:()=>Promise.resolve()}},TA=n=>{const e=n.getProvider("app").getImmediate(),t=Jt(e,og).getImmediate();return{getId:()=>pA(t),getToken:r=>mA(t,r)}};function wA(){ct(new tt(og,EA,"PUBLIC")),ct(new tt(yA,TA,"PRIVATE"))}wA();Ve(Wm,ql);Ve(Wm,ql,"esm2020");/**
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
 */const IA="/firebase-messaging-sw.js",vA="/firebase-cloud-messaging-push-scope",ag="BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4",AA="https://fcmregistrations.googleapis.com/v1",cg="google.c.a.c_id",RA="google.c.a.c_l",CA="google.c.a.ts",SA="google.c.a.e",Zd=1e4;var ef;(function(n){n[n.DATA_MESSAGE=1]="DATA_MESSAGE",n[n.DISPLAY_NOTIFICATION=3]="DISPLAY_NOTIFICATION"})(ef||(ef={}));/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */var Qr;(function(n){n.PUSH_RECEIVED="push-received",n.NOTIFICATION_CLICKED="notification-clicked"})(Qr||(Qr={}));/**
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
 */function Lt(n){const e=new Uint8Array(n);return btoa(String.fromCharCode(...e)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}function bA(n){const e="=".repeat((4-n.length%4)%4),t=(n+e).replace(/\-/g,"+").replace(/_/g,"/"),s=atob(t),r=new Uint8Array(s.length);for(let i=0;i<s.length;++i)r[i]=s.charCodeAt(i);return r}/**
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
 */const Ec="fcm_token_details_db",PA=5,tf="fcm_token_object_Store";async function kA(n){if("databases"in indexedDB&&!(await indexedDB.databases()).map(i=>i.name).includes(Ec))return null;let e=null;return(await ra(Ec,PA,{upgrade:async(s,r,i,o)=>{if(r<2||!s.objectStoreNames.contains(tf))return;const c=o.objectStore(tf),l=await c.index("fcmSenderId").get(n);if(await c.clear(),!!l){if(r===2){const u=l;if(!u.auth||!u.p256dh||!u.endpoint)return;e={token:u.fcmToken,createTime:u.createTime??Date.now(),subscriptionOptions:{auth:u.auth,p256dh:u.p256dh,endpoint:u.endpoint,swScope:u.swScope,vapidKey:typeof u.vapidKey=="string"?u.vapidKey:Lt(u.vapidKey)}}}else if(r===3){const u=l;e={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:Lt(u.auth),p256dh:Lt(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:Lt(u.vapidKey)}}}else if(r===4){const u=l;e={token:u.fcmToken,createTime:u.createTime,subscriptionOptions:{auth:Lt(u.auth),p256dh:Lt(u.p256dh),endpoint:u.endpoint,swScope:u.swScope,vapidKey:Lt(u.vapidKey)}}}}}})).close(),await hc(Ec),await hc("fcm_vapid_details_db"),await hc("undefined"),NA(e)?e:null}function NA(n){if(!n||!n.subscriptionOptions)return!1;const{subscriptionOptions:e}=n;return typeof n.createTime=="number"&&n.createTime>0&&typeof n.token=="string"&&n.token.length>0&&typeof e.auth=="string"&&e.auth.length>0&&typeof e.p256dh=="string"&&e.p256dh.length>0&&typeof e.endpoint=="string"&&e.endpoint.length>0&&typeof e.swScope=="string"&&e.swScope.length>0&&typeof e.vapidKey=="string"&&e.vapidKey.length>0}/**
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
 */const DA="firebase-messaging-database",OA=1,Yr="firebase-messaging-store";let Tc=null;function lg(){return Tc||(Tc=ra(DA,OA,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(Yr)}}})),Tc}async function VA(n){const e=ug(n),s=await(await lg()).transaction(Yr).objectStore(Yr).get(e);if(s)return s;{const r=await kA(n.appConfig.senderId);if(r)return await Hl(n,r),r}}async function Hl(n,e){const t=ug(n),r=(await lg()).transaction(Yr,"readwrite");return await r.objectStore(Yr).put(e,t),await r.done,e}function ug({appConfig:n}){return n.appId}/**
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
 */const MA={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"only-available-in-window":"This method is available in a Window context.","only-available-in-sw":"This method is available in a service worker context.","permission-default":"The notification permission was not granted and dismissed instead.","permission-blocked":"The notification permission was not granted and blocked instead.","unsupported-browser":"This browser doesn't support the API's required to use the Firebase SDK.","indexed-db-unsupported":"This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)","failed-service-worker-registration":"We are unable to register the default service worker. {$browserErrorMessage}","token-subscribe-failed":"A problem occurred while subscribing the user to FCM: {$errorInfo}","token-subscribe-no-token":"FCM returned no token when subscribing the user to push.","token-unsubscribe-failed":"A problem occurred while unsubscribing the user from FCM: {$errorInfo}","token-update-failed":"A problem occurred while updating the user from FCM: {$errorInfo}","token-update-no-token":"FCM returned no token when updating the user to push.","use-sw-after-get-token":"The useServiceWorker() method may only be called once and must be called before calling getToken() to ensure your service worker is used.","invalid-sw-registration":"The input to useServiceWorker() must be a ServiceWorkerRegistration.","invalid-bg-handler":"The input to setBackgroundMessageHandler() must be a function.","invalid-vapid-key":"The public VAPID key must be a string.","use-vapid-key-after-get-token":"The usePublicVapidKey() method may only be called once and must be called before calling getToken() to ensure your VAPID key is used."},$e=new os("messaging","Messaging",MA);/**
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
 */async function xA(n,e){const t=await zl(n),s=hg(e),r={method:"POST",headers:t,body:JSON.stringify(s)};let i;try{i=await(await fetch(Gl(n.appConfig),r)).json()}catch(o){throw $e.create("token-subscribe-failed",{errorInfo:o==null?void 0:o.toString()})}if(i.error){const o=i.error.message;throw $e.create("token-subscribe-failed",{errorInfo:o})}if(!i.token)throw $e.create("token-subscribe-no-token");return i.token}async function LA(n,e){const t=await zl(n),s=hg(e.subscriptionOptions),r={method:"PATCH",headers:t,body:JSON.stringify(s)};let i;try{i=await(await fetch(`${Gl(n.appConfig)}/${e.token}`,r)).json()}catch(o){throw $e.create("token-update-failed",{errorInfo:o==null?void 0:o.toString()})}if(i.error){const o=i.error.message;throw $e.create("token-update-failed",{errorInfo:o})}if(!i.token)throw $e.create("token-update-no-token");return i.token}async function FA(n,e){const s={method:"DELETE",headers:await zl(n)};try{const i=await(await fetch(`${Gl(n.appConfig)}/${e}`,s)).json();if(i.error){const o=i.error.message;throw $e.create("token-unsubscribe-failed",{errorInfo:o})}}catch(r){throw $e.create("token-unsubscribe-failed",{errorInfo:r==null?void 0:r.toString()})}}function Gl({projectId:n}){return`${AA}/projects/${n}/registrations`}async function zl({appConfig:n,installations:e}){const t=await e.getToken();return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n.apiKey,"x-goog-firebase-installations-auth":`FIS ${t}`})}function hg({p256dh:n,auth:e,endpoint:t,vapidKey:s}){const r={web:{endpoint:t,auth:e,p256dh:n}};return s!==ag&&(r.web.applicationPubKey=s),r}/**
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
 */const UA=10080*60*1e3;async function BA(n){const e=await $A(n.swRegistration,n.vapidKey),t={vapidKey:n.vapidKey,swScope:n.swRegistration.scope,endpoint:e.endpoint,auth:Lt(e.getKey("auth")),p256dh:Lt(e.getKey("p256dh"))},s=await VA(n.firebaseDependencies);if(s){if(WA(s.subscriptionOptions,t))return Date.now()>=s.createTime+UA?qA(n,{token:s.token,createTime:Date.now(),subscriptionOptions:t}):s.token;try{await FA(n.firebaseDependencies,s.token)}catch(r){console.warn(r)}return nf(n.firebaseDependencies,t)}else return nf(n.firebaseDependencies,t)}async function qA(n,e){try{const t=await LA(n.firebaseDependencies,e),s={...e,token:t,createTime:Date.now()};return await Hl(n.firebaseDependencies,s),t}catch(t){throw t}}async function nf(n,e){const s={token:await xA(n,e),createTime:Date.now(),subscriptionOptions:e};return await Hl(n,s),s.token}async function $A(n,e){const t=await n.pushManager.getSubscription();return t||n.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:bA(e)})}function WA(n,e){const t=e.vapidKey===n.vapidKey,s=e.endpoint===n.endpoint,r=e.auth===n.auth,i=e.p256dh===n.p256dh;return t&&s&&r&&i}/**
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
 */function sf(n){const e={from:n.from,collapseKey:n.collapse_key,messageId:n.fcmMessageId};return jA(e,n),HA(e,n),GA(e,n),e}function jA(n,e){if(!e.notification)return;n.notification={};const t=e.notification.title;t&&(n.notification.title=t);const s=e.notification.body;s&&(n.notification.body=s);const r=e.notification.image;r&&(n.notification.image=r);const i=e.notification.icon;i&&(n.notification.icon=i)}function HA(n,e){e.data&&(n.data=e.data)}function GA(n,e){var r,i,o,c;if(!e.fcmOptions&&!((r=e.notification)!=null&&r.click_action))return;n.fcmOptions={};const t=((i=e.fcmOptions)==null?void 0:i.link)??((o=e.notification)==null?void 0:o.click_action);t&&(n.fcmOptions.link=t);const s=(c=e.fcmOptions)==null?void 0:c.analytics_label;s&&(n.fcmOptions.analyticsLabel=s)}/**
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
 */function zA(n){return typeof n=="object"&&!!n&&cg in n}/**
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
 */function KA(n){if(!n||!n.options)throw wc("App Configuration Object");if(!n.name)throw wc("App Name");const e=["projectId","apiKey","appId","messagingSenderId"],{options:t}=n;for(const s of e)if(!t[s])throw wc(s);return{appName:n.name,projectId:t.projectId,apiKey:t.apiKey,appId:t.appId,senderId:t.messagingSenderId}}function wc(n){return $e.create("missing-app-config-values",{valueName:n})}/**
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
 */class QA{constructor(e,t,s){this.deliveryMetricsExportedToBigQueryEnabled=!1,this.onBackgroundMessageHandler=null,this.onMessageHandler=null,this.logEvents=[],this.isLogServiceStarted=!1;const r=KA(e);this.firebaseDependencies={app:e,appConfig:r,installations:t,analyticsProvider:s}}_delete(){return Promise.resolve()}}/**
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
 */async function YA(n){try{n.swRegistration=await navigator.serviceWorker.register(IA,{scope:vA}),n.swRegistration.update().catch(()=>{}),await JA(n.swRegistration)}catch(e){throw $e.create("failed-service-worker-registration",{browserErrorMessage:e==null?void 0:e.message})}}async function JA(n){return new Promise((e,t)=>{const s=setTimeout(()=>t(new Error(`Service worker not registered after ${Zd} ms`)),Zd),r=n.installing||n.waiting;n.active?(clearTimeout(s),e()):r?r.onstatechange=i=>{var o;((o=i.target)==null?void 0:o.state)==="activated"&&(r.onstatechange=null,clearTimeout(s),e())}:(clearTimeout(s),t(new Error("No incoming service worker found.")))})}/**
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
 */async function XA(n,e){if(!e&&!n.swRegistration&&await YA(n),!(!e&&n.swRegistration)){if(!(e instanceof ServiceWorkerRegistration))throw $e.create("invalid-sw-registration");n.swRegistration=e}}/**
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
 */async function ZA(n,e){e?n.vapidKey=e:n.vapidKey||(n.vapidKey=ag)}/**
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
 */async function dg(n,e){if(!navigator)throw $e.create("only-available-in-window");if(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission!=="granted")throw $e.create("permission-blocked");return await ZA(n,e==null?void 0:e.vapidKey),await XA(n,e==null?void 0:e.serviceWorkerRegistration),BA(n)}/**
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
 */async function eR(n,e,t){const s=tR(e);(await n.firebaseDependencies.analyticsProvider.get()).logEvent(s,{message_id:t[cg],message_name:t[RA],message_time:t[CA],message_device_time:Math.floor(Date.now()/1e3)})}function tR(n){switch(n){case Qr.NOTIFICATION_CLICKED:return"notification_open";case Qr.PUSH_RECEIVED:return"notification_foreground";default:throw new Error}}/**
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
 */async function nR(n,e){const t=e.data;if(!t.isFirebaseMessaging)return;n.onMessageHandler&&t.messageType===Qr.PUSH_RECEIVED&&(typeof n.onMessageHandler=="function"?n.onMessageHandler(sf(t)):n.onMessageHandler.next(sf(t)));const s=t.data;zA(s)&&s[SA]==="1"&&await eR(n,t.messageType,s)}const rf="@firebase/messaging",of="0.12.26";/**
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
 */const sR=n=>{const e=new QA(n.getProvider("app").getImmediate(),n.getProvider("installations-internal").getImmediate(),n.getProvider("analytics-internal"));return navigator.serviceWorker.addEventListener("message",t=>nR(e,t)),e},rR=n=>{const e=n.getProvider("messaging").getImmediate();return{getToken:s=>dg(e,s)}};function iR(){ct(new tt("messaging",sR,"PUBLIC")),ct(new tt("messaging-internal",rR,"PRIVATE")),Ve(rf,of),Ve(rf,of,"esm2020")}/**
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
 */async function oR(){try{await om()}catch{return!1}return typeof window<"u"&&im()&&hT()&&"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window&&"fetch"in window&&ServiceWorkerRegistration.prototype.hasOwnProperty("showNotification")&&PushSubscription.prototype.hasOwnProperty("getKey")}/**
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
 */function aR(n,e){if(!navigator)throw $e.create("only-available-in-window");return n.onMessageHandler=e,()=>{n.onMessageHandler=null}}/**
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
 */function VD(n=zs()){return oR().then(e=>{if(!e)throw $e.create("unsupported-browser")},e=>{throw $e.create("indexed-db-unsupported")}),Jt(W(n),"messaging").getImmediate()}async function MD(n,e){return n=W(n),dg(n,e)}function xD(n,e){return n=W(n),aR(n,e)}iR();var af=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pn,fg;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,_){function E(){}E.prototype=_.prototype,I.F=_.prototype,I.prototype=new E,I.prototype.constructor=I,I.D=function(v,w,R){for(var y=Array(arguments.length-2),Qe=2;Qe<arguments.length;Qe++)y[Qe-2]=arguments[Qe];return _.prototype[w].apply(v,y)}}function t(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(s,t),s.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(I,_,E){E||(E=0);const v=Array(16);if(typeof _=="string")for(var w=0;w<16;++w)v[w]=_.charCodeAt(E++)|_.charCodeAt(E++)<<8|_.charCodeAt(E++)<<16|_.charCodeAt(E++)<<24;else for(w=0;w<16;++w)v[w]=_[E++]|_[E++]<<8|_[E++]<<16|_[E++]<<24;_=I.g[0],E=I.g[1],w=I.g[2];let R=I.g[3],y;y=_+(R^E&(w^R))+v[0]+3614090360&4294967295,_=E+(y<<7&4294967295|y>>>25),y=R+(w^_&(E^w))+v[1]+3905402710&4294967295,R=_+(y<<12&4294967295|y>>>20),y=w+(E^R&(_^E))+v[2]+606105819&4294967295,w=R+(y<<17&4294967295|y>>>15),y=E+(_^w&(R^_))+v[3]+3250441966&4294967295,E=w+(y<<22&4294967295|y>>>10),y=_+(R^E&(w^R))+v[4]+4118548399&4294967295,_=E+(y<<7&4294967295|y>>>25),y=R+(w^_&(E^w))+v[5]+1200080426&4294967295,R=_+(y<<12&4294967295|y>>>20),y=w+(E^R&(_^E))+v[6]+2821735955&4294967295,w=R+(y<<17&4294967295|y>>>15),y=E+(_^w&(R^_))+v[7]+4249261313&4294967295,E=w+(y<<22&4294967295|y>>>10),y=_+(R^E&(w^R))+v[8]+1770035416&4294967295,_=E+(y<<7&4294967295|y>>>25),y=R+(w^_&(E^w))+v[9]+2336552879&4294967295,R=_+(y<<12&4294967295|y>>>20),y=w+(E^R&(_^E))+v[10]+4294925233&4294967295,w=R+(y<<17&4294967295|y>>>15),y=E+(_^w&(R^_))+v[11]+2304563134&4294967295,E=w+(y<<22&4294967295|y>>>10),y=_+(R^E&(w^R))+v[12]+1804603682&4294967295,_=E+(y<<7&4294967295|y>>>25),y=R+(w^_&(E^w))+v[13]+4254626195&4294967295,R=_+(y<<12&4294967295|y>>>20),y=w+(E^R&(_^E))+v[14]+2792965006&4294967295,w=R+(y<<17&4294967295|y>>>15),y=E+(_^w&(R^_))+v[15]+1236535329&4294967295,E=w+(y<<22&4294967295|y>>>10),y=_+(w^R&(E^w))+v[1]+4129170786&4294967295,_=E+(y<<5&4294967295|y>>>27),y=R+(E^w&(_^E))+v[6]+3225465664&4294967295,R=_+(y<<9&4294967295|y>>>23),y=w+(_^E&(R^_))+v[11]+643717713&4294967295,w=R+(y<<14&4294967295|y>>>18),y=E+(R^_&(w^R))+v[0]+3921069994&4294967295,E=w+(y<<20&4294967295|y>>>12),y=_+(w^R&(E^w))+v[5]+3593408605&4294967295,_=E+(y<<5&4294967295|y>>>27),y=R+(E^w&(_^E))+v[10]+38016083&4294967295,R=_+(y<<9&4294967295|y>>>23),y=w+(_^E&(R^_))+v[15]+3634488961&4294967295,w=R+(y<<14&4294967295|y>>>18),y=E+(R^_&(w^R))+v[4]+3889429448&4294967295,E=w+(y<<20&4294967295|y>>>12),y=_+(w^R&(E^w))+v[9]+568446438&4294967295,_=E+(y<<5&4294967295|y>>>27),y=R+(E^w&(_^E))+v[14]+3275163606&4294967295,R=_+(y<<9&4294967295|y>>>23),y=w+(_^E&(R^_))+v[3]+4107603335&4294967295,w=R+(y<<14&4294967295|y>>>18),y=E+(R^_&(w^R))+v[8]+1163531501&4294967295,E=w+(y<<20&4294967295|y>>>12),y=_+(w^R&(E^w))+v[13]+2850285829&4294967295,_=E+(y<<5&4294967295|y>>>27),y=R+(E^w&(_^E))+v[2]+4243563512&4294967295,R=_+(y<<9&4294967295|y>>>23),y=w+(_^E&(R^_))+v[7]+1735328473&4294967295,w=R+(y<<14&4294967295|y>>>18),y=E+(R^_&(w^R))+v[12]+2368359562&4294967295,E=w+(y<<20&4294967295|y>>>12),y=_+(E^w^R)+v[5]+4294588738&4294967295,_=E+(y<<4&4294967295|y>>>28),y=R+(_^E^w)+v[8]+2272392833&4294967295,R=_+(y<<11&4294967295|y>>>21),y=w+(R^_^E)+v[11]+1839030562&4294967295,w=R+(y<<16&4294967295|y>>>16),y=E+(w^R^_)+v[14]+4259657740&4294967295,E=w+(y<<23&4294967295|y>>>9),y=_+(E^w^R)+v[1]+2763975236&4294967295,_=E+(y<<4&4294967295|y>>>28),y=R+(_^E^w)+v[4]+1272893353&4294967295,R=_+(y<<11&4294967295|y>>>21),y=w+(R^_^E)+v[7]+4139469664&4294967295,w=R+(y<<16&4294967295|y>>>16),y=E+(w^R^_)+v[10]+3200236656&4294967295,E=w+(y<<23&4294967295|y>>>9),y=_+(E^w^R)+v[13]+681279174&4294967295,_=E+(y<<4&4294967295|y>>>28),y=R+(_^E^w)+v[0]+3936430074&4294967295,R=_+(y<<11&4294967295|y>>>21),y=w+(R^_^E)+v[3]+3572445317&4294967295,w=R+(y<<16&4294967295|y>>>16),y=E+(w^R^_)+v[6]+76029189&4294967295,E=w+(y<<23&4294967295|y>>>9),y=_+(E^w^R)+v[9]+3654602809&4294967295,_=E+(y<<4&4294967295|y>>>28),y=R+(_^E^w)+v[12]+3873151461&4294967295,R=_+(y<<11&4294967295|y>>>21),y=w+(R^_^E)+v[15]+530742520&4294967295,w=R+(y<<16&4294967295|y>>>16),y=E+(w^R^_)+v[2]+3299628645&4294967295,E=w+(y<<23&4294967295|y>>>9),y=_+(w^(E|~R))+v[0]+4096336452&4294967295,_=E+(y<<6&4294967295|y>>>26),y=R+(E^(_|~w))+v[7]+1126891415&4294967295,R=_+(y<<10&4294967295|y>>>22),y=w+(_^(R|~E))+v[14]+2878612391&4294967295,w=R+(y<<15&4294967295|y>>>17),y=E+(R^(w|~_))+v[5]+4237533241&4294967295,E=w+(y<<21&4294967295|y>>>11),y=_+(w^(E|~R))+v[12]+1700485571&4294967295,_=E+(y<<6&4294967295|y>>>26),y=R+(E^(_|~w))+v[3]+2399980690&4294967295,R=_+(y<<10&4294967295|y>>>22),y=w+(_^(R|~E))+v[10]+4293915773&4294967295,w=R+(y<<15&4294967295|y>>>17),y=E+(R^(w|~_))+v[1]+2240044497&4294967295,E=w+(y<<21&4294967295|y>>>11),y=_+(w^(E|~R))+v[8]+1873313359&4294967295,_=E+(y<<6&4294967295|y>>>26),y=R+(E^(_|~w))+v[15]+4264355552&4294967295,R=_+(y<<10&4294967295|y>>>22),y=w+(_^(R|~E))+v[6]+2734768916&4294967295,w=R+(y<<15&4294967295|y>>>17),y=E+(R^(w|~_))+v[13]+1309151649&4294967295,E=w+(y<<21&4294967295|y>>>11),y=_+(w^(E|~R))+v[4]+4149444226&4294967295,_=E+(y<<6&4294967295|y>>>26),y=R+(E^(_|~w))+v[11]+3174756917&4294967295,R=_+(y<<10&4294967295|y>>>22),y=w+(_^(R|~E))+v[2]+718787259&4294967295,w=R+(y<<15&4294967295|y>>>17),y=E+(R^(w|~_))+v[9]+3951481745&4294967295,I.g[0]=I.g[0]+_&4294967295,I.g[1]=I.g[1]+(w+(y<<21&4294967295|y>>>11))&4294967295,I.g[2]=I.g[2]+w&4294967295,I.g[3]=I.g[3]+R&4294967295}s.prototype.v=function(I,_){_===void 0&&(_=I.length);const E=_-this.blockSize,v=this.C;let w=this.h,R=0;for(;R<_;){if(w==0)for(;R<=E;)r(this,I,R),R+=this.blockSize;if(typeof I=="string"){for(;R<_;)if(v[w++]=I.charCodeAt(R++),w==this.blockSize){r(this,v),w=0;break}}else for(;R<_;)if(v[w++]=I[R++],w==this.blockSize){r(this,v),w=0;break}}this.h=w,this.o+=_},s.prototype.A=function(){var I=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);I[0]=128;for(var _=1;_<I.length-8;++_)I[_]=0;_=this.o*8;for(var E=I.length-8;E<I.length;++E)I[E]=_&255,_/=256;for(this.v(I),I=Array(16),_=0,E=0;E<4;++E)for(let v=0;v<32;v+=8)I[_++]=this.g[E]>>>v&255;return I};function i(I,_){var E=c;return Object.prototype.hasOwnProperty.call(E,I)?E[I]:E[I]=_(I)}function o(I,_){this.h=_;const E=[];let v=!0;for(let w=I.length-1;w>=0;w--){const R=I[w]|0;v&&R==_||(E[w]=R,v=!1)}this.g=E}var c={};function l(I){return-128<=I&&I<128?i(I,function(_){return new o([_|0],_<0?-1:0)}):new o([I|0],I<0?-1:0)}function u(I){if(isNaN(I)||!isFinite(I))return p;if(I<0)return N(u(-I));const _=[];let E=1;for(let v=0;I>=E;v++)_[v]=I/E|0,E*=4294967296;return new o(_,0)}function f(I,_){if(I.length==0)throw Error("number format error: empty string");if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(I.charAt(0)=="-")return N(f(I.substring(1),_));if(I.indexOf("-")>=0)throw Error('number format error: interior "-" character');const E=u(Math.pow(_,8));let v=p;for(let R=0;R<I.length;R+=8){var w=Math.min(8,I.length-R);const y=parseInt(I.substring(R,R+w),_);w<8?(w=u(Math.pow(_,w)),v=v.j(w).add(u(y))):(v=v.j(E),v=v.add(u(y)))}return v}var p=l(0),m=l(1),T=l(16777216);n=o.prototype,n.m=function(){if(k(this))return-N(this).m();let I=0,_=1;for(let E=0;E<this.g.length;E++){const v=this.i(E);I+=(v>=0?v:4294967296+v)*_,_*=4294967296}return I},n.toString=function(I){if(I=I||10,I<2||36<I)throw Error("radix out of range: "+I);if(S(this))return"0";if(k(this))return"-"+N(this).toString(I);const _=u(Math.pow(I,6));var E=this;let v="";for(;;){const w=ne(E,_).g;E=$(E,w.j(_));let R=((E.g.length>0?E.g[0]:E.h)>>>0).toString(I);if(E=w,S(E))return R+v;for(;R.length<6;)R="0"+R;v=R+v}},n.i=function(I){return I<0?0:I<this.g.length?this.g[I]:this.h};function S(I){if(I.h!=0)return!1;for(let _=0;_<I.g.length;_++)if(I.g[_]!=0)return!1;return!0}function k(I){return I.h==-1}n.l=function(I){return I=$(this,I),k(I)?-1:S(I)?0:1};function N(I){const _=I.g.length,E=[];for(let v=0;v<_;v++)E[v]=~I.g[v];return new o(E,~I.h).add(m)}n.abs=function(){return k(this)?N(this):this},n.add=function(I){const _=Math.max(this.g.length,I.g.length),E=[];let v=0;for(let w=0;w<=_;w++){let R=v+(this.i(w)&65535)+(I.i(w)&65535),y=(R>>>16)+(this.i(w)>>>16)+(I.i(w)>>>16);v=y>>>16,R&=65535,y&=65535,E[w]=y<<16|R}return new o(E,E[E.length-1]&-2147483648?-1:0)};function $(I,_){return I.add(N(_))}n.j=function(I){if(S(this)||S(I))return p;if(k(this))return k(I)?N(this).j(N(I)):N(N(this).j(I));if(k(I))return N(this.j(N(I)));if(this.l(T)<0&&I.l(T)<0)return u(this.m()*I.m());const _=this.g.length+I.g.length,E=[];for(var v=0;v<2*_;v++)E[v]=0;for(v=0;v<this.g.length;v++)for(let w=0;w<I.g.length;w++){const R=this.i(v)>>>16,y=this.i(v)&65535,Qe=I.i(w)>>>16,On=I.i(w)&65535;E[2*v+2*w]+=y*On,j(E,2*v+2*w),E[2*v+2*w+1]+=R*On,j(E,2*v+2*w+1),E[2*v+2*w+1]+=y*Qe,j(E,2*v+2*w+1),E[2*v+2*w+2]+=R*Qe,j(E,2*v+2*w+2)}for(I=0;I<_;I++)E[I]=E[2*I+1]<<16|E[2*I];for(I=_;I<2*_;I++)E[I]=0;return new o(E,0)};function j(I,_){for(;(I[_]&65535)!=I[_];)I[_+1]+=I[_]>>>16,I[_]&=65535,_++}function Q(I,_){this.g=I,this.h=_}function ne(I,_){if(S(_))throw Error("division by zero");if(S(I))return new Q(p,p);if(k(I))return _=ne(N(I),_),new Q(N(_.g),N(_.h));if(k(_))return _=ne(I,N(_)),new Q(N(_.g),_.h);if(I.g.length>30){if(k(I)||k(_))throw Error("slowDivide_ only works with positive integers.");for(var E=m,v=_;v.l(I)<=0;)E=me(E),v=me(v);var w=Ee(E,1),R=Ee(v,1);for(v=Ee(v,2),E=Ee(E,2);!S(v);){var y=R.add(v);y.l(I)<=0&&(w=w.add(E),R=y),v=Ee(v,1),E=Ee(E,1)}return _=$(I,w.j(_)),new Q(w,_)}for(w=p;I.l(_)>=0;){for(E=Math.max(1,Math.floor(I.m()/_.m())),v=Math.ceil(Math.log(E)/Math.LN2),v=v<=48?1:Math.pow(2,v-48),R=u(E),y=R.j(_);k(y)||y.l(I)>0;)E-=v,R=u(E),y=R.j(_);S(R)&&(R=m),w=w.add(R),I=$(I,y)}return new Q(w,I)}n.B=function(I){return ne(this,I).h},n.and=function(I){const _=Math.max(this.g.length,I.g.length),E=[];for(let v=0;v<_;v++)E[v]=this.i(v)&I.i(v);return new o(E,this.h&I.h)},n.or=function(I){const _=Math.max(this.g.length,I.g.length),E=[];for(let v=0;v<_;v++)E[v]=this.i(v)|I.i(v);return new o(E,this.h|I.h)},n.xor=function(I){const _=Math.max(this.g.length,I.g.length),E=[];for(let v=0;v<_;v++)E[v]=this.i(v)^I.i(v);return new o(E,this.h^I.h)};function me(I){const _=I.g.length+1,E=[];for(let v=0;v<_;v++)E[v]=I.i(v)<<1|I.i(v-1)>>>31;return new o(E,I.h)}function Ee(I,_){const E=_>>5;_%=32;const v=I.g.length-E,w=[];for(let R=0;R<v;R++)w[R]=_>0?I.i(R+E)>>>_|I.i(R+E+1)<<32-_:I.i(R+E);return new o(w,I.h)}s.prototype.digest=s.prototype.A,s.prototype.reset=s.prototype.u,s.prototype.update=s.prototype.v,fg=s,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.B,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=f,pn=o}).apply(typeof af<"u"?af:typeof self<"u"?self:typeof window<"u"?window:{});var Yi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pg,Pr,mg,lo,Wc,gg,_g,yg;(function(){var n,e=Object.defineProperty;function t(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Yi=="object"&&Yi];for(var h=0;h<a.length;++h){var d=a[h];if(d&&d.Math==Math)return d}throw Error("Cannot find global object")}var s=t(this);function r(a,h){if(h)e:{var d=s;a=a.split(".");for(var g=0;g<a.length-1;g++){var A=a[g];if(!(A in d))break e;d=d[A]}a=a[a.length-1],g=d[a],h=h(g),h!=g&&h!=null&&e(d,a,{configurable:!0,writable:!0,value:h})}}r("Symbol.dispose",function(a){return a||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(a){return a||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(a){return a||function(h){var d=[],g;for(g in h)Object.prototype.hasOwnProperty.call(h,g)&&d.push([g,h[g]]);return d}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var i=i||{},o=this||self;function c(a){var h=typeof a;return h=="object"&&a!=null||h=="function"}function l(a,h,d){return a.call.apply(a.bind,arguments)}function u(a,h,d){return u=l,u.apply(null,arguments)}function f(a,h){var d=Array.prototype.slice.call(arguments,1);return function(){var g=d.slice();return g.push.apply(g,arguments),a.apply(this,g)}}function p(a,h){function d(){}d.prototype=h.prototype,a.Z=h.prototype,a.prototype=new d,a.prototype.constructor=a,a.Ob=function(g,A,C){for(var V=Array(arguments.length-2),H=2;H<arguments.length;H++)V[H-2]=arguments[H];return h.prototype[A].apply(g,V)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?a=>a&&AsyncContext.Snapshot.wrap(a):a=>a;function T(a){const h=a.length;if(h>0){const d=Array(h);for(let g=0;g<h;g++)d[g]=a[g];return d}return[]}function S(a,h){for(let g=1;g<arguments.length;g++){const A=arguments[g];var d=typeof A;if(d=d!="object"?d:A?Array.isArray(A)?"array":d:"null",d=="array"||d=="object"&&typeof A.length=="number"){d=a.length||0;const C=A.length||0;a.length=d+C;for(let V=0;V<C;V++)a[d+V]=A[V]}else a.push(A)}}class k{constructor(h,d){this.i=h,this.j=d,this.h=0,this.g=null}get(){let h;return this.h>0?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function N(a){o.setTimeout(()=>{throw a},0)}function $(){var a=I;let h=null;return a.g&&(h=a.g,a.g=a.g.next,a.g||(a.h=null),h.next=null),h}class j{constructor(){this.h=this.g=null}add(h,d){const g=Q.get();g.set(h,d),this.h?this.h.next=g:this.g=g,this.h=g}}var Q=new k(()=>new ne,a=>a.reset());class ne{constructor(){this.next=this.g=this.h=null}set(h,d){this.h=h,this.g=d,this.next=null}reset(){this.next=this.g=this.h=null}}let me,Ee=!1,I=new j,_=()=>{const a=Promise.resolve(void 0);me=()=>{a.then(E)}};function E(){for(var a;a=$();){try{a.h.call(a.g)}catch(d){N(d)}var h=Q;h.j(a),h.h<100&&(h.h++,a.next=h.g,h.g=a)}Ee=!1}function v(){this.u=this.u,this.C=this.C}v.prototype.u=!1,v.prototype.dispose=function(){this.u||(this.u=!0,this.N())},v.prototype[Symbol.dispose]=function(){this.dispose()},v.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(a,h){this.type=a,this.g=this.target=h,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var R=(function(){if(!o.addEventListener||!Object.defineProperty)return!1;var a=!1,h=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const d=()=>{};o.addEventListener("test",d,h),o.removeEventListener("test",d,h)}catch{}return a})();function y(a){return/^[\s\xa0]*$/.test(a)}function Qe(a,h){w.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a&&this.init(a,h)}p(Qe,w),Qe.prototype.init=function(a,h){const d=this.type=a.type,g=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement,this.g=h,h=a.relatedTarget,h||(d=="mouseover"?h=a.fromElement:d=="mouseout"&&(h=a.toElement)),this.relatedTarget=h,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=a.pointerType,this.state=a.state,this.i=a,a.defaultPrevented&&Qe.Z.h.call(this)},Qe.prototype.h=function(){Qe.Z.h.call(this);const a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var On="closure_listenable_"+(Math.random()*1e6|0),yE=0;function EE(a,h,d,g,A){this.listener=a,this.proxy=null,this.src=h,this.type=d,this.capture=!!g,this.ha=A,this.key=++yE,this.da=this.fa=!1}function Oi(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function Vi(a,h,d){for(const g in a)h.call(d,a[g],g,a)}function TE(a,h){for(const d in a)h.call(void 0,a[d],d,a)}function Ah(a){const h={};for(const d in a)h[d]=a[d];return h}const Rh="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Ch(a,h){let d,g;for(let A=1;A<arguments.length;A++){g=arguments[A];for(d in g)a[d]=g[d];for(let C=0;C<Rh.length;C++)d=Rh[C],Object.prototype.hasOwnProperty.call(g,d)&&(a[d]=g[d])}}function Mi(a){this.src=a,this.g={},this.h=0}Mi.prototype.add=function(a,h,d,g,A){const C=a.toString();a=this.g[C],a||(a=this.g[C]=[],this.h++);const V=$a(a,h,g,A);return V>-1?(h=a[V],d||(h.fa=!1)):(h=new EE(h,this.src,C,!!g,A),h.fa=d,a.push(h)),h};function qa(a,h){const d=h.type;if(d in a.g){var g=a.g[d],A=Array.prototype.indexOf.call(g,h,void 0),C;(C=A>=0)&&Array.prototype.splice.call(g,A,1),C&&(Oi(h),a.g[d].length==0&&(delete a.g[d],a.h--))}}function $a(a,h,d,g){for(let A=0;A<a.length;++A){const C=a[A];if(!C.da&&C.listener==h&&C.capture==!!d&&C.ha==g)return A}return-1}var Wa="closure_lm_"+(Math.random()*1e6|0),ja={};function Sh(a,h,d,g,A){if(Array.isArray(h)){for(let C=0;C<h.length;C++)Sh(a,h[C],d,g,A);return null}return d=kh(d),a&&a[On]?a.J(h,d,c(g)?!!g.capture:!1,A):wE(a,h,d,!1,g,A)}function wE(a,h,d,g,A,C){if(!h)throw Error("Invalid event type");const V=c(A)?!!A.capture:!!A;let H=Ga(a);if(H||(a[Wa]=H=new Mi(a)),d=H.add(h,d,g,V,C),d.proxy)return d;if(g=IE(),d.proxy=g,g.src=a,g.listener=d,a.addEventListener)R||(A=V),A===void 0&&(A=!1),a.addEventListener(h.toString(),g,A);else if(a.attachEvent)a.attachEvent(Ph(h.toString()),g);else if(a.addListener&&a.removeListener)a.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return d}function IE(){function a(d){return h.call(a.src,a.listener,d)}const h=vE;return a}function bh(a,h,d,g,A){if(Array.isArray(h))for(var C=0;C<h.length;C++)bh(a,h[C],d,g,A);else g=c(g)?!!g.capture:!!g,d=kh(d),a&&a[On]?(a=a.i,C=String(h).toString(),C in a.g&&(h=a.g[C],d=$a(h,d,g,A),d>-1&&(Oi(h[d]),Array.prototype.splice.call(h,d,1),h.length==0&&(delete a.g[C],a.h--)))):a&&(a=Ga(a))&&(h=a.g[h.toString()],a=-1,h&&(a=$a(h,d,g,A)),(d=a>-1?h[a]:null)&&Ha(d))}function Ha(a){if(typeof a!="number"&&a&&!a.da){var h=a.src;if(h&&h[On])qa(h.i,a);else{var d=a.type,g=a.proxy;h.removeEventListener?h.removeEventListener(d,g,a.capture):h.detachEvent?h.detachEvent(Ph(d),g):h.addListener&&h.removeListener&&h.removeListener(g),(d=Ga(h))?(qa(d,a),d.h==0&&(d.src=null,h[Wa]=null)):Oi(a)}}}function Ph(a){return a in ja?ja[a]:ja[a]="on"+a}function vE(a,h){if(a.da)a=!0;else{h=new Qe(h,this);const d=a.listener,g=a.ha||a.src;a.fa&&Ha(a),a=d.call(g,h)}return a}function Ga(a){return a=a[Wa],a instanceof Mi?a:null}var za="__closure_events_fn_"+(Math.random()*1e9>>>0);function kh(a){return typeof a=="function"?a:(a[za]||(a[za]=function(h){return a.handleEvent(h)}),a[za])}function Fe(){v.call(this),this.i=new Mi(this),this.M=this,this.G=null}p(Fe,v),Fe.prototype[On]=!0,Fe.prototype.removeEventListener=function(a,h,d,g){bh(this,a,h,d,g)};function He(a,h){var d,g=a.G;if(g)for(d=[];g;g=g.G)d.push(g);if(a=a.M,g=h.type||h,typeof h=="string")h=new w(h,a);else if(h instanceof w)h.target=h.target||a;else{var A=h;h=new w(g,a),Ch(h,A)}A=!0;let C,V;if(d)for(V=d.length-1;V>=0;V--)C=h.g=d[V],A=xi(C,g,!0,h)&&A;if(C=h.g=a,A=xi(C,g,!0,h)&&A,A=xi(C,g,!1,h)&&A,d)for(V=0;V<d.length;V++)C=h.g=d[V],A=xi(C,g,!1,h)&&A}Fe.prototype.N=function(){if(Fe.Z.N.call(this),this.i){var a=this.i;for(const h in a.g){const d=a.g[h];for(let g=0;g<d.length;g++)Oi(d[g]);delete a.g[h],a.h--}}this.G=null},Fe.prototype.J=function(a,h,d,g){return this.i.add(String(a),h,!1,d,g)},Fe.prototype.K=function(a,h,d,g){return this.i.add(String(a),h,!0,d,g)};function xi(a,h,d,g){if(h=a.i.g[String(h)],!h)return!0;h=h.concat();let A=!0;for(let C=0;C<h.length;++C){const V=h[C];if(V&&!V.da&&V.capture==d){const H=V.listener,Re=V.ha||V.src;V.fa&&qa(a.i,V),A=H.call(Re,g)!==!1&&A}}return A&&!g.defaultPrevented}function AE(a,h){if(typeof a!="function")if(a&&typeof a.handleEvent=="function")a=u(a.handleEvent,a);else throw Error("Invalid listener argument");return Number(h)>2147483647?-1:o.setTimeout(a,h||0)}function Nh(a){a.g=AE(()=>{a.g=null,a.i&&(a.i=!1,Nh(a))},a.l);const h=a.h;a.h=null,a.m.apply(null,h)}class RE extends v{constructor(h,d){super(),this.m=h,this.l=d,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Nh(this)}N(){super.N(),this.g&&(o.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ir(a){v.call(this),this.h=a,this.g={}}p(ir,v);var Dh=[];function Oh(a){Vi(a.g,function(h,d){this.g.hasOwnProperty(d)&&Ha(h)},a),a.g={}}ir.prototype.N=function(){ir.Z.N.call(this),Oh(this)},ir.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ka=o.JSON.stringify,CE=o.JSON.parse,SE=class{stringify(a){return o.JSON.stringify(a,void 0)}parse(a){return o.JSON.parse(a,void 0)}};function Vh(){}function Mh(){}var or={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function Qa(){w.call(this,"d")}p(Qa,w);function Ya(){w.call(this,"c")}p(Ya,w);var Vn={},xh=null;function Li(){return xh=xh||new Fe}Vn.Ia="serverreachability";function Lh(a){w.call(this,Vn.Ia,a)}p(Lh,w);function ar(a){const h=Li();He(h,new Lh(h))}Vn.STAT_EVENT="statevent";function Fh(a,h){w.call(this,Vn.STAT_EVENT,a),this.stat=h}p(Fh,w);function Ge(a){const h=Li();He(h,new Fh(h,a))}Vn.Ja="timingevent";function Uh(a,h){w.call(this,Vn.Ja,a),this.size=h}p(Uh,w);function cr(a,h){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return o.setTimeout(function(){a()},h)}function lr(){this.g=!0}lr.prototype.ua=function(){this.g=!1};function bE(a,h,d,g,A,C){a.info(function(){if(a.g)if(C){var V="",H=C.split("&");for(let ie=0;ie<H.length;ie++){var Re=H[ie].split("=");if(Re.length>1){const be=Re[0];Re=Re[1];const vt=be.split("_");V=vt.length>=2&&vt[1]=="type"?V+(be+"="+Re+"&"):V+(be+"=redacted&")}}}else V=null;else V=C;return"XMLHTTP REQ ("+g+") [attempt "+A+"]: "+h+`
`+d+`
`+V})}function PE(a,h,d,g,A,C,V){a.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+A+"]: "+h+`
`+d+`
`+C+" "+V})}function ps(a,h,d,g){a.info(function(){return"XMLHTTP TEXT ("+h+"): "+NE(a,d)+(g?" "+g:"")})}function kE(a,h){a.info(function(){return"TIMEOUT: "+h})}lr.prototype.info=function(){};function NE(a,h){if(!a.g)return h;if(!h)return null;try{const C=JSON.parse(h);if(C){for(a=0;a<C.length;a++)if(Array.isArray(C[a])){var d=C[a];if(!(d.length<2)){var g=d[1];if(Array.isArray(g)&&!(g.length<1)){var A=g[0];if(A!="noop"&&A!="stop"&&A!="close")for(let V=1;V<g.length;V++)g[V]=""}}}}return Ka(C)}catch{return h}}var Fi={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},Bh={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},qh;function Ja(){}p(Ja,Vh),Ja.prototype.g=function(){return new XMLHttpRequest},qh=new Ja;function ur(a){return encodeURIComponent(String(a))}function DE(a){var h=1;a=a.split(":");const d=[];for(;h>0&&a.length;)d.push(a.shift()),h--;return a.length&&d.push(a.join(":")),d}function Zt(a,h,d,g){this.j=a,this.i=h,this.l=d,this.S=g||1,this.V=new ir(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new $h}function $h(){this.i=null,this.g="",this.h=!1}var Wh={},Xa={};function Za(a,h,d){a.M=1,a.A=Bi(It(h)),a.u=d,a.R=!0,jh(a,null)}function jh(a,h){a.F=Date.now(),Ui(a),a.B=It(a.A);var d=a.B,g=a.S;Array.isArray(g)||(g=[String(g)]),sd(d.i,"t",g),a.C=0,d=a.j.L,a.h=new $h,a.g=wd(a.j,d?h:null,!a.u),a.P>0&&(a.O=new RE(u(a.Y,a,a.g),a.P)),h=a.V,d=a.g,g=a.ba;var A="readystatechange";Array.isArray(A)||(A&&(Dh[0]=A.toString()),A=Dh);for(let C=0;C<A.length;C++){const V=Sh(d,A[C],g||h.handleEvent,!1,h.h||h);if(!V)break;h.g[V.key]=V}h=a.J?Ah(a.J):{},a.u?(a.v||(a.v="POST"),h["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.B,a.v,a.u,h)):(a.v="GET",a.g.ea(a.B,a.v,null,h)),ar(),bE(a.i,a.v,a.B,a.l,a.S,a.u)}Zt.prototype.ba=function(a){a=a.target;const h=this.O;h&&nn(a)==3?h.j():this.Y(a)},Zt.prototype.Y=function(a){try{if(a==this.g)e:{const H=nn(this.g),Re=this.g.ya(),ie=this.g.ca();if(!(H<3)&&(H!=3||this.g&&(this.h.h||this.g.la()||ud(this.g)))){this.K||H!=4||Re==7||(Re==8||ie<=0?ar(3):ar(2)),ec(this);var h=this.g.ca();this.X=h;var d=OE(this);if(this.o=h==200,PE(this.i,this.v,this.B,this.l,this.S,H,h),this.o){if(this.U&&!this.L){t:{if(this.g){var g,A=this.g;if((g=A.g?A.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!y(g)){var C=g;break t}}C=null}if(a=C)ps(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,tc(this,a);else{this.o=!1,this.m=3,Ge(12),Mn(this),hr(this);break e}}if(this.R){a=!0;let be;for(;!this.K&&this.C<d.length;)if(be=VE(this,d),be==Xa){H==4&&(this.m=4,Ge(14),a=!1),ps(this.i,this.l,null,"[Incomplete Response]");break}else if(be==Wh){this.m=4,Ge(15),ps(this.i,this.l,d,"[Invalid Chunk]"),a=!1;break}else ps(this.i,this.l,be,null),tc(this,be);if(Hh(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),H!=4||d.length!=0||this.h.h||(this.m=1,Ge(16),a=!1),this.o=this.o&&a,!a)ps(this.i,this.l,d,"[Invalid Chunked Response]"),Mn(this),hr(this);else if(d.length>0&&!this.W){this.W=!0;var V=this.j;V.g==this&&V.aa&&!V.P&&(V.j.info("Great, no buffering proxy detected. Bytes received: "+d.length),lc(V),V.P=!0,Ge(11))}}else ps(this.i,this.l,d,null),tc(this,d);H==4&&Mn(this),this.o&&!this.K&&(H==4?_d(this.j,this):(this.o=!1,Ui(this)))}else KE(this.g),h==400&&d.indexOf("Unknown SID")>0?(this.m=3,Ge(12)):(this.m=0,Ge(13)),Mn(this),hr(this)}}}catch{}finally{}};function OE(a){if(!Hh(a))return a.g.la();const h=ud(a.g);if(h==="")return"";let d="";const g=h.length,A=nn(a.g)==4;if(!a.h.i){if(typeof TextDecoder>"u")return Mn(a),hr(a),"";a.h.i=new o.TextDecoder}for(let C=0;C<g;C++)a.h.h=!0,d+=a.h.i.decode(h[C],{stream:!(A&&C==g-1)});return h.length=0,a.h.g+=d,a.C=0,a.h.g}function Hh(a){return a.g?a.v=="GET"&&a.M!=2&&a.j.Aa:!1}function VE(a,h){var d=a.C,g=h.indexOf(`
`,d);return g==-1?Xa:(d=Number(h.substring(d,g)),isNaN(d)?Wh:(g+=1,g+d>h.length?Xa:(h=h.slice(g,g+d),a.C=g+d,h)))}Zt.prototype.cancel=function(){this.K=!0,Mn(this)};function Ui(a){a.T=Date.now()+a.H,Gh(a,a.H)}function Gh(a,h){if(a.D!=null)throw Error("WatchDog timer not null");a.D=cr(u(a.aa,a),h)}function ec(a){a.D&&(o.clearTimeout(a.D),a.D=null)}Zt.prototype.aa=function(){this.D=null;const a=Date.now();a-this.T>=0?(kE(this.i,this.B),this.M!=2&&(ar(),Ge(17)),Mn(this),this.m=2,hr(this)):Gh(this,this.T-a)};function hr(a){a.j.I==0||a.K||_d(a.j,a)}function Mn(a){ec(a);var h=a.O;h&&typeof h.dispose=="function"&&h.dispose(),a.O=null,Oh(a.V),a.g&&(h=a.g,a.g=null,h.abort(),h.dispose())}function tc(a,h){try{var d=a.j;if(d.I!=0&&(d.g==a||nc(d.h,a))){if(!a.L&&nc(d.h,a)&&d.I==3){try{var g=d.Ba.g.parse(h)}catch{g=null}if(Array.isArray(g)&&g.length==3){var A=g;if(A[0]==0){e:if(!d.v){if(d.g)if(d.g.F+3e3<a.F)Hi(d),Wi(d);else break e;cc(d),Ge(18)}}else d.xa=A[1],0<d.xa-d.K&&A[2]<37500&&d.F&&d.A==0&&!d.C&&(d.C=cr(u(d.Va,d),6e3));Qh(d.h)<=1&&d.ta&&(d.ta=void 0)}else Ln(d,11)}else if((a.L||d.g==a)&&Hi(d),!y(h))for(A=d.Ba.g.parse(h),h=0;h<A.length;h++){let ie=A[h];const be=ie[0];if(!(be<=d.K))if(d.K=be,ie=ie[1],d.I==2)if(ie[0]=="c"){d.M=ie[1],d.ba=ie[2];const vt=ie[3];vt!=null&&(d.ka=vt,d.j.info("VER="+d.ka));const Fn=ie[4];Fn!=null&&(d.za=Fn,d.j.info("SVER="+d.za));const sn=ie[5];sn!=null&&typeof sn=="number"&&sn>0&&(g=1.5*sn,d.O=g,d.j.info("backChannelRequestTimeoutMs_="+g)),g=d;const rn=a.g;if(rn){const zi=rn.g?rn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(zi){var C=g.h;C.g||zi.indexOf("spdy")==-1&&zi.indexOf("quic")==-1&&zi.indexOf("h2")==-1||(C.j=C.l,C.g=new Set,C.h&&(sc(C,C.h),C.h=null))}if(g.G){const uc=rn.g?rn.g.getResponseHeader("X-HTTP-Session-Id"):null;uc&&(g.wa=uc,ae(g.J,g.G,uc))}}d.I=3,d.l&&d.l.ra(),d.aa&&(d.T=Date.now()-a.F,d.j.info("Handshake RTT: "+d.T+"ms")),g=d;var V=a;if(g.na=Td(g,g.L?g.ba:null,g.W),V.L){Yh(g.h,V);var H=V,Re=g.O;Re&&(H.H=Re),H.D&&(ec(H),Ui(H)),g.g=V}else md(g);d.i.length>0&&ji(d)}else ie[0]!="stop"&&ie[0]!="close"||Ln(d,7);else d.I==3&&(ie[0]=="stop"||ie[0]=="close"?ie[0]=="stop"?Ln(d,7):ac(d):ie[0]!="noop"&&d.l&&d.l.qa(ie),d.A=0)}}ar(4)}catch{}}var ME=class{constructor(a,h){this.g=a,this.map=h}};function zh(a){this.l=a||10,o.PerformanceNavigationTiming?(a=o.performance.getEntriesByType("navigation"),a=a.length>0&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(o.chrome&&o.chrome.loadTimes&&o.chrome.loadTimes()&&o.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Kh(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Qh(a){return a.h?1:a.g?a.g.size:0}function nc(a,h){return a.h?a.h==h:a.g?a.g.has(h):!1}function sc(a,h){a.g?a.g.add(h):a.h=h}function Yh(a,h){a.h&&a.h==h?a.h=null:a.g&&a.g.has(h)&&a.g.delete(h)}zh.prototype.cancel=function(){if(this.i=Jh(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function Jh(a){if(a.h!=null)return a.i.concat(a.h.G);if(a.g!=null&&a.g.size!==0){let h=a.i;for(const d of a.g.values())h=h.concat(d.G);return h}return T(a.i)}var Xh=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function xE(a,h){if(a){a=a.split("&");for(let d=0;d<a.length;d++){const g=a[d].indexOf("=");let A,C=null;g>=0?(A=a[d].substring(0,g),C=a[d].substring(g+1)):A=a[d],h(A,C?decodeURIComponent(C.replace(/\+/g," ")):"")}}}function en(a){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let h;a instanceof en?(this.l=a.l,dr(this,a.j),this.o=a.o,this.g=a.g,fr(this,a.u),this.h=a.h,rc(this,rd(a.i)),this.m=a.m):a&&(h=String(a).match(Xh))?(this.l=!1,dr(this,h[1]||"",!0),this.o=pr(h[2]||""),this.g=pr(h[3]||"",!0),fr(this,h[4]),this.h=pr(h[5]||"",!0),rc(this,h[6]||"",!0),this.m=pr(h[7]||"")):(this.l=!1,this.i=new gr(null,this.l))}en.prototype.toString=function(){const a=[];var h=this.j;h&&a.push(mr(h,Zh,!0),":");var d=this.g;return(d||h=="file")&&(a.push("//"),(h=this.o)&&a.push(mr(h,Zh,!0),"@"),a.push(ur(d).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),d=this.u,d!=null&&a.push(":",String(d))),(d=this.h)&&(this.g&&d.charAt(0)!="/"&&a.push("/"),a.push(mr(d,d.charAt(0)=="/"?UE:FE,!0))),(d=this.i.toString())&&a.push("?",d),(d=this.m)&&a.push("#",mr(d,qE)),a.join("")},en.prototype.resolve=function(a){const h=It(this);let d=!!a.j;d?dr(h,a.j):d=!!a.o,d?h.o=a.o:d=!!a.g,d?h.g=a.g:d=a.u!=null;var g=a.h;if(d)fr(h,a.u);else if(d=!!a.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var A=h.h.lastIndexOf("/");A!=-1&&(g=h.h.slice(0,A+1)+g)}if(A=g,A==".."||A==".")g="";else if(A.indexOf("./")!=-1||A.indexOf("/.")!=-1){g=A.lastIndexOf("/",0)==0,A=A.split("/");const C=[];for(let V=0;V<A.length;){const H=A[V++];H=="."?g&&V==A.length&&C.push(""):H==".."?((C.length>1||C.length==1&&C[0]!="")&&C.pop(),g&&V==A.length&&C.push("")):(C.push(H),g=!0)}g=C.join("/")}else g=A}return d?h.h=g:d=a.i.toString()!=="",d?rc(h,rd(a.i)):d=!!a.m,d&&(h.m=a.m),h};function It(a){return new en(a)}function dr(a,h,d){a.j=d?pr(h,!0):h,a.j&&(a.j=a.j.replace(/:$/,""))}function fr(a,h){if(h){if(h=Number(h),isNaN(h)||h<0)throw Error("Bad port number "+h);a.u=h}else a.u=null}function rc(a,h,d){h instanceof gr?(a.i=h,$E(a.i,a.l)):(d||(h=mr(h,BE)),a.i=new gr(h,a.l))}function ae(a,h,d){a.i.set(h,d)}function Bi(a){return ae(a,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),a}function pr(a,h){return a?h?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function mr(a,h,d){return typeof a=="string"?(a=encodeURI(a).replace(h,LE),d&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function LE(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Zh=/[#\/\?@]/g,FE=/[#\?:]/g,UE=/[#\?]/g,BE=/[#\?@]/g,qE=/#/g;function gr(a,h){this.h=this.g=null,this.i=a||null,this.j=!!h}function xn(a){a.g||(a.g=new Map,a.h=0,a.i&&xE(a.i,function(h,d){a.add(decodeURIComponent(h.replace(/\+/g," ")),d)}))}n=gr.prototype,n.add=function(a,h){xn(this),this.i=null,a=ms(this,a);let d=this.g.get(a);return d||this.g.set(a,d=[]),d.push(h),this.h+=1,this};function ed(a,h){xn(a),h=ms(a,h),a.g.has(h)&&(a.i=null,a.h-=a.g.get(h).length,a.g.delete(h))}function td(a,h){return xn(a),h=ms(a,h),a.g.has(h)}n.forEach=function(a,h){xn(this),this.g.forEach(function(d,g){d.forEach(function(A){a.call(h,A,g,this)},this)},this)};function nd(a,h){xn(a);let d=[];if(typeof h=="string")td(a,h)&&(d=d.concat(a.g.get(ms(a,h))));else for(a=Array.from(a.g.values()),h=0;h<a.length;h++)d=d.concat(a[h]);return d}n.set=function(a,h){return xn(this),this.i=null,a=ms(this,a),td(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[h]),this.h+=1,this},n.get=function(a,h){return a?(a=nd(this,a),a.length>0?String(a[0]):h):h};function sd(a,h,d){ed(a,h),d.length>0&&(a.i=null,a.g.set(ms(a,h),T(d)),a.h+=d.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],h=Array.from(this.g.keys());for(let g=0;g<h.length;g++){var d=h[g];const A=ur(d);d=nd(this,d);for(let C=0;C<d.length;C++){let V=A;d[C]!==""&&(V+="="+ur(d[C])),a.push(V)}}return this.i=a.join("&")};function rd(a){const h=new gr;return h.i=a.i,a.g&&(h.g=new Map(a.g),h.h=a.h),h}function ms(a,h){return h=String(h),a.j&&(h=h.toLowerCase()),h}function $E(a,h){h&&!a.j&&(xn(a),a.i=null,a.g.forEach(function(d,g){const A=g.toLowerCase();g!=A&&(ed(this,g),sd(this,A,d))},a)),a.j=h}function WE(a,h){const d=new lr;if(o.Image){const g=new Image;g.onload=f(tn,d,"TestLoadImage: loaded",!0,h,g),g.onerror=f(tn,d,"TestLoadImage: error",!1,h,g),g.onabort=f(tn,d,"TestLoadImage: abort",!1,h,g),g.ontimeout=f(tn,d,"TestLoadImage: timeout",!1,h,g),o.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=a}else h(!1)}function jE(a,h){const d=new lr,g=new AbortController,A=setTimeout(()=>{g.abort(),tn(d,"TestPingServer: timeout",!1,h)},1e4);fetch(a,{signal:g.signal}).then(C=>{clearTimeout(A),C.ok?tn(d,"TestPingServer: ok",!0,h):tn(d,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(A),tn(d,"TestPingServer: error",!1,h)})}function tn(a,h,d,g,A){try{A&&(A.onload=null,A.onerror=null,A.onabort=null,A.ontimeout=null),g(d)}catch{}}function HE(){this.g=new SE}function ic(a){this.i=a.Sb||null,this.h=a.ab||!1}p(ic,Vh),ic.prototype.g=function(){return new qi(this.i,this.h)};function qi(a,h){Fe.call(this),this.H=a,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(qi,Fe),n=qi.prototype,n.open=function(a,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=a,this.D=h,this.readyState=1,yr(this)},n.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;const h={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};a&&(h.body=a),(this.H||o).fetch(new Request(this.D,h)).then(this.Pa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,_r(this)),this.readyState=0},n.Pa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,yr(this)),this.g&&(this.readyState=3,yr(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof o.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;id(this)}else a.text().then(this.Oa.bind(this),this.ga.bind(this))};function id(a){a.j.read().then(a.Ma.bind(a)).catch(a.ga.bind(a))}n.Ma=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var h=a.value?a.value:new Uint8Array(0);(h=this.B.decode(h,{stream:!a.done}))&&(this.response=this.responseText+=h)}a.done?_r(this):yr(this),this.readyState==3&&id(this)}},n.Oa=function(a){this.g&&(this.response=this.responseText=a,_r(this))},n.Na=function(a){this.g&&(this.response=a,_r(this))},n.ga=function(){this.g&&_r(this)};function _r(a){a.readyState=4,a.l=null,a.j=null,a.B=null,yr(a)}n.setRequestHeader=function(a,h){this.A.append(a,h)},n.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],h=this.h.entries();for(var d=h.next();!d.done;)d=d.value,a.push(d[0]+": "+d[1]),d=h.next();return a.join(`\r
`)};function yr(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(qi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function od(a){let h="";return Vi(a,function(d,g){h+=g,h+=":",h+=d,h+=`\r
`}),h}function oc(a,h,d){e:{for(g in d){var g=!1;break e}g=!0}g||(d=od(d),typeof a=="string"?d!=null&&ur(d):ae(a,h,d))}function de(a){Fe.call(this),this.headers=new Map,this.L=a||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(de,Fe);var GE=/^https?$/i,zE=["POST","PUT"];n=de.prototype,n.Fa=function(a){this.H=a},n.ea=function(a,h,d,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);h=h?h.toUpperCase():"GET",this.D=a,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():qh.g(),this.g.onreadystatechange=m(u(this.Ca,this));try{this.B=!0,this.g.open(h,String(a),!0),this.B=!1}catch(C){ad(this,C);return}if(a=d||"",d=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var A in g)d.set(A,g[A]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(const C of g.keys())d.set(C,g.get(C));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(d.keys()).find(C=>C.toLowerCase()=="content-type"),A=o.FormData&&a instanceof o.FormData,!(Array.prototype.indexOf.call(zE,h,void 0)>=0)||g||A||d.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[C,V]of d)this.g.setRequestHeader(C,V);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(a),this.v=!1}catch(C){ad(this,C)}};function ad(a,h){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=h,a.o=5,cd(a),$i(a)}function cd(a){a.A||(a.A=!0,He(a,"complete"),He(a,"error"))}n.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=a||7,He(this,"complete"),He(this,"abort"),$i(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),$i(this,!0)),de.Z.N.call(this)},n.Ca=function(){this.u||(this.B||this.v||this.j?ld(this):this.Xa())},n.Xa=function(){ld(this)};function ld(a){if(a.h&&typeof i<"u"){if(a.v&&nn(a)==4)setTimeout(a.Ca.bind(a),0);else if(He(a,"readystatechange"),nn(a)==4){a.h=!1;try{const C=a.ca();e:switch(C){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var d;if(!(d=h)){var g;if(g=C===0){let V=String(a.D).match(Xh)[1]||null;!V&&o.self&&o.self.location&&(V=o.self.location.protocol.slice(0,-1)),g=!GE.test(V?V.toLowerCase():"")}d=g}if(d)He(a,"complete"),He(a,"success");else{a.o=6;try{var A=nn(a)>2?a.g.statusText:""}catch{A=""}a.l=A+" ["+a.ca()+"]",cd(a)}}finally{$i(a)}}}}function $i(a,h){if(a.g){a.m&&(clearTimeout(a.m),a.m=null);const d=a.g;a.g=null,h||He(a,"ready");try{d.onreadystatechange=null}catch{}}}n.isActive=function(){return!!this.g};function nn(a){return a.g?a.g.readyState:0}n.ca=function(){try{return nn(this)>2?this.g.status:-1}catch{return-1}},n.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.La=function(a){if(this.g){var h=this.g.responseText;return a&&h.indexOf(a)==0&&(h=h.substring(a.length)),CE(h)}};function ud(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.F){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function KE(a){const h={};a=(a.g&&nn(a)>=2&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<a.length;g++){if(y(a[g]))continue;var d=DE(a[g]);const A=d[0];if(d=d[1],typeof d!="string")continue;d=d.trim();const C=h[A]||[];h[A]=C,C.push(d)}TE(h,function(g){return g.join(", ")})}n.ya=function(){return this.o},n.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Er(a,h,d){return d&&d.internalChannelParams&&d.internalChannelParams[a]||h}function hd(a){this.za=0,this.i=[],this.j=new lr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Er("failFast",!1,a),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Er("baseRetryDelayMs",5e3,a),this.Za=Er("retryDelaySeedMs",1e4,a),this.Ta=Er("forwardChannelMaxRetries",2,a),this.va=Er("forwardChannelRequestTimeoutMs",2e4,a),this.ma=a&&a.xmlHttpFactory||void 0,this.Ua=a&&a.Rb||void 0,this.Aa=a&&a.useFetchStreams||!1,this.O=void 0,this.L=a&&a.supportsCrossDomainXhr||!1,this.M="",this.h=new zh(a&&a.concurrentRequestLimit),this.Ba=new HE,this.S=a&&a.fastHandshake||!1,this.R=a&&a.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=a&&a.Pb||!1,a&&a.ua&&this.j.ua(),a&&a.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&a&&a.detectBufferingProxy||!1,this.ia=void 0,a&&a.longPollingTimeout&&a.longPollingTimeout>0&&(this.ia=a.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}n=hd.prototype,n.ka=8,n.I=1,n.connect=function(a,h,d,g){Ge(0),this.W=a,this.H=h||{},d&&g!==void 0&&(this.H.OSID=d,this.H.OAID=g),this.F=this.X,this.J=Td(this,null,this.W),ji(this)};function ac(a){if(dd(a),a.I==3){var h=a.V++,d=It(a.J);if(ae(d,"SID",a.M),ae(d,"RID",h),ae(d,"TYPE","terminate"),Tr(a,d),h=new Zt(a,a.j,h),h.M=2,h.A=Bi(It(d)),d=!1,o.navigator&&o.navigator.sendBeacon)try{d=o.navigator.sendBeacon(h.A.toString(),"")}catch{}!d&&o.Image&&(new Image().src=h.A,d=!0),d||(h.g=wd(h.j,null),h.g.ea(h.A)),h.F=Date.now(),Ui(h)}Ed(a)}function Wi(a){a.g&&(lc(a),a.g.cancel(),a.g=null)}function dd(a){Wi(a),a.v&&(o.clearTimeout(a.v),a.v=null),Hi(a),a.h.cancel(),a.m&&(typeof a.m=="number"&&o.clearTimeout(a.m),a.m=null)}function ji(a){if(!Kh(a.h)&&!a.m){a.m=!0;var h=a.Ea;me||_(),Ee||(me(),Ee=!0),I.add(h,a),a.D=0}}function QE(a,h){return Qh(a.h)>=a.h.j-(a.m?1:0)?!1:a.m?(a.i=h.G.concat(a.i),!0):a.I==1||a.I==2||a.D>=(a.Sa?0:a.Ta)?!1:(a.m=cr(u(a.Ea,a,h),yd(a,a.D)),a.D++,!0)}n.Ea=function(a){if(this.m)if(this.m=null,this.I==1){if(!a){this.V=Math.floor(Math.random()*1e5),a=this.V++;const A=new Zt(this,this.j,a);let C=this.o;if(this.U&&(C?(C=Ah(C),Ch(C,this.U)):C=this.U),this.u!==null||this.R||(A.J=C,C=null),this.S)e:{for(var h=0,d=0;d<this.i.length;d++){t:{var g=this.i[d];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(h+=g,h>4096){h=d;break e}if(h===4096||d===this.i.length-1){h=d+1;break e}}h=1e3}else h=1e3;h=pd(this,A,h),d=It(this.J),ae(d,"RID",a),ae(d,"CVER",22),this.G&&ae(d,"X-HTTP-Session-Id",this.G),Tr(this,d),C&&(this.R?h="headers="+ur(od(C))+"&"+h:this.u&&oc(d,this.u,C)),sc(this.h,A),this.Ra&&ae(d,"TYPE","init"),this.S?(ae(d,"$req",h),ae(d,"SID","null"),A.U=!0,Za(A,d,null)):Za(A,d,h),this.I=2}}else this.I==3&&(a?fd(this,a):this.i.length==0||Kh(this.h)||fd(this))};function fd(a,h){var d;h?d=h.l:d=a.V++;const g=It(a.J);ae(g,"SID",a.M),ae(g,"RID",d),ae(g,"AID",a.K),Tr(a,g),a.u&&a.o&&oc(g,a.u,a.o),d=new Zt(a,a.j,d,a.D+1),a.u===null&&(d.J=a.o),h&&(a.i=h.G.concat(a.i)),h=pd(a,d,1e3),d.H=Math.round(a.va*.5)+Math.round(a.va*.5*Math.random()),sc(a.h,d),Za(d,g,h)}function Tr(a,h){a.H&&Vi(a.H,function(d,g){ae(h,g,d)}),a.l&&Vi({},function(d,g){ae(h,g,d)})}function pd(a,h,d){d=Math.min(a.i.length,d);const g=a.l?u(a.l.Ka,a.l,a):null;e:{var A=a.i;let H=-1;for(;;){const Re=["count="+d];H==-1?d>0?(H=A[0].g,Re.push("ofs="+H)):H=0:Re.push("ofs="+H);let ie=!0;for(let be=0;be<d;be++){var C=A[be].g;const vt=A[be].map;if(C-=H,C<0)H=Math.max(0,A[be].g-100),ie=!1;else try{C="req"+C+"_"||"";try{var V=vt instanceof Map?vt:Object.entries(vt);for(const[Fn,sn]of V){let rn=sn;c(sn)&&(rn=Ka(sn)),Re.push(C+Fn+"="+encodeURIComponent(rn))}}catch(Fn){throw Re.push(C+"type="+encodeURIComponent("_badmap")),Fn}}catch{g&&g(vt)}}if(ie){V=Re.join("&");break e}}V=void 0}return a=a.i.splice(0,d),h.G=a,V}function md(a){if(!a.g&&!a.v){a.Y=1;var h=a.Da;me||_(),Ee||(me(),Ee=!0),I.add(h,a),a.A=0}}function cc(a){return a.g||a.v||a.A>=3?!1:(a.Y++,a.v=cr(u(a.Da,a),yd(a,a.A)),a.A++,!0)}n.Da=function(){if(this.v=null,gd(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var a=4*this.T;this.j.info("BP detection timer enabled: "+a),this.B=cr(u(this.Wa,this),a)}},n.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Ge(10),Wi(this),gd(this))};function lc(a){a.B!=null&&(o.clearTimeout(a.B),a.B=null)}function gd(a){a.g=new Zt(a,a.j,"rpc",a.Y),a.u===null&&(a.g.J=a.o),a.g.P=0;var h=It(a.na);ae(h,"RID","rpc"),ae(h,"SID",a.M),ae(h,"AID",a.K),ae(h,"CI",a.F?"0":"1"),!a.F&&a.ia&&ae(h,"TO",a.ia),ae(h,"TYPE","xmlhttp"),Tr(a,h),a.u&&a.o&&oc(h,a.u,a.o),a.O&&(a.g.H=a.O);var d=a.g;a=a.ba,d.M=1,d.A=Bi(It(h)),d.u=null,d.R=!0,jh(d,a)}n.Va=function(){this.C!=null&&(this.C=null,Wi(this),cc(this),Ge(19))};function Hi(a){a.C!=null&&(o.clearTimeout(a.C),a.C=null)}function _d(a,h){var d=null;if(a.g==h){Hi(a),lc(a),a.g=null;var g=2}else if(nc(a.h,h))d=h.G,Yh(a.h,h),g=1;else return;if(a.I!=0){if(h.o)if(g==1){d=h.u?h.u.length:0,h=Date.now()-h.F;var A=a.D;g=Li(),He(g,new Uh(g,d)),ji(a)}else md(a);else if(A=h.m,A==3||A==0&&h.X>0||!(g==1&&QE(a,h)||g==2&&cc(a)))switch(d&&d.length>0&&(h=a.h,h.i=h.i.concat(d)),A){case 1:Ln(a,5);break;case 4:Ln(a,10);break;case 3:Ln(a,6);break;default:Ln(a,2)}}}function yd(a,h){let d=a.Qa+Math.floor(Math.random()*a.Za);return a.isActive()||(d*=2),d*h}function Ln(a,h){if(a.j.info("Error code "+h),h==2){var d=u(a.bb,a),g=a.Ua;const A=!g;g=new en(g||"//www.google.com/images/cleardot.gif"),o.location&&o.location.protocol=="http"||dr(g,"https"),Bi(g),A?WE(g.toString(),d):jE(g.toString(),d)}else Ge(2);a.I=0,a.l&&a.l.pa(h),Ed(a),dd(a)}n.bb=function(a){a?(this.j.info("Successfully pinged google.com"),Ge(2)):(this.j.info("Failed to ping google.com"),Ge(1))};function Ed(a){if(a.I=0,a.ja=[],a.l){const h=Jh(a.h);(h.length!=0||a.i.length!=0)&&(S(a.ja,h),S(a.ja,a.i),a.h.i.length=0,T(a.i),a.i.length=0),a.l.oa()}}function Td(a,h,d){var g=d instanceof en?It(d):new en(d);if(g.g!="")h&&(g.g=h+"."+g.g),fr(g,g.u);else{var A=o.location;g=A.protocol,h=h?h+"."+A.hostname:A.hostname,A=+A.port;const C=new en(null);g&&dr(C,g),h&&(C.g=h),A&&fr(C,A),d&&(C.h=d),g=C}return d=a.G,h=a.wa,d&&h&&ae(g,d,h),ae(g,"VER",a.ka),Tr(a,g),g}function wd(a,h,d){if(h&&!a.L)throw Error("Can't create secondary domain capable XhrIo object.");return h=a.Aa&&!a.ma?new de(new ic({ab:d})):new de(a.ma),h.Fa(a.L),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Id(){}n=Id.prototype,n.ra=function(){},n.qa=function(){},n.pa=function(){},n.oa=function(){},n.isActive=function(){return!0},n.Ka=function(){};function Gi(){}Gi.prototype.g=function(a,h){return new st(a,h)};function st(a,h){Fe.call(this),this.g=new hd(h),this.l=a,this.h=h&&h.messageUrlParams||null,a=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(a?a["X-WebChannel-Content-Type"]=h.messageContentType:a={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.sa&&(a?a["X-WebChannel-Client-Profile"]=h.sa:a={"X-WebChannel-Client-Profile":h.sa}),this.g.U=a,(a=h&&h.Qb)&&!y(a)&&(this.g.u=a),this.A=h&&h.supportsCrossDomainXhr||!1,this.v=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!y(h)&&(this.g.G=h,a=this.h,a!==null&&h in a&&(a=this.h,h in a&&delete a[h])),this.j=new gs(this)}p(st,Fe),st.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},st.prototype.close=function(){ac(this.g)},st.prototype.o=function(a){var h=this.g;if(typeof a=="string"){var d={};d.__data__=a,a=d}else this.v&&(d={},d.__data__=Ka(a),a=d);h.i.push(new ME(h.Ya++,a)),h.I==3&&ji(h)},st.prototype.N=function(){this.g.l=null,delete this.j,ac(this.g),delete this.g,st.Z.N.call(this)};function vd(a){Qa.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var h=a.__sm__;if(h){e:{for(const d in h){a=d;break e}a=void 0}(this.i=a)&&(a=this.i,h=h!==null&&a in h?h[a]:void 0),this.data=h}else this.data=a}p(vd,Qa);function Ad(){Ya.call(this),this.status=1}p(Ad,Ya);function gs(a){this.g=a}p(gs,Id),gs.prototype.ra=function(){He(this.g,"a")},gs.prototype.qa=function(a){He(this.g,new vd(a))},gs.prototype.pa=function(a){He(this.g,new Ad)},gs.prototype.oa=function(){He(this.g,"b")},Gi.prototype.createWebChannel=Gi.prototype.g,st.prototype.send=st.prototype.o,st.prototype.open=st.prototype.m,st.prototype.close=st.prototype.close,yg=function(){return new Gi},_g=function(){return Li()},gg=Vn,Wc={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Fi.NO_ERROR=0,Fi.TIMEOUT=8,Fi.HTTP_ERROR=6,lo=Fi,Bh.COMPLETE="complete",mg=Bh,Mh.EventType=or,or.OPEN="a",or.CLOSE="b",or.ERROR="c",or.MESSAGE="d",Fe.prototype.listen=Fe.prototype.J,Pr=Mh,de.prototype.listenOnce=de.prototype.K,de.prototype.getLastError=de.prototype.Ha,de.prototype.getLastErrorCode=de.prototype.ya,de.prototype.getStatus=de.prototype.ca,de.prototype.getResponseJson=de.prototype.La,de.prototype.getResponseText=de.prototype.la,de.prototype.send=de.prototype.ea,de.prototype.setWithCredentials=de.prototype.Fa,pg=de}).apply(typeof Yi<"u"?Yi:typeof self<"u"?self:typeof window<"u"?window:{});/**
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
 */class Be{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Be.UNAUTHENTICATED=new Be(null),Be.GOOGLE_CREDENTIALS=new Be("google-credentials-uid"),Be.FIRST_PARTY=new Be("first-party-uid"),Be.MOCK_USER=new Be("mock-user");/**
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
 */let Qs="12.13.0";function cR(n){Qs=n}/**
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
 *//**
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
 */const Xn=new ca("@firebase/firestore");function ys(){return Xn.logLevel}function M(n,...e){if(Xn.logLevel<=Y.DEBUG){const t=e.map(Kl);Xn.debug(`Firestore (${Qs}): ${n}`,...t)}}function zt(n,...e){if(Xn.logLevel<=Y.ERROR){const t=e.map(Kl);Xn.error(`Firestore (${Qs}): ${n}`,...t)}}function Zn(n,...e){if(Xn.logLevel<=Y.WARN){const t=e.map(Kl);Xn.warn(`Firestore (${Qs}): ${n}`,...t)}}function Kl(n){if(typeof n=="string")return n;try{return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
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
 */function F(n,e,t){let s="Unexpected state";typeof e=="string"?s=e:t=e,Eg(n,s,t)}function Eg(n,e,t){let s=`FIRESTORE (${Qs}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{s+=" CONTEXT: "+JSON.stringify(t)}catch{s+=" CONTEXT: "+t}throw zt(s),new Error(s)}function ee(n,e,t,s){let r="Unexpected state";typeof t=="string"?r=t:s=t,n||Eg(e,r,s)}function q(n,e){return n}/**
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
 */const b={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class O extends dt{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class bt{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class Tg{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class lR{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Be.UNAUTHENTICATED)))}shutdown(){}}class uR{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class hR{constructor(e){this.t=e,this.currentUser=Be.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){ee(this.o===void 0,42304);let s=this.i;const r=l=>this.i!==s?(s=this.i,t(l)):Promise.resolve();let i=new bt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new bt,e.enqueueRetryable((()=>r(this.currentUser)))};const o=()=>{const l=i;e.enqueueRetryable((async()=>{await l.promise,await r(this.currentUser)}))},c=l=>{M("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit((l=>c(l))),setTimeout((()=>{if(!this.auth){const l=this.t.getImmediate({optional:!0});l?c(l):(M("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new bt)}}),0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((s=>this.i!==e?(M("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(ee(typeof s.accessToken=="string",31837,{l:s}),new Tg(s.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ee(e===null||typeof e=="string",2055,{h:e}),new Be(e)}}class dR{constructor(e,t,s){this.P=e,this.T=t,this.I=s,this.type="FirstParty",this.user=Be.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);const e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}}class fR{constructor(e,t,s){this.P=e,this.T=t,this.I=s}getToken(){return Promise.resolve(new dR(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable((()=>t(Be.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class cf{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class pR{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,qe(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){ee(this.o===void 0,3512);const s=i=>{i.error!=null&&M("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.m;return this.m=i.token,M("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable((()=>s(i)))};const r=i=>{M("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((i=>r(i))),setTimeout((()=>{if(!this.appCheck){const i=this.V.getImmediate({optional:!0});i?r(i):M("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new cf(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(ee(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new cf(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function mR(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let s=0;s<n;s++)t[s]=Math.floor(256*Math.random());return t}/**
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
 */class Ql{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let s="";for(;s.length<20;){const r=mR(40);for(let i=0;i<r.length;++i)s.length<20&&r[i]<t&&(s+=e.charAt(r[i]%62))}return s}}function J(n,e){return n<e?-1:n>e?1:0}function jc(n,e){const t=Math.min(n.length,e.length);for(let s=0;s<t;s++){const r=n.charAt(s),i=e.charAt(s);if(r!==i)return Ic(r)===Ic(i)?J(r,i):Ic(r)?1:-1}return J(n.length,e.length)}const gR=55296,_R=57343;function Ic(n){const e=n.charCodeAt(0);return e>=gR&&e<=_R}function Vs(n,e,t){return n.length===e.length&&n.every(((s,r)=>t(s,e[r])))}/**
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
 */const lf="__name__";class At{constructor(e,t,s){t===void 0?t=0:t>e.length&&F(637,{offset:t,range:e.length}),s===void 0?s=e.length-t:s>e.length-t&&F(1746,{length:s,range:e.length-t}),this.segments=e,this.offset=t,this.len=s}get length(){return this.len}isEqual(e){return At.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof At?e.forEach((s=>{t.push(s)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,s=this.limit();t<s;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const s=Math.min(e.length,t.length);for(let r=0;r<s;r++){const i=At.compareSegments(e.get(r),t.get(r));if(i!==0)return i}return J(e.length,t.length)}static compareSegments(e,t){const s=At.isNumericId(e),r=At.isNumericId(t);return s&&!r?-1:!s&&r?1:s&&r?At.extractNumericId(e).compare(At.extractNumericId(t)):jc(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return pn.fromString(e.substring(4,e.length-2))}}class se extends At{construct(e,t,s){return new se(e,t,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const s of e){if(s.indexOf("//")>=0)throw new O(b.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);t.push(...s.split("/").filter((r=>r.length>0)))}return new se(t)}static emptyPath(){return new se([])}}const yR=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class xe extends At{construct(e,t,s){return new xe(e,t,s)}static isValidIdentifier(e){return yR.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),xe.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===lf}static keyField(){return new xe([lf])}static fromServerFormat(e){const t=[];let s="",r=0;const i=()=>{if(s.length===0)throw new O(b.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(s),s=""};let o=!1;for(;r<e.length;){const c=e[r];if(c==="\\"){if(r+1===e.length)throw new O(b.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new O(b.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);s+=l,r+=2}else c==="`"?(o=!o,r++):c!=="."||o?(s+=c,r++):(i(),r++)}if(i(),o)throw new O(b.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new xe(t)}static emptyPath(){return new xe([])}}/**
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
 */class L{constructor(e){this.path=e}static fromPath(e){return new L(se.fromString(e))}static fromName(e){return new L(se.fromString(e).popFirst(5))}static empty(){return new L(se.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&se.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return se.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new L(new se(e.slice()))}}/**
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
 */function Yl(n,e,t){if(!t)throw new O(b.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function ER(n,e,t,s){if(e===!0&&s===!0)throw new O(b.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function uf(n){if(!L.isDocumentKey(n))throw new O(b.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function hf(n){if(L.isDocumentKey(n))throw new O(b.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function wg(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function ma(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(s){return s.constructor?s.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":F(12329,{type:typeof n})}function Ce(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new O(b.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ma(n);throw new O(b.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function TR(n,e){if(e<=0)throw new O(b.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
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
 */function Ae(n,e){const t={typeString:n};return e&&(t.value=e),t}function mi(n,e){if(!wg(n))throw new O(b.INVALID_ARGUMENT,"JSON must be an object");let t;for(const s in e)if(e[s]){const r=e[s].typeString,i="value"in e[s]?{value:e[s].value}:void 0;if(!(s in n)){t=`JSON missing required field: '${s}'`;break}const o=n[s];if(r&&typeof o!==r){t=`JSON field '${s}' must be a ${r}.`;break}if(i!==void 0&&o!==i.value){t=`Expected '${s}' field to equal '${i.value}'`;break}}if(t)throw new O(b.INVALID_ARGUMENT,t);return!0}/**
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
 */const df=-62135596800,ff=1e6;class le{static now(){return le.fromMillis(Date.now())}static fromDate(e){return le.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),s=Math.floor((e-1e3*t)*ff);return new le(t,s)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new O(b.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new O(b.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<df)throw new O(b.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new O(b.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/ff}_compareTo(e){return this.seconds===e.seconds?J(this.nanoseconds,e.nanoseconds):J(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:le._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(mi(e,le._jsonSchema))return new le(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-df;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}le._jsonSchemaVersion="firestore/timestamp/1.0",le._jsonSchema={type:Ae("string",le._jsonSchemaVersion),seconds:Ae("number"),nanoseconds:Ae("number")};/**
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
 */class U{static fromTimestamp(e){return new U(e)}static min(){return new U(new le(0,0))}static max(){return new U(new le(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */const Jr=-1;function wR(n,e){const t=n.toTimestamp().seconds,s=n.toTimestamp().nanoseconds+1,r=U.fromTimestamp(s===1e9?new le(t+1,0):new le(t,s));return new Tn(r,L.empty(),e)}function IR(n){return new Tn(n.readTime,n.key,Jr)}class Tn{constructor(e,t,s){this.readTime=e,this.documentKey=t,this.largestBatchId=s}static min(){return new Tn(U.min(),L.empty(),Jr)}static max(){return new Tn(U.max(),L.empty(),Jr)}}function vR(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=L.comparator(n.documentKey,e.documentKey),t!==0?t:J(n.largestBatchId,e.largestBatchId))}/**
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
 */const AR="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class RR{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
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
 */async function Ys(n){if(n.code!==b.FAILED_PRECONDITION||n.message!==AR)throw n;M("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class P{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&F(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new P(((s,r)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(s,r)},this.catchCallback=i=>{this.wrapFailure(t,i).next(s,r)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof P?t:P.resolve(t)}catch(t){return P.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):P.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):P.reject(t)}static resolve(e){return new P(((t,s)=>{t(e)}))}static reject(e){return new P(((t,s)=>{s(e)}))}static waitFor(e){return new P(((t,s)=>{let r=0,i=0,o=!1;e.forEach((c=>{++r,c.next((()=>{++i,o&&i===r&&t()}),(l=>s(l)))})),o=!0,i===r&&t()}))}static or(e){let t=P.resolve(!1);for(const s of e)t=t.next((r=>r?P.resolve(r):s()));return t}static forEach(e,t){const s=[];return e.forEach(((r,i)=>{s.push(t.call(this,r,i))})),this.waitFor(s)}static mapArray(e,t){return new P(((s,r)=>{const i=e.length,o=new Array(i);let c=0;for(let l=0;l<i;l++){const u=l;t(e[u]).next((f=>{o[u]=f,++c,c===i&&s(o)}),(f=>r(f)))}}))}static doWhile(e,t){return new P(((s,r)=>{const i=()=>{e()===!0?t().next((()=>{i()}),r):s()};i()}))}}function CR(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Js(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
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
 */class ga{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=s=>this.ae(s),this.ue=s=>t.writeSequenceNumber(s))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ue&&this.ue(e),e}}ga.ce=-1;/**
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
 */const Jl=-1;function gi(n){return n==null}function Po(n){return n===0&&1/n==-1/0}function SR(n){return typeof n=="number"&&Number.isInteger(n)&&!Po(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
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
 */const Ig="";function bR(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=pf(e)),e=PR(n.get(t),e);return pf(e)}function PR(n,e){let t=e;const s=n.length;for(let r=0;r<s;r++){const i=n.charAt(r);switch(i){case"\0":t+="";break;case Ig:t+="";break;default:t+=i}}return t}function pf(n){return n+Ig+""}/**
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
 */function mf(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function kn(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function vg(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */let ye=class Hc{constructor(e,t){this.comparator=e,this.root=t||mn.EMPTY}insert(e,t){return new Hc(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,mn.BLACK,null,null))}remove(e){return new Hc(this.comparator,this.root.remove(e,this.comparator).copy(null,null,mn.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const s=this.comparator(e,t.key);if(s===0)return t.value;s<0?t=t.left:s>0&&(t=t.right)}return null}indexOf(e){let t=0,s=this.root;for(;!s.isEmpty();){const r=this.comparator(e,s.key);if(r===0)return t+s.left.size;r<0?s=s.left:(t+=s.left.size+1,s=s.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,s)=>(e(t,s),!1)))}toString(){const e=[];return this.inorderTraversal(((t,s)=>(e.push(`${t}:${s}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ji(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ji(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ji(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ji(this.root,e,this.comparator,!0)}},Ji=class{constructor(e,t,s,r){this.isReverse=r,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?s(e.key,t):1,t&&r&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},mn=class xt{constructor(e,t,s,r,i){this.key=e,this.value=t,this.color=s??xt.RED,this.left=r??xt.EMPTY,this.right=i??xt.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,s,r,i){return new xt(e??this.key,t??this.value,s??this.color,r??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let r=this;const i=s(e,r.key);return r=i<0?r.copy(null,null,null,r.left.insert(e,t,s),null):i===0?r.copy(null,t,null,null,null):r.copy(null,null,null,null,r.right.insert(e,t,s)),r.fixUp()}removeMin(){if(this.left.isEmpty())return xt.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let s,r=this;if(t(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,t),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),t(e,r.key)===0){if(r.right.isEmpty())return xt.EMPTY;s=r.right.min(),r=r.copy(s.key,s.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,t))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,xt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,xt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw F(43730,{key:this.key,value:this.value});if(this.right.isRed())throw F(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw F(27949);return e+(this.isRed()?0:1)}};mn.EMPTY=null,mn.RED=!0,mn.BLACK=!1;mn.EMPTY=new class{constructor(){this.size=0}get key(){throw F(57766)}get value(){throw F(16141)}get color(){throw F(16727)}get left(){throw F(29726)}get right(){throw F(36894)}copy(e,t,s,r,i){return this}insert(e,t,s){return new mn(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class Se{constructor(e){this.comparator=e,this.data=new ye(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,s)=>(e(t),!1)))}forEachInRange(e,t){const s=this.data.getIteratorFrom(e[0]);for(;s.hasNext();){const r=s.getNext();if(this.comparator(r.key,e[1])>=0)return;t(r.key)}}forEachWhile(e,t){let s;for(s=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();s.hasNext();)if(!e(s.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new gf(this.data.getIterator())}getIteratorFrom(e){return new gf(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((s=>{t=t.add(s)})),t}isEqual(e){if(!(e instanceof Se)||this.size!==e.size)return!1;const t=this.data.getIterator(),s=e.data.getIterator();for(;t.hasNext();){const r=t.getNext().key,i=s.getNext().key;if(this.comparator(r,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new Se(this.comparator);return t.data=e,t}}class gf{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class it{constructor(e){this.fields=e,e.sort(xe.comparator)}static empty(){return new it([])}unionWith(e){let t=new Se(xe.comparator);for(const s of this.fields)t=t.add(s);for(const s of e)t=t.add(s);return new it(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Vs(this.fields,e.fields,((t,s)=>t.isEqual(s)))}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */class Ag extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class Le{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(r){try{return atob(r)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Ag("Invalid base64 string: "+i):i}})(e);return new Le(t)}static fromUint8Array(e){const t=(function(r){let i="";for(let o=0;o<r.length;++o)i+=String.fromCharCode(r[o]);return i})(e);return new Le(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const s=new Uint8Array(t.length);for(let r=0;r<t.length;r++)s[r]=t.charCodeAt(r);return s})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return J(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Le.EMPTY_BYTE_STRING=new Le("");const kR=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function wn(n){if(ee(!!n,39018),typeof n=="string"){let e=0;const t=kR.exec(n);if(ee(!!t,46558,{timestamp:n}),t[1]){let r=t[1];r=(r+"000000000").substr(0,9),e=Number(r)}const s=new Date(n);return{seconds:Math.floor(s.getTime()/1e3),nanos:e}}return{seconds:ge(n.seconds),nanos:ge(n.nanos)}}function ge(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function In(n){return typeof n=="string"?Le.fromBase64String(n):Le.fromUint8Array(n)}/**
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
 */const Rg="server_timestamp",Cg="__type__",Sg="__previous_value__",bg="__local_write_time__";function Xl(n){var t,s;return((s=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Cg])==null?void 0:s.stringValue)===Rg}function _a(n){const e=n.mapValue.fields[Sg];return Xl(e)?_a(e):e}function Xr(n){const e=wn(n.mapValue.fields[bg].timestampValue);return new le(e.seconds,e.nanos)}/**
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
 */class NR{constructor(e,t,s,r,i,o,c,l,u,f,p){this.databaseId=e,this.appId=t,this.persistenceKey=s,this.host=r,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=c,this.longPollingOptions=l,this.useFetchStreams=u,this.isUsingEmulator=f,this.apiKey=p}}const ko="(default)";class Zr{constructor(e,t){this.projectId=e,this.database=t||ko}static empty(){return new Zr("","")}get isDefaultDatabase(){return this.database===ko}isEqual(e){return e instanceof Zr&&e.projectId===this.projectId&&e.database===this.database}}function DR(n,e){if(!Object.prototype.hasOwnProperty.apply(n.options,["projectId"]))throw new O(b.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Zr(n.options.projectId,e)}/**
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
 */const Pg="__type__",OR="__max__",Xi={mapValue:{}},kg="__vector__",No="value";function vn(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Xl(n)?4:MR(n)?9007199254740991:VR(n)?10:11:F(28295,{value:n})}function Dt(n,e){if(n===e)return!0;const t=vn(n);if(t!==vn(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Xr(n).isEqual(Xr(e));case 3:return(function(r,i){if(typeof r.timestampValue=="string"&&typeof i.timestampValue=="string"&&r.timestampValue.length===i.timestampValue.length)return r.timestampValue===i.timestampValue;const o=wn(r.timestampValue),c=wn(i.timestampValue);return o.seconds===c.seconds&&o.nanos===c.nanos})(n,e);case 5:return n.stringValue===e.stringValue;case 6:return(function(r,i){return In(r.bytesValue).isEqual(In(i.bytesValue))})(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return(function(r,i){return ge(r.geoPointValue.latitude)===ge(i.geoPointValue.latitude)&&ge(r.geoPointValue.longitude)===ge(i.geoPointValue.longitude)})(n,e);case 2:return(function(r,i){if("integerValue"in r&&"integerValue"in i)return ge(r.integerValue)===ge(i.integerValue);if("doubleValue"in r&&"doubleValue"in i){const o=ge(r.doubleValue),c=ge(i.doubleValue);return o===c?Po(o)===Po(c):isNaN(o)&&isNaN(c)}return!1})(n,e);case 9:return Vs(n.arrayValue.values||[],e.arrayValue.values||[],Dt);case 10:case 11:return(function(r,i){const o=r.mapValue.fields||{},c=i.mapValue.fields||{};if(mf(o)!==mf(c))return!1;for(const l in o)if(o.hasOwnProperty(l)&&(c[l]===void 0||!Dt(o[l],c[l])))return!1;return!0})(n,e);default:return F(52216,{left:n})}}function ei(n,e){return(n.values||[]).find((t=>Dt(t,e)))!==void 0}function Ms(n,e){if(n===e)return 0;const t=vn(n),s=vn(e);if(t!==s)return J(t,s);switch(t){case 0:case 9007199254740991:return 0;case 1:return J(n.booleanValue,e.booleanValue);case 2:return(function(i,o){const c=ge(i.integerValue||i.doubleValue),l=ge(o.integerValue||o.doubleValue);return c<l?-1:c>l?1:c===l?0:isNaN(c)?isNaN(l)?0:-1:1})(n,e);case 3:return _f(n.timestampValue,e.timestampValue);case 4:return _f(Xr(n),Xr(e));case 5:return jc(n.stringValue,e.stringValue);case 6:return(function(i,o){const c=In(i),l=In(o);return c.compareTo(l)})(n.bytesValue,e.bytesValue);case 7:return(function(i,o){const c=i.split("/"),l=o.split("/");for(let u=0;u<c.length&&u<l.length;u++){const f=J(c[u],l[u]);if(f!==0)return f}return J(c.length,l.length)})(n.referenceValue,e.referenceValue);case 8:return(function(i,o){const c=J(ge(i.latitude),ge(o.latitude));return c!==0?c:J(ge(i.longitude),ge(o.longitude))})(n.geoPointValue,e.geoPointValue);case 9:return yf(n.arrayValue,e.arrayValue);case 10:return(function(i,o){var m,T,S,k;const c=i.fields||{},l=o.fields||{},u=(m=c[No])==null?void 0:m.arrayValue,f=(T=l[No])==null?void 0:T.arrayValue,p=J(((S=u==null?void 0:u.values)==null?void 0:S.length)||0,((k=f==null?void 0:f.values)==null?void 0:k.length)||0);return p!==0?p:yf(u,f)})(n.mapValue,e.mapValue);case 11:return(function(i,o){if(i===Xi.mapValue&&o===Xi.mapValue)return 0;if(i===Xi.mapValue)return 1;if(o===Xi.mapValue)return-1;const c=i.fields||{},l=Object.keys(c),u=o.fields||{},f=Object.keys(u);l.sort(),f.sort();for(let p=0;p<l.length&&p<f.length;++p){const m=jc(l[p],f[p]);if(m!==0)return m;const T=Ms(c[l[p]],u[f[p]]);if(T!==0)return T}return J(l.length,f.length)})(n.mapValue,e.mapValue);default:throw F(23264,{he:t})}}function _f(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return J(n,e);const t=wn(n),s=wn(e),r=J(t.seconds,s.seconds);return r!==0?r:J(t.nanos,s.nanos)}function yf(n,e){const t=n.values||[],s=e.values||[];for(let r=0;r<t.length&&r<s.length;++r){const i=Ms(t[r],s[r]);if(i)return i}return J(t.length,s.length)}function xs(n){return Gc(n)}function Gc(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?(function(t){const s=wn(t);return`time(${s.seconds},${s.nanos})`})(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?(function(t){return In(t).toBase64()})(n.bytesValue):"referenceValue"in n?(function(t){return L.fromName(t).toString()})(n.referenceValue):"geoPointValue"in n?(function(t){return`geo(${t.latitude},${t.longitude})`})(n.geoPointValue):"arrayValue"in n?(function(t){let s="[",r=!0;for(const i of t.values||[])r?r=!1:s+=",",s+=Gc(i);return s+"]"})(n.arrayValue):"mapValue"in n?(function(t){const s=Object.keys(t.fields||{}).sort();let r="{",i=!0;for(const o of s)i?i=!1:r+=",",r+=`${o}:${Gc(t.fields[o])}`;return r+"}"})(n.mapValue):F(61005,{value:n})}function uo(n){switch(vn(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=_a(n);return e?16+uo(e):16;case 5:return 2*n.stringValue.length;case 6:return In(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return(function(s){return(s.values||[]).reduce(((r,i)=>r+uo(i)),0)})(n.arrayValue);case 10:case 11:return(function(s){let r=0;return kn(s.fields,((i,o)=>{r+=i.length+uo(o)})),r})(n.mapValue);default:throw F(13486,{value:n})}}function Ef(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function zc(n){return!!n&&"integerValue"in n}function Zl(n){return!!n&&"arrayValue"in n}function Tf(n){return!!n&&"nullValue"in n}function wf(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function ho(n){return!!n&&"mapValue"in n}function VR(n){var t,s;return((s=(((t=n==null?void 0:n.mapValue)==null?void 0:t.fields)||{})[Pg])==null?void 0:s.stringValue)===kg}function Vr(n){if(n.geoPointValue)return{geoPointValue:{...n.geoPointValue}};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:{...n.timestampValue}};if(n.mapValue){const e={mapValue:{fields:{}}};return kn(n.mapValue.fields,((t,s)=>e.mapValue.fields[t]=Vr(s))),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Vr(n.arrayValue.values[t]);return e}return{...n}}function MR(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===OR}/**
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
 */class Ke{constructor(e){this.value=e}static empty(){return new Ke({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let s=0;s<e.length-1;++s)if(t=(t.mapValue.fields||{})[e.get(s)],!ho(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Vr(t)}setAll(e){let t=xe.emptyPath(),s={},r=[];e.forEach(((o,c)=>{if(!t.isImmediateParentOf(c)){const l=this.getFieldsMap(t);this.applyChanges(l,s,r),s={},r=[],t=c.popLast()}o?s[c.lastSegment()]=Vr(o):r.push(c.lastSegment())}));const i=this.getFieldsMap(t);this.applyChanges(i,s,r)}delete(e){const t=this.field(e.popLast());ho(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Dt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let s=0;s<e.length;++s){let r=t.mapValue.fields[e.get(s)];ho(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},t.mapValue.fields[e.get(s)]=r),t=r}return t.mapValue.fields}applyChanges(e,t,s){kn(t,((r,i)=>e[r]=i));for(const r of s)delete e[r]}clone(){return new Ke(Vr(this.value))}}function Ng(n){const e=[];return kn(n.fields,((t,s)=>{const r=new xe([t]);if(ho(s)){const i=Ng(s.mapValue).fields;if(i.length===0)e.push(r);else for(const o of i)e.push(r.child(o))}else e.push(r)})),new it(e)}/**
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
 */class De{constructor(e,t,s,r,i,o,c){this.key=e,this.documentType=t,this.version=s,this.readTime=r,this.createTime=i,this.data=o,this.documentState=c}static newInvalidDocument(e){return new De(e,0,U.min(),U.min(),U.min(),Ke.empty(),0)}static newFoundDocument(e,t,s,r){return new De(e,1,t,U.min(),s,r,0)}static newNoDocument(e,t){return new De(e,2,t,U.min(),U.min(),Ke.empty(),0)}static newUnknownDocument(e,t){return new De(e,3,t,U.min(),U.min(),Ke.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(U.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ke.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ke.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=U.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof De&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new De(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Do{constructor(e,t){this.position=e,this.inclusive=t}}function If(n,e,t){let s=0;for(let r=0;r<n.position.length;r++){const i=e[r],o=n.position[r];if(i.field.isKeyField()?s=L.comparator(L.fromName(o.referenceValue),t.key):s=Ms(o,t.data.field(i.field)),i.dir==="desc"&&(s*=-1),s!==0)break}return s}function vf(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Dt(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class ti{constructor(e,t="asc"){this.field=e,this.dir=t}}function xR(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class Dg{}class Ie extends Dg{constructor(e,t,s){super(),this.field=e,this.op=t,this.value=s}static create(e,t,s){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,s):new FR(e,t,s):t==="array-contains"?new qR(e,s):t==="in"?new $R(e,s):t==="not-in"?new WR(e,s):t==="array-contains-any"?new jR(e,s):new Ie(e,t,s)}static createKeyFieldInFilter(e,t,s){return t==="in"?new UR(e,s):new BR(e,s)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(Ms(t,this.value)):t!==null&&vn(this.value)===vn(t)&&this.matchesComparison(Ms(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return F(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Tt extends Dg{constructor(e,t){super(),this.filters=e,this.op=t,this.Pe=null}static create(e,t){return new Tt(e,t)}matches(e){return Og(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}}function Og(n){return n.op==="and"}function Vg(n){return LR(n)&&Og(n)}function LR(n){for(const e of n.filters)if(e instanceof Tt)return!1;return!0}function Kc(n){if(n instanceof Ie)return n.field.canonicalString()+n.op.toString()+xs(n.value);if(Vg(n))return n.filters.map((e=>Kc(e))).join(",");{const e=n.filters.map((t=>Kc(t))).join(",");return`${n.op}(${e})`}}function Mg(n,e){return n instanceof Ie?(function(s,r){return r instanceof Ie&&s.op===r.op&&s.field.isEqual(r.field)&&Dt(s.value,r.value)})(n,e):n instanceof Tt?(function(s,r){return r instanceof Tt&&s.op===r.op&&s.filters.length===r.filters.length?s.filters.reduce(((i,o,c)=>i&&Mg(o,r.filters[c])),!0):!1})(n,e):void F(19439)}function xg(n){return n instanceof Ie?(function(t){return`${t.field.canonicalString()} ${t.op} ${xs(t.value)}`})(n):n instanceof Tt?(function(t){return t.op.toString()+" {"+t.getFilters().map(xg).join(" ,")+"}"})(n):"Filter"}class FR extends Ie{constructor(e,t,s){super(e,t,s),this.key=L.fromName(s.referenceValue)}matches(e){const t=L.comparator(e.key,this.key);return this.matchesComparison(t)}}class UR extends Ie{constructor(e,t){super(e,"in",t),this.keys=Lg("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class BR extends Ie{constructor(e,t){super(e,"not-in",t),this.keys=Lg("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Lg(n,e){var t;return(((t=e.arrayValue)==null?void 0:t.values)||[]).map((s=>L.fromName(s.referenceValue)))}class qR extends Ie{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Zl(t)&&ei(t.arrayValue,this.value)}}class $R extends Ie{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&ei(this.value.arrayValue,t)}}class WR extends Ie{constructor(e,t){super(e,"not-in",t)}matches(e){if(ei(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!ei(this.value.arrayValue,t)}}class jR extends Ie{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Zl(t)||!t.arrayValue.values)&&t.arrayValue.values.some((s=>ei(this.value.arrayValue,s)))}}/**
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
 */class HR{constructor(e,t=null,s=[],r=[],i=null,o=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=s,this.filters=r,this.limit=i,this.startAt=o,this.endAt=c,this.Te=null}}function Af(n,e=null,t=[],s=[],r=null,i=null,o=null){return new HR(n,e,t,s,r,i,o)}function eu(n){const e=q(n);if(e.Te===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((s=>Kc(s))).join(","),t+="|ob:",t+=e.orderBy.map((s=>(function(i){return i.field.canonicalString()+i.dir})(s))).join(","),gi(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((s=>xs(s))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((s=>xs(s))).join(",")),e.Te=t}return e.Te}function tu(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!xR(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Mg(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!vf(n.startAt,e.startAt)&&vf(n.endAt,e.endAt)}function Qc(n){return L.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class as{constructor(e,t=null,s=[],r=[],i=null,o="F",c=null,l=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=s,this.filters=r,this.limit=i,this.limitType=o,this.startAt=c,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}}function GR(n,e,t,s,r,i,o,c){return new as(n,e,t,s,r,i,o,c)}function ya(n){return new as(n)}function Rf(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function zR(n){return L.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Fg(n){return n.collectionGroup!==null}function Mr(n){const e=q(n);if(e.Ie===null){e.Ie=[];const t=new Set;for(const i of e.explicitOrderBy)e.Ie.push(i),t.add(i.field.canonicalString());const s=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let c=new Se(xe.comparator);return o.filters.forEach((l=>{l.getFlattenedFilters().forEach((u=>{u.isInequality()&&(c=c.add(u.field))}))})),c})(e).forEach((i=>{t.has(i.canonicalString())||i.isKeyField()||e.Ie.push(new ti(i,s))})),t.has(xe.keyField().canonicalString())||e.Ie.push(new ti(xe.keyField(),s))}return e.Ie}function Pt(n){const e=q(n);return e.Ee||(e.Ee=KR(e,Mr(n))),e.Ee}function KR(n,e){if(n.limitType==="F")return Af(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map((r=>{const i=r.dir==="desc"?"asc":"desc";return new ti(r.field,i)}));const t=n.endAt?new Do(n.endAt.position,n.endAt.inclusive):null,s=n.startAt?new Do(n.startAt.position,n.startAt.inclusive):null;return Af(n.path,n.collectionGroup,e,n.filters,n.limit,t,s)}}function Yc(n,e){const t=n.filters.concat([e]);return new as(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function QR(n,e){const t=n.explicitOrderBy.concat([e]);return new as(n.path,n.collectionGroup,t,n.filters.slice(),n.limit,n.limitType,n.startAt,n.endAt)}function Oo(n,e,t){return new as(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Ea(n,e){return tu(Pt(n),Pt(e))&&n.limitType===e.limitType}function Ug(n){return`${eu(Pt(n))}|lt:${n.limitType}`}function Es(n){return`Query(target=${(function(t){let s=t.path.canonicalString();return t.collectionGroup!==null&&(s+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(s+=`, filters: [${t.filters.map((r=>xg(r))).join(", ")}]`),gi(t.limit)||(s+=", limit: "+t.limit),t.orderBy.length>0&&(s+=`, orderBy: [${t.orderBy.map((r=>(function(o){return`${o.field.canonicalString()} (${o.dir})`})(r))).join(", ")}]`),t.startAt&&(s+=", startAt: ",s+=t.startAt.inclusive?"b:":"a:",s+=t.startAt.position.map((r=>xs(r))).join(",")),t.endAt&&(s+=", endAt: ",s+=t.endAt.inclusive?"a:":"b:",s+=t.endAt.position.map((r=>xs(r))).join(",")),`Target(${s})`})(Pt(n))}; limitType=${n.limitType})`}function Ta(n,e){return e.isFoundDocument()&&(function(s,r){const i=r.key.path;return s.collectionGroup!==null?r.key.hasCollectionId(s.collectionGroup)&&s.path.isPrefixOf(i):L.isDocumentKey(s.path)?s.path.isEqual(i):s.path.isImmediateParentOf(i)})(n,e)&&(function(s,r){for(const i of Mr(s))if(!i.field.isKeyField()&&r.data.field(i.field)===null)return!1;return!0})(n,e)&&(function(s,r){for(const i of s.filters)if(!i.matches(r))return!1;return!0})(n,e)&&(function(s,r){return!(s.startAt&&!(function(o,c,l){const u=If(o,c,l);return o.inclusive?u<=0:u<0})(s.startAt,Mr(s),r)||s.endAt&&!(function(o,c,l){const u=If(o,c,l);return o.inclusive?u>=0:u>0})(s.endAt,Mr(s),r))})(n,e)}function YR(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Bg(n){return(e,t)=>{let s=!1;for(const r of Mr(n)){const i=JR(r,e,t);if(i!==0)return i;s=s||r.field.isKeyField()}return 0}}function JR(n,e,t){const s=n.field.isKeyField()?L.comparator(e.key,t.key):(function(i,o,c){const l=o.data.field(i),u=c.data.field(i);return l!==null&&u!==null?Ms(l,u):F(42886)})(n.field,e,t);switch(n.dir){case"asc":return s;case"desc":return-1*s;default:return F(19790,{direction:n.dir})}}/**
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
 */class cs{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),s=this.inner[t];if(s!==void 0){for(const[r,i]of s)if(this.equalsFn(r,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const s=this.mapKeyFn(e),r=this.inner[s];if(r===void 0)return this.inner[s]=[[e,t]],void this.innerSize++;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return void(r[i]=[e,t]);r.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),s=this.inner[t];if(s===void 0)return!1;for(let r=0;r<s.length;r++)if(this.equalsFn(s[r][0],e))return s.length===1?delete this.inner[t]:s.splice(r,1),this.innerSize--,!0;return!1}forEach(e){kn(this.inner,((t,s)=>{for(const[r,i]of s)e(r,i)}))}isEmpty(){return vg(this.inner)}size(){return this.innerSize}}/**
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
 */const XR=new ye(L.comparator);function Kt(){return XR}const qg=new ye(L.comparator);function kr(...n){let e=qg;for(const t of n)e=e.insert(t.key,t);return e}function $g(n){let e=qg;return n.forEach(((t,s)=>e=e.insert(t,s.overlayedDocument))),e}function jn(){return xr()}function Wg(){return xr()}function xr(){return new cs((n=>n.toString()),((n,e)=>n.isEqual(e)))}const ZR=new ye(L.comparator),eC=new Se(L.comparator);function X(...n){let e=eC;for(const t of n)e=e.add(t);return e}const tC=new Se(J);function nC(){return tC}/**
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
 */function nu(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Po(e)?"-0":e}}function jg(n){return{integerValue:""+n}}function sC(n,e){return SR(e)?jg(e):nu(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
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
 */class wa{constructor(){this._=void 0}}function rC(n,e,t){return n instanceof ni?(function(r,i){const o={fields:{[Cg]:{stringValue:Rg},[bg]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return i&&Xl(i)&&(i=_a(i)),i&&(o.fields[Sg]=i),{mapValue:o}})(t,e):n instanceof Ls?Gg(n,e):n instanceof Fs?zg(n,e):(function(r,i){const o=Hg(r,i),c=Cf(o)+Cf(r.Ae);return zc(o)&&zc(r.Ae)?jg(c):nu(r.serializer,c)})(n,e)}function iC(n,e,t){return n instanceof Ls?Gg(n,e):n instanceof Fs?zg(n,e):t}function Hg(n,e){return n instanceof Vo?(function(s){return zc(s)||(function(i){return!!i&&"doubleValue"in i})(s)})(e)?e:{integerValue:0}:null}class ni extends wa{}class Ls extends wa{constructor(e){super(),this.elements=e}}function Gg(n,e){const t=Kg(e);for(const s of n.elements)t.some((r=>Dt(r,s)))||t.push(s);return{arrayValue:{values:t}}}class Fs extends wa{constructor(e){super(),this.elements=e}}function zg(n,e){let t=Kg(e);for(const s of n.elements)t=t.filter((r=>!Dt(r,s)));return{arrayValue:{values:t}}}class Vo extends wa{constructor(e,t){super(),this.serializer=e,this.Ae=t}}function Cf(n){return ge(n.integerValue||n.doubleValue)}function Kg(n){return Zl(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
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
 */class su{constructor(e,t){this.field=e,this.transform=t}}function oC(n,e){return n.field.isEqual(e.field)&&(function(s,r){return s instanceof Ls&&r instanceof Ls||s instanceof Fs&&r instanceof Fs?Vs(s.elements,r.elements,Dt):s instanceof Vo&&r instanceof Vo?Dt(s.Ae,r.Ae):s instanceof ni&&r instanceof ni})(n.transform,e.transform)}class aC{constructor(e,t){this.version=e,this.transformResults=t}}class ve{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new ve}static exists(e){return new ve(void 0,e)}static updateTime(e){return new ve(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function fo(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Ia{}function Qg(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new yi(n.key,ve.none()):new _i(n.key,n.data,ve.none());{const t=n.data,s=Ke.empty();let r=new Se(xe.comparator);for(let i of e.fields)if(!r.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?s.delete(i):s.set(i,o),r=r.add(i)}return new Nn(n.key,s,new it(r.toArray()),ve.none())}}function cC(n,e,t){n instanceof _i?(function(r,i,o){const c=r.value.clone(),l=bf(r.fieldTransforms,i,o.transformResults);c.setAll(l),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()})(n,e,t):n instanceof Nn?(function(r,i,o){if(!fo(r.precondition,i))return void i.convertToUnknownDocument(o.version);const c=bf(r.fieldTransforms,i,o.transformResults),l=i.data;l.setAll(Yg(r)),l.setAll(c),i.convertToFoundDocument(o.version,l).setHasCommittedMutations()})(n,e,t):(function(r,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()})(0,e,t)}function Lr(n,e,t,s){return n instanceof _i?(function(i,o,c,l){if(!fo(i.precondition,o))return c;const u=i.value.clone(),f=Pf(i.fieldTransforms,l,o);return u.setAll(f),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null})(n,e,t,s):n instanceof Nn?(function(i,o,c,l){if(!fo(i.precondition,o))return c;const u=Pf(i.fieldTransforms,l,o),f=o.data;return f.setAll(Yg(i)),f.setAll(u),o.convertToFoundDocument(o.version,f).setHasLocalMutations(),c===null?null:c.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map((p=>p.field)))})(n,e,t,s):(function(i,o,c){return fo(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):c})(n,e,t)}function lC(n,e){let t=null;for(const s of n.fieldTransforms){const r=e.data.field(s.field),i=Hg(s.transform,r||null);i!=null&&(t===null&&(t=Ke.empty()),t.set(s.field,i))}return t||null}function Sf(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!(function(s,r){return s===void 0&&r===void 0||!(!s||!r)&&Vs(s,r,((i,o)=>oC(i,o)))})(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class _i extends Ia{constructor(e,t,s,r=[]){super(),this.key=e,this.value=t,this.precondition=s,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}}class Nn extends Ia{constructor(e,t,s,r,i=[]){super(),this.key=e,this.data=t,this.fieldMask=s,this.precondition=r,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Yg(n){const e=new Map;return n.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const s=n.data.field(t);e.set(t,s)}})),e}function bf(n,e,t){const s=new Map;ee(n.length===t.length,32656,{Ve:t.length,de:n.length});for(let r=0;r<t.length;r++){const i=n[r],o=i.transform,c=e.data.field(i.field);s.set(i.field,iC(o,c,t[r]))}return s}function Pf(n,e,t){const s=new Map;for(const r of n){const i=r.transform,o=t.data.field(r.field);s.set(r.field,rC(i,o,e))}return s}class yi extends Ia{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Jg extends Ia{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class uC{constructor(e,t,s,r){this.batchId=e,this.localWriteTime=t,this.baseMutations=s,this.mutations=r}applyToRemoteDocument(e,t){const s=t.mutationResults;for(let r=0;r<this.mutations.length;r++){const i=this.mutations[r];i.key.isEqual(e.key)&&cC(i,e,s[r])}}applyToLocalView(e,t){for(const s of this.baseMutations)s.key.isEqual(e.key)&&(t=Lr(s,e,t,this.localWriteTime));for(const s of this.mutations)s.key.isEqual(e.key)&&(t=Lr(s,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const s=Wg();return this.mutations.forEach((r=>{const i=e.get(r.key),o=i.overlayedDocument;let c=this.applyToLocalView(o,i.mutatedFields);c=t.has(r.key)?null:c;const l=Qg(o,c);l!==null&&s.set(r.key,l),o.isValidDocument()||o.convertToNoDocument(U.min())})),s}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),X())}isEqual(e){return this.batchId===e.batchId&&Vs(this.mutations,e.mutations,((t,s)=>Sf(t,s)))&&Vs(this.baseMutations,e.baseMutations,((t,s)=>Sf(t,s)))}}class ru{constructor(e,t,s,r){this.batch=e,this.commitVersion=t,this.mutationResults=s,this.docVersions=r}static from(e,t,s){ee(e.mutations.length===s.length,58842,{me:e.mutations.length,fe:s.length});let r=(function(){return ZR})();const i=e.mutations;for(let o=0;o<i.length;o++)r=r.insert(i[o].key,s[o].version);return new ru(e,t,s,r)}}/**
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
 */class hC{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
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
 */class dC{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
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
 */var Te,Z;function Xg(n){switch(n){case b.OK:return F(64938);case b.CANCELLED:case b.UNKNOWN:case b.DEADLINE_EXCEEDED:case b.RESOURCE_EXHAUSTED:case b.INTERNAL:case b.UNAVAILABLE:case b.UNAUTHENTICATED:return!1;case b.INVALID_ARGUMENT:case b.NOT_FOUND:case b.ALREADY_EXISTS:case b.PERMISSION_DENIED:case b.FAILED_PRECONDITION:case b.ABORTED:case b.OUT_OF_RANGE:case b.UNIMPLEMENTED:case b.DATA_LOSS:return!0;default:return F(15467,{code:n})}}function Zg(n){if(n===void 0)return zt("GRPC error has no .code"),b.UNKNOWN;switch(n){case Te.OK:return b.OK;case Te.CANCELLED:return b.CANCELLED;case Te.UNKNOWN:return b.UNKNOWN;case Te.DEADLINE_EXCEEDED:return b.DEADLINE_EXCEEDED;case Te.RESOURCE_EXHAUSTED:return b.RESOURCE_EXHAUSTED;case Te.INTERNAL:return b.INTERNAL;case Te.UNAVAILABLE:return b.UNAVAILABLE;case Te.UNAUTHENTICATED:return b.UNAUTHENTICATED;case Te.INVALID_ARGUMENT:return b.INVALID_ARGUMENT;case Te.NOT_FOUND:return b.NOT_FOUND;case Te.ALREADY_EXISTS:return b.ALREADY_EXISTS;case Te.PERMISSION_DENIED:return b.PERMISSION_DENIED;case Te.FAILED_PRECONDITION:return b.FAILED_PRECONDITION;case Te.ABORTED:return b.ABORTED;case Te.OUT_OF_RANGE:return b.OUT_OF_RANGE;case Te.UNIMPLEMENTED:return b.UNIMPLEMENTED;case Te.DATA_LOSS:return b.DATA_LOSS;default:return F(39323,{code:n})}}(Z=Te||(Te={}))[Z.OK=0]="OK",Z[Z.CANCELLED=1]="CANCELLED",Z[Z.UNKNOWN=2]="UNKNOWN",Z[Z.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Z[Z.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Z[Z.NOT_FOUND=5]="NOT_FOUND",Z[Z.ALREADY_EXISTS=6]="ALREADY_EXISTS",Z[Z.PERMISSION_DENIED=7]="PERMISSION_DENIED",Z[Z.UNAUTHENTICATED=16]="UNAUTHENTICATED",Z[Z.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Z[Z.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Z[Z.ABORTED=10]="ABORTED",Z[Z.OUT_OF_RANGE=11]="OUT_OF_RANGE",Z[Z.UNIMPLEMENTED=12]="UNIMPLEMENTED",Z[Z.INTERNAL=13]="INTERNAL",Z[Z.UNAVAILABLE=14]="UNAVAILABLE",Z[Z.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
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
 */function fC(){return new TextEncoder}/**
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
 */const pC=new pn([4294967295,4294967295],0);function kf(n){const e=fC().encode(n),t=new fg;return t.update(e),new Uint8Array(t.digest())}function Nf(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),s=e.getUint32(4,!0),r=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new pn([t,s],0),new pn([r,i],0)]}class iu{constructor(e,t,s){if(this.bitmap=e,this.padding=t,this.hashCount=s,t<0||t>=8)throw new Nr(`Invalid padding: ${t}`);if(s<0)throw new Nr(`Invalid hash count: ${s}`);if(e.length>0&&this.hashCount===0)throw new Nr(`Invalid hash count: ${s}`);if(e.length===0&&t!==0)throw new Nr(`Invalid padding when bitmap length is 0: ${t}`);this.ge=8*e.length-t,this.pe=pn.fromNumber(this.ge)}ye(e,t,s){let r=e.add(t.multiply(pn.fromNumber(s)));return r.compare(pC)===1&&(r=new pn([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;const t=kf(e),[s,r]=Nf(t);for(let i=0;i<this.hashCount;i++){const o=this.ye(s,r,i);if(!this.we(o))return!1}return!0}static create(e,t,s){const r=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new iu(i,r,t);return s.forEach((c=>o.insert(c))),o}insert(e){if(this.ge===0)return;const t=kf(e),[s,r]=Nf(t);for(let i=0;i<this.hashCount;i++){const o=this.ye(s,r,i);this.Se(o)}}Se(e){const t=Math.floor(e/8),s=e%8;this.bitmap[t]|=1<<s}}class Nr extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Ei{constructor(e,t,s,r,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=s,this.documentUpdates=r,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,s){const r=new Map;return r.set(e,Ti.createSynthesizedTargetChangeForCurrentChange(e,t,s)),new Ei(U.min(),r,new ye(J),Kt(),X())}}class Ti{constructor(e,t,s,r,i){this.resumeToken=e,this.current=t,this.addedDocuments=s,this.modifiedDocuments=r,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,s){return new Ti(s,t,X(),X(),X())}}/**
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
 */class po{constructor(e,t,s,r){this.be=e,this.removedTargetIds=t,this.key=s,this.De=r}}class e_{constructor(e,t){this.targetId=e,this.Ce=t}}class t_{constructor(e,t,s=Le.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=t,this.resumeToken=s,this.cause=r}}class Df{constructor(){this.ve=0,this.Fe=Of(),this.Me=Le.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=X(),t=X(),s=X();return this.Fe.forEach(((r,i)=>{switch(i){case 0:e=e.add(r);break;case 2:t=t.add(r);break;case 1:s=s.add(r);break;default:F(38017,{changeType:i})}})),new Ti(this.Me,this.xe,e,t,s)}Ke(){this.Oe=!1,this.Fe=Of()}qe(e,t){this.Oe=!0,this.Fe=this.Fe.insert(e,t)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,ee(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}}class mC{constructor(e){this.Ge=e,this.ze=new Map,this.je=Kt(),this.Je=Zi(),this.He=Zi(),this.Ze=new ye(J)}Xe(e){for(const t of e.be)e.De&&e.De.isFoundDocument()?this.Ye(t,e.De):this.et(t,e.key,e.De);for(const t of e.removedTargetIds)this.et(t,e.key,e.De)}tt(e){this.forEachTarget(e,(t=>{const s=this.nt(t);switch(e.state){case 0:this.rt(t)&&s.Le(e.resumeToken);break;case 1:s.We(),s.Ne||s.Ke(),s.Le(e.resumeToken);break;case 2:s.We(),s.Ne||this.removeTarget(t);break;case 3:this.rt(t)&&(s.Qe(),s.Le(e.resumeToken));break;case 4:this.rt(t)&&(this.it(t),s.Le(e.resumeToken));break;default:F(56790,{state:e.state})}}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.ze.forEach(((s,r)=>{this.rt(r)&&t(r)}))}st(e){const t=e.targetId,s=e.Ce.count,r=this.ot(t);if(r){const i=r.target;if(Qc(i))if(s===0){const o=new L(i.path);this.et(t,o,De.newNoDocument(o,U.min()))}else ee(s===1,20013,{expectedCount:s});else{const o=this._t(t);if(o!==s){const c=this.ut(e),l=c?this.ct(c,e,o):1;if(l!==0){this.it(t);const u=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(t,u)}}}}}ut(e){const t=e.Ce.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:s="",padding:r=0},hashCount:i=0}=t;let o,c;try{o=In(s).toUint8Array()}catch(l){if(l instanceof Ag)return Zn("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{c=new iu(o,r,i)}catch(l){return Zn(l instanceof Nr?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return c.ge===0?null:c}ct(e,t,s){return t.Ce.count===s-this.Pt(e,t.targetId)?0:2}Pt(e,t){const s=this.Ge.getRemoteKeysForTarget(t);let r=0;return s.forEach((i=>{const o=this.Ge.ht(),c=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(c)||(this.et(t,i,null),r++)})),r}Tt(e){const t=new Map;this.ze.forEach(((i,o)=>{const c=this.ot(o);if(c){if(i.current&&Qc(c.target)){const l=new L(c.target.path);this.It(l).has(o)||this.Et(o,l)||this.et(o,l,De.newNoDocument(l,e))}i.Be&&(t.set(o,i.ke()),i.Ke())}}));let s=X();this.He.forEach(((i,o)=>{let c=!0;o.forEachWhile((l=>{const u=this.ot(l);return!u||u.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)})),c&&(s=s.add(i))})),this.je.forEach(((i,o)=>o.setReadTime(e)));const r=new Ei(e,t,this.Ze,this.je,s);return this.je=Kt(),this.Je=Zi(),this.He=Zi(),this.Ze=new ye(J),r}Ye(e,t){if(!this.rt(e))return;const s=this.Et(e,t.key)?2:0;this.nt(e).qe(t.key,s),this.je=this.je.insert(t.key,t),this.Je=this.Je.insert(t.key,this.It(t.key).add(e)),this.He=this.He.insert(t.key,this.Rt(t.key).add(e))}et(e,t,s){if(!this.rt(e))return;const r=this.nt(e);this.Et(e,t)?r.qe(t,1):r.Ue(t),this.He=this.He.insert(t,this.Rt(t).delete(e)),this.He=this.He.insert(t,this.Rt(t).add(e)),s&&(this.je=this.je.insert(t,s))}removeTarget(e){this.ze.delete(e)}_t(e){const t=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let t=this.ze.get(e);return t||(t=new Df,this.ze.set(e,t)),t}Rt(e){let t=this.He.get(e);return t||(t=new Se(J),this.He=this.He.insert(e,t)),t}It(e){let t=this.Je.get(e);return t||(t=new Se(J),this.Je=this.Je.insert(e,t)),t}rt(e){const t=this.ot(e)!==null;return t||M("WatchChangeAggregator","Detected inactive target",e),t}ot(e){const t=this.ze.get(e);return t&&t.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new Df),this.Ge.getRemoteKeysForTarget(e).forEach((t=>{this.et(e,t,null)}))}Et(e,t){return this.Ge.getRemoteKeysForTarget(e).has(t)}}function Zi(){return new ye(L.comparator)}function Of(){return new ye(L.comparator)}const gC={asc:"ASCENDING",desc:"DESCENDING"},_C={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},yC={and:"AND",or:"OR"};class EC{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Jc(n,e){return n.useProto3Json||gi(e)?e:{value:e}}function Mo(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function n_(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function TC(n,e){return Mo(n,e.toTimestamp())}function at(n){return ee(!!n,49232),U.fromTimestamp((function(t){const s=wn(t);return new le(s.seconds,s.nanos)})(n))}function ou(n,e){return Xc(n,e).canonicalString()}function Xc(n,e){const t=(function(r){return new se(["projects",r.projectId,"databases",r.database])})(n).child("documents");return e===void 0?t:t.child(e)}function s_(n){const e=se.fromString(n);return ee(l_(e),10190,{key:e.toString()}),e}function xo(n,e){return ou(n.databaseId,e.path)}function Fr(n,e){const t=s_(e);if(t.get(1)!==n.databaseId.projectId)throw new O(b.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new O(b.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new L(i_(t))}function r_(n,e){return ou(n.databaseId,e)}function wC(n){const e=s_(n);return e.length===4?se.emptyPath():i_(e)}function Zc(n){return new se(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function i_(n){return ee(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function Vf(n,e,t){return{name:xo(n,e),fields:t.value.mapValue.fields}}function IC(n,e){return"found"in e?(function(s,r){ee(!!r.found,43571),r.found.name,r.found.updateTime;const i=Fr(s,r.found.name),o=at(r.found.updateTime),c=r.found.createTime?at(r.found.createTime):U.min(),l=new Ke({mapValue:{fields:r.found.fields}});return De.newFoundDocument(i,o,c,l)})(n,e):"missing"in e?(function(s,r){ee(!!r.missing,3894),ee(!!r.readTime,22933);const i=Fr(s,r.missing),o=at(r.readTime);return De.newNoDocument(i,o)})(n,e):F(7234,{result:e})}function vC(n,e){let t;if("targetChange"in e){e.targetChange;const s=(function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:F(39313,{state:u})})(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],i=(function(u,f){return u.useProto3Json?(ee(f===void 0||typeof f=="string",58123),Le.fromBase64String(f||"")):(ee(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),Le.fromUint8Array(f||new Uint8Array))})(n,e.targetChange.resumeToken),o=e.targetChange.cause,c=o&&(function(u){const f=u.code===void 0?b.UNKNOWN:Zg(u.code);return new O(f,u.message||"")})(o);t=new t_(s,r,i,c||null)}else if("documentChange"in e){e.documentChange;const s=e.documentChange;s.document,s.document.name,s.document.updateTime;const r=Fr(n,s.document.name),i=at(s.document.updateTime),o=s.document.createTime?at(s.document.createTime):U.min(),c=new Ke({mapValue:{fields:s.document.fields}}),l=De.newFoundDocument(r,i,o,c),u=s.targetIds||[],f=s.removedTargetIds||[];t=new po(u,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;const s=e.documentDelete;s.document;const r=Fr(n,s.document),i=s.readTime?at(s.readTime):U.min(),o=De.newNoDocument(r,i),c=s.removedTargetIds||[];t=new po([],c,o.key,o)}else if("documentRemove"in e){e.documentRemove;const s=e.documentRemove;s.document;const r=Fr(n,s.document),i=s.removedTargetIds||[];t=new po([],i,r,null)}else{if(!("filter"in e))return F(11601,{Vt:e});{e.filter;const s=e.filter;s.targetId;const{count:r=0,unchangedNames:i}=s,o=new dC(r,i),c=s.targetId;t=new e_(c,o)}}return t}function o_(n,e){let t;if(e instanceof _i)t={update:Vf(n,e.key,e.value)};else if(e instanceof yi)t={delete:xo(n,e.key)};else if(e instanceof Nn)t={update:Vf(n,e.key,e.data),updateMask:DC(e.fieldMask)};else{if(!(e instanceof Jg))return F(16599,{dt:e.type});t={verify:xo(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((s=>(function(i,o){const c=o.transform;if(c instanceof ni)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Ls)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Fs)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Vo)return{fieldPath:o.field.canonicalString(),increment:c.Ae};throw F(20930,{transform:o.transform})})(0,s)))),e.precondition.isNone||(t.currentDocument=(function(r,i){return i.updateTime!==void 0?{updateTime:TC(r,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:F(27497)})(n,e.precondition)),t}function AC(n,e){return n&&n.length>0?(ee(e!==void 0,14353),n.map((t=>(function(r,i){let o=r.updateTime?at(r.updateTime):at(i);return o.isEqual(U.min())&&(o=at(i)),new aC(o,r.transformResults||[])})(t,e)))):[]}function RC(n,e){return{documents:[r_(n,e.path)]}}function CC(n,e){const t={structuredQuery:{}},s=e.path;let r;e.collectionGroup!==null?(r=s,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=s.popLast(),t.structuredQuery.from=[{collectionId:s.lastSegment()}]),t.parent=r_(n,r);const i=(function(u){if(u.length!==0)return c_(Tt.create(u,"and"))})(e.filters);i&&(t.structuredQuery.where=i);const o=(function(u){if(u.length!==0)return u.map((f=>(function(m){return{field:Ts(m.field),direction:PC(m.dir)}})(f)))})(e.orderBy);o&&(t.structuredQuery.orderBy=o);const c=Jc(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=(function(u){return{before:u.inclusive,values:u.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(u){return{before:!u.inclusive,values:u.position}})(e.endAt)),{ft:t,parent:r}}function SC(n){let e=wC(n.parent);const t=n.structuredQuery,s=t.from?t.from.length:0;let r=null;if(s>0){ee(s===1,65062);const f=t.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=(function(p){const m=a_(p);return m instanceof Tt&&Vg(m)?m.getFilters():[m]})(t.where));let o=[];t.orderBy&&(o=(function(p){return p.map((m=>(function(S){return new ti(ws(S.field),(function(N){switch(N){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(S.direction))})(m)))})(t.orderBy));let c=null;t.limit&&(c=(function(p){let m;return m=typeof p=="object"?p.value:p,gi(m)?null:m})(t.limit));let l=null;t.startAt&&(l=(function(p){const m=!!p.before,T=p.values||[];return new Do(T,m)})(t.startAt));let u=null;return t.endAt&&(u=(function(p){const m=!p.before,T=p.values||[];return new Do(T,m)})(t.endAt)),GR(e,r,o,i,c,"F",l,u)}function bC(n,e){const t=(function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return F(28987,{purpose:r})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function a_(n){return n.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const s=ws(t.unaryFilter.field);return Ie.create(s,"==",{doubleValue:NaN});case"IS_NULL":const r=ws(t.unaryFilter.field);return Ie.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=ws(t.unaryFilter.field);return Ie.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=ws(t.unaryFilter.field);return Ie.create(o,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return F(61313);default:return F(60726)}})(n):n.fieldFilter!==void 0?(function(t){return Ie.create(ws(t.fieldFilter.field),(function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return F(58110);default:return F(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(n):n.compositeFilter!==void 0?(function(t){return Tt.create(t.compositeFilter.filters.map((s=>a_(s))),(function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return F(1026)}})(t.compositeFilter.op))})(n):F(30097,{filter:n})}function PC(n){return gC[n]}function kC(n){return _C[n]}function NC(n){return yC[n]}function Ts(n){return{fieldPath:n.canonicalString()}}function ws(n){return xe.fromServerFormat(n.fieldPath)}function c_(n){return n instanceof Ie?(function(t){if(t.op==="=="){if(wf(t.value))return{unaryFilter:{field:Ts(t.field),op:"IS_NAN"}};if(Tf(t.value))return{unaryFilter:{field:Ts(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(wf(t.value))return{unaryFilter:{field:Ts(t.field),op:"IS_NOT_NAN"}};if(Tf(t.value))return{unaryFilter:{field:Ts(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ts(t.field),op:kC(t.op),value:t.value}}})(n):n instanceof Tt?(function(t){const s=t.getFilters().map((r=>c_(r)));return s.length===1?s[0]:{compositeFilter:{op:NC(t.op),filters:s}}})(n):F(54877,{filter:n})}function DC(n){const e=[];return n.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function l_(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}function u_(n){return!!n&&typeof n._toProto=="function"&&n._protoValueType==="ProtoValue"}/**
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
 */class Bt{constructor(e,t,s,r,i=U.min(),o=U.min(),c=Le.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=t,this.purpose=s,this.sequenceNumber=r,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=c,this.expectedCount=l}withSequenceNumber(e){return new Bt(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Bt(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Bt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Bt(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class OC{constructor(e){this.yt=e}}function VC(n){const e=SC({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Oo(e,e.limit,"L"):e}/**
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
 */class MC{constructor(){this.bn=new xC}addToCollectionParentIndex(e,t){return this.bn.add(t),P.resolve()}getCollectionParents(e,t){return P.resolve(this.bn.getEntries(t))}addFieldIndex(e,t){return P.resolve()}deleteFieldIndex(e,t){return P.resolve()}deleteAllFieldIndexes(e){return P.resolve()}createTargetIndexes(e,t){return P.resolve()}getDocumentsMatchingTarget(e,t){return P.resolve(null)}getIndexType(e,t){return P.resolve(0)}getFieldIndexes(e,t){return P.resolve([])}getNextCollectionGroupToUpdate(e){return P.resolve(null)}getMinOffset(e,t){return P.resolve(Tn.min())}getMinOffsetFromCollectionGroup(e,t){return P.resolve(Tn.min())}updateCollectionGroup(e,t,s){return P.resolve()}updateIndexEntries(e,t){return P.resolve()}}class xC{constructor(){this.index={}}add(e){const t=e.lastSegment(),s=e.popLast(),r=this.index[t]||new Se(se.comparator),i=!r.has(s);return this.index[t]=r.add(s),i}has(e){const t=e.lastSegment(),s=e.popLast(),r=this.index[t];return r&&r.has(s)}getEntries(e){return(this.index[e]||new Se(se.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
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
 */const Mf={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},h_=41943040;class Ye{static withCacheSize(e){return new Ye(e,Ye.DEFAULT_COLLECTION_PERCENTILE,Ye.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,s){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=s}}/**
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
 */Ye.DEFAULT_COLLECTION_PERCENTILE=10,Ye.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Ye.DEFAULT=new Ye(h_,Ye.DEFAULT_COLLECTION_PERCENTILE,Ye.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Ye.DISABLED=new Ye(-1,0,0);/**
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
 */class An{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new An(0)}static ar(){return new An(-1)}}/**
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
 */const xf="LruGarbageCollector",LC=1048576;function Lf([n,e],[t,s]){const r=J(n,t);return r===0?J(e,s):r}class FC{constructor(e){this.Pr=e,this.buffer=new Se(Lf),this.Tr=0}Ir(){return++this.Tr}Er(e){const t=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(t);else{const s=this.buffer.last();Lf(t,s)<0&&(this.buffer=this.buffer.delete(s).add(t))}}get maxValue(){return this.buffer.last()[0]}}class UC{constructor(e,t,s){this.garbageCollector=e,this.asyncQueue=t,this.localStore=s,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){M(xf,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Js(t)?M(xf,"Ignoring IndexedDB error during garbage collection: ",t):await Ys(t)}await this.Ar(3e5)}))}}class BC{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.dr(e).next((s=>Math.floor(t/100*s)))}nthSequenceNumber(e,t){if(t===0)return P.resolve(ga.ce);const s=new FC(t);return this.Vr.forEachTarget(e,(r=>s.Er(r.sequenceNumber))).next((()=>this.Vr.mr(e,(r=>s.Er(r))))).next((()=>s.maxValue))}removeTargets(e,t,s){return this.Vr.removeTargets(e,t,s)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(M("LruGarbageCollector","Garbage collection skipped; disabled"),P.resolve(Mf)):this.getCacheSize(e).next((s=>s<this.params.cacheSizeCollectionThreshold?(M("LruGarbageCollector",`Garbage collection skipped; Cache size ${s} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Mf):this.gr(e,t)))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,t){let s,r,i,o,c,l,u;const f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((p=>(p>this.params.maximumSequenceNumbersToCollect?(M("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),r=this.params.maximumSequenceNumbersToCollect):r=p,o=Date.now(),this.nthSequenceNumber(e,r)))).next((p=>(s=p,c=Date.now(),this.removeTargets(e,s,t)))).next((p=>(i=p,l=Date.now(),this.removeOrphanedDocuments(e,s)))).next((p=>(u=Date.now(),ys()<=Y.DEBUG&&M("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-f}ms
	Determined least recently used ${r} in `+(c-o)+`ms
	Removed ${i} targets in `+(l-c)+`ms
	Removed ${p} documents in `+(u-l)+`ms
Total Duration: ${u-f}ms`),P.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:i,documentsRemoved:p}))))}}function qC(n,e){return new BC(n,e)}/**
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
 */class $C{constructor(){this.changes=new cs((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,De.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const s=this.changes.get(t);return s!==void 0?P.resolve(s):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 *//**
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
 */class WC{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
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
 */class jC{constructor(e,t,s,r){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=s,this.indexManager=r}getDocument(e,t){let s=null;return this.documentOverlayCache.getOverlay(e,t).next((r=>(s=r,this.remoteDocumentCache.getEntry(e,t)))).next((r=>(s!==null&&Lr(s.mutation,r,it.empty(),le.now()),r)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((s=>this.getLocalViewOfDocuments(e,s,X()).next((()=>s))))}getLocalViewOfDocuments(e,t,s=X()){const r=jn();return this.populateOverlays(e,r,t).next((()=>this.computeViews(e,t,r,s).next((i=>{let o=kr();return i.forEach(((c,l)=>{o=o.insert(c,l.overlayedDocument)})),o}))))}getOverlayedDocuments(e,t){const s=jn();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,X())))}populateOverlays(e,t,s){const r=[];return s.forEach((i=>{t.has(i)||r.push(i)})),this.documentOverlayCache.getOverlays(e,r).next((i=>{i.forEach(((o,c)=>{t.set(o,c)}))}))}computeViews(e,t,s,r){let i=Kt();const o=xr(),c=(function(){return xr()})();return t.forEach(((l,u)=>{const f=s.get(u.key);r.has(u.key)&&(f===void 0||f.mutation instanceof Nn)?i=i.insert(u.key,u):f!==void 0?(o.set(u.key,f.mutation.getFieldMask()),Lr(f.mutation,u,f.mutation.getFieldMask(),le.now())):o.set(u.key,it.empty())})),this.recalculateAndSaveOverlays(e,i).next((l=>(l.forEach(((u,f)=>o.set(u,f))),t.forEach(((u,f)=>c.set(u,new WC(f,o.get(u)??null)))),c)))}recalculateAndSaveOverlays(e,t){const s=xr();let r=new ye(((o,c)=>o-c)),i=X();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((o=>{for(const c of o)c.keys().forEach((l=>{const u=t.get(l);if(u===null)return;let f=s.get(l)||it.empty();f=c.applyToLocalView(u,f),s.set(l,f);const p=(r.get(c.batchId)||X()).add(l);r=r.insert(c.batchId,p)}))})).next((()=>{const o=[],c=r.getReverseIterator();for(;c.hasNext();){const l=c.getNext(),u=l.key,f=l.value,p=Wg();f.forEach((m=>{if(!i.has(m)){const T=Qg(t.get(m),s.get(m));T!==null&&p.set(m,T),i=i.add(m)}})),o.push(this.documentOverlayCache.saveOverlays(e,u,p))}return P.waitFor(o)})).next((()=>s))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((s=>this.recalculateAndSaveOverlays(e,s)))}getDocumentsMatchingQuery(e,t,s,r){return zR(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Fg(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,s,r):this.getDocumentsMatchingCollectionQuery(e,t,s,r)}getNextDocuments(e,t,s,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,s,r).next((i=>{const o=r-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,s.largestBatchId,r-i.size):P.resolve(jn());let c=Jr,l=i;return o.next((u=>P.forEach(u,((f,p)=>(c<p.largestBatchId&&(c=p.largestBatchId),i.get(f)?P.resolve():this.remoteDocumentCache.getEntry(e,f).next((m=>{l=l.insert(f,m)}))))).next((()=>this.populateOverlays(e,u,i))).next((()=>this.computeViews(e,l,u,X()))).next((f=>({batchId:c,changes:$g(f)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new L(t)).next((s=>{let r=kr();return s.isFoundDocument()&&(r=r.insert(s.key,s)),r}))}getDocumentsMatchingCollectionGroupQuery(e,t,s,r){const i=t.collectionGroup;let o=kr();return this.indexManager.getCollectionParents(e,i).next((c=>P.forEach(c,(l=>{const u=(function(p,m){return new as(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)})(t,l.child(i));return this.getDocumentsMatchingCollectionQuery(e,u,s,r).next((f=>{f.forEach(((p,m)=>{o=o.insert(p,m)}))}))})).next((()=>o))))}getDocumentsMatchingCollectionQuery(e,t,s,r){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,s.largestBatchId).next((o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,s,i,r)))).next((o=>{i.forEach(((l,u)=>{const f=u.getKey();o.get(f)===null&&(o=o.insert(f,De.newInvalidDocument(f)))}));let c=kr();return o.forEach(((l,u)=>{const f=i.get(l);f!==void 0&&Lr(f.mutation,u,it.empty(),le.now()),Ta(t,u)&&(c=c.insert(l,u))})),c}))}}/**
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
 */class HC{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,t){return P.resolve(this.Nr.get(t))}saveBundleMetadata(e,t){return this.Nr.set(t.id,(function(r){return{id:r.id,version:r.version,createTime:at(r.createTime)}})(t)),P.resolve()}getNamedQuery(e,t){return P.resolve(this.Br.get(t))}saveNamedQuery(e,t){return this.Br.set(t.name,(function(r){return{name:r.name,query:VC(r.bundledQuery),readTime:at(r.readTime)}})(t)),P.resolve()}}/**
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
 */class GC{constructor(){this.overlays=new ye(L.comparator),this.Lr=new Map}getOverlay(e,t){return P.resolve(this.overlays.get(t))}getOverlays(e,t){const s=jn();return P.forEach(t,(r=>this.getOverlay(e,r).next((i=>{i!==null&&s.set(r,i)})))).next((()=>s))}saveOverlays(e,t,s){return s.forEach(((r,i)=>{this.St(e,t,i)})),P.resolve()}removeOverlaysForBatchId(e,t,s){const r=this.Lr.get(s);return r!==void 0&&(r.forEach((i=>this.overlays=this.overlays.remove(i))),this.Lr.delete(s)),P.resolve()}getOverlaysForCollection(e,t,s){const r=jn(),i=t.length+1,o=new L(t.child("")),c=this.overlays.getIteratorFrom(o);for(;c.hasNext();){const l=c.getNext().value,u=l.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===i&&l.largestBatchId>s&&r.set(l.getKey(),l)}return P.resolve(r)}getOverlaysForCollectionGroup(e,t,s,r){let i=new ye(((u,f)=>u-f));const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>s){let f=i.get(u.largestBatchId);f===null&&(f=jn(),i=i.insert(u.largestBatchId,f)),f.set(u.getKey(),u)}}const c=jn(),l=i.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach(((u,f)=>c.set(u,f))),!(c.size()>=r)););return P.resolve(c)}St(e,t,s){const r=this.overlays.get(s.key);if(r!==null){const o=this.Lr.get(r.largestBatchId).delete(s.key);this.Lr.set(r.largestBatchId,o)}this.overlays=this.overlays.insert(s.key,new hC(t,s));let i=this.Lr.get(t);i===void 0&&(i=X(),this.Lr.set(t,i)),this.Lr.set(t,i.add(s.key))}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class zC{constructor(){this.sessionToken=Le.EMPTY_BYTE_STRING}getSessionToken(e){return P.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,P.resolve()}}/**
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
 */class au{constructor(){this.kr=new Se(ke.Kr),this.qr=new Se(ke.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,t){const s=new ke(e,t);this.kr=this.kr.add(s),this.qr=this.qr.add(s)}$r(e,t){e.forEach((s=>this.addReference(s,t)))}removeReference(e,t){this.Wr(new ke(e,t))}Qr(e,t){e.forEach((s=>this.removeReference(s,t)))}Gr(e){const t=new L(new se([])),s=new ke(t,e),r=new ke(t,e+1),i=[];return this.qr.forEachInRange([s,r],(o=>{this.Wr(o),i.push(o.key)})),i}zr(){this.kr.forEach((e=>this.Wr(e)))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){const t=new L(new se([])),s=new ke(t,e),r=new ke(t,e+1);let i=X();return this.qr.forEachInRange([s,r],(o=>{i=i.add(o.key)})),i}containsKey(e){const t=new ke(e,0),s=this.kr.firstAfterOrEqual(t);return s!==null&&e.isEqual(s.key)}}class ke{constructor(e,t){this.key=e,this.Jr=t}static Kr(e,t){return L.comparator(e.key,t.key)||J(e.Jr,t.Jr)}static Ur(e,t){return J(e.Jr,t.Jr)||L.comparator(e.key,t.key)}}/**
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
 */class KC{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Yn=1,this.Hr=new Se(ke.Kr)}checkEmpty(e){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,s,r){const i=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new uC(i,t,s,r);this.mutationQueue.push(o);for(const c of r)this.Hr=this.Hr.add(new ke(c.key,i)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return P.resolve(o)}lookupMutationBatch(e,t){return P.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const s=t+1,r=this.Xr(s),i=r<0?0:r;return P.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?Jl:this.Yn-1)}getAllMutationBatches(e){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const s=new ke(t,0),r=new ke(t,Number.POSITIVE_INFINITY),i=[];return this.Hr.forEachInRange([s,r],(o=>{const c=this.Zr(o.Jr);i.push(c)})),P.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let s=new Se(J);return t.forEach((r=>{const i=new ke(r,0),o=new ke(r,Number.POSITIVE_INFINITY);this.Hr.forEachInRange([i,o],(c=>{s=s.add(c.Jr)}))})),P.resolve(this.Yr(s))}getAllMutationBatchesAffectingQuery(e,t){const s=t.path,r=s.length+1;let i=s;L.isDocumentKey(i)||(i=i.child(""));const o=new ke(new L(i),0);let c=new Se(J);return this.Hr.forEachWhile((l=>{const u=l.key.path;return!!s.isPrefixOf(u)&&(u.length===r&&(c=c.add(l.Jr)),!0)}),o),P.resolve(this.Yr(c))}Yr(e){const t=[];return e.forEach((s=>{const r=this.Zr(s);r!==null&&t.push(r)})),t}removeMutationBatch(e,t){ee(this.ei(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let s=this.Hr;return P.forEach(t.mutations,(r=>{const i=new ke(r.key,t.batchId);return s=s.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)})).next((()=>{this.Hr=s}))}nr(e){}containsKey(e,t){const s=new ke(t,0),r=this.Hr.firstAfterOrEqual(s);return P.resolve(t.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,P.resolve()}ei(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class QC{constructor(e){this.ti=e,this.docs=(function(){return new ye(L.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const s=t.key,r=this.docs.get(s),i=r?r.size:0,o=this.ti(t);return this.docs=this.docs.insert(s,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,s.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const s=this.docs.get(t);return P.resolve(s?s.document.mutableCopy():De.newInvalidDocument(t))}getEntries(e,t){let s=Kt();return t.forEach((r=>{const i=this.docs.get(r);s=s.insert(r,i?i.document.mutableCopy():De.newInvalidDocument(r))})),P.resolve(s)}getDocumentsMatchingQuery(e,t,s,r){let i=Kt();const o=t.path,c=new L(o.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(c);for(;l.hasNext();){const{key:u,value:{document:f}}=l.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||vR(IR(f),s)<=0||(r.has(f.key)||Ta(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return P.resolve(i)}getAllFromCollectionGroup(e,t,s,r){F(9500)}ni(e,t){return P.forEach(this.docs,(s=>t(s)))}newChangeBuffer(e){return new YC(this)}getSize(e){return P.resolve(this.size)}}class YC extends $C{constructor(e){super(),this.Mr=e}applyChanges(e){const t=[];return this.changes.forEach(((s,r)=>{r.isValidDocument()?t.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(s)})),P.waitFor(t)}getFromCache(e,t){return this.Mr.getEntry(e,t)}getAllFromCache(e,t){return this.Mr.getEntries(e,t)}}/**
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
 */class JC{constructor(e){this.persistence=e,this.ri=new cs((t=>eu(t)),tu),this.lastRemoteSnapshotVersion=U.min(),this.highestTargetId=0,this.ii=0,this.si=new au,this.targetCount=0,this.oi=An._r()}forEachTarget(e,t){return this.ri.forEach(((s,r)=>t(r))),P.resolve()}getLastRemoteSnapshotVersion(e){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return P.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(e,t,s){return s&&(this.lastRemoteSnapshotVersion=s),t>this.ii&&(this.ii=t),P.resolve()}lr(e){this.ri.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.oi=new An(t),this.highestTargetId=t),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,t){return this.lr(t),this.targetCount+=1,P.resolve()}updateTargetData(e,t){return this.lr(t),P.resolve()}removeTargetData(e,t){return this.ri.delete(t.target),this.si.Gr(t.targetId),this.targetCount-=1,P.resolve()}removeTargets(e,t,s){let r=0;const i=[];return this.ri.forEach(((o,c)=>{c.sequenceNumber<=t&&s.get(c.targetId)===null&&(this.ri.delete(o),i.push(this.removeMatchingKeysForTargetId(e,c.targetId)),r++)})),P.waitFor(i).next((()=>r))}getTargetCount(e){return P.resolve(this.targetCount)}getTargetData(e,t){const s=this.ri.get(t)||null;return P.resolve(s)}addMatchingKeys(e,t,s){return this.si.$r(t,s),P.resolve()}removeMatchingKeys(e,t,s){this.si.Qr(t,s);const r=this.persistence.referenceDelegate,i=[];return r&&t.forEach((o=>{i.push(r.markPotentiallyOrphaned(e,o))})),P.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.si.Gr(t),P.resolve()}getMatchingKeysForTargetId(e,t){const s=this.si.jr(t);return P.resolve(s)}containsKey(e,t){return P.resolve(this.si.containsKey(t))}}/**
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
 */class d_{constructor(e,t){this._i={},this.overlays={},this.ai=new ga(0),this.ui=!1,this.ui=!0,this.ci=new zC,this.referenceDelegate=e(this),this.li=new JC(this),this.indexManager=new MC,this.remoteDocumentCache=(function(r){return new QC(r)})((s=>this.referenceDelegate.hi(s))),this.serializer=new OC(t),this.Pi=new HC(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new GC,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let s=this._i[e.toKey()];return s||(s=new KC(t,this.referenceDelegate),this._i[e.toKey()]=s),s}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,t,s){M("MemoryPersistence","Starting transaction:",e);const r=new XC(this.ai.next());return this.referenceDelegate.Ti(),s(r).next((i=>this.referenceDelegate.Ii(r).next((()=>i)))).toPromise().then((i=>(r.raiseOnCommittedEvent(),i)))}Ei(e,t){return P.or(Object.values(this._i).map((s=>()=>s.containsKey(e,t))))}}class XC extends RR{constructor(e){super(),this.currentSequenceNumber=e}}class cu{constructor(e){this.persistence=e,this.Ri=new au,this.Ai=null}static Vi(e){return new cu(e)}get di(){if(this.Ai)return this.Ai;throw F(60996)}addReference(e,t,s){return this.Ri.addReference(s,t),this.di.delete(s.toString()),P.resolve()}removeReference(e,t,s){return this.Ri.removeReference(s,t),this.di.add(s.toString()),P.resolve()}markPotentiallyOrphaned(e,t){return this.di.add(t.toString()),P.resolve()}removeTarget(e,t){this.Ri.Gr(t.targetId).forEach((r=>this.di.add(r.toString())));const s=this.persistence.getTargetCache();return s.getMatchingKeysForTargetId(e,t.targetId).next((r=>{r.forEach((i=>this.di.add(i.toString())))})).next((()=>s.removeTargetData(e,t)))}Ti(){this.Ai=new Set}Ii(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.di,(s=>{const r=L.fromPath(s);return this.mi(e,r).next((i=>{i||t.removeEntry(r,U.min())}))})).next((()=>(this.Ai=null,t.apply(e))))}updateLimboDocument(e,t){return this.mi(e,t).next((s=>{s?this.di.delete(t.toString()):this.di.add(t.toString())}))}hi(e){return 0}mi(e,t){return P.or([()=>P.resolve(this.Ri.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ei(e,t)])}}class Lo{constructor(e,t){this.persistence=e,this.fi=new cs((s=>bR(s.path)),((s,r)=>s.isEqual(r))),this.garbageCollector=qC(this,t)}static Vi(e,t){return new Lo(e,t)}Ti(){}Ii(e){return P.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}dr(e){const t=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next((s=>t.next((r=>s+r))))}pr(e){let t=0;return this.mr(e,(s=>{t++})).next((()=>t))}mr(e,t){return P.forEach(this.fi,((s,r)=>this.wr(e,s,r).next((i=>i?P.resolve():t(r)))))}removeTargets(e,t,s){return this.persistence.getTargetCache().removeTargets(e,t,s)}removeOrphanedDocuments(e,t){let s=0;const r=this.persistence.getRemoteDocumentCache(),i=r.newChangeBuffer();return r.ni(e,(o=>this.wr(e,o,t).next((c=>{c||(s++,i.removeEntry(o,U.min()))})))).next((()=>i.apply(e))).next((()=>s))}markPotentiallyOrphaned(e,t){return this.fi.set(t,e.currentSequenceNumber),P.resolve()}removeTarget(e,t){const s=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,s)}addReference(e,t,s){return this.fi.set(s,e.currentSequenceNumber),P.resolve()}removeReference(e,t,s){return this.fi.set(s,e.currentSequenceNumber),P.resolve()}updateLimboDocument(e,t){return this.fi.set(t,e.currentSequenceNumber),P.resolve()}hi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=uo(e.data.value)),t}wr(e,t,s){return P.or([()=>this.persistence.Ei(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const r=this.fi.get(t);return P.resolve(r!==void 0&&r>s)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
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
 */class lu{constructor(e,t,s,r){this.targetId=e,this.fromCache=t,this.Ts=s,this.Is=r}static Es(e,t){let s=X(),r=X();for(const i of t.docChanges)switch(i.type){case 0:s=s.add(i.doc.key);break;case 1:r=r.add(i.doc.key)}return new lu(e,t.fromCache,s,r)}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */class ZC{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class eS{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=(function(){return uT()?8:CR(We())>0?6:4})()}initialize(e,t){this.fs=e,this.indexManager=t,this.Rs=!0}getDocumentsMatchingQuery(e,t,s,r){const i={result:null};return this.gs(e,t).next((o=>{i.result=o})).next((()=>{if(!i.result)return this.ps(e,t,r,s).next((o=>{i.result=o}))})).next((()=>{if(i.result)return;const o=new ZC;return this.ys(e,t,o).next((c=>{if(i.result=c,this.As)return this.ws(e,t,o,c.size)}))})).next((()=>i.result))}ws(e,t,s,r){return s.documentReadCount<this.Vs?(ys()<=Y.DEBUG&&M("QueryEngine","SDK will not create cache indexes for query:",Es(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),P.resolve()):(ys()<=Y.DEBUG&&M("QueryEngine","Query:",Es(t),"scans",s.documentReadCount,"local documents and returns",r,"documents as results."),s.documentReadCount>this.ds*r?(ys()<=Y.DEBUG&&M("QueryEngine","The SDK decides to create cache indexes for query:",Es(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Pt(t))):P.resolve())}gs(e,t){if(Rf(t))return P.resolve(null);let s=Pt(t);return this.indexManager.getIndexType(e,s).next((r=>r===0?null:(t.limit!==null&&r===1&&(t=Oo(t,null,"F"),s=Pt(t)),this.indexManager.getDocumentsMatchingTarget(e,s).next((i=>{const o=X(...i);return this.fs.getDocuments(e,o).next((c=>this.indexManager.getMinOffset(e,s).next((l=>{const u=this.Ss(t,c);return this.bs(t,u,o,l.readTime)?this.gs(e,Oo(t,null,"F")):this.Ds(e,u,t,l)}))))})))))}ps(e,t,s,r){return Rf(t)||r.isEqual(U.min())?P.resolve(null):this.fs.getDocuments(e,s).next((i=>{const o=this.Ss(t,i);return this.bs(t,o,s,r)?P.resolve(null):(ys()<=Y.DEBUG&&M("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),Es(t)),this.Ds(e,o,t,wR(r,Jr)).next((c=>c)))}))}Ss(e,t){let s=new Se(Bg(e));return t.forEach(((r,i)=>{Ta(e,i)&&(s=s.add(i))})),s}bs(e,t,s,r){if(e.limit===null)return!1;if(s.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(r)>0)}ys(e,t,s){return ys()<=Y.DEBUG&&M("QueryEngine","Using full collection scan to execute query:",Es(t)),this.fs.getDocumentsMatchingQuery(e,t,Tn.min(),s)}Ds(e,t,s,r){return this.fs.getDocumentsMatchingQuery(e,s,r).next((i=>(t.forEach((o=>{i=i.insert(o.key,o)})),i)))}}/**
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
 */const uu="LocalStore",tS=3e8;class nS{constructor(e,t,s,r){this.persistence=e,this.Cs=t,this.serializer=r,this.vs=new ye(J),this.Fs=new cs((i=>eu(i)),tu),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(s)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new jC(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.vs)))}}function sS(n,e,t,s){return new nS(n,e,t,s)}async function f_(n,e){const t=q(n);return await t.persistence.runTransaction("Handle user change","readonly",(s=>{let r;return t.mutationQueue.getAllMutationBatches(s).next((i=>(r=i,t.Os(e),t.mutationQueue.getAllMutationBatches(s)))).next((i=>{const o=[],c=[];let l=X();for(const u of r){o.push(u.batchId);for(const f of u.mutations)l=l.add(f.key)}for(const u of i){c.push(u.batchId);for(const f of u.mutations)l=l.add(f.key)}return t.localDocuments.getDocuments(s,l).next((u=>({Ns:u,removedBatchIds:o,addedBatchIds:c})))}))}))}function rS(n,e){const t=q(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(s=>{const r=e.batch.keys(),i=t.xs.newChangeBuffer({trackRemovals:!0});return(function(c,l,u,f){const p=u.batch,m=p.keys();let T=P.resolve();return m.forEach((S=>{T=T.next((()=>f.getEntry(l,S))).next((k=>{const N=u.docVersions.get(S);ee(N!==null,48541),k.version.compareTo(N)<0&&(p.applyToRemoteDocument(k,u),k.isValidDocument()&&(k.setReadTime(u.commitVersion),f.addEntry(k)))}))})),T.next((()=>c.mutationQueue.removeMutationBatch(l,p)))})(t,s,e,i).next((()=>i.apply(s))).next((()=>t.mutationQueue.performConsistencyCheck(s))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(s,r,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(s,(function(c){let l=X();for(let u=0;u<c.mutationResults.length;++u)c.mutationResults[u].transformResults.length>0&&(l=l.add(c.batch.mutations[u].key));return l})(e)))).next((()=>t.localDocuments.getDocuments(s,r)))}))}function p_(n){const e=q(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.li.getLastRemoteSnapshotVersion(t)))}function iS(n,e){const t=q(n),s=e.snapshotVersion;let r=t.vs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(i=>{const o=t.xs.newChangeBuffer({trackRemovals:!0});r=t.vs;const c=[];e.targetChanges.forEach(((f,p)=>{const m=r.get(p);if(!m)return;c.push(t.li.removeMatchingKeys(i,f.removedDocuments,p).next((()=>t.li.addMatchingKeys(i,f.addedDocuments,p))));let T=m.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?T=T.withResumeToken(Le.EMPTY_BYTE_STRING,U.min()).withLastLimboFreeSnapshotVersion(U.min()):f.resumeToken.approximateByteSize()>0&&(T=T.withResumeToken(f.resumeToken,s)),r=r.insert(p,T),(function(k,N,$){return k.resumeToken.approximateByteSize()===0||N.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=tS?!0:$.addedDocuments.size+$.modifiedDocuments.size+$.removedDocuments.size>0})(m,T,f)&&c.push(t.li.updateTargetData(i,T))}));let l=Kt(),u=X();if(e.documentUpdates.forEach((f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))})),c.push(oS(i,o,e.documentUpdates).next((f=>{l=f.Bs,u=f.Ls}))),!s.isEqual(U.min())){const f=t.li.getLastRemoteSnapshotVersion(i).next((p=>t.li.setTargetsMetadata(i,i.currentSequenceNumber,s)));c.push(f)}return P.waitFor(c).next((()=>o.apply(i))).next((()=>t.localDocuments.getLocalViewOfDocuments(i,l,u))).next((()=>l))})).then((i=>(t.vs=r,i)))}function oS(n,e,t){let s=X(),r=X();return t.forEach((i=>s=s.add(i))),e.getEntries(n,s).next((i=>{let o=Kt();return t.forEach(((c,l)=>{const u=i.get(c);l.isFoundDocument()!==u.isFoundDocument()&&(r=r.add(c)),l.isNoDocument()&&l.version.isEqual(U.min())?(e.removeEntry(c,l.readTime),o=o.insert(c,l)):!u.isValidDocument()||l.version.compareTo(u.version)>0||l.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(l),o=o.insert(c,l)):M(uu,"Ignoring outdated watch update for ",c,". Current version:",u.version," Watch version:",l.version)})),{Bs:o,Ls:r}}))}function aS(n,e){const t=q(n);return t.persistence.runTransaction("Get next mutation batch","readonly",(s=>(e===void 0&&(e=Jl),t.mutationQueue.getNextMutationBatchAfterBatchId(s,e))))}function cS(n,e){const t=q(n);return t.persistence.runTransaction("Allocate target","readwrite",(s=>{let r;return t.li.getTargetData(s,e).next((i=>i?(r=i,P.resolve(r)):t.li.allocateTargetId(s).next((o=>(r=new Bt(e,o,"TargetPurposeListen",s.currentSequenceNumber),t.li.addTargetData(s,r).next((()=>r)))))))})).then((s=>{const r=t.vs.get(s.targetId);return(r===null||s.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(t.vs=t.vs.insert(s.targetId,s),t.Fs.set(e,s.targetId)),s}))}async function el(n,e,t){const s=q(n),r=s.vs.get(e),i=t?"readwrite":"readwrite-primary";try{t||await s.persistence.runTransaction("Release target",i,(o=>s.persistence.referenceDelegate.removeTarget(o,r)))}catch(o){if(!Js(o))throw o;M(uu,`Failed to update sequence numbers for target ${e}: ${o}`)}s.vs=s.vs.remove(e),s.Fs.delete(r.target)}function Ff(n,e,t){const s=q(n);let r=U.min(),i=X();return s.persistence.runTransaction("Execute query","readwrite",(o=>(function(l,u,f){const p=q(l),m=p.Fs.get(f);return m!==void 0?P.resolve(p.vs.get(m)):p.li.getTargetData(u,f)})(s,o,Pt(e)).next((c=>{if(c)return r=c.lastLimboFreeSnapshotVersion,s.li.getMatchingKeysForTargetId(o,c.targetId).next((l=>{i=l}))})).next((()=>s.Cs.getDocumentsMatchingQuery(o,e,t?r:U.min(),t?i:X()))).next((c=>(lS(s,YR(e),c),{documents:c,ks:i})))))}function lS(n,e,t){let s=n.Ms.get(e)||U.min();t.forEach(((r,i)=>{i.readTime.compareTo(s)>0&&(s=i.readTime)})),n.Ms.set(e,s)}class Uf{constructor(){this.activeTargetIds=nC()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class uS{constructor(){this.vo=new Uf,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,s){}addLocalQueryTarget(e,t=!0){return t&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,t,s){this.Fo[e]=t}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new Uf,Promise.resolve()}handleUserChange(e,t,s){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class hS{Mo(e){}shutdown(){}}/**
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
 */const Bf="ConnectivityMonitor";class qf{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){M(Bf,"Network connectivity changed: AVAILABLE");for(const e of this.Lo)e(0)}Bo(){M(Bf,"Network connectivity changed: UNAVAILABLE");for(const e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
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
 */let eo=null;function tl(){return eo===null?eo=(function(){return 268435456+Math.round(2147483648*Math.random())})():eo++,"0x"+eo.toString(16)}/**
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
 */const vc="RestConnection",dS={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"};class fS{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=t+"://"+e.host,this.Uo=`projects/${s}/databases/${r}`,this.$o=this.databaseId.database===ko?`project_id=${s}`:`project_id=${s}&database_id=${r}`}Wo(e,t,s,r,i){const o=tl(),c=this.Qo(e,t.toUriEncodedString());M(vc,`Sending RPC '${e}' ${o}:`,c,s);const l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,r,i);const{host:u}=new URL(c),f=wt(u);return this.zo(e,c,l,s,f).then((p=>(M(vc,`Received RPC '${e}' ${o}: `,p),p)),(p=>{throw Zn(vc,`RPC '${e}' ${o} failed with error: `,p,"url: ",c,"request:",s),p}))}jo(e,t,s,r,i,o){return this.Wo(e,t,s,r,i)}Go(e,t,s){e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+Qs})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((r,i)=>e[i]=r)),s&&s.headers.forEach(((r,i)=>e[i]=r))}Qo(e,t){const s=dS[e];let r=`${this.qo}/v1/${t}:${s}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}}/**
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
 */class pS{constructor(e){this.Jo=e.Jo,this.Ho=e.Ho}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Ho()}send(e){this.Jo(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}}/**
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
 */const Ue="WebChannelConnection",wr=(n,e,t)=>{n.listen(e,(s=>{try{t(s)}catch(r){setTimeout((()=>{throw r}),0)}}))};class Ss extends fS{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!Ss.c_){const e=_g();wr(e,gg.STAT_EVENT,(t=>{t.stat===Wc.PROXY?M(Ue,"STAT_EVENT: detected buffering proxy"):t.stat===Wc.NOPROXY&&M(Ue,"STAT_EVENT: detected no buffering proxy")})),Ss.c_=!0}}zo(e,t,s,r,i){const o=tl();return new Promise(((c,l)=>{const u=new pg;u.setWithCredentials(!0),u.listenOnce(mg.COMPLETE,(()=>{try{switch(u.getLastErrorCode()){case lo.NO_ERROR:const p=u.getResponseJson();M(Ue,`XHR for RPC '${e}' ${o} received:`,JSON.stringify(p)),c(p);break;case lo.TIMEOUT:M(Ue,`RPC '${e}' ${o} timed out`),l(new O(b.DEADLINE_EXCEEDED,"Request time out"));break;case lo.HTTP_ERROR:const m=u.getStatus();if(M(Ue,`RPC '${e}' ${o} failed with status:`,m,"response text:",u.getResponseText()),m>0){let T=u.getResponseJson();Array.isArray(T)&&(T=T[0]);const S=T==null?void 0:T.error;if(S&&S.status&&S.message){const k=(function($){const j=$.toLowerCase().replace(/_/g,"-");return Object.values(b).indexOf(j)>=0?j:b.UNKNOWN})(S.status);l(new O(k,S.message))}else l(new O(b.UNKNOWN,"Server responded with status "+u.getStatus()))}else l(new O(b.UNAVAILABLE,"Connection failed."));break;default:F(9055,{l_:e,streamId:o,h_:u.getLastErrorCode(),P_:u.getLastError()})}}finally{M(Ue,`RPC '${e}' ${o} completed.`)}}));const f=JSON.stringify(r);M(Ue,`RPC '${e}' ${o} sending request:`,r),u.send(t,"POST",f,s,15)}))}T_(e,t,s){const r=tl(),i=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=this.createWebChannelTransport(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(c.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Go(c.initMessageHeaders,t,s),c.encodeInitMessageHeaders=!0;const u=i.join("");M(Ue,`Creating RPC '${e}' stream ${r}: ${u}`,c);const f=o.createWebChannel(u,c);this.I_(f);let p=!1,m=!1;const T=new pS({Jo:S=>{m?M(Ue,`Not sending because RPC '${e}' stream ${r} is closed:`,S):(p||(M(Ue,`Opening RPC '${e}' stream ${r} transport.`),f.open(),p=!0),M(Ue,`RPC '${e}' stream ${r} sending:`,S),f.send(S))},Ho:()=>f.close()});return wr(f,Pr.EventType.OPEN,(()=>{m||(M(Ue,`RPC '${e}' stream ${r} transport opened.`),T.i_())})),wr(f,Pr.EventType.CLOSE,(()=>{m||(m=!0,M(Ue,`RPC '${e}' stream ${r} transport closed`),T.o_(),this.E_(f))})),wr(f,Pr.EventType.ERROR,(S=>{m||(m=!0,Zn(Ue,`RPC '${e}' stream ${r} transport errored. Name:`,S.name,"Message:",S.message),T.o_(new O(b.UNAVAILABLE,"The operation could not be completed")))})),wr(f,Pr.EventType.MESSAGE,(S=>{var k;if(!m){const N=S.data[0];ee(!!N,16349);const $=N,j=($==null?void 0:$.error)||((k=$[0])==null?void 0:k.error);if(j){M(Ue,`RPC '${e}' stream ${r} received error:`,j);const Q=j.status;let ne=(function(I){const _=Te[I];if(_!==void 0)return Zg(_)})(Q),me=j.message;Q==="NOT_FOUND"&&me.includes("database")&&me.includes("does not exist")&&me.includes(this.databaseId.database)&&Zn(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),ne===void 0&&(ne=b.INTERNAL,me="Unknown error status: "+Q+" with message "+j.message),m=!0,T.o_(new O(ne,me)),f.close()}else M(Ue,`RPC '${e}' stream ${r} received:`,N),T.__(N)}})),Ss.u_(),setTimeout((()=>{T.s_()}),0),T}terminate(){this.a_.forEach((e=>e.close())),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter((t=>t===e))}Go(e,t,s){super.Go(e,t,s),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return yg()}}/**
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
 */function mS(n){return new Ss(n)}function Ac(){return typeof document<"u"?document:null}/**
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
 */function va(n){return new EC(n,!0)}/**
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
 */Ss.c_=!1;class hu{constructor(e,t,s=1e3,r=1.5,i=6e4){this.Ci=e,this.timerId=t,this.R_=s,this.A_=r,this.V_=i,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();const t=Math.floor(this.d_+this.y_()),s=Math.max(0,Date.now()-this.f_),r=Math.max(0,t-s);r>0&&M("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${t} ms, last attempt: ${s} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,(()=>(this.f_=Date.now(),e()))),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}}/**
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
 */const $f="PersistentStream";class m_{constructor(e,t,s,r,i,o,c,l){this.Ci=e,this.S_=s,this.b_=r,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=c,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new hu(e,t)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.S_,6e4,(()=>this.k_())))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():t&&t.code===b.RESOURCE_EXHAUSTED?(zt(t.toString()),zt("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):t&&t.code===b.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(t)}W_(){}auth(){this.state=1;const e=this.Q_(this.D_),t=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([s,r])=>{this.D_===t&&this.G_(s,r)}),(s=>{e((()=>{const r=new O(b.UNKNOWN,"Fetching auth token failed: "+s.message);return this.z_(r)}))}))}G_(e,t){const s=this.Q_(this.D_);this.stream=this.j_(e,t),this.stream.Zo((()=>{s((()=>this.listener.Zo()))})),this.stream.Yo((()=>{s((()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.b_,1e4,(()=>(this.O_()&&(this.state=3),Promise.resolve()))),this.listener.Yo())))})),this.stream.t_((r=>{s((()=>this.z_(r)))})),this.stream.onMessage((r=>{s((()=>++this.F_==1?this.J_(r):this.onNext(r)))}))}N_(){this.state=5,this.M_.p_((async()=>{this.state=0,this.start()}))}z_(e){return M($f,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return t=>{this.Ci.enqueueAndForget((()=>this.D_===e?t():(M($f,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class gS extends m_{constructor(e,t,s,r,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,s,r,o),this.serializer=i}j_(e,t){return this.connection.T_("Listen",e,t)}J_(e){return this.onNext(e)}onNext(e){this.M_.reset();const t=vC(this.serializer,e),s=(function(i){if(!("targetChange"in i))return U.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?U.min():o.readTime?at(o.readTime):U.min()})(e);return this.listener.H_(t,s)}Z_(e){const t={};t.database=Zc(this.serializer),t.addTarget=(function(i,o){let c;const l=o.target;if(c=Qc(l)?{documents:RC(i,l)}:{query:CC(i,l).ft},c.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){c.resumeToken=n_(i,o.resumeToken);const u=Jc(i,o.expectedCount);u!==null&&(c.expectedCount=u)}else if(o.snapshotVersion.compareTo(U.min())>0){c.readTime=Mo(i,o.snapshotVersion.toTimestamp());const u=Jc(i,o.expectedCount);u!==null&&(c.expectedCount=u)}return c})(this.serializer,e);const s=bC(this.serializer,e);s&&(t.labels=s),this.K_(t)}X_(e){const t={};t.database=Zc(this.serializer),t.removeTarget=e,this.K_(t)}}class _S extends m_{constructor(e,t,s,r,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,s,r,o),this.serializer=i}get Y_(){return this.F_>0}start(){this.lastStreamToken=void 0,super.start()}W_(){this.Y_&&this.ea([])}j_(e,t){return this.connection.T_("Write",e,t)}J_(e){return ee(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,ee(!e.writeResults||e.writeResults.length===0,55816),this.listener.ta()}onNext(e){ee(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.M_.reset();const t=AC(e.writeResults,e.commitTime),s=at(e.commitTime);return this.listener.na(s,t)}ra(){const e={};e.database=Zc(this.serializer),this.K_(e)}ea(e){const t={streamToken:this.lastStreamToken,writes:e.map((s=>o_(this.serializer,s)))};this.K_(t)}}/**
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
 */class yS{}class ES extends yS{constructor(e,t,s,r){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=s,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new O(b.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,s,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([i,o])=>this.connection.Wo(e,Xc(t,s),r,i,o))).catch((i=>{throw i.name==="FirebaseError"?(i.code===b.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new O(b.UNKNOWN,i.toString())}))}jo(e,t,s,r,i){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([o,c])=>this.connection.jo(e,Xc(t,s),r,o,c,i))).catch((o=>{throw o.name==="FirebaseError"?(o.code===b.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new O(b.UNKNOWN,o.toString())}))}terminate(){this.ia=!0,this.connection.terminate()}}function TS(n,e,t,s){return new ES(n,e,t,s)}class wS{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve()))))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(zt(t),this.aa=!1):M("OnlineStateTracker",t)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}}/**
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
 */const Ot="RemoteStore";class IS{constructor(e,t,s,r,i){this.localStore=e,this.datastore=t,this.asyncQueue=s,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Map,this.Ra=new Map,this.Aa=new An(1e3),this.Va=new An(1001),this.da=new Set,this.ma=[],this.fa=i,this.fa.Mo((o=>{s.enqueueAndForget((async()=>{ls(this)&&(M(Ot,"Restarting streams for network reachability change."),await(async function(l){const u=q(l);u.da.add(4),await wi(u),u.ga.set("Unknown"),u.da.delete(4),await Aa(u)})(this))}))})),this.ga=new wS(s,r)}}async function Aa(n){if(ls(n))for(const e of n.ma)await e(!0)}async function wi(n){for(const e of n.ma)await e(!1)}function nl(n,e){return n.Ea.get(e)||void 0}function g_(n,e){const t=q(n),s=nl(t,e.targetId);if(s!==void 0&&t.Ia.has(s))return;const r=(function(c,l){const u=nl(c,l);u!==void 0&&c.Ra.delete(u);const f=(function(m,T){return T%2!=0?m.Va.next():m.Aa.next()})(c,l);return c.Ea.set(l,f),c.Ra.set(f,l),f})(t,e.targetId);M(Ot,"remoteStoreListen mapping SDK target ID to remote",e.targetId,r);const i=new Bt(e.target,r,e.purpose,e.sequenceNumber,e.snapshotVersion,e.lastLimboFreeSnapshotVersion,e.resumeToken);t.Ia.set(r,i),mu(t)?pu(t):Xs(t).O_()&&fu(t,i)}function du(n,e){const t=q(n),s=Xs(t),r=nl(t,e);M(Ot,"remoteStoreUnlisten removing mapping of SDK target ID to remote",e,r),t.Ia.delete(r),t.Ea.delete(e),t.Ra.delete(r),s.O_()&&__(t,r),t.Ia.size===0&&(s.O_()?s.L_():ls(t)&&t.ga.set("Unknown"))}function fu(n,e){if(n.pa.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(U.min())>0){const t=n.Ra.get(e.targetId);if(t===void 0)return void M(Ot,"SDK target ID not found for remote ID: "+e.targetId);const s=n.remoteSyncer.getRemoteKeysForTarget(t).size;e=e.withExpectedCount(s)}Xs(n).Z_(e)}function __(n,e){n.pa.$e(e),Xs(n).X_(e)}function pu(n){n.pa=new mC({getRemoteKeysForTarget:e=>{const t=n.Ra.get(e);return t!==void 0?n.remoteSyncer.getRemoteKeysForTarget(t):X()},At:e=>n.Ia.get(e)||null,ht:()=>n.datastore.serializer.databaseId}),Xs(n).start(),n.ga.ua()}function mu(n){return ls(n)&&!Xs(n).x_()&&n.Ia.size>0}function ls(n){return q(n).da.size===0}function y_(n){n.pa=void 0}async function vS(n){n.ga.set("Online")}async function AS(n){n.Ia.forEach(((e,t)=>{fu(n,e)}))}async function RS(n,e){y_(n),mu(n)?(n.ga.ha(e),pu(n)):n.ga.set("Unknown")}async function CS(n,e,t){if(n.ga.set("Online"),e instanceof t_&&e.state===2&&e.cause)try{await(async function(r,i){const o=i.cause;for(const c of i.targetIds){if(r.Ia.has(c)){const l=r.Ra.get(c);l!==void 0&&(await r.remoteSyncer.rejectListen(l,o),r.Ea.delete(l),r.Ra.delete(c)),r.Ia.delete(c)}r.pa.removeTarget(c)}})(n,e)}catch(s){M(Ot,"Failed to remove targets %s: %s ",e.targetIds.join(","),s),await Fo(n,s)}else if(e instanceof po?n.pa.Xe(e):e instanceof e_?n.pa.st(e):n.pa.tt(e),!t.isEqual(U.min()))try{const s=await p_(n.localStore);t.compareTo(s)>=0&&await(function(i,o){const c=i.pa.Tt(o);c.targetChanges.forEach(((u,f)=>{if(u.resumeToken.approximateByteSize()>0){const p=i.Ia.get(f);p&&i.Ia.set(f,p.withResumeToken(u.resumeToken,o))}})),c.targetMismatches.forEach(((u,f)=>{const p=i.Ia.get(u);if(!p)return;i.Ia.set(u,p.withResumeToken(Le.EMPTY_BYTE_STRING,p.snapshotVersion)),__(i,u);const m=new Bt(p.target,u,f,p.sequenceNumber);fu(i,m)}));const l=(function(f,p){const m=new Map;p.targetChanges.forEach(((S,k)=>{const N=f.Ra.get(k);N!==void 0&&m.set(N,S)}));let T=new ye(J);return p.targetMismatches.forEach(((S,k)=>{const N=f.Ra.get(S);N!==void 0&&(T=T.insert(N,k))})),new Ei(p.snapshotVersion,m,T,p.documentUpdates,p.resolvedLimboDocuments)})(i,c);return i.remoteSyncer.applyRemoteEvent(l)})(n,t)}catch(s){M(Ot,"Failed to raise snapshot:",s),await Fo(n,s)}}async function Fo(n,e,t){if(!Js(e))throw e;n.da.add(1),await wi(n),n.ga.set("Offline"),t||(t=()=>p_(n.localStore)),n.asyncQueue.enqueueRetryable((async()=>{M(Ot,"Retrying IndexedDB access"),await t(),n.da.delete(1),await Aa(n)}))}function E_(n,e){return e().catch((t=>Fo(n,t,e)))}async function Ra(n){const e=q(n),t=Rn(e);let s=e.Ta.length>0?e.Ta[e.Ta.length-1].batchId:Jl;for(;SS(e);)try{const r=await aS(e.localStore,s);if(r===null){e.Ta.length===0&&t.L_();break}s=r.batchId,bS(e,r)}catch(r){await Fo(e,r)}T_(e)&&w_(e)}function SS(n){return ls(n)&&n.Ta.length<10}function bS(n,e){n.Ta.push(e);const t=Rn(n);t.O_()&&t.Y_&&t.ea(e.mutations)}function T_(n){return ls(n)&&!Rn(n).x_()&&n.Ta.length>0}function w_(n){Rn(n).start()}async function PS(n){Rn(n).ra()}async function kS(n){const e=Rn(n);for(const t of n.Ta)e.ea(t.mutations)}async function NS(n,e,t){const s=n.Ta.shift(),r=ru.from(s,e,t);await E_(n,(()=>n.remoteSyncer.applySuccessfulWrite(r))),await Ra(n)}async function DS(n,e){e&&Rn(n).Y_&&await(async function(s,r){if((function(o){return Xg(o)&&o!==b.ABORTED})(r.code)){const i=s.Ta.shift();Rn(s).B_(),await E_(s,(()=>s.remoteSyncer.rejectFailedWrite(i.batchId,r))),await Ra(s)}})(n,e),T_(n)&&w_(n)}async function Wf(n,e){const t=q(n);t.asyncQueue.verifyOperationInProgress(),M(Ot,"RemoteStore received new credentials");const s=ls(t);t.da.add(3),await wi(t),s&&t.ga.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.da.delete(3),await Aa(t)}async function OS(n,e){const t=q(n);e?(t.da.delete(2),await Aa(t)):e||(t.da.add(2),await wi(t),t.ga.set("Unknown"))}function Xs(n){return n.ya||(n.ya=(function(t,s,r){const i=q(t);return i.sa(),new gS(s,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,r)})(n.datastore,n.asyncQueue,{Zo:vS.bind(null,n),Yo:AS.bind(null,n),t_:RS.bind(null,n),H_:CS.bind(null,n)}),n.ma.push((async e=>{e?(n.ya.B_(),mu(n)?pu(n):n.ga.set("Unknown")):(await n.ya.stop(),y_(n))}))),n.ya}function Rn(n){return n.wa||(n.wa=(function(t,s,r){const i=q(t);return i.sa(),new _S(s,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,r)})(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),Yo:PS.bind(null,n),t_:DS.bind(null,n),ta:kS.bind(null,n),na:NS.bind(null,n)}),n.ma.push((async e=>{e?(n.wa.B_(),await Ra(n)):(await n.wa.stop(),n.Ta.length>0&&(M(Ot,`Stopping write stream with ${n.Ta.length} pending writes`),n.Ta=[]))}))),n.wa}/**
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
 */class gu{constructor(e,t,s,r,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=s,this.op=r,this.removalCallback=i,this.deferred=new bt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((o=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,s,r,i){const o=Date.now()+s,c=new gu(e,t,o,r,i);return c.start(s),c}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new O(b.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function _u(n,e){if(zt("AsyncQueue",`${e}: ${n}`),Js(n))return new O(b.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class bs{static emptySet(e){return new bs(e.comparator)}constructor(e){this.comparator=e?(t,s)=>e(t,s)||L.comparator(t.key,s.key):(t,s)=>L.comparator(t.key,s.key),this.keyedMap=kr(),this.sortedSet=new ye(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,s)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof bs)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),s=e.sortedSet.getIterator();for(;t.hasNext();){const r=t.getNext().key,i=s.getNext().key;if(!r.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const s=new bs;return s.comparator=this.comparator,s.keyedMap=e,s.sortedSet=t,s}}/**
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
 */class jf{constructor(){this.Sa=new ye(L.comparator)}track(e){const t=e.doc.key,s=this.Sa.get(t);s?e.type!==0&&s.type===3?this.Sa=this.Sa.insert(t,e):e.type===3&&s.type!==1?this.Sa=this.Sa.insert(t,{type:s.type,doc:e.doc}):e.type===2&&s.type===2?this.Sa=this.Sa.insert(t,{type:2,doc:e.doc}):e.type===2&&s.type===0?this.Sa=this.Sa.insert(t,{type:0,doc:e.doc}):e.type===1&&s.type===0?this.Sa=this.Sa.remove(t):e.type===1&&s.type===2?this.Sa=this.Sa.insert(t,{type:1,doc:s.doc}):e.type===0&&s.type===1?this.Sa=this.Sa.insert(t,{type:2,doc:e.doc}):F(63341,{Vt:e,ba:s}):this.Sa=this.Sa.insert(t,e)}Da(){const e=[];return this.Sa.inorderTraversal(((t,s)=>{e.push(s)})),e}}class Us{constructor(e,t,s,r,i,o,c,l,u){this.query=e,this.docs=t,this.oldDocs=s,this.docChanges=r,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=c,this.excludesMetadataChanges=l,this.hasCachedResults=u}static fromInitialDocuments(e,t,s,r,i){const o=[];return t.forEach((c=>{o.push({type:0,doc:c})})),new Us(e,t,bs.emptySet(t),o,s,r,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Ea(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,s=e.docChanges;if(t.length!==s.length)return!1;for(let r=0;r<t.length;r++)if(t[r].type!==s[r].type||!t[r].doc.isEqual(s[r].doc))return!1;return!0}}/**
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
 */class VS{constructor(){this.Ca=void 0,this.va=[]}Fa(){return this.va.some((e=>e.Ma()))}}class MS{constructor(){this.queries=Hf(),this.onlineState="Unknown",this.xa=new Set}terminate(){(function(t,s){const r=q(t),i=r.queries;r.queries=Hf(),i.forEach(((o,c)=>{for(const l of c.va)l.onError(s)}))})(this,new O(b.ABORTED,"Firestore shutting down"))}}function Hf(){return new cs((n=>Ug(n)),Ea)}async function yu(n,e){const t=q(n);let s=3;const r=e.query;let i=t.queries.get(r);i?!i.Fa()&&e.Ma()&&(s=2):(i=new VS,s=e.Ma()?0:1);try{switch(s){case 0:i.Ca=await t.onListen(r,!0);break;case 1:i.Ca=await t.onListen(r,!1);break;case 2:await t.onFirstRemoteStoreListen(r)}}catch(o){const c=_u(o,`Initialization of query '${Es(e.query)}' failed`);return void e.onError(c)}t.queries.set(r,i),i.va.push(e),e.Oa(t.onlineState),i.Ca&&e.Na(i.Ca)&&Tu(t)}async function Eu(n,e){const t=q(n),s=e.query;let r=3;const i=t.queries.get(s);if(i){const o=i.va.indexOf(e);o>=0&&(i.va.splice(o,1),i.va.length===0?r=e.Ma()?0:1:!i.Fa()&&e.Ma()&&(r=2))}switch(r){case 0:return t.queries.delete(s),t.onUnlisten(s,!0);case 1:return t.queries.delete(s),t.onUnlisten(s,!1);case 2:return t.onLastRemoteStoreUnlisten(s);default:return}}function xS(n,e){const t=q(n);let s=!1;for(const r of e){const i=r.query,o=t.queries.get(i);if(o){for(const c of o.va)c.Na(r)&&(s=!0);o.Ca=r}}s&&Tu(t)}function LS(n,e,t){const s=q(n),r=s.queries.get(e);if(r)for(const i of r.va)i.onError(t);s.queries.delete(e)}function Tu(n){n.xa.forEach((e=>{e.next()}))}var sl,Gf;(Gf=sl||(sl={})).Ba="default",Gf.Cache="cache";class wu{constructor(e,t,s){this.query=e,this.La=t,this.ka=!1,this.Ka=null,this.onlineState="Unknown",this.options=s||{}}Na(e){if(!this.options.includeMetadataChanges){const s=[];for(const r of e.docChanges)r.type!==3&&s.push(r);e=new Us(e.query,e.docs,e.oldDocs,s,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.ka?this.qa(e)&&(this.La.next(e),t=!0):this.Ua(e,this.onlineState)&&(this.$a(e),t=!0),this.Ka=e,t}onError(e){this.La.error(e)}Oa(e){this.onlineState=e;let t=!1;return this.Ka&&!this.ka&&this.Ua(this.Ka,e)&&(this.$a(this.Ka),t=!0),t}Ua(e,t){if(!e.fromCache||!this.Ma())return!0;const s=t!=="Offline";return(!this.options.Wa||!s)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}qa(e){if(e.docChanges.length>0)return!0;const t=this.Ka&&this.Ka.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}$a(e){e=Us.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.ka=!0,this.La.next(e)}Ma(){return this.options.source!==sl.Cache}}/**
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
 */class I_{constructor(e){this.key=e}}class v_{constructor(e){this.key=e}}class FS{constructor(e,t){this.query=e,this.tu=t,this.nu=null,this.hasCachedResults=!1,this.current=!1,this.ru=X(),this.mutatedKeys=X(),this.iu=Bg(e),this.su=new bs(this.iu)}get ou(){return this.tu}_u(e,t){const s=t?t.au:new jf,r=t?t.su:this.su;let i=t?t.mutatedKeys:this.mutatedKeys,o=r,c=!1;const l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,u=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal(((f,p)=>{const m=r.get(f),T=Ta(this.query,p)?p:null,S=!!m&&this.mutatedKeys.has(m.key),k=!!T&&(T.hasLocalMutations||this.mutatedKeys.has(T.key)&&T.hasCommittedMutations);let N=!1;m&&T?m.data.isEqual(T.data)?S!==k&&(s.track({type:3,doc:T}),N=!0):this.uu(m,T)||(s.track({type:2,doc:T}),N=!0,(l&&this.iu(T,l)>0||u&&this.iu(T,u)<0)&&(c=!0)):!m&&T?(s.track({type:0,doc:T}),N=!0):m&&!T&&(s.track({type:1,doc:m}),N=!0,(l||u)&&(c=!0)),N&&(T?(o=o.add(T),i=k?i.add(f):i.delete(f)):(o=o.delete(f),i=i.delete(f)))})),this.query.limit!==null)for(;o.size>this.query.limit;){const f=this.query.limitType==="F"?o.last():o.first();o=o.delete(f.key),i=i.delete(f.key),s.track({type:1,doc:f})}return{su:o,au:s,bs:c,mutatedKeys:i}}uu(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,s,r){const i=this.su;this.su=e.su,this.mutatedKeys=e.mutatedKeys;const o=e.au.Da();o.sort(((f,p)=>(function(T,S){const k=N=>{switch(N){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return F(20277,{Vt:N})}};return k(T)-k(S)})(f.type,p.type)||this.iu(f.doc,p.doc))),this.cu(s),r=r??!1;const c=t&&!r?this.lu():[],l=this.ru.size===0&&this.current&&!r?1:0,u=l!==this.nu;return this.nu=l,o.length!==0||u?{snapshot:new Us(this.query,e.su,i,o,e.mutatedKeys,l===0,u,!1,!!s&&s.resumeToken.approximateByteSize()>0),hu:c}:{hu:c}}Oa(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({su:this.su,au:new jf,mutatedKeys:this.mutatedKeys,bs:!1},!1)):{hu:[]}}Pu(e){return!this.tu.has(e)&&!!this.su.has(e)&&!this.su.get(e).hasLocalMutations}cu(e){e&&(e.addedDocuments.forEach((t=>this.tu=this.tu.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.tu=this.tu.delete(t))),this.current=e.current)}lu(){if(!this.current)return[];const e=this.ru;this.ru=X(),this.su.forEach((s=>{this.Pu(s.key)&&(this.ru=this.ru.add(s.key))}));const t=[];return e.forEach((s=>{this.ru.has(s)||t.push(new v_(s))})),this.ru.forEach((s=>{e.has(s)||t.push(new I_(s))})),t}Tu(e){this.tu=e.ks,this.ru=X();const t=this._u(e.documents);return this.applyChanges(t,!0)}Iu(){return Us.fromInitialDocuments(this.query,this.su,this.mutatedKeys,this.nu===0,this.hasCachedResults)}}const Iu="SyncEngine";class US{constructor(e,t,s){this.query=e,this.targetId=t,this.view=s}}class BS{constructor(e){this.key=e,this.Eu=!1}}class qS{constructor(e,t,s,r,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=s,this.sharedClientState=r,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ru={},this.Au=new cs((c=>Ug(c)),Ea),this.Vu=new Map,this.du=new Set,this.mu=new ye(L.comparator),this.fu=new Map,this.gu=new au,this.pu={},this.yu=new Map,this.wu=An.ar(),this.onlineState="Unknown",this.Su=void 0}get isPrimaryClient(){return this.Su===!0}}async function $S(n,e,t=!0){const s=P_(n);let r;const i=s.Au.get(e);return i?(s.sharedClientState.addLocalQueryTarget(i.targetId),r=i.view.Iu()):r=await A_(s,e,t,!0),r}async function WS(n,e){const t=P_(n);await A_(t,e,!0,!1)}async function A_(n,e,t,s){const r=await cS(n.localStore,Pt(e)),i=r.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let c;return s&&(c=await jS(n,e,i,o==="current",r.resumeToken)),n.isPrimaryClient&&t&&g_(n.remoteStore,r),c}async function jS(n,e,t,s,r){n.bu=(p,m,T)=>(async function(k,N,$,j){let Q=N.view._u($);Q.bs&&(Q=await Ff(k.localStore,N.query,!1).then((({documents:I})=>N.view._u(I,Q))));const ne=j&&j.targetChanges.get(N.targetId),me=j&&j.targetMismatches.get(N.targetId)!=null,Ee=N.view.applyChanges(Q,k.isPrimaryClient,ne,me);return Kf(k,N.targetId,Ee.hu),Ee.snapshot})(n,p,m,T);const i=await Ff(n.localStore,e,!0),o=new FS(e,i.ks),c=o._u(i.documents),l=Ti.createSynthesizedTargetChangeForCurrentChange(t,s&&n.onlineState!=="Offline",r),u=o.applyChanges(c,n.isPrimaryClient,l);Kf(n,t,u.hu);const f=new US(e,t,o);return n.Au.set(e,f),n.Vu.has(t)?n.Vu.get(t).push(e):n.Vu.set(t,[e]),u.snapshot}async function HS(n,e,t){const s=q(n),r=s.Au.get(e),i=s.Vu.get(r.targetId);if(i.length>1)return s.Vu.set(r.targetId,i.filter((o=>!Ea(o,e)))),void s.Au.delete(e);s.isPrimaryClient?(s.sharedClientState.removeLocalQueryTarget(r.targetId),s.sharedClientState.isActiveQueryTarget(r.targetId)||await el(s.localStore,r.targetId,!1).then((()=>{s.sharedClientState.clearQueryState(r.targetId),t&&du(s.remoteStore,r.targetId),rl(s,r.targetId)})).catch(Ys)):(rl(s,r.targetId),await el(s.localStore,r.targetId,!0))}async function GS(n,e){const t=q(n),s=t.Au.get(e),r=t.Vu.get(s.targetId);t.isPrimaryClient&&r.length===1&&(t.sharedClientState.removeLocalQueryTarget(s.targetId),du(t.remoteStore,s.targetId))}async function zS(n,e,t){const s=eb(n);try{const r=await(function(o,c){const l=q(o),u=le.now(),f=c.reduce(((T,S)=>T.add(S.key)),X());let p,m;return l.persistence.runTransaction("Locally write mutations","readwrite",(T=>{let S=Kt(),k=X();return l.xs.getEntries(T,f).next((N=>{S=N,S.forEach((($,j)=>{j.isValidDocument()||(k=k.add($))}))})).next((()=>l.localDocuments.getOverlayedDocuments(T,S))).next((N=>{p=N;const $=[];for(const j of c){const Q=lC(j,p.get(j.key).overlayedDocument);Q!=null&&$.push(new Nn(j.key,Q,Ng(Q.value.mapValue),ve.exists(!0)))}return l.mutationQueue.addMutationBatch(T,u,$,c)})).next((N=>{m=N;const $=N.applyToLocalDocumentSet(p,k);return l.documentOverlayCache.saveOverlays(T,N.batchId,$)}))})).then((()=>({batchId:m.batchId,changes:$g(p)})))})(s.localStore,e);s.sharedClientState.addPendingMutation(r.batchId),(function(o,c,l){let u=o.pu[o.currentUser.toKey()];u||(u=new ye(J)),u=u.insert(c,l),o.pu[o.currentUser.toKey()]=u})(s,r.batchId,t),await Ii(s,r.changes),await Ra(s.remoteStore)}catch(r){const i=_u(r,"Failed to persist write");t.reject(i)}}async function R_(n,e){const t=q(n);try{const s=await iS(t.localStore,e);e.targetChanges.forEach(((r,i)=>{const o=t.fu.get(i);o&&(ee(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?o.Eu=!0:r.modifiedDocuments.size>0?ee(o.Eu,14607):r.removedDocuments.size>0&&(ee(o.Eu,42227),o.Eu=!1))})),await Ii(t,s,e)}catch(s){await Ys(s)}}function zf(n,e,t){const s=q(n);if(s.isPrimaryClient&&t===0||!s.isPrimaryClient&&t===1){const r=[];s.Au.forEach(((i,o)=>{const c=o.view.Oa(e);c.snapshot&&r.push(c.snapshot)})),(function(o,c){const l=q(o);l.onlineState=c;let u=!1;l.queries.forEach(((f,p)=>{for(const m of p.va)m.Oa(c)&&(u=!0)})),u&&Tu(l)})(s.eventManager,e),r.length&&s.Ru.H_(r),s.onlineState=e,s.isPrimaryClient&&s.sharedClientState.setOnlineState(e)}}async function KS(n,e,t){const s=q(n);s.sharedClientState.updateQueryState(e,"rejected",t);const r=s.fu.get(e),i=r&&r.key;if(i){let o=new ye(L.comparator);o=o.insert(i,De.newNoDocument(i,U.min()));const c=X().add(i),l=new Ei(U.min(),new Map,new ye(J),o,c);await R_(s,l),s.mu=s.mu.remove(i),s.fu.delete(e),vu(s)}else await el(s.localStore,e,!1).then((()=>rl(s,e,t))).catch(Ys)}async function QS(n,e){const t=q(n),s=e.batch.batchId;try{const r=await rS(t.localStore,e);S_(t,s,null),C_(t,s),t.sharedClientState.updateMutationState(s,"acknowledged"),await Ii(t,r)}catch(r){await Ys(r)}}async function YS(n,e,t){const s=q(n);try{const r=await(function(o,c){const l=q(o);return l.persistence.runTransaction("Reject batch","readwrite-primary",(u=>{let f;return l.mutationQueue.lookupMutationBatch(u,c).next((p=>(ee(p!==null,37113),f=p.keys(),l.mutationQueue.removeMutationBatch(u,p)))).next((()=>l.mutationQueue.performConsistencyCheck(u))).next((()=>l.documentOverlayCache.removeOverlaysForBatchId(u,f,c))).next((()=>l.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,f))).next((()=>l.localDocuments.getDocuments(u,f)))}))})(s.localStore,e);S_(s,e,t),C_(s,e),s.sharedClientState.updateMutationState(e,"rejected",t),await Ii(s,r)}catch(r){await Ys(r)}}function C_(n,e){(n.yu.get(e)||[]).forEach((t=>{t.resolve()})),n.yu.delete(e)}function S_(n,e,t){const s=q(n);let r=s.pu[s.currentUser.toKey()];if(r){const i=r.get(e);i&&(t?i.reject(t):i.resolve(),r=r.remove(e)),s.pu[s.currentUser.toKey()]=r}}function rl(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const s of n.Vu.get(e))n.Au.delete(s),t&&n.Ru.Du(s,t);n.Vu.delete(e),n.isPrimaryClient&&n.gu.Gr(e).forEach((s=>{n.gu.containsKey(s)||b_(n,s)}))}function b_(n,e){n.du.delete(e.path.canonicalString());const t=n.mu.get(e);t!==null&&(du(n.remoteStore,t),n.mu=n.mu.remove(e),n.fu.delete(t),vu(n))}function Kf(n,e,t){for(const s of t)s instanceof I_?(n.gu.addReference(s.key,e),JS(n,s)):s instanceof v_?(M(Iu,"Document no longer in limbo: "+s.key),n.gu.removeReference(s.key,e),n.gu.containsKey(s.key)||b_(n,s.key)):F(19791,{Cu:s})}function JS(n,e){const t=e.key,s=t.path.canonicalString();n.mu.get(t)||n.du.has(s)||(M(Iu,"New document in limbo: "+t),n.du.add(s),vu(n))}function vu(n){for(;n.du.size>0&&n.mu.size<n.maxConcurrentLimboResolutions;){const e=n.du.values().next().value;n.du.delete(e);const t=new L(se.fromString(e)),s=n.wu.next();n.fu.set(s,new BS(t)),n.mu=n.mu.insert(t,s),g_(n.remoteStore,new Bt(Pt(ya(t.path)),s,"TargetPurposeLimboResolution",ga.ce))}}async function Ii(n,e,t){const s=q(n),r=[],i=[],o=[];s.Au.isEmpty()||(s.Au.forEach(((c,l)=>{o.push(s.bu(l,e,t).then((u=>{var f;if((u||t)&&s.isPrimaryClient){const p=u?!u.fromCache:(f=t==null?void 0:t.targetChanges.get(l.targetId))==null?void 0:f.current;s.sharedClientState.updateQueryState(l.targetId,p?"current":"not-current")}if(u){r.push(u);const p=lu.Es(l.targetId,u);i.push(p)}})))})),await Promise.all(o),s.Ru.H_(r),await(async function(l,u){const f=q(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",(p=>P.forEach(u,(m=>P.forEach(m.Ts,(T=>f.persistence.referenceDelegate.addReference(p,m.targetId,T))).next((()=>P.forEach(m.Is,(T=>f.persistence.referenceDelegate.removeReference(p,m.targetId,T)))))))))}catch(p){if(!Js(p))throw p;M(uu,"Failed to update sequence numbers: "+p)}for(const p of u){const m=p.targetId;if(!p.fromCache){const T=f.vs.get(m),S=T.snapshotVersion,k=T.withLastLimboFreeSnapshotVersion(S);f.vs=f.vs.insert(m,k)}}})(s.localStore,i))}async function XS(n,e){const t=q(n);if(!t.currentUser.isEqual(e)){M(Iu,"User change. New user:",e.toKey());const s=await f_(t.localStore,e);t.currentUser=e,(function(i,o){i.yu.forEach((c=>{c.forEach((l=>{l.reject(new O(b.CANCELLED,o))}))})),i.yu.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,s.removedBatchIds,s.addedBatchIds),await Ii(t,s.Ns)}}function ZS(n,e){const t=q(n),s=t.fu.get(e);if(s&&s.Eu)return X().add(s.key);{let r=X();const i=t.Vu.get(e);if(!i)return r;for(const o of i){const c=t.Au.get(o);r=r.unionWith(c.view.ou)}return r}}function P_(n){const e=q(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=R_.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=ZS.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=KS.bind(null,e),e.Ru.H_=xS.bind(null,e.eventManager),e.Ru.Du=LS.bind(null,e.eventManager),e}function eb(n){const e=q(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=QS.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=YS.bind(null,e),e}class Uo{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=va(e.databaseInfo.databaseId),this.sharedClientState=this.Mu(e),this.persistence=this.xu(e),await this.persistence.start(),this.localStore=this.Ou(e),this.gcScheduler=this.Nu(e,this.localStore),this.indexBackfillerScheduler=this.Bu(e,this.localStore)}Nu(e,t){return null}Bu(e,t){return null}Ou(e){return sS(this.persistence,new eS,e.initialUser,this.serializer)}xu(e){return new d_(cu.Vi,this.serializer)}Mu(e){return new uS}async terminate(){var e,t;(e=this.gcScheduler)==null||e.stop(),(t=this.indexBackfillerScheduler)==null||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Uo.provider={build:()=>new Uo};class tb extends Uo{constructor(e){super(),this.cacheSizeBytes=e}Nu(e,t){ee(this.persistence.referenceDelegate instanceof Lo,46915);const s=this.persistence.referenceDelegate.garbageCollector;return new UC(s,e.asyncQueue,t)}xu(e){const t=this.cacheSizeBytes!==void 0?Ye.withCacheSize(this.cacheSizeBytes):Ye.DEFAULT;return new d_((s=>Lo.Vi(s,t)),this.serializer)}}class il{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=s=>zf(this.syncEngine,s,1),this.remoteStore.remoteSyncer.handleCredentialChange=XS.bind(null,this.syncEngine),await OS(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new MS})()}createDatastore(e){const t=va(e.databaseInfo.databaseId),s=mS(e.databaseInfo);return TS(e.authCredentials,e.appCheckCredentials,s,t)}createRemoteStore(e){return(function(s,r,i,o,c){return new IS(s,r,i,o,c)})(this.localStore,this.datastore,e.asyncQueue,(t=>zf(this.syncEngine,t,0)),(function(){return qf.v()?new qf:new hS})())}createSyncEngine(e,t){return(function(r,i,o,c,l,u,f){const p=new qS(r,i,o,c,l,u);return f&&(p.Su=!0),p})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(r){const i=q(r);M(Ot,"RemoteStore shutting down."),i.da.add(5),await wi(i),i.fa.shutdown(),i.ga.set("Unknown")})(this.remoteStore),(e=this.datastore)==null||e.terminate(),(t=this.eventManager)==null||t.terminate()}}il.provider={build:()=>new il};/**
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
 *//**
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
 */class Au{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.ku(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.ku(this.observer.error,e):zt("Uncaught Error in snapshot listener:",e.toString()))}Ku(){this.muted=!0}ku(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
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
 */let nb=class{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new O(b.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await(async function(r,i){const o=q(r),c={documents:i.map((p=>xo(o.serializer,p)))},l=await o.jo("BatchGetDocuments",o.serializer.databaseId,se.emptyPath(),c,i.length),u=new Map;l.forEach((p=>{const m=IC(o.serializer,p);u.set(m.key.toString(),m)}));const f=[];return i.forEach((p=>{const m=u.get(p.toString());ee(!!m,55234,{key:p}),f.push(m)})),f})(this.datastore,e);return t.forEach((s=>this.recordVersion(s))),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(s){this.lastTransactionError=s}this.writtenDocs.add(e.toString())}delete(e){this.write(new yi(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach((t=>{e.delete(t.key.toString())})),e.forEach(((t,s)=>{const r=L.fromPath(s);this.mutations.push(new Jg(r,this.precondition(r)))})),await(async function(s,r){const i=q(s),o={writes:r.map((c=>o_(i.serializer,c)))};await i.Wo("Commit",i.serializer.databaseId,se.emptyPath(),o)})(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw F(50498,{Hu:e.constructor.name});t=U.min()}const s=this.readVersions.get(e.key.toString());if(s){if(!t.isEqual(s))throw new O(b.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(U.min())?ve.exists(!1):ve.updateTime(t):ve.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(U.min()))throw new O(b.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return ve.updateTime(t)}return ve.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}};/**
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
 */class sb{constructor(e,t,s,r,i){this.asyncQueue=e,this.datastore=t,this.options=s,this.updateFunction=r,this.deferred=i,this.Zu=s.maxAttempts,this.M_=new hu(this.asyncQueue,"transaction_retry")}Xu(){this.Zu-=1,this.Yu()}Yu(){this.M_.p_((async()=>{const e=new nb(this.datastore),t=this.ec(e);t&&t.then((s=>{this.asyncQueue.enqueueAndForget((()=>e.commit().then((()=>{this.deferred.resolve(s)})).catch((r=>{this.tc(r)}))))})).catch((s=>{this.tc(s)}))}))}ec(e){try{const t=this.updateFunction(e);return!gi(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}tc(e){this.Zu>0&&this.nc(e)?(this.Zu-=1,this.asyncQueue.enqueueAndForget((()=>(this.Yu(),Promise.resolve())))):this.deferred.reject(e)}nc(e){if((e==null?void 0:e.name)==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!Xg(t)}return!1}}/**
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
 */const Cn="FirestoreClient";class rb{constructor(e,t,s,r,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=s,this._databaseInfo=r,this.user=Be.UNAUTHENTICATED,this.clientId=Ql.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(s,(async o=>{M(Cn,"Received user=",o.uid),await this.authCredentialListener(o),this.user=o})),this.appCheckCredentials.start(s,(o=>(M(Cn,"Received new app check token=",o),this.appCheckCredentialListener(o,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new bt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const s=_u(t,"Failed to shutdown persistence");e.reject(s)}})),e.promise}}async function Rc(n,e){n.asyncQueue.verifyOperationInProgress(),M(Cn,"Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let s=t.initialUser;n.setCredentialChangeListener((async r=>{s.isEqual(r)||(await f_(e.localStore,r),s=r)})),e.persistence.setDatabaseDeletedListener((()=>n.terminate())),n._offlineComponents=e}async function Qf(n,e){n.asyncQueue.verifyOperationInProgress();const t=await ib(n);M(Cn,"Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener((s=>Wf(e.remoteStore,s))),n.setAppCheckTokenChangeListener(((s,r)=>Wf(e.remoteStore,r))),n._onlineComponents=e}async function ib(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){M(Cn,"Using user provided OfflineComponentProvider");try{await Rc(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(r){return r.name==="FirebaseError"?r.code===b.FAILED_PRECONDITION||r.code===b.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11})(t))throw t;Zn("Error using user provided cache. Falling back to memory cache: "+t),await Rc(n,new Uo)}}else M(Cn,"Using default OfflineComponentProvider"),await Rc(n,new tb(void 0));return n._offlineComponents}async function Ru(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(M(Cn,"Using user provided OnlineComponentProvider"),await Qf(n,n._uninitializedComponentsProvider._online)):(M(Cn,"Using default OnlineComponentProvider"),await Qf(n,new il))),n._onlineComponents}function ob(n){return Ru(n).then((e=>e.syncEngine))}function ab(n){return Ru(n).then((e=>e.datastore))}async function Bo(n){const e=await Ru(n),t=e.eventManager;return t.onListen=$S.bind(null,e.syncEngine),t.onUnlisten=HS.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=WS.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=GS.bind(null,e.syncEngine),t}function cb(n,e,t,s){const r=new Au(s),i=new wu(e,r,t);return n.asyncQueue.enqueueAndForget((async()=>yu(await Bo(n),i))),()=>{r.Ku(),n.asyncQueue.enqueueAndForget((async()=>Eu(await Bo(n),i)))}}function k_(n,e,t={}){const s=new bt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,o,c,l,u){const f=new Au({next:m=>{f.Ku(),o.enqueueAndForget((()=>Eu(i,p)));const T=m.docs.has(c);!T&&m.fromCache?u.reject(new O(b.UNAVAILABLE,"Failed to get document because the client is offline.")):T&&m.fromCache&&l&&l.source==="server"?u.reject(new O(b.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(m)},error:m=>u.reject(m)}),p=new wu(ya(c.path),f,{includeMetadataChanges:!0,Wa:!0});return yu(i,p)})(await Bo(n),n.asyncQueue,e,t,s))),s.promise}function lb(n,e,t={}){const s=new bt;return n.asyncQueue.enqueueAndForget((async()=>(function(i,o,c,l,u){const f=new Au({next:m=>{f.Ku(),o.enqueueAndForget((()=>Eu(i,p))),m.fromCache&&l.source==="server"?u.reject(new O(b.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(m)},error:m=>u.reject(m)}),p=new wu(c,f,{includeMetadataChanges:!0,Wa:!0});return yu(i,p)})(await Bo(n),n.asyncQueue,e,t,s))),s.promise}function ub(n,e){const t=new bt;return n.asyncQueue.enqueueAndForget((async()=>zS(await ob(n),e,t))),t.promise}function hb(n,e,t){const s=new bt;return n.asyncQueue.enqueueAndForget((async()=>{const r=await ab(n);new sb(n.asyncQueue,r,t,e,s).Xu()})),s.promise}/**
 * @license
 * Copyright 2023 Google LLC
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
 */function N_(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const db="ComponentProvider",Yf=new Map;function fb(n,e,t,s,r){return new NR(n,e,t,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,N_(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,s)}/**
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
 */const D_="firestore.googleapis.com",Jf=!0;class Xf{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new O(b.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=D_,this.ssl=Jf}else this.host=e.host,this.ssl=e.ssl??Jf;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=h_;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<LC)throw new O(b.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}ER("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=N_(e.experimentalLongPollingOptions??{}),(function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new O(b.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new O(b.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new O(b.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(s,r){return s.timeoutSeconds===r.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class vi{constructor(e,t,s,r){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=s,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Xf({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new O(b.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new O(b.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Xf(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(s){if(!s)return new lR;switch(s.type){case"firstParty":return new fR(s.sessionIndex||"0",s.iamToken||null,s.authTokenFactory||null);case"provider":return s.client;default:throw new O(b.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const s=Yf.get(t);s&&(M(db,"Removing Datastore"),Yf.delete(t),s.terminate())})(this),Promise.resolve()}}function pb(n,e,t,s={}){var u;n=Ce(n,vi);const r=wt(e),i=n._getSettings(),o={...i,emulatorOptions:n._getEmulatorOptions()},c=`${e}:${t}`;r&&ui(`https://${c}`),i.host!==D_&&i.host!==c&&Zn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const l={...i,host:c,ssl:r,emulatorOptions:s};if(!Nt(l,o)&&(n._setSettings(l),s.mockUserToken)){let f,p;if(typeof s.mockUserToken=="string")f=s.mockUserToken,p=Be.MOCK_USER;else{f=Al(s.mockUserToken,(u=n._app)==null?void 0:u.options.projectId);const m=s.mockUserToken.sub||s.mockUserToken.user_id;if(!m)throw new O(b.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");p=new Be(m)}n._authCredentials=new uR(new Tg(f,p))}}/**
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
 */class Mt{constructor(e,t,s){this.converter=t,this._query=s,this.type="query",this.firestore=e}withConverter(e){return new Mt(this.firestore,e,this._query)}}class ue{constructor(e,t,s){this.converter=t,this._key=s,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new gn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ue(this.firestore,e,this._key)}toJSON(){return{type:ue._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,s){if(mi(t,ue._jsonSchema))return new ue(e,s||null,new L(se.fromString(t.referencePath)))}}ue._jsonSchemaVersion="firestore/documentReference/1.0",ue._jsonSchema={type:Ae("string",ue._jsonSchemaVersion),referencePath:Ae("string")};class gn extends Mt{constructor(e,t,s){super(e,t,ya(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ue(this.firestore,null,new L(e))}withConverter(e){return new gn(this.firestore,e,this._path)}}function BD(n,e,...t){if(n=W(n),Yl("collection","path",e),n instanceof vi){const s=se.fromString(e,...t);return hf(s),new gn(n,null,s)}{if(!(n instanceof ue||n instanceof gn))throw new O(b.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=n._path.child(se.fromString(e,...t));return hf(s),new gn(n.firestore,null,s)}}function qD(n,e){if(n=Ce(n,vi),Yl("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new O(b.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new Mt(n,null,(function(s){return new as(se.emptyPath(),s)})(e))}function mb(n,e,...t){if(n=W(n),arguments.length===1&&(e=Ql.newId()),Yl("doc","path",e),n instanceof vi){const s=se.fromString(e,...t);return uf(s),new ue(n,null,new L(s))}{if(!(n instanceof ue||n instanceof gn))throw new O(b.INVALID_ARGUMENT,"Expected first argument to doc() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=n._path.child(se.fromString(e,...t));return uf(s),new ue(n.firestore,n instanceof gn?n.converter:null,new L(s))}}/**
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
 */const Zf="AsyncQueue";class ep{constructor(e=Promise.resolve()){this.rc=[],this.sc=!1,this.oc=[],this._c=null,this.ac=!1,this.uc=!1,this.cc=[],this.M_=new hu(this,"async_queue_retry"),this.lc=()=>{const s=Ac();s&&M(Zf,"Visibility state changed to "+s.visibilityState),this.M_.w_()},this.hc=e;const t=Ac();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.lc)}get isShuttingDown(){return this.sc}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.Pc(),this.Tc(e)}enterRestrictedMode(e){if(!this.sc){this.sc=!0,this.uc=e||!1;const t=Ac();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.lc)}}enqueue(e){if(this.Pc(),this.sc)return new Promise((()=>{}));const t=new bt;return this.Tc((()=>this.sc&&this.uc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.rc.push(e),this.Ic())))}async Ic(){if(this.rc.length!==0){try{await this.rc[0](),this.rc.shift(),this.M_.reset()}catch(e){if(!Js(e))throw e;M(Zf,"Operation failed with retryable error: "+e)}this.rc.length>0&&this.M_.p_((()=>this.Ic()))}}Tc(e){const t=this.hc.then((()=>(this.ac=!0,e().catch((s=>{throw this._c=s,this.ac=!1,zt("INTERNAL UNHANDLED ERROR: ",tp(s)),s})).then((s=>(this.ac=!1,s))))));return this.hc=t,t}enqueueAfterDelay(e,t,s){this.Pc(),this.cc.indexOf(e)>-1&&(t=0);const r=gu.createAndSchedule(this,e,t,s,(i=>this.Ec(i)));return this.oc.push(r),r}Pc(){this._c&&F(47125,{Rc:tp(this._c)})}verifyOperationInProgress(){}async Ac(){let e;do e=this.hc,await e;while(e!==this.hc)}Vc(e){for(const t of this.oc)if(t.timerId===e)return!0;return!1}dc(e){return this.Ac().then((()=>{this.oc.sort(((t,s)=>t.targetTimeMs-s.targetTimeMs));for(const t of this.oc)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Ac()}))}mc(e){this.cc.push(e)}Ec(e){const t=this.oc.indexOf(e);this.oc.splice(t,1)}}function tp(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class ht extends vi{constructor(e,t,s,r){super(e,t,s,r),this.type="firestore",this._queue=new ep,this._persistenceKey=(r==null?void 0:r.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ep(e),this._firestoreClient=void 0,await e}}}function $D(n,e){const t=typeof n=="object"?n:zs(),s=typeof n=="string"?n:ko,r=Jt(t,"firestore").getImmediate({identifier:s});if(!r._initialized){const i=oa("firestore");i&&pb(r,...i)}return r}function us(n){if(n._terminated)throw new O(b.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||gb(n),n._firestoreClient}function gb(n){var s,r,i,o;const e=n._freezeSettings(),t=fb(n._databaseId,((s=n._app)==null?void 0:s.options.appId)||"",n._persistenceKey,(r=n._app)==null?void 0:r.options.apiKey,e);n._componentsProvider||(i=e.localCache)!=null&&i._offlineComponentProvider&&((o=e.localCache)!=null&&o._onlineComponentProvider)&&(n._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),n._firestoreClient=new rb(n._authCredentials,n._appCheckCredentials,n._queue,t,n._componentsProvider&&(function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}})(n._componentsProvider))}/**
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
 */class rt{constructor(e){this._byteString=e}static fromBase64String(e){try{return new rt(Le.fromBase64String(e))}catch(t){throw new O(b.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new rt(Le.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:rt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(mi(e,rt._jsonSchema))return rt.fromBase64String(e.bytes)}}rt._jsonSchemaVersion="firestore/bytes/1.0",rt._jsonSchema={type:Ae("string",rt._jsonSchemaVersion),bytes:Ae("string")};/**
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
 */class Ai{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new O(b.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new xe(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class Zs{constructor(e){this._methodName=e}}/**
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
 */class kt{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new O(b.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new O(b.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return J(this._lat,e._lat)||J(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:kt._jsonSchemaVersion}}static fromJSON(e){if(mi(e,kt._jsonSchema))return new kt(e.latitude,e.longitude)}}kt._jsonSchemaVersion="firestore/geoPoint/1.0",kt._jsonSchema={type:Ae("string",kt._jsonSchemaVersion),latitude:Ae("number"),longitude:Ae("number")};/**
 * @license
 * Copyright 2024 Google LLC
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
 */class yt{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(s,r){if(s.length!==r.length)return!1;for(let i=0;i<s.length;++i)if(s[i]!==r[i])return!1;return!0})(this._values,e._values)}toJSON(){return{type:yt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(mi(e,yt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new yt(e.vectorValues);throw new O(b.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}yt._jsonSchemaVersion="firestore/vectorValue/1.0",yt._jsonSchema={type:Ae("string",yt._jsonSchemaVersion),vectorValues:Ae("object")};/**
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
 */const _b=/^__.*__$/;class yb{constructor(e,t,s){this.data=e,this.fieldMask=t,this.fieldTransforms=s}toMutation(e,t){return this.fieldMask!==null?new Nn(e,this.data,this.fieldMask,t,this.fieldTransforms):new _i(e,this.data,t,this.fieldTransforms)}}class O_{constructor(e,t,s){this.data=e,this.fieldMask=t,this.fieldTransforms=s}toMutation(e,t){return new Nn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function V_(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw F(40011,{dataSource:n})}}class Ca{constructor(e,t,s,r,i,o){this.settings=e,this.databaseId=t,this.serializer=s,this.ignoreUndefinedProperties=r,i===void 0&&this.fc(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}i(e){return new Ca({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}yc(e){var r;const t=(r=this.path)==null?void 0:r.child(e),s=this.i({path:t,arrayElement:!1});return s.wc(e),s}Sc(e){var r;const t=(r=this.path)==null?void 0:r.child(e),s=this.i({path:t,arrayElement:!1});return s.fc(),s}bc(e){return this.i({path:void 0,arrayElement:!0})}Dc(e){return qo(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}fc(){if(this.path)for(let e=0;e<this.path.length;e++)this.wc(this.path.get(e))}wc(e){if(e.length===0)throw this.Dc("Document fields must not be empty");if(V_(this.dataSource)&&_b.test(e))throw this.Dc('Document fields cannot begin and end with "__"')}}class Eb{constructor(e,t,s){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=s||va(e)}V(e,t,s,r=!1){return new Ca({dataSource:e,methodName:t,targetDoc:s,path:xe.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function er(n){const e=n._freezeSettings(),t=va(n._databaseId);return new Eb(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Sa(n,e,t,s,r,i={}){const o=n.V(i.merge||i.mergeFields?2:0,e,t,r);Nu("Data must be an object, but it was:",o,s);const c=x_(s,o);let l,u;if(i.merge)l=new it(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const f=[];for(const p of i.mergeFields){const m=es(e,p,t);if(!o.contains(m))throw new O(b.INVALID_ARGUMENT,`Field '${m}' is specified in your field mask but missing from your input data.`);U_(f,m)||f.push(m)}l=new it(f),u=o.fieldTransforms.filter((p=>l.covers(p.field)))}else l=null,u=o.fieldTransforms;return new yb(new Ke(c),l,u)}class Ri extends Zs{_toFieldTransform(e){if(e.dataSource!==2)throw e.dataSource===1?e.Dc(`${this._methodName}() can only appear at the top level of your update data`):e.Dc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Ri}}function M_(n,e,t){return new Ca({dataSource:3,targetDoc:e.settings.targetDoc,methodName:n._methodName,arrayElement:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class Cu extends Zs{_toFieldTransform(e){return new su(e.path,new ni)}isEqual(e){return e instanceof Cu}}class Su extends Zs{constructor(e,t){super(e),this.vc=t}_toFieldTransform(e){const t=M_(this,e,!0),s=this.vc.map((i=>hs(i,t))),r=new Ls(s);return new su(e.path,r)}isEqual(e){return e instanceof Su&&Nt(this.vc,e.vc)}}class bu extends Zs{constructor(e,t){super(e),this.vc=t}_toFieldTransform(e){const t=M_(this,e,!0),s=this.vc.map((i=>hs(i,t))),r=new Fs(s);return new su(e.path,r)}isEqual(e){return e instanceof bu&&Nt(this.vc,e.vc)}}function Pu(n,e,t,s){const r=n.V(1,e,t);Nu("Data must be an object, but it was:",r,s);const i=[],o=Ke.empty();kn(s,((l,u)=>{const f=F_(e,l,t);u=W(u);const p=r.Sc(f);if(u instanceof Ri)i.push(f);else{const m=hs(u,p);m!=null&&(i.push(f),o.set(f,m))}}));const c=new it(i);return new O_(o,c,r.fieldTransforms)}function ku(n,e,t,s,r,i){const o=n.V(1,e,t),c=[es(e,s,t)],l=[r];if(i.length%2!=0)throw new O(b.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let m=0;m<i.length;m+=2)c.push(es(e,i[m])),l.push(i[m+1]);const u=[],f=Ke.empty();for(let m=c.length-1;m>=0;--m)if(!U_(u,c[m])){const T=c[m];let S=l[m];S=W(S);const k=o.Sc(T);if(S instanceof Ri)u.push(T);else{const N=hs(S,k);N!=null&&(u.push(T),f.set(T,N))}}const p=new it(u);return new O_(f,p,o.fieldTransforms)}function Tb(n,e,t,s=!1){return hs(t,n.V(s?4:3,e))}function hs(n,e){if(L_(n=W(n)))return Nu("Unsupported field value:",e,n),x_(n,e);if(n instanceof Zs)return(function(s,r){if(!V_(r.dataSource))throw r.Dc(`${s._methodName}() can only be used with update() and set()`);if(!r.path)throw r.Dc(`${s._methodName}() is not currently supported inside arrays`);const i=s._toFieldTransform(r);i&&r.fieldTransforms.push(i)})(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.Dc("Nested arrays are not supported");return(function(s,r){const i=[];let o=0;for(const c of s){let l=hs(c,r.bc(o));l==null&&(l={nullValue:"NULL_VALUE"}),i.push(l),o++}return{arrayValue:{values:i}}})(n,e)}return(function(s,r){if((s=W(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return sC(r.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const i=le.fromDate(s);return{timestampValue:Mo(r.serializer,i)}}if(s instanceof le){const i=new le(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:Mo(r.serializer,i)}}if(s instanceof kt)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof rt)return{bytesValue:n_(r.serializer,s._byteString)};if(s instanceof ue){const i=r.databaseId,o=s.firestore._databaseId;if(!o.isEqual(i))throw r.Dc(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:ou(s.firestore._databaseId||r.databaseId,s._key.path)}}if(s instanceof yt)return(function(o,c){const l=o instanceof yt?o.toArray():o;return{mapValue:{fields:{[Pg]:{stringValue:kg},[No]:{arrayValue:{values:l.map((f=>{if(typeof f!="number")throw c.Dc("VectorValues must only contain numeric values.");return nu(c.serializer,f)}))}}}}}})(s,r);if(u_(s))return s._toProto(r.serializer);throw r.Dc(`Unsupported field value: ${ma(s)}`)})(n,e)}function x_(n,e){const t={};return vg(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):kn(n,((s,r)=>{const i=hs(r,e.yc(s));i!=null&&(t[s]=i)})),{mapValue:{fields:t}}}function L_(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof le||n instanceof kt||n instanceof rt||n instanceof ue||n instanceof Zs||n instanceof yt||u_(n))}function Nu(n,e,t){if(!L_(t)||!wg(t)){const s=ma(t);throw s==="an object"?e.Dc(n+" a custom object"):e.Dc(n+" "+s)}}function es(n,e,t){if((e=W(e))instanceof Ai)return e._internalPath;if(typeof e=="string")return F_(n,e);throw qo("Field path arguments must be of type string or ",n,!1,void 0,t)}const wb=new RegExp("[~\\*/\\[\\]]");function F_(n,e,t){if(e.search(wb)>=0)throw qo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Ai(...e.split("."))._internalPath}catch{throw qo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function qo(n,e,t,s,r){const i=s&&!s.isEmpty(),o=r!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let l="";return(i||o)&&(l+=" (found",i&&(l+=` in field ${s}`),o&&(l+=` in document ${r}`),l+=")"),new O(b.INVALID_ARGUMENT,c+n+l)}function U_(n,e){return n.some((t=>t.isEqual(e)))}/**
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
 */class B_{convertValue(e,t="none"){switch(vn(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ge(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(In(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw F(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const s={};return kn(e,((r,i)=>{s[r]=this.convertValue(i,t)})),s}convertVectorValue(e){var s,r,i;const t=(i=(r=(s=e.fields)==null?void 0:s[No].arrayValue)==null?void 0:r.values)==null?void 0:i.map((o=>ge(o.doubleValue)));return new yt(t)}convertGeoPoint(e){return new kt(ge(e.latitude),ge(e.longitude))}convertArray(e,t){return(e.values||[]).map((s=>this.convertValue(s,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const s=_a(e);return s==null?null:this.convertValue(s,t);case"estimate":return this.convertTimestamp(Xr(e));default:return null}}convertTimestamp(e){const t=wn(e);return new le(t.seconds,t.nanos)}convertDocumentKey(e,t){const s=se.fromString(e);ee(l_(s),9688,{name:e});const r=new Zr(s.get(1),s.get(3)),i=new L(s.popFirst(5));return r.isEqual(t)||zt(`Document ${i} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2024 Google LLC
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
 */class ba extends B_{constructor(e){super(),this.firestore=e}convertBytes(e){return new rt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ue(this.firestore,null,t)}}/**
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
 */function WD(){return new Ri("deleteField")}function jD(){return new Cu("serverTimestamp")}function HD(...n){return new Su("arrayUnion",n)}function GD(...n){return new bu("arrayRemove",n)}const np="@firebase/firestore",sp="4.14.1";/**
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
 */function rp(n){return(function(t,s){if(typeof t!="object"||t===null)return!1;const r=t;for(const i of s)if(i in r&&typeof r[i]=="function")return!0;return!1})(n,["next","error","complete"])}/**
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
 */class $o{constructor(e,t,s,r,i){this._firestore=e,this._userDataWriter=t,this._key=s,this._document=r,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new ue(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Ib(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){var e;return((e=this._document)==null?void 0:e.data.clone().value.mapValue.fields)??void 0}get(e){if(this._document){const t=this._document.data.field(es("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Ib extends $o{data(){return super.data()}}/**
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
 */function q_(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new O(b.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Du{}class Ou extends Du{}function zD(n,e,...t){let s=[];e instanceof Du&&s.push(e),s=s.concat(t),(function(i){const o=i.filter((l=>l instanceof tr)).length,c=i.filter((l=>l instanceof Ci)).length;if(o>1||o>0&&c>0)throw new O(b.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(s);for(const r of s)n=r._apply(n);return n}class Ci extends Ou{constructor(e,t,s){super(),this._field=e,this._op=t,this._value=s,this.type="where"}static _create(e,t,s){return new Ci(e,t,s)}_apply(e){const t=this._parse(e);return $_(e._query,t),new Mt(e.firestore,e.converter,Yc(e._query,t))}_parse(e){const t=er(e.firestore);return(function(i,o,c,l,u,f,p){let m;if(u.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new O(b.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){op(p,f);const S=[];for(const k of p)S.push(ip(l,i,k));m={arrayValue:{values:S}}}else m=ip(l,i,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||op(p,f),m=Tb(c,o,p,f==="in"||f==="not-in");return Ie.create(u,f,m)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function KD(n,e,t){const s=e,r=es("where",n);return Ci._create(r,s,t)}class tr extends Du{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new tr(e,t)}_parse(e){const t=this._queryConstraints.map((s=>s._parse(e))).filter((s=>s.getFilters().length>0));return t.length===1?t[0]:Tt.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(r,i){let o=r;const c=i.getFlattenedFilters();for(const l of c)$_(o,l),o=Yc(o,l)})(e._query,t),new Mt(e.firestore,e.converter,Yc(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function QD(...n){return n.forEach((e=>W_("or",e))),tr._create("or",n)}function YD(...n){return n.forEach((e=>W_("and",e))),tr._create("and",n)}class Vu extends Ou{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new Vu(e,t)}_apply(e){const t=(function(r,i,o){if(r.startAt!==null)throw new O(b.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new O(b.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ti(i,o)})(e._query,this._field,this._direction);return new Mt(e.firestore,e.converter,QR(e._query,t))}}function JD(n,e="asc"){const t=e,s=es("orderBy",n);return Vu._create(s,t)}class Mu extends Ou{constructor(e,t,s){super(),this.type=e,this._limit=t,this._limitType=s}static _create(e,t,s){return new Mu(e,t,s)}_apply(e){return new Mt(e.firestore,e.converter,Oo(e._query,this._limit,this._limitType))}}function XD(n){return TR("limit",n),Mu._create("limit",n,"F")}function ip(n,e,t){if(typeof(t=W(t))=="string"){if(t==="")throw new O(b.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Fg(e)&&t.indexOf("/")!==-1)throw new O(b.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const s=e.path.child(se.fromString(t));if(!L.isDocumentKey(s))throw new O(b.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${s}' is not because it has an odd number of segments (${s.length}).`);return Ef(n,new L(s))}if(t instanceof ue)return Ef(n,t._key);throw new O(b.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ma(t)}.`)}function op(n,e){if(!Array.isArray(n)||n.length===0)throw new O(b.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function $_(n,e){const t=(function(r,i){for(const o of r)for(const c of o.getFlattenedFilters())if(i.indexOf(c.op)>=0)return c.op;return null})(n.filters,(function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new O(b.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new O(b.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function W_(n,e){if(!(e instanceof Ci||e instanceof tr))throw new O(b.INVALID_ARGUMENT,`Function ${n}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}function Pa(n,e,t){let s;return s=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,s}class vb extends B_{constructor(e){super(),this.firestore=e}convertBytes(e){return new rt(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new ue(this.firestore,null,t)}}class Is{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class _n extends $o{constructor(e,t,s,r,i,o){super(e,t,s,r,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new mo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const s=this._document.data.field(es("DocumentSnapshot.get",e));if(s!==null)return this._userDataWriter.convertValue(s,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new O(b.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=_n._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}_n._jsonSchemaVersion="firestore/documentSnapshot/1.0",_n._jsonSchema={type:Ae("string",_n._jsonSchemaVersion),bundleSource:Ae("string","DocumentSnapshot"),bundleName:Ae("string"),bundle:Ae("string")};class mo extends _n{data(e={}){return super.data(e)}}class zn{constructor(e,t,s,r){this._firestore=e,this._userDataWriter=t,this._snapshot=r,this.metadata=new Is(r.hasPendingWrites,r.fromCache),this.query=s}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((s=>{e.call(t,new mo(this._firestore,this._userDataWriter,s.key,s,new Is(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new O(b.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(r,i){if(r._snapshot.oldDocs.isEmpty()){let o=0;return r._snapshot.docChanges.map((c=>{const l=new mo(r._firestore,r._userDataWriter,c.doc.key,c.doc,new Is(r._snapshot.mutatedKeys.has(c.doc.key),r._snapshot.fromCache),r.query.converter);return c.doc,{type:"added",doc:l,oldIndex:-1,newIndex:o++}}))}{let o=r._snapshot.oldDocs;return r._snapshot.docChanges.filter((c=>i||c.type!==3)).map((c=>{const l=new mo(r._firestore,r._userDataWriter,c.doc.key,c.doc,new Is(r._snapshot.mutatedKeys.has(c.doc.key),r._snapshot.fromCache),r.query.converter);let u=-1,f=-1;return c.type!==0&&(u=o.indexOf(c.doc.key),o=o.delete(c.doc.key)),c.type!==1&&(o=o.add(c.doc),f=o.indexOf(c.doc.key)),{type:Ab(c.type),doc:l,oldIndex:u,newIndex:f}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new O(b.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=zn._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Ql.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],s=[],r=[];return this.docs.forEach((i=>{i._document!==null&&(t.push(i._document),s.push(this._userDataWriter.convertObjectMap(i._document.data.value.mapValue.fields,"previous")),r.push(i.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function Ab(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return F(61501,{type:n})}}/**
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
 */zn._jsonSchemaVersion="firestore/querySnapshot/1.0",zn._jsonSchema={type:Ae("string",zn._jsonSchemaVersion),bundleSource:Ae("string","QuerySnapshot"),bundleName:Ae("string"),bundle:Ae("string")};const Rb={maxAttempts:5};/**
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
 */class Cb{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=er(e)}set(e,t,s){this._verifyNotCommitted();const r=dn(e,this._firestore),i=Pa(r.converter,t,s),o=Sa(this._dataReader,"WriteBatch.set",r._key,i,r.converter!==null,s);return this._mutations.push(o.toMutation(r._key,ve.none())),this}update(e,t,s,...r){this._verifyNotCommitted();const i=dn(e,this._firestore);let o;return o=typeof(t=W(t))=="string"||t instanceof Ai?ku(this._dataReader,"WriteBatch.update",i._key,t,s,r):Pu(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,ve.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=dn(e,this._firestore);return this._mutations=this._mutations.concat(new yi(t._key,ve.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new O(b.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function dn(n,e){if((n=W(n)).firestore!==e)throw new O(b.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
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
 */class Sb{constructor(e,t){this._firestore=e,this._transaction=t,this._dataReader=er(e)}get(e){const t=dn(e,this._firestore),s=new vb(this._firestore);return this._transaction.lookup([t._key]).then((r=>{if(!r||r.length!==1)return F(24041);const i=r[0];if(i.isFoundDocument())return new $o(this._firestore,s,i.key,i,t.converter);if(i.isNoDocument())return new $o(this._firestore,s,t._key,null,t.converter);throw F(18433,{doc:i})}))}set(e,t,s){const r=dn(e,this._firestore),i=Pa(r.converter,t,s),o=Sa(this._dataReader,"Transaction.set",r._key,i,r.converter!==null,s);return this._transaction.set(r._key,o),this}update(e,t,s,...r){const i=dn(e,this._firestore);let o;return o=typeof(t=W(t))=="string"||t instanceof Ai?ku(this._dataReader,"Transaction.update",i._key,t,s,r):Pu(this._dataReader,"Transaction.update",i._key,t),this._transaction.update(i._key,o),this}delete(e){const t=dn(e,this._firestore);return this._transaction.delete(t._key),this}}/**
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
 */class bb extends Sb{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=dn(e,this._firestore),s=new ba(this._firestore);return super.get(e).then((r=>new _n(this._firestore,s,t._key,r._document,new Is(!1,!1),t.converter)))}}function ZD(n,e,t){n=Ce(n,ht);const s={...Rb,...t};(function(o){if(o.maxAttempts<1)throw new O(b.INVALID_ARGUMENT,"Max attempts must be at least 1")})(s);const r=us(n);return hb(r,(i=>e(new bb(n,i))),s)}/**
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
 */function eO(n){n=Ce(n,ue);const e=Ce(n.firestore,ht),t=us(e);return k_(t,n._key).then((s=>xu(e,n,s)))}function tO(n){n=Ce(n,ue);const e=Ce(n.firestore,ht),t=us(e);return k_(t,n._key,{source:"server"}).then((s=>xu(e,n,s)))}function nO(n){n=Ce(n,Mt);const e=Ce(n.firestore,ht),t=us(e),s=new ba(e);return q_(n._query),lb(t,n._query).then((r=>new zn(e,s,n,r)))}function sO(n,e,t){n=Ce(n,ue);const s=Ce(n.firestore,ht),r=Pa(n.converter,e,t),i=er(s);return Si(s,[Sa(i,"setDoc",n._key,r,n.converter!==null,t).toMutation(n._key,ve.none())])}function rO(n,e,t,...s){n=Ce(n,ue);const r=Ce(n.firestore,ht),i=er(r);let o;return o=typeof(e=W(e))=="string"||e instanceof Ai?ku(i,"updateDoc",n._key,e,t,s):Pu(i,"updateDoc",n._key,e),Si(r,[o.toMutation(n._key,ve.exists(!0))])}function iO(n){return Si(Ce(n.firestore,ht),[new yi(n._key,ve.none())])}function oO(n,e){const t=Ce(n.firestore,ht),s=mb(n),r=Pa(n.converter,e),i=er(n.firestore);return Si(t,[Sa(i,"addDoc",s._key,r,n.converter!==null,{}).toMutation(s._key,ve.exists(!1))]).then((()=>s))}function aO(n,...e){var u,f,p;n=W(n);let t={includeMetadataChanges:!1,source:"default"},s=0;typeof e[s]!="object"||rp(e[s])||(t=e[s++]);const r={includeMetadataChanges:t.includeMetadataChanges,source:t.source};if(rp(e[s])){const m=e[s];e[s]=(u=m.next)==null?void 0:u.bind(m),e[s+1]=(f=m.error)==null?void 0:f.bind(m),e[s+2]=(p=m.complete)==null?void 0:p.bind(m)}let i,o,c;if(n instanceof ue)o=Ce(n.firestore,ht),c=ya(n._key.path),i={next:m=>{e[s]&&e[s](xu(o,n,m))},error:e[s+1],complete:e[s+2]};else{const m=Ce(n,Mt);o=Ce(m.firestore,ht),c=m._query;const T=new ba(o);i={next:S=>{e[s]&&e[s](new zn(o,T,m,S))},error:e[s+1],complete:e[s+2]},q_(n._query)}const l=us(o);return cb(l,c,r,i)}function Si(n,e){const t=us(n);return ub(t,e)}function xu(n,e,t){const s=t.docs.get(e._key),r=new ba(n);return new _n(n,r,e._key,s,new Is(t.hasPendingWrites,t.fromCache),e.converter)}function cO(n){return n=Ce(n,ht),us(n),new Cb(n,(e=>Si(n,e)))}(function(e,t=!0){cR(Pn),ct(new tt("firestore",((s,{instanceIdentifier:r,options:i})=>{const o=s.getProvider("app").getImmediate(),c=new ht(new hR(s.getProvider("auth-internal")),new pR(o,s.getProvider("app-check-internal")),DR(o,r),o);return i={useFetchStreams:t,...i},c._setSettings(i),c}),"PUBLIC").setMultipleInstances(!0)),Ve(np,sp,e),Ve(np,sp,"esm2020")})();var Pb="firebase",kb="12.13.0";/**
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
 */Ve(Pb,kb,"app");/**
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
 */const j_="firebasestorage.googleapis.com",H_="storageBucket",Nb=120*1e3,Db=600*1e3;/**
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
 */class pe extends dt{constructor(e,t,s=0){super(Cc(e),`Firebase Storage: ${t} (${Cc(e)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,pe.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Cc(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var fe;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(fe||(fe={}));function Cc(n){return"storage/"+n}function Lu(){const n="An unknown error occurred, please check the error payload for server response.";return new pe(fe.UNKNOWN,n)}function Ob(n){return new pe(fe.OBJECT_NOT_FOUND,"Object '"+n+"' does not exist.")}function Vb(n){return new pe(fe.QUOTA_EXCEEDED,"Quota for bucket '"+n+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function Mb(){const n="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new pe(fe.UNAUTHENTICATED,n)}function xb(){return new pe(fe.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function Lb(n){return new pe(fe.UNAUTHORIZED,"User does not have permission to access '"+n+"'.")}function Fb(){return new pe(fe.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function Ub(){return new pe(fe.CANCELED,"User canceled the upload/download.")}function Bb(n){return new pe(fe.INVALID_URL,"Invalid URL '"+n+"'.")}function qb(n){return new pe(fe.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function $b(){return new pe(fe.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+H_+"' property when initializing the app?")}function Wb(){return new pe(fe.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function jb(){return new pe(fe.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Hb(n){return new pe(fe.UNSUPPORTED_ENVIRONMENT,`${n} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function ol(n){return new pe(fe.INVALID_ARGUMENT,n)}function G_(){return new pe(fe.APP_DELETED,"The Firebase app was deleted.")}function Gb(n){return new pe(fe.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Ur(n,e){return new pe(fe.INVALID_FORMAT,"String does not match format '"+n+"': "+e)}function Ir(n){throw new pe(fe.INTERNAL_ERROR,"Internal error: "+n)}/**
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
 */class ot{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let s;try{s=ot.makeFromUrl(e,t)}catch{return new ot(e,"")}if(s.path==="")return s;throw qb(e)}static makeFromUrl(e,t){let s=null;const r="([A-Za-z0-9.\\-_]+)";function i(ne){ne.path.charAt(ne.path.length-1)==="/"&&(ne.path_=ne.path_.slice(0,-1))}const o="(/(.*))?$",c=new RegExp("^gs://"+r+o,"i"),l={bucket:1,path:3};function u(ne){ne.path_=decodeURIComponent(ne.path)}const f="v[A-Za-z0-9_]+",p=t.replace(/[.]/g,"\\."),m="(/([^?#]*).*)?$",T=new RegExp(`^https?://${p}/${f}/b/${r}/o${m}`,"i"),S={bucket:1,path:3},k=t===j_?"(?:storage.googleapis.com|storage.cloud.google.com)":t,N="([^?#]*)",$=new RegExp(`^https?://${k}/${r}/${N}`,"i"),Q=[{regex:c,indices:l,postModify:i},{regex:T,indices:S,postModify:u},{regex:$,indices:{bucket:1,path:2},postModify:u}];for(let ne=0;ne<Q.length;ne++){const me=Q[ne],Ee=me.regex.exec(e);if(Ee){const I=Ee[me.indices.bucket];let _=Ee[me.indices.path];_||(_=""),s=new ot(I,_),me.postModify(s);break}}if(s==null)throw Bb(e);return s}}class zb{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
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
 */function Kb(n,e,t){let s=1,r=null,i=null,o=!1,c=0;function l(){return c===2}let u=!1;function f(...N){u||(u=!0,e.apply(null,N))}function p(N){r=setTimeout(()=>{r=null,n(T,l())},N)}function m(){i&&clearTimeout(i)}function T(N,...$){if(u){m();return}if(N){m(),f.call(null,N,...$);return}if(l()||o){m(),f.call(null,N,...$);return}s<64&&(s*=2);let Q;c===1?(c=2,Q=0):Q=(s+Math.random())*1e3,p(Q)}let S=!1;function k(N){S||(S=!0,m(),!u&&(r!==null?(N||(c=2),clearTimeout(r),p(0)):N||(c=1)))}return p(0),i=setTimeout(()=>{o=!0,k(!0)},t),k}function Qb(n){n(!1)}/**
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
 */function Yb(n){return n!==void 0}function Jb(n){return typeof n=="object"&&!Array.isArray(n)}function Fu(n){return typeof n=="string"||n instanceof String}function ap(n){return Uu()&&n instanceof Blob}function Uu(){return typeof Blob<"u"}function cp(n,e,t,s){if(s<e)throw ol(`Invalid value for '${n}'. Expected ${e} or greater.`);if(s>t)throw ol(`Invalid value for '${n}'. Expected ${t} or less.`)}/**
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
 */function ka(n,e,t){let s=e;return t==null&&(s=`https://${e}`),`${t}://${s}/v0${n}`}function z_(n){const e=encodeURIComponent;let t="?";for(const s in n)if(n.hasOwnProperty(s)){const r=e(s)+"="+e(n[s]);t=t+r+"&"}return t=t.slice(0,-1),t}var Kn;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(Kn||(Kn={}));/**
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
 */function Xb(n,e){const t=n>=500&&n<600,r=[408,429].indexOf(n)!==-1,i=e.indexOf(n)!==-1;return t||r||i}/**
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
 */class Zb{constructor(e,t,s,r,i,o,c,l,u,f,p,m=!0,T=!1){this.url_=e,this.method_=t,this.headers_=s,this.body_=r,this.successCodes_=i,this.additionalRetryCodes_=o,this.callback_=c,this.errorCallback_=l,this.timeout_=u,this.progressCallback_=f,this.connectionFactory_=p,this.retry=m,this.isUsingEmulator=T,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((S,k)=>{this.resolve_=S,this.reject_=k,this.start_()})}start_(){const e=(s,r)=>{if(r){s(!1,new to(!1,null,!0));return}const i=this.connectionFactory_();this.pendingConnection_=i;const o=c=>{const l=c.loaded,u=c.lengthComputable?c.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,u)};this.progressCallback_!==null&&i.addUploadProgressListener(o),i.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&i.removeUploadProgressListener(o),this.pendingConnection_=null;const c=i.getErrorCode()===Kn.NO_ERROR,l=i.getStatus();if(!c||Xb(l,this.additionalRetryCodes_)&&this.retry){const f=i.getErrorCode()===Kn.ABORT;s(!1,new to(!1,null,f));return}const u=this.successCodes_.indexOf(l)!==-1;s(!0,new to(u,i))})},t=(s,r)=>{const i=this.resolve_,o=this.reject_,c=r.connection;if(r.wasSuccessCode)try{const l=this.callback_(c,c.getResponse());Yb(l)?i(l):i()}catch(l){o(l)}else if(c!==null){const l=Lu();l.serverResponse=c.getErrorText(),this.errorCallback_?o(this.errorCallback_(c,l)):o(l)}else if(r.canceled){const l=this.appDelete_?G_():Ub();o(l)}else{const l=Fb();o(l)}};this.canceled_?t(!1,new to(!1,null,!0)):this.backoffId_=Kb(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&Qb(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class to{constructor(e,t,s){this.wasSuccessCode=e,this.connection=t,this.canceled=!!s}}function eP(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function tP(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function nP(n,e){e&&(n["X-Firebase-GMPID"]=e)}function sP(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function rP(n,e,t,s,r,i,o=!0,c=!1){const l=z_(n.urlParams),u=n.url+l,f=Object.assign({},n.headers);return nP(f,e),eP(f,t),tP(f,i),sP(f,s),new Zb(u,n.method,f,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,r,o,c)}/**
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
 */function iP(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function oP(...n){const e=iP();if(e!==void 0){const t=new e;for(let s=0;s<n.length;s++)t.append(n[s]);return t.getBlob()}else{if(Uu())return new Blob(n);throw new pe(fe.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function aP(n,e,t){return n.webkitSlice?n.webkitSlice(e,t):n.mozSlice?n.mozSlice(e,t):n.slice?n.slice(e,t):null}/**
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
 */function cP(n){if(typeof atob>"u")throw Hb("base-64");return atob(n)}/**
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
 */const Ct={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class Sc{constructor(e,t){this.data=e,this.contentType=t||null}}function lP(n,e){switch(n){case Ct.RAW:return new Sc(K_(e));case Ct.BASE64:case Ct.BASE64URL:return new Sc(Q_(n,e));case Ct.DATA_URL:return new Sc(hP(e),dP(e))}throw Lu()}function K_(n){const e=[];for(let t=0;t<n.length;t++){let s=n.charCodeAt(t);if(s<=127)e.push(s);else if(s<=2047)e.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(t<n.length-1&&(n.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const i=s,o=n.charCodeAt(++t);s=65536|(i&1023)<<10|o&1023,e.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?e.push(239,191,189):e.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(e)}function uP(n){let e;try{e=decodeURIComponent(n)}catch{throw Ur(Ct.DATA_URL,"Malformed data URL.")}return K_(e)}function Q_(n,e){switch(n){case Ct.BASE64:{const r=e.indexOf("-")!==-1,i=e.indexOf("_")!==-1;if(r||i)throw Ur(n,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case Ct.BASE64URL:{const r=e.indexOf("+")!==-1,i=e.indexOf("/")!==-1;if(r||i)throw Ur(n,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=cP(e)}catch(r){throw r.message.includes("polyfill")?r:Ur(n,"Invalid character found")}const s=new Uint8Array(t.length);for(let r=0;r<t.length;r++)s[r]=t.charCodeAt(r);return s}class Y_{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw Ur(Ct.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=t[1]||null;s!=null&&(this.base64=fP(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=e.substring(e.indexOf(",")+1)}}function hP(n){const e=new Y_(n);return e.base64?Q_(Ct.BASE64,e.rest):uP(e.rest)}function dP(n){return new Y_(n).contentType}function fP(n,e){return n.length>=e.length?n.substring(n.length-e.length)===e:!1}/**
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
 */class hn{constructor(e,t){let s=0,r="";ap(e)?(this.data_=e,s=e.size,r=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),s=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),s=e.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(e,t){if(ap(this.data_)){const s=this.data_,r=aP(s,e,t);return r===null?null:new hn(r)}else{const s=new Uint8Array(this.data_.buffer,e,t-e);return new hn(s,!0)}}static getBlob(...e){if(Uu()){const t=e.map(s=>s instanceof hn?s.data_:s);return new hn(oP.apply(null,t))}else{const t=e.map(o=>Fu(o)?lP(Ct.RAW,o).data:o.data_);let s=0;t.forEach(o=>{s+=o.byteLength});const r=new Uint8Array(s);let i=0;return t.forEach(o=>{for(let c=0;c<o.length;c++)r[i++]=o[c]}),new hn(r,!0)}}uploadData(){return this.data_}}/**
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
 */function J_(n){let e;try{e=JSON.parse(n)}catch{return null}return Jb(e)?e:null}/**
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
 */function pP(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function mP(n,e){const t=e.split("/").filter(s=>s.length>0).join("/");return n.length===0?t:n+"/"+t}function X_(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
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
 */function gP(n,e){return e}class ze{constructor(e,t,s,r){this.server=e,this.local=t||e,this.writable=!!s,this.xform=r||gP}}let no=null;function _P(n){return!Fu(n)||n.length<2?n:X_(n)}function Z_(){if(no)return no;const n=[];n.push(new ze("bucket")),n.push(new ze("generation")),n.push(new ze("metageneration")),n.push(new ze("name","fullPath",!0));function e(i,o){return _P(o)}const t=new ze("name");t.xform=e,n.push(t);function s(i,o){return o!==void 0?Number(o):o}const r=new ze("size");return r.xform=s,n.push(r),n.push(new ze("timeCreated")),n.push(new ze("updated")),n.push(new ze("md5Hash",null,!0)),n.push(new ze("cacheControl",null,!0)),n.push(new ze("contentDisposition",null,!0)),n.push(new ze("contentEncoding",null,!0)),n.push(new ze("contentLanguage",null,!0)),n.push(new ze("contentType",null,!0)),n.push(new ze("metadata","customMetadata",!0)),no=n,no}function yP(n,e){function t(){const s=n.bucket,r=n.fullPath,i=new ot(s,r);return e._makeStorageReference(i)}Object.defineProperty(n,"ref",{get:t})}function EP(n,e,t){const s={};s.type="file";const r=t.length;for(let i=0;i<r;i++){const o=t[i];s[o.local]=o.xform(s,e[o.server])}return yP(s,n),s}function ey(n,e,t){const s=J_(e);return s===null?null:EP(n,s,t)}function TP(n,e,t,s){const r=J_(e);if(r===null||!Fu(r.downloadTokens))return null;const i=r.downloadTokens;if(i.length===0)return null;const o=encodeURIComponent;return i.split(",").map(u=>{const f=n.bucket,p=n.fullPath,m="/b/"+o(f)+"/o/"+o(p),T=ka(m,t,s),S=z_({alt:"media",token:u});return T+S})[0]}function wP(n,e){const t={},s=e.length;for(let r=0;r<s;r++){const i=e[r];i.writable&&(t[i.server]=n[i.local])}return JSON.stringify(t)}class Bu{constructor(e,t,s,r){this.url=e,this.method=t,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function ty(n){if(!n)throw Lu()}function IP(n,e){function t(s,r){const i=ey(n,r,e);return ty(i!==null),i}return t}function vP(n,e){function t(s,r){const i=ey(n,r,e);return ty(i!==null),TP(i,r,n.host,n._protocol)}return t}function ny(n){function e(t,s){let r;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?r=xb():r=Mb():t.getStatus()===402?r=Vb(n.bucket):t.getStatus()===403?r=Lb(n.path):r=s,r.status=t.getStatus(),r.serverResponse=s.serverResponse,r}return e}function sy(n){const e=ny(n);function t(s,r){let i=e(s,r);return s.getStatus()===404&&(i=Ob(n.path)),i.serverResponse=r.serverResponse,i}return t}function AP(n,e,t){const s=e.fullServerUrl(),r=ka(s,n.host,n._protocol),i="GET",o=n.maxOperationRetryTime,c=new Bu(r,i,vP(n,t),o);return c.errorHandler=sy(e),c}function RP(n,e){const t=e.fullServerUrl(),s=ka(t,n.host,n._protocol),r="DELETE",i=n.maxOperationRetryTime;function o(l,u){}const c=new Bu(s,r,o,i);return c.successCodes=[200,204],c.errorHandler=sy(e),c}function CP(n,e){return n&&n.contentType||e&&e.type()||"application/octet-stream"}function SP(n,e,t){const s=Object.assign({},t);return s.fullPath=n.path,s.size=e.size(),s.contentType||(s.contentType=CP(null,e)),s}function bP(n,e,t,s,r){const i=e.bucketOnlyServerUrl(),o={"X-Goog-Upload-Protocol":"multipart"};function c(){let Q="";for(let ne=0;ne<2;ne++)Q=Q+Math.random().toString().slice(2);return Q}const l=c();o["Content-Type"]="multipart/related; boundary="+l;const u=SP(e,s,r),f=wP(u,t),p="--"+l+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+f+`\r
--`+l+`\r
Content-Type: `+u.contentType+`\r
\r
`,m=`\r
--`+l+"--",T=hn.getBlob(p,s,m);if(T===null)throw Wb();const S={name:u.fullPath},k=ka(i,n.host,n._protocol),N="POST",$=n.maxUploadRetryTime,j=new Bu(k,N,IP(n,t),$);return j.urlParams=S,j.headers=o,j.body=T.uploadData(),j.errorHandler=ny(e),j}class PP{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Kn.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Kn.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Kn.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,s,r,i){if(this.sent_)throw Ir("cannot .send() more than once");if(wt(e)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),i!==void 0)for(const o in i)i.hasOwnProperty(o)&&this.xhr_.setRequestHeader(o,i[o].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw Ir("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw Ir("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw Ir("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw Ir("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class kP extends PP{initXhr(){this.xhr_.responseType="text"}}function qu(){return new kP}/**
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
 */class ts{constructor(e,t){this._service=e,t instanceof ot?this._location=t:this._location=ot.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new ts(e,t)}get root(){const e=new ot(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return X_(this._location.path)}get storage(){return this._service}get parent(){const e=pP(this._location.path);if(e===null)return null;const t=new ot(this._location.bucket,e);return new ts(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw Gb(e)}}function NP(n,e,t){n._throwIfRoot("uploadBytes");const s=bP(n.storage,n._location,Z_(),new hn(e,!0),t);return n.storage.makeRequestWithTokens(s,qu).then(r=>({metadata:r,ref:n}))}function DP(n){n._throwIfRoot("getDownloadURL");const e=AP(n.storage,n._location,Z_());return n.storage.makeRequestWithTokens(e,qu).then(t=>{if(t===null)throw jb();return t})}function OP(n){n._throwIfRoot("deleteObject");const e=RP(n.storage,n._location);return n.storage.makeRequestWithTokens(e,qu)}function VP(n,e){const t=mP(n._location.path,e),s=new ot(n._location.bucket,t);return new ts(n.storage,s)}/**
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
 */function MP(n){return/^[A-Za-z]+:\/\//.test(n)}function xP(n,e){return new ts(n,e)}function ry(n,e){if(n instanceof $u){const t=n;if(t._bucket==null)throw $b();const s=new ts(t,t._bucket);return e!=null?ry(s,e):s}else return e!==void 0?VP(n,e):n}function LP(n,e){if(e&&MP(e)){if(n instanceof $u)return xP(n,e);throw ol("To use ref(service, url), the first argument must be a Storage instance.")}else return ry(n,e)}function lp(n,e){const t=e==null?void 0:e[H_];return t==null?null:ot.makeFromBucketSpec(t,n)}function FP(n,e,t,s={}){n.host=`${e}:${t}`;const r=wt(e);r&&ui(`https://${n.host}/b`),n._isUsingEmulator=!0,n._protocol=r?"https":"http";const{mockUserToken:i}=s;i&&(n._overrideAuthToken=typeof i=="string"?i:Al(i,n.app.options.projectId))}class $u{constructor(e,t,s,r,i,o=!1){this.app=e,this._authProvider=t,this._appCheckProvider=s,this._url=r,this._firebaseVersion=i,this._isUsingEmulator=o,this._bucket=null,this._host=j_,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=Nb,this._maxUploadRetryTime=Db,this._requests=new Set,r!=null?this._bucket=ot.makeFromBucketSpec(r,this._host):this._bucket=lp(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=ot.makeFromBucketSpec(this._url,e):this._bucket=lp(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){cp("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){cp("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(qe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new ts(this,e)}_makeRequest(e,t,s,r,i=!0){if(this._deleted)return new zb(G_());{const o=rP(e,this._appId,s,r,t,this._firebaseVersion,i,this._isUsingEmulator);return this._requests.add(o),o.getPromise().then(()=>this._requests.delete(o),()=>this._requests.delete(o)),o}}async makeRequestWithTokens(e,t){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,s,r).getPromise()}}const up="@firebase/storage",hp="0.14.3";/**
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
 */const iy="storage";function lO(n,e,t){return n=W(n),NP(n,e,t)}function uO(n){return n=W(n),DP(n)}function hO(n){return n=W(n),OP(n)}function dO(n,e){return n=W(n),LP(n,e)}function fO(n=zs(),e){n=W(n);const s=Jt(n,iy).getImmediate({identifier:e}),r=oa("storage");return r&&UP(s,...r),s}function UP(n,e,t,s={}){FP(n,e,t,s)}function BP(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),s=n.getProvider("auth-internal"),r=n.getProvider("app-check-internal");return new $u(t,s,r,e,Pn)}function qP(){ct(new tt(iy,BP,"PUBLIC").setMultipleInstances(!0)),Ve(up,hp,""),Ve(up,hp,"esm2020")}qP();var dp={};const fp="@firebase/database",pp="1.1.3";/**
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
 */let oy="";function $P(n){oy=n}/**
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
 */class WP{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){t==null?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),Oe(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return t==null?null:Hr(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}/**
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
 */class jP{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){t==null?delete this.cache_[e]:this.cache_[e]=t}get(e){return Vt(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}/**
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
 */const ay=function(n){try{if(typeof window<"u"&&typeof window[n]<"u"){const e=window[n];return e.setItem("firebase:sentinel","cache"),e.removeItem("firebase:sentinel"),new WP(e)}}catch{}return new jP},Hn=ay("localStorage"),HP=ay("sessionStorage");/**
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
 */const Ps=new ca("@firebase/database"),GP=(function(){let n=1;return function(){return n++}})(),cy=function(n){const e=wT(n),t=new _T;t.update(e);const s=t.digest();return vl.encodeByteArray(s)},bi=function(...n){let e="";for(let t=0;t<n.length;t++){const s=n[t];Array.isArray(s)||s&&typeof s=="object"&&typeof s.length=="number"?e+=bi.apply(null,s):typeof s=="object"?e+=Oe(s):e+=s,e+=" "}return e};let Br=null,mp=!0;const zP=function(n,e){D(!0,"Can't turn on custom loggers persistently."),Ps.logLevel=Y.VERBOSE,Br=Ps.log.bind(Ps)},Me=function(...n){if(mp===!0&&(mp=!1,Br===null&&HP.get("logging_enabled")===!0&&zP()),Br){const e=bi.apply(null,n);Br(e)}},Pi=function(n){return function(...e){Me(n,...e)}},al=function(...n){const e="FIREBASE INTERNAL ERROR: "+bi(...n);Ps.error(e)},Qt=function(...n){const e=`FIREBASE FATAL ERROR: ${bi(...n)}`;throw Ps.error(e),new Error(e)},et=function(...n){const e="FIREBASE WARNING: "+bi(...n);Ps.warn(e)},KP=function(){typeof window<"u"&&window.location&&window.location.protocol&&window.location.protocol.indexOf("https:")!==-1&&et("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().")},Na=function(n){return typeof n=="number"&&(n!==n||n===Number.POSITIVE_INFINITY||n===Number.NEGATIVE_INFINITY)},QP=function(n){if(document.readyState==="complete")n();else{let e=!1;const t=function(){if(!document.body){setTimeout(t,Math.floor(10));return}e||(e=!0,n())};document.addEventListener?(document.addEventListener("DOMContentLoaded",t,!1),window.addEventListener("load",t,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{document.readyState==="complete"&&t()}),window.attachEvent("onload",t))}},Bs="[MIN_NAME]",ns="[MAX_NAME]",ds=function(n,e){if(n===e)return 0;if(n===Bs||e===ns)return-1;if(e===Bs||n===ns)return 1;{const t=gp(n),s=gp(e);return t!==null?s!==null?t-s===0?n.length-e.length:t-s:-1:s!==null?1:n<e?-1:1}},YP=function(n,e){return n===e?0:n<e?-1:1},vr=function(n,e){if(e&&n in e)return e[n];throw new Error("Missing required key ("+n+") in object: "+Oe(e))},Wu=function(n){if(typeof n!="object"||n===null)return Oe(n);const e=[];for(const s in n)e.push(s);e.sort();let t="{";for(let s=0;s<e.length;s++)s!==0&&(t+=","),t+=Oe(e[s]),t+=":",t+=Wu(n[e[s]]);return t+="}",t},ly=function(n,e){const t=n.length;if(t<=e)return[n];const s=[];for(let r=0;r<t;r+=e)r+e>t?s.push(n.substring(r,t)):s.push(n.substring(r,r+e));return s};function je(n,e){for(const t in n)n.hasOwnProperty(t)&&e(t,n[t])}const uy=function(n){D(!Na(n),"Invalid JSON number");const e=11,t=52,s=(1<<e-1)-1;let r,i,o,c,l;n===0?(i=0,o=0,r=1/n===-1/0?1:0):(r=n<0,n=Math.abs(n),n>=Math.pow(2,1-s)?(c=Math.min(Math.floor(Math.log(n)/Math.LN2),s),i=c+s,o=Math.round(n*Math.pow(2,t-c)-Math.pow(2,t))):(i=0,o=Math.round(n/Math.pow(2,1-s-t))));const u=[];for(l=t;l;l-=1)u.push(o%2?1:0),o=Math.floor(o/2);for(l=e;l;l-=1)u.push(i%2?1:0),i=Math.floor(i/2);u.push(r?1:0),u.reverse();const f=u.join("");let p="";for(l=0;l<64;l+=8){let m=parseInt(f.substr(l,8),2).toString(16);m.length===1&&(m="0"+m),p=p+m}return p.toLowerCase()},JP=function(){return!!(typeof window=="object"&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))},XP=function(){return typeof Windows=="object"&&typeof Windows.UI=="object"};function ZP(n,e){let t="Unknown Error";n==="too_big"?t="The data requested exceeds the maximum size that can be accessed with a single request.":n==="permission_denied"?t="Client doesn't have permission to access the desired data.":n==="unavailable"&&(t="The service is unavailable");const s=new Error(n+" at "+e._path.toString()+": "+t);return s.code=n.toUpperCase(),s}const ek=new RegExp("^-?(0*)\\d{1,10}$"),tk=-2147483648,nk=2147483647,gp=function(n){if(ek.test(n)){const e=Number(n);if(e>=tk&&e<=nk)return e}return null},nr=function(n){try{n()}catch(e){setTimeout(()=>{const t=e.stack||"";throw et("Exception was thrown by user callback.",t),e},Math.floor(0))}},sk=function(){return(typeof window=="object"&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0},qr=function(n,e){const t=setTimeout(n,e);return typeof t=="number"&&typeof Deno<"u"&&Deno.unrefTimer?Deno.unrefTimer(t):typeof t=="object"&&t.unref&&t.unref(),t};/**
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
 */class rk{constructor(e,t){this.appCheckProvider=t,this.appName=e.name,qe(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.appCheck=t==null?void 0:t.getImmediate({optional:!0}),this.appCheck||t==null||t.get().then(s=>this.appCheck=s)}getToken(e){if(this.serverAppAppCheckToken){if(e)throw new Error("Attempted reuse of `FirebaseServerApp.appCheckToken` after previous usage failed.");return Promise.resolve({token:this.serverAppAppCheckToken})}return this.appCheck?this.appCheck.getToken(e):new Promise((t,s)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){var t;(t=this.appCheckProvider)==null||t.get().then(s=>s.addTokenListener(e))}notifyForInvalidToken(){et(`Provided AppCheck credentials for the app named "${this.appName}" are invalid. This usually indicates your app was not initialized correctly.`)}}/**
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
 */class ik{constructor(e,t,s){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=s,this.auth_=null,this.auth_=s.getImmediate({optional:!0}),this.auth_||s.onInit(r=>this.auth_=r)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(t=>t&&t.code==="auth/token-not-initialized"?(Me("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(t)):new Promise((t,s)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,s):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',et(e)}}class go{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}go.OWNER="owner";/**
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
 */const ju="5",hy="v",dy="s",fy="r",py="f",my=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,gy="ls",_y="p",cl="ac",yy="websocket",Ey="long_polling";/**
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
 */class Ty{constructor(e,t,s,r,i=!1,o="",c=!1,l=!1,u=null){this.secure=t,this.namespace=s,this.webSocketOnly=r,this.nodeAdmin=i,this.persistenceKey=o,this.includeNamespaceInQueryParams=c,this.isUsingEmulator=l,this.emulatorOptions=u,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=Hn.get("host:"+e)||this._host}isCacheableHost(){return this.internalHost.substr(0,2)==="s-"}isCustomHost(){return this._domain!=="firebaseio.com"&&this._domain!=="firebaseio-demo.com"}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&Hn.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function ok(n){return n.host!==n.internalHost||n.isCustomHost()||n.includeNamespaceInQueryParams}function wy(n,e,t){D(typeof e=="string","typeof type must == string"),D(typeof t=="object","typeof params must == object");let s;if(e===yy)s=(n.secure?"wss://":"ws://")+n.internalHost+"/.ws?";else if(e===Ey)s=(n.secure?"https://":"http://")+n.internalHost+"/.lp?";else throw new Error("Unknown connection type: "+e);ok(n)&&(t.ns=n.namespace);const r=[];return je(t,(i,o)=>{r.push(i+"="+o)}),s+r.join("&")}/**
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
 */class ak{constructor(){this.counters_={}}incrementCounter(e,t=1){Vt(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return ZE(this.counters_)}}/**
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
 */const bc={},Pc={};function Hu(n){const e=n.toString();return bc[e]||(bc[e]=new ak),bc[e]}function ck(n,e){const t=n.toString();return Pc[t]||(Pc[t]=e()),Pc[t]}/**
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
 */class lk{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const s=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let r=0;r<s.length;++r)s[r]&&nr(()=>{this.onMessage_(s[r])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}/**
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
 */const _p="start",uk="close",hk="pLPCommand",dk="pRTLPCB",Iy="id",vy="pw",Ay="ser",fk="cb",pk="seg",mk="ts",gk="d",_k="dframe",Ry=1870,Cy=30,yk=Ry-Cy,Ek=25e3,Tk=3e4;class vs{constructor(e,t,s,r,i,o,c){this.connId=e,this.repoInfo=t,this.applicationId=s,this.appCheckToken=r,this.authToken=i,this.transportSessionId=o,this.lastSessionId=c,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=Pi(e),this.stats_=Hu(t),this.urlFn=l=>(this.appCheckToken&&(l[cl]=this.appCheckToken),wy(t,Ey,l))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new lk(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(Tk)),QP(()=>{if(this.isClosed_)return;this.scriptTagHolder=new Gu((...i)=>{const[o,c,l,u,f]=i;if(this.incrementIncomingBytes_(i),!!this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,o===_p)this.id=c,this.password=l;else if(o===uk)c?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(c,()=>{this.onClosed_()})):this.onClosed_();else throw new Error("Unrecognized command received: "+o)},(...i)=>{const[o,c]=i;this.incrementIncomingBytes_(i),this.myPacketOrderer.handleResponse(o,c)},()=>{this.onClosed_()},this.urlFn);const s={};s[_p]="t",s[Ay]=Math.floor(Math.random()*1e8),this.scriptTagHolder.uniqueCallbackIdentifier&&(s[fk]=this.scriptTagHolder.uniqueCallbackIdentifier),s[hy]=ju,this.transportSessionId&&(s[dy]=this.transportSessionId),this.lastSessionId&&(s[gy]=this.lastSessionId),this.applicationId&&(s[_y]=this.applicationId),this.appCheckToken&&(s[cl]=this.appCheckToken),typeof location<"u"&&location.hostname&&my.test(location.hostname)&&(s[fy]=py);const r=this.urlFn(s);this.log_("Connecting via long-poll to "+r),this.scriptTagHolder.addTag(r,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){vs.forceAllow_=!0}static forceDisallow(){vs.forceDisallow_=!0}static isAvailable(){return vs.forceAllow_?!0:!vs.forceDisallow_&&typeof document<"u"&&document.createElement!=null&&!JP()&&!XP()}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=Oe(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=Zp(t),r=ly(s,yk);for(let i=0;i<r.length;i++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,r.length,r[i]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const s={};s[_k]="t",s[Iy]=e,s[vy]=t,this.myDisconnFrame.src=this.urlFn(s),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=Oe(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class Gu{constructor(e,t,s,r){this.onDisconnect=s,this.urlFn=r,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(Math.random()*1e8),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=GP(),window[hk+this.uniqueCallbackIdentifier]=e,window[dk+this.uniqueCallbackIdentifier]=t,this.myIFrame=Gu.createIFrame_();let i="";this.myIFrame.src&&this.myIFrame.src.substr(0,11)==="javascript:"&&(i='<script>document.domain="'+document.domain+'";<\/script>');const o="<html><body>"+i+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(o),this.myIFrame.doc.close()}catch(c){Me("frame writing exception"),c.stack&&Me(c.stack),Me(c)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",document.body){document.body.appendChild(e);try{e.contentWindow.document||Me("No IE domain setting required")}catch{const s=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+s+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{this.myIFrame!==null&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e[Iy]=this.myID,e[vy]=this.myPW,e[Ay]=this.currentSerial;let t=this.urlFn(e),s="",r=0;for(;this.pendingSegs.length>0&&this.pendingSegs[0].d.length+Cy+s.length<=Ry;){const o=this.pendingSegs.shift();s=s+"&"+pk+r+"="+o.seg+"&"+mk+r+"="+o.ts+"&"+gk+r+"="+o.d,r++}return t=t+s,this.addLongPollTag_(t,this.currentSerial),!0}else return!1}enqueueSegment(e,t,s){this.pendingSegs.push({seg:e,ts:t,d:s}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const s=()=>{this.outstandingRequests.delete(t),this.newRequest_()},r=setTimeout(s,Math.floor(Ek)),i=()=>{clearTimeout(r),s()};this.addTag(e,i)}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const s=this.myIFrame.doc.createElement("script");s.type="text/javascript",s.async=!0,s.src=e,s.onload=s.onreadystatechange=function(){const r=s.readyState;(!r||r==="loaded"||r==="complete")&&(s.onload=s.onreadystatechange=null,s.parentNode&&s.parentNode.removeChild(s),t())},s.onerror=()=>{Me("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(s)}catch{}},Math.floor(1))}}/**
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
 */const wk=16384,Ik=45e3;let Wo=null;typeof MozWebSocket<"u"?Wo=MozWebSocket:typeof WebSocket<"u"&&(Wo=WebSocket);class pt{constructor(e,t,s,r,i,o,c){this.connId=e,this.applicationId=s,this.appCheckToken=r,this.authToken=i,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=Pi(this.connId),this.stats_=Hu(t),this.connURL=pt.connectionURL_(t,o,c,r,s),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,s,r,i){const o={};return o[hy]=ju,typeof location<"u"&&location.hostname&&my.test(location.hostname)&&(o[fy]=py),t&&(o[dy]=t),s&&(o[gy]=s),r&&(o[cl]=r),i&&(o[_y]=i),wy(e,yy,o)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,Hn.set("previous_websocket_failure",!0);try{let s;lT(),this.mySock=new Wo(this.connURL,[],s)}catch(s){this.log_("Error instantiating WebSocket.");const r=s.message||s.data;r&&this.log_(r),this.onClosed_();return}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=s=>{this.handleIncomingFrame(s)},this.mySock.onerror=s=>{this.log_("WebSocket error.  Closing connection.");const r=s.message||s.data;r&&this.log_(r),this.onClosed_()}}start(){}static forceDisallow(){pt.forceDisallow_=!0}static isAvailable(){let e=!1;if(typeof navigator<"u"&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,s=navigator.userAgent.match(t);s&&s.length>1&&parseFloat(s[1])<4.4&&(e=!0)}return!e&&Wo!==null&&!pt.forceDisallow_}static previouslyFailed(){return Hn.isInMemoryStorage||Hn.get("previous_websocket_failure")===!0}markConnectionHealthy(){Hn.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const t=this.frames.join("");this.frames=null;const s=Hr(t);this.onMessage(s)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(D(this.frames===null,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(this.mySock===null)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),this.frames!==null)this.appendFrame_(t);else{const s=this.extractFrameCount_(t);s!==null&&this.appendFrame_(s)}}send(e){this.resetKeepAlive();const t=Oe(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const s=ly(t,wk);s.length>1&&this.sendString_(String(s.length));for(let r=0;r<s.length;r++)this.sendString_(s[r])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(Ik))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}pt.responsesRequiredToBeHealthy=2;pt.healthyTimeout=3e4;/**
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
 */class si{static get ALL_TRANSPORTS(){return[vs,pt]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}constructor(e){this.initTransports_(e)}initTransports_(e){const t=pt&&pt.isAvailable();let s=t&&!pt.previouslyFailed();if(e.webSocketOnly&&(t||et("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),s=!0),s)this.transports_=[pt];else{const r=this.transports_=[];for(const i of si.ALL_TRANSPORTS)i&&i.isAvailable()&&r.push(i);si.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}si.globalTransportInitialized_=!1;/**
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
 */const vk=6e4,Ak=5e3,Rk=10*1024,Ck=100*1024,kc="t",yp="d",Sk="s",Ep="r",bk="e",Tp="o",wp="a",Ip="n",vp="p",Pk="h";class kk{constructor(e,t,s,r,i,o,c,l,u,f){this.id=e,this.repoInfo_=t,this.applicationId_=s,this.appCheckToken_=r,this.authToken_=i,this.onMessage_=o,this.onReady_=c,this.onDisconnect_=l,this.onKill_=u,this.lastSessionId=f,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=Pi("c:"+this.id+":"),this.transportManager_=new si(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),s=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,s)},Math.floor(0));const r=e.healthyTimeout||0;r>0&&(this.healthyTimeout_=qr(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>Ck?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>Rk?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(r)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{this.state_!==2&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if(kc in e){const t=e[kc];t===wp?this.upgradeIfSecondaryHealthy_():t===Ep?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),(this.tx_===this.secondaryConn_||this.rx_===this.secondaryConn_)&&this.close()):t===Tp&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=vr("t",e),s=vr("d",e);if(t==="c")this.onSecondaryControl_(s);else if(t==="d")this.pendingDataMessages.push(s);else throw new Error("Unknown protocol layer: "+t)}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:vp,d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:wp,d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:Ip,d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=vr("t",e),s=vr("d",e);t==="c"?this.onControl_(s):t==="d"&&this.onDataMessage_(s)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=vr(kc,e);if(yp in e){const s=e[yp];if(t===Pk){const r={...s};this.repoInfo_.isUsingEmulator&&(r.h=this.repoInfo_.host),this.onHandshake_(r)}else if(t===Ip){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let r=0;r<this.pendingDataMessages.length;++r)this.onDataMessage_(this.pendingDataMessages[r]);this.pendingDataMessages=[],this.tryCleanupConnection()}else t===Sk?this.onConnectionShutdown_(s):t===Ep?this.onReset_(s):t===bk?al("Server Error: "+s):t===Tp?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):al("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,s=e.v,r=e.h;this.sessionId=e.s,this.repoInfo_.host=r,this.state_===0&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),ju!==s&&et("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),s=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,s),qr(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(vk))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,this.state_===1?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),this.primaryResponsesRequired_===0?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):qr(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(Ak))}sendPingOnPrimaryIfNecessary_(){!this.isHealthy_&&this.state_===1&&(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:vp,d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,(this.tx_===e||this.rx_===e)&&this.close()}onConnectionLost_(e){this.conn_=null,!e&&this.state_===0?(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(Hn.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)):this.state_===1&&this.log_("Realtime connection lost."),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(this.state_!==1)throw"Connection is not connected";this.tx_.send(e)}close(){this.state_!==2&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}/**
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
 */class Sy{put(e,t,s,r){}merge(e,t,s,r){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,s){}onDisconnectMerge(e,t,s){}onDisconnectCancel(e,t){}reportStats(e){}}/**
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
 */class by{constructor(e){this.allowedEvents_=e,this.listeners_={},D(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const s=[...this.listeners_[e]];for(let r=0;r<s.length;r++)s[r].callback.apply(s[r].context,t)}}on(e,t,s){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:s});const r=this.getInitialEvent(e);r&&t.apply(s,r)}off(e,t,s){this.validateEventType_(e);const r=this.listeners_[e]||[];for(let i=0;i<r.length;i++)if(r[i].callback===t&&(!s||s===r[i].context)){r.splice(i,1);return}}validateEventType_(e){D(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}/**
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
 */class jo extends by{static getInstance(){return new jo}constructor(){super(["online"]),this.online_=!0,typeof window<"u"&&typeof window.addEventListener<"u"&&!Rl()&&(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}getInitialEvent(e){return D(e==="online","Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}/**
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
 */const Ap=32,Rp=768;class re{constructor(e,t){if(t===void 0){this.pieces_=e.split("/");let s=0;for(let r=0;r<this.pieces_.length;r++)this.pieces_[r].length>0&&(this.pieces_[s]=this.pieces_[r],s++);this.pieces_.length=s,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)this.pieces_[t]!==""&&(e+="/"+this.pieces_[t]);return e||"/"}}function te(){return new re("")}function G(n){return n.pieceNum_>=n.pieces_.length?null:n.pieces_[n.pieceNum_]}function Sn(n){return n.pieces_.length-n.pieceNum_}function oe(n){let e=n.pieceNum_;return e<n.pieces_.length&&e++,new re(n.pieces_,e)}function zu(n){return n.pieceNum_<n.pieces_.length?n.pieces_[n.pieces_.length-1]:null}function Nk(n){let e="";for(let t=n.pieceNum_;t<n.pieces_.length;t++)n.pieces_[t]!==""&&(e+="/"+encodeURIComponent(String(n.pieces_[t])));return e||"/"}function ri(n,e=0){return n.pieces_.slice(n.pieceNum_+e)}function Py(n){if(n.pieceNum_>=n.pieces_.length)return null;const e=[];for(let t=n.pieceNum_;t<n.pieces_.length-1;t++)e.push(n.pieces_[t]);return new re(e,0)}function _e(n,e){const t=[];for(let s=n.pieceNum_;s<n.pieces_.length;s++)t.push(n.pieces_[s]);if(e instanceof re)for(let s=e.pieceNum_;s<e.pieces_.length;s++)t.push(e.pieces_[s]);else{const s=e.split("/");for(let r=0;r<s.length;r++)s[r].length>0&&t.push(s[r])}return new re(t,0)}function z(n){return n.pieceNum_>=n.pieces_.length}function Je(n,e){const t=G(n),s=G(e);if(t===null)return e;if(t===s)return Je(oe(n),oe(e));throw new Error("INTERNAL ERROR: innerPath ("+e+") is not within outerPath ("+n+")")}function Dk(n,e){const t=ri(n,0),s=ri(e,0);for(let r=0;r<t.length&&r<s.length;r++){const i=ds(t[r],s[r]);if(i!==0)return i}return t.length===s.length?0:t.length<s.length?-1:1}function Ku(n,e){if(Sn(n)!==Sn(e))return!1;for(let t=n.pieceNum_,s=e.pieceNum_;t<=n.pieces_.length;t++,s++)if(n.pieces_[t]!==e.pieces_[s])return!1;return!0}function ut(n,e){let t=n.pieceNum_,s=e.pieceNum_;if(Sn(n)>Sn(e))return!1;for(;t<n.pieces_.length;){if(n.pieces_[t]!==e.pieces_[s])return!1;++t,++s}return!0}class Ok{constructor(e,t){this.errorPrefix_=t,this.parts_=ri(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let s=0;s<this.parts_.length;s++)this.byteLength_+=aa(this.parts_[s]);ky(this)}}function Vk(n,e){n.parts_.length>0&&(n.byteLength_+=1),n.parts_.push(e),n.byteLength_+=aa(e),ky(n)}function Mk(n){const e=n.parts_.pop();n.byteLength_-=aa(e),n.parts_.length>0&&(n.byteLength_-=1)}function ky(n){if(n.byteLength_>Rp)throw new Error(n.errorPrefix_+"has a key path longer than "+Rp+" bytes ("+n.byteLength_+").");if(n.parts_.length>Ap)throw new Error(n.errorPrefix_+"path specified exceeds the maximum depth that can be written ("+Ap+") or object contains a cycle "+Bn(n))}function Bn(n){return n.parts_.length===0?"":"in property '"+n.parts_.join(".")+"'"}/**
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
 */class Qu extends by{static getInstance(){return new Qu}constructor(){super(["visible"]);let e,t;typeof document<"u"&&typeof document.addEventListener<"u"&&(typeof document.hidden<"u"?(t="visibilitychange",e="hidden"):typeof document.mozHidden<"u"?(t="mozvisibilitychange",e="mozHidden"):typeof document.msHidden<"u"?(t="msvisibilitychange",e="msHidden"):typeof document.webkitHidden<"u"&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const s=!document[e];s!==this.visible_&&(this.visible_=s,this.trigger("visible",s))},!1)}getInitialEvent(e){return D(e==="visible","Unknown event type: "+e),[this.visible_]}}/**
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
 */const Ar=1e3,xk=300*1e3,Cp=30*1e3,Lk=1.3,Fk=3e4,Uk="server_kill",Sp=3;class Wt extends Sy{constructor(e,t,s,r,i,o,c,l){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=s,this.onConnectStatus_=r,this.onServerInfoUpdate_=i,this.authTokenProvider_=o,this.appCheckTokenProvider_=c,this.authOverride_=l,this.id=Wt.nextPersistentConnectionId_++,this.log_=Pi("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Ar,this.maxReconnectDelay_=xk,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,l)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");Qu.getInstance().on("visible",this.onVisible_,this),e.host.indexOf("fblocal")===-1&&jo.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,s){const r=++this.requestNumber_,i={r,a:e,b:t};this.log_(Oe(i)),D(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(i),s&&(this.requestCBHash_[r]=s)}get(e){this.initConnection_();const t=new Ft,r={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:o=>{const c=o.d;o.s==="ok"?t.resolve(c):t.reject(c)}};this.outstandingGets_.push(r),this.outstandingGetCount_++;const i=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(i),t.promise}listen(e,t,s,r){this.initConnection_();const i=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+i),this.listens.has(o)||this.listens.set(o,new Map),D(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),D(!this.listens.get(o).has(i),"listen() called twice for same path/queryId.");const c={onComplete:r,hashFn:t,query:e,tag:s};this.listens.get(o).set(i,c),this.connected_&&this.sendListen_(c)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,s=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,this.outstandingGetCount_===0&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(s)})}sendListen_(e){const t=e.query,s=t._path.toString(),r=t._queryIdentifier;this.log_("Listen on "+s+" for "+r);const i={p:s},o="q";e.tag&&(i.q=t._queryObject,i.t=e.tag),i.h=e.hashFn(),this.sendRequest(o,i,c=>{const l=c.d,u=c.s;Wt.warnOnListenWarnings_(l,t),(this.listens.get(s)&&this.listens.get(s).get(r))===e&&(this.log_("listen response",c),u!=="ok"&&this.removeListen_(s,r),e.onComplete&&e.onComplete(u,l))})}static warnOnListenWarnings_(e,t){if(e&&typeof e=="object"&&Vt(e,"w")){const s=Ds(e,"w");if(Array.isArray(s)&&~s.indexOf("no_index")){const r='".indexOn": "'+t._queryParams.getIndex().toString()+'"',i=t._path.toString();et(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${r} at ${i} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&e.length===40||gT(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=Cp)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=mT(e)?"auth":"gauth",s={cred:e};this.authOverride_===null?s.noauth=!0:typeof this.authOverride_=="object"&&(s.authvar=this.authOverride_),this.sendRequest(t,s,r=>{const i=r.s,o=r.d||"error";this.authToken_===e&&(i==="ok"?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(i,o))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,s=e.d||"error";t==="ok"?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,s)})}unlisten(e,t){const s=e._path.toString(),r=e._queryIdentifier;this.log_("Unlisten called for "+s+" "+r),D(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query"),this.removeListen_(s,r)&&this.connected_&&this.sendUnlisten_(s,r,e._queryObject,t)}sendUnlisten_(e,t,s,r){this.log_("Unlisten on "+e+" for "+t);const i={p:e},o="n";r&&(i.q=s,i.t=r),this.sendRequest(o,i)}onDisconnectPut(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:s})}onDisconnectMerge(e,t,s){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,s):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:s})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,s,r){const i={p:t,d:s};this.log_("onDisconnect "+e,i),this.sendRequest(e,i,o=>{r&&setTimeout(()=>{r(o.s,o.d)},Math.floor(0))})}put(e,t,s,r){this.putInternal("p",e,t,s,r)}merge(e,t,s,r){this.putInternal("m",e,t,s,r)}putInternal(e,t,s,r,i){this.initConnection_();const o={p:t,d:s};i!==void 0&&(o.h=i),this.outstandingPuts_.push({action:e,request:o,onComplete:r}),this.outstandingPutCount_++;const c=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(c):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,s=this.outstandingPuts_[e].request,r=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,s,i=>{this.log_(t+" response",i),delete this.outstandingPuts_[e],this.outstandingPutCount_--,this.outstandingPutCount_===0&&(this.outstandingPuts_=[]),r&&r(i.s,i.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,s=>{if(s.s!=="ok"){const i=s.d;this.log_("reportStats","Error sending stats: "+i)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+Oe(e));const t=e.r,s=this.requestCBHash_[t];s&&(delete this.requestCBHash_[t],s(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),e==="d"?this.onDataUpdate_(t.p,t.d,!1,t.t):e==="m"?this.onDataUpdate_(t.p,t.d,!0,t.t):e==="c"?this.onListenRevoked_(t.p,t.q):e==="ac"?this.onAuthRevoked_(t.s,t.d):e==="apc"?this.onAppCheckRevoked_(t.s,t.d):e==="sd"?this.onSecurityDebugPacket_(t):al("Unrecognized action received from server: "+Oe(e)+`
Are you using the latest client?`)}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=new Date().getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){D(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Ar,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Ar,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){this.visible_?this.lastConnectionEstablishedTime_&&(new Date().getTime()-this.lastConnectionEstablishedTime_>Fk&&(this.reconnectDelay_=Ar),this.lastConnectionEstablishedTime_=null):(this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=new Date().getTime());const e=Math.max(0,new Date().getTime()-this.lastConnectionAttemptTime_);let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,this.reconnectDelay_*Lk)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=new Date().getTime(),this.lastConnectionEstablishedTime_=null;const e=this.onDataMessage_.bind(this),t=this.onReady_.bind(this),s=this.onRealtimeDisconnect_.bind(this),r=this.id+":"+Wt.nextConnectionId_++,i=this.lastSessionId;let o=!1,c=null;const l=function(){c?c.close():(o=!0,s())},u=function(p){D(c,"sendRequest call when we're not connected not allowed."),c.sendRequest(p)};this.realtime_={close:l,sendRequest:u};const f=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[p,m]=await Promise.all([this.authTokenProvider_.getToken(f),this.appCheckTokenProvider_.getToken(f)]);o?Me("getToken() completed but was canceled"):(Me("getToken() completed. Creating connection."),this.authToken_=p&&p.accessToken,this.appCheckToken_=m&&m.token,c=new kk(r,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,e,t,s,T=>{et(T+" ("+this.repoInfo_.toString()+")"),this.interrupt(Uk)},i))}catch(p){this.log_("Failed to get token: "+p),o||(this.repoInfo_.nodeAdmin&&et(p),l())}}}interrupt(e){Me("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){Me("Resuming connection for reason: "+e),delete this.interruptReasons_[e],Eo(this.interruptReasons_)&&(this.reconnectDelay_=Ar,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-new Date().getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}this.outstandingPutCount_===0&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let s;t?s=t.map(i=>Wu(i)).join("$"):s="default";const r=this.removeListen_(e,s);r&&r.onComplete&&r.onComplete("permission_denied")}removeListen_(e,t){const s=new re(e).toString();let r;if(this.listens.has(s)){const i=this.listens.get(s);r=i.get(t),i.delete(t),i.size===0&&this.listens.delete(s)}else r=void 0;return r}onAuthRevoked_(e,t){Me("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),(e==="invalid_token"||e==="permission_denied")&&(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=Sp&&(this.reconnectDelay_=Cp,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){Me("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,(e==="invalid_token"||e==="permission_denied")&&(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=Sp&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace(`
`,`
FIREBASE: `))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};let t="js";e["sdk."+t+"."+oy.replace(/\./g,"-")]=1,Rl()?e["framework.cordova"]=1:rm()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=jo.getInstance().currentlyOnline();return Eo(this.interruptReasons_)&&e}}Wt.nextPersistentConnectionId_=0;Wt.nextConnectionId_=0;/**
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
 */class K{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new K(e,t)}}/**
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
 */class Da{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const s=new K(Bs,e),r=new K(Bs,t);return this.compare(s,r)!==0}minPost(){return K.MIN}}/**
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
 */let so;class Ny extends Da{static get __EMPTY_NODE(){return so}static set __EMPTY_NODE(e){so=e}compare(e,t){return ds(e.name,t.name)}isDefinedOn(e){throw Hs("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return K.MIN}maxPost(){return new K(ns,so)}makePost(e,t){return D(typeof e=="string","KeyIndex indexValue must always be a string."),new K(e,so)}toString(){return".key"}}const ks=new Ny;/**
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
 */class ro{constructor(e,t,s,r,i=null){this.isReverse_=r,this.resultGenerator_=i,this.nodeStack_=[];let o=1;for(;!e.isEmpty();)if(e=e,o=t?s(e.key,t):1,r&&(o*=-1),o<0)this.isReverse_?e=e.left:e=e.right;else if(o===0){this.nodeStack_.push(e);break}else this.nodeStack_.push(e),this.isReverse_?e=e.right:e=e.left}getNext(){if(this.nodeStack_.length===0)return null;let e=this.nodeStack_.pop(),t;if(this.resultGenerator_?t=this.resultGenerator_(e.key,e.value):t={key:e.key,value:e.value},this.isReverse_)for(e=e.left;!e.isEmpty();)this.nodeStack_.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack_.push(e),e=e.left;return t}hasNext(){return this.nodeStack_.length>0}peek(){if(this.nodeStack_.length===0)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}}class Ne{constructor(e,t,s,r,i){this.key=e,this.value=t,this.color=s??Ne.RED,this.left=r??Xe.EMPTY_NODE,this.right=i??Xe.EMPTY_NODE}copy(e,t,s,r,i){return new Ne(e??this.key,t??this.value,s??this.color,r??this.left,i??this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let r=this;const i=s(e,r.key);return i<0?r=r.copy(null,null,null,r.left.insert(e,t,s),null):i===0?r=r.copy(null,t,null,null,null):r=r.copy(null,null,null,null,r.right.insert(e,t,s)),r.fixUp_()}removeMin_(){if(this.left.isEmpty())return Xe.EMPTY_NODE;let e=this;return!e.left.isRed_()&&!e.left.left.isRed_()&&(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let s,r;if(s=this,t(e,s.key)<0)!s.left.isEmpty()&&!s.left.isRed_()&&!s.left.left.isRed_()&&(s=s.moveRedLeft_()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed_()&&(s=s.rotateRight_()),!s.right.isEmpty()&&!s.right.isRed_()&&!s.right.left.isRed_()&&(s=s.moveRedRight_()),t(e,s.key)===0){if(s.right.isEmpty())return Xe.EMPTY_NODE;r=s.right.min_(),s=s.copy(r.key,r.value,null,null,s.right.removeMin_())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const e=this.copy(null,null,Ne.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight_(){const e=this.copy(null,null,Ne.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}}Ne.RED=!0;Ne.BLACK=!1;class Bk{copy(e,t,s,r,i){return this}insert(e,t,s){return new Ne(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}}class Xe{constructor(e,t=Xe.EMPTY_NODE){this.comparator_=e,this.root_=t}insert(e,t){return new Xe(this.comparator_,this.root_.insert(e,t,this.comparator_).copy(null,null,Ne.BLACK,null,null))}remove(e){return new Xe(this.comparator_,this.root_.remove(e,this.comparator_).copy(null,null,Ne.BLACK,null,null))}get(e){let t,s=this.root_;for(;!s.isEmpty();){if(t=this.comparator_(e,s.key),t===0)return s.value;t<0?s=s.left:t>0&&(s=s.right)}return null}getPredecessorKey(e){let t,s=this.root_,r=null;for(;!s.isEmpty();)if(t=this.comparator_(e,s.key),t===0){if(s.left.isEmpty())return r?r.key:null;for(s=s.left;!s.right.isEmpty();)s=s.right;return s.key}else t<0?s=s.left:t>0&&(r=s,s=s.right);throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new ro(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new ro(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new ro(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new ro(this.root_,null,this.comparator_,!0,e)}}Xe.EMPTY_NODE=new Bk;/**
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
 */function qk(n,e){return ds(n.name,e.name)}function Yu(n,e){return ds(n,e)}/**
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
 */let ll;function $k(n){ll=n}const Dy=function(n){return typeof n=="number"?"number:"+uy(n):"string:"+n},Oy=function(n){if(n.isLeafNode()){const e=n.val();D(typeof e=="string"||typeof e=="number"||typeof e=="object"&&Vt(e,".sv"),"Priority must be a string or number.")}else D(n===ll||n.isEmpty(),"priority of unexpected type.");D(n===ll||n.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};/**
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
 */let bp;class Pe{static set __childrenNodeConstructor(e){bp=e}static get __childrenNodeConstructor(){return bp}constructor(e,t=Pe.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,D(this.value_!==void 0&&this.value_!==null,"LeafNode shouldn't be created with null/undefined value."),Oy(this.priorityNode_)}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new Pe(this.value_,e)}getImmediateChild(e){return e===".priority"?this.priorityNode_:Pe.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return z(e)?this:G(e)===".priority"?this.priorityNode_:Pe.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return e===".priority"?this.updatePriority(t):t.isEmpty()&&e!==".priority"?this:Pe.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const s=G(e);return s===null?t:t.isEmpty()&&s!==".priority"?this:(D(s!==".priority"||Sn(e)===1,".priority must be the last token in a path"),this.updateImmediateChild(s,Pe.__childrenNodeConstructor.EMPTY_NODE.updateChild(oe(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(this.lazyHash_===null){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+Dy(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",t==="number"?e+=uy(this.value_):e+=this.value_,this.lazyHash_=cy(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===Pe.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof Pe.__childrenNodeConstructor?-1:(D(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,s=typeof this.value_,r=Pe.VALUE_TYPE_ORDER.indexOf(t),i=Pe.VALUE_TYPE_ORDER.indexOf(s);return D(r>=0,"Unknown leaf type: "+t),D(i>=0,"Unknown leaf type: "+s),r===i?s==="object"?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:i-r}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}else return!1}}Pe.VALUE_TYPE_ORDER=["object","boolean","number","string"];/**
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
 */let Vy,My;function Wk(n){Vy=n}function jk(n){My=n}class Hk extends Da{compare(e,t){const s=e.node.getPriority(),r=t.node.getPriority(),i=s.compareTo(r);return i===0?ds(e.name,t.name):i}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return K.MIN}maxPost(){return new K(ns,new Pe("[PRIORITY-POST]",My))}makePost(e,t){const s=Vy(e);return new K(t,new Pe("[PRIORITY-POST]",s))}toString(){return".priority"}}const he=new Hk;/**
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
 */const Gk=Math.log(2);class zk{constructor(e){const t=i=>parseInt(Math.log(i)/Gk,10),s=i=>parseInt(Array(i+1).join("1"),2);this.count=t(e+1),this.current_=this.count-1;const r=s(this.count);this.bits_=e+1&r}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Ho=function(n,e,t,s){n.sort(e);const r=function(l,u){const f=u-l;let p,m;if(f===0)return null;if(f===1)return p=n[l],m=t?t(p):p,new Ne(m,p.node,Ne.BLACK,null,null);{const T=parseInt(f/2,10)+l,S=r(l,T),k=r(T+1,u);return p=n[T],m=t?t(p):p,new Ne(m,p.node,Ne.BLACK,S,k)}},i=function(l){let u=null,f=null,p=n.length;const m=function(S,k){const N=p-S,$=p;p-=S;const j=r(N+1,$),Q=n[N],ne=t?t(Q):Q;T(new Ne(ne,Q.node,k,null,j))},T=function(S){u?(u.left=S,u=S):(f=S,u=S)};for(let S=0;S<l.count;++S){const k=l.nextBitIsOne(),N=Math.pow(2,l.count-(S+1));k?m(N,Ne.BLACK):(m(N,Ne.BLACK),m(N,Ne.RED))}return f},o=new zk(n.length),c=i(o);return new Xe(s||e,c)};/**
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
 */let Nc;const _s={};class qt{static get Default(){return D(_s&&he,"ChildrenNode.ts has not been loaded"),Nc=Nc||new qt({".priority":_s},{".priority":he}),Nc}constructor(e,t){this.indexes_=e,this.indexSet_=t}get(e){const t=Ds(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof Xe?t:null}hasIndex(e){return Vt(this.indexSet_,e.toString())}addIndex(e,t){D(e!==ks,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const s=[];let r=!1;const i=t.getIterator(K.Wrap);let o=i.getNext();for(;o;)r=r||e.isDefinedOn(o.node),s.push(o),o=i.getNext();let c;r?c=Ho(s,e.getCompare()):c=_s;const l=e.toString(),u={...this.indexSet_};u[l]=e;const f={...this.indexes_};return f[l]=c,new qt(f,u)}addToIndexes(e,t){const s=To(this.indexes_,(r,i)=>{const o=Ds(this.indexSet_,i);if(D(o,"Missing index implementation for "+i),r===_s)if(o.isDefinedOn(e.node)){const c=[],l=t.getIterator(K.Wrap);let u=l.getNext();for(;u;)u.name!==e.name&&c.push(u),u=l.getNext();return c.push(e),Ho(c,o.getCompare())}else return _s;else{const c=t.get(e.name);let l=r;return c&&(l=l.remove(new K(e.name,c))),l.insert(e,e.node)}});return new qt(s,this.indexSet_)}removeFromIndexes(e,t){const s=To(this.indexes_,r=>{if(r===_s)return r;{const i=t.get(e.name);return i?r.remove(new K(e.name,i)):r}});return new qt(s,this.indexSet_)}}/**
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
 */let Rr;class B{static get EMPTY_NODE(){return Rr||(Rr=new B(new Xe(Yu),null,qt.Default))}constructor(e,t,s){this.children_=e,this.priorityNode_=t,this.indexMap_=s,this.lazyHash_=null,this.priorityNode_&&Oy(this.priorityNode_),this.children_.isEmpty()&&D(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}isLeafNode(){return!1}getPriority(){return this.priorityNode_||Rr}updatePriority(e){return this.children_.isEmpty()?this:new B(this.children_,e,this.indexMap_)}getImmediateChild(e){if(e===".priority")return this.getPriority();{const t=this.children_.get(e);return t===null?Rr:t}}getChild(e){const t=G(e);return t===null?this:this.getImmediateChild(t).getChild(oe(e))}hasChild(e){return this.children_.get(e)!==null}updateImmediateChild(e,t){if(D(t,"We should always be passing snapshot nodes"),e===".priority")return this.updatePriority(t);{const s=new K(e,t);let r,i;t.isEmpty()?(r=this.children_.remove(e),i=this.indexMap_.removeFromIndexes(s,this.children_)):(r=this.children_.insert(e,t),i=this.indexMap_.addToIndexes(s,this.children_));const o=r.isEmpty()?Rr:this.priorityNode_;return new B(r,o,i)}}updateChild(e,t){const s=G(e);if(s===null)return t;{D(G(e)!==".priority"||Sn(e)===1,".priority must be the last token in a path");const r=this.getImmediateChild(s).updateChild(oe(e),t);return this.updateImmediateChild(s,r)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let s=0,r=0,i=!0;if(this.forEachChild(he,(o,c)=>{t[o]=c.val(e),s++,i&&B.INTEGER_REGEXP_.test(o)?r=Math.max(r,Number(o)):i=!1}),!e&&i&&r<2*s){const o=[];for(const c in t)o[c]=t[c];return o}else return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(this.lazyHash_===null){let e="";this.getPriority().isEmpty()||(e+="priority:"+Dy(this.getPriority().val())+":"),this.forEachChild(he,(t,s)=>{const r=s.hash();r!==""&&(e+=":"+t+":"+r)}),this.lazyHash_=e===""?"":cy(e)}return this.lazyHash_}getPredecessorChildName(e,t,s){const r=this.resolveIndex_(s);if(r){const i=r.getPredecessorKey(new K(e,t));return i?i.name:null}else return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.minKey();return s&&s.name}else return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new K(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const s=t.maxKey();return s&&s.name}else return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new K(t,this.children_.get(t)):null}forEachChild(e,t){const s=this.resolveIndex_(e);return s?s.inorderTraversal(r=>t(r.name,r.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getIteratorFrom(e,r=>r);{const r=this.children_.getIteratorFrom(e.name,K.Wrap);let i=r.peek();for(;i!=null&&t.compare(i,e)<0;)r.getNext(),i=r.peek();return r}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const s=this.resolveIndex_(t);if(s)return s.getReverseIteratorFrom(e,r=>r);{const r=this.children_.getReverseIteratorFrom(e.name,K.Wrap);let i=r.peek();for(;i!=null&&t.compare(i,e)>0;)r.getNext(),i=r.peek();return r}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===ki?-1:0}withIndex(e){if(e===ks||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new B(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===ks||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority()))if(this.children_.count()===t.children_.count()){const s=this.getIterator(he),r=t.getIterator(he);let i=s.getNext(),o=r.getNext();for(;i&&o;){if(i.name!==o.name||!i.node.equals(o.node))return!1;i=s.getNext(),o=r.getNext()}return i===null&&o===null}else return!1;else return!1}}resolveIndex_(e){return e===ks?null:this.indexMap_.get(e.toString())}}B.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;class Kk extends B{constructor(){super(new Xe(Yu),B.EMPTY_NODE,qt.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return B.EMPTY_NODE}isEmpty(){return!1}}const ki=new Kk;Object.defineProperties(K,{MIN:{value:new K(Bs,B.EMPTY_NODE)},MAX:{value:new K(ns,ki)}});Ny.__EMPTY_NODE=B.EMPTY_NODE;Pe.__childrenNodeConstructor=B;$k(ki);jk(ki);/**
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
 */const Qk=!0;function we(n,e=null){if(n===null)return B.EMPTY_NODE;if(typeof n=="object"&&".priority"in n&&(e=n[".priority"]),D(e===null||typeof e=="string"||typeof e=="number"||typeof e=="object"&&".sv"in e,"Invalid priority type found: "+typeof e),typeof n=="object"&&".value"in n&&n[".value"]!==null&&(n=n[".value"]),typeof n!="object"||".sv"in n){const t=n;return new Pe(t,we(e))}if(!(n instanceof Array)&&Qk){const t=[];let s=!1;if(je(n,(o,c)=>{if(o.substring(0,1)!=="."){const l=we(c);l.isEmpty()||(s=s||!l.getPriority().isEmpty(),t.push(new K(o,l)))}}),t.length===0)return B.EMPTY_NODE;const i=Ho(t,qk,o=>o.name,Yu);if(s){const o=Ho(t,he.getCompare());return new B(i,we(e),new qt({".priority":o},{".priority":he}))}else return new B(i,we(e),qt.Default)}else{let t=B.EMPTY_NODE;return je(n,(s,r)=>{if(Vt(n,s)&&s.substring(0,1)!=="."){const i=we(r);(i.isLeafNode()||!i.isEmpty())&&(t=t.updateImmediateChild(s,i))}}),t.updatePriority(we(e))}}Wk(we);/**
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
 */class Yk extends Da{constructor(e){super(),this.indexPath_=e,D(!z(e)&&G(e)!==".priority","Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const s=this.extractChild(e.node),r=this.extractChild(t.node),i=s.compareTo(r);return i===0?ds(e.name,t.name):i}makePost(e,t){const s=we(e),r=B.EMPTY_NODE.updateChild(this.indexPath_,s);return new K(t,r)}maxPost(){const e=B.EMPTY_NODE.updateChild(this.indexPath_,ki);return new K(ns,e)}toString(){return ri(this.indexPath_,0).join("/")}}/**
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
 */class Jk extends Da{compare(e,t){const s=e.node.compareTo(t.node);return s===0?ds(e.name,t.name):s}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return K.MIN}maxPost(){return K.MAX}makePost(e,t){const s=we(e);return new K(t,s)}toString(){return".value"}}const Xk=new Jk;/**
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
 */function xy(n){return{type:"value",snapshotNode:n}}function qs(n,e){return{type:"child_added",snapshotNode:e,childName:n}}function ii(n,e){return{type:"child_removed",snapshotNode:e,childName:n}}function oi(n,e,t){return{type:"child_changed",snapshotNode:e,childName:n,oldSnap:t}}function Zk(n,e){return{type:"child_moved",snapshotNode:e,childName:n}}/**
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
 */class Ju{constructor(e){this.index_=e}updateChild(e,t,s,r,i,o){D(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const c=e.getImmediateChild(t);return c.getChild(r).equals(s.getChild(r))&&c.isEmpty()===s.isEmpty()||(o!=null&&(s.isEmpty()?e.hasChild(t)?o.trackChildChange(ii(t,c)):D(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):c.isEmpty()?o.trackChildChange(qs(t,s)):o.trackChildChange(oi(t,s,c))),e.isLeafNode()&&s.isEmpty())?e:e.updateImmediateChild(t,s).withIndex(this.index_)}updateFullNode(e,t,s){return s!=null&&(e.isLeafNode()||e.forEachChild(he,(r,i)=>{t.hasChild(r)||s.trackChildChange(ii(r,i))}),t.isLeafNode()||t.forEachChild(he,(r,i)=>{if(e.hasChild(r)){const o=e.getImmediateChild(r);o.equals(i)||s.trackChildChange(oi(r,i,o))}else s.trackChildChange(qs(r,i))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?B.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}/**
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
 */class ai{constructor(e){this.indexedFilter_=new Ju(e.getIndex()),this.index_=e.getIndex(),this.startPost_=ai.getStartPost_(e),this.endPost_=ai.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,s=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&s}updateChild(e,t,s,r,i,o){return this.matches(new K(t,s))||(s=B.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,s,r,i,o)}updateFullNode(e,t,s){t.isLeafNode()&&(t=B.EMPTY_NODE);let r=t.withIndex(this.index_);r=r.updatePriority(B.EMPTY_NODE);const i=this;return t.forEachChild(he,(o,c)=>{i.matches(new K(o,c))||(r=r.updateImmediateChild(o,B.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,r,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}else return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}else return e.getIndex().maxPost()}}/**
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
 */class eN{constructor(e){this.withinDirectionalStart=t=>this.reverse_?this.withinEndPost(t):this.withinStartPost(t),this.withinDirectionalEnd=t=>this.reverse_?this.withinStartPost(t):this.withinEndPost(t),this.withinStartPost=t=>{const s=this.index_.compare(this.rangedFilter_.getStartPost(),t);return this.startIsInclusive_?s<=0:s<0},this.withinEndPost=t=>{const s=this.index_.compare(t,this.rangedFilter_.getEndPost());return this.endIsInclusive_?s<=0:s<0},this.rangedFilter_=new ai(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,s,r,i,o){return this.rangedFilter_.matches(new K(t,s))||(s=B.EMPTY_NODE),e.getImmediateChild(t).equals(s)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,s,r,i,o):this.fullLimitUpdateChild_(e,t,s,i,o)}updateFullNode(e,t,s){let r;if(t.isLeafNode()||t.isEmpty())r=B.EMPTY_NODE.withIndex(this.index_);else if(this.limit_*2<t.numChildren()&&t.isIndexed(this.index_)){r=B.EMPTY_NODE.withIndex(this.index_);let i;this.reverse_?i=t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):i=t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let o=0;for(;i.hasNext()&&o<this.limit_;){const c=i.getNext();if(this.withinDirectionalStart(c))if(this.withinDirectionalEnd(c))r=r.updateImmediateChild(c.name,c.node),o++;else break;else continue}}else{r=t.withIndex(this.index_),r=r.updatePriority(B.EMPTY_NODE);let i;this.reverse_?i=r.getReverseIterator(this.index_):i=r.getIterator(this.index_);let o=0;for(;i.hasNext();){const c=i.getNext();o<this.limit_&&this.withinDirectionalStart(c)&&this.withinDirectionalEnd(c)?o++:r=r.updateImmediateChild(c.name,B.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,r,s)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,s,r,i){let o;if(this.reverse_){const p=this.index_.getCompare();o=(m,T)=>p(T,m)}else o=this.index_.getCompare();const c=e;D(c.numChildren()===this.limit_,"");const l=new K(t,s),u=this.reverse_?c.getFirstChild(this.index_):c.getLastChild(this.index_),f=this.rangedFilter_.matches(l);if(c.hasChild(t)){const p=c.getImmediateChild(t);let m=r.getChildAfterChild(this.index_,u,this.reverse_);for(;m!=null&&(m.name===t||c.hasChild(m.name));)m=r.getChildAfterChild(this.index_,m,this.reverse_);const T=m==null?1:o(m,l);if(f&&!s.isEmpty()&&T>=0)return i!=null&&i.trackChildChange(oi(t,s,p)),c.updateImmediateChild(t,s);{i!=null&&i.trackChildChange(ii(t,p));const k=c.updateImmediateChild(t,B.EMPTY_NODE);return m!=null&&this.rangedFilter_.matches(m)?(i!=null&&i.trackChildChange(qs(m.name,m.node)),k.updateImmediateChild(m.name,m.node)):k}}else return s.isEmpty()?e:f&&o(u,l)>=0?(i!=null&&(i.trackChildChange(ii(u.name,u.node)),i.trackChildChange(qs(t,s))),c.updateImmediateChild(t,s).updateImmediateChild(u.name,B.EMPTY_NODE)):e}}/**
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
 */class Xu{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=he}hasStart(){return this.startSet_}isViewFromLeft(){return this.viewFrom_===""?this.startSet_:this.viewFrom_==="l"}getIndexStartValue(){return D(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return D(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:Bs}hasEnd(){return this.endSet_}getIndexEndValue(){return D(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return D(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:ns}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&this.viewFrom_!==""}getLimit(){return D(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===he}copy(){const e=new Xu;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function tN(n){return n.loadsAllData()?new Ju(n.getIndex()):n.hasLimit()?new eN(n):new ai(n)}function Pp(n){const e={};if(n.isDefault())return e;let t;if(n.index_===he?t="$priority":n.index_===Xk?t="$value":n.index_===ks?t="$key":(D(n.index_ instanceof Yk,"Unrecognized index type!"),t=n.index_.toString()),e.orderBy=Oe(t),n.startSet_){const s=n.startAfterSet_?"startAfter":"startAt";e[s]=Oe(n.indexStartValue_),n.startNameSet_&&(e[s]+=","+Oe(n.indexStartName_))}if(n.endSet_){const s=n.endBeforeSet_?"endBefore":"endAt";e[s]=Oe(n.indexEndValue_),n.endNameSet_&&(e[s]+=","+Oe(n.indexEndName_))}return n.limitSet_&&(n.isViewFromLeft()?e.limitToFirst=n.limit_:e.limitToLast=n.limit_),e}function kp(n){const e={};if(n.startSet_&&(e.sp=n.indexStartValue_,n.startNameSet_&&(e.sn=n.indexStartName_),e.sin=!n.startAfterSet_),n.endSet_&&(e.ep=n.indexEndValue_,n.endNameSet_&&(e.en=n.indexEndName_),e.ein=!n.endBeforeSet_),n.limitSet_){e.l=n.limit_;let t=n.viewFrom_;t===""&&(n.isViewFromLeft()?t="l":t="r"),e.vf=t}return n.index_!==he&&(e.i=n.index_.toString()),e}/**
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
 */class Go extends Sy{reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return t!==void 0?"tag$"+t:(D(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}constructor(e,t,s,r){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=s,this.appCheckTokenProvider_=r,this.log_=Pi("p:rest:"),this.listens_={}}listen(e,t,s,r){const i=e._path.toString();this.log_("Listen called for "+i+" "+e._queryIdentifier);const o=Go.getListenId_(e,s),c={};this.listens_[o]=c;const l=Pp(e._queryParams);this.restRequest_(i+".json",l,(u,f)=>{let p=f;if(u===404&&(p=null,u=null),u===null&&this.onDataUpdate_(i,p,!1,s),Ds(this.listens_,o)===c){let m;u?u===401?m="permission_denied":m="rest_error:"+u:m="ok",r(m,null)}})}unlisten(e,t){const s=Go.getListenId_(e,t);delete this.listens_[s]}get(e){const t=Pp(e._queryParams),s=e._path.toString(),r=new Ft;return this.restRequest_(s+".json",t,(i,o)=>{let c=o;i===404&&(c=null,i=null),i===null?(this.onDataUpdate_(s,c,!1,null),r.resolve(c)):r.reject(new Error(c))}),r.promise}refreshAuthToken(e){}restRequest_(e,t={},s){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([r,i])=>{r&&r.accessToken&&(t.auth=r.accessToken),i&&i.token&&(t.ac=i.token);const o=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+Gs(t);this.log_("Sending REST request for "+o);const c=new XMLHttpRequest;c.onreadystatechange=()=>{if(s&&c.readyState===4){this.log_("REST Response for "+o+" received. status:",c.status,"response:",c.responseText);let l=null;if(c.status>=200&&c.status<300){try{l=Hr(c.responseText)}catch{et("Failed to parse JSON response for "+o+": "+c.responseText)}s(null,l)}else c.status!==401&&c.status!==404&&et("Got unsuccessful REST response for "+o+" Status: "+c.status),s(c.status);s=null}},c.open("GET",o,!0),c.send()})}}/**
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
 */class nN{constructor(){this.rootNode_=B.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}/**
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
 */function zo(){return{value:null,children:new Map}}function sr(n,e,t){if(z(e))n.value=t,n.children.clear();else if(n.value!==null)n.value=n.value.updateChild(e,t);else{const s=G(e);n.children.has(s)||n.children.set(s,zo());const r=n.children.get(s);e=oe(e),sr(r,e,t)}}function ul(n,e){if(z(e))return n.value=null,n.children.clear(),!0;if(n.value!==null){if(n.value.isLeafNode())return!1;{const t=n.value;return n.value=null,t.forEachChild(he,(s,r)=>{sr(n,new re(s),r)}),ul(n,e)}}else if(n.children.size>0){const t=G(e);return e=oe(e),n.children.has(t)&&ul(n.children.get(t),e)&&n.children.delete(t),n.children.size===0}else return!0}function hl(n,e,t){n.value!==null?t(e,n.value):sN(n,(s,r)=>{const i=new re(e.toString()+"/"+s);hl(r,i,t)})}function sN(n,e){n.children.forEach((t,s)=>{e(s,t)})}/**
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
 */class rN{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t={...e};return this.last_&&je(this.last_,(s,r)=>{t[s]=t[s]-r}),this.last_=e,t}}/**
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
 */const Np=10*1e3,iN=30*1e3,oN=300*1e3;class aN{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new rN(e);const s=Np+(iN-Np)*Math.random();qr(this.reportStats_.bind(this),Math.floor(s))}reportStats_(){const e=this.statsListener_.get(),t={};let s=!1;je(e,(r,i)=>{i>0&&Vt(this.statsToReport_,r)&&(t[r]=i,s=!0)}),s&&this.server_.reportStats(t),qr(this.reportStats_.bind(this),Math.floor(Math.random()*2*oN))}}/**
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
 */var gt;(function(n){n[n.OVERWRITE=0]="OVERWRITE",n[n.MERGE=1]="MERGE",n[n.ACK_USER_WRITE=2]="ACK_USER_WRITE",n[n.LISTEN_COMPLETE=3]="LISTEN_COMPLETE"})(gt||(gt={}));function Ly(){return{fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}function Zu(){return{fromUser:!1,fromServer:!0,queryId:null,tagged:!1}}function eh(n){return{fromUser:!1,fromServer:!0,queryId:n,tagged:!0}}/**
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
 */class Ko{constructor(e,t,s){this.path=e,this.affectedTree=t,this.revert=s,this.type=gt.ACK_USER_WRITE,this.source=Ly()}operationForChild(e){if(z(this.path)){if(this.affectedTree.value!=null)return D(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new re(e));return new Ko(te(),t,this.revert)}}else return D(G(this.path)===e,"operationForChild called for unrelated child."),new Ko(oe(this.path),this.affectedTree,this.revert)}}/**
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
 */class ci{constructor(e,t){this.source=e,this.path=t,this.type=gt.LISTEN_COMPLETE}operationForChild(e){return z(this.path)?new ci(this.source,te()):new ci(this.source,oe(this.path))}}/**
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
 */class ss{constructor(e,t,s){this.source=e,this.path=t,this.snap=s,this.type=gt.OVERWRITE}operationForChild(e){return z(this.path)?new ss(this.source,te(),this.snap.getImmediateChild(e)):new ss(this.source,oe(this.path),this.snap)}}/**
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
 */class li{constructor(e,t,s){this.source=e,this.path=t,this.children=s,this.type=gt.MERGE}operationForChild(e){if(z(this.path)){const t=this.children.subtree(new re(e));return t.isEmpty()?null:t.value?new ss(this.source,te(),t.value):new li(this.source,te(),t)}else return D(G(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new li(this.source,oe(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}/**
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
 */class rs{constructor(e,t,s){this.node_=e,this.fullyInitialized_=t,this.filtered_=s}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(z(e))return this.isFullyInitialized()&&!this.filtered_;const t=G(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}/**
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
 */class cN{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function lN(n,e,t,s){const r=[],i=[];return e.forEach(o=>{o.type==="child_changed"&&n.index_.indexedValueChanged(o.oldSnap,o.snapshotNode)&&i.push(Zk(o.childName,o.snapshotNode))}),Cr(n,r,"child_removed",e,s,t),Cr(n,r,"child_added",e,s,t),Cr(n,r,"child_moved",i,s,t),Cr(n,r,"child_changed",e,s,t),Cr(n,r,"value",e,s,t),r}function Cr(n,e,t,s,r,i){const o=s.filter(c=>c.type===t);o.sort((c,l)=>hN(n,c,l)),o.forEach(c=>{const l=uN(n,c,i);r.forEach(u=>{u.respondsTo(c.type)&&e.push(u.createEvent(l,n.query_))})})}function uN(n,e,t){return e.type==="value"||e.type==="child_removed"||(e.prevName=t.getPredecessorChildName(e.childName,e.snapshotNode,n.index_)),e}function hN(n,e,t){if(e.childName==null||t.childName==null)throw Hs("Should only compare child_ events.");const s=new K(e.childName,e.snapshotNode),r=new K(t.childName,t.snapshotNode);return n.index_.compare(s,r)}/**
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
 */function Oa(n,e){return{eventCache:n,serverCache:e}}function $r(n,e,t,s){return Oa(new rs(e,t,s),n.serverCache)}function Fy(n,e,t,s){return Oa(n.eventCache,new rs(e,t,s))}function dl(n){return n.eventCache.isFullyInitialized()?n.eventCache.getNode():null}function is(n){return n.serverCache.isFullyInitialized()?n.serverCache.getNode():null}/**
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
 */let Dc;const dN=()=>(Dc||(Dc=new Xe(YP)),Dc);class ce{static fromObject(e){let t=new ce(null);return je(e,(s,r)=>{t=t.set(new re(s),r)}),t}constructor(e,t=dN()){this.value=e,this.children=t}isEmpty(){return this.value===null&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(this.value!=null&&t(this.value))return{path:te(),value:this.value};if(z(e))return null;{const s=G(e),r=this.children.get(s);if(r!==null){const i=r.findRootMostMatchingPathAndValue(oe(e),t);return i!=null?{path:_e(new re(s),i.path),value:i.value}:null}else return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(z(e))return this;{const t=G(e),s=this.children.get(t);return s!==null?s.subtree(oe(e)):new ce(null)}}set(e,t){if(z(e))return new ce(t,this.children);{const s=G(e),i=(this.children.get(s)||new ce(null)).set(oe(e),t),o=this.children.insert(s,i);return new ce(this.value,o)}}remove(e){if(z(e))return this.children.isEmpty()?new ce(null):new ce(null,this.children);{const t=G(e),s=this.children.get(t);if(s){const r=s.remove(oe(e));let i;return r.isEmpty()?i=this.children.remove(t):i=this.children.insert(t,r),this.value===null&&i.isEmpty()?new ce(null):new ce(this.value,i)}else return this}}get(e){if(z(e))return this.value;{const t=G(e),s=this.children.get(t);return s?s.get(oe(e)):null}}setTree(e,t){if(z(e))return t;{const s=G(e),i=(this.children.get(s)||new ce(null)).setTree(oe(e),t);let o;return i.isEmpty()?o=this.children.remove(s):o=this.children.insert(s,i),new ce(this.value,o)}}fold(e){return this.fold_(te(),e)}fold_(e,t){const s={};return this.children.inorderTraversal((r,i)=>{s[r]=i.fold_(_e(e,r),t)}),t(e,this.value,s)}findOnPath(e,t){return this.findOnPath_(e,te(),t)}findOnPath_(e,t,s){const r=this.value?s(t,this.value):!1;if(r)return r;if(z(e))return null;{const i=G(e),o=this.children.get(i);return o?o.findOnPath_(oe(e),_e(t,i),s):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,te(),t)}foreachOnPath_(e,t,s){if(z(e))return this;{this.value&&s(t,this.value);const r=G(e),i=this.children.get(r);return i?i.foreachOnPath_(oe(e),_e(t,r),s):new ce(null)}}foreach(e){this.foreach_(te(),e)}foreach_(e,t){this.children.inorderTraversal((s,r)=>{r.foreach_(_e(e,s),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,s)=>{s.value&&e(t,s.value)})}}/**
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
 */class Et{constructor(e){this.writeTree_=e}static empty(){return new Et(new ce(null))}}function Wr(n,e,t){if(z(e))return new Et(new ce(t));{const s=n.writeTree_.findRootMostValueAndPath(e);if(s!=null){const r=s.path;let i=s.value;const o=Je(r,e);return i=i.updateChild(o,t),new Et(n.writeTree_.set(r,i))}else{const r=new ce(t),i=n.writeTree_.setTree(e,r);return new Et(i)}}}function Dp(n,e,t){let s=n;return je(t,(r,i)=>{s=Wr(s,_e(e,r),i)}),s}function Op(n,e){if(z(e))return Et.empty();{const t=n.writeTree_.setTree(e,new ce(null));return new Et(t)}}function fl(n,e){return fs(n,e)!=null}function fs(n,e){const t=n.writeTree_.findRootMostValueAndPath(e);return t!=null?n.writeTree_.get(t.path).getChild(Je(t.path,e)):null}function Vp(n){const e=[],t=n.writeTree_.value;return t!=null?t.isLeafNode()||t.forEachChild(he,(s,r)=>{e.push(new K(s,r))}):n.writeTree_.children.inorderTraversal((s,r)=>{r.value!=null&&e.push(new K(s,r.value))}),e}function yn(n,e){if(z(e))return n;{const t=fs(n,e);return t!=null?new Et(new ce(t)):new Et(n.writeTree_.subtree(e))}}function pl(n){return n.writeTree_.isEmpty()}function $s(n,e){return Uy(te(),n.writeTree_,e)}function Uy(n,e,t){if(e.value!=null)return t.updateChild(n,e.value);{let s=null;return e.children.inorderTraversal((r,i)=>{r===".priority"?(D(i.value!==null,"Priority writes must always be leaf nodes"),s=i.value):t=Uy(_e(n,r),i,t)}),!t.getChild(n).isEmpty()&&s!==null&&(t=t.updateChild(_e(n,".priority"),s)),t}}/**
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
 */function th(n,e){return Wy(e,n)}function fN(n,e,t,s,r){D(s>n.lastWriteId,"Stacking an older write on top of newer ones"),r===void 0&&(r=!0),n.allWrites.push({path:e,snap:t,writeId:s,visible:r}),r&&(n.visibleWrites=Wr(n.visibleWrites,e,t)),n.lastWriteId=s}function pN(n,e){for(let t=0;t<n.allWrites.length;t++){const s=n.allWrites[t];if(s.writeId===e)return s}return null}function mN(n,e){const t=n.allWrites.findIndex(c=>c.writeId===e);D(t>=0,"removeWrite called with nonexistent writeId.");const s=n.allWrites[t];n.allWrites.splice(t,1);let r=s.visible,i=!1,o=n.allWrites.length-1;for(;r&&o>=0;){const c=n.allWrites[o];c.visible&&(o>=t&&gN(c,s.path)?r=!1:ut(s.path,c.path)&&(i=!0)),o--}if(r){if(i)return _N(n),!0;if(s.snap)n.visibleWrites=Op(n.visibleWrites,s.path);else{const c=s.children;je(c,l=>{n.visibleWrites=Op(n.visibleWrites,_e(s.path,l))})}return!0}else return!1}function gN(n,e){if(n.snap)return ut(n.path,e);for(const t in n.children)if(n.children.hasOwnProperty(t)&&ut(_e(n.path,t),e))return!0;return!1}function _N(n){n.visibleWrites=By(n.allWrites,yN,te()),n.allWrites.length>0?n.lastWriteId=n.allWrites[n.allWrites.length-1].writeId:n.lastWriteId=-1}function yN(n){return n.visible}function By(n,e,t){let s=Et.empty();for(let r=0;r<n.length;++r){const i=n[r];if(e(i)){const o=i.path;let c;if(i.snap)ut(t,o)?(c=Je(t,o),s=Wr(s,c,i.snap)):ut(o,t)&&(c=Je(o,t),s=Wr(s,te(),i.snap.getChild(c)));else if(i.children){if(ut(t,o))c=Je(t,o),s=Dp(s,c,i.children);else if(ut(o,t))if(c=Je(o,t),z(c))s=Dp(s,te(),i.children);else{const l=Ds(i.children,G(c));if(l){const u=l.getChild(oe(c));s=Wr(s,te(),u)}}}else throw Hs("WriteRecord should have .snap or .children")}}return s}function qy(n,e,t,s,r){if(!s&&!r){const i=fs(n.visibleWrites,e);if(i!=null)return i;{const o=yn(n.visibleWrites,e);if(pl(o))return t;if(t==null&&!fl(o,te()))return null;{const c=t||B.EMPTY_NODE;return $s(o,c)}}}else{const i=yn(n.visibleWrites,e);if(!r&&pl(i))return t;if(!r&&t==null&&!fl(i,te()))return null;{const o=function(u){return(u.visible||r)&&(!s||!~s.indexOf(u.writeId))&&(ut(u.path,e)||ut(e,u.path))},c=By(n.allWrites,o,e),l=t||B.EMPTY_NODE;return $s(c,l)}}}function EN(n,e,t){let s=B.EMPTY_NODE;const r=fs(n.visibleWrites,e);if(r)return r.isLeafNode()||r.forEachChild(he,(i,o)=>{s=s.updateImmediateChild(i,o)}),s;if(t){const i=yn(n.visibleWrites,e);return t.forEachChild(he,(o,c)=>{const l=$s(yn(i,new re(o)),c);s=s.updateImmediateChild(o,l)}),Vp(i).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}else{const i=yn(n.visibleWrites,e);return Vp(i).forEach(o=>{s=s.updateImmediateChild(o.name,o.node)}),s}}function TN(n,e,t,s,r){D(s||r,"Either existingEventSnap or existingServerSnap must exist");const i=_e(e,t);if(fl(n.visibleWrites,i))return null;{const o=yn(n.visibleWrites,i);return pl(o)?r.getChild(t):$s(o,r.getChild(t))}}function wN(n,e,t,s){const r=_e(e,t),i=fs(n.visibleWrites,r);if(i!=null)return i;if(s.isCompleteForChild(t)){const o=yn(n.visibleWrites,r);return $s(o,s.getNode().getImmediateChild(t))}else return null}function IN(n,e){return fs(n.visibleWrites,e)}function vN(n,e,t,s,r,i,o){let c;const l=yn(n.visibleWrites,e),u=fs(l,te());if(u!=null)c=u;else if(t!=null)c=$s(l,t);else return[];if(c=c.withIndex(o),!c.isEmpty()&&!c.isLeafNode()){const f=[],p=o.getCompare(),m=i?c.getReverseIteratorFrom(s,o):c.getIteratorFrom(s,o);let T=m.getNext();for(;T&&f.length<r;)p(T,s)!==0&&f.push(T),T=m.getNext();return f}else return[]}function AN(){return{visibleWrites:Et.empty(),allWrites:[],lastWriteId:-1}}function Qo(n,e,t,s){return qy(n.writeTree,n.treePath,e,t,s)}function nh(n,e){return EN(n.writeTree,n.treePath,e)}function Mp(n,e,t,s){return TN(n.writeTree,n.treePath,e,t,s)}function Yo(n,e){return IN(n.writeTree,_e(n.treePath,e))}function RN(n,e,t,s,r,i){return vN(n.writeTree,n.treePath,e,t,s,r,i)}function sh(n,e,t){return wN(n.writeTree,n.treePath,e,t)}function $y(n,e){return Wy(_e(n.treePath,e),n.writeTree)}function Wy(n,e){return{treePath:n,writeTree:e}}/**
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
 */class CN{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,s=e.childName;D(t==="child_added"||t==="child_changed"||t==="child_removed","Only child changes supported for tracking"),D(s!==".priority","Only non-priority child changes can be tracked.");const r=this.changeMap.get(s);if(r){const i=r.type;if(t==="child_added"&&i==="child_removed")this.changeMap.set(s,oi(s,e.snapshotNode,r.snapshotNode));else if(t==="child_removed"&&i==="child_added")this.changeMap.delete(s);else if(t==="child_removed"&&i==="child_changed")this.changeMap.set(s,ii(s,r.oldSnap));else if(t==="child_changed"&&i==="child_added")this.changeMap.set(s,qs(s,e.snapshotNode));else if(t==="child_changed"&&i==="child_changed")this.changeMap.set(s,oi(s,e.snapshotNode,r.oldSnap));else throw Hs("Illegal combination of changes: "+e+" occurred after "+r)}else this.changeMap.set(s,e)}getChanges(){return Array.from(this.changeMap.values())}}/**
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
 */class SN{getCompleteChild(e){return null}getChildAfterChild(e,t,s){return null}}const jy=new SN;class rh{constructor(e,t,s=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=s}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const s=this.optCompleteServerCache_!=null?new rs(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return sh(this.writes_,e,s)}}getChildAfterChild(e,t,s){const r=this.optCompleteServerCache_!=null?this.optCompleteServerCache_:is(this.viewCache_),i=RN(this.writes_,r,t,1,s,e);return i.length===0?null:i[0]}}/**
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
 */function bN(n){return{filter:n}}function PN(n,e){D(e.eventCache.getNode().isIndexed(n.filter.getIndex()),"Event snap not indexed"),D(e.serverCache.getNode().isIndexed(n.filter.getIndex()),"Server snap not indexed")}function kN(n,e,t,s,r){const i=new CN;let o,c;if(t.type===gt.OVERWRITE){const u=t;u.source.fromUser?o=ml(n,e,u.path,u.snap,s,r,i):(D(u.source.fromServer,"Unknown source."),c=u.source.tagged||e.serverCache.isFiltered()&&!z(u.path),o=Jo(n,e,u.path,u.snap,s,r,c,i))}else if(t.type===gt.MERGE){const u=t;u.source.fromUser?o=DN(n,e,u.path,u.children,s,r,i):(D(u.source.fromServer,"Unknown source."),c=u.source.tagged||e.serverCache.isFiltered(),o=gl(n,e,u.path,u.children,s,r,c,i))}else if(t.type===gt.ACK_USER_WRITE){const u=t;u.revert?o=MN(n,e,u.path,s,r,i):o=ON(n,e,u.path,u.affectedTree,s,r,i)}else if(t.type===gt.LISTEN_COMPLETE)o=VN(n,e,t.path,s,i);else throw Hs("Unknown operation type: "+t.type);const l=i.getChanges();return NN(e,o,l),{viewCache:o,changes:l}}function NN(n,e,t){const s=e.eventCache;if(s.isFullyInitialized()){const r=s.getNode().isLeafNode()||s.getNode().isEmpty(),i=dl(n);(t.length>0||!n.eventCache.isFullyInitialized()||r&&!s.getNode().equals(i)||!s.getNode().getPriority().equals(i.getPriority()))&&t.push(xy(dl(e)))}}function Hy(n,e,t,s,r,i){const o=e.eventCache;if(Yo(s,t)!=null)return e;{let c,l;if(z(t))if(D(e.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),e.serverCache.isFiltered()){const u=is(e),f=u instanceof B?u:B.EMPTY_NODE,p=nh(s,f);c=n.filter.updateFullNode(e.eventCache.getNode(),p,i)}else{const u=Qo(s,is(e));c=n.filter.updateFullNode(e.eventCache.getNode(),u,i)}else{const u=G(t);if(u===".priority"){D(Sn(t)===1,"Can't have a priority with additional path components");const f=o.getNode();l=e.serverCache.getNode();const p=Mp(s,t,f,l);p!=null?c=n.filter.updatePriority(f,p):c=o.getNode()}else{const f=oe(t);let p;if(o.isCompleteForChild(u)){l=e.serverCache.getNode();const m=Mp(s,t,o.getNode(),l);m!=null?p=o.getNode().getImmediateChild(u).updateChild(f,m):p=o.getNode().getImmediateChild(u)}else p=sh(s,u,e.serverCache);p!=null?c=n.filter.updateChild(o.getNode(),u,p,f,r,i):c=o.getNode()}}return $r(e,c,o.isFullyInitialized()||z(t),n.filter.filtersNodes())}}function Jo(n,e,t,s,r,i,o,c){const l=e.serverCache;let u;const f=o?n.filter:n.filter.getIndexedFilter();if(z(t))u=f.updateFullNode(l.getNode(),s,null);else if(f.filtersNodes()&&!l.isFiltered()){const T=l.getNode().updateChild(t,s);u=f.updateFullNode(l.getNode(),T,null)}else{const T=G(t);if(!l.isCompleteForPath(t)&&Sn(t)>1)return e;const S=oe(t),N=l.getNode().getImmediateChild(T).updateChild(S,s);T===".priority"?u=f.updatePriority(l.getNode(),N):u=f.updateChild(l.getNode(),T,N,S,jy,null)}const p=Fy(e,u,l.isFullyInitialized()||z(t),f.filtersNodes()),m=new rh(r,p,i);return Hy(n,p,t,r,m,c)}function ml(n,e,t,s,r,i,o){const c=e.eventCache;let l,u;const f=new rh(r,e,i);if(z(t))u=n.filter.updateFullNode(e.eventCache.getNode(),s,o),l=$r(e,u,!0,n.filter.filtersNodes());else{const p=G(t);if(p===".priority")u=n.filter.updatePriority(e.eventCache.getNode(),s),l=$r(e,u,c.isFullyInitialized(),c.isFiltered());else{const m=oe(t),T=c.getNode().getImmediateChild(p);let S;if(z(m))S=s;else{const k=f.getCompleteChild(p);k!=null?zu(m)===".priority"&&k.getChild(Py(m)).isEmpty()?S=k:S=k.updateChild(m,s):S=B.EMPTY_NODE}if(T.equals(S))l=e;else{const k=n.filter.updateChild(c.getNode(),p,S,m,f,o);l=$r(e,k,c.isFullyInitialized(),n.filter.filtersNodes())}}}return l}function xp(n,e){return n.eventCache.isCompleteForChild(e)}function DN(n,e,t,s,r,i,o){let c=e;return s.foreach((l,u)=>{const f=_e(t,l);xp(e,G(f))&&(c=ml(n,c,f,u,r,i,o))}),s.foreach((l,u)=>{const f=_e(t,l);xp(e,G(f))||(c=ml(n,c,f,u,r,i,o))}),c}function Lp(n,e,t){return t.foreach((s,r)=>{e=e.updateChild(s,r)}),e}function gl(n,e,t,s,r,i,o,c){if(e.serverCache.getNode().isEmpty()&&!e.serverCache.isFullyInitialized())return e;let l=e,u;z(t)?u=s:u=new ce(null).setTree(t,s);const f=e.serverCache.getNode();return u.children.inorderTraversal((p,m)=>{if(f.hasChild(p)){const T=e.serverCache.getNode().getImmediateChild(p),S=Lp(n,T,m);l=Jo(n,l,new re(p),S,r,i,o,c)}}),u.children.inorderTraversal((p,m)=>{const T=!e.serverCache.isCompleteForChild(p)&&m.value===null;if(!f.hasChild(p)&&!T){const S=e.serverCache.getNode().getImmediateChild(p),k=Lp(n,S,m);l=Jo(n,l,new re(p),k,r,i,o,c)}}),l}function ON(n,e,t,s,r,i,o){if(Yo(r,t)!=null)return e;const c=e.serverCache.isFiltered(),l=e.serverCache;if(s.value!=null){if(z(t)&&l.isFullyInitialized()||l.isCompleteForPath(t))return Jo(n,e,t,l.getNode().getChild(t),r,i,c,o);if(z(t)){let u=new ce(null);return l.getNode().forEachChild(ks,(f,p)=>{u=u.set(new re(f),p)}),gl(n,e,t,u,r,i,c,o)}else return e}else{let u=new ce(null);return s.foreach((f,p)=>{const m=_e(t,f);l.isCompleteForPath(m)&&(u=u.set(f,l.getNode().getChild(m)))}),gl(n,e,t,u,r,i,c,o)}}function VN(n,e,t,s,r){const i=e.serverCache,o=Fy(e,i.getNode(),i.isFullyInitialized()||z(t),i.isFiltered());return Hy(n,o,t,s,jy,r)}function MN(n,e,t,s,r,i){let o;if(Yo(s,t)!=null)return e;{const c=new rh(s,e,r),l=e.eventCache.getNode();let u;if(z(t)||G(t)===".priority"){let f;if(e.serverCache.isFullyInitialized())f=Qo(s,is(e));else{const p=e.serverCache.getNode();D(p instanceof B,"serverChildren would be complete if leaf node"),f=nh(s,p)}f=f,u=n.filter.updateFullNode(l,f,i)}else{const f=G(t);let p=sh(s,f,e.serverCache);p==null&&e.serverCache.isCompleteForChild(f)&&(p=l.getImmediateChild(f)),p!=null?u=n.filter.updateChild(l,f,p,oe(t),c,i):e.eventCache.getNode().hasChild(f)?u=n.filter.updateChild(l,f,B.EMPTY_NODE,oe(t),c,i):u=l,u.isEmpty()&&e.serverCache.isFullyInitialized()&&(o=Qo(s,is(e)),o.isLeafNode()&&(u=n.filter.updateFullNode(u,o,i)))}return o=e.serverCache.isFullyInitialized()||Yo(s,te())!=null,$r(e,u,o,n.filter.filtersNodes())}}/**
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
 */class xN{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const s=this.query_._queryParams,r=new Ju(s.getIndex()),i=tN(s);this.processor_=bN(i);const o=t.serverCache,c=t.eventCache,l=r.updateFullNode(B.EMPTY_NODE,o.getNode(),null),u=i.updateFullNode(B.EMPTY_NODE,c.getNode(),null),f=new rs(l,o.isFullyInitialized(),r.filtersNodes()),p=new rs(u,c.isFullyInitialized(),i.filtersNodes());this.viewCache_=Oa(p,f),this.eventGenerator_=new cN(this.query_)}get query(){return this.query_}}function LN(n){return n.viewCache_.serverCache.getNode()}function FN(n,e){const t=is(n.viewCache_);return t&&(n.query._queryParams.loadsAllData()||!z(e)&&!t.getImmediateChild(G(e)).isEmpty())?t.getChild(e):null}function Fp(n){return n.eventRegistrations_.length===0}function UN(n,e){n.eventRegistrations_.push(e)}function Up(n,e,t){const s=[];if(t){D(e==null,"A cancel should cancel all event registrations.");const r=n.query._path;n.eventRegistrations_.forEach(i=>{const o=i.createCancelEvent(t,r);o&&s.push(o)})}if(e){let r=[];for(let i=0;i<n.eventRegistrations_.length;++i){const o=n.eventRegistrations_[i];if(!o.matches(e))r.push(o);else if(e.hasAnyCallback()){r=r.concat(n.eventRegistrations_.slice(i+1));break}}n.eventRegistrations_=r}else n.eventRegistrations_=[];return s}function Bp(n,e,t,s){e.type===gt.MERGE&&e.source.queryId!==null&&(D(is(n.viewCache_),"We should always have a full cache before handling merges"),D(dl(n.viewCache_),"Missing event cache, even though we have a server cache"));const r=n.viewCache_,i=kN(n.processor_,r,e,t,s);return PN(n.processor_,i.viewCache),D(i.viewCache.serverCache.isFullyInitialized()||!r.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),n.viewCache_=i.viewCache,Gy(n,i.changes,i.viewCache.eventCache.getNode(),null)}function BN(n,e){const t=n.viewCache_.eventCache,s=[];return t.getNode().isLeafNode()||t.getNode().forEachChild(he,(i,o)=>{s.push(qs(i,o))}),t.isFullyInitialized()&&s.push(xy(t.getNode())),Gy(n,s,t.getNode(),e)}function Gy(n,e,t,s){const r=s?[s]:n.eventRegistrations_;return lN(n.eventGenerator_,e,t,r)}/**
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
 */let Xo;class qN{constructor(){this.views=new Map}}function $N(n){D(!Xo,"__referenceConstructor has already been defined"),Xo=n}function WN(){return D(Xo,"Reference.ts has not been loaded"),Xo}function jN(n){return n.views.size===0}function ih(n,e,t,s){const r=e.source.queryId;if(r!==null){const i=n.views.get(r);return D(i!=null,"SyncTree gave us an op for an invalid query."),Bp(i,e,t,s)}else{let i=[];for(const o of n.views.values())i=i.concat(Bp(o,e,t,s));return i}}function HN(n,e,t,s,r){const i=e._queryIdentifier,o=n.views.get(i);if(!o){let c=Qo(t,r?s:null),l=!1;c?l=!0:s instanceof B?(c=nh(t,s),l=!1):(c=B.EMPTY_NODE,l=!1);const u=Oa(new rs(c,l,!1),new rs(s,r,!1));return new xN(e,u)}return o}function GN(n,e,t,s,r,i){const o=HN(n,e,s,r,i);return n.views.has(e._queryIdentifier)||n.views.set(e._queryIdentifier,o),UN(o,t),BN(o,t)}function zN(n,e,t,s){const r=e._queryIdentifier,i=[];let o=[];const c=bn(n);if(r==="default")for(const[l,u]of n.views.entries())o=o.concat(Up(u,t,s)),Fp(u)&&(n.views.delete(l),u.query._queryParams.loadsAllData()||i.push(u.query));else{const l=n.views.get(r);l&&(o=o.concat(Up(l,t,s)),Fp(l)&&(n.views.delete(r),l.query._queryParams.loadsAllData()||i.push(l.query)))}return c&&!bn(n)&&i.push(new(WN())(e._repo,e._path)),{removed:i,events:o}}function zy(n){const e=[];for(const t of n.views.values())t.query._queryParams.loadsAllData()||e.push(t);return e}function Ns(n,e){let t=null;for(const s of n.views.values())t=t||FN(s,e);return t}function Ky(n,e){if(e._queryParams.loadsAllData())return Va(n);{const s=e._queryIdentifier;return n.views.get(s)}}function Qy(n,e){return Ky(n,e)!=null}function bn(n){return Va(n)!=null}function Va(n){for(const e of n.views.values())if(e.query._queryParams.loadsAllData())return e;return null}/**
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
 */let Zo;function KN(n){D(!Zo,"__referenceConstructor has already been defined"),Zo=n}function QN(){return D(Zo,"Reference.ts has not been loaded"),Zo}let YN=1;class qp{constructor(e){this.listenProvider_=e,this.syncPointTree_=new ce(null),this.pendingWriteTree_=AN(),this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function Yy(n,e,t,s,r){return fN(n.pendingWriteTree_,e,t,s,r),r?Ni(n,new ss(Ly(),e,t)):[]}function Gn(n,e,t=!1){const s=pN(n.pendingWriteTree_,e);if(mN(n.pendingWriteTree_,e)){let i=new ce(null);return s.snap!=null?i=i.set(te(),!0):je(s.children,o=>{i=i.set(new re(o),!0)}),Ni(n,new Ko(s.path,i,t))}else return[]}function Ma(n,e,t){return Ni(n,new ss(Zu(),e,t))}function JN(n,e,t){const s=ce.fromObject(t);return Ni(n,new li(Zu(),e,s))}function XN(n,e){return Ni(n,new ci(Zu(),e))}function ZN(n,e,t){const s=ah(n,t);if(s){const r=ch(s),i=r.path,o=r.queryId,c=Je(i,e),l=new ci(eh(o),c);return lh(n,i,l)}else return[]}function _l(n,e,t,s,r=!1){const i=e._path,o=n.syncPointTree_.get(i);let c=[];if(o&&(e._queryIdentifier==="default"||Qy(o,e))){const l=zN(o,e,t,s);jN(o)&&(n.syncPointTree_=n.syncPointTree_.remove(i));const u=l.removed;if(c=l.events,!r){const f=u.findIndex(m=>m._queryParams.loadsAllData())!==-1,p=n.syncPointTree_.findOnPath(i,(m,T)=>bn(T));if(f&&!p){const m=n.syncPointTree_.subtree(i);if(!m.isEmpty()){const T=n0(m);for(let S=0;S<T.length;++S){const k=T[S],N=k.query,$=Zy(n,k);n.listenProvider_.startListening(jr(N),ea(n,N),$.hashFn,$.onComplete)}}}!p&&u.length>0&&!s&&(f?n.listenProvider_.stopListening(jr(e),null):u.forEach(m=>{const T=n.queryToTagMap.get(xa(m));n.listenProvider_.stopListening(jr(m),T)}))}s0(n,u)}return c}function e0(n,e,t,s){const r=ah(n,s);if(r!=null){const i=ch(r),o=i.path,c=i.queryId,l=Je(o,e),u=new ss(eh(c),l,t);return lh(n,o,u)}else return[]}function t0(n,e,t,s){const r=ah(n,s);if(r){const i=ch(r),o=i.path,c=i.queryId,l=Je(o,e),u=ce.fromObject(t),f=new li(eh(c),l,u);return lh(n,o,f)}else return[]}function $p(n,e,t,s=!1){const r=e._path;let i=null,o=!1;n.syncPointTree_.foreachOnPath(r,(m,T)=>{const S=Je(m,r);i=i||Ns(T,S),o=o||bn(T)});let c=n.syncPointTree_.get(r);c?(o=o||bn(c),i=i||Ns(c,te())):(c=new qN,n.syncPointTree_=n.syncPointTree_.set(r,c));let l;i!=null?l=!0:(l=!1,i=B.EMPTY_NODE,n.syncPointTree_.subtree(r).foreachChild((T,S)=>{const k=Ns(S,te());k&&(i=i.updateImmediateChild(T,k))}));const u=Qy(c,e);if(!u&&!e._queryParams.loadsAllData()){const m=xa(e);D(!n.queryToTagMap.has(m),"View does not exist, but we have a tag");const T=r0();n.queryToTagMap.set(m,T),n.tagToQueryMap.set(T,m)}const f=th(n.pendingWriteTree_,r);let p=GN(c,e,t,f,i,l);if(!u&&!o&&!s){const m=Ky(c,e);p=p.concat(i0(n,e,m))}return p}function oh(n,e,t){const r=n.pendingWriteTree_,i=n.syncPointTree_.findOnPath(e,(o,c)=>{const l=Je(o,e),u=Ns(c,l);if(u)return u});return qy(r,e,i,t,!0)}function Ni(n,e){return Jy(e,n.syncPointTree_,null,th(n.pendingWriteTree_,te()))}function Jy(n,e,t,s){if(z(n.path))return Xy(n,e,t,s);{const r=e.get(te());t==null&&r!=null&&(t=Ns(r,te()));let i=[];const o=G(n.path),c=n.operationForChild(o),l=e.children.get(o);if(l&&c){const u=t?t.getImmediateChild(o):null,f=$y(s,o);i=i.concat(Jy(c,l,u,f))}return r&&(i=i.concat(ih(r,n,s,t))),i}}function Xy(n,e,t,s){const r=e.get(te());t==null&&r!=null&&(t=Ns(r,te()));let i=[];return e.children.inorderTraversal((o,c)=>{const l=t?t.getImmediateChild(o):null,u=$y(s,o),f=n.operationForChild(o);f&&(i=i.concat(Xy(f,c,l,u)))}),r&&(i=i.concat(ih(r,n,s,t))),i}function Zy(n,e){const t=e.query,s=ea(n,t);return{hashFn:()=>(LN(e)||B.EMPTY_NODE).hash(),onComplete:r=>{if(r==="ok")return s?ZN(n,t._path,s):XN(n,t._path);{const i=ZP(r,t);return _l(n,t,null,i)}}}}function ea(n,e){const t=xa(e);return n.queryToTagMap.get(t)}function xa(n){return n._path.toString()+"$"+n._queryIdentifier}function ah(n,e){return n.tagToQueryMap.get(e)}function ch(n){const e=n.indexOf("$");return D(e!==-1&&e<n.length-1,"Bad queryKey."),{queryId:n.substr(e+1),path:new re(n.substr(0,e))}}function lh(n,e,t){const s=n.syncPointTree_.get(e);D(s,"Missing sync point for query tag that we're tracking");const r=th(n.pendingWriteTree_,e);return ih(s,t,r,null)}function n0(n){return n.fold((e,t,s)=>{if(t&&bn(t))return[Va(t)];{let r=[];return t&&(r=zy(t)),je(s,(i,o)=>{r=r.concat(o)}),r}})}function jr(n){return n._queryParams.loadsAllData()&&!n._queryParams.isDefault()?new(QN())(n._repo,n._path):n}function s0(n,e){for(let t=0;t<e.length;++t){const s=e[t];if(!s._queryParams.loadsAllData()){const r=xa(s),i=n.queryToTagMap.get(r);n.queryToTagMap.delete(r),n.tagToQueryMap.delete(i)}}}function r0(){return YN++}function i0(n,e,t){const s=e._path,r=ea(n,e),i=Zy(n,t),o=n.listenProvider_.startListening(jr(e),r,i.hashFn,i.onComplete),c=n.syncPointTree_.subtree(s);if(r)D(!bn(c.value),"If we're adding a query, it shouldn't be shadowed");else{const l=c.fold((u,f,p)=>{if(!z(u)&&f&&bn(f))return[Va(f).query];{let m=[];return f&&(m=m.concat(zy(f).map(T=>T.query))),je(p,(T,S)=>{m=m.concat(S)}),m}});for(let u=0;u<l.length;++u){const f=l[u];n.listenProvider_.stopListening(jr(f),ea(n,f))}}return o}/**
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
 */class uh{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new uh(t)}node(){return this.node_}}class hh{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=_e(this.path_,e);return new hh(this.syncTree_,t)}node(){return oh(this.syncTree_,this.path_)}}const o0=function(n){return n=n||{},n.timestamp=n.timestamp||new Date().getTime(),n},Wp=function(n,e,t){if(!n||typeof n!="object")return n;if(D(".sv"in n,"Unexpected leaf node or priority contents"),typeof n[".sv"]=="string")return a0(n[".sv"],e,t);if(typeof n[".sv"]=="object")return c0(n[".sv"],e);D(!1,"Unexpected server value: "+JSON.stringify(n,null,2))},a0=function(n,e,t){switch(n){case"timestamp":return t.timestamp;default:D(!1,"Unexpected server value: "+n)}},c0=function(n,e,t){n.hasOwnProperty("increment")||D(!1,"Unexpected server value: "+JSON.stringify(n,null,2));const s=n.increment;typeof s!="number"&&D(!1,"Unexpected increment value: "+s);const r=e.node();if(D(r!==null&&typeof r<"u","Expected ChildrenNode.EMPTY_NODE for nulls"),!r.isLeafNode())return s;const o=r.getValue();return typeof o!="number"?s:o+s},l0=function(n,e,t,s){return dh(e,new hh(t,n),s)},eE=function(n,e,t){return dh(n,new uh(e),t)};function dh(n,e,t){const s=n.getPriority().val(),r=Wp(s,e.getImmediateChild(".priority"),t);let i;if(n.isLeafNode()){const o=n,c=Wp(o.getValue(),e,t);return c!==o.getValue()||r!==o.getPriority().val()?new Pe(c,we(r)):n}else{const o=n;return i=o,r!==o.getPriority().val()&&(i=i.updatePriority(new Pe(r))),o.forEachChild(he,(c,l)=>{const u=dh(l,e.getImmediateChild(c),t);u!==l&&(i=i.updateImmediateChild(c,u))}),i}}/**
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
 */class fh{constructor(e="",t=null,s={children:{},childCount:0}){this.name=e,this.parent=t,this.node=s}}function ph(n,e){let t=e instanceof re?e:new re(e),s=n,r=G(t);for(;r!==null;){const i=Ds(s.node.children,r)||{children:{},childCount:0};s=new fh(r,s,i),t=oe(t),r=G(t)}return s}function rr(n){return n.node.value}function tE(n,e){n.node.value=e,yl(n)}function nE(n){return n.node.childCount>0}function u0(n){return rr(n)===void 0&&!nE(n)}function La(n,e){je(n.node.children,(t,s)=>{e(new fh(t,n,s))})}function sE(n,e,t,s){t&&e(n),La(n,r=>{sE(r,e,!0)})}function h0(n,e,t){let s=n.parent;for(;s!==null;){if(e(s))return!0;s=s.parent}return!1}function Di(n){return new re(n.parent===null?n.name:Di(n.parent)+"/"+n.name)}function yl(n){n.parent!==null&&d0(n.parent,n.name,n)}function d0(n,e,t){const s=u0(t),r=Vt(n.node.children,e);s&&r?(delete n.node.children[e],n.node.childCount--,yl(n)):!s&&!r&&(n.node.children[e]=t.node,n.node.childCount++,yl(n))}/**
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
 */const f0=/[\[\].#$\/\u0000-\u001F\u007F]/,p0=/[\[\].#$\u0000-\u001F\u007F]/,Oc=10*1024*1024,mh=function(n){return typeof n=="string"&&n.length!==0&&!f0.test(n)},rE=function(n){return typeof n=="string"&&n.length!==0&&!p0.test(n)},m0=function(n){return n&&(n=n.replace(/^\/*\.info(\/|$)/,"/")),rE(n)},iE=function(n){return n===null||typeof n=="string"||typeof n=="number"&&!Na(n)||n&&typeof n=="object"&&Vt(n,".sv")},El=function(n,e,t,s){Fa(Os(n,"value"),e,t)},Fa=function(n,e,t){const s=t instanceof re?new Ok(t,n):t;if(e===void 0)throw new Error(n+"contains undefined "+Bn(s));if(typeof e=="function")throw new Error(n+"contains a function "+Bn(s)+" with contents = "+e.toString());if(Na(e))throw new Error(n+"contains "+e.toString()+" "+Bn(s));if(typeof e=="string"&&e.length>Oc/3&&aa(e)>Oc)throw new Error(n+"contains a string greater than "+Oc+" utf8 bytes "+Bn(s)+" ('"+e.substring(0,50)+"...')");if(e&&typeof e=="object"){let r=!1,i=!1;if(je(e,(o,c)=>{if(o===".value")r=!0;else if(o!==".priority"&&o!==".sv"&&(i=!0,!mh(o)))throw new Error(n+" contains an invalid key ("+o+") "+Bn(s)+`.  Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`);Vk(s,o),Fa(n,c,s),Mk(s)}),r&&i)throw new Error(n+' contains ".value" child '+Bn(s)+" in addition to actual children.")}},g0=function(n,e){let t,s;for(t=0;t<e.length;t++){s=e[t];const i=ri(s);for(let o=0;o<i.length;o++)if(!(i[o]===".priority"&&o===i.length-1)){if(!mh(i[o]))throw new Error(n+"contains an invalid key ("+i[o]+") in path "+s.toString()+`. Keys must be non-empty strings and can't contain ".", "#", "$", "/", "[", or "]"`)}}e.sort(Dk);let r=null;for(t=0;t<e.length;t++){if(s=e[t],r!==null&&ut(r,s))throw new Error(n+"contains a path "+r.toString()+" that is ancestor of another path "+s.toString());r=s}},_0=function(n,e,t,s){const r=Os(n,"values");if(!(e&&typeof e=="object")||Array.isArray(e))throw new Error(r+" must be an object containing the children to replace.");const i=[];je(e,(o,c)=>{const l=new re(o);if(Fa(r,c,_e(t,l)),zu(l)===".priority"&&!iE(c))throw new Error(r+"contains an invalid value for '"+l.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");i.push(l)}),g0(r,i)},y0=function(n,e,t){if(Na(e))throw new Error(Os(n,"priority")+"is "+e.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!iE(e))throw new Error(Os(n,"priority")+"must be a valid Firebase priority (a string, finite number, server value, or null).")},oE=function(n,e,t,s){if(!rE(t))throw new Error(Os(n,e)+'was an invalid path = "'+t+`". Paths must be non-empty strings and can't contain ".", "#", "$", "[", or "]"`)},E0=function(n,e,t,s){t&&(t=t.replace(/^\/*\.info(\/|$)/,"/")),oE(n,e,t)},Dr=function(n,e){if(G(e)===".info")throw new Error(n+" failed = Can't modify data under /.info/")},T0=function(n,e){const t=e.path.toString();if(typeof e.repoInfo.host!="string"||e.repoInfo.host.length===0||!mh(e.repoInfo.namespace)&&e.repoInfo.host.split(":")[0]!=="localhost"||t.length!==0&&!m0(t))throw new Error(Os(n,"url")+`must be a valid firebase URL and the path can't contain ".", "#", "$", "[", or "]".`)};/**
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
 */class w0{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function gh(n,e){let t=null;for(let s=0;s<e.length;s++){const r=e[s],i=r.getPath();t!==null&&!Ku(i,t.path)&&(n.eventLists_.push(t),t=null),t===null&&(t={events:[],path:i}),t.events.push(r)}t&&n.eventLists_.push(t)}function aE(n,e,t){gh(n,t),cE(n,s=>Ku(s,e))}function Yt(n,e,t){gh(n,t),cE(n,s=>ut(s,e)||ut(e,s))}function cE(n,e){n.recursionDepth_++;let t=!0;for(let s=0;s<n.eventLists_.length;s++){const r=n.eventLists_[s];if(r){const i=r.path;e(i)?(I0(n.eventLists_[s]),n.eventLists_[s]=null):t=!1}}t&&(n.eventLists_=[]),n.recursionDepth_--}function I0(n){for(let e=0;e<n.events.length;e++){const t=n.events[e];if(t!==null){n.events[e]=null;const s=t.getEventRunner();Br&&Me("event: "+t.toString()),nr(s)}}}/**
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
 */const v0="repo_interrupt",A0=25;class R0{constructor(e,t,s,r){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=s,this.appCheckProvider_=r,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new w0,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=zo(),this.transactionQueueTree_=new fh,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function C0(n,e,t){if(n.stats_=Hu(n.repoInfo_),n.forceRestClient_||sk())n.server_=new Go(n.repoInfo_,(s,r,i,o)=>{jp(n,s,r,i,o)},n.authTokenProvider_,n.appCheckProvider_),setTimeout(()=>Hp(n,!0),0);else{if(typeof t<"u"&&t!==null){if(typeof t!="object")throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{Oe(t)}catch(s){throw new Error("Invalid authOverride provided: "+s)}}n.persistentConnection_=new Wt(n.repoInfo_,e,(s,r,i,o)=>{jp(n,s,r,i,o)},s=>{Hp(n,s)},s=>{b0(n,s)},n.authTokenProvider_,n.appCheckProvider_,t),n.server_=n.persistentConnection_}n.authTokenProvider_.addTokenChangeListener(s=>{n.server_.refreshAuthToken(s)}),n.appCheckProvider_.addTokenChangeListener(s=>{n.server_.refreshAppCheckToken(s.token)}),n.statsReporter_=ck(n.repoInfo_,()=>new aN(n.stats_,n.server_)),n.infoData_=new nN,n.infoSyncTree_=new qp({startListening:(s,r,i,o)=>{let c=[];const l=n.infoData_.getNode(s._path);return l.isEmpty()||(c=Ma(n.infoSyncTree_,s._path,l),setTimeout(()=>{o("ok")},0)),c},stopListening:()=>{}}),yh(n,"connected",!1),n.serverSyncTree_=new qp({startListening:(s,r,i,o)=>(n.server_.listen(s,i,r,(c,l)=>{const u=o(c,l);Yt(n.eventQueue_,s._path,u)}),[]),stopListening:(s,r)=>{n.server_.unlisten(s,r)}})}function S0(n){const t=n.infoData_.getNode(new re(".info/serverTimeOffset")).val()||0;return new Date().getTime()+t}function _h(n){return o0({timestamp:S0(n)})}function jp(n,e,t,s,r){n.dataUpdateCount++;const i=new re(e);t=n.interceptServerDataCallback_?n.interceptServerDataCallback_(e,t):t;let o=[];if(r)if(s){const l=To(t,u=>we(u));o=t0(n.serverSyncTree_,i,l,r)}else{const l=we(t);o=e0(n.serverSyncTree_,i,l,r)}else if(s){const l=To(t,u=>we(u));o=JN(n.serverSyncTree_,i,l)}else{const l=we(t);o=Ma(n.serverSyncTree_,i,l)}let c=i;o.length>0&&(c=Ua(n,i)),Yt(n.eventQueue_,c,o)}function Hp(n,e){yh(n,"connected",e),e===!1&&k0(n)}function b0(n,e){je(e,(t,s)=>{yh(n,t,s)})}function yh(n,e,t){const s=new re("/.info/"+e),r=we(t);n.infoData_.updateSnapshot(s,r);const i=Ma(n.infoSyncTree_,s,r);Yt(n.eventQueue_,s,i)}function lE(n){return n.nextWriteId_++}function P0(n,e,t,s,r){Eh(n,"set",{path:e.toString(),value:t,priority:s});const i=_h(n),o=we(t,s),c=oh(n.serverSyncTree_,e),l=eE(o,c,i),u=lE(n),f=Yy(n.serverSyncTree_,e,l,u,!0);gh(n.eventQueue_,f),n.server_.put(e.toString(),o.val(!0),(m,T)=>{const S=m==="ok";S||et("set at "+e+" failed: "+m);const k=Gn(n.serverSyncTree_,u,!S);Yt(n.eventQueue_,e,k),Ws(n,r,m,T)});const p=pE(n,e);Ua(n,p),Yt(n.eventQueue_,p,[])}function k0(n){Eh(n,"onDisconnectEvents");const e=_h(n),t=zo();hl(n.onDisconnect_,te(),(r,i)=>{const o=l0(r,i,n.serverSyncTree_,e);sr(t,r,o)});let s=[];hl(t,te(),(r,i)=>{s=s.concat(Ma(n.serverSyncTree_,r,i));const o=pE(n,r);Ua(n,o)}),n.onDisconnect_=zo(),Yt(n.eventQueue_,te(),s)}function N0(n,e,t){n.server_.onDisconnectCancel(e.toString(),(s,r)=>{s==="ok"&&ul(n.onDisconnect_,e),Ws(n,t,s,r)})}function Gp(n,e,t,s){const r=we(t);n.server_.onDisconnectPut(e.toString(),r.val(!0),(i,o)=>{i==="ok"&&sr(n.onDisconnect_,e,r),Ws(n,s,i,o)})}function D0(n,e,t,s,r){const i=we(t,s);n.server_.onDisconnectPut(e.toString(),i.val(!0),(o,c)=>{o==="ok"&&sr(n.onDisconnect_,e,i),Ws(n,r,o,c)})}function O0(n,e,t,s){if(Eo(t)){Me("onDisconnect().update() called with empty data.  Don't do anything."),Ws(n,s,"ok",void 0);return}n.server_.onDisconnectMerge(e.toString(),t,(r,i)=>{r==="ok"&&je(t,(o,c)=>{const l=we(c);sr(n.onDisconnect_,_e(e,o),l)}),Ws(n,s,r,i)})}function V0(n,e,t){let s;G(e._path)===".info"?s=$p(n.infoSyncTree_,e,t):s=$p(n.serverSyncTree_,e,t),aE(n.eventQueue_,e._path,s)}function M0(n,e,t){let s;G(e._path)===".info"?s=_l(n.infoSyncTree_,e,t):s=_l(n.serverSyncTree_,e,t),aE(n.eventQueue_,e._path,s)}function x0(n){n.persistentConnection_&&n.persistentConnection_.interrupt(v0)}function Eh(n,...e){let t="";n.persistentConnection_&&(t=n.persistentConnection_.id+":"),Me(t,...e)}function Ws(n,e,t,s){e&&nr(()=>{if(t==="ok")e(null);else{const r=(t||"error").toUpperCase();let i=r;s&&(i+=": "+s);const o=new Error(i);o.code=r,e(o)}})}function uE(n,e,t){return oh(n.serverSyncTree_,e,t)||B.EMPTY_NODE}function Th(n,e=n.transactionQueueTree_){if(e||Ba(n,e),rr(e)){const t=dE(n,e);D(t.length>0,"Sending zero length transaction queue"),t.every(r=>r.status===0)&&L0(n,Di(e),t)}else nE(e)&&La(e,t=>{Th(n,t)})}function L0(n,e,t){const s=t.map(u=>u.currentWriteId),r=uE(n,e,s);let i=r;const o=r.hash();for(let u=0;u<t.length;u++){const f=t[u];D(f.status===0,"tryToSendTransactionQueue_: items in queue should all be run."),f.status=1,f.retryCount++;const p=Je(e,f.path);i=i.updateChild(p,f.currentOutputSnapshotRaw)}const c=i.val(!0),l=e;n.server_.put(l.toString(),c,u=>{Eh(n,"transaction put response",{path:l.toString(),status:u});let f=[];if(u==="ok"){const p=[];for(let m=0;m<t.length;m++)t[m].status=2,f=f.concat(Gn(n.serverSyncTree_,t[m].currentWriteId)),t[m].onComplete&&p.push(()=>t[m].onComplete(null,!0,t[m].currentOutputSnapshotResolved)),t[m].unwatcher();Ba(n,ph(n.transactionQueueTree_,e)),Th(n,n.transactionQueueTree_),Yt(n.eventQueue_,e,f);for(let m=0;m<p.length;m++)nr(p[m])}else{if(u==="datastale")for(let p=0;p<t.length;p++)t[p].status===3?t[p].status=4:t[p].status=0;else{et("transaction at "+l.toString()+" failed: "+u);for(let p=0;p<t.length;p++)t[p].status=4,t[p].abortReason=u}Ua(n,e)}},o)}function Ua(n,e){const t=hE(n,e),s=Di(t),r=dE(n,t);return F0(n,r,s),s}function F0(n,e,t){if(e.length===0)return;const s=[];let r=[];const o=e.filter(c=>c.status===0).map(c=>c.currentWriteId);for(let c=0;c<e.length;c++){const l=e[c],u=Je(t,l.path);let f=!1,p;if(D(u!==null,"rerunTransactionsUnderNode_: relativePath should not be null."),l.status===4)f=!0,p=l.abortReason,r=r.concat(Gn(n.serverSyncTree_,l.currentWriteId,!0));else if(l.status===0)if(l.retryCount>=A0)f=!0,p="maxretry",r=r.concat(Gn(n.serverSyncTree_,l.currentWriteId,!0));else{const m=uE(n,l.path,o);l.currentInputSnapshot=m;const T=e[c].update(m.val());if(T!==void 0){Fa("transaction failed: Data returned ",T,l.path);let S=we(T);typeof T=="object"&&T!=null&&Vt(T,".priority")||(S=S.updatePriority(m.getPriority()));const N=l.currentWriteId,$=_h(n),j=eE(S,m,$);l.currentOutputSnapshotRaw=S,l.currentOutputSnapshotResolved=j,l.currentWriteId=lE(n),o.splice(o.indexOf(N),1),r=r.concat(Yy(n.serverSyncTree_,l.path,j,l.currentWriteId,l.applyLocally)),r=r.concat(Gn(n.serverSyncTree_,N,!0))}else f=!0,p="nodata",r=r.concat(Gn(n.serverSyncTree_,l.currentWriteId,!0))}Yt(n.eventQueue_,t,r),r=[],f&&(e[c].status=2,(function(m){setTimeout(m,Math.floor(0))})(e[c].unwatcher),e[c].onComplete&&(p==="nodata"?s.push(()=>e[c].onComplete(null,!1,e[c].currentInputSnapshot)):s.push(()=>e[c].onComplete(new Error(p),!1,null))))}Ba(n,n.transactionQueueTree_);for(let c=0;c<s.length;c++)nr(s[c]);Th(n,n.transactionQueueTree_)}function hE(n,e){let t,s=n.transactionQueueTree_;for(t=G(e);t!==null&&rr(s)===void 0;)s=ph(s,t),e=oe(e),t=G(e);return s}function dE(n,e){const t=[];return fE(n,e,t),t.sort((s,r)=>s.order-r.order),t}function fE(n,e,t){const s=rr(e);if(s)for(let r=0;r<s.length;r++)t.push(s[r]);La(e,r=>{fE(n,r,t)})}function Ba(n,e){const t=rr(e);if(t){let s=0;for(let r=0;r<t.length;r++)t[r].status!==2&&(t[s]=t[r],s++);t.length=s,tE(e,t.length>0?t:void 0)}La(e,s=>{Ba(n,s)})}function pE(n,e){const t=Di(hE(n,e)),s=ph(n.transactionQueueTree_,e);return h0(s,r=>{Vc(n,r)}),Vc(n,s),sE(s,r=>{Vc(n,r)}),t}function Vc(n,e){const t=rr(e);if(t){const s=[];let r=[],i=-1;for(let o=0;o<t.length;o++)t[o].status===3||(t[o].status===1?(D(i===o-1,"All SENT items should be at beginning of queue."),i=o,t[o].status=3,t[o].abortReason="set"):(D(t[o].status===0,"Unexpected transaction status in abort"),t[o].unwatcher(),r=r.concat(Gn(n.serverSyncTree_,t[o].currentWriteId,!0)),t[o].onComplete&&s.push(t[o].onComplete.bind(null,new Error("set"),!1,null))));i===-1?tE(e,void 0):t.length=i+1,Yt(n.eventQueue_,Di(e),r);for(let o=0;o<s.length;o++)nr(s[o])}}/**
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
 */function U0(n){let e="";const t=n.split("/");for(let s=0;s<t.length;s++)if(t[s].length>0){let r=t[s];try{r=decodeURIComponent(r.replace(/\+/g," "))}catch{}e+="/"+r}return e}function B0(n){const e={};n.charAt(0)==="?"&&(n=n.substring(1));for(const t of n.split("&")){if(t.length===0)continue;const s=t.split("=");s.length===2?e[decodeURIComponent(s[0])]=decodeURIComponent(s[1]):et(`Invalid query segment '${t}' in query '${n}'`)}return e}const zp=function(n,e){const t=q0(n),s=t.namespace;t.domain==="firebase.com"&&Qt(t.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),(!s||s==="undefined")&&t.domain!=="localhost"&&Qt("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),t.secure||KP();const r=t.scheme==="ws"||t.scheme==="wss";return{repoInfo:new Ty(t.host,t.secure,s,r,e,"",s!==t.subdomain),path:new re(t.pathString)}},q0=function(n){let e="",t="",s="",r="",i="",o=!0,c="https",l=443;if(typeof n=="string"){let u=n.indexOf("//");u>=0&&(c=n.substring(0,u-1),n=n.substring(u+2));let f=n.indexOf("/");f===-1&&(f=n.length);let p=n.indexOf("?");p===-1&&(p=n.length),e=n.substring(0,Math.min(f,p)),f<p&&(r=U0(n.substring(f,p)));const m=B0(n.substring(Math.min(n.length,p)));u=e.indexOf(":"),u>=0?(o=c==="https"||c==="wss",l=parseInt(e.substring(u+1),10)):u=e.length;const T=e.slice(0,u);if(T.toLowerCase()==="localhost")t="localhost";else if(T.split(".").length<=2)t=T;else{const S=e.indexOf(".");s=e.substring(0,S).toLowerCase(),t=e.substring(S+1),i=s}"ns"in m&&(i=m.ns)}return{host:e,port:l,domain:t,subdomain:s,secure:o,scheme:c,pathString:r,namespace:i}};/**
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
 */class $0{constructor(e,t,s,r){this.eventType=e,this.eventRegistration=t,this.snapshot=s,this.prevName=r}getPath(){const e=this.snapshot.ref;return this.eventType==="value"?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+Oe(this.snapshot.exportVal())}}class W0{constructor(e,t,s){this.eventRegistration=e,this.error=t,this.path=s}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}/**
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
 */class j0{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return D(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||this.snapshotCallback.userCallback!==void 0&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}/**
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
 */class H0{constructor(e,t){this._repo=e,this._path=t}cancel(){const e=new Ft;return N0(this._repo,this._path,e.wrapCallback(()=>{})),e.promise}remove(){Dr("OnDisconnect.remove",this._path);const e=new Ft;return Gp(this._repo,this._path,null,e.wrapCallback(()=>{})),e.promise}set(e){Dr("OnDisconnect.set",this._path),El("OnDisconnect.set",e,this._path);const t=new Ft;return Gp(this._repo,this._path,e,t.wrapCallback(()=>{})),t.promise}setWithPriority(e,t){Dr("OnDisconnect.setWithPriority",this._path),El("OnDisconnect.setWithPriority",e,this._path),y0("OnDisconnect.setWithPriority",t);const s=new Ft;return D0(this._repo,this._path,e,t,s.wrapCallback(()=>{})),s.promise}update(e){Dr("OnDisconnect.update",this._path),_0("OnDisconnect.update",e,this._path);const t=new Ft;return O0(this._repo,this._path,e,t.wrapCallback(()=>{})),t.promise}}/**
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
 */class wh{constructor(e,t,s,r){this._repo=e,this._path=t,this._queryParams=s,this._orderByCalled=r}get key(){return z(this._path)?null:zu(this._path)}get ref(){return new Dn(this._repo,this._path)}get _queryIdentifier(){const e=kp(this._queryParams),t=Wu(e);return t==="{}"?"default":t}get _queryObject(){return kp(this._queryParams)}isEqual(e){if(e=W(e),!(e instanceof wh))return!1;const t=this._repo===e._repo,s=Ku(this._path,e._path),r=this._queryIdentifier===e._queryIdentifier;return t&&s&&r}toJSON(){return this.toString()}toString(){return this._repo.toString()+Nk(this._path)}}class Dn extends wh{constructor(e,t){super(e,t,new Xu,!1)}get parent(){const e=Py(this._path);return e===null?null:new Dn(this._repo,e)}get root(){let e=this;for(;e.parent!==null;)e=e.parent;return e}}class ta{constructor(e,t,s){this._node=e,this.ref=t,this._index=s}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new re(e),s=Tl(this.ref,e);return new ta(this._node.getChild(t),s,he)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){return this._node.isLeafNode()?!1:!!this._node.forEachChild(this._index,(s,r)=>e(new ta(r,Tl(this.ref,s),he)))}hasChild(e){const t=new re(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return this._node.isLeafNode()?!1:!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function pO(n,e){return n=W(n),n._checkNotDeleted("ref"),e!==void 0?Tl(n._root,e):n._root}function Tl(n,e){return n=W(n),G(n._path)===null?E0("child","path",e):oE("child","path",e),new Dn(n._repo,_e(n._path,e))}function mO(n){return n=W(n),new H0(n._repo,n._path)}function gO(n,e){n=W(n),Dr("set",n._path),El("set",e,n._path);const t=new Ft;return P0(n._repo,n._path,e,null,t.wrapCallback(()=>{})),t.promise}class Ih{constructor(e){this.callbackContext=e}respondsTo(e){return e==="value"}createEvent(e,t){const s=t._queryParams.getIndex();return new $0("value",this,new ta(e.snapshotNode,new Dn(t._repo,t._path),s))}getEventRunner(e){return e.getEventType()==="cancel"?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new W0(this,e,t):null}matches(e){return e instanceof Ih?!e.callbackContext||!this.callbackContext?!0:e.callbackContext.matches(this.callbackContext):!1}hasAnyCallback(){return this.callbackContext!==null}}function G0(n,e,t,s,r){const i=new j0(t,void 0),o=new Ih(i);return V0(n._repo,n,o),()=>M0(n._repo,n,o)}function _O(n,e,t,s){return G0(n,"value",e)}$N(Dn);KN(Dn);/**
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
 */const z0="FIREBASE_DATABASE_EMULATOR_HOST",wl={};let K0=!1;function Q0(n,e,t,s){const r=e.lastIndexOf(":"),i=e.substring(0,r),o=wt(i);n.repoInfo_=new Ty(e,o,n.repoInfo_.namespace,n.repoInfo_.webSocketOnly,n.repoInfo_.nodeAdmin,n.repoInfo_.persistenceKey,n.repoInfo_.includeNamespaceInQueryParams,!0,t),s&&(n.authTokenProvider_=s)}function Y0(n,e,t,s,r){let i=s||n.options.databaseURL;i===void 0&&(n.options.projectId||Qt("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),Me("Using default host for project ",n.options.projectId),i=`${n.options.projectId}-default-rtdb.firebaseio.com`);let o=zp(i,r),c=o.repoInfo,l;typeof process<"u"&&dp&&(l=dp[z0]),l?(i=`http://${l}?ns=${c.namespace}`,o=zp(i,r),c=o.repoInfo):o.repoInfo.secure;const u=new ik(n.name,n.options,e);T0("Invalid Firebase Database URL",o),z(o.path)||Qt("Database URL must point to the root of a Firebase Database (not including a child path).");const f=X0(c,n,u,new rk(n,t));return new Z0(f,n)}function J0(n,e){const t=wl[e];(!t||t[n.key]!==n)&&Qt(`Database ${e}(${n.repoInfo_}) has already been deleted.`),x0(n),delete t[n.key]}function X0(n,e,t,s){let r=wl[e.name];r||(r={},wl[e.name]=r);let i=r[n.toURLString()];return i&&Qt("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call."),i=new R0(n,K0,t,s),r[n.toURLString()]=i,i}class Z0{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(C0(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new Dn(this._repo,te())),this._rootInternal}_delete(){return this._rootInternal!==null&&(J0(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){this._rootInternal===null&&Qt("Cannot call "+e+" on a deleted database.")}}function yO(n=zs(),e){const t=Jt(n,"database").getImmediate({identifier:e});if(!t._instanceStarted){const s=oa("database");s&&eD(t,...s)}return t}function eD(n,e,t,s={}){n=W(n),n._checkNotDeleted("useEmulator");const r=`${e}:${t}`,i=n._repoInternal;if(n._instanceStarted){if(r===n._repoInternal.repoInfo_.host&&Nt(s,i.repoInfo_.emulatorOptions))return;Qt("connectDatabaseEmulator() cannot initialize or alter the emulator configuration after the database instance has started.")}let o;if(i.repoInfo_.nodeAdmin)s.mockUserToken&&Qt('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),o=new go(go.OWNER);else if(s.mockUserToken){const c=typeof s.mockUserToken=="string"?s.mockUserToken:Al(s.mockUserToken,n.app.options.projectId);o=new go(c)}wt(e)&&ui(e),Q0(i,r,s,o)}/**
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
 */function tD(n){$P(Pn),ct(new tt("database",(e,{instanceIdentifier:t})=>{const s=e.getProvider("app").getImmediate(),r=e.getProvider("auth-internal"),i=e.getProvider("app-check-internal");return Y0(s,r,i,t)},"PUBLIC").setMultipleInstances(!0)),Ve(fp,pp,n),Ve(fp,pp,"esm2020")}/**
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
 */const nD={".sv":"timestamp"};function EO(){return nD}Wt.prototype.simpleListen=function(n,e){this.sendRequest("q",{p:n},e)};Wt.prototype.echo=function(n,e){this.sendRequest("echo",{d:n},e)};tD();/**
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
 */const sD="type.googleapis.com/google.protobuf.Int64Value",rD="type.googleapis.com/google.protobuf.UInt64Value";function mE(n,e){const t={};for(const s in n)n.hasOwnProperty(s)&&(t[s]=e(n[s]));return t}function na(n){if(n==null)return null;if(n instanceof Number&&(n=n.valueOf()),typeof n=="number"&&isFinite(n)||n===!0||n===!1||Object.prototype.toString.call(n)==="[object String]")return n;if(n instanceof Date)return n.toISOString();if(Array.isArray(n))return n.map(e=>na(e));if(typeof n=="function"||typeof n=="object")return mE(n,e=>na(e));throw new Error("Data cannot be encoded in JSON: "+n)}function js(n){if(n==null)return n;if(n["@type"])switch(n["@type"]){case sD:case rD:{const e=Number(n.value);if(isNaN(e))throw new Error("Data cannot be decoded from JSON: "+n);return e}default:throw new Error("Data cannot be decoded from JSON: "+n)}return Array.isArray(n)?n.map(e=>js(e)):typeof n=="function"||typeof n=="object"?mE(n,e=>js(e)):n}/**
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
 */const vh="functions";/**
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
 */const Kp={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Ze extends dt{constructor(e,t,s){super(`${vh}/${e}`,t||""),this.details=s,Object.setPrototypeOf(this,Ze.prototype)}}function iD(n){if(n>=200&&n<300)return"ok";switch(n){case 0:return"internal";case 400:return"invalid-argument";case 401:return"unauthenticated";case 403:return"permission-denied";case 404:return"not-found";case 409:return"aborted";case 429:return"resource-exhausted";case 499:return"cancelled";case 500:return"internal";case 501:return"unimplemented";case 503:return"unavailable";case 504:return"deadline-exceeded"}return"unknown"}function sa(n,e){let t=iD(n),s=t,r;try{const i=e&&e.error;if(i){const o=i.status;if(typeof o=="string"){if(!Kp[o])return new Ze("internal","internal");t=Kp[o],s=o}const c=i.message;typeof c=="string"&&(s=c),r=i.details,r!==void 0&&(r=js(r))}}catch{}return t==="ok"?null:new Ze(t,s,r)}/**
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
 */class oD{constructor(e,t,s,r){this.app=e,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,qe(e)&&e.settings.appCheckToken&&(this.serverAppAppCheckToken=e.settings.appCheckToken),this.auth=t.getImmediate({optional:!0}),this.messaging=s.getImmediate({optional:!0}),this.auth||t.get().then(i=>this.auth=i,()=>{}),this.messaging||s.get().then(i=>this.messaging=i,()=>{}),this.appCheck||r==null||r.get().then(i=>this.appCheck=i,()=>{})}async getAuthToken(){if(this.auth)try{const e=await this.auth.getToken();return e==null?void 0:e.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(e){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const t=e?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return t.error?null:t.token}return null}async getContext(e){const t=await this.getAuthToken(),s=await this.getMessagingToken(),r=await this.getAppCheckToken(e);return{authToken:t,messagingToken:s,appCheckToken:r}}}/**
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
 */const Il="us-central1",aD=/^data: (.*?)(?:\n|$)/;function cD(n){let e=null;return{promise:new Promise((t,s)=>{e=setTimeout(()=>{s(new Ze("deadline-exceeded","deadline-exceeded"))},n)}),cancel:()=>{e&&clearTimeout(e)}}}class lD{constructor(e,t,s,r,i=Il,o=(...c)=>fetch(...c)){this.app=e,this.fetchImpl=o,this.emulatorOrigin=null,this.contextProvider=new oD(e,t,s,r),this.cancelAllRequests=new Promise(c=>{this.deleteService=()=>Promise.resolve(c())});try{const c=new URL(i);this.customDomain=c.origin+(c.pathname==="/"?"":c.pathname),this.region=Il}catch{this.customDomain=null,this.region=i}}_delete(){return this.deleteService()}_url(e){const t=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${t}/${this.region}/${e}`:this.customDomain!==null?`${this.customDomain}/${e}`:`https://${this.region}-${t}.cloudfunctions.net/${e}`}}function uD(n,e,t){const s=wt(e);n.emulatorOrigin=`http${s?"s":""}://${e}:${t}`,s&&ui(n.emulatorOrigin+"/backends")}function hD(n,e,t){const s=r=>fD(n,e,r,{});return s.stream=(r,i)=>mD(n,e,r,i),s}function gE(n){return n.emulatorOrigin&&wt(n.emulatorOrigin)?"include":void 0}async function dD(n,e,t,s,r){t["Content-Type"]="application/json";let i;try{i=await s(n,{method:"POST",body:JSON.stringify(e),headers:t,credentials:gE(r)})}catch{return{status:0,json:null}}let o=null;try{o=await i.json()}catch{}return{status:i.status,json:o}}async function _E(n,e){const t={},s=await n.contextProvider.getContext(e.limitedUseAppCheckTokens);return s.authToken&&(t.Authorization="Bearer "+s.authToken),s.messagingToken&&(t["Firebase-Instance-ID-Token"]=s.messagingToken),s.appCheckToken!==null&&(t["X-Firebase-AppCheck"]=s.appCheckToken),t}function fD(n,e,t,s){const r=n._url(e);return pD(n,r,t,s)}async function pD(n,e,t,s){t=na(t);const r={data:t},i=await _E(n,s),o=s.timeout||7e4,c=cD(o),l=await Promise.race([dD(e,r,i,n.fetchImpl,n),c.promise,n.cancelAllRequests]);if(c.cancel(),!l)throw new Ze("cancelled","Firebase Functions instance was deleted.");const u=sa(l.status,l.json);if(u)throw u;if(!l.json)throw new Ze("internal","Response is not valid JSON object.");let f=l.json.data;if(typeof f>"u"&&(f=l.json.result),typeof f>"u")throw new Ze("internal","Response is missing data field.");return{data:js(f)}}function mD(n,e,t,s){const r=n._url(e);return gD(n,r,t,s||{})}async function gD(n,e,t,s){var m;t=na(t);const r={data:t},i=await _E(n,s);i["Content-Type"]="application/json",i.Accept="text/event-stream";let o;try{o=await n.fetchImpl(e,{method:"POST",body:JSON.stringify(r),headers:i,signal:s==null?void 0:s.signal,credentials:gE(n)})}catch(T){if(T instanceof Error&&T.name==="AbortError"){const k=new Ze("cancelled","Request was cancelled.");return{data:Promise.reject(k),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(k)}}}}}}const S=sa(0,null);return{data:Promise.reject(S),stream:{[Symbol.asyncIterator](){return{next(){return Promise.reject(S)}}}}}}let c,l;const u=new Promise((T,S)=>{c=T,l=S});(m=s==null?void 0:s.signal)==null||m.addEventListener("abort",()=>{const T=new Ze("cancelled","Request was cancelled.");l(T)});const f=o.body.getReader(),p=_D(f,c,l,s==null?void 0:s.signal);return{stream:{[Symbol.asyncIterator](){const T=p.getReader();return{async next(){const{value:S,done:k}=await T.read();return{value:S,done:k}},async return(){return await T.cancel(),{done:!0,value:void 0}}}}},data:u}}function _D(n,e,t,s){const r=(o,c)=>{const l=o.match(aD);if(!l)return;const u=l[1];try{const f=JSON.parse(u);if("result"in f){e(js(f.result));return}if("message"in f){c.enqueue(js(f.message));return}if("error"in f){const p=sa(0,f);c.error(p),t(p);return}}catch(f){if(f instanceof Ze){c.error(f),t(f);return}}},i=new TextDecoder;return new ReadableStream({start(o){let c="";return l();async function l(){if(s!=null&&s.aborted){const u=new Ze("cancelled","Request was cancelled");return o.error(u),t(u),Promise.resolve()}try{const{value:u,done:f}=await n.read();if(f){c.trim()&&r(c.trim(),o),o.close();return}if(s!=null&&s.aborted){const m=new Ze("cancelled","Request was cancelled");o.error(m),t(m),await n.cancel();return}c+=i.decode(u,{stream:!0});const p=c.split(`
`);c=p.pop()||"";for(const m of p)m.trim()&&r(m.trim(),o);return l()}catch(u){const f=u instanceof Ze?u:sa(0,null);o.error(f),t(f)}}},cancel(){return n.cancel()}})}const Qp="@firebase/functions",Yp="0.13.4";/**
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
 */const yD="auth-internal",ED="app-check-internal",TD="messaging-internal";function wD(n){const e=(t,{instanceIdentifier:s})=>{const r=t.getProvider("app").getImmediate(),i=t.getProvider(yD),o=t.getProvider(TD),c=t.getProvider(ED);return new lD(r,i,o,c,s)};ct(new tt(vh,e,"PUBLIC").setMultipleInstances(!0)),Ve(Qp,Yp,n),Ve(Qp,Yp,"esm2020")}/**
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
 */function TO(n=zs(),e=Il){const s=Jt(W(n),vh).getImmediate({identifier:e}),r=oa("functions");return r&&ID(s,...r),s}function ID(n,e,t){uD(W(n),e,t)}function wO(n,e,t){return hD(W(n),e)}wD();export{ZD as $,gO as A,qD as B,cO as C,DD as D,TO as E,zs as F,cn as G,wO as H,SD as I,CI as J,Mm as K,kD as L,XD as M,JD as N,iO as O,oO as P,sO as Q,QD as R,YD as S,Pv as T,WD as U,GD as V,dO as W,lO as X,uO as Y,hO as Z,le as _,yO as a,AD as a0,CD as a1,ND as a2,OD as b,fO as c,VD as d,tO as e,mb as f,$D as g,BD as h,lw as i,nO as j,RD as k,eO as l,jD as m,MD as n,bD as o,HD as p,zD as q,aO as r,PD as s,xD as t,rO as u,pO as v,KD as w,_O as x,mO as y,EO as z};
