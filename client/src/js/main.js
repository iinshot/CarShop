import { WorkerAPI, DirectorAPI, CompanyAPI, CarAPI,
AdmissionAPI, ClientAPI, ExpanseAPI, AccountantAPI,
DriverAPI, SellerAPI, LifeguardAPI, AuthAPI } from './api.js';

const API_BASE_URL = 'http://localhost:8000';
let authToken = null;
let currentUserRole = null;
let isAuthenticated = false;

function initAuth() {
    const savedToken = localStorage.getItem('authToken');
    const savedRole = localStorage.getItem('userRole');

    if (savedToken && savedRole) {
        authToken = savedToken;
        currentUserRole = savedRole;
        isAuthenticated = true;
        updateAuthUI();
    } else {
        isAuthenticated = false;
        currentUserRole = null;
        updateAuthUI();
    }
}

function handleLogout() {
    fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    }).catch(err => console.error('Logout error:', err));

    AuthAPI.logout();

    isAuthenticated = false;
    currentUserRole = null;

    document.body.className = 'guest-theme';
    document.querySelector('.user-name').textContent = 'Гость';

    document.querySelectorAll('.action-btn').forEach(btn => {
        if (btn.textContent.includes('Вход') || btn.textContent.includes('Регистрация')) {
            btn.style.display = 'inline-block';
        }
    });
    document.querySelector('.logout-btn').style.display = 'none';

    loadView('dashboard');

    showToast('Вы успешно вышли из системы');
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const view = this.getAttribute('data-view');

        if (!isAuthenticated && view !== 'about') {
            showToast('Необходимо авторизоваться', 'error');
            return;
        }
        loadView(view);
    });
});

function updateAuthUI() {
    const userPanel = document.querySelector('.user-panel');
    if (!userPanel) return;

    if (isAuthenticated) {
        document.querySelectorAll('.action-btn').forEach(btn => {
            if (btn.textContent.includes('Вход') || btn.textContent.includes('Регистрация')) {
                btn.style.display = 'none';
            }
        });

        document.querySelector('.logout-btn').style.display = 'flex';
        document.body.className = `${currentUserRole}-theme`;
        userPanel.querySelector('.user-name').textContent =
            currentUserRole === 'admin' ? 'Администратор' : 'Пользователь';
    } else {
        document.querySelectorAll('.action-btn').forEach(btn => {
            if (btn.textContent.includes('Вход') || btn.textContent.includes('Регистрация')) {
                btn.style.display = 'inline-block';
            }
        });

        document.querySelector('.logout-btn').style.display = 'none';
        document.body.className = 'guest-theme';
        userPanel.querySelector('.user-name').textContent = 'Гость';
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';

    if (type === 'error') {
        toast.style.backgroundColor = '#f44336';
        toast.style.color = 'white';
    } else {
        toast.style.backgroundColor = '#4CAF50';
        toast.style.color = 'white';
    }

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }, 100);
}

function initUserTheme() {
  const savedTheme = localStorage.getItem('userTheme') || 'admin';
  const body = document.body;
  const userPanel = document.querySelector('.user-panel');
  const userName = userPanel.querySelector('.user-name');

  if (!userName) return;

  if (savedTheme === 'user') {
    body.className = 'user-theme';
    userName.textContent = 'Пользователь';
  } else {
    body.className = 'admin-theme';
    userName.textContent = 'Администратор';
  }
}

function setActiveNavItem(view) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.view === view);
  });
}

