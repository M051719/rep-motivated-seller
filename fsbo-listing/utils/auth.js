// auth.js
// Connect login/register forms to backend API and manage user session
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, type: 'login' })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('fsboUser', JSON.stringify({ email, ownerName: data.ownerName }));
      alert('Login successful!');
      window.location.href = '/fsbo-gallery.html';
    } else {
      alert(data.error || 'Login failed.');
    }
  });
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const email = formData.get('email');
    const password = formData.get('password');
    const ownerName = formData.get('ownerName');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ownerName, type: 'register' })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Registration successful! Please log in.');
      window.location.href = '/login.html';
    } else {
      alert(data.error || 'Registration failed.');
    }
  });
}

// User session management for UI
function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem('fsboUser') || 'null');
  const authLink = document.getElementById('auth-link');
  if (authLink) {
    if (user) {
      authLink.textContent = 'Logout (' + user.ownerName + ')';
      authLink.onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('fsboUser');
        window.location.reload();
      };
    } else {
      authLink.textContent = 'Login';
      authLink.href = '/login.html';
      authLink.onclick = null;
    }
  }
}
document.addEventListener('DOMContentLoaded', updateAuthUI);