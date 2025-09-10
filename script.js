const API_URL = "http://localhost:3000/users";

// Navbar
function setLoggedInUser(user){ localStorage.setItem("loggedInUser", JSON.stringify(user)); }
function getLoggedInUser(){ return JSON.parse(localStorage.getItem("loggedInUser")); }
function logoutUser(){ localStorage.removeItem("loggedInUser"); updateNavbar(); window.location.href="index.html?page=login"; }
function updateNavbar(){
  const user=getLoggedInUser(), nav=document.getElementById("navbar"); if(!nav) return;
  if(user){
    nav.innerHTML=`<li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
    <li class="nav-item"><a class="nav-link" href="profile.html">Profile</a></li>
    <li class="nav-item"><a class="nav-link" href="#" onclick="logoutUser()">Logout</a></li>`;
  } else {
    nav.innerHTML=`<li class="nav-item"><a class="nav-link" href="?page=login">Login</a></li>
    <li class="nav-item"><a class="nav-link" href="?page=register">Register</a></li>`;
  }
}
window.onload=updateNavbar;

// Show/Hide Password
function togglePassword(id,toggleId){
  const input=document.getElementById(id), toggle=document.getElementById(toggleId);
  if(input.type==="password"){ input.type="text"; toggle.textContent="🙈"; } else { input.type="password"; toggle.textContent="👁"; }
}

// Form Switching
function showRegister(){ document.getElementById("loginCard")?.classList.add("d-none"); document.getElementById("registerCard")?.classList.remove("d-none"); }
function showLogin(){ document.getElementById("registerCard")?.classList.add("d-none"); document.getElementById("loginCard")?.classList.remove("d-none"); }
window.addEventListener("DOMContentLoaded",()=>{ const params=new URLSearchParams(window.location.search), page=params.get("page"); page==="register"?showRegister():showLogin(); });

// Inputs
const nameInput=document.getElementById("regName");
const emailInput=document.getElementById("regEmail");
const aboutInput=document.getElementById("regAbout");
const passwordInput=document.getElementById("regPassword");

// Live Feedback
nameInput?.addEventListener("input",()=>{ document.getElementById("nameFeedback").textContent=nameInput.value.trim()===""?"❌ Name required":"✅ Looks good!"; });
emailInput?.addEventListener("input",()=>{ const regex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/; document.getElementById("emailFeedback").textContent=regex.test(emailInput.value)?"✅ Valid email":"❌ Invalid email"; });
aboutInput?.addEventListener("input",()=>{ const len=aboutInput.value.length; document.getElementById("aboutFeedback").textContent=len>200?"❌ Max 200 chars":`${len}/200 chars`; });
passwordInput?.addEventListener("input",()=>{
  const val=passwordInput.value;
  const rules=[{regex:/.{8,}/,el:"length"},{regex:/[A-Z]/,el:"uppercase"},{regex:/[a-z]/,el:"lowercase"},{regex:/[0-9]/,el:"number"},{regex:/[@$!%*?&]/,el:"special"}];
  rules.forEach(r=>{ const e=document.getElementById(r.el); if(r.regex.test(val)){ e.textContent=`✅ ${e.dataset.text}`; e.style.color="green"; } else { e.textContent=`❌ ${e.dataset.text}`; e.style.color="red"; } });
});

// Registration Submit
document.getElementById("registerForm")?.addEventListener("submit",async e=>{
  e.preventDefault();
  const userData={name:nameInput.value,email:emailInput.value,password:passwordInput.value,about:aboutInput.value};
  const val=passwordInput.value;
  const valid=/.{8,}/.test(val)&&/[A-Z]/.test(val)&&/[a-z]/.test(val)&&/[0-9]/.test(val)&&/[@$!%*?&]/.test(val);
  if(!valid){ alert("❌ Password does not meet requirements!"); return; }
  const resCheck=await fetch(`${API_URL}?email=${userData.email}`);
  const existing=await resCheck.json();
  if(existing.length>0){ alert("❌ Email already registered!"); return; }
  const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(userData)});
  if(res.ok){ alert("🎉 Registered successfully! Please login."); window.location.href="index.html?page=login"; } else { alert("❌ Registration failed. Try again!"); }
});

// Login Submit
document.getElementById("loginForm")?.addEventListener("submit",async e=>{
  e.preventDefault();
  const email=document.getElementById("loginEmail").value;
  const password=document.getElementById("loginPassword").value;
  const res=await fetch(`${API_URL}?email=${email}`);
  const users=await res.json();
  if(users.length===0){ alert("❌ User not found. Please register!"); return; }
  const user=users.find(u=>u.password===password);
  if(user){ setLoggedInUser(user); alert(`🎉 Welcome back, ${user.name}`); window.location.href="profile.html"; } else { alert("❌ Incorrect password!"); }
});

// Profile Page
if(window.location.pathname.includes("profile.html")){
  let user=getLoggedInUser();
  if(!user) window.location.href="index.html?page=login";
  else{
    document.getElementById("userName").textContent=user.name;
    document.getElementById("userEmail").textContent=user.email;
    document.getElementById("userAbout").textContent=user.about||"—";
  }
}

// Delete Account
async function deleteAccount(){
  const user=getLoggedInUser();
  if(!user) return;
  const res=await fetch(`${API_URL}?email=${user.email}`);
  const users=await res.json();
  if(users.length>0){
    await fetch(`${API_URL}/${users[0].id}`,{method:"DELETE"});
    localStorage.removeItem("loggedInUser");
    alert("✅ Account deleted successfully!");
    window.location.href="index.html?page=login";
  }
}
