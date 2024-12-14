const pwInput = document.querySelector('#floatingPassword');
const togglePw = document.querySelector('#togglePw');

togglePw.addEventListener('click', function() {
  const type = pwInput.getAttribute('type') === 'password' ? 'text' : 'password';
  pwInput.setAttribute('type', type);

  this.classList.toggle('fa-eye-slash');
  this.classList.toggle('fa-eye');
});

function showErrorToast(message) {
  const errorToast = document.getElementById('errorToast');
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message;
  
  const toast = new bootstrap.Toast(errorToast, {
    animation: true,
    autohide: true,
    delay: 3000
  });
  
  toast.show();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const formData = new FormData(e.target);
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password')
      })
    });

    const data = await response.json();

    if (data.error) {
      showErrorToast(data.error);
      return;
    }

    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
    
  } catch (error) {
    showErrorToast('An error occurred. Please try again.');
  }
});
