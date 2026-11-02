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
 // Western GA4. Tag Manager is installed separately; use this explicit Google
 // tag to ensure Western has page-view and saved-lead event measurement.
 // Do not add a second GA4 page-view tag for this same stream in GTM.
 const westernGa4Id="G-RV64BEFKF2";
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
 if(!document.querySelector('script[data-western-ga4]')){
  const ga4Script=document.createElement("script");
  ga4Script.async=true;
  ga4Script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(westernGa4Id);
  ga4Script.setAttribute("data-western-ga4","1");
  document.head.appendChild(ga4Script);
 }
 window.gtag("js",new Date());
 window.gtag("config",westernGa4Id);

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
// Use the verified Apps Script handoff for regular quote-form submissions.
// A matching saved-lead acknowledgement is required before redirecting.
const verifiedIntakeEnabled=!!document.getElementById("quote-form");
let testToken="";
let testConfirmed=false;
if(verifiedIntakeEnabled){
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
 if(verifiedIntakeEnabled){
  // Submit to the shared PNW/Western lead intake and wait for a save acknowledgement.
  form.action="https://script.google.com/macros/s/AKfycbwi87wMohuWu9zdJ5lzmerR5r_1GL0HhHto0Kh5WIRgtdLTvWkh4oXPVyKLzXEaVRshkA/exec";
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
 if(verifiedIntakeEnabled){
  const thisToken=testToken;
  window.setTimeout(()=>{
   if(testConfirmed||thisToken!==testToken)return;
   if(feedback){feedback.textContent="We could not confirm the submission. Please contact us directly or check with our office before trying again to avoid duplicate requests.";feedback.classList.add("error");}
   const button=form.querySelector("[type=submit]");
   if(button){button.disabled=false;button.textContent="Retry submission";}
  },15000);
 }
 window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_form_submit_attempt"});
});
document.querySelectorAll(".logo > svg").forEach(el=>{const im=document.createElement("img");im.src=el.closest(".footer")?"/assets/logo-symbol-reversed.svg":"/assets/logo-symbol.svg";im.alt="Western Electrical Engineering lightning W";im.width=51;im.height=51;el.replaceWith(im);});
document.querySelectorAll('a[href^="mailto:proposals@westernengineer.com"]').forEach(a=>{a.href="mailto:casey@westernengineer.com";if(a.textContent.trim()==="proposals@westernengineer.com")a.textContent="casey@westernengineer.com";});
document.querySelectorAll('link[rel="icon"]').forEach(a=>a.href="/assets/brand-favicon.svg");
document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.addEventListener("click",()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_phone_click"});window.gtag("event","click_to_call",{send_to:westernGa4Id,contact_method:"phone"});}));
document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.addEventListener("click",()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_email_click"});window.gtag("event","click_to_email",{send_to:westernGa4Id,contact_method:"email"});}));

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
  window.gtag("event","generate_lead",{send_to:westernGa4Id,form_name:"western_proposal_request",lead_source:"website"});
 }
}
})();