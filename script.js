const $=id=>document.getElementById(id),f=n=>Math.round(n).toLocaleString('en-US');
const subs={Plate:["Soldier","Knight","Guardian"],Leather:["Mercenary","Hunter","Assassin"],Cloth:["Scholar","Cleric","Mage"]};
const mats={Plate:["Steel Bar","Titanium Steel Bar"],Leather:["Worked Leather","Cured Leather"],Cloth:["Neat Cloth","Fine Cloth"]};
const slots={Plate:["Armor","Helmet","Boots"],Leather:["Jacket","Hood","Shoes"],Cloth:["Robe","Cowl","Sandals"]};
function fill(){const c=$('cat').value,cur=$('sub').value;$('sub').innerHTML=subs[c].map(s=>`<option>${s}</option>`).join('');if(subs[c].includes(cur))$('sub').value=cur;
 [...$('slot').options].forEach((o,i)=>o.text=slots[c][i]);
 $('ml').textContent='Price per '+mats[c][$('tier').value-4]+(+$('ench').value?' .'+$('ench').value:'')}
function setMpc(){$('mpc').value=$('slot').value}
const row=(a,b,c)=>`<div class="r"><span>${a}</span><b${c?` class="${c}"`:''}>${b}</b></div>`;
function calc(){
 fill();
 const foc=$('foc').checked,city=+$('city').value,prem=$('prem').checked;
 const rrr=foc?(city?.479:.435):(city?.248:.152);
 $('rrrn').textContent='Resource return rate: '+(rrr*100).toFixed(1)+'%';
 let q=+$('qty').value||0;const m=+$('mpc').value||1,mp=+$('mp').value||0,ip=+$('ip').value||0,sf=+$('sf').value||0,fc=+$('fc').value||0;
 const buyFee=$('mb').value=='o'?.025:0;
 const tax=prem?.04:.08,sellFee=$('sb').value=='o'?tax+.025:tax;
 const mode=$('mode').value,bud=+$('bud').value||0;
 $('qty').disabled=mode=='b';$('bud').disabled=mode!='b';
 const extraOf=n=>{let p=n*m*rrr,e=0,r=0;while(p>=m&&r<60){const k=Math.floor(p/m);e+=k;p=p-k*m+k*m*rrr;r++}return e};
 const totalOf=n=>n*m*mp*(1+buyFee)+(n+extraOf(n))*sf;
 if(mode=='b'){if(m*mp+sf<=0)q=0;else{let lo=0,hi=1e7;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(totalOf(mid)<=bud)lo=mid;else hi=mid-1}q=lo}}
 const needM=q*m,matCost=needM*mp*(1+buyFee),stCost=q*sf,spent=matCost+stCost;
 const ret=needM*rrr;
 // extra crafts loop
 let pool=ret,extra=0,rounds=0;
 while(pool>=m&&rounds<60){const k=Math.floor(pool/m);extra+=k;pool=pool-k*m+k*m*rrr;rounds++}
 const left=pool,exSt=extra*sf,focTot=(q+extra)*fc;
 const itemNet=ip*(1-sellFee),matSellNet=mp*(1-tax);
 // A
 const revA=q*itemNet,matBack=ret*matSellNet,profA=revA+matBack-spent;
 // B
 const revB=(q+extra)*itemNet,leftV=left*matSellNet,profB=revB+leftV-spent-exSt;
 const mn=mats[$('cat').value][$('tier').value-4]+(+$('ench').value?' .'+$('ench').value:''),tot=spent+exSt,step=(n,t)=>`<div class="r"><span><b>${n}.</b> ${t}</span></div>`;
 $('rdy').innerHTML=(mp<=0||ip<=0?'<div class="n bad">Enter the material price and item sell price to get real numbers.</div>':'')+step(1,`Buy <b>${f(needM)}</b> × ${mn} at ${f(mp)} s (${$('mb').value=='o'?'buy order':'instant buy'}) = <b>${f(matCost)} s</b>`)+step(2,`Craft <b>${f(q)}</b> ${$('sub').value} ${$('slot').selectedOptions[0].text} (T${tn()}) — station fees ${f(stCost)} s${foc?`, focus ${f(q*fc)}`:''}`)+step(3,`You get back about <b>${f(ret)}</b> ${mn} → craft <b>${f(extra)}</b> more${exSt?` (station fees ${f(exSt)} s)`:''}`)+step(4,`Sell <b>${f(q+extra)}</b> items at ${f(ip)} s (${$('sb').value=='o'?'sell order':'instant sell'}) → <b>${f(revB)} s</b> after fees`)+row('Total you pay',f(tot)+' s')+(mode=='b'?row('Your budget',f(bud)+' s')+row('Budget left unused',f(bud-tot)+' s'):'')+row('Expected profit (scenario B)',f(profB)+' s',profB>=0?'good':'bad');
 last={name:`T${tn()} ${$('sub').value} ${$('slot').selectedOptions[0].text}${foc?' (focus)':''}`,mat:mn,needM,q,extra,paid:tot,profA,profB,foc:(q+extra)*fc};
 $('spent').innerHTML=row('Materials needed',f(needM))+row('Material cost'+(buyFee?' (incl. 2.5% order fee)':''),f(matCost)+' s')+row('Station fees ('+f(q)+' crafts)',f(stCost)+' s')+row('Total paid',f(spent)+' s')+(foc?row('Focus used (base crafts)',f(q*fc)):'');
 $('ret').innerHTML=row('Materials returned',f(ret))+row('Extra items you can craft with them',f(extra))+row('Left over after extra crafts',f(left))+row('Total items if you craft extra',f(q+extra));
 const pc=v=>`<div class="p ${v>=0?'good':'bad'}">Profit: ${f(v)} s</div>`;
 $('A').innerHTML=row('Items to sell',f(q))+row('Items revenue (after fees)',f(revA)+' s')+row('Returned mats sold',f(matBack)+' s')+row('Total paid',f(spent)+' s')+pc(profA)+row('Profit per item crafted',f(q?profA/q:0)+' s');
 $('B').innerHTML=row('Items to sell',f(q+extra))+row('Items revenue (after fees)',f(revB)+' s')+row('Leftover mats sold',f(leftV)+' s')+row('Total paid (incl. extra station fees)',f(spent+exSt)+' s')+(foc?row('Total focus used',f(focTot)):'')+pc(profB)+row('Extra profit vs A',f(profB-profA)+' s',profB>=profA?'good':'bad');
}
let last=null,B=[],open={},ed=-1;
const tn=()=>$('tier').value+(+$('ench').value?'.'+$('ench').value:'');
const ids=['foc','prem','city','fc','tier','cat','ench','sub','mpc','mode','qty','bud','mp','mb','sf','ip','sb'],ttl=['Ready to go','Total spent','Materials returned','A · Sell returned materials','B · Craft extra with returns'];
const snap=()=>{const o={};ids.forEach(i=>o[i]=$(i).type=='checkbox'?$(i).checked:$(i).value);o.slotI=$('slot').selectedIndex;return o};
const detRow=x=>`<tr><td colspan="7" style="white-space:normal;text-align:left;background:var(--bg)">${x.det?x.det.map((h,k)=>`<div class="n" style="margin-top:8px;text-transform:uppercase">${ttl[k]}</div>${h}`).join(''):'<div class="n">No details saved for this older row. Press Edit, then Update, to save them.</div>'}</td></tr>`;
function setEd(i){ed=i;$('add').textContent=i>=0?'\u{1F4BE} Update batch item #'+(i+1):'\u2795 Add this item to my batch';$('cx').style.display=i>=0?'':'none'}
function load(x){['cat','tier'].forEach(i=>$(i).value=x.inp[i]);fill();ids.forEach(i=>{if(i=='cat'||i=='tier')return;const e=$(i);if(e.type=='checkbox')e.checked=x.inp[i];else if(x.inp[i]!==undefined)e.value=x.inp[i]});$('slot').selectedIndex=x.inp.slotI;calc();window.scrollTo({top:0,behavior:'smooth'})}
try{B=JSON.parse(localStorage.getItem('albionBatch')||'[]')}catch(e){B=[]}
function save(){try{localStorage.setItem('albionBatch',JSON.stringify(B))}catch(e){}}
function rb(){const el=$('bl');if(!B.length){el.innerHTML='<div class="n">Nothing here yet. Set up an item above, press “Add this item to my batch”, then change the item and add the next one.</div>';return}
 const cl=v=>v>=0?'good':'bad',s=k=>B.reduce((a,x)=>a+x[k],0),ms={};B.forEach(x=>ms[x.mat]=(ms[x.mat]||0)+x.needM);
 el.innerHTML='<div class="tw"><table><tr><th>Item</th><th>Craft</th><th>+Extra</th><th>Paid</th><th>Profit A</th><th>Profit B</th><th></th></tr>'+B.map((x,i)=>`<tr><td>${x.name}</td><td>${f(x.q)}</td><td>${f(x.extra)}</td><td>${f(x.paid)}</td><td class="${cl(x.profA)}">${f(x.profA)}</td><td class="${cl(x.profB)}">${f(x.profB)}</td><td style="white-space:nowrap"><button class="btn s" data-a="d" data-i="${i}">${open[i]?'Hide':'Details'}</button> <button class="btn s" data-a="e" data-i="${i}">Edit</button> <button class="btn s" data-a="x" data-i="${i}">✕</button></td></tr>${open[i]?detRow(x):''}`).join('')+`<tr><td><b>Total</b></td><td>${f(s('q'))}</td><td>${f(s('extra'))}</td><td><b>${f(s('paid'))}</b></td><td class="${cl(s('profA'))}"><b>${f(s('profA'))}</b></td><td class="${cl(s('profB'))}"><b>${f(s('profB'))}</b></td><td></td></tr></table></div>`
 +'<div style="margin-top:10px">'+Object.keys(ms).map(k=>row('Buy '+k,f(ms[k]))).join('')+(s('foc')?row('Total focus needed',f(s('foc'))):'')+row('Total you pay',f(s('paid'))+' s')+row('Total profit (B: craft extra)',f(s('profB'))+' s',cl(s('profB')))+row('Total profit (A: sell returns)',f(s('profA'))+' s',cl(s('profA')))+'</div>'}
$('add').onclick=()=>{if(!last||last.q<=0)return;const it={...last,inp:snap(),det:['rdy','spent','ret','A','B'].map(id=>$(id).innerHTML)};if(ed>=0&&B[ed])B[ed]=it;else B.push(it);setEd(-1);save();rb()};
$('cx').onclick=()=>setEd(-1);
$('clr').onclick=()=>{B=[];open={};setEd(-1);save();rb()};
$('bl').onclick=e=>{const d=e.target.dataset;if(!d||d.i===undefined)return;const i=+d.i;if(d.a=='d'){open[i]=!open[i]}else if(d.a=='e'){if(B[i]&&B[i].inp){setEd(i);load(B[i])}return}else if(d.a=='x'){B.splice(i,1);open={};setEd(-1);save()}rb()};
document.querySelectorAll('select,input').forEach(e=>e.addEventListener('input',e=>{if(e.target.id=='slot')setMpc();calc()}));
rb();
fill();calc();
