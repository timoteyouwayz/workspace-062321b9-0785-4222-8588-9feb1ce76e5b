module.exports=[93695,(e,t,a)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},32319,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},18622,(e,t,a)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,a)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},70406,(e,t,a)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},63021,(e,t,a)=>{t.exports=e.x("@prisma/client-2c3a283f134fdcb6",()=>require("@prisma/client-2c3a283f134fdcb6"))},43793,e=>{"use strict";var t=e.i(63021);let a=globalThis.prisma??new t.PrismaClient({log:["query"]});e.s(["db",0,a])},54799,(e,t,a)=>{t.exports=e.x("crypto",()=>require("crypto"))},21966,e=>{"use strict";var t=e.i(47909),a=e.i(74017),r=e.i(96250),n=e.i(59756),s=e.i(61916),o=e.i(74677),i=e.i(69741),l=e.i(16795),p=e.i(87718),d=e.i(95169),c=e.i(47587),u=e.i(66012),h=e.i(70101),x=e.i(26937),f=e.i(10372),g=e.i(93695);e.i(52474);var m=e.i(220),w=e.i(89171),v=e.i(43793),R=e.i(79832);async function b(e){try{let t=await (0,R.getSession)();if(!t)return w.NextResponse.json({error:"Unauthorized"},{status:401});let{searchParams:a}=new URL(e.url),r=a.get("id");if(!r)return w.NextResponse.json({error:"Missing requisition id"},{status:400});let n=await v.db.requisition.findUnique({where:{id:r},include:{user:{select:{name:!0,email:!0,department:!0}},checkedBy:{select:{name:!0}},approvedBy:{select:{name:!0}}}});if(!n)return w.NextResponse.json({error:"Requisition not found"},{status:404});if(n.userId!==t.id&&!["ACCOUNTANT","ADMIN"].includes(t.role))return w.NextResponse.json({error:"Unauthorized"},{status:403});let s=JSON.parse(n.expenseItems),o=`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Request for Finance - ${r}</title>
  <style>
    body { font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18pt; margin: 0; }
    .header p { font-size: 10pt; margin: 5px 0; }
    .title { text-align: center; font-size: 14pt; font-weight: bold; margin: 30px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; }
    .amount { text-align: right; }
    .total-row { font-weight: bold; }
    .info-row { margin: 10px 0; }
    .label { font-weight: bold; }
    .signature-section { margin-top: 40px; }
    .signature-row { margin: 15px 0; }
    .line { border-bottom: 1px solid #000; display: inline-block; width: 150px; margin-left: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>YOUTH FOR CHRIST</h1>
    <p>P. O. BOX 27605, NAIROBI 00506, Tel. 0202 091951</p>
  </div>
  
  <div class="title">REQUEST FOR FINANCE</div>
  
  <p>I, <strong>${n.user.name}</strong> do request for funds for:</p>
  
  <p class="info-row"><span class="label">Reason:</span> ${n.reason}</p>
  <p class="info-row"><span class="label">Description:</span> ${n.description}</p>
  
  <table>
    <thead>
      <tr>
        <th>Expense Item</th>
        <th class="amount">Amount (KES)</th>
      </tr>
    </thead>
    <tbody>
      ${s.map(e=>`
        <tr>
          <td>${e.item}</td>
          <td class="amount">${e.amount.toLocaleString()}</td>
        </tr>
      `).join("")}
      <tr class="total-row">
        <td>Total</td>
        <td class="amount">${n.totalAmount.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>
  
  <p class="info-row"><span class="label">Amount in words:</span> ${function e(t){let a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];return 0===t?"Zero":t<10?a[t]:t<20?["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"][t-10]:t<100?["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"][Math.floor(t/10)]+(t%10?"-"+a[t%10]:""):t<1e3?a[Math.floor(t/100)]+" Hundred"+(t%100?" and "+e(t%100):""):t<1e6?e(Math.floor(t/1e3))+" Thousand"+(t%1e3?" "+e(t%1e3):""):t.toString()}(Math.floor(n.totalAmount))} Kenya Shillings</p>
  <p class="info-row"><span class="label">Account to be charged:</span> ${n.accountToCharge||"N/A"}</p>
  <p class="info-row"><span class="label">Event Date:</span> ${new Date(n.eventDate).toLocaleDateString()}</p>
  <p class="info-row"><span class="label">Date Needed:</span> ${new Date(n.dateNeeded).toLocaleDateString()}</p>
  ${n.participants?`<p class="info-row"><span class="label">Participants:</span> ${n.participants}</p>`:""}
  ${n.transportDistance?`<p class="info-row"><span class="label">Transport Distance:</span> ${n.transportDistance}</p>`:""}
  ${n.transportQuantity?`<p class="info-row"><span class="label">Transport Quantity:</span> ${n.transportQuantity}</p>`:""}
  <p class="info-row"><span class="label">Status:</span> ${n.status}</p>
  
  <div class="signature-section">
    <p class="signature-row"><span class="label">Checked by:</span> <span class="line">${n.checkedBy?.name||""}</span> Date: <span class="line">${n.checkedAt?new Date(n.checkedAt).toLocaleDateString():""}</span></p>
    <p class="signature-row"><span class="label">Approved by:</span> <span class="line">${n.approvedBy?.name||""}</span> Date: <span class="line">${n.approvedAt?new Date(n.approvedAt).toLocaleDateString():""}</span></p>
    <p class="signature-row"><span class="label">Account's office:</span> <span class="line"></span> Date: <span class="line">${n.disbursedAt?new Date(n.disbursedAt).toLocaleDateString():""}</span></p>
  </div>
</body>
</html>`;return new w.NextResponse(o,{headers:{"Content-Type":"application/msword","Content-Disposition":`attachment; filename="requisition-${r}.doc"`}})}catch(e){return console.error("Export requisition error:",e),w.NextResponse.json({error:"Internal server error"},{status:500})}}e.s(["GET",()=>b],54342);var y=e.i(54342);let E=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/requisitions/export/route",pathname:"/api/requisitions/export",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/requisitions/export/route.ts",nextConfigOutput:"standalone",userland:y}),{workAsyncStorage:A,workUnitAsyncStorage:T,serverHooks:C}=E;function N(){return(0,r.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:T})}async function S(e,t,r){E.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let w="/api/requisitions/export/route";w=w.replace(/\/index$/,"")||"/";let v=await E.prepare(e,t,{srcPage:w,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:R,params:b,nextConfig:y,parsedUrl:A,isDraftMode:T,prerenderManifest:C,routerServerContext:N,isOnDemandRevalidate:S,revalidateOnlyGenerated:D,resolvedPathname:q,clientReferenceManifest:$,serverActionsManifest:O}=v,k=(0,i.normalizeAppPath)(w),P=!!(C.dynamicRoutes[k]||C.routes[q]),I=async()=>((null==N?void 0:N.render404)?await N.render404(e,t,A,!1):t.end("This page could not be found"),null);if(P&&!T){let e=!!C.routes[q],t=C.dynamicRoutes[k];if(t&&!1===t.fallback&&!e){if(y.experimental.adapterPath)return await I();throw new g.NoFallbackError}}let U=null;!P||E.isDev||T||(U="/index"===(U=q)?"/":U);let j=!0===E.isDev||!P,H=P&&!j;O&&$&&(0,o.setManifestsSingleton)({page:w,clientReferenceManifest:$,serverActionsManifest:O});let _=e.method||"GET",F=(0,s.getTracer)(),M=F.getActiveScopeSpan(),L={params:b,prerenderManifest:C,renderOpts:{experimental:{authInterrupts:!!y.experimental.authInterrupts},cacheComponents:!!y.cacheComponents,supportsDynamicResponse:j,incrementalCache:(0,n.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:y.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,r,n)=>E.onRequestError(e,t,r,n,N)},sharedContext:{buildId:R}},B=new l.NodeNextRequest(e),K=new l.NodeNextResponse(t),z=p.NextRequestAdapter.fromNodeNextRequest(B,(0,p.signalFromNodeResponse)(t));try{let o=async e=>E.handle(z,L).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=F.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let r=a.get("next.route");if(r){let t=`${_} ${r}`;e.setAttributes({"next.route":r,"http.route":r,"next.span_name":t}),e.updateName(t)}else e.updateName(`${_} ${w}`)}),i=!!(0,n.getRequestMeta)(e,"minimalMode"),l=async n=>{var s,l;let p=async({previousCacheEntry:a})=>{try{if(!i&&S&&D&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await o(n);e.fetchMetrics=L.renderOpts.fetchMetrics;let l=L.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let p=L.renderOpts.collectedTags;if(!P)return await (0,u.sendResponse)(B,K,s,L.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(s.headers);p&&(t[f.NEXT_CACHE_TAGS_HEADER]=p),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==L.renderOpts.collectedRevalidate&&!(L.renderOpts.collectedRevalidate>=f.INFINITE_CACHE)&&L.renderOpts.collectedRevalidate,r=void 0===L.renderOpts.collectedExpire||L.renderOpts.collectedExpire>=f.INFINITE_CACHE?void 0:L.renderOpts.collectedExpire;return{value:{kind:m.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:r}}}}catch(t){throw(null==a?void 0:a.isStale)&&await E.onRequestError(e,t,{routerKind:"App Router",routePath:w,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:S})},!1,N),t}},d=await E.handleResponse({req:e,nextConfig:y,cacheKey:U,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:C,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:D,responseGenerator:p,waitUntil:r.waitUntil,isMinimalMode:i});if(!P)return null;if((null==d||null==(s=d.value)?void 0:s.kind)!==m.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==d||null==(l=d.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});i||t.setHeader("x-nextjs-cache",S?"REVALIDATED":d.isMiss?"MISS":d.isStale?"STALE":"HIT"),T&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let g=(0,h.fromNodeOutgoingHttpHeaders)(d.value.headers);return i&&P||g.delete(f.NEXT_CACHE_TAGS_HEADER),!d.cacheControl||t.getHeader("Cache-Control")||g.get("Cache-Control")||g.set("Cache-Control",(0,x.getCacheControlHeader)(d.cacheControl)),await (0,u.sendResponse)(B,K,new Response(d.value.body,{headers:g,status:d.value.status||200})),null};M?await l(M):await F.withPropagatedContext(e.headers,()=>F.trace(d.BaseServerSpan.handleRequest,{spanName:`${_} ${w}`,kind:s.SpanKind.SERVER,attributes:{"http.method":_,"http.target":e.url}},l))}catch(t){if(t instanceof g.NoFallbackError||await E.onRequestError(e,t,{routerKind:"App Router",routePath:k,routeType:"route",revalidateReason:(0,c.getRevalidateReason)({isStaticGeneration:H,isOnDemandRevalidate:S})},!1,N),P)throw t;return await (0,u.sendResponse)(B,K,new Response(null,{status:500})),null}}e.s(["handler",()=>S,"patchFetch",()=>N,"routeModule",()=>E,"serverHooks",()=>C,"workAsyncStorage",()=>A,"workUnitAsyncStorage",()=>T],21966)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__f65ae4b5._.js.map