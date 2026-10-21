import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readExchangeFile,exchangePreview,exportExchange,prefilledQuestionnaire} from '../src/wealth-exchange.js';
import {parseIntake,intakeErrors} from '../src/intake-contract.js';
import {acceptClientAnswers} from '../src/intake-import.js';
import {validate} from '../src/engine.js';
import {parseCase} from '../src/storage.js';
const fixture=()=>JSON.parse(readFileSync(new URL('./fixtures/wealth-exchange-v1.json',import.meta.url),'utf8'));
const read=d=>readExchangeFile(JSON.stringify(d));
test('CRM draft retains unknowns, stable identity, asset IDs and contract provenance through a plan roundtrip',()=>{
 const d=fixture();d.assets.push({...d.assets[0],id:'unknown-value',value:'',valueUnknown:true,currency:'EUR'});
 d.exchange.contracts=[{id:'policy-1',type:'insurance',company:'Ukázka',product:'Životní pojištění',number:'TEST-123',currency:'CZK',payment:'900',startDate:'2020-01-01',endDate:'',notes:''}];
 d.crisis.policies=[{id:'policy-1',provider:'Ukázka',coverage:'Úmrtí 2 000 000 Kč'}];
 const before=JSON.stringify(d),c=read(d).candidate;assert.deepEqual(validate(c),[]);assert.equal(c.intake.reviewed,false);assert.equal(c.complete,false);
 acceptClientAnswers(c);assert.equal(c.complete,false);assert.equal(c.assets[0].verified,false);
 const out=exportExchange(parseCase(JSON.stringify(c)));
 assert.equal(out.exchange.clientRef,d.exchange.clientRef);assert.deepEqual(out.exchange.assetRefs,d.exchange.assetRefs);assert.deepEqual(out.exchange.contracts,d.exchange.contracts);
 assert.equal(out.assets.length,2);assert.equal(out.assets[0].id,d.assets[0].id);assert.equal(out.assets[0].owner,'unknown');assert.equal(out.assets[1].value,'');assert(out.assets[1].valueUnknown);
 assert.equal(out.status,'draft');assert(Object.values(out.confirm).every(v=>v===false));assert(Object.values(out.budget).every(b=>b.unknown&&b.value===''));
 assert.equal(out.self.email,d.self.email);assert.equal(out.exchange.source,'family-plan');assert.notEqual(out.exchange.exportId,d.exchange.exportId);assert.equal(JSON.stringify(d),before);
 assert.deepEqual(validate(read(out).candidate),[]);
});
test('adviser edits export current values and contacts, keeping metadata valuation dates unchanged',()=>{
 const c=read(fixture()).candidate;c.assets[0].value=250000;c.assets[0].regime='exclusive';c.contact.phone='+420 000 000 000';
 const out=exportExchange(c);assert.equal(out.assets[0].value,'250000');assert.equal(out.assets[0].owner,'me');assert.equal(out.self.phone,c.contact.phone);assert.equal(out.exchange.assetRefs['asset-test-1'].asOf,'2026-09-30');
 c.assets[0].value=0;assert.equal(exportExchange(c).assets[0].value,'0');
 c.assets[0].intakeUnknownValue=true;assert.equal(exportExchange(c).assets[0].value,'');
});
test('CRM draft can prefill questionnaire, then return submitted with metadata intact',()=>{
 const d=parseIntake(JSON.stringify(fixture()),{draft:true});assert.throws(()=>parseIntake(JSON.stringify(d)));
 d.status='submitted';for(const k in d.confirm)d.confirm[k]=true;assert.deepEqual(intakeErrors(d),[]);
 const c=read(d).candidate;assert.equal(c.intake.source.status,'submitted');assert.equal(c.exchange.clientRef,d.exchange.clientRef);
 assert.equal(exportExchange(c).status,'draft');
});
test('preview identifies repeat client and keeps currencies separate without counting insurance',()=>{
 const d=fixture();d.assets.push({...d.assets[0],id:'eur',currency:'EUR',value:'10'});d.crisis.policies=[{coverage:'2 000 000 Kč'}];
 const c=read(d).candidate,p=exchangePreview(d,[c]);assert.equal(p.duplicates.length,1);assert.equal(p.currencies.CZK.assets,200000);assert.equal(p.currencies.EUR.assets,10);
 assert.equal(exchangePreview({...d,exchange:{...d.exchange,clientRef:'different'}},[c]).duplicates.length,0);
});
test('invalid metadata, duplicate IDs, bad references and hostile keys are rejected',()=>{
 for(const change of [d=>d.exchange.version=2,d=>d.exchange.source='other',d=>d.exchange.contracts=[{id:'a',payment:{}}],d=>d.assets.push({...d.assets[0]}),d=>d.assets[0].value='Infinity',d=>d.assets[0].value=-2,d=>d.assets[0].person='missing'&& (d.assets[0].owner='person'),d=>d.self.email={}]){const d=fixture();change(d);assert.throws(()=>read(d));}
 assert.throws(()=>readExchangeFile(JSON.stringify(fixture()).replace('"self":{','"__proto__":{},"self":{')));
 const d=fixture();delete d.exchange;assert.throws(()=>read(d));
});
test('prefilled attachment escapes inline payload and preserves client data literally',()=>{
 const d=fixture();d.self.name='</script><img src=x> $&';const html=prefilledQuestionnaire('<html><body>Dotazník</body></html>',d);
 assert(!html.includes('<img src=x>'));const payload=html.match(/id="prefill-data">(.*?)<\/script>/s)[1];assert.equal(JSON.parse(payload).self.name,d.self.name);
});
