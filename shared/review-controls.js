(() => {
  'use strict';
  // These are local prototype defaults, not live site configuration.
  const defaults = {
    academyName: 'Academy of Emerging Creators',
    hero: 'A place for creators to build what comes next.',
    membership: 'Membership starts with an application.',
    intro: 'Applications are reviewed before any invitation or account creation.'
  };
  const fields = {academyName:'setting-name',hero:'setting-hero',membership:'setting-membership',intro:'setting-intro'};
  const previews = {academyName:'preview-name',hero:'preview-hero',membership:'preview-membership',intro:'preview-intro'};
  function values() {return Object.fromEntries(Object.entries(fields).map(([key,id]) => [key,document.getElementById(id).value.trim()]));}
  function refresh() {const v=values();for(const [key,id] of Object.entries(previews)) document.getElementById(id).textContent=v[key]||'—';}
  function reset(){for(const [key,id] of Object.entries(fields)) document.getElementById(id).value=defaults[key];refresh();document.getElementById('settings-status').textContent='Reset to draft defaults. No live change made.';}
  reset();
  Object.values(fields).forEach(id=>document.getElementById(id).addEventListener('input',refresh));
  document.getElementById('settings-reset').addEventListener('click',reset);
  document.getElementById('settings-editor').addEventListener('submit',e=>{
    e.preventDefault();if(!e.currentTarget.reportValidity())return;
    const v=values();
    const proposed={status:'unapproved_offline_review',edited_for:'review_handoff_only',academy:{display_name:v.academyName,home_hero_heading:v.hero,membership:{mode:'application_review',applications_open:false,allow_public_signup:false,heading:v.membership,intro:v.intro,future_modes:['instant_signup_reserved_disabled']}},production:{display_name:'AEC Production',inquiries_open:false,services_confirmed:false},peak_irony:{integrated:false,routing:'none'},publication:{deploy_authorized:false,approved_assets_only:true}};
    const blob=new Blob([JSON.stringify(proposed,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='aec-proposed-site-config.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
    document.getElementById('settings-status').textContent='Proposed JSON downloaded. It has not been applied to a website.';
  });
})();
