// Synthetic fixtures only. These are not real campaign measurements.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {parseCSV} from './campaign-ops.mjs';

test('CSV preserves quoted commas, multiline fields, and blank metrics',()=>{
 const r=parseCSV('a,b,c\n"x,y","first\nsecond",""\n');
 assert.equal(r[0].a,'x,y');assert.equal(r[0].b,'first\nsecond');assert.equal(r[0].c,'');
});
test('Summaries keep unknown denominators blank and do not double-count snapshots',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'social-skills-test-'));
 try{
  const input=path.join(dir,'metrics.csv'),out=path.join(dir,'summary.csv');
  fs.writeFileSync(input,'observed_at,platform,format,post_id,content_id,topic_id,period_type,window_start,window_end,status,impressions,saves,outbound_clicks\n2026-10-01,Pinterest,static,one,one,personal-space,rolling_30d,2026-09-01,2026-10-01,available,0,0,0\n2026-10-02,Pinterest,static,one,one,personal-space,rolling_30d,2026-09-01,2026-10-01,available,0,0,0\n');
  execFileSync('node',[new URL('./campaign-ops.mjs',import.meta.url).pathname,'summarize','--metrics',input,'--out',out]);
  const rows=parseCSV(fs.readFileSync(out,'utf8')),topic=rows.find(r=>r.level==='topic');
  assert.equal(topic.post_count,'1');assert.equal(topic.save_rate,'');assert.equal(topic.outbound_click_rate,'');assert.equal(topic.next_book_decision,'INSUFFICIENT_DATA');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('Theme screening can use three topics across three weeks without claiming sales',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'social-skills-test-'));
 try{
  const input=path.join(dir,'metrics.csv'),out=path.join(dir,'summary.csv');
  fs.writeFileSync(input,'observed_at,platform,format,post_id,content_id,topic_id,period_type,window_start,window_end,status,impressions,saves,outbound_clicks\n2026-10-08,Pinterest,static,one,one,personal-space,prior_week,2026-10-01,2026-10-08,available,1500,20,10\n2026-10-15,Pinterest,static,two,two,ask-before-touching,prior_week,2026-10-08,2026-10-15,available,1500,20,10\n2026-10-22,Pinterest,static,three,three,respect-no,prior_week,2026-10-15,2026-10-22,available,1500,20,10\n');
  execFileSync('node',[new URL('./campaign-ops.mjs',import.meta.url).pathname,'summarize','--metrics',input,'--out',out]);
  const rows=parseCSV(fs.readFileSync(out,'utf8'));
  assert.ok(rows.some(r=>r.level==='theme'&&r.theme==='boundaries'&&r.next_book_decision==='CANDIDATE_FOR_HUMAN_VALIDATION'));
  assert.ok(rows.filter(r=>r.level==='theme'&&r.window_start==='2026-10-01').every(r=>r.next_book_decision==='INSUFFICIENT_DATA'));
  assert.ok(rows.filter(r=>r.level==='topic').every(r=>r.next_book_decision==='INSUFFICIENT_DATA'));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('KDP summaries do not merge currencies or turn missing sales into zeros',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'social-skills-test-'));
 try{
  const input=path.join(dir,'metrics.csv'),out=path.join(dir,'summary.csv');
  fs.writeFileSync(input,'observed_at,platform,book_id,format,period_type,window_start,window_end,status,paid_units,royalties_amount,royalties_currency\n2026-10-22,KDP,TEST_BOOK,ebook,prior_week,2026-10-15,2026-10-22,available,2,6,USD\n2026-10-22,KDP,TEST_BOOK,ebook,prior_week,2026-10-15,2026-10-22,available,1,4,CAD\n2026-10-22,KDP,UNAVAILABLE_BOOK,ebook,prior_week,2026-10-15,2026-10-22,unavailable,,,\n');
  execFileSync('node',[new URL('./campaign-ops.mjs',import.meta.url).pathname,'summarize','--metrics',input,'--out',out]);
  const sales=parseCSV(fs.readFileSync(path.join(dir,'KDP_Summary.csv'),'utf8'));
  assert.equal(sales.length,3);
  assert.equal(sales.find(r=>r.royalties_currency==='USD').royalties_amount,'6');
  assert.equal(sales.find(r=>r.royalties_currency==='CAD').royalties_amount,'4');
  assert.equal(sales.find(r=>r.book_id==='UNAVAILABLE_BOOK').paid_units,'');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
