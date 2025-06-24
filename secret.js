document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-msg');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value.trim();
    const correctHash = '23e78862efd451fc4cfc68dc2471af6d5180d5309eba53879dd60f07ab6c9f3c';

    const inputHash = await hashSHA256(password);

    if (inputHash === correctHash) {
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'main.html';
    } else {
      errorMessage.textContent = 'Incorrect password.';
      document.getElementById('password').value = '';
    }
  });

  async function hashSHA256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
});
