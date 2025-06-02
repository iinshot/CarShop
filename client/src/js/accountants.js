import { AccountantAPI } from './api.js';
import { exportToExcel } from './export.js';

function initUserTheme() {
  const savedTheme = localStorage.getItem('userTheme') || 'admin';
  document.body.className = savedTheme + '-theme';
  toggleActionButtons(savedTheme);
}

function toggleUser() {
  const currentTheme = localStorage.getItem('userTheme') || 'admin';
  const newTheme = currentTheme === 'admin' ? 'user' : 'admin';

  localStorage.setItem('userTheme', newTheme);
  document.body.className = newTheme + '-theme';
  toggleActionButtons(newTheme);
}

function toggleActionButtons(theme) {
  const staticButtons = [
    '#showAddForm',
    '#showUpdateForm',
    '#showDeleteForm'
  ];

  staticButtons.forEach(selector => {
    const btn = document.querySelector(selector);
    if (btn) btn.style.display = theme === 'user' ? 'none' : '';
  });

  const dynamicButtons = [
    '.edit-btn',
    '.delete-btn',
    '.actions-cell',
    '.change-th'
  ];

  dynamicButtons.forEach(selector => {
    document.querySelectorAll(selector).forEach(btn => {
      btn.style.display = theme === 'user' ? 'none' : '';
    });
  });
}

document.addEventListener('DOMContentLoaded', initUserTheme);

class AccountantsManager {
    constructor() {
        if (!document.getElementById('accountantsTable')) return;

        this.tableBody = document.getElementById('accountantsTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllAccountants();
    }

    setupUI() {
        const role = localStorage.getItem('userRole') || 'guest';
        document.body.className = `${role}-theme`;

        this.actionsContainer.innerHTML = '';

        const excelsContainer = document.querySelector('.entity-actions');
        if (!excelsContainer) return;

        const exportBtn = document.createElement('button');
        exportBtn.className = 'action-btn export-btn';
        exportBtn.innerHTML = '<i></i> Экспорт в Excel';
        exportBtn.addEventListener('click', () => exportToExcel('accountants'));

        if (role === 'admin') {
            this.actionsContainer.innerHTML = `
                <button id="showAddForm" class="action-btn">
                  <i class="fas fa-plus"></i> Добавить
                </button>
                <button id="showGetForm" class="action-btn">
                  <i class="fas fa-search"></i> Получить
                </button>
                <button id="getAllBtn" class="action-btn">
                  <i class="fas fa-list"></i> Получить всех
                </button>
            `;
            this.actionsContainer.prepend(exportBtn)
        } else if (role === 'user') {
            this.actionsContainer.innerHTML = `
                <button id="showGetForm" class="action-btn">
                  <i class="fas fa-search"></i> Получить
                </button>
                <button id="getAllBtn" class="action-btn">
                  <i class="fas fa-list"></i> Получить всех
                </button>
            `;
            this.actionsContainer.prepend(exportBtn)
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllAccountants());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    async loadAllAccountants() {
        try {
            const data = await AccountantAPI.getAll();
            this.renderAccountants(data.accountants);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderAccountants(accountants) {
        if (!accountants || !Array.isArray(accountants)) {
            this.tableBody.innerHTML = '<tr><td colspan="4">Нет данных о бухгалтерах</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Арсенал</th>
                    <th>Квалификация</th>
                    <th>Номер заявки</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#accountantsTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = accountants.map(accountant => `
            <tr data-id="${accountant.worker_id}">
                <td>${accountant.worker_id}</td>
                <td>${accountant.kit}</td>
                <td>${accountant.qual}</td>
                <td>${accountant.id_number}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${accountant.worker_id}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${accountant.worker_id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const accountantId = e.currentTarget.dataset.id;
                    this.showForm('update', accountantId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const accountantId = e.currentTarget.dataset.id;
                    this.deleteAccountant(accountantId);
                });
            });
        }
    }

  showForm(formType, accountantId = null) {
    const formTitle = {
      'add': 'Добавить бухгалтера',
      'update': 'Обновить бухгалтера',
      'get': 'Найти бухгалтера',
      'delete': 'Удалить бухгалтера'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="accountant-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>Номер бухгалтера:</label>
          <input type="number" name="worker_id" value="${accountantId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getAccountantFormFields(accountantId, formType === 'update');
    }

    formHtml += `
          <div class="form-actions">
            <button type="submit" class="submit-btn">
              ${formType === 'add' ? 'Добавить' :
               formType === 'update' ? 'Обновить' :
               formType === 'delete' ? 'Удалить' : 'Найти'}
            </button>
          </div>
        </form>
      </div>
    `;

    this.formsContainer.innerHTML = formHtml;

    this.formsContainer.querySelector('.close-btn').addEventListener('click', () => {
      this.formsContainer.innerHTML = '';
    });

    document.getElementById(`${formType}Form`).addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      try {
        switch(formType) {
          case 'add':
            await this.addAccountant(data);
            break;
          case 'update':
            await this.updateAccountant(data.worker_id, data);
            break;
          case 'get':
            await this.getAccountant(data.worker_id);
            break;
          case 'delete':
            await this.deleteAccountant(data.worker_id);
            break;
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert(`Ошибка: ${error.message}`);
      }
    });
    this.formsContainer.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
    });
  }

  getAccountantFormFields(accountantId = null, isUpdate = false) {
    const idField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>Номер бухгалтера:</label>
          <input type="number" name="worker_id" value="${accountantId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${idField}
      <div class="form-row">
        <div class="form-group">
          <label>Квалификация:</label>
          <input type="text" name="qual" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Арсенал:</label>
          <input type="text" name="kit" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Номер учета:</label>
          <input type="text" name="id_number" required>
        </div>
      </div>
    `;
  }

  async addAccountant(data) {
    try {
      await AccountantAPI.create({
        worker_id: data.worker_id,
        qual: data.qual,
        kit: data.kit,
        id_number: data.id_number
      });
      await this.loadAllAccountants();
      this.formsContainer.innerHTML = '';
      alert('Бухгалтер успешно добавлен');
    } catch (error) {
      throw error;
    }
  }

  async updateAccountant(worker_id, data) {
    try {
      await AccountantAPI.update(worker_id, {
        qual: data.qual,
        kit: data.kit,
        id_number: data.id_number
      });
      await this.loadAllAccountants();
      this.formsContainer.innerHTML = '';
      alert('Данные бухгалтера успешно обновлены');
    } catch (error) {
      throw error;
    }
  }

  async getAccountant(worker_id) {
    try {
      const data = await AccountantAPI.get(worker_id);
      this.renderAccountants([data]);
      this.formsContainer.innerHTML = '';
    } catch (error) {
      console.error('Ошибка при получении бухгалтера:', error);
      alert(`Ошибка: ${error.message}`);
    }
  }

  async deleteAccountant(worker_id) {
    if (!confirm('Вы уверены, что хотите удалить этого бухгалтера?')) return;

    try {
      await AccountantAPI.delete(worker_id);
      await this.loadAllAccountants();
      this.formsContainer.innerHTML = '';
      alert('Бухгалтер успешно удален');
    } catch (error) {
      throw error;
    }
  }
}

if (document.getElementById('accountantsTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new AccountantsManager();
  });
}