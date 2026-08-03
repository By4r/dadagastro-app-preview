(function(){
  var screen=document.getElementById('screen'), toast=document.getElementById('toast'), tmr;
  function say(m){ toast.textContent=m; toast.classList.add('show'); clearTimeout(tmr); tmr=setTimeout(function(){toast.classList.remove('show')},2200); }
  var V={home:'vHome',list:'vList',health:'vHealth',account:'vAccount',detail:'vDetail',wizard:'vWizard',cook:'vCook'};
  function el(id){ return document.getElementById(id); }
  var curRoot='vHome', stack=[];

  /* ---- üst bar / durum çubuğu senkronu ---- */
  function bindBar(view){
    var bar=view.querySelector('.vbar.overlay'); if(!bar) return;
    var hero=view.querySelector('.hero,.rd-hero');
    function s(){
      var solid = view.scrollTop > 4;   /* KURAL: kaydırma başlar başlamaz solid */
      bar.classList.toggle('solid', solid);
      if(view.classList.contains('on')) screen.classList.toggle('dark-status', !solid), screen.classList.toggle('light-status', solid);
    }
    view.addEventListener('scroll',s); bar._sync=s; s();
  }
  document.querySelectorAll('.view').forEach(bindBar);
  function syncStatus(){
    var top = stack.length ? el(stack[stack.length-1]) : el(curRoot);
    var bar = top.querySelector('.vbar.overlay');
    if(top.id==='vCook'){ screen.classList.add('dark-status'); screen.classList.remove('light-status'); return; }
    if(bar){ bar._sync && bar._sync(); }
    else { screen.classList.add('light-status'); screen.classList.remove('dark-status'); }
  }

  /* ---- kök sekmeler ---- */
  function goRoot(id){
    if(id===curRoot){ el(id).scrollTo({top:0,behavior:'smooth'}); return; }
    el(curRoot).classList.remove('on'); el(id).classList.add('on'); curRoot=id;
    document.querySelectorAll('.tab[data-root]').forEach(function(t){ t.classList.toggle('on', t.dataset.root===id); });
    syncStatus();
  }
  document.querySelectorAll('.tab[data-root]').forEach(function(t){
    t.addEventListener('click',function(){ goRoot(t.dataset.root); });
  });
  document.querySelectorAll('[data-go]').forEach(function(a){
    a.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); goRoot(V[a.dataset.go]); });
  });

  /* ---- itilen ekran ---- */
  function push(id){
    var v=el(id); v.scrollTop=0; v.classList.add('on');
    el(curRoot).classList.add('behind'); screen.classList.add('stacked');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ v.classList.add('in'); }); });
    stack.push(id); screen.classList.add('on-detail'); setTimeout(syncStatus,30);
  }
  function pop(){
    var id=stack.pop(); if(!id) return; var v=el(id);
    v.classList.remove('in'); el(curRoot).classList.remove('behind');
    if(!stack.length) screen.classList.remove('stacked');
    screen.classList.remove('on-detail');
    setTimeout(function(){ v.classList.remove('on'); syncStatus(); },340);
  }
  /* ---- modal (sheet) ---- */
  function openSheet(id){
    var v=el(id); v.scrollTop=0; v.classList.add('on'); screen.classList.add('stacked');
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ v.classList.add('in'); }); });
    stack.push(id);
    if(id==='vCook') screen.classList.add('on-cook');
    if(id==='vWizard') screen.classList.add('on-wizard');
    setTimeout(syncStatus,30);
  }
  function closeSheet(){
    var id=stack.pop(); if(!id) return; var v=el(id);
    v.classList.remove('in');
    screen.classList.remove('on-cook','on-wizard');
    if(stack[stack.length-1]==='vDetail') screen.classList.add('on-detail');
    if(!stack.length){ screen.classList.remove('stacked'); el(curRoot).classList.remove('behind'); }
    setTimeout(function(){ v.classList.remove('on'); syncStatus(); },380);
  }
  document.addEventListener('click',function(e){
    var o=e.target.closest('[data-open]'); if(o){ e.preventDefault(); e.stopPropagation();
      var k=o.dataset.open;
      if(k==='detail') push('vDetail');
      else if(k==='cook'){ if(stack[stack.length-1]==='vCook') return; openSheet('vCook'); ckRender(); }
      else openSheet(V[k]);
      return; }
    var b=e.target.closest('[data-back]'); if(b){ e.preventDefault(); pop(); return; }
    var c=e.target.closest('[data-close]'); if(c){ e.preventDefault(); closeSheet(); return; }
    var s=e.target.closest('[data-say]'); if(s){ e.preventDefault(); say(s.dataset.say); }
  });

  /* ---- ana sayfa etkileşimleri ---- */
  document.querySelectorAll('.mode').forEach(function(m){
    m.addEventListener('click',function(){
      document.querySelectorAll('.mode').forEach(function(x){x.classList.remove('on')}); m.classList.add('on');
      var ph={'Tarif Ara':'Tarif adı ara… (ör. mercimek çorbası)','Malzemeye Göre':'Malzeme ekle… (ör. yumurta, patates)','Ne Pişirsem':'Canın ne çekti? (ör. hafif, pratik)'};
      var i=document.getElementById('q'); if(i) i.placeholder=ph[m.textContent.trim()]||i.placeholder;
    });
  });
  document.querySelectorAll('.poprail .chip').forEach(function(c){
    c.addEventListener('click',function(){ var i=document.getElementById('q'); if(i) i.value=c.textContent.trim(); goRoot('vList'); });
  });
  document.querySelectorAll('.follow').forEach(function(b){
    b.addEventListener('click',function(e){ e.stopPropagation(); b.classList.toggle('on'); b.textContent=b.classList.contains('on')?'✓ Takiptesin':'+ Takip Et'; });
  });
  function saveSync(on){
    document.querySelectorAll('.save,.icobtn.save').forEach(function(x){
      x.classList.toggle('on',on); x.innerHTML = on ? '<i class="fs i-heart"></i>' : '<i class="fr i-heart"></i>';
    });
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest('.save,.icobtn.save'); if(!b) return;
    e.preventDefault(); e.stopPropagation();
    var on=!b.classList.contains('on');
    if(b.closest('#vDetail')||b.closest('.actionbar')) saveSync(on);
    else { b.classList.toggle('on',on); b.innerHTML = on ? '<i class="fs i-heart"></i>' : '<i class="fr i-heart"></i>'; }
    say(on?'Tarif defterine kaydedildi':'Kayıt kaldırıldı');
  },true);

  /* ---- tarif detay ---- */
  document.querySelectorAll('.rdtab').forEach(function(t){
    t.addEventListener('click',function(){
      document.querySelectorAll('.rdtab').forEach(function(x){x.classList.remove('on')});
      document.querySelectorAll('.pane').forEach(function(x){x.classList.remove('on')});
      t.classList.add('on'); el(t.dataset.pane).classList.add('on');
    });
  });
  var portion=4;
  function fmt(n){ n=Math.round(n*2)/2; return (n%1===0)?String(n):String(n).replace('.',','); }
  function applyPortion(){
    el('pVal').textContent=portion; el('kfPortion').textContent=portion+' kişilik';
    document.querySelectorAll('#vDetail .ig b i[data-base]').forEach(function(x){ x.textContent=fmt(parseFloat(x.dataset.base)/4*portion); });
  }
  el('pPlus').addEventListener('click',function(){ if(portion<12){portion++;applyPortion();} });
  el('pMinus').addEventListener('click',function(){ if(portion>1){portion--;applyPortion();} });
  document.querySelectorAll('.ig').forEach(function(r){
    r.addEventListener('click',function(){ r.classList.toggle('done');
      var n=document.querySelectorAll('#vDetail .ig.done').length; if(el('igCount')) el('igCount').textContent=n; });
  });
  document.querySelectorAll('.step .did').forEach(function(d){
    d.addEventListener('click',function(){ var c=d.closest('.step'); c.classList.toggle('done');
      d.lastChild.textContent = c.classList.contains('done') ? ' Yapıldı' : ' Yaptım'; });
  });

  /* ---- Ne Pişirsem sihirbazı ---- */
  var wzN=0;
  document.querySelectorAll('.itile').forEach(function(t){
    t.addEventListener('click',function(){
      t.classList.toggle('on'); wzN=document.querySelectorAll('.itile.on').length;
      el('wzTxt').textContent = wzN>=3 ? (wzN+' malzemeyle tarif bul') : ('Malzeme seç ('+wzN+'/3)');
    });
  });
  el('wzReset').addEventListener('click',function(){
    document.querySelectorAll('.itile.on').forEach(function(x){x.classList.remove('on')});
    wzN=0; el('wzTxt').textContent='Malzeme seç (0/3)';
  });
  el('wzGo').addEventListener('click',function(){
    if(wzN<3){ say('En az 3 malzeme seç'); return; }
    closeSheet(); setTimeout(function(){ goRoot('vList'); say(wzN+' malzemeye uygun 24 tarif bulundu'); },400);
  });

  /* ---- PİŞİRME MODU ---- */
  var STEPS=[{"t": "Hamuru yoğur ve dinlendir", "p": "Unu geniş bir kaba ele, ortasını havuz gibi aç. Yumurta, tuz ve suyu ekleyip <b>kulak memesi yumuşaklığında</b> bir hamur yoğur. Üzerini nemli bezle örtüp 10 dakika dinlendir — dinlenen hamur açılırken yırtılmaz.", "img": "assets/img/1561.webp", "min": 15}, {"t": "İç harcı hazırla", "p": "Kıymayı rendelenmiş soğan, tuz ve karabiberle karıştır. <b>Harcı çok yoğurma</b>; gevşek harç pişerken daha sulu ve lokum gibi kalır.", "img": "", "min": 5}, {"t": "Hamuru aç, kareler kes", "p": "Hamuru ikiye böl, unlanmış tezgâhta her parçayı <b>2 mm incelikte</b> aç. Keskin bıçak ya da rulet ile 3×3 cm kareler kes. Kareler kurumasın diye üzerini bezle ört.", "img": "assets/img/1749.webp", "min": 20}, {"t": "Mantıları doldur ve kapat", "p": "Her karenin ortasına <b>nohut büyüklüğünde</b> harç koy. Dört ucu birleştirip bohça gibi sıkıca kapat. Kapanan mantıları yağlanmış fırın tepsisine aralıklı diz.", "img": "assets/img/1637.webp", "min": 20}, {"t": "Fırınla, sonra et suyunda pişir", "p": "Tepsiyi önceden ısıtılmış <b>180°C</b> fırında 15 dakika, mantılar hafif pembeleşene kadar kızart. Üzerine sıcak et suyunu döküp 10 dakika daha pişir — suyu çeken mantı dışı diri, içi yumuşacık olur.", "img": "assets/img/1425.webp", "min": 25}, {"t": "Yoğurt ve sosla servis et", "p": "Süzme yoğurdu ezilmiş sarımsakla çırp, mantının üzerine gezdir. Tereyağını toz biberle kızdırıp <b>cazırdarken dök</b>; üzerine kuru nane serp. Eline sağlık!", "img": "assets/img/1424.webp", "min": 5}];
  var ci=0, tSec=0, tRun=false, tInt=null;
  function pad(n){ return (n<10?'0':'')+n; }
  function clock(){ el('ckClock').textContent = Math.floor(tSec/60)+':'+pad(tSec%60); }
  function stopTimer(){ tRun=false; clearInterval(tInt); el('ckTimer').classList.remove('run'); el('ckPlay').innerHTML='<i class="fs i-play"></i>'; }
  function ckRender(){
    var s=STEPS[ci];
    el('ckCount').textContent='Adım '+(ci+1)+' / '+STEPS.length;
    el('ckNum').textContent='Adım '+(ci+1);
    el('ckTitle').textContent=s.t; el('ckText').innerHTML=s.p;
    var f=el('ckFig');
    f.style.backgroundImage = s.img ? "url('"+s.img+"')" : 'none';
    el('ckNoImg').style.display = s.img ? 'none' : 'grid';
    var pr=el('ckProg'); pr.innerHTML='';
    for(var i=0;i<STEPS.length;i++){ var d=document.createElement('span'); d.className='cp'+(i<=ci?' done':''); pr.appendChild(d); }
    el('ckPrev').classList.toggle('off', ci===0);
    var last = ci===STEPS.length-1;
    el('ckNext').classList.toggle('fin', last);
    el('ckNext').innerHTML = last ? 'Tarifi Bitir <i class="fs i-check"></i>' : 'Sonraki Adım <i class="fs i-chevron-right"></i>';
    stopTimer(); tSec=s.min*60; clock();
    el('ckTLabel').textContent='Zamanlayıcı — '+s.min+' dk';
    el('ckTHint').textContent='Başlat, süre dolunca haber verelim';
    el('vCook').scrollTo({top:0,behavior:'auto'});
  }
  el('ckNext').addEventListener('click',function(){
    if(ci===STEPS.length-1){ closeSheet(); setTimeout(function(){ say('Afiyet olsun! Tarifi tamamladın 🎉'.replace(' 🎉','')); },420); ci=0; return; }
    ci++; ckRender();
  });
  el('ckPrev').addEventListener('click',function(){ if(ci>0){ci--;ckRender();} });
  el('ckPlay').addEventListener('click',function(){
    if(tRun){ stopTimer(); return; }
    tRun=true; el('ckTimer').classList.add('run'); el('ckPlay').innerHTML='<i class="fs i-xmark"></i>';
    el('ckTHint').textContent='Çalışıyor — ekran açık kalır';
    tInt=setInterval(function(){ if(tSec>0){ tSec--; clock(); } else { stopTimer(); say('Süre doldu — '+STEPS[ci].t); } },1000);
  });
  el('ckIng').addEventListener('click',function(){ el('ckDrawer').classList.add('on'); el('ckOv').classList.add('on'); });
  el('ckOv').addEventListener('click',function(){ el('ckDrawer').classList.remove('on'); el('ckOv').classList.remove('on'); });
  ckRender();

  /* ---- app drawer ---- */
  var dwOv=el('dwOv'), dw=el('appDrawer');
  function dwOpen(){ dwOv.classList.add('on'); dw.classList.add('on'); }
  function dwClose(){ dwOv.classList.remove('on'); dw.classList.remove('on'); }
  dwOv.addEventListener('click',dwClose);
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-drawer]')){ e.preventDefault(); dwOpen(); return; }
    if(e.target.closest('[data-drawer-close]')){ e.preventDefault(); dwClose(); return; }
    var g=e.target.closest('[data-drawer-go]');
    if(g){ e.preventDefault(); dwClose(); setTimeout(function(){ goRoot(V[g.dataset.drawerGo]); },260); }
  });

  /* ---- filtre çekmecesi ---- */
  var fltOv=el('fltOv'), fltSheet=el('fltSheet');
  function fltOpen(){ fltOv.classList.add('on'); fltSheet.classList.add('on'); }
  function fltClose(){ fltOv.classList.remove('on'); fltSheet.classList.remove('on'); }
  el('fltOpen').addEventListener('click',fltOpen);
  el('fltX').addEventListener('click',fltClose);
  fltOv.addEventListener('click',fltClose);
  function fltTally(){
    var n=document.querySelectorAll('#fltSheet .fgrp:not(:first-child) .fopt.on').length;
    var res = Math.max(12, 248 - n*38);
    el('fltCount').textContent=n; el('fltCount').style.display = n? 'grid':'none';
    el('fltApplyTx').textContent = res+' Tarifi Göster';
    return {n:n,res:res};
  }
  document.querySelectorAll('#fltSheet .fopt').forEach(function(o){
    o.addEventListener('click',function(){
      var wrap=o.parentElement;
      if(wrap.dataset.single){ wrap.querySelectorAll('.fopt').forEach(function(x){x.classList.remove('on')}); o.classList.add('on');
        el('sortBtn').innerHTML = o.textContent+' <i class="fs i-chevron-right" style="transform:rotate(90deg)"></i>'; }
      else o.classList.toggle('on');
      fltTally();
    });
  });
  el('fltReset').addEventListener('click',function(){
    document.querySelectorAll('#fltSheet .fgrp:not(:first-child) .fopt.on').forEach(function(x){x.classList.remove('on')});
    fltTally();
  });
  el('fltApply').addEventListener('click',function(){
    var t=fltTally(); fltClose(); el('lCount').textContent=t.res;
    setTimeout(function(){ say(t.res+' tarif listelendi'); },320);
  });
  el('sortBtn').addEventListener('click',fltOpen);
  document.querySelectorAll('#actFlt .afl[data-flt]').forEach(function(a){
    a.addEventListener('click',function(){ a.remove(); say(a.dataset.flt+' filtresi kaldırıldı'); });
  });
  el('fltClear').addEventListener('click',function(){
    document.querySelectorAll('#actFlt .afl[data-flt]').forEach(function(x){x.remove()});
    document.querySelectorAll('#fltSheet .fgrp:not(:first-child) .fopt.on').forEach(function(x){x.classList.remove('on')});
    fltTally(); el('lCount').textContent='248'; say('Filtreler temizlendi');
  });
  document.querySelectorAll('.lchips .chip').forEach(function(c){
    c.addEventListener('click',function(){ document.querySelectorAll('.lchips .chip').forEach(function(x){x.classList.remove('on')}); c.classList.add('on'); });
  });
  fltTally();

  syncStatus();
})();
