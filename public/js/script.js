const sidebarLink = document.querySelectorAll('.side-bar .nav-link');
const currentUrl = window.location.href;

sidebarLink.forEach(link => {
  if(link.href === currentUrl) {
    link.classList.remove('link-body-emphasis');
    link.classList.add('active-sidebar');
  }
});

const pwInput = document.querySelector('#inputPassword');
const togglePw = document.querySelector('#togglePw');

if( pwInput && togglePw ) {
  togglePw.addEventListener('click', function() {
    const type = pwInput.getAttribute('type') === 'password' ? 'text' : 'password';
    pwInput.setAttribute('type', type);
  
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
  });
}

const pwInputEdit = document.querySelector('#inputPasswordEdit');
const togglePwEdit = document.querySelector('#togglePwEdit');

if (pwInputEdit && togglePwEdit) {
  togglePwEdit.addEventListener('click', function() {
    const type = pwInputEdit.getAttribute('type') === 'password' ? 'text' : 'password';
    pwInputEdit.setAttribute('type', type);
  
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
  });
}

const addUserForm = document.getElementById('addUserForm');
const addModal = document.getElementById('addModal');

if (addUserForm && addModal) {
  const bsModal = new bootstrap.Modal(addModal);
  
  addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const formData = {
      username: document.getElementById('inputUsername').value,
      name: document.getElementById('inputName').value,
      password: document.getElementById('inputPassword').value,
      role: document.getElementById('inputRole').value,
    }
  
    try {
      const response = await fetch('/admin/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
  
      if (response.ok) {
        bsModal.hide();
        addUserForm.reset();
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error', error);
      alert('Failed to add user')
    }
  });
}

const editModal = document.getElementById('editModal');
const editUserForm = document.getElementById('editUserForm');

if (editModal) {
  editModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;

    const userId = button.getAttribute('data-id');
    const username = button.getAttribute('data-username');
    const name = button.getAttribute('data-name');
    const role = button.getAttribute('data-role');

    document.getElementById('editUserId').value = userId;
    document.getElementById('inputUsernameEdit').value = username;
    document.getElementById('inputNameEdit').value = name;
    document.getElementById('inputRoleEdit').value = role;
    document.getElementById('inputPasswordEdit').value = '';
  });
}

