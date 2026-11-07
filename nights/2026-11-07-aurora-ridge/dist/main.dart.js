(function dartProgram(){function copyProperties(a,b){var t=Object.keys(a)
for(var s=0;s<t.length;s++){var r=t[s]
b[r]=a[r]}}function mixinPropertiesHard(a,b){var t=Object.keys(a)
for(var s=0;s<t.length;s++){var r=t[s]
if(!b.hasOwnProperty(r)){b[r]=a[r]}}}function mixinPropertiesEasy(a,b){Object.assign(b,a)}var z=function(){var t=function(){}
t.prototype={p:{}}
var s=new t()
if(!(Object.getPrototypeOf(s)&&Object.getPrototypeOf(s).p===t.prototype.p))return false
try{if(typeof navigator!="undefined"&&typeof navigator.userAgent=="string"&&navigator.userAgent.indexOf("Chrome/")>=0)return true
if(typeof version=="function"&&version.length==0){var r=version()
if(/^\d+\.\d+\.\d+\.\d+$/.test(r))return true}}catch(q){}return false}()
function inherit(a,b){a.prototype.constructor=a
a.prototype["$i"+a.name]=a
if(b!=null){if(z){Object.setPrototypeOf(a.prototype,b.prototype)
return}var t=Object.create(b.prototype)
copyProperties(a.prototype,t)
a.prototype=t}}function inheritMany(a,b){for(var t=0;t<b.length;t++){inherit(b[t],a)}}function mixinEasy(a,b){mixinPropertiesEasy(b.prototype,a.prototype)
a.prototype.constructor=a}function mixinHard(a,b){mixinPropertiesHard(b.prototype,a.prototype)
a.prototype.constructor=a}function lazy(a,b,c,d){var t=a
a[b]=t
a[c]=function(){if(a[b]===t){a[b]=d()}a[c]=function(){return this[b]}
return a[b]}}function lazyFinal(a,b,c,d){var t=a
a[b]=t
a[c]=function(){if(a[b]===t){var s=d()
if(a[b]!==t){A.eh(b)}a[b]=s}var r=a[b]
a[c]=function(){return r}
return r}}function makeConstList(a,b){if(b!=null)A.x(a,b)
a.$flags=7
return a}function convertToFastObject(a){function t(){}t.prototype=a
new t()
return a}function convertAllToFastObject(a){for(var t=0;t<a.length;++t){convertToFastObject(a[t])}}var y=0
function instanceTearOffGetter(a,b){var t=null
return a?function(c){if(t===null)t=A.bK(b)
return new t(c,this)}:function(){if(t===null)t=A.bK(b)
return new t(this,null)}}function staticTearOffGetter(a){var t=null
return function(){if(t===null)t=A.bK(a).prototype
return t}}var x=0
function tearOffParameters(a,b,c,d,e,f,g,h,i,j){if(typeof h=="number"){h+=x}return{co:a,iS:b,iI:c,rC:d,dV:e,cs:f,fs:g,fT:h,aI:i||0,nDA:j}}function installStaticTearOff(a,b,c,d,e,f,g,h){var t=tearOffParameters(a,true,false,c,d,e,f,g,h,false)
var s=staticTearOffGetter(t)
a[b]=s}function installInstanceTearOff(a,b,c,d,e,f,g,h,i,j){c=!!c
var t=tearOffParameters(a,false,c,d,e,f,g,h,i,!!j)
var s=instanceTearOffGetter(c,t)
a[b]=s}function setOrUpdateInterceptorsByTag(a){var t=v.interceptorsByTag
if(!t){v.interceptorsByTag=a
return}copyProperties(a,t)}function setOrUpdateLeafTags(a){var t=v.leafTags
if(!t){v.leafTags=a
return}copyProperties(a,t)}function updateTypes(a){var t=v.types
var s=t.length
t.push.apply(t,a)
return s}function updateHolder(a,b){copyProperties(b,a)
return a}var hunkHelpers=function(){var t=function(a,b,c,d,e){return function(f,g,h,i){return installInstanceTearOff(f,g,a,b,c,d,[h],i,e,false)}},s=function(a,b,c,d){return function(e,f,g,h){return installStaticTearOff(e,f,a,b,c,[g],h,d)}}
return{inherit:inherit,inheritMany:inheritMany,mixin:mixinEasy,mixinHard:mixinHard,installStaticTearOff:installStaticTearOff,installInstanceTearOff:installInstanceTearOff,_instance_0u:t(0,0,null,["$0"],0),_instance_1u:t(0,1,null,["$1"],0),_instance_2u:t(0,2,null,["$2"],0),_instance_0i:t(1,0,null,["$0"],0),_instance_1i:t(1,1,null,["$1"],0),_instance_2i:t(1,2,null,["$2"],0),_static_0:s(0,null,["$0"],0),_static_1:s(1,null,["$1"],0),_static_2:s(2,null,["$2"],0),makeConstList:makeConstList,lazy:lazy,lazyFinal:lazyFinal,updateHolder:updateHolder,convertToFastObject:convertToFastObject,updateTypes:updateTypes,setOrUpdateInterceptorsByTag:setOrUpdateInterceptorsByTag,setOrUpdateLeafTags:setOrUpdateLeafTags}}()
function initializeDeferredHunk(a){x=v.types.length
a(hunkHelpers,v,w,$)}var J={
bP(a,b,c,d){return{i:a,p:b,e:c,x:d}},
bM(a){var t,s,r,q,p,o="_$dart_js",n=a[v.dispatchPropertyName]
if(n==null)if($.bN==null){A.ea()
n=a[v.dispatchPropertyName]}if(n!=null){t=n.p
if(!1===t)return n.i
if(!0===t)return a
s=Object.getPrototypeOf(a)
if(t===s)return n.i
if(n.e===s)throw A.d(A.c4("Return interceptor for "+A.o(t(a,n))))}r=a.constructor
if(r==null)q=null
else{p=$.bf
if(p==null)p=$.bf=A.bo(o)
q=r[p]}if(q!=null)return q
q=A.ee(a)
if(q!=null)return q
if(typeof a=="function")return B.q
t=Object.getPrototypeOf(a)
if(t==null)return B.i
if(t===Object.prototype)return B.i
if(typeof r=="function"){p=$.bf
if(p==null)p=$.bf=A.bo(o)
Object.defineProperty(r,p,{value:B.e,enumerable:false,writable:true,configurable:true})
return B.e}return B.e},
cZ(a,b){if(a<0||a>4294967295)throw A.d(A.ae(a,0,4294967295,"length",null))
return J.d0(new Array(a),b)},
d_(a,b){if(a<0)throw A.d(A.bC("Length must be a non-negative integer: "+a))
return A.x(new Array(a),b.t("l<0>"))},
d0(a,b){var t=A.x(a,b.t("l<0>"))
t.$flags=1
return t},
c0(a){if(a<256)switch(a){case 9:case 10:case 11:case 12:case 13:case 32:case 133:case 160:return!0
default:return!1}switch(a){case 5760:case 8192:case 8193:case 8194:case 8195:case 8196:case 8197:case 8198:case 8199:case 8200:case 8201:case 8202:case 8232:case 8233:case 8239:case 8287:case 12288:case 65279:return!0
default:return!1}},
d1(a,b){var t,s
for(t=a.length;b<t;){s=a.charCodeAt(b)
if(s!==32&&s!==13&&!J.c0(s))break;++b}return b},
d2(a,b){var t,s,r
for(t=a.length;b>0;b=s){s=b-1
if(!(s<t))return A.k(a,s)
r=a.charCodeAt(s)
if(r!==32&&r!==13&&!J.c0(r))break}return b},
aq(a){if(typeof a=="number"){if(Math.floor(a)==a)return J.a3.prototype
return J.aC.prototype}if(typeof a=="string")return J.U.prototype
if(a==null)return J.a4.prototype
if(typeof a=="boolean")return J.aB.prototype
if(Array.isArray(a))return J.l.prototype
if(typeof a!="object"){if(typeof a=="function")return J.E.prototype
if(typeof a=="symbol")return J.a8.prototype
if(typeof a=="bigint")return J.a6.prototype
return a}if(a instanceof A.q)return a
return J.bM(a)},
cx(a){if(typeof a=="string")return J.U.prototype
if(a==null)return a
if(Array.isArray(a))return J.l.prototype
if(typeof a!="object"){if(typeof a=="function")return J.E.prototype
if(typeof a=="symbol")return J.a8.prototype
if(typeof a=="bigint")return J.a6.prototype
return a}if(a instanceof A.q)return a
return J.bM(a)},
cy(a){if(a==null)return a
if(Array.isArray(a))return J.l.prototype
if(typeof a!="object"){if(typeof a=="function")return J.E.prototype
if(typeof a=="symbol")return J.a8.prototype
if(typeof a=="bigint")return J.a6.prototype
return a}if(a instanceof A.q)return a
return J.bM(a)},
cJ(a,b){return J.cy(a).B(a,b)},
cK(a){return J.cy(a).gC(a)},
bR(a){return J.cx(a).gk(a)},
cL(a){return J.aq(a).gi(a)},
au(a){return J.aq(a).h(a)},
az:function az(){},
aB:function aB(){},
a4:function a4(){},
a7:function a7(){},
F:function F(){},
aP:function aP(){},
ag:function ag(){},
E:function E(){},
a6:function a6(){},
a8:function a8(){},
l:function l(a){this.$ti=a},
aA:function aA(){},
b5:function b5(a){this.$ti=a},
av:function av(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
a5:function a5(){},
a3:function a3(){},
aC:function aC(){},
U:function U(){}},A={bD:function bD(){},
d4(a){return new A.aE("Field '"+a+"' has not been initialized.")},
cB(a){var t,s
for(t=$.B.length,s=0;s<t;++s)if(a===$.B[s])return!0
return!1},
aE:function aE(a){this.a=a},
a2:function a2(){},
I:function I(){},
V:function V(a,b,c){var _=this
_.a=a
_.b=b
_.c=0
_.d=null
_.$ti=c},
a9:function a9(a,b,c){this.a=a
this.b=b
this.$ti=c},
r:function r(){},
cG(a){var t=A.cF(a)
if(t!=null)return t
return"minified:"+a},
es(a,b){var t
if(b!=null){t=b.x
if(t!=null)return t}return u.p.b(a)},
o(a){var t
if(typeof a=="string")return a
if(typeof a=="number"){if(a!==0)return""+a}else if(!0===a)return"true"
else if(!1===a)return"false"
else if(a==null)return"null"
t=J.au(a)
return t},
c1(a,b){var t,s,r,q,p,o=null,n=/^\s*[+-]?((0x[a-f0-9]+)|(\d+)|([a-z0-9]+))\s*$/i.exec(a)
if(n==null)return o
if(3>=n.length)return A.k(n,3)
t=n[3]
if(b==null){if(t!=null)return parseInt(a,10)
if(n[2]!=null)return parseInt(a,16)
return o}if(b<2||b>36)throw A.d(A.ae(b,2,36,"radix",o))
if(b===10&&t!=null)return parseInt(a,10)
if(b<10||t==null){s=b<=10?47+b:86+b
r=n[1]
for(q=r.length,p=0;p<q;++p)if((r.charCodeAt(p)|32)>s)return o}return parseInt(a,b)},
aQ(a){var t,s,r,q
if(a instanceof A.q)return A.u(A.ar(a),null)
t=J.aq(a)
if(t===B.p||t===B.r||u.o.b(a)){s=B.h(a)
if(s!=="Object"&&s!=="")return s
r=a.constructor
if(typeof r=="function"){q=r.name
if(typeof q=="string"&&q!=="Object"&&q!=="")return q}}return A.u(A.ar(a),null)},
d7(a){var t,s,r
if(typeof a=="number"||A.bJ(a))return J.au(a)
if(typeof a=="string")return JSON.stringify(a)
if(a instanceof A.D)return a.h(0)
t=$.cI()
for(s=0;s<1;++s){r=t[s].ae(a)
if(r!=null)return r}return"Instance of '"+A.aQ(a)+"'"},
cA(a){throw A.d(A.cu(a))},
k(a,b){if(a==null)J.bR(a)
throw A.d(A.cw(a,b))},
cw(a,b){var t,s="index"
if(!A.cp(b))return new A.S(!0,b,s,null)
t=J.bR(a)
if(b<0||b>=t)return A.bZ(b,t,a,s)
return A.d8(b,s)},
cu(a){return new A.S(!0,a,null,null)},
d(a){return A.p(a,new Error())},
p(a,b){var t
if(a==null)a=new A.bc()
b.dartException=a
t=A.ej
if("defineProperty" in Object){Object.defineProperty(b,"message",{get:t})
b.name=""}else b.toString=t
return b},
ej(){return J.au(this.dartException)},
cE(a,b){throw A.p(a,b==null?new Error():b)},
as(a,b,c){var t
if(b==null)b=0
if(c==null)c=0
t=Error()
A.cE(A.dG(a,b,c),t)},
dG(a,b,c){var t,s,r,q,p,o,n,m,l
if(typeof b=="string")t=b
else{s="[]=;add;removeWhere;retainWhere;removeRange;setRange;setInt8;setInt16;setInt32;setUint8;setUint16;setUint32;setFloat32;setFloat64".split(";")
r=s.length
q=b
if(q>r){c=q/r|0
q%=r}t=s[q]}p=typeof c=="string"?c:"modify;remove from;add to".split(";")[c]
o=u._.b(a)?"list":"ByteData"
n=a.$flags|0
m="a "
if((n&4)!==0)l="constant "
else if((n&2)!==0){l="unmodifiable "
m="an "}else l=(n&1)!==0?"fixed-length ":""
return new A.aW("'"+t+"': Cannot "+p+" "+m+l+o)},
bA(a){throw A.d(A.ay(a))},
cS(a1){var t,s,r,q,p,o,n,m,l,k,j=a1.co,i=a1.iS,h=a1.iI,g=a1.nDA,f=a1.aI,e=a1.fs,d=a1.cs,c=e[0],b=d[0],a=j[c],a0=a1.fT
a0.toString
t=i?Object.create(new A.aU().constructor.prototype):Object.create(new A.a1(null,null).constructor.prototype)
t.$initialize=t.constructor
s=i?function static_tear_off(){this.$initialize()}:function tear_off(a2,a3){this.$initialize(a2,a3)}
t.constructor=s
s.prototype=t
t.$_name=c
t.$_target=a
r=!i
if(r)q=A.bW(c,a,h,g)
else{t.$static_name=c
q=a}t.$S=A.cO(a0,i,h)
t[b]=q
for(p=q,o=1;o<e.length;++o){n=e[o]
if(typeof n=="string"){m=j[n]
l=n
n=m}else l=""
k=d[o]
if(k!=null){if(r)n=A.bW(l,n,h,g)
t[k]=n}if(o===f)p=n}t.$C=p
t.$R=a1.rC
t.$D=a1.dV
return s},
cO(a,b,c){if(typeof a=="number")return a
if(typeof a=="string"){if(b)throw A.d("Cannot compute signature for static tearoff.")
return function(d,e){return function(){return e(this,d)}}(a,A.cM)}throw A.d("Error in functionType of tearoff")},
cP(a,b,c,d){var t=A.bV
switch(b?-1:a){case 0:return function(e,f){return function(){return f(this)[e]()}}(c,t)
case 1:return function(e,f){return function(g){return f(this)[e](g)}}(c,t)
case 2:return function(e,f){return function(g,h){return f(this)[e](g,h)}}(c,t)
case 3:return function(e,f){return function(g,h,i){return f(this)[e](g,h,i)}}(c,t)
case 4:return function(e,f){return function(g,h,i,j){return f(this)[e](g,h,i,j)}}(c,t)
case 5:return function(e,f){return function(g,h,i,j,k){return f(this)[e](g,h,i,j,k)}}(c,t)
default:return function(e,f){return function(){return e.apply(f(this),arguments)}}(d,t)}},
bW(a,b,c,d){if(c)return A.cR(a,b,d)
return A.cP(b.length,d,a,b)},
cQ(a,b,c,d){var t=A.bV,s=A.cN
switch(b?-1:a){case 0:throw A.d(new A.b8("Intercepted function with no arguments."))
case 1:return function(e,f,g){return function(){return f(this)[e](g(this))}}(c,s,t)
case 2:return function(e,f,g){return function(h){return f(this)[e](g(this),h)}}(c,s,t)
case 3:return function(e,f,g){return function(h,i){return f(this)[e](g(this),h,i)}}(c,s,t)
case 4:return function(e,f,g){return function(h,i,j){return f(this)[e](g(this),h,i,j)}}(c,s,t)
case 5:return function(e,f,g){return function(h,i,j,k){return f(this)[e](g(this),h,i,j,k)}}(c,s,t)
case 6:return function(e,f,g){return function(h,i,j,k,l){return f(this)[e](g(this),h,i,j,k,l)}}(c,s,t)
default:return function(e,f,g){return function(){var r=[g(this)]
Array.prototype.push.apply(r,arguments)
return e.apply(f(this),r)}}(d,s,t)}},
cR(a,b,c){var t,s
if($.bT==null)$.bT=A.bS("interceptor")
if($.bU==null)$.bU=A.bS("receiver")
t=b.length
s=A.cQ(t,c,a,b)
return s},
bK(a){return A.cS(a)},
cM(a,b){return A.bk(v.typeUniverse,A.ar(a.a),b)},
bV(a){return a.a},
cN(a){return a.b},
bS(a){var t,s,r,q=new A.a1("receiver","interceptor"),p=Object.getOwnPropertyNames(q)
p.$flags=1
t=p
for(p=t.length,s=0;s<p;++s){r=t[s]
if(q[r]===a)return r}throw A.d(A.bC("Field name "+a+" not found."))},
bo(a){return v.getIsolateTag(a)},
ee(a){var t,s,r,q,p,o=A.Y($.cz.$1(a)),n=$.bn[o]
if(n!=null){Object.defineProperty(a,v.dispatchPropertyName,{value:n,enumerable:false,writable:true,configurable:true})
return n.i}t=$.bs[o]
if(t!=null)return t
s=v.interceptorsByTag[o]
if(s==null){r=A.cl($.ct.$2(a,o))
if(r!=null){n=$.bn[r]
if(n!=null){Object.defineProperty(a,v.dispatchPropertyName,{value:n,enumerable:false,writable:true,configurable:true})
return n.i}t=$.bs[r]
if(t!=null)return t
s=v.interceptorsByTag[r]
o=r}}if(s==null)return null
t=s.prototype
q=o[0]
if(q==="!"){n=A.by(t)
$.bn[o]=n
Object.defineProperty(a,v.dispatchPropertyName,{value:n,enumerable:false,writable:true,configurable:true})
return n.i}if(q==="~"){$.bs[o]=t
return t}if(q==="-"){p=A.by(t)
Object.defineProperty(Object.getPrototypeOf(a),v.dispatchPropertyName,{value:p,enumerable:false,writable:true,configurable:true})
return p.i}if(q==="+")return A.cC(a,t)
if(q==="*")throw A.d(A.c4(o))
if(v.leafTags[o]===true){p=A.by(t)
Object.defineProperty(Object.getPrototypeOf(a),v.dispatchPropertyName,{value:p,enumerable:false,writable:true,configurable:true})
return p.i}else return A.cC(a,t)},
cC(a,b){var t=Object.getPrototypeOf(a)
Object.defineProperty(t,v.dispatchPropertyName,{value:J.bP(b,t,null,null),enumerable:false,writable:true,configurable:true})
return b},
by(a){return J.bP(a,!1,null,!!a.$it)},
eg(a,b,c){var t=b.prototype
if(v.leafTags[a]===true)return A.by(t)
else return J.bP(t,c,null,null)},
ea(){if(!0===$.bN)return
$.bN=!0
A.eb()},
eb(){var t,s,r,q,p,o,n,m
$.bn=Object.create(null)
$.bs=Object.create(null)
A.e9()
t=v.interceptorsByTag
s=Object.getOwnPropertyNames(t)
if(typeof window!="undefined"){window
r=function(){}
for(q=0;q<s.length;++q){p=s[q]
o=$.cD.$1(p)
if(o!=null){n=A.eg(p,t[p],o)
if(n!=null){Object.defineProperty(o,v.dispatchPropertyName,{value:n,enumerable:false,writable:true,configurable:true})
r.prototype=o}}}}for(q=0;q<s.length;++q){p=s[q]
if(/^[A-Za-z_]/.test(p)){m=t[p]
t["!"+p]=m
t["~"+p]=m
t["-"+p]=m
t["+"+p]=m
t["*"+p]=m}}},
e9(){var t,s,r,q,p,o,n=B.j()
n=A.a_(B.k,A.a_(B.l,A.a_(B.f,A.a_(B.f,A.a_(B.m,A.a_(B.n,A.a_(B.o(B.h),n)))))))
if(typeof dartNativeDispatchHooksTransformer!="undefined"){t=dartNativeDispatchHooksTransformer
if(typeof t=="function")t=[t]
if(Array.isArray(t))for(s=0;s<t.length;++s){r=t[s]
if(typeof r=="function")n=r(n)||n}}q=n.getTag
p=n.getUnknownTag
o=n.prototypeForTag
$.cz=new A.bp(q)
$.ct=new A.bq(p)
$.cD=new A.br(o)},
a_(a,b){return a(b)||b},
e6(a,b){var t=b.length,s=v.rttc[""+t+";"+a]
if(s==null)return null
if(t===0)return s
if(t===s.length)return s.apply(null,b)
return s(b)},
d3(a,b,c,d,e,f){var t=b?"m":"",s=c?"":"i",r=d?"u":"",q=e?"s":"",p=function(g,h){try{return new RegExp(g,h)}catch(o){return o}}(a,t+s+r+q+f)
if(p instanceof RegExp)return p
throw A.d(A.bX("Illegal RegExp pattern ("+String(p)+")",a))},
af:function af(){},
D:function D(){},
ax:function ax(){},
aV:function aV(){},
aU:function aU(){},
a1:function a1(a,b){this.a=a
this.b=b},
b8:function b8(a){this.a=a},
bp:function bp(a){this.a=a},
bq:function bq(a){this.a=a},
br:function br(a){this.a=a},
aD:function aD(a,b){var _=this
_.a=a
_.b=b
_.e=_.d=_.c=null},
bg:function bg(a){this.b=a},
W:function W(){},
ac:function ac(){},
aF:function aF(){},
X:function X(){},
aa:function aa(){},
ab:function ab(){},
aG:function aG(){},
aH:function aH(){},
aI:function aI(){},
aJ:function aJ(){},
aK:function aK(){},
aL:function aL(){},
aM:function aM(){},
ad:function ad(){},
aN:function aN(){},
ah:function ah(){},
ai:function ai(){},
aj:function aj(){},
ak:function ak(){},
bE(a,b){var t=b.c
return t==null?b.c=A.am(a,"bY",[b.x]):t},
c2(a){var t=a.w
if(t===6||t===7)return A.c2(a.x)
return t===11||t===12},
dd(a){return a.as},
bL(a){return A.bj(v.typeUniverse,a,!1)},
N(a0,a1,a2,a3){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a=a1.w
switch(a){case 5:case 1:case 2:case 3:case 4:return a1
case 6:t=a1.x
s=A.N(a0,t,a2,a3)
if(s===t)return a1
return A.cc(a0,s,!0)
case 7:t=a1.x
s=A.N(a0,t,a2,a3)
if(s===t)return a1
return A.cb(a0,s,!0)
case 8:r=a1.y
q=A.Z(a0,r,a2,a3)
if(q===r)return a1
return A.am(a0,a1.x,q)
case 9:p=a1.x
o=A.N(a0,p,a2,a3)
n=a1.y
m=A.Z(a0,n,a2,a3)
if(o===p&&m===n)return a1
return A.bF(a0,o,m)
case 10:l=a1.x
k=a1.y
j=A.Z(a0,k,a2,a3)
if(j===k)return a1
return A.cd(a0,l,j)
case 11:i=a1.x
h=A.N(a0,i,a2,a3)
g=a1.y
f=A.e2(a0,g,a2,a3)
if(h===i&&f===g)return a1
return A.ca(a0,h,f)
case 12:e=a1.y
a3+=e.length
d=A.Z(a0,e,a2,a3)
p=a1.x
o=A.N(a0,p,a2,a3)
if(d===e&&o===p)return a1
return A.bG(a0,o,d,!0)
case 13:c=a1.x
if(c<a3)return a1
b=a2[c-a3]
if(b==null)return a1
return b
default:throw A.d(A.aw("Attempted to substitute unexpected RTI kind "+a))}},
Z(a,b,c,d){var t,s,r,q,p=b.length,o=A.bl(p)
for(t=!1,s=0;s<p;++s){r=b[s]
q=A.N(a,r,c,d)
if(q!==r)t=!0
o[s]=q}return t?o:b},
e3(a,b,c,d){var t,s,r,q,p,o,n=b.length,m=A.bl(n)
for(t=!1,s=0;s<n;s+=3){r=b[s]
q=b[s+1]
p=b[s+2]
o=A.N(a,p,c,d)
if(o!==p)t=!0
m.splice(s,3,r,q,o)}return t?m:b},
e2(a,b,c,d){var t,s=b.a,r=A.Z(a,s,c,d),q=b.b,p=A.Z(a,q,c,d),o=b.c,n=A.e3(a,o,c,d)
if(r===s&&p===q&&n===o)return b
t=new A.aX()
t.a=r
t.b=p
t.c=n
return t},
x(a,b){a[v.arrayRti]=b
return a},
cv(a){var t=a.$S
if(t!=null){if(typeof t=="number")return A.e8(t)
return a.$S()}return null},
ec(a,b){var t
if(A.c2(b))if(a instanceof A.D){t=A.cv(a)
if(t!=null)return t}return A.ar(a)},
ar(a){if(a instanceof A.q)return A.bH(a)
if(Array.isArray(a))return A.H(a)
return A.bI(J.aq(a))},
H(a){var t=a[v.arrayRti],s=u.b
if(t==null)return s
if(t.constructor!==s.constructor)return s
return t},
bH(a){var t=a.$ti
return t!=null?t:A.bI(a)},
bI(a){var t=a.constructor,s=t.$ccache
if(s!=null)return s
return A.dN(a,t)},
dN(a,b){var t=a instanceof A.D?Object.getPrototypeOf(Object.getPrototypeOf(a)).constructor:b,s=A.dz(v.typeUniverse,t.name)
b.$ccache=s
return s},
e8(a){var t,s=v.types,r=s[a]
if(typeof r=="string"){t=A.bj(v.typeUniverse,r,!1)
s[a]=t
return t}return r},
e7(a){return A.P(A.bH(a))},
e1(a){var t=a instanceof A.D?A.cv(a):null
if(t!=null)return t
if(u.R.b(a))return J.cL(a).a
if(Array.isArray(a))return A.H(a)
return A.ar(a)},
P(a){var t=a.r
return t==null?a.r=new A.bi(a):t},
A(a){return A.P(A.bj(v.typeUniverse,a,!1))},
dM(a){var t=this
t.b=A.e0(t)
return t.b(a)},
e0(a){var t,s,r,q,p
if(a===u.K)return A.dT
if(A.Q(a))return A.dX
t=a.w
if(t===6)return A.dK
if(t===1)return A.cr
if(t===7)return A.dO
s=A.e_(a)
if(s!=null)return s
if(t===8){r=a.x
if(a.y.every(A.Q)){a.f="$i"+r
if(r==="f")return A.dR
if(a===u.m)return A.dQ
return A.dW}}else if(t===10){q=A.e6(a.x,a.y)
p=q==null?A.cr:q
return p==null?A.ck(p):p}return A.dI},
e_(a){if(a.w===8){if(a===u.S)return A.cp
if(a===u.i||a===u.H)return A.dS
if(a===u.N)return A.dV
if(a===u.y)return A.bJ}return null},
dL(a){var t=this,s=A.dH
if(A.Q(t))s=A.dE
else if(t===u.K)s=A.ck
else if(A.a0(t)){s=A.dJ
if(t===u.w)s=A.dD
else if(t===u.v)s=A.cl
else if(t===u.u)s=A.dB
else if(t===u.A)s=A.cj
else if(t===u.I)s=A.dC
else if(t===u.z)s=A.z}else if(t===u.S)s=A.M
else if(t===u.N)s=A.Y
else if(t===u.y)s=A.ch
else if(t===u.H)s=A.ci
else if(t===u.i)s=A.ao
else if(t===u.m)s=A.b
t.a=s
return t.a(a)},
dI(a){var t=this
if(a==null)return A.a0(t)
return A.ed(v.typeUniverse,A.ec(a,t),t)},
dK(a){if(a==null)return!0
return this.x.b(a)},
dW(a){var t,s=this
if(a==null)return A.a0(s)
t=s.f
if(a instanceof A.q)return!!a[t]
return!!J.aq(a)[t]},
dR(a){var t,s=this
if(a==null)return A.a0(s)
if(typeof a!="object")return!1
if(Array.isArray(a))return!0
t=s.f
if(a instanceof A.q)return!!a[t]
return!!J.aq(a)[t]},
dQ(a){var t=this
if(a==null)return!1
if(typeof a=="object"){if(a instanceof A.q)return!!a[t.f]
return!0}if(typeof a=="function")return!0
return!1},
cq(a){if(typeof a=="object"){if(a instanceof A.q)return u.m.b(a)
return!0}if(typeof a=="function")return!0
return!1},
dH(a){var t=this
if(a==null){if(A.a0(t))return a}else if(t.b(a))return a
throw A.p(A.cm(a,t),new Error())},
dJ(a){var t=this
if(a==null||t.b(a))return a
throw A.p(A.cm(a,t),new Error())},
cm(a,b){return new A.aY("TypeError: "+A.c6(a,A.u(b,null)))},
c6(a,b){return A.b2(a)+": type '"+A.u(A.e1(a),null)+"' is not a subtype of type '"+b+"'"},
w(a,b){return new A.aY("TypeError: "+A.c6(a,b))},
dO(a){var t=this
return t.x.b(a)||A.bE(v.typeUniverse,t).b(a)},
dT(a){return a!=null},
ck(a){if(a!=null)return a
throw A.p(A.w(a,"Object"),new Error())},
dX(a){return!0},
dE(a){return a},
cr(a){return!1},
bJ(a){return!0===a||!1===a},
ch(a){if(!0===a)return!0
if(!1===a)return!1
throw A.p(A.w(a,"bool"),new Error())},
dB(a){if(!0===a)return!0
if(!1===a)return!1
if(a==null)return a
throw A.p(A.w(a,"bool?"),new Error())},
ao(a){if(typeof a=="number")return a
throw A.p(A.w(a,"double"),new Error())},
dC(a){if(typeof a=="number")return a
if(a==null)return a
throw A.p(A.w(a,"double?"),new Error())},
cp(a){return typeof a=="number"&&Math.floor(a)===a},
M(a){if(typeof a=="number"&&Math.floor(a)===a)return a
throw A.p(A.w(a,"int"),new Error())},
dD(a){if(typeof a=="number"&&Math.floor(a)===a)return a
if(a==null)return a
throw A.p(A.w(a,"int?"),new Error())},
dS(a){return typeof a=="number"},
ci(a){if(typeof a=="number")return a
throw A.p(A.w(a,"num"),new Error())},
cj(a){if(typeof a=="number")return a
if(a==null)return a
throw A.p(A.w(a,"num?"),new Error())},
dV(a){return typeof a=="string"},
Y(a){if(typeof a=="string")return a
throw A.p(A.w(a,"String"),new Error())},
cl(a){if(typeof a=="string")return a
if(a==null)return a
throw A.p(A.w(a,"String?"),new Error())},
b(a){if(A.cq(a))return a
throw A.p(A.w(a,"JSObject"),new Error())},
z(a){if(a==null)return a
if(A.cq(a))return a
throw A.p(A.w(a,"JSObject?"),new Error())},
cs(a,b){var t,s,r
for(t="",s="",r=0;r<a.length;++r,s=", ")t+=s+A.u(a[r],b)
return t},
dZ(a,b){var t,s,r,q,p,o,n=a.x,m=a.y
if(""===n)return"("+A.cs(m,b)+")"
t=m.length
s=n.split(",")
r=s.length-t
for(q="(",p="",o=0;o<t;++o,p=", "){q+=p
if(r===0)q+="{"
q+=A.u(m[o],b)
if(r>=0)q+=" "+s[r];++r}return q+"})"},
cn(a2,a3,a4){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0=", ",a1=null
if(a4!=null){t=a4.length
if(a3==null)a3=A.x([],u.s)
else a1=a3.length
s=a3.length
for(r=t;r>0;--r)B.c.m(a3,"T"+(s+r))
for(q=u.X,p="<",o="",r=0;r<t;++r,o=a0){n=a3.length
m=n-1-r
if(!(m>=0))return A.k(a3,m)
p=p+o+a3[m]
l=a4[r]
k=l.w
if(!(k===2||k===3||k===4||k===5||l===q))p+=" extends "+A.u(l,a3)}p+=">"}else p=""
q=a2.x
j=a2.y
i=j.a
h=i.length
g=j.b
f=g.length
e=j.c
d=e.length
c=A.u(q,a3)
for(b="",a="",r=0;r<h;++r,a=a0)b+=a+A.u(i[r],a3)
if(f>0){b+=a+"["
for(a="",r=0;r<f;++r,a=a0)b+=a+A.u(g[r],a3)
b+="]"}if(d>0){b+=a+"{"
for(a="",r=0;r<d;r+=3,a=a0){b+=a
if(e[r+1])b+="required "
b+=A.u(e[r+2],a3)+" "+e[r]}b+="}"}if(a1!=null){a3.toString
a3.length=a1}return p+"("+b+") => "+c},
u(a,b){var t,s,r,q,p,o,n,m=a.w
if(m===5)return"erased"
if(m===2)return"dynamic"
if(m===3)return"void"
if(m===1)return"Never"
if(m===4)return"any"
if(m===6){t=a.x
s=A.u(t,b)
r=t.w
return(r===11||r===12?"("+s+")":s)+"?"}if(m===7)return"FutureOr<"+A.u(a.x,b)+">"
if(m===8){q=A.e4(a.x)
p=a.y
return p.length>0?q+("<"+A.cs(p,b)+">"):q}if(m===10)return A.dZ(a,b)
if(m===11)return A.cn(a,b,null)
if(m===12)return A.cn(a.x,b,a.y)
if(m===13){o=a.x
n=b.length
o=n-1-o
if(!(o>=0&&o<n))return A.k(b,o)
return b[o]}return"?"},
e4(a){var t=A.cF(a)
if(t!=null)return t
return"minified:"+a},
dA(a,b){var t=a.tR[b]
while(typeof t=="string")t=a.tR[t]
return t},
dz(a,b){var t,s,r,q,p,o=a.eT,n=o[b]
if(n==null)return A.bj(a,b,!1)
else if(typeof n=="number"){t=n
s=A.an(a,5,"#")
r=A.bl(t)
for(q=0;q<t;++q)r[q]=s
p=A.am(a,b,r)
o[b]=p
return p}else return n},
dx(a,b){return A.cf(a.tR,b)},
dw(a,b){return A.cf(a.eT,b)},
bj(a,b,c){var t,s=a.eC,r=s.get(b)
if(r!=null)return r
t=A.ce(a,null,b,!1)
s.set(b,t)
return t},
bk(a,b,c){var t,s,r=b.z
if(r==null)r=b.z=new Map()
t=r.get(c)
if(t!=null)return t
s=A.ce(a,b,c,!0)
r.set(c,s)
return s},
dy(a,b,c){var t,s,r,q=b.Q
if(q==null)q=b.Q=new Map()
t=c.as
s=q.get(t)
if(s!=null)return s
r=A.bF(a,b,c.w===9?c.y:[c])
q.set(t,r)
return r},
ce(a,b,c,d){return A.dp(A.di(a,b,c,d))},
G(a,b){b.a=A.dL
b.b=A.dM
return b},
an(a,b,c){var t,s,r=a.eC.get(c)
if(r!=null)return r
t=new A.y(null,null)
t.w=b
t.as=c
s=A.G(a,t)
a.eC.set(c,s)
return s},
cc(a,b,c){var t,s=b.as+"?",r=a.eC.get(s)
if(r!=null)return r
t=A.du(a,b,s,c)
a.eC.set(s,t)
return t},
du(a,b,c,d){var t,s,r
if(d){t=b.w
s=!0
if(!A.Q(b))if(!(b===u.P||b===u.T))if(t!==6)s=t===7&&A.a0(b.x)
if(s)return b
else if(t===1)return u.P}r=new A.y(null,null)
r.w=6
r.x=b
r.as=c
return A.G(a,r)},
cb(a,b,c){var t,s=b.as+"/",r=a.eC.get(s)
if(r!=null)return r
t=A.ds(a,b,s,c)
a.eC.set(s,t)
return t},
ds(a,b,c,d){var t,s
if(d){t=b.w
if(A.Q(b)||b===u.K)return b
else if(t===1)return A.am(a,"bY",[b])
else if(b===u.P||b===u.T)return u.O}s=new A.y(null,null)
s.w=7
s.x=b
s.as=c
return A.G(a,s)},
dv(a,b){var t,s,r=""+b+"^",q=a.eC.get(r)
if(q!=null)return q
t=new A.y(null,null)
t.w=13
t.x=b
t.as=r
s=A.G(a,t)
a.eC.set(r,s)
return s},
al(a){var t,s,r,q=a.length
for(t="",s="",r=0;r<q;++r,s=",")t+=s+a[r].as
return t},
dr(a){var t,s,r,q,p,o=a.length
for(t="",s="",r=0;r<o;r+=3,s=","){q=a[r]
p=a[r+1]?"!":":"
t+=s+q+p+a[r+2].as}return t},
am(a,b,c){var t,s,r,q=b
if(c.length>0)q+="<"+A.al(c)+">"
t=a.eC.get(q)
if(t!=null)return t
s=new A.y(null,null)
s.w=8
s.x=b
s.y=c
if(c.length>0)s.c=c[0]
s.as=q
r=A.G(a,s)
a.eC.set(q,r)
return r},
bF(a,b,c){var t,s,r,q,p,o
if(b.w===9){t=b.x
s=b.y.concat(c)}else{s=c
t=b}r=t.as+(";<"+A.al(s)+">")
q=a.eC.get(r)
if(q!=null)return q
p=new A.y(null,null)
p.w=9
p.x=t
p.y=s
p.as=r
o=A.G(a,p)
a.eC.set(r,o)
return o},
cd(a,b,c){var t,s,r="+"+(b+"("+A.al(c)+")"),q=a.eC.get(r)
if(q!=null)return q
t=new A.y(null,null)
t.w=10
t.x=b
t.y=c
t.as=r
s=A.G(a,t)
a.eC.set(r,s)
return s},
ca(a,b,c){var t,s,r,q,p,o=b.as,n=c.a,m=n.length,l=c.b,k=l.length,j=c.c,i=j.length,h="("+A.al(n)
if(k>0){t=m>0?",":""
h+=t+"["+A.al(l)+"]"}if(i>0){t=m>0?",":""
h+=t+"{"+A.dr(j)+"}"}s=o+(h+")")
r=a.eC.get(s)
if(r!=null)return r
q=new A.y(null,null)
q.w=11
q.x=b
q.y=c
q.as=s
p=A.G(a,q)
a.eC.set(s,p)
return p},
bG(a,b,c,d){var t,s=b.as+("<"+A.al(c)+">"),r=a.eC.get(s)
if(r!=null)return r
t=A.dt(a,b,c,s,d)
a.eC.set(s,t)
return t},
dt(a,b,c,d,e){var t,s,r,q,p,o,n,m
if(e){t=c.length
s=A.bl(t)
for(r=0,q=0;q<t;++q){p=c[q]
if(p.w===1){s[q]=p;++r}}if(r>0){o=A.N(a,b,s,0)
n=A.Z(a,c,s,0)
return A.bG(a,o,n,c!==n)}}m=new A.y(null,null)
m.w=12
m.x=b
m.y=c
m.as=d
return A.G(a,m)},
di(a,b,c,d){return{u:a,e:b,r:c,s:[],p:0,n:d}},
dp(a){var t,s,r,q,p,o,n,m=a.r,l=a.s
for(t=m.length,s=0;s<t;){r=m.charCodeAt(s)
if(r>=48&&r<=57)s=A.dk(s+1,r,m,l)
else if((((r|32)>>>0)-97&65535)<26||r===95||r===36||r===124)s=A.c8(a,s,m,l,!1)
else if(r===46)s=A.c8(a,s,m,l,!0)
else{++s
switch(r){case 44:break
case 58:l.push(!1)
break
case 33:l.push(!0)
break
case 59:l.push(A.L(a.u,a.e,l.pop()))
break
case 94:l.push(A.dv(a.u,l.pop()))
break
case 35:l.push(A.an(a.u,5,"#"))
break
case 64:l.push(A.an(a.u,2,"@"))
break
case 126:l.push(A.an(a.u,3,"~"))
break
case 60:l.push(a.p)
a.p=l.length
break
case 62:A.dm(a,l)
break
case 38:A.dl(a,l)
break
case 63:q=a.u
l.push(A.cc(q,A.L(q,a.e,l.pop()),a.n))
break
case 47:q=a.u
l.push(A.cb(q,A.L(q,a.e,l.pop()),a.n))
break
case 40:l.push(-3)
l.push(a.p)
a.p=l.length
break
case 41:A.dj(a,l)
break
case 91:l.push(a.p)
a.p=l.length
break
case 93:p=l.splice(a.p)
A.c9(a.u,a.e,p)
a.p=l.pop()
l.push(p)
l.push(-1)
break
case 123:l.push(a.p)
a.p=l.length
break
case 125:p=l.splice(a.p)
A.dq(a.u,a.e,p)
a.p=l.pop()
l.push(p)
l.push(-2)
break
case 43:o=m.indexOf("(",s)
l.push(m.substring(s,o))
l.push(-4)
l.push(a.p)
a.p=l.length
s=o+1
break
default:throw"Bad character "+r}}}n=l.pop()
return A.L(a.u,a.e,n)},
dk(a,b,c,d){var t,s,r=b-48
for(t=c.length;a<t;++a){s=c.charCodeAt(a)
if(!(s>=48&&s<=57))break
r=r*10+(s-48)}d.push(r)
return a},
c8(a,b,c,d,e){var t,s,r,q,p,o,n=b+1
for(t=c.length;n<t;++n){s=c.charCodeAt(n)
if(s===46){if(e)break
e=!0}else{if(!((((s|32)>>>0)-97&65535)<26||s===95||s===36||s===124))r=s>=48&&s<=57
else r=!0
if(!r)break}}q=c.substring(b,n)
if(e){t=a.u
p=a.e
if(p.w===9)p=p.x
o=A.dA(t,p.x)[q]
if(o==null)A.cE('No "'+q+'" in "'+A.dd(p)+'"')
d.push(A.bk(t,p,o))}else d.push(q)
return n},
dm(a,b){var t,s=a.u,r=A.c7(a,b),q=b.pop()
if(typeof q=="string")b.push(A.am(s,q,r))
else{t=A.L(s,a.e,q)
switch(t.w){case 11:b.push(A.bG(s,t,r,a.n))
break
default:b.push(A.bF(s,t,r))
break}}},
dj(a,b){var t,s,r,q=a.u,p=b.pop(),o=null,n=null
if(typeof p=="number")switch(p){case-1:o=b.pop()
break
case-2:n=b.pop()
break
default:b.push(p)
break}else b.push(p)
t=A.c7(a,b)
p=b.pop()
switch(p){case-3:p=b.pop()
if(o==null)o=q.sEA
if(n==null)n=q.sEA
s=A.L(q,a.e,p)
r=new A.aX()
r.a=t
r.b=o
r.c=n
b.push(A.ca(q,s,r))
return
case-4:b.push(A.cd(q,b.pop(),t))
return
default:throw A.d(A.aw("Unexpected state under `()`: "+A.o(p)))}},
dl(a,b){var t=b.pop()
if(0===t){b.push(A.an(a.u,1,"0&"))
return}if(1===t){b.push(A.an(a.u,4,"1&"))
return}throw A.d(A.aw("Unexpected extended operation "+A.o(t)))},
c7(a,b){var t=b.splice(a.p)
A.c9(a.u,a.e,t)
a.p=b.pop()
return t},
L(a,b,c){if(typeof c=="string")return A.am(a,c,a.sEA)
else if(typeof c=="number"){b.toString
return A.dn(a,b,c)}else return c},
c9(a,b,c){var t,s=c.length
for(t=0;t<s;++t)c[t]=A.L(a,b,c[t])},
dq(a,b,c){var t,s=c.length
for(t=2;t<s;t+=3)c[t]=A.L(a,b,c[t])},
dn(a,b,c){var t,s,r=b.w
if(r===9){if(c===0)return b.x
t=b.y
s=t.length
if(c<=s)return t[c-1]
c-=s
b=b.x
r=b.w}else if(c===0)return b
if(r!==8)throw A.d(A.aw("Indexed base must be an interface type"))
t=b.y
if(c<=t.length)return t[c-1]
throw A.d(A.aw("Bad index "+c+" for "+b.h(0)))},
ed(a,b,c){var t,s=b.d
if(s==null)s=b.d=new Map()
t=s.get(c)
if(t==null){t=A.n(a,b,null,c,null)
s.set(c,t)}return t},
n(a,b,c,d,e){var t,s,r,q,p,o,n,m,l,k,j
if(b===d)return!0
if(A.Q(d))return!0
t=b.w
if(t===4)return!0
if(A.Q(b))return!1
if(b.w===1)return!0
s=t===13
if(s)if(A.n(a,c[b.x],c,d,e))return!0
r=d.w
q=u.P
if(b===q||b===u.T){if(r===7)return A.n(a,b,c,d.x,e)
return d===q||d===u.T||r===6}if(d===u.K){if(t===7)return A.n(a,b.x,c,d,e)
return t!==6}if(t===7){if(!A.n(a,b.x,c,d,e))return!1
return A.n(a,A.bE(a,b),c,d,e)}if(t===6)return A.n(a,q,c,d,e)&&A.n(a,b.x,c,d,e)
if(r===7){if(A.n(a,b,c,d.x,e))return!0
return A.n(a,b,c,A.bE(a,d),e)}if(r===6)return A.n(a,b,c,q,e)||A.n(a,b,c,d.x,e)
if(s)return!1
q=t!==11
if((!q||t===12)&&d===u.Z)return!0
p=t===10
if(p&&d===u.J)return!0
if(r===12){if(b===u.g)return!0
if(t!==12)return!1
o=b.y
n=d.y
m=o.length
if(m!==n.length)return!1
c=c==null?o:o.concat(c)
e=e==null?n:n.concat(e)
for(l=0;l<m;++l){k=o[l]
j=n[l]
if(!A.n(a,k,c,j,e)||!A.n(a,j,e,k,c))return!1}return A.co(a,b.x,c,d.x,e)}if(r===11){if(b===u.g)return!0
if(q)return!1
return A.co(a,b,c,d,e)}if(t===8){if(r!==8)return!1
return A.dP(a,b,c,d,e)}if(p&&r===10)return A.dU(a,b,c,d,e)
return!1},
co(a2,a3,a4,a5,a6){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1
if(!A.n(a2,a3.x,a4,a5.x,a6))return!1
t=a3.y
s=a5.y
r=t.a
q=s.a
p=r.length
o=q.length
if(p>o)return!1
n=o-p
m=t.b
l=s.b
k=m.length
j=l.length
if(p+k<o+j)return!1
for(i=0;i<p;++i){h=r[i]
if(!A.n(a2,q[i],a6,h,a4))return!1}for(i=0;i<n;++i){h=m[i]
if(!A.n(a2,q[p+i],a6,h,a4))return!1}for(i=0;i<j;++i){h=m[n+i]
if(!A.n(a2,l[i],a6,h,a4))return!1}g=t.c
f=s.c
e=g.length
d=f.length
for(c=0,b=0;b<d;b+=3){a=f[b]
for(;;){if(c>=e)return!1
a0=g[c]
c+=3
if(a<a0)return!1
a1=g[c-2]
if(a0<a){if(a1)return!1
continue}h=f[b+1]
if(a1&&!h)return!1
h=g[c-1]
if(!A.n(a2,f[b+2],a6,h,a4))return!1
break}}while(c<e){if(g[c+1])return!1
c+=3}return!0},
dP(a,b,c,d,e){var t,s,r,q,p,o=b.x,n=d.x
while(o!==n){t=a.tR[o]
if(t==null)return!1
if(typeof t=="string"){o=t
continue}s=t[n]
if(s==null)return!1
r=s.length
q=r>0?new Array(r):v.typeUniverse.sEA
for(p=0;p<r;++p)q[p]=A.bk(a,b,s[p])
return A.cg(a,q,null,c,d.y,e)}return A.cg(a,b.y,null,c,d.y,e)},
cg(a,b,c,d,e,f){var t,s=b.length
for(t=0;t<s;++t)if(!A.n(a,b[t],d,e[t],f))return!1
return!0},
dU(a,b,c,d,e){var t,s=b.y,r=d.y,q=s.length
if(q!==r.length)return!1
if(b.x!==d.x)return!1
for(t=0;t<q;++t)if(!A.n(a,s[t],c,r[t],e))return!1
return!0},
a0(a){var t=a.w,s=!0
if(!(a===u.P||a===u.T))if(!A.Q(a))if(t!==6)s=t===7&&A.a0(a.x)
return s},
Q(a){var t=a.w
return t===2||t===3||t===4||t===5||a===u.X},
cf(a,b){var t,s,r=Object.keys(b),q=r.length
for(t=0;t<q;++t){s=r[t]
a[s]=b[s]}},
bl(a){return a>0?new Array(a):v.typeUniverse.sEA},
y:function y(a,b){var _=this
_.a=a
_.b=b
_.r=_.f=_.d=_.c=null
_.w=0
_.as=_.Q=_.z=_.y=_.x=null},
aX:function aX(){this.c=this.b=this.a=null},
bi:function bi(a){this.a=a},
be:function be(){},
aY:function aY(a){this.a=a},
i:function i(){},
bO(a){var t=A.c1(a,null)
if(t!=null)return t
throw A.d(A.bX(a,null))},
d5(a,b,c,d){var t,s=J.cZ(a,d)
if(a!==0&&b!=null)for(t=0;t<a;++t)s[t]=b
return s},
d6(a,b,c){var t,s=J.d_(a,c)
for(t=0;t<a;++t)B.c.M(s,t,b.$1(t))
return s},
dc(a){return new A.aD(a,A.d3(a,!1,!0,!1,!1,""))},
c3(a,b,c){var t=J.cK(b)
if(!t.p())return a
if(c.length===0){do a+=A.o(t.gq())
while(t.p())}else{a+=A.o(t.gq())
while(t.p())a=a+c+A.o(t.gq())}return a},
b2(a){if(typeof a=="number"||A.bJ(a)||a==null)return J.au(a)
if(typeof a=="string")return JSON.stringify(a)
return A.d7(a)},
aw(a){return new A.b_(a)},
bC(a){return new A.S(!1,null,null,a)},
d8(a,b){return new A.aR(null,null,!0,a,b,"Value not in range")},
ae(a,b,c,d,e){return new A.aR(b,c,!0,a,d,"Invalid value")},
da(a,b,c){if(0>a||a>c)throw A.d(A.ae(a,0,c,"start",null))
if(b!=null){if(a>b||b>c)throw A.d(A.ae(b,a,c,"end",null))
return b}return c},
d9(a,b){if(a<0)throw A.d(A.ae(a,0,null,b,null))
return a},
bZ(a,b,c,d){return new A.b4(b,!0,a,d,"Index out of range")},
c5(a){return new A.aW(a)},
c4(a){return new A.bd(a)},
ay(a){return new A.b0(a)},
bX(a,b){return new A.b3(a,b)},
cY(a,b,c){var t,s
if(A.cB(a)){if(b==="("&&c===")")return"(...)"
return b+"..."+c}t=A.x([],u.s)
B.c.m($.B,a)
try{A.dY(a,t)}finally{if(0>=$.B.length)return A.k($.B,-1)
$.B.pop()}s=A.c3(b,u.U.a(t),", ")+c
return s.charCodeAt(0)==0?s:s},
c_(a,b,c){var t,s
if(A.cB(a))return b+"..."+c
t=new A.bb(b)
B.c.m($.B,a)
try{s=t
s.a=A.c3(s.a,a,", ")}finally{if(0>=$.B.length)return A.k($.B,-1)
$.B.pop()}t.a+=c
s=t.a
return s.charCodeAt(0)==0?s:s},
dY(a,b){var t,s,r,q,p,o,n,m=a.gC(a),l=0,k=0
for(;;){if(!(l<80||k<3))break
if(!m.p())return
t=A.o(m.gq())
B.c.m(b,t)
l+=t.length+2;++k}if(!m.p()){if(k<=5)return
if(0>=b.length)return A.k(b,-1)
s=b.pop()
if(0>=b.length)return A.k(b,-1)
r=b.pop()}else{q=m.gq();++k
if(!m.p()){if(k<=4){B.c.m(b,A.o(q))
return}s=A.o(q)
if(0>=b.length)return A.k(b,-1)
r=b.pop()
l+=s.length+2}else{p=m.gq();++k
for(;m.p();q=p,p=o){o=m.gq();++k
if(k>100){for(;;){if(!(l>75&&k>3))break
if(0>=b.length)return A.k(b,-1)
l-=b.pop().length+2;--k}B.c.m(b,"...")
return}}r=A.o(q)
s=A.o(p)
l+=s.length+r.length+4}}if(k>b.length+2){l+=5
n="..."}else n=null
for(;;){if(!(l>80&&b.length>3))break
if(0>=b.length)return A.k(b,-1)
l-=b.pop().length+2
if(n==null){l+=5
n="..."}}if(n!=null)B.c.m(b,n)
B.c.m(b,r)
B.c.m(b,s)},
b1:function b1(){},
b_:function b_(a){this.a=a},
bc:function bc(){},
S:function S(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
aR:function aR(a,b,c,d,e,f){var _=this
_.e=a
_.f=b
_.a=c
_.b=d
_.c=e
_.d=f},
b4:function b4(a,b,c,d,e){var _=this
_.f=a
_.a=b
_.b=c
_.c=d
_.d=e},
aW:function aW(a){this.a=a},
bd:function bd(a){this.a=a},
b0:function b0(a){this.a=a},
b3:function b3(a,b){this.a=a
this.b=b},
c:function c(){},
J:function J(){},
q:function q(){},
bb:function bb(a){this.a=a},
bh:function bh(){this.b=this.a=0},
C(a,b){return"rgba("+(B.b.n(a,16)&255)+", "+(B.b.n(a,8)&255)+", "+(B.b.n(a,0)&255)+", "+B.a.F(B.a.j(b,0,1),3)+")"},
R(a,b,c){var t,s=new A.bz(a,b,B.a.j(c,0,1)),r=s.$1(16)
if(typeof r!=="number")return r.G()
t=s.$1(8)
if(typeof t!=="number")return t.G()
s=s.$1(0)
if(typeof s!=="number")return A.cA(s)
return(r<<16|t<<8|s)>>>0},
e5(a,b){var t,s=new A.bm(b),r=s.$1(B.b.n(a,16)&255)
if(typeof r!=="number")return r.G()
t=s.$1(B.b.n(a,8)&255)
if(typeof t!=="number")return t.G()
s=s.$1(B.b.n(a,0)&255)
if(typeof s!=="number")return A.cA(s)
return(r<<16|t<<8|s)>>>0},
aZ(a,b){var t,s,r,q,p,o,n=v.G,m=A.z(A.b(n.document).documentElement)
if(m==null)return b
t=B.d.ad(A.Y(A.b(A.b(n.window).getComputedStyle(m)).getPropertyValue(a)))
if(t.length===0)return b
if(B.d.V(t,"#")){s=B.d.W(t,1)
if(s.length===3)s=new A.a9(A.x(s.split(""),u.s),u.C.a(new A.bB()),u.e).ab(0)
if(s.length>=6){r=A.c1(B.d.H(s,0,6),16)
if(r!=null)return r}}else s=t
q=A.dc("rgba?\\(\\s*(\\d+)[\\s,]+(\\d+)[\\s,]+(\\d+)").aa(s)
if(q!=null){n=q.b
if(1>=n.length)return A.k(n,1)
p=n[1]
p.toString
p=A.bO(p)
if(2>=n.length)return A.k(n,2)
o=n[2]
o.toString
o=A.bO(o)
if(3>=n.length)return A.k(n,3)
n=n[3]
n.toString
return(p<<16|o<<8|A.bO(n))>>>0}return b},
ef(){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d=v.G,c=A.z(A.b(d.document).getElementById("scene"))
if(c==null)return
t=A.ch(A.b(A.b(d.window).matchMedia("(prefers-reduced-motion: reduce)")).matches)
s=A.aZ("--bg",396041)
r=A.aZ("--accent",9174974)
q=A.aZ("--info",6023128)
p=A.aZ("--success",5232268)
o=A.aZ("--text",15135466)
n=A.R(s,r,0.1)
m=A.R(s,r,0.2)
l=A.R(s,q,0.1)
k=A.x([],u.q)
j=A.x([],u.j)
i=u.t
h=A.x([],i)
i=A.x([],i)
g=A.x([],u.W)
f=A.z(c.getContext("2d"))
if(f==null)f=A.b(f)
e=new A.aS(f,new A.b6(s,r,q,p,o,n,m,l),t,k,j,h,i,g)
f.imageSmoothingEnabled=!1
e.a0()
e.a_()
e.a1()
c.addEventListener("pointerdown",A.ap(new A.bt(new A.bx(c,e))))
c.addEventListener("keydown",A.ap(new A.bu(e)))
f=A.z(A.b(d.document).getElementById("raise"))
if(f!=null)f.addEventListener("click",A.ap(new A.bv(e)))
n=A.z(A.b(d.document).getElementById("sound"))
if(n!=null)n.addEventListener("click",A.ap(new A.bw(e)))
e.U()
A.M(A.b(d.window).requestAnimationFrame(A.ap(e.gO())))},
bz:function bz(a,b,c){this.a=a
this.b=b
this.c=c},
bm:function bm(a){this.a=a},
bB:function bB(){},
b6:function b6(a,b,c,d,e,f,g,h){var _=this
_.a=a
_.b=b
_.c=c
_.d=d
_.e=e
_.f=f
_.r=g
_.w=h},
aT:function aT(a,b,c,d){var _=this
_.a=a
_.b=b
_.c=c
_.d=d},
aO:function aO(a,b,c){this.a=a
this.b=b
this.c=c},
K:function K(a,b,c,d,e,f,g,h,i){var _=this
_.a=a
_.b=b
_.c=0
_.d=c
_.e=d
_.f=e
_.r=f
_.w=g
_.z=h
_.Q=i},
aS:function aS(a,b,c,d,e,f,g,h){var _=this
_.b=a
_.c=b
_.d=c
_.e=$
_.f=d
_.r=e
_.w=f
_.x=g
_.y=h
_.at=_.as=_.Q=_.z=0
_.ay=_.ax=null
_.ch=!1
_.CW=0},
b9:function b9(a,b){this.a=a
this.b=b},
ba:function ba(){},
bx:function bx(a,b){this.a=a
this.b=b},
bt:function bt(a){this.a=a},
bu:function bu(a){this.a=a},
bv:function bv(a){this.a=a},
bw:function bw(a){this.a=a},
cF(a){return v.mangledGlobalNames[a]},
eh(a){throw A.p(new A.aE("Field '"+a+"' has been assigned during initialization."),new Error())},
ei(){throw A.p(A.d4(""),new Error())},
ap(a){var t
if(typeof a=="function")throw A.d(A.bC("Attempting to rewrap a JS function."))
t=function(b,c){return function(d){return b(c,d,arguments.length)}}(A.dF,a)
t[$.bQ()]=a
return t},
dF(a,b,c){u.Z.a(a)
if(A.M(c)>=1)return a.$1(b)
return a.$0()}},B={}
var w=[A,J,B]
var $={}
A.bD.prototype={}
J.az.prototype={
h(a){return"Instance of '"+A.aQ(a)+"'"},
gi(a){return A.P(A.bI(this))}}
J.aB.prototype={
h(a){return String(a)},
gi(a){return A.P(u.y)},
$ie:1,
$iO:1}
J.a4.prototype={
h(a){return"null"},
$ie:1}
J.a7.prototype={$ij:1}
J.F.prototype={
h(a){return String(a)}}
J.aP.prototype={}
J.ag.prototype={}
J.E.prototype={
h(a){var t=a[$.cH()]
if(t==null)t=a[$.bQ()]
if(t==null)return this.X(a)
return"JavaScript function for "+J.au(t)},
$iT:1}
J.a6.prototype={
h(a){return String(a)}}
J.a8.prototype={
h(a){return String(a)}}
J.l.prototype={
m(a,b){A.H(a).c.a(b)
a.$flags&1&&A.as(a,29)
a.push(b)},
a6(a,b,c){var t,s,r,q,p
A.H(a).t("O(1)").a(b)
t=[]
s=a.length
for(r=0;r<s;++r){q=a[r]
if(!b.$1(q))t.push(q)
if(a.length!==s)throw A.d(A.ay(a))}p=t.length
if(p===s)return
this.sk(a,p)
for(r=0;r<t.length;++r)a[r]=t[r]},
R(a,b){A.H(a).t("c<1>").a(b)
a.$flags&1&&A.as(a,"addAll",2)
this.Z(a,b)
return},
Z(a,b){var t,s
u.b.a(b)
t=b.length
if(t===0)return
if(a===b)throw A.d(A.ay(a))
for(s=0;s<t;++s)a.push(b[s])},
B(a,b){if(!(b>=0&&b<a.length))return A.k(a,b)
return a[b]},
h(a){return A.c_(a,"[","]")},
gC(a){return new J.av(a,a.length,A.H(a).t("av<1>"))},
gk(a){return a.length},
sk(a,b){a.$flags&1&&A.as(a,"set length","change the length of")
if(b>a.length)A.H(a).c.a(null)
a.length=b},
M(a,b,c){var t
A.H(a).c.a(c)
a.$flags&2&&A.as(a)
t=a.length
if(b>=t)throw A.d(A.cw(a,b))
a[b]=c},
$ic:1,
$if:1}
J.aA.prototype={
ae(a){var t,s,r
if(!Array.isArray(a))return null
t=a.$flags|0
if((t&4)!==0)s="const, "
else if((t&2)!==0)s="unmodifiable, "
else s=(t&1)!==0?"fixed, ":""
r="Instance of '"+A.aQ(a)+"'"
if(s==="")return r
return r+" ("+s+"length: "+a.length+")"}}
J.b5.prototype={}
J.av.prototype={
gq(){var t=this.d
return t==null?this.$ti.c.a(t):t},
p(){var t,s=this,r=s.a,q=r.length
if(s.b!==q){r=A.bA(r)
throw A.d(r)}t=s.c
if(t>=q){s.d=null
return!1}s.d=r[t]
s.c=t+1
return!0}}
J.a5.prototype={
K(a,b){var t
if(a<b)return-1
else if(a>b)return 1
else if(a===b){if(a===0){t=this.gE(b)
if(this.gE(a)===t)return 0
if(this.gE(a))return-1
return 1}return 0}else if(isNaN(a)){if(isNaN(b))return 0
return 1}else return-1},
gE(a){return a===0?1/a<0:a<0},
v(a){if(a>0){if(a!==1/0)return Math.round(a)}else if(a>-1/0)return 0-Math.round(0-a)
throw A.d(A.c5(""+a+".round()"))},
ac(a){if(a<0)return-Math.round(-a)
else return Math.round(a)},
j(a,b,c){if(this.K(b,c)>0)throw A.d(A.cu(b))
if(this.K(a,b)<0)return b
if(this.K(a,c)>0)return c
return a},
F(a,b){var t
if(b>20)throw A.d(A.ae(b,0,20,"fractionDigits",null))
t=a.toFixed(b)
if(a===0&&this.gE(a))return"-"+t
return t},
h(a){if(a===0&&1/a<0)return"-0.0"
else return""+a},
T(a,b){var t=a%b
if(t===0)return 0
if(t>0)return t
return t+b},
u(a,b){return(a|0)===a?a/b|0:this.a9(a,b)},
a9(a,b){var t=a/b
if(t>=-2147483648&&t<=2147483647)return t|0
if(t>0){if(t!==1/0)return Math.floor(t)}else if(t>-1/0)return Math.ceil(t)
throw A.d(A.c5("Result of truncating division is "+A.o(t)+": "+A.o(a)+" ~/ "+b))},
n(a,b){var t
if(a>0)t=this.a7(a,b)
else{t=b>31?31:b
t=a>>t>>>0}return t},
a7(a,b){return b>31?0:a>>>b},
gi(a){return A.P(u.H)},
$ih:1,
$iv:1}
J.a3.prototype={
gi(a){return A.P(u.S)},
$ie:1,
$ia:1}
J.aC.prototype={
gi(a){return A.P(u.i)},
$ie:1}
J.U.prototype={
V(a,b){var t=b.length
if(t>a.length)return!1
return b===a.substring(0,t)},
H(a,b,c){return a.substring(b,A.da(b,c,a.length))},
W(a,b){return this.H(a,b,null)},
ad(a){var t,s,r,q=a.trim(),p=q.length
if(p===0)return q
if(0>=p)return A.k(q,0)
if(q.charCodeAt(0)===133){t=J.d1(q,1)
if(t===p)return""}else t=0
s=p-1
if(!(s>=0))return A.k(q,s)
r=q.charCodeAt(s)===133?J.d2(q,s):p
if(t===0&&r===p)return q
return q.substring(t,r)},
h(a){return a},
gi(a){return A.P(u.N)},
gk(a){return a.length},
$ie:1,
$ib7:1,
$im:1}
A.aE.prototype={
h(a){return"LateInitializationError: "+this.a}}
A.a2.prototype={}
A.I.prototype={
gC(a){var t=this
return new A.V(t,t.gk(t),A.bH(t).t("V<I.E>"))},
ab(a){var t,s,r=this,q=r.gk(r)
for(t=0,s="";t<q;++t){s+=A.o(r.B(0,t))
if(q!==r.gk(r))throw A.d(A.ay(r))}return s.charCodeAt(0)==0?s:s}}
A.V.prototype={
gq(){var t=this.d
return t==null?this.$ti.c.a(t):t},
p(){var t,s=this,r=s.a,q=J.cx(r),p=q.gk(r)
if(s.b!==p)throw A.d(A.ay(r))
t=s.c
if(t>=p){s.d=null
return!1}s.d=q.B(r,t);++s.c
return!0}}
A.a9.prototype={
gk(a){return this.a.length},
B(a,b){return this.b.$1(J.cJ(this.a,b))}}
A.r.prototype={}
A.af.prototype={}
A.D.prototype={
h(a){var t=this.constructor,s=t==null?null:t.name
return"Closure '"+A.cG(s==null?"unknown":s)+"'"},
$iT:1,
gaf(){return this},
$C:"$1",
$R:1,
$D:null}
A.ax.prototype={$C:"$2",$R:2}
A.aV.prototype={}
A.aU.prototype={
h(a){var t=this.$static_name
if(t==null)return"Closure of unknown static method"
return"Closure '"+A.cG(t)+"'"}}
A.a1.prototype={
h(a){return"Closure '"+this.$_name+"' of "+("Instance of '"+A.aQ(this.a)+"'")}}
A.b8.prototype={
h(a){return"RuntimeError: "+this.a}}
A.bp.prototype={
$1(a){return this.a(a)},
$S:2}
A.bq.prototype={
$2(a,b){return this.a(a,b)},
$S:3}
A.br.prototype={
$1(a){return this.a(A.Y(a))},
$S:4}
A.aD.prototype={
h(a){return"RegExp/"+this.a+"/"+this.b.flags},
aa(a){var t=this.b.exec(a)
if(t==null)return null
return new A.bg(t)},
$ib7:1,
$idb:1}
A.bg.prototype={}
A.W.prototype={
gi(a){return B.v},
$ie:1}
A.ac.prototype={}
A.aF.prototype={
gi(a){return B.w},
$ie:1}
A.X.prototype={
gk(a){return a.length},
$it:1}
A.aa.prototype={$ic:1,$if:1}
A.ab.prototype={$ic:1,$if:1}
A.aG.prototype={
gi(a){return B.x},
$ie:1}
A.aH.prototype={
gi(a){return B.y},
$ie:1}
A.aI.prototype={
gi(a){return B.z},
$ie:1}
A.aJ.prototype={
gi(a){return B.A},
$ie:1}
A.aK.prototype={
gi(a){return B.B},
$ie:1}
A.aL.prototype={
gi(a){return B.C},
$ie:1}
A.aM.prototype={
gi(a){return B.D},
$ie:1}
A.ad.prototype={
gi(a){return B.E},
gk(a){return a.length},
$ie:1}
A.aN.prototype={
gi(a){return B.F},
gk(a){return a.length},
$ie:1}
A.ah.prototype={}
A.ai.prototype={}
A.aj.prototype={}
A.ak.prototype={}
A.y.prototype={
t(a){return A.bk(v.typeUniverse,this,a)},
ag(a){return A.dy(v.typeUniverse,this,a)}}
A.aX.prototype={}
A.bi.prototype={
h(a){return A.u(this.a,null)}}
A.be.prototype={
h(a){return this.a}}
A.aY.prototype={}
A.i.prototype={
gC(a){return new A.V(a,a.length,A.ar(a).t("V<i.E>"))},
B(a,b){if(!(b>=0&&b<a.length))return A.k(a,b)
return a[b]},
h(a){return A.c_(a,"[","]")}}
A.b1.prototype={}
A.b_.prototype={
h(a){var t=this.a
if(t!=null)return"Assertion failed: "+A.b2(t)
return"Assertion failed"}}
A.bc.prototype={}
A.S.prototype={
gJ(){return"Invalid argument"+(!this.a?"(s)":"")},
gI(){return""},
h(a){var t=this,s=t.c,r=s==null?"":" ("+s+")",q=t.d,p=q==null?"":": "+A.o(q),o=t.gJ()+r+p
if(!t.a)return o
return o+t.gI()+": "+A.b2(t.gL())},
gL(){return this.b}}
A.aR.prototype={
gL(){return A.cj(this.b)},
gJ(){return"RangeError"},
gI(){var t,s=this.e,r=this.f
if(s==null)t=r!=null?": Not less than or equal to "+A.o(r):""
else if(r==null)t=": Not greater than or equal to "+A.o(s)
else if(r>s)t=": Not in inclusive range "+A.o(s)+".."+A.o(r)
else t=r<s?": Valid value range is empty":": Only valid value is "+A.o(s)
return t}}
A.b4.prototype={
gL(){return A.M(this.b)},
gJ(){return"RangeError"},
gI(){if(A.M(this.b)<0)return": index must not be negative"
var t=this.f
if(t===0)return": no indices are valid"
return": index should be less than "+t},
gk(a){return this.f}}
A.aW.prototype={
h(a){return"Unsupported operation: "+this.a}}
A.bd.prototype={
h(a){return"UnimplementedError: "+this.a}}
A.b0.prototype={
h(a){var t=this.a
if(t==null)return"Concurrent modification during iteration."
return"Concurrent modification during iteration: "+A.b2(t)+"."}}
A.b3.prototype={
h(a){var t=this.a,s=""!==t?"FormatException: "+t:"FormatException",r=this.b
if(typeof r=="string"){if(r.length>78)r=B.d.H(r,0,75)+"..."
return s+"\n"+r}else return s}}
A.c.prototype={
gk(a){var t,s=this.gC(this)
for(t=0;s.p();)++t
return t},
B(a,b){var t,s
A.d9(b,"index")
t=this.gC(this)
for(s=b;t.p();){if(s===0)return t.gq();--s}throw A.d(A.bZ(b,b-s,this,"index"))},
h(a){return A.cY(this,"(",")")}}
A.J.prototype={
h(a){return"null"}}
A.q.prototype={$iq:1,
h(a){return"Instance of '"+A.aQ(this)+"'"},
gi(a){return A.e7(this)},
toString(){return this.h(this)}}
A.bb.prototype={
gk(a){return this.a.length},
h(a){var t=this.a
return t.charCodeAt(0)==0?t:t}}
A.bh.prototype={
Y(a){var t,s,r,q,p,o,n,m=this,l=4294967296
do{t=a>>>0
a=B.b.u(a-t,l)
s=a>>>0
a=B.b.u(a-s,l)
r=(~t>>>0)+(t<<21>>>0)
q=r>>>0
s=(~s>>>0)+((s<<21|t>>>11)>>>0)+B.b.u(r-q,l)>>>0
r=((q^(q>>>24|s<<8))>>>0)*265
t=r>>>0
s=((s^s>>>24)>>>0)*265+B.b.u(r-t,l)>>>0
r=((t^(t>>>14|s<<18))>>>0)*21
t=r>>>0
s=((s^s>>>14)>>>0)*21+B.b.u(r-t,l)>>>0
t=(t^(t>>>28|s<<4))>>>0
s=(s^s>>>28)>>>0
r=(t<<31>>>0)+t
q=r>>>0
p=B.b.u(r-q,l)
r=m.a*1037
o=m.a=r>>>0
n=m.b*1037+B.b.u(r-o,l)>>>0
m.b=n
o=(o^q)>>>0
m.a=o
p=(n^s+((s<<31|t>>>1)>>>0)+p>>>0)>>>0
m.b=p}while(a!==0)
if(p===0&&o===0)m.a=23063
m.A()
m.A()
m.A()
m.A()},
A(){var t=this,s=t.a,r=4294901760*s,q=r>>>0,p=55905*s,o=p>>>0,n=o+q+t.b
s=n>>>0
t.a=s
t.b=B.b.u(p-o+(r-q)+(n-s),4294967296)>>>0},
l(){var t,s=this
s.A()
t=s.a
s.A()
return((t&67108863)*134217728+(s.a&134217727))/9007199254740992},
S(){this.A()
return(this.a&1)===0}}
A.bz.prototype={
$1(a){var t=B.b.n(this.a,a)&255
return B.a.v(t+((B.b.n(this.b,a)&255)-t)*this.c)},
$S:1}
A.bm.prototype={
$1(a){return B.b.j(B.a.v(a*this.a),0,255)},
$S:1}
A.bB.prototype={
$1(a){A.Y(a)
return a+a},
$S:5}
A.b6.prototype={}
A.aT.prototype={}
A.aO.prototype={}
A.K.prototype={}
A.aS.prototype={
a0(){var t=this.c,s=t.a
this.e=u.a.a(A.d6(108,new A.b9(A.e5(s,0.75),A.R(s,t.w,0.9)),u.N))},
P(a,b,c){var t,s,r,q,p=A.d5(192,B.a.v(a),!1,u.S)
for(t=c*1.7,s=c*2.3,r=0;r<192;++r){q=r/192
B.c.M(p,r,B.a.v(a-Math.abs(b*(0.62*Math.sin(q*6.1+c)+0.28*Math.sin(q*13.3+t)+0.1*Math.sin(q*27+s)))))}return p},
a_(){var t,s,r,q,p,o,n=this
B.c.R(n.w,n.P(71.28,9,0.7))
t=n.x
B.c.R(t,n.P(84.24000000000001,11,2.4))
for(s=n.r,r=0;r<8;++r){q=$.at()
p=12+q.l()*168
o=B.b.j(B.a.v(p),0,191)
if(!(o>=0&&o<t.length))return A.k(t,o)
B.c.m(s,new A.aO(p,t[o],5+q.l()*6))}},
a1(){var t,s,r
for(t=this.f,s=0;s<54;++s){r=$.at()
B.c.m(t,new A.aT(r.l()*192,r.l()*64.8,r.l()*3.141592653589793*2,0.5+r.l()*1.4))}},
U(){var t,s,r
this.D(76.80000000000001,32.4)
for(t=this.y,s=t.length,r=0;r<s;++r)t[r].d=55
this.D(126.72,36.720000000000006)},
D(a,b){var t,s,r,q,p,o,n,m,l,k,j,i,h,g=this,f=B.a.j(a,11.52,180.48),e=B.a.j(b,8.64,66.96),d=g.y
if(d.length>=6){d.$flags&1&&A.as(d,"removeAt",1)
d.splice(0,1)[0]}t=$.at()
s=g.c
r=t.S()?s.b:s.d
q=t.S()?s.c:s.b
s=t.l()
p=g.d
o=p?9:13+t.l()*5
n=t.l()
m=p?0:1.6+t.l()*2.2
l=t.l()
k=v.G
j=A.b(A.b(k.document).createElement("canvas"))
j.width=1
j.height=64
i=A.z(j.getContext("2d"))
if(i==null)i=A.b(i)
h=A.b(i.createLinearGradient(0,0,0,64))
h.addColorStop(0,A.C(r,0))
h.addColorStop(0.28,A.C(q,0.22))
h.addColorStop(0.58,A.C(q,0.85))
h.addColorStop(0.82,A.C(r,0.35))
h.addColorStop(1,A.C(r,0))
i.fillStyle=h
i.fillRect(0,0,1,64)
t=p?0:0.5+t.l()*0.7
B.c.m(d,new A.K(f-34,60+s*34,o,n*3.141592653589793*2,m,26+l*16,e,j,t))
k=A.z(A.b(k.document).getElementById("status"))
if(k!=null)k.textContent="A ribbon of light rises over the ridge."
g.Q=1
if(!p)g.as+=1.6
if(g.ch){g.a5(B.u[B.b.T(B.b.j(6-B.a.v(e/66.96*6),0,6)+g.CW,7)]);++g.CW}},
a5(a){var t,s,r,q,p,o,n=this.ay
if(n==null)return
t=A.ao(n.currentTime)
s=A.b(n.createGain())
A.b(A.b(s.gain).setValueAtTime(0.0001,t))
A.b(A.b(s.gain).exponentialRampToValueAtTime(0.05,t+0.8))
A.b(A.b(s.gain).exponentialRampToValueAtTime(0.0001,t+3.4))
A.z(s.connect(A.b(n.destination)))
for(r=t+3.5,q=0;q<3;++q){p=B.t[q]
o=A.b(n.createOscillator())
o.type="sine"
A.b(o.frequency).value=a*(1+p)
A.z(o.connect(s))
o.start()
o.stop(r)}},
a4(a){var t,s,r=this
A.ci(a)
t=r.ax
s=B.a.j((a-(t==null?a:t))/1000,0,0.05)
r.ax=a
r.z+=s
r.a8(s)
r.a2()
A.M(A.b(v.G.window).requestAnimationFrame(A.ap(r.gO())))},
a8(a){var t,s,r,q=this
q.Q=Math.max(0,q.Q-a*1.9)
if(!q.d){t=q.at
s=q.as
t+=(-s*34-t*9)*a
q.at=t
q.as=s+t*a}else q.as=0
for(t=q.y,s=t.length,r=0;r<s;++r)t[r].c+=a
s=A.H(t).t("O(1)").a(new A.ba())
t.$flags&1&&A.as(t,16)
B.c.a6(t,s,!0)},
a2(){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d=this,c=d.b
c.save()
c.imageSmoothingEnabled=!1
c.clearRect(0,0,192,108)
c.translate(0,B.a.ac(d.as))
for(t=0;t<108;++t){s=d.e
s===$&&A.ei()
c.fillStyle=s[t]
c.fillRect(0,t,192,1)}s=d.c
c.fillStyle=A.C(s.w,0.16)
c.fillRect(0,62.63999999999999,192,6)
for(r=d.f,q=r.length,p=s.e,o=d.d,n=0;n<r.length;r.length===q||(0,A.bA)(r),++n){m=r[n]
l=o?0.55:0.34+0.36*(0.5+0.5*Math.sin(d.z*1.3*m.d+m.c))
c.fillStyle="rgba("+(B.b.n(p,16)&255)+", "+(B.b.n(p,8)&255)+", "+(B.b.n(p,0)&255)+", "+B.a.F(B.a.j(l,0,1),3)+")"
c.fillRect(Math.floor(m.a),Math.floor(m.b),1,1)}for(r=d.y,q=r.length,n=0;n<r.length;r.length===q||(0,A.bA)(r),++n)d.a3(r[n])
r=d.w
q=s.f
d.N(r,q)
p=d.x
o=s.r
d.N(p,o)
for(s=s.b,k=0;k<192;++k){j=A.R(q,s,0.22)
c.fillStyle="rgba("+(j>>>16&255)+", "+(j>>>8&255)+", "+(j&255)+", "+B.a.F(B.a.j(0.7,0,1),3)+")"
if(!(k<r.length))return A.k(r,k)
c.fillRect(k,r[k],1,1)}for(k=0;k<192;++k){r=A.R(o,s,0.3)
c.fillStyle="rgba("+(r>>>16&255)+", "+(r>>>8&255)+", "+(r&255)+", "+B.a.F(B.a.j(0.8,0,1),3)+")"
if(!(k<p.length))return A.k(p,k)
c.fillRect(k,p[k],1,1)}c.fillStyle=A.C(A.R(o,s,0.34),1)
for(r=d.r,q=r.length,n=0;n<r.length;r.length===q||(0,A.bA)(r),++n){i=r[n]
for(p=i.c,o=B.a.v(p),j=p*0.42,h=i.b-p,g=i.a,f=0;f<o;++f){e=f/p*j
c.fillRect(g-e,h+f,Math.max(1,e*2),1)}}if(d.Q>0.01){c.globalCompositeOperation="lighter"
c.fillStyle=A.C(s,d.Q*0.055)
c.fillRect(-4,-4,200,116)
c.globalCompositeOperation="source-over"}c.restore()},
a3(a4){var t,s,r,q,p,o,n,m,l,k,j,i,h,g,f,e,d,c,b,a,a0,a1,a2,a3=this.b
a3.save()
a3.globalCompositeOperation="lighter"
t=B.a.v(a4.b)
for(s=a4.z,r=a4.f,q=a4.e,p=a4.Q,o=a4.w,n=a4.r,m=o+3,l=q*1.7,k=t-1,j=t<=1,i=a4.a,h=0;h<t;++h){g=i+h
if(g<-2||g>192)continue
f=Math.pow(Math.sin(3.141592653589793*(j?0:h/k)),0.65)
e=r*Math.sin(q+h*0.11+this.z*p)
d=o-n*(0.72+0.28*Math.sin(h*0.07+q))+e
c=Math.max(3,m+e*0.35-d)
b=Math.sin(this.z*1.5+h*0.19+l)
a=a4.c
a0=B.a.j(a/1.5,0,1)
a1=B.a.j((a4.d-a)/3.5,0,1)
a2=B.a.j(f*B.a.j(a0<a1?a0:a1,0,1)*(0.74+0.26*b),0,1)
if(a2<=0.006)continue
a3.globalAlpha=a2*0.22
a3.drawImage.apply(a3,[s,g-1,d-2,3,c+4])
a3.globalAlpha=a2
a3.drawImage.apply(a3,[s,g,d,1,c])}a3.restore()},
N(a,b){var t,s,r
u.L.a(a)
t=this.b
t.fillStyle=A.C(b,1)
for(s=0;s<192;++s){if(!(s<a.length))return A.k(a,s)
r=a[s]
t.fillRect(s,r,1,108-r+8)}}}
A.b9.prototype={
$1(a){var t=B.a.j(a/77.75999999999999,0,1)
return A.C(A.R(this.a,this.b,t*t),1)},
$S:7}
A.ba.prototype={
$1(a){u.x.a(a)
return a.c>=a.d},
$S:8}
A.bx.prototype={
$2(a,b){var t=A.b(this.a.getBoundingClientRect())
this.b.D((a-A.ao(t.left))/A.ao(t.width)*192,(b-A.ao(t.top))/A.ao(t.height)*108)},
$S:9}
A.bt.prototype={
$1(a){A.b(a)
a.preventDefault()
this.a.$2(A.M(a.clientX),A.M(a.clientY))},
$S:0}
A.bu.prototype={
$1(a){A.b(a)
if(A.Y(a.key)==="Enter"||A.Y(a.key)===" "){a.preventDefault()
this.a.D(96+($.at().l()-0.5)*60,32.4)}},
$S:0}
A.bv.prototype={
$1(a){A.b(a)
this.a.D(96+($.at().l()-0.5)*70,28.080000000000002)},
$S:0}
A.bw.prototype={
$1(a){var t,s,r,q,p=A.z(A.b(a).currentTarget)
if(p==null)p=A.b(p)
t=v.G
s=A.z(A.b(t.document).getElementById("sound-label"))
r=this.a
if(r.ch){r.ch=!1
p.setAttribute("aria-pressed","false")
if(s!=null)s.textContent="Sound off"
return}q=r.ay
t=q==null?r.ay=A.b(new t.AudioContext()):q
A.b(t.resume())
r.ch=!0
p.setAttribute("aria-pressed","true")
if(s!=null)s.textContent="Sound on"},
$S:0};(function aliases(){var t=J.F.prototype
t.X=t.h})();(function installTearOffs(){var t=hunkHelpers._instance_1u
t(A.aS.prototype,"gO","a4",6)})();(function inheritance(){var t=hunkHelpers.mixin,s=hunkHelpers.inherit,r=hunkHelpers.inheritMany
s(A.q,null)
r(A.q,[A.bD,J.az,A.af,J.av,A.b1,A.c,A.V,A.r,A.D,A.aD,A.bg,A.y,A.aX,A.bi,A.i,A.b3,A.J,A.bb,A.bh,A.b6,A.aT,A.aO,A.K,A.aS])
r(J.az,[J.aB,J.a4,J.a7,J.a6,J.a8,J.a5,J.U])
r(J.a7,[J.F,J.l,A.W,A.ac])
r(J.F,[J.aP,J.ag,J.E])
s(J.aA,A.af)
s(J.b5,J.l)
r(J.a5,[J.a3,J.aC])
r(A.b1,[A.aE,A.b8,A.be,A.b_,A.bc,A.S,A.aW,A.bd,A.b0])
s(A.a2,A.c)
s(A.I,A.a2)
s(A.a9,A.I)
r(A.D,[A.ax,A.aV,A.bp,A.br,A.bz,A.bm,A.bB,A.b9,A.ba,A.bt,A.bu,A.bv,A.bw])
r(A.aV,[A.aU,A.a1])
r(A.ax,[A.bq,A.bx])
r(A.ac,[A.aF,A.X])
r(A.X,[A.ah,A.aj])
s(A.ai,A.ah)
s(A.aa,A.ai)
s(A.ak,A.aj)
s(A.ab,A.ak)
r(A.aa,[A.aG,A.aH])
r(A.ab,[A.aI,A.aJ,A.aK,A.aL,A.aM,A.ad,A.aN])
s(A.aY,A.be)
r(A.S,[A.aR,A.b4])
t(A.ah,A.i)
t(A.ai,A.r)
t(A.aj,A.i)
t(A.ak,A.r)})()
var v={G:typeof self!="undefined"?self:globalThis,typeUniverse:{eC:new Map(),tR:{},eT:{},tPV:{},sEA:[]},mangledGlobalNames:{a:"int",h:"double",v:"num",m:"String",O:"bool",J:"Null",f:"List",q:"Object",eo:"Map",j:"JSObject"},mangledNames:{},types:["J(j)","a(a)","@(@)","@(@,m)","@(m)","m(m)","~(v)","m(a)","O(K)","~(v,v)"],interceptorsByTag:null,leafTags:null,arrayRti:Symbol("$ti")}
A.dx(v.typeUniverse,JSON.parse('{"aP":"F","ag":"F","E":"F","ep":"W","aB":{"O":[],"e":[]},"a4":{"e":[]},"a7":{"j":[]},"F":{"j":[]},"l":{"f":["1"],"j":[],"c":["1"]},"aA":{"af":[]},"b5":{"l":["1"],"f":["1"],"j":[],"c":["1"]},"a5":{"h":[],"v":[]},"a3":{"h":[],"a":[],"v":[],"e":[]},"aC":{"h":[],"v":[],"e":[]},"U":{"m":[],"b7":[],"e":[]},"a2":{"c":["1"]},"I":{"c":["1"]},"a9":{"I":["2"],"c":["2"],"I.E":"2"},"D":{"T":[]},"ax":{"T":[]},"aV":{"T":[]},"aU":{"T":[]},"a1":{"T":[]},"aD":{"db":[],"b7":[]},"W":{"j":[],"e":[]},"ac":{"j":[]},"aF":{"j":[],"e":[]},"X":{"t":["1"],"j":[]},"aa":{"i":["h"],"f":["h"],"t":["h"],"j":[],"c":["h"],"r":["h"]},"ab":{"i":["a"],"f":["a"],"t":["a"],"j":[],"c":["a"],"r":["a"]},"aG":{"i":["h"],"f":["h"],"t":["h"],"j":[],"c":["h"],"r":["h"],"e":[],"i.E":"h"},"aH":{"i":["h"],"f":["h"],"t":["h"],"j":[],"c":["h"],"r":["h"],"e":[],"i.E":"h"},"aI":{"i":["a"],"f":["a"],"t":["a"],"j":[],"c":["a"],"r":["a"],"e":[],"i.E":"a"},"aJ":{"i":["a"],"f":["a"],"t":["a"],"j":[],"c":["a"],"r":["a"],"e":[],"i.E":"a"},"aK":{"i":["a"],"f":["a"],"t":["a"],"j":[],"c":["a"],"r":["a"],"e":[],"i.E":"a"},"aL":{"i":["a"],"f":["a"],"t":["a"],"j":[],"c":["a"],"r":["a"],"e":[],"i.E":"a"},"aM":{"i":["a"],"f":["a"],"t":["a"],"j":[],"c":["a"],"r":["a"],"e":[],"i.E":"a"},"ad":{"i":["a"],"f":["a"],"t":["a"],"j":[],"c":["a"],"r":["a"],"e":[],"i.E":"a"},"aN":{"i":["a"],"f":["a"],"t":["a"],"j":[],"c":["a"],"r":["a"],"e":[],"i.E":"a"},"h":{"v":[]},"a":{"v":[]},"m":{"b7":[]},"cX":{"f":["a"],"c":["a"]},"dh":{"f":["a"],"c":["a"]},"dg":{"f":["a"],"c":["a"]},"cV":{"f":["a"],"c":["a"]},"de":{"f":["a"],"c":["a"]},"cW":{"f":["a"],"c":["a"]},"df":{"f":["a"],"c":["a"]},"cT":{"f":["h"],"c":["h"]},"cU":{"f":["h"],"c":["h"]}}'))
A.dw(v.typeUniverse,JSON.parse('{"a2":1,"X":1}'))
var u=(function rtii(){var t=A.bL
return{Z:t("T"),U:t("c<@>"),j:t("l<aO>"),W:t("l<K>"),q:t("l<aT>"),s:t("l<m>"),n:t("l<h>"),b:t("l<@>"),t:t("l<a>"),T:t("a4"),m:t("j"),g:t("E"),p:t("t<@>"),a:t("f<m>"),_:t("f<@>"),L:t("f<a>"),e:t("a9<m,m>"),P:t("J"),K:t("q"),J:t("eq"),x:t("K"),N:t("m"),C:t("m(m)"),R:t("e"),o:t("ag"),y:t("O"),i:t("h"),S:t("a"),O:t("bY<J>?"),z:t("j?"),X:t("q?"),v:t("m?"),u:t("O?"),I:t("h?"),w:t("a?"),A:t("v?"),H:t("v")}})();(function constants(){var t=hunkHelpers.makeConstList
B.p=J.az.prototype
B.c=J.l.prototype
B.b=J.a3.prototype
B.a=J.a5.prototype
B.d=J.U.prototype
B.q=J.E.prototype
B.r=J.a7.prototype
B.i=J.aP.prototype
B.e=J.ag.prototype
B.h=function getTagFallback(o) {
  var s = Object.prototype.toString.call(o);
  return s.substring(8, s.length - 1);
}
B.j=function() {
  var toStringFunction = Object.prototype.toString;
  function getTag(o) {
    var s = toStringFunction.call(o);
    return s.substring(8, s.length - 1);
  }
  function getUnknownTag(object, tag) {
    if (/^HTML[A-Z].*Element$/.test(tag)) {
      var name = toStringFunction.call(object);
      if (name == "[object Object]") return null;
      return "HTMLElement";
    }
  }
  function getUnknownTagGenericBrowser(object, tag) {
    if (object instanceof HTMLElement) return "HTMLElement";
    return getUnknownTag(object, tag);
  }
  function prototypeForTag(tag) {
    if (typeof window == "undefined") return null;
    if (typeof window[tag] == "undefined") return null;
    var constructor = window[tag];
    if (typeof constructor != "function") return null;
    return constructor.prototype;
  }
  function discriminator(tag) { return null; }
  var isBrowser = typeof HTMLElement == "function";
  return {
    getTag: getTag,
    getUnknownTag: isBrowser ? getUnknownTagGenericBrowser : getUnknownTag,
    prototypeForTag: prototypeForTag,
    discriminator: discriminator };
}
B.o=function(getTagFallback) {
  return function(hooks) {
    if (typeof navigator != "object") return hooks;
    var userAgent = navigator.userAgent;
    if (typeof userAgent != "string") return hooks;
    if (userAgent.indexOf("DumpRenderTree") >= 0) return hooks;
    if (userAgent.indexOf("Chrome") >= 0) {
      function confirm(p) {
        return typeof window == "object" && window[p] && window[p].name == p;
      }
      if (confirm("Window") && confirm("HTMLElement")) return hooks;
    }
    hooks.getTag = getTagFallback;
  };
}
B.k=function(hooks) {
  if (typeof dartExperimentalFixupGetTag != "function") return hooks;
  hooks.getTag = dartExperimentalFixupGetTag(hooks.getTag);
}
B.n=function(hooks) {
  if (typeof navigator != "object") return hooks;
  var userAgent = navigator.userAgent;
  if (typeof userAgent != "string") return hooks;
  if (userAgent.indexOf("Firefox") == -1) return hooks;
  var getTag = hooks.getTag;
  var quickMap = {
    "BeforeUnloadEvent": "Event",
    "DataTransfer": "Clipboard",
    "GeoGeolocation": "Geolocation",
    "Location": "!Location",
    "WorkerMessageEvent": "MessageEvent",
    "XMLDocument": "!Document"};
  function getTagFirefox(o) {
    var tag = getTag(o);
    return quickMap[tag] || tag;
  }
  hooks.getTag = getTagFirefox;
}
B.m=function(hooks) {
  if (typeof navigator != "object") return hooks;
  var userAgent = navigator.userAgent;
  if (typeof userAgent != "string") return hooks;
  if (userAgent.indexOf("Trident/") == -1) return hooks;
  var getTag = hooks.getTag;
  var quickMap = {
    "BeforeUnloadEvent": "Event",
    "DataTransfer": "Clipboard",
    "HTMLDDElement": "HTMLElement",
    "HTMLDTElement": "HTMLElement",
    "HTMLPhraseElement": "HTMLElement",
    "Position": "Geoposition"
  };
  function getTagIE(o) {
    var tag = getTag(o);
    var newTag = quickMap[tag];
    if (newTag) return newTag;
    if (tag == "Object") {
      if (window.DataView && (o instanceof window.DataView)) return "DataView";
    }
    return tag;
  }
  function prototypeForTagIE(tag) {
    var constructor = window[tag];
    if (constructor == null) return null;
    return constructor.prototype;
  }
  hooks.getTag = getTagIE;
  hooks.prototypeForTag = prototypeForTagIE;
}
B.l=function(hooks) {
  var getTag = hooks.getTag;
  var prototypeForTag = hooks.prototypeForTag;
  function getTagFixed(o) {
    var tag = getTag(o);
    if (tag == "Document") {
      if (!!o.xmlVersion) return "!Document";
      return "!HTMLDocument";
    }
    return tag;
  }
  function prototypeForTagFixed(tag) {
    if (tag == "Document") return null;
    return prototypeForTag(tag);
  }
  hooks.getTag = getTagFixed;
  hooks.prototypeForTag = prototypeForTagFixed;
}
B.f=function(hooks) { return hooks; }

B.t=t([0,0.004,-0.007],u.n)
B.u=t([196,220,261.63,293.66,329.63,392,440],u.n)
B.v=A.A("ek")
B.w=A.A("el")
B.x=A.A("cT")
B.y=A.A("cU")
B.z=A.A("cV")
B.A=A.A("cW")
B.B=A.A("cX")
B.C=A.A("de")
B.D=A.A("df")
B.E=A.A("dg")
B.F=A.A("dh")})();(function staticFields(){$.bf=null
$.B=A.x([],A.bL("l<q>"))
$.bU=null
$.bT=null
$.cz=null
$.ct=null
$.cD=null
$.bn=null
$.bs=null
$.bN=null})();(function lazyInitializers(){var t=hunkHelpers.lazyFinal
t($,"en","cH",()=>A.bo("_$dart_dartClosure"))
t($,"em","bQ",()=>A.bo("_$dart_dartClosure_dartJSInterop"))
t($,"er","cI",()=>A.x([new J.aA()],A.bL("l<af>")))
t($,"et","at",()=>{var s=new A.bh()
s.Y(20261107)
return s})})();(function nativeSupport(){!function(){var t=function(a){var n={}
n[a]=1
return Object.keys(hunkHelpers.convertToFastObject(n))[0]}
v.getIsolateTag=function(a){return t("___dart_"+a+v.isolateTag)}
var s="___dart_isolate_tags_"
var r=Object[s]||(Object[s]=Object.create(null))
var q="_ZxYxX"
for(var p=0;;p++){var o=t(q+"_"+p+"_")
if(!(o in r)){r[o]=1
v.isolateTag=o
break}}v.dispatchPropertyName=v.getIsolateTag("dispatch_record")}()
hunkHelpers.setOrUpdateInterceptorsByTag({ArrayBuffer:A.W,SharedArrayBuffer:A.W,ArrayBufferView:A.ac,DataView:A.aF,Float32Array:A.aG,Float64Array:A.aH,Int16Array:A.aI,Int32Array:A.aJ,Int8Array:A.aK,Uint16Array:A.aL,Uint32Array:A.aM,Uint8ClampedArray:A.ad,CanvasPixelArray:A.ad,Uint8Array:A.aN})
hunkHelpers.setOrUpdateLeafTags({ArrayBuffer:true,SharedArrayBuffer:true,ArrayBufferView:false,DataView:true,Float32Array:true,Float64Array:true,Int16Array:true,Int32Array:true,Int8Array:true,Uint16Array:true,Uint32Array:true,Uint8ClampedArray:true,CanvasPixelArray:true,Uint8Array:false})
A.X.$nativeSuperclassTag="ArrayBufferView"
A.ah.$nativeSuperclassTag="ArrayBufferView"
A.ai.$nativeSuperclassTag="ArrayBufferView"
A.aa.$nativeSuperclassTag="ArrayBufferView"
A.aj.$nativeSuperclassTag="ArrayBufferView"
A.ak.$nativeSuperclassTag="ArrayBufferView"
A.ab.$nativeSuperclassTag="ArrayBufferView"})()
Function.prototype.$1=function(a){return this(a)}
Function.prototype.$2=function(a,b){return this(a,b)}
Function.prototype.$0=function(){return this()}
convertAllToFastObject(w)
convertToFastObject($);(function(a){if(typeof document==="undefined"){a(null)
return}if(typeof document.currentScript!="undefined"){a(document.currentScript)
return}var t=document.scripts
function onLoad(b){for(var r=0;r<t.length;++r){t[r].removeEventListener("load",onLoad,false)}a(b.target)}for(var s=0;s<t.length;++s){t[s].addEventListener("load",onLoad,false)}})(function(a){v.currentScript=a
var t=A.ef
if(typeof dartMainRunner==="function"){dartMainRunner(t,[])}else{t([])}})})()
//# sourceMappingURL=main.dart.js.map
