document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const correctPassword = 'apfel123';

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;

    if (password === correctPassword) {
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'main.html';
    } else {
      errorMessage.textContent = 'Incorrect password. Please try again.';
      document.getElementById('password').value = '';
    }
  });

  // Überprüft ob der Nutzer bereits angemeldet ist
  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'main.html';
  }
});