async function loadView(view) {
  setActiveNavItem(view);
  const contentArea = document.getElementById('content-area');

  if (view === 'dashboard'){
    contentArea.innerHTML = `
        <div class="content-wrapper" id="content-area">
            <div class="welcome-message">
                <h2>Добро пожаловать в систему управления AutoCompany</h2>
                <p>Выберите раздел в боковом меню для начала работы</p>
            </div>
        </div>
    `;
    updateStats();
  }
  if (view === 'references') {
    contentArea.innerHTML = `
      <div class="entities-container">
        <h2>Справочники</h2>
        <div class="entities-grid">
          <button class="entity-btn" data-entity="workers">
            <i class="fas fa-users"></i>
            <span>Сотрудники</span>
          </button>
          <button class="entity-btn" data-entity="directors">
            <i class="fas fa-user-tie"></i>
            <span>Директора</span>
          </button>
          <button class="entity-btn" data-entity="companies">
            <i class="fas fa-building"></i>
            <span>Компании</span>
          </button>
          <button class="entity-btn" data-entity="accountants">
            <i class="fas fa-file-invoice-dollar"></i>
            <span>Бухгалтера</span>
          </button>
          <button class="entity-btn" data-entity="lifeguards">
            <i class="fas fa-lock"></i>
            <span>Охрана</span>
          </button>
          <button class="entity-btn" data-entity="drivers">
            <i class="fas fa-truck"></i>
            <span>Водители</span>
          </button>
          <button class="entity-btn" data-entity="sellers">
            <i class="fas fa-cash-register"></i>
            <span>Продавцы</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-id-card"></i>
            <span>Логисты</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-wrench"></i>
            <span>Механики</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-recycle"></i>
            <span>Уборщики</span>
          </button>
        </div>
      </div>
    `;

    document.querySelectorAll('.entity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = `${btn.getAttribute('data-entity')}.html`;
      });
    });
  }
  if (view === 'data'){
    contentArea.innerHTML = `
      <div class="entities-container">
        <h2>Данные</h2>
        <div class="entities-grid">
          <button class="entity-btn" data-entity="cars">
            <i class="fas fa-car"></i>
            <span>Автомобили</span>
          </button>
          <button class="entity-btn" data-entity="expanses">
            <i class="fas fa-book"></i>
            <span>Журнал расходов</span>
          </button>
          <button class="entity-btn" data-entity="admissions">
            <i class="fas fa-clipboard-list"></i>
            <span>Журнал учета</span>
          </button>
          <button class="entity-btn" data-entity="clients">
            <i class="fas fa-handshake"></i>
            <span>Клиенты</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-question"></i>
            <span>Обратная связь</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-calendar"></i>
            <span>Журнал уборки</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-bullhorn"></i>
            <span>Новости</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-certificate"></i>
            <span>Сертификаты</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-map"></i>
            <span>Карта</span>
          </button>
          <button class="entity-btn">
            <i class="fas fa-shopping-cart"></i>
            <span>Корзина</span>
          </button>
        </div>
      </div>
    `;

    document.querySelectorAll('.entity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = `${btn.getAttribute('data-entity')}.html`;
      });
    });
  }
  if (view === 'reports'){
    contentArea.innerHTML = `
        <div class="entities-container">
            <h2>Отчеты</h2>
            <span>Информация появиться позднее</span>
        </div>
    `
  }
  if (view === 'about'){
    contentArea.innerHTML = `
        <div class="entities-container">
            <h2>О программе</h2>
            <span>Данная программа представляет из себя web-приложения для взаимодействия с базой данных</span>
        </div>
    `
  }
}

async function updateStats() {
  try {
    const workers = await WorkerAPI.getAll();
    const directors = await DirectorAPI.getAll();
    const companies = await CompanyAPI.getAll();
    const cars = await CarAPI.getAll();
    const admissions = await AdmissionAPI.getAll();
    const clients = await ClientAPI.getAll();
    const expanses = await ExpanseAPI.getAll();
    const accountants = await AccountantAPI.getAll();
    const drivers = await DriverAPI.getAll();
    const sellers = await SellerAPI.getAll();
    const lifeguards = await LifeguardAPI.getAll();
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initUserTheme();
    const savedToken = localStorage.getItem('authToken');
    const savedRole = localStorage.getItem('userRole');

    if (!savedToken) {
        document.body.className = 'guest-theme';
        document.querySelector('.user-name').textContent = 'Гость';
        document.querySelector('.logout-btn').style.display = 'none';
    }
    else {
        document.body.className = `${savedRole}-theme`;
        document.querySelector('.user-name').textContent = savedRole === 'admin' ? 'Администратор' : 'Пользователь';
    }

    document.getElementById('logoutButton')?.addEventListener('click', handleLogout);

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function (e) {
        e.preventDefault();
        const view = this.getAttribute('data-view');
        if (!isAuthenticated && view !== 'about') {
            showToast('Пожалуйста, войдите в систему', 'error');
            return;
        }
        loadView(view);
        });
    });

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    loadView('dashboard');
});