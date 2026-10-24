#!/usr/bin/env node
/**
 * Social Skills Rules operations. No credentials, visitor tracking, or publishing.
 * Keep input/output metrics and review files PRIVATE, outside the public repository.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const args=process.argv.slice(2),command=args.shift();
const option=(key,fallback)=>{const i=args.indexOf('--'+key);return i<0?fallback:args[i+1];};
const required=key=>{const v=option(key);if(!v)throw Error('Missing --'+key);return v;};
const readJSON=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,data)=>{fs.mkdirSync(path.dirname(path.resolve(p)),{recursive:true});fs.writeFileSync(p,data);};
const csvCell=s=>'"'+String(s??'').replaceAll('"','""')+'"';
const csv=(rows,columns)=>[columns,...rows.map(r=>columns.map(k=>r[k]))].map(row=>row.map(csvCell).join(',')).join('\n')+'\n';
export function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v!==''))rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw Error('Unclosed CSV quote');
 if(cell||row.length){row.push(cell);rows.push(row);}
 const header=rows.shift()||[];
 return rows.map(r=>Object.fromEntries(header.map((k,i)=>[k,r[i]??''])));
}
const number=x=>x===''||x===null||x===undefined||x==='—'?null:(Number.isFinite(Number(x))?Number(x):null);
const rate=(n,d)=>n!==null&&d!==null&&d>0?n/d:null;
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const expectedManifest='946a94410367623143b374247a716d84e1d6458dce7c21099109b2e7ddf06796';
export const topics={
 'conversation-turns':{theme:'conversation',book:'workbook',label:'Conversation turns'},
 'personal-space':{theme:'boundaries',book:'workbook',label:'Comfortable personal space'},
 'objects-away-from-faces':{theme:'boundaries',book:'workbook',label:'Objects away from faces'},
 'ask-before-touching':{theme:'boundaries',book:'workbook',label:'Ask before touching'},
 'different-preferences':{theme:'acceptance',book:'story_and_workbook',label:'Different preferences'},
 'waiting-to-speak':{theme:'conversation',book:'workbook',label:'Waiting to speak'},
 'reciprocal-friendships':{theme:'exclusion',book:'story',label:'Reciprocal friendship and exclusion'},
 'answer-the-question':{theme:'conversation',book:'workbook',label:'Answer the question'},
 'ask-about-their-interests':{theme:'conversation',book:'workbook',label:'Their interests'},
 'join-a-game':{theme:'shared_play',book:'workbook',label:'Joining a game'},
 'respect-no':{theme:'boundaries',book:'workbook',label:'Respecting no'},
 'flexible-play':{theme:'shared_play',book:'workbook',label:'Taking turns choosing'},
 'get-adult-help':{theme:'safety',book:'workbook',label:'Getting adult help'},
 'specific-parent-feedback':{theme:'parent_coaching',book:'workbook',label:'Specific parent feedback'}
};
function manifest(){
 const p=required('manifest'),bytes=fs.readFileSync(p);
 if(hash(bytes)!==expectedManifest)throw Error('Manifest changed; obtain owner review before using a new queue.');
 return JSON.parse(bytes);
}
function reviewFor(review,id,platform,type){
 const r=review[id]||{};
 const missing=[];
 if(r.claims_review!=='owner_approved')missing.push('claims_review');
 if(r.artwork_permission!=='owner_confirmed')missing.push('artwork_permission');
 if(type==='video'&&r.first_video_rights_check!=='owner_confirmed')missing.push('first_video_rights_check');
 if(platform==='YouTube Shorts'&&!['made_for_kids','not_made_for_kids'].includes(r.owner_audience_setting))missing.push('owner_audience_setting');
 return missing.length?'HUMAN_REVIEW_REQUIRED: '+missing.join('; '):'REVIEW_CLEAR';
}
function queue(){
 const m=manifest(),review=option('review')?readJSON(option('review')):{},out=required('out'),rows=[];
 for(const item of m.items){
  const u=new URL(item.website),slug=u.hash.replace('#habit-',''),topic=topics[slug];
  if(!topic)throw Error('Unknown topic '+slug);
  for(const platform of item.platforms){
   const link=new URL(platform.startsWith('Instagram')?item.instagramWebsite:item.website);
   if(link.hostname!=='books.familygallerytv.com')throw Error('Unexpected landing host');
   const asset=platform==='Pinterest'?item.pinterestImage:platform==='Instagram'?item.instagramImage:item.video;
   if(!asset||asset.includes('..')||!asset.startsWith('assets/'))throw Error('Unexpected asset path');
   rows.push({
    content_id:item.id,platform,planned_date:item.date,local_time:item.time,timezone:item.timezone,
    topic_id:slug,theme:topic.theme,book:topic.book,title:platform==='YouTube Shorts'?item.youtubeTitle:item.title,
    caption:platform==='YouTube Shorts'?item.youtubeDescription:item.caption,
    website:link.href,amazon:item.amazon,asset_path:'campaign/2026-10-26/'+asset,
    board:platform==='Pinterest'?item.board:'',alt_text:item.altText||'',
    human_review:reviewFor(review,item.id,platform,item.type),publication_status:'NOT_YET_VERIFIED'
   });
  }
 }
 write(out,csv(rows,Object.keys(rows[0])));
 console.log(JSON.stringify({rows:rows.length,topics:Object.keys(topics).length,output:out,automaticPublishing:false}));
}
function resize(){
 const dimensions={instagram:[1080,1350],pinterest:[1000,1500],shorts:[1080,1920]};
 const kind=required('platform'),wh=dimensions[kind];if(!wh)throw Error('Use instagram, pinterest, or shorts');
 const source=path.resolve(required('source')),out=path.resolve(required('out'));
 if(source===out)throw Error('Do not overwrite the approved source');
 fs.mkdirSync(path.dirname(out),{recursive:true});
 execFileSync('convert',['-limit','memory','256MiB',source,'-auto-orient','-resize',wh.join('x'),'-background','#fffaf0','-gravity','center','-extent',wh.join('x'),'-strip',out]);
 console.log(JSON.stringify({output:out,width:wh[0],height:wh[1],method:'contain; no cropping or new content'}));
}
async function links(){
 const m=manifest(),out=required('out'),result=[],targets=[...new Set(m.items.flatMap(i=>[i.website,i.instagramWebsite]))];
 const response=await fetch('https://books.familygallerytv.com/',{redirect:'follow',signal:AbortSignal.timeout(20000)});
 const html=await response.text(),ids=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]));
 for(const url of targets){const u=new URL(url);result.push({url,status:response.status,final_origin:new URL(response.url).origin,fragment:u.hash,fragment_present:!u.hash||ids.has(decodeURIComponent(u.hash.slice(1))),utm_source:u.searchParams.get('utm_source'),checked_at:new Date().toISOString()});}
 for(const filename of ['robots.txt','sitemap.xml','assets/social-card.jpg']){
  try{const r=await fetch('https://books.familygallerytv.com/'+filename,{signal:AbortSignal.timeout(20000)});result.push({url:r.url,status:r.status,content_type:r.headers.get('content-type'),checked_at:new Date().toISOString()});}
  catch(e){result.push({url:'https://books.familygallerytv.com/'+filename,status:null,error:e.message});}
 }
 write(out,JSON.stringify({checked_at:new Date().toISOString(),scope:'Book-site resources and all 78 source-tagged destinations; Amazon not asserted by HTTP',results:result},null,2)+'\n');
 if(result.some(r=>r.status!==200||r.fragment_present===false||r.final_origin&&r.final_origin!=='https://books.familygallerytv.com'))process.exitCode=2;
 console.log(JSON.stringify({destinations:targets.length,failures:result.filter(r=>r.status!==200||r.fragment_present===false).length,output:out}));
}
function summarize(){
 const input=required('metrics'),out=required('out'),rows=parseCSV(fs.readFileSync(input,'utf8'));
 // Never add cumulative/rolling snapshots together or mix different reporting windows.
 const latest=new Map();
 for(const r of rows){
  const key=[r.platform,r.format||'',r.post_id||r.content_id||r.book_id||'account',r.marketplace||'',r.royalties_currency||'',r.subscription_metric_name||'',r.subscription_metric_unit||'',r.period_type,r.window_start,r.window_end].join('|');
  if(!latest.has(key)||String(r.observed_at)>String(latest.get(key).observed_at))latest.set(key,r);
 }
 const groups=new Map();
 for(const r of latest.values()){
  for(const [level,id] of [['topic',r.topic_id||'unassigned'],['theme',topics[r.topic_id]?.theme||'unassigned']]){
   const key=[level,id,r.platform,r.format||'',r.period_type,r.window_start,r.window_end].join('|');
   if(!groups.has(key))groups.set(key,{level,id,values:[]});
   groups.get(key).values.push(r);
  }
 }
 const summary=[];
 for(const {level,id,values} of groups.values()){
  const first=values[0],topic=topics[first.topic_id];
  const sum=field=>{const ns=values.map(r=>number(r[field])).filter(x=>x!==null);return ns.length?ns.reduce((a,b)=>a+b,0):null;};
  const impressions=sum('impressions'),views=sum('views'),reach=sum('reach'),saves=sum('saves'),shares=sum('shares'),clicks=sum('outbound_clicks');
  const measured=values.filter(r=>['available','partial'].includes(r.status));
  const history=[...latest.values()].filter(r=>r.platform===first.platform&&(r.format||'')===(first.format||'')&&(level==='topic'?r.topic_id===id:topics[r.topic_id]?.theme===id)&&r.period_type==='prior_week'&&String(r.window_end)<=String(first.window_end)&&['available','partial'].includes(r.status));
  const weeks=new Set(history.map(r=>r.window_start).filter(Boolean)).size;
  const distinctUnits=new Set(history.map(r=>r.content_id||r.post_id)).size;
  const exposed=first.platform==='Pinterest'?impressions:first.platform==='Instagram'?reach:views;
  // Screening threshold, not statistical proof or a sales prediction.
  const threshold=first.platform==='Pinterest'?1000:300;
  const eligible=distinctUnits>=3&&weeks>=3&&first.period_type==='prior_week'&&exposed!==null&&exposed>=threshold;
  summary.push({
   level,platform:first.platform,format:first.format||'',topic_id:level==='topic'?id:'',theme:level==='theme'?id:topic?.theme||'',book:[...new Set(values.map(r=>topics[r.topic_id]?.book).filter(Boolean))].join(';'),period_type:first.period_type,
   window_start:first.window_start,window_end:first.window_end,post_count:values.length,measured_post_count:measured.length,historical_distinct_units:distinctUnits,historical_week_count:weeks,
   impressions,views,reach,saves,shares,outbound_clicks:clicks,search_clicks:sum('search_clicks'),
   outbound_click_rate:rate(clicks,impressions),save_rate:rate(saves,impressions),
   instagram_save_share_rate:rate(saves!==null&&shares!==null?saves+shares:null,reach),
   next_book_decision:eligible?'CANDIDATE_FOR_HUMAN_VALIDATION':'INSUFFICIENT_DATA',
   caveat:'Window-specific descriptive data; reach sums are not unique people; no sales attribution.'
  });
 }
 write(out,csv(summary,['level','platform','format','topic_id','theme','book','period_type','window_start','window_end','post_count','measured_post_count','historical_distinct_units','historical_week_count','impressions','views','reach','saves','shares','outbound_clicks','search_clicks','outbound_click_rate','save_rate','instagram_save_share_rate','next_book_decision','caveat']));
 const sales=[...latest.values()].filter(r=>r.platform==='KDP').map(r=>({
  book_id:r.book_id||'',format:r.format||'',marketplace:r.marketplace||'',period_type:r.period_type,
  window_start:r.window_start,window_end:r.window_end,status:r.status,
  paid_units:number(r.paid_units),free_units:number(r.free_units),royalties_amount:number(r.royalties_amount),
  royalties_currency:r.royalties_currency||'',subscription_metric_name:r.subscription_metric_name||'',
  subscription_metric_value:number(r.subscription_metric_value),subscription_metric_unit:r.subscription_metric_unit||'',
  attribution:'not established',note:r.note||''
 }));
 const salesOut=option('sales-out',path.join(path.dirname(out),'KDP_Summary.csv'));
 write(salesOut,csv(sales,['book_id','format','marketplace','period_type','window_start','window_end','status','paid_units','free_units','royalties_amount','royalties_currency','subscription_metric_name','subscription_metric_value','subscription_metric_unit','attribution','note']));
 console.log(JSON.stringify({observations:rows.length,deduplicated:latest.size,groups:summary.length,output:out,kdpOutput:salesOut,noAttributionAssumed:true}));
}
if(command==='queue')queue();
else if(command==='resize')resize();
else if(command==='links')await links();
else if(command==='summarize')summarize();
else if(command==='self-test'){
 if(parseCSV('a,b\n"x,y","a""b"\n')[0].b!=='a"b')throw Error('CSV quoting failed');
 if(rate(0,0)!==null||rate(null,10)!==null||rate(1,10)!==.1)throw Error('Missing/zero denominator handling failed');
 console.log('Self-tests passed: CSV quoting, nulls, and zero denominators.');
}else if(import.meta.url===`file://${process.argv[1]}`)throw Error('Commands: queue, resize, links, summarize, self-test');
