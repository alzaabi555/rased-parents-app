(()=>{
let deferred=null,bar,dialog,btn,closed=false;
const ua=navigator.userAgent,ios=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),chromeIOS=/CriOS/.test(ua);
const standalone=()=>navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;
const native=()=>window.Capacitor?.isNativePlatform?.()===true;
function refresh(){if(!bar)return;bar.hidden=closed||standalone()||native()||!(ios||/Android/.test(ua)||deferred);btn.textContent=deferred?'تثبيت التطبيق':ios?'إضافة راصد إلى الآيفون':'إضافة راصد إلى الهاتف';}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;refresh();});
addEventListener('appinstalled',()=>{closed=true;deferred=null;dialog?.close();refresh();});
matchMedia('(display-mode: standalone)').addEventListener('change',refresh);
function instructions(){dialog.showModal();}
async function install(){if(!deferred)return instructions();const e=deferred;deferred=null;btn.disabled=true;try{await e.prompt();const r=await e.userChoice;if(r.outcome==='accepted')closed=true;}catch{instructions();}finally{btn.disabled=false;refresh();}}
function init(){
const style=document.createElement('style');style.textContent=`#ri-banner[hidden]{display:none!important}#ri-banner{position:fixed;top:calc(12px + env(safe-area-inset-top,0px));left:12px;right:12px;max-width:520px;margin:auto;z-index:10000;background:white;color:#172554;box-shadow:0 6px 30px #0003;border:1px solid #dbeafe;border-radius:16px;padding:14px;direction:rtl;font:15px/1.7 system-ui;display:flex;align-items:center;gap:10px}#ri-banner div{flex:1}#ri-banner p{margin:0 0 8px}#ri-banner img{width:48px;height:48px;border-radius:12px}#ri-banner button,#ri-dialog button{background:#1e3a8a;color:white;border:0;border-radius:10px;padding:9px 13px;font:inherit;cursor:pointer}#ri-banner .ri-close{background:#f1f5f9;color:#172554;align-self:flex-start;padding:3px 9px}#ri-dialog{direction:rtl;font:16px/1.9 system-ui;color:#172554;background:white;border:0;border-radius:18px;padding:24px;width:min(440px,calc(100vw - 64px));max-height:80dvh;overflow:auto}#ri-dialog::backdrop{background:#0008}#ri-dialog h2{font-size:20px}#ri-dialog li{margin-bottom:10px}#ri-dialog p{font-size:14px}`;document.head.append(style);
bar=document.createElement('aside');bar.id='ri-banner';bar.hidden=true;bar.setAttribute('aria-label','إضافة تطبيق راصد');bar.innerHTML='<img alt=""><div><p>أضف راصد إلى شاشة هاتفك للوصول إليه بسهولة.</p><button type="button" data-install></button></div><button type="button" class="ri-close" aria-label="إخفاء">×</button>';
bar.querySelector('img').src=new URL('./icons/icon-192.png',scriptURL).href;btn=bar.querySelector('[data-install]');btn.onclick=install;bar.querySelector('.ri-close').onclick=()=>{closed=true;refresh();};
dialog=document.createElement('dialog');dialog.id='ri-dialog';dialog.setAttribute('aria-labelledby','ri-heading');dialog.innerHTML='<h2 id="ri-heading"></h2><ol></ol><p></p><button type="button">فهمت</button>';
dialog.querySelector('h2').textContent=ios?(chromeIOS?'تثبيت راصد من Chrome على الآيفون':'إضافة راصد إلى الآيفون'):'إضافة راصد إلى الهاتف';
const steps=ios?[chromeIOS?'في Chrome اضغط زر «مشاركة» بجانب شريط العنوان.':'اضغط زر «مشاركة» في متصفحك. يمكنك استخدام Chrome أو Safari.','مرّر خيارات المشاركة واختر «إضافة إلى الشاشة الرئيسية».','أكّد اسم «راصد»، ثم اضغط «إضافة».','افتح راصد من الأيقونة الجديدة على الشاشة الرئيسية.']:['افتح الرابط في Chrome أو متصفح يدعم إضافة التطبيقات، خارج متصفح واتساب أو تطبيقات التواصل.','افتح قائمة المتصفح، ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية» إن ظهر الخيار.','أكّد الإضافة، ثم افتح راصد من الشاشة الرئيسية.'];
for(const text of steps){const li=document.createElement('li');li.textContent=text;dialog.querySelector('ol').append(li);}
dialog.querySelector('p').textContent=ios?'إذا كنت داخل متصفح تطبيق آخر ولا يظهر خيار الإضافة، افتح الرابط في Chrome أو Safari. الإضافة النهائية تتم من قائمة المتصفح؛ هذا الزر لا يتجاوز تأكيد النظام.':'إذا لم يظهر خيار التثبيت، فقد لا يكون الطلب متاحًا حاليًا في هذا المتصفح.';
dialog.querySelector('button').onclick=()=>dialog.close();document.body.append(bar,dialog);refresh();
}
const scriptURL=document.currentScript.src;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();