if (editUserForm) {
  const bsEditModal = new bootstrap.Modal(editModal);

  editUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const password = document.getElementById('inputPasswordEdit').value;
    
    const formData = {
      username: document.getElementById('inputUsernameEdit').value || null,
      name: document.getElementById('inputNameEdit').value || null,
      role: document.getElementById('inputRoleEdit').value || null
    };

    if (password && password.trim() !== '') {
      formData.password = password.trim();
    }

    try {
      const response = await fetch(`/admin/edit/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        bsEditModal.hide();
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update');
    }
  });

  const deleteUserBtn = document.getElementById('deleteUserBtn');

  if (deleteUserBtn) {
    deleteUserBtn.addEventListener('click', async () => {
      if(confirm('Apakah kamu yakin untuk menghapus user ini?')) {
        const userId = document.getElementById('editUserId').value;

        try {
          const response = await fetch(`/admin/delete/${userId}`, {
            method: 'POST'
          });

          if (response.ok) {
            window.location.reload();
          } else {
            const error = await response.json();
            alert(error.message || 'Failed to delete user');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Failed to delete user');
        }
      }
    });
  }
}

const addDosirForm = document.getElementById('addDosirForm');
const addDosirModal = document.getElementById('addModal');

if (addDosirForm && addDosirModal) {
  const bsModal = new bootstrap.Modal(addDosirModal);

  addDosirForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      notas: document.getElementById('inputNotas').value,
      no_dosir: document.getElementById('inputNoDosir').value,
      name: document.getElementById('inputName').value,
      shelf: document.getElementById('inputShelf').value,
    }

    try {
      const response = await fetch('/user/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        bsModal.hide();
        addDosirForm.reset();
        window.location.reload();
      } else {
        const error = await response.json();
        console.log(error.message);
      }
    } catch (error) {
      console.error('Error', error);
      alert(error)
    }
  });
}

const editDosirModal = document.getElementById('editModal');
const editDosirForm = document.getElementById('editDosirForm');

if (editDosirModal) {
  editDosirModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    
    const dosirId = button.getAttribute('data-id');
    const notas = button.getAttribute('data-notas');
    const noDosir = button.getAttribute('data-nodosir');
    const name = button.getAttribute('data-name');
    const shelf = button.getAttribute('data-shelf');

    document.getElementById('editDosirId').value = dosirId;
    document.getElementById('inputNotasEdit').value = notas;
    document.getElementById('inputNoDosirEdit').value = noDosir;
    document.getElementById('inputNameEdit').value = name;
    document.getElementById('inputShelfEdit').value = shelf;
  });
}

if (editDosirForm) {
  const bsEditModal = new bootstrap.Modal(editDosirModal);

  editDosirForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dosirId = document.getElementById('editDosirId').value;
    
    const formData = {
      notas: document.getElementById('inputNotasEdit').value,
      no_dosir: document.getElementById('inputNoDosirEdit').value,
      name: document.getElementById('inputNameEdit').value,
      shelf: document.getElementById('inputShelfEdit').value
    };

    try {
      const response = await fetch(`/user/edit/${dosirId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        bsEditModal.hide();
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update');
    }
  });

  const deleteDosirBtn = document.getElementById('deleteDosirBtn');

  if (deleteDosirBtn) {
    deleteDosirBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this dosir?')) {
        const dosirId = document.getElementById('editDosirId').value;
        
        try {
          const response = await fetch(`/user/delete/${dosirId}`, {
            method: 'POST'
          });

          if (response.ok) {
            bsEditModal.hide();
            window.location.reload();
          } else {
            const error = await response.json();
            alert(error.message || 'Failed to delete');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Failed to delete', error);
        }
      }
    });
  }
}

const searchInput = document.getElementById('inputSearch');
const searchForm = document.querySelector('form[role="search"]');

if (searchInput && searchForm) {
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchValue = searchInput.value.trim();
    const currentPath = window.location.pathname;

    if (searchValue) {
      if (currentPath.includes('/user/')) {
        window.location.href = `/user/dosirs/search?search=${encodeURIComponent(searchValue)}`;
      } else if (currentPath.includes('/admin/')) {
        window.location.href = `/admin/users/search?search=${encodeURIComponent(searchValue)}`;
      }
    } else {
      if (currentPath.includes('/user/')) {
        window.location.href = '/user/dosirs';
      } else if (currentPath.includes('/admin/')) {
        window.location.href = '/admin/users';
      }
    }
  });
}

function previewImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('preview').src = e.target.result;
    }
    reader.readAsDataURL(input.files[0]);
  }
}

const currentPassword = document.querySelector('#currentPassword');
const toggleCurrentPw = document.querySelector('#toggleCurrentPw');

if (currentPassword && toggleCurrentPw) {
  toggleCurrentPw.addEventListener('click', function() {
    const type = currentPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    currentPassword.setAttribute('type', type);

    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
  });
}

const confirmPwInput = document.querySelector('#confirmPassword');
const toggleConfirmPw = document.querySelector('#toggleConfirmPw');

if (confirmPwInput && toggleConfirmPw) {
  toggleConfirmPw.addEventListener('click', function() {
    const type = confirmPwInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPwInput.setAttribute('type', type);
    
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
  });
}

const newPassword = document.querySelector('#newPassword');
const toggleNewPw = document.querySelector('#toggleNewPw');

if (newPassword && toggleNewPw) {
  toggleNewPw.addEventListener('click', function() {
    const type = newPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    newPassword.setAttribute('type', type);
    
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
  });
}
