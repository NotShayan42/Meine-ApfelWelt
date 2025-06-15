document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-msg');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value.trim();

    const correctHash = 'cec259e2ddd91aa090d3bc8a13bcb245';
    const inputHash = md5(password);

    if (inputHash === correctHash) {
      localStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'main.html';
    } else {
      errorMessage.textContent = 'Incorrect password.';
      document.getElementById('password').value = '';
    }
  });
});
