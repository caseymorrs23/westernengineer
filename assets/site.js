(()=>{
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
 document.getElementById("lead-project").value=[
  "Brand: Western Electrical Engineering, PLLC","Company: "+v("company"),"State: "+v("state"),
  "Project type: "+v("service"),"Location: "+v("address"),"Deadline: "+v("deadline"),
  "Budget: "+v("budget"),"Project scope: "+v("description"),"Traffic: "+(source||"Unspecified")
 ].join("\n");
 if(feedback){feedback.classList.remove("error");feedback.textContent="Submitting your project request…";}
 const button=form.querySelector("[type=submit]");if(button){button.disabled=true;button.textContent="Submitting…";}
 window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_form_submit_attempt"});
});
document.querySelectorAll(".logo > svg").forEach(el=>{const im=document.createElement("img");im.src=el.closest(".footer")?"/assets/logo-symbol-reversed.svg":"/assets/logo-symbol.svg";im.alt="Western Electrical Engineering lightning W";im.width=51;im.height=51;el.replaceWith(im);});
document.querySelectorAll('a[href^="mailto:proposals@westernengineer.com"]').forEach(a=>{a.href="mailto:casey@westernengineer.com";if(a.textContent.trim()==="proposals@westernengineer.com")a.textContent="casey@westernengineer.com";});
document.querySelectorAll('link[rel="icon"]').forEach(a=>a.href="/assets/brand-favicon.svg");
document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.addEventListener("click",()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_phone_click"});}));
document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.addEventListener("click",()=>{window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:"western_email_click"});}));
})();