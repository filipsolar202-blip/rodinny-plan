import test from 'node:test';
import assert from 'node:assert/strict';
import {demo} from '../src/data.js';
import {calculate,validate} from '../src/engine.js';
import {newIntake,criticalQuestions,intakeErrors,parseIntake} from '../src/intake-contract.js';
import {importQuestionnaire,acceptClientAnswers} from '../src/intake-import.js';
import {parseCase} from '../src/storage.js';
import {blankCrisis,planPeople,extensionErrors} from '../src/plan-data.js';
import {inheritancePages,crisisPages,documentHtml,ownershipSummary} from '../src/documents.js';

test('both independent partner scenarios preserve the original family and property',()=>{
 const c=demo(),before=JSON.stringify(c),pages=inheritancePages(c);
 assert(pages.some(p=>p.title==='Kdyby zemřel/a Jan Novák'));
 assert(pages.some(p=>p.title==='Kdyby zemřel/a Eva Nováková'));
 assert.equal(calculate(c,'jan').net,4500000);
 assert.equal(calculate(c,'eva').net,3300000);
 assert.equal(JSON.stringify(c),before);
 assert.equal(planPeople(c).length,2);
 c.plan={primary:'eva',partner:''};assert.equal(planPeople(c).length,1);
 assert(!inheritancePages(c).some(p=>p.title==='Kdyby zemřel/a Jan Novák'));
});
test('webinar example: 10m SJM + 1m exclusive, spouse ends with 7m',()=>{
 const c=demo();c.assets=c.assets.filter(a=>['home','funds'].includes(a.id));c.assets[0].value=10000000;c.assets[1].value=1000000;
 const r=calculate(c,'jan');assert.equal(r.net,6000000);
 assert.equal(r.heirs.find(h=>h.id==='eva').total,7000000);
 assert.equal(r.heirs.find(h=>h.id==='anna').amount,2000000);
});
test('webinar example: partner 8m, minor 3m, adult 1m from 12m estate',()=>{
 const c=demo();c.assets=c.assets.filter(a=>['home','funds'].includes(a.id));c.assets[0].value=20000000;c.assets[1].value=2000000;
 const r=calculate(c,'jan',{scenario:'D',beneficiary:'eva'});
 assert.deepEqual(Object.fromEntries(r.allocation.map(a=>[a.id,a.value])),{anna:3000000,tomas:1000000,eva:8000000});
});
test('ownership summary excludes external relative shares and marks unknown values',()=>{
 const c=demo();c.assets.push({id:'shared',name:'Chata',kind:'asset',value:1000000,currency:'CZK',regime:'shares',owners:{jan:.25,petra:.75},verified:true});
 assert.equal(ownershipSummary(c).find(x=>x.regime==='shares').total,250000);
 c.assets.at(-1).intakeUnknownValue=true;assert(ownershipSummary(c).find(x=>x.regime==='shares').unknown);
});
test('legacy files remain usable; new questionnaire crisis data survives import and export',()=>{
 const old=demo();assert.deepEqual(validate(parseCase(JSON.stringify(old))),[]);
 const d=newIntake();d.self={...d.self,name:'Test',birth:'1980-01-01',status:'single'};
 for(const k of Object.keys(criticalQuestions))d.answers[k]='no';
 for(const [k,b] of Object.entries(d.budget))b.value=k==='months'?'12':'0';
 for(const k in d.confirm)d.confirm[k]=true;d.status='submitted';d.crisis=blankCrisis();
 d.crisis.policies.push({person:'Test',provider:'Pojišťovna',number:'SML-TEST',coverage:'Odhad',notes:'Neznámá výše'});
 assert.deepEqual(intakeErrors(d),[]);
 const c=importQuestionnaire(parseIntake(JSON.stringify(d)));acceptClientAnswers(c);
 assert.equal(parseCase(JSON.stringify(c)).crisis.policies[0].number,'SML-TEST');
 assert(documentHtml(c,'crisis').includes('SML-TEST'));
 assert(!extensionErrors(c).length);
});
test('malformed extension is rejected; document escapes all client fields',()=>{
 const c=demo();c.crisis={policies:[null]};assert(validate(c).length);
 c.crisis=blankCrisis();c.crisis.contacts=[{name:'<img src=x onerror=alert(1)>',notes:'</script><script>alert(1)</script>'}];
 const html=documentHtml(c,'crisis');assert(!html.includes('<img src=x'));assert(html.includes('&lt;img'));
 c.crisis.contacts[0].name={};assert(validate(c).length);
});
test('unavailable data never appears as a known claim or zero budget',()=>{
 const c=demo();c.crisis=blankCrisis();c.intake={unknownFinancial:['reserve']};
 const pages=crisisPages(c);assert(pages.some(p=>p.body.includes('Neznamená to, že tato smlouva nebo nárok neexistuje')));
 assert(pages.find(p=>p.title.includes('Peníze, které')).body.includes('Neuvedeno'));
});
test('documents use Fair Life contacts, QR guides, disclaimer and no external media',()=>{
 const c=demo(),html=documentHtml(c,'crisis');
 assert(html.includes('f.solar@fair-life.cz'));assert(html.includes('+420 602 190 240'));assert(html.includes('Zpracoval Filip Solár'));
 assert(html.includes('data:image/svg+xml;base64'));assert(!/<img[^>]*src="https?:/.test(html));
 assert(!html.includes('Freedom'));assert(html.includes('Není závětí'));
});
test('long manual notes are split without dropping text; contents links point to pages',()=>{
 const c=demo();c.manual.notes='Důležitá poznámka '.repeat(400)+'KONEC';
 const pages=crisisPages(c);assert(pages.filter(p=>p.title==='Další přání rodiny').length>1);
 assert(pages.some(p=>p.body.includes('KONEC')));
 for(const m of pages[1].body.matchAll(/href="#page-(\d+)"/g))assert(Number(m[1])<=pages.length);
});
test('large household and multiline crisis notes keep all rows and valid contents targets',()=>{
 const c=demo();c.crisis=blankCrisis();
 for(let i=0;i<12;i++)c.people.push({id:'child'+i,name:'Dítě '+i,birth:'2015-01-01',parents:['jan','eva']});
 c.crisis.contacts=Array.from({length:24},(_,i)=>({name:'Kontakt '+i,notes:'Řádek\n'.repeat(100)+'KONEC-'+i}));
 c.manual.documents='Umístění\n'.repeat(100)+'KONEC-DOKUMENTU';
 const pages=crisisPages(c),inheritance=inheritancePages(c);
 assert(pages.filter(p=>p.section==='Obsah').length>1);
 for(const p of pages.filter(p=>p.section==='Obsah'))for(const m of p.body.matchAll(/href="#page-(\d+)"/g))assert(pages[Number(m[1])-1]);
 for(let i=0;i<24;i++)assert(pages.some(p=>p.body.includes('KONEC-'+i)));
 assert(pages.some(p=>p.body.includes('KONEC-DOKUMENTU')));
 assert(inheritance.filter(p=>p.title==='Co chrání děti').length>=4);
});
test('unmarried partner can receive a second independent output without inventing marriage',()=>{
 const d=newIntake();d.self={...d.self,name:'Klient',birth:'1980-01-01',status:'partner'};
 for(const k of Object.keys(criticalQuestions))d.answers[k]='no';
 for(const [k,b] of Object.entries(d.budget))b.value=k==='months'?'12':'0';
 for(const k in d.confirm)d.confirm[k]=true;d.status='submitted';
 d.people=[{id:'p',name:'Partnerka',birth:'1982-01-01',birthUnknown:false,role:'partner',life:'alive',year:'yes',care:'yes'}];
 const c=importQuestionnaire(d);
 assert.equal(planPeople(c).length,2);
 assert.equal(c.relations.length,0);
 const malformed={...d,crisis:{contacts:[null]}};
 assert.throws(()=>parseIntake(JSON.stringify(malformed),{draft:true}));
});
