(()=>{
// ChatGPT Ads Pixel. Production mode; SDK loads asynchronously on each Western page.
(function(w,d,s,u){
  if(w.oaiq)return;
  var q=function(){q.q.push(arguments)};q.q=[];
  w.oaiq=q;
  var j=d.createElement(s);j.async=1;j.src=u;
  var f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f);
})(window,document,"script","https://bzrcdn.openai.com/sdk/oaiq.min.js");
window.oaiq("init",{pixelId:"6AaXbGXgDzrjwCavuopa5S"});
const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector(".navlinks");
if(toggle&&nav)toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));});
// Preserve ad-source parameters while a visitor moves between site pages.
// Only source identifiers are held in this tab's session; no form fields are stored.
const attributionKeys=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","oppref","gclid","msclkid"];
const query=new URLSearchParams(location.search);
const attribution={};
try{
 const previous=JSON.parse(sessionStorage.getItem("western_attribution")||"{}");
 for(const key of attributionKeys){
  const incoming=query.get(key);
  if(incoming&&incoming.length<=2048)attribution[key]=incoming;
  else if(typeof previous[key]==="string")attribution[key]=previous[key];
 }
 sessionStorage.setItem("western_attribution",JSON.stringify(attribution));
}catch(_){
 for(const key of attributionKeys){const incoming=query.get(key);if(incoming&&incoming.length<=2048)attribution[key]=incoming;}
}
// TEST-ONLY handoff. The live form keeps its original behavior until the
// shared Google Apps Script is updated and the verified path passes a real test.
const verifiedIntakeTest=new URLSearchParams(location.search).get("intake_test")==="1";
let testToken="";
let testConfirmed=false;
if(verifiedIntakeTest){
 const frame=document.createElement("iframe");
 frame.name="western-verified-intake-frame";
 frame.title="Lead submission acknowledgement";
 frame.setAttribute("aria-hidden","true");
 frame.style.cssText="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;border:0";
 document.body.appendChild(frame);
 window.addEventListener("message",ev=>{
  const data=ev.data;
  const fromGoogle=ev.origin==="null"||ev.origin==="https://script.google.com"||(/^https:\/\/[a-z0-9.-]+\.googleusercontent\.com$/i).test(ev.origin);
  if(!fromGoogle||!data||typeof data!=="object"||data.source!=="western-gas-intake"||data.status!=="saved"||data.token!==testToken||!testToken||testConfirmed)return;
  testConfirmed=true;
  try{sessionStorage.setItem("western_verified_lead",JSON.stringify({token:testToken,at:Date.now()}));}catch(_){}
  location.assign("/thanks.html");
 });
}
const form=document.getElementById("quote-form");
if(form)form.addEventListener("submit",e=>{
 const f=new FormData(form),v=k=>String(f.get(k)||"").trim();
 const feedback=document.getElementById("form-feedback");
 const required=["fullName","email","state","service","description"];
 if(required.some(k=>!v(k))||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))){
  e.preventDefault();
  if(feedback){feedback.textContent="Please complete the required fields and provide a valid email address.";feedback.classList.add("error");}
  return;
 }
 document.getElementById("lead-name").value=v("fullName");
 document.getElementById("lead-city").value=v("address")||v("state");
 const source=attributionKeys.filter(k=>attribution[k]).map(k=>k+": "+attribution[k]).join("\n");
 if(verifiedIntakeTest){
  // Route only explicit validation requests to the newly deployed Apps Script.
  // Production traffic remains on the known-working shared intake endpoint.
  form.action="https://script.google.com/macros/s/AKfycbyzoTmhY30MNzPnFrC6DuP9GEuZZdUHW3nsk6rYPwORkaq8-mszZd9s9yS-yVhkkDRQlw/exec";
  form.target="western-verified-intake-frame";
  const bytes=new Uint8Array(16);
  if(!window.crypto||!window.crypto.getRandomValues){e.preventDefault();if(feedback){feedback.textContent="Secure browser support is required to run this test.";feedback.classList.add("error");}return;}
  window.crypto.getRandomValues(bytes);
  testToken=Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
  let idField=form.querySelector('input[name="submission_id"]');
  if(!idField){idField=document.createElement("input");idField.type="hidden";idField.name="submission_id";form.appendChild(idField);}
  idField.value=testToken;
 }
 // Store source tags in the existing Google Sheet's UTM columns, where available.
 for(const name of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]){
  let field=form.querySelector('input[name="'+name+'"]');
  if(!field){field=document.createElement("input");field.type="hidden";field.name=name;form.appendChild(field);}
  field.value=attribution[name]||"";
 }
 document.getElementById("lead-project").value=[
  "Brand: Western Electrical Engineering, PLLC","Company: "+v("company"),"State: "+v("state"),
  "Project type: "+v("service"),"Location: "+v("address"),"Deadline: "+v("deadline"),
  "Budget: "+v("budget"),"Project scope: "+v("description"),"Traffic: "+(source||"Unspecified")
 ].join("\n");
 // Mark the pending submission so conversion can be reported only after a return to
 // the first-party confirmation page. The external Google Apps Script intake
 // currently responds on script.google.com, so this alone does NOT verify success.
 try{sessionStorage.setItem("western_pending_lead",String(Date.now()));}catch(_){}
 if(feedback){feedback.classList.remove("error");feedback.textContent="Submitting your project request…";}
 const button=form.querySelector("[type=submit]");if(button){button.disabled=true;button.textContent="Submitting…";}
 if(verifiedIntakeTest){
  const thisToken=testToken;
  window.setTimeout(()=>{
   if(testConfirmed||thisToken!==testToken)return;
   if(feedback){feedback.textContent="The test submission was not confirmed. Check the lead email or sheet before trying again. If the Google Apps Script has not been redeployed, it cannot return a verified acknowledgement.";feedback.classList.add("error");}
   const button=form.querySelector("[type=submit]");
   if(button){button.disabled=false;button.textContent="Retry submission";}
  },15000);
 }
 window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_form_submit_attempt"});
});
document.querySelectorAll(".logo > svg").forEach(el=>{const im=document.createElement("img");im.src=el.closest(".footer")?"/assets/logo-symbol-reversed.svg":"/assets/logo-symbol.svg";im.alt="Western Electrical Engineering lightning W";im.width=51;im.height=51;el.replaceWith(im);});
document.querySelectorAll('a[href^="mailto:proposals@westernengineer.com"]').forEach(a=>{a.href="mailto:casey@westernengineer.com";if(a.textContent.trim()==="proposals@westernengineer.com")a.textContent="casey@westernengineer.com";});
document.querySelectorAll('link[rel="icon"]').forEach(a=>a.href="/assets/brand-favicon.svg");
document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.addEventListener("click",()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_phone_click"});}));
document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.addEventListener("click",()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_email_click"});}));

// A confirmed Apps Script acknowledgement is required for a lead conversion;
// a bare visit to thanks.html or a form submit attempt is insufficient.
if(location.pathname.replace(/\/+$/,"").endsWith("/thanks.html")){
 let verified=null;
 try{verified=JSON.parse(sessionStorage.getItem("western_verified_lead")||"null");}catch(_){}
 const age=Date.now()-Number(verified&&verified.at||0);
 if(verified&&/^[a-f0-9]{32}$/.test(verified.token)&&age>=0&&age<=15*60*1000){
  try{sessionStorage.removeItem("western_verified_lead");sessionStorage.removeItem("western_pending_lead");}catch(_){}
  window.oaiq("measure","lead_created",{type:"customer_action"});
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push({event:"western_lead_form_confirmation",form_name:"proposal_request"});
 }
}
})();