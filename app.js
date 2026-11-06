import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Jaza taarifa za Firebase Console > Project settings > Your apps > Web app.
const firebaseConfig = {
  apiKey: "WEKA_FIREBASE_API_KEY",
  authDomain: "WEKA_PROJECT_ID.firebaseapp.com",
  projectId: "WEKA_PROJECT_ID",
  appId: "WEKA_APP_ID"
};
const firebaseReady = Object.values(firebaseConfig).every(v => v && !v.startsWith('WEKA_'));
let firebaseAuth = null;
if (firebaseReady) {
  const firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
}
const seed=[
 {title:'DJ Afro Movie HD',type:'afro',price:1000,desc:'Movie kutoka mkusanyiko wa DJ Afro.'},
 {title:'Regular Movie',type:'movie',price:1000,desc:'Movie ya kawaida.'},
 {title:'Series · Season 1 (Episodes 1–10)',type:'series',price:3000,desc:'Kifurushi kimoja kinajumuisha episodes zote 1–10.'},
 {title:'Trailer mpya inakuja',type:'coming',price:0,desc:'Trailer ya kutazama bure kabla ya movie kutoka.'}
];
let items=[];
let current=null,slide=0,sliderTimer=null,authMode='register',signedIn=false;
const heroSlides=()=>items.filter(x=>x.type!=='coming');
const hero=document.getElementById('hero');
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function loadItems(){try{const r=await fetch('/api/movies');if(!r.ok)throw new Error('API');items=await r.json();}catch(e){items=[];console.error('Movie API:',e);}}
function paintHero(){const slides=heroSlides();if(!slides.length){document.getElementById('heroTitle').textContent='Jboy Movie Store TZ';document.getElementById('heroPrice').textContent='Karibu';document.getElementById('dots').innerHTML='';return;}slide=((slide%slides.length)+slides.length)%slides.length;const item=slides[slide];document.getElementById('heroTitle').textContent=item.title;document.getElementById('heroPrice').textContent=`TSH ${Number(item.offerPrice||item.price||0).toLocaleString()}`;document.getElementById('heroBuy').textContent='▶ Nunua Sasa';hero.dataset.item=encodeURIComponent(item.title);hero.style.setProperty('--slide-hue',`${(slide*67+345)%360}`);document.getElementById('dots').innerHTML=slides.map((_,i)=>`<i data-slide="${i}" class="${i===slide?'active':''}" aria-label="Slide ${i+1}"></i>`).join('');document.querySelectorAll('#dots i').forEach(dot=>dot.addEventListener('click',()=>{slide=Number(dot.dataset.slide);paintHero();restartSlider();}));}
function restartSlider(){clearInterval(sliderTimer);sliderTimer=setInterval(()=>{const n=heroSlides().length;if(n>1){slide=(slide+1)%n;paintHero();}},5000);}
function card(x){return `<article class="card"><div class="poster">${x.poster?`<img class="poster-image" src="${esc(x.poster)}" alt="${esc(x.title)}">`:''}<span class="pill">${x.type==='series'?'SERIES':x.type==='coming'?'COMING SOON':'MOVIE'}</span>${x.type!=='coming'?'<span class="pill feature">FEATURED</span>':''}${x.type==='coming'?'<span class="price">FREE</span>':''}</div><h3>${esc(x.title)}</h3><p>${x.type==='series'?'Series · Kifurushi':x.type==='coming'?'Trailer · Bure':x.type==='afro'?'DJ Afro Movie HD':'Movie'}</p>${x.type!=='coming'?`<p class="movie-price">${x.offerPrice?`<s>TSH ${Number(x.price).toLocaleString()}</s> · `:''}TSH ${Number(x.offerPrice||x.price).toLocaleString()}</p>`:''}<button onclick="openItem('${encodeURIComponent(x.title)}')">${x.type==='coming'?'▶ Tazama Trailer':'▶ Nunua Sasa'}</button></article>`;}
function render(){for(const [type,id] of [['series','seriesGrid'],['afro','afroGrid'],['movie','movieGrid'],['coming','comingGrid']])document.getElementById(id).innerHTML=items.filter(x=>x.type===type).map(card).join('')||'<p style="color:#777">Hakuna yaliyowekwa bado.</p>';const trailers=items.filter(x=>x.trailer);document.getElementById('trailerGrid').innerHTML=trailers.map(x=>`<article class="card"><div class="poster">${x.poster?`<img class="poster-image" src="${esc(x.poster)}" alt="${esc(x.title)}">`:''}<span class="pill">TRAILER</span></div><h3>${esc(x.title)}</h3><p>Trailer rasmi · Tazama bure</p><button onclick="watchTrailer('${encodeURIComponent(x.title)}')">▶ Tazama Trailer</button></article>`).join('')||'<p style="color:#777">Bado hakuna trailer zilizowekwa.</p>';paintHero();const sel=document.getElementById('offerMovie');if(sel)sel.innerHTML=items.filter(x=>x.type!=='coming').map(x=>`<option value="${esc(x.title)}">${esc(x.title)}</option>`).join('');}
function showMovie(x, trailerOnly=false){current=x;document.getElementById('detailTitle').textContent=x.title;document.getElementById('detailDesc').textContent=x.desc||'';const src=trailerOnly?(x.trailer||''):(x.trailer||x.video||'');document.getElementById('trailer').innerHTML=src?`<video controls playsinline style="width:100%;height:100%;max-height:420px;object-fit:contain;border-radius:14px;background:#000" src="${esc(src)}"></video>`:'TRAILER BADO HAIJAWEKWA';document.getElementById('paymentInfo').style.display=trailerOnly||x.type==='coming'?'none':'block';document.getElementById('detailPrice').textContent='TSH '+Number(x.offerPrice||x.price||0).toLocaleString();document.getElementById('detail').classList.add('show');}
window.openItem=(t)=>{if(!requireLogin())return;const x=items.find(i=>i.title===decodeURIComponent(t));if(x)showMovie(x,false);};
window.watchTrailer=(t)=>{const x=items.find(i=>i.title===decodeURIComponent(t));if(x)showMovie(x,true);};
function requireLogin(){if(signedIn)return true;document.getElementById('auth').classList.add('show');return false;}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).classList.remove('show'));
document.getElementById('heroBuy').onclick=()=>{const t=hero.dataset.item;if(t)openItem(t);};
document.getElementById('prev').onclick=()=>{const n=heroSlides().length;if(n){slide=(slide+n-1)%n;paintHero();restartSlider();}};
document.getElementById('next').onclick=()=>{const n=heroSlides().length;if(n){slide=(slide+1)%n;paintHero();restartSlider();}};
// Admin is hidden inside the center of the Jboy brand/logo area.
document.getElementById('brandSecret').addEventListener('click',()=>document.getElementById('adminLock').classList.add('show'));document.getElementById('adminOpen').addEventListener('click',()=>document.getElementById('adminLock').classList.add('show'));document.getElementById('adminLogout').addEventListener('click',async()=>{await fetch('/api/admin/logout',{method:'POST'});document.getElementById('admin').classList.remove('show');});
document.getElementById('unlockAdmin').onclick=async()=>{const btn=document.getElementById('unlockAdmin');btn.disabled=true;try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.getElementById('adminPassword').value})});if(!r.ok)throw new Error('Password si sahihi.');document.getElementById('adminLock').classList.remove('show');document.getElementById('admin').classList.add('show');document.getElementById('lockMsg').textContent='';refreshAdminLists();}catch(e){document.getElementById('lockMsg').textContent=e.message;}finally{btn.disabled=false;}};
document.getElementById('addItem').onclick=async()=>{const title=document.getElementById('newTitle').value.trim();if(!title){document.getElementById('adminMsg').textContent='Weka jina kwanza.';return;}const poster=document.getElementById('newPoster').files[0],video=document.getElementById('newMovieFile').files[0],trailer=document.getElementById('newTrailerFile').files[0],trailerUrl=document.getElementById('newTrailerUrl').value.trim();if(!poster){document.getElementById('adminMsg').textContent='Chagua picha ya cover.';return;}const fd=new FormData();fd.append('title',title);fd.append('type',document.getElementById('newType').value);fd.append('price',document.getElementById('newPrice').value||'0');fd.append('desc',document.getElementById('newDesc').value||'');fd.append('poster',poster);if(video)fd.append('video',video);if(trailer)fd.append('trailer',trailer);if(trailerUrl)fd.append('trailerUrl',trailerUrl);const btn=document.getElementById('addItem');btn.disabled=true;document.getElementById('adminMsg').textContent='Inapakia movie na trailer...';try{const r=await fetch('/api/movies',{method:'POST',body:fd});const data=await r.json();if(!r.ok)throw new Error(data.error||'Imeshindikana kupakia.');await loadItems();slide=0;render();restartSlider();document.getElementById('adminMsg').textContent='Movie na trailer zimehifadhiwa Cloudflare. Wageni wote wataziona.';['newTitle','newPrice','newDesc','newTrailerUrl'].forEach(id=>document.getElementById(id).value='');['newPoster','newMovieFile','newTrailerFile'].forEach(id=>document.getElementById(id).value='');refreshAdminLists();}catch(e){document.getElementById('adminMsg').textContent=e.message;}finally{btn.disabled=false;}};
document.getElementById('submitPayment').onclick=()=>{const phone=document.querySelector('#paymentInfo input[placeholder="07XXXXXXXX"]').value.trim(),tx=document.querySelector('#paymentInfo input[placeholder="Transaction ID"]').value.trim();if(!phone||!tx){document.getElementById('paymentMsg').textContent='Jaza namba ya simu na namba ya muamala.';return;}const req=JSON.parse(localStorage.getItem('jboyPayments')||'[]');req.push({movie:current?.title,phone,transaction:tx,date:new Date().toLocaleString()});localStorage.setItem('jboyPayments',JSON.stringify(req));document.getElementById('paymentMsg').textContent='Ombi limehifadhiwa kwenye demo. Subiri uthibitisho wa admin.';};
document.getElementById('requestOffer').onclick=()=>{const phone=document.getElementById('offerPhone').value.trim();if(!/^0\d{9}$/.test(phone)){document.getElementById('offerMsg').textContent='Weka namba sahihi ya simu yenye tarakimu 10.';return;}const req=JSON.parse(localStorage.getItem('jboyOffers')||'[]');req.push({movie:current?.title,phone,date:new Date().toLocaleString()});localStorage.setItem('jboyOffers',JSON.stringify(req));document.getElementById('offerMsg').textContent='Ombi lako la ofa limetumwa kwa admin (kwenye demo hii).';};
function refreshAdminLists(){const offers=JSON.parse(localStorage.getItem('jboyOffers')||'[]');document.getElementById('offerRequests').innerHTML=offers.length?offers.map((x,i)=>`<p>${i+1}. ${esc(x.movie)} · ${esc(x.phone)} · ${esc(x.date)}</p>`).join(''):'Hakuna maombi bado.';const links=JSON.parse(localStorage.getItem('jboyLinksComments')||'[]');document.getElementById('linkCommentList').innerHTML=links.map(x=>`<p>${esc(x.link)} — ${esc(x.comment)}</p>`).join('');const box=document.getElementById('adminMovieList');if(box)box.innerHTML=items.length?items.map(x=>`<div class="admin-movie-row"><span>${esc(x.title)} ${x.trailer?'· Trailer ipo':''}</span><button onclick="deleteMovie('${esc(x.id)}')">FUTA</button></div>`).join(''):'Hakuna movie bado.';}
window.deleteMovie=async(id)=>{if(!confirm('Una uhakika unataka kufuta movie hii pamoja na cover na trailer?'))return;try{const r=await fetch('/api/movies?id='+encodeURIComponent(id),{method:'DELETE'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Imeshindikana kufuta.');await loadItems();render();refreshAdminLists();document.getElementById('adminMsg').textContent='Movie, cover na trailer vimefutwa kwenye website.';}catch(e){document.getElementById('adminMsg').textContent=e.message;}};
document.getElementById('saveOffer').onclick=()=>{const title=document.getElementById('offerMovie').value,price=Number(document.getElementById('offerPrice').value);const x=items.find(i=>i.title===title);if(!x||!price){document.getElementById('offerAdminMsg').textContent='Chagua movie na weka bei ya ofa.';return;}x.offerPrice=price;render();document.getElementById('offerAdminMsg').textContent='OFA imewekwa kwenye movie.';};
document.getElementById('saveLinkComment').onclick=()=>{const link=document.getElementById('adminLink').value.trim(),comment=document.getElementById('adminComment').value.trim();const a=JSON.parse(localStorage.getItem('jboyLinksComments')||'[]');a.push({link,comment});localStorage.setItem('jboyLinksComments',JSON.stringify(a));refreshAdminLists();};
document.getElementById('search').oninput=e=>{let q=e.target.value.toLowerCase();document.querySelectorAll('.card').forEach(c=>c.style.display=c.innerText.toLowerCase().includes(q)?'':'none');};
document.getElementById('showRegister').onclick=()=>{authMode='register';document.getElementById('authSubmit').textContent='Jisajili';};document.getElementById('showLogin').onclick=()=>{authMode='login';document.getElementById('authSubmit').textContent='Ingia';};
function showAuthError(error) {
  const messages = {
    'auth/email-already-in-use':'Gmail hii tayari imesajiliwa. Chagua Ingia.',
    'auth/invalid-email':'Gmail uliyoandika si sahihi.',
    'auth/weak-password':'Password iwe na angalau herufi 6.',
    'auth/invalid-credential':'Gmail au password si sahihi.',
    'auth/popup-closed-by-user':'Dirisha la Google limefungwa kabla ya kuingia.',
    'auth/unauthorized-domain':'Domain ya website haijaongezwa kwenye Firebase Authorized domains.',
    'auth/operation-not-allowed':'Washa Email/Password na Google kwenye Firebase Authentication.'
  };
  document.getElementById('authMsg').textContent = messages[error.code] || (error.message || 'Imeshindikana kuingia. Angalia mipangilio ya Firebase.');
}
function finishLogin(user) {
  signedIn = !!user;
  if (user) {
    localStorage.setItem('jboyUser', user.email || user.uid);
    document.getElementById('auth').classList.remove('show');
    document.getElementById('authMsg').textContent='';
  } else {
    localStorage.removeItem('jboyUser');
  }
}
document.getElementById('authSubmit').onclick=async()=>{
  const email=document.getElementById('authEmail').value.trim().toLowerCase();
  const pw=document.getElementById('authPassword').value;
  if(!/^\S+@gmail\.com$/.test(email)||pw.length<6){document.getElementById('authMsg').textContent='Weka Gmail sahihi na password yenye angalau herufi 6.';return;}
  if(!firebaseAuth){document.getElementById('authMsg').textContent='Firebase bado haijaunganishwa. Weka Firebase Web Config ndani ya app.js, kisha deploy upya.';return;}
  const btn=document.getElementById('authSubmit');btn.disabled=true;
  try {
    const result = authMode==='register'
      ? await createUserWithEmailAndPassword(firebaseAuth,email,pw)
      : await signInWithEmailAndPassword(firebaseAuth,email,pw);
    finishLogin(result.user);
  } catch(error) { showAuthError(error); }
  finally { btn.disabled=false; }
};
document.getElementById('googleSignIn').onclick=async()=>{
  if(!firebaseAuth){document.getElementById('authMsg').textContent='Firebase bado haijaunganishwa. Weka Firebase Web Config ndani ya app.js, kisha deploy upya.';return;}
  const btn=document.getElementById('googleSignIn');btn.disabled=true;
  try {
    const provider=new GoogleAuthProvider();
    provider.setCustomParameters({prompt:'select_account'});
    const result=await signInWithPopup(firebaseAuth,provider);
    finishLogin(result.user);
  } catch(error) { showAuthError(error); }
  finally { btn.disabled=false; }
};
if(firebaseAuth){onAuthStateChanged(firebaseAuth,user=>finishLogin(user));}
else {document.getElementById('authMsg').textContent='Tovuti inahitaji Firebase Web Config kabla ya usajili na Google Sign-In kufanya kazi.';}
document.getElementById('year').textContent=new Date().getFullYear();await loadItems();render();restartSlider();document.getElementById('auth').classList.add('show');
