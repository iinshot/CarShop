import { ClientAPI } from './api.js';
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

class ClientsManager {
    constructor() {
        if (!document.getElementById('clientsTable')) return;

        this.tableBody = document.getElementById('clientsTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllClients();
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
        exportBtn.addEventListener('click', () => exportToExcel('clients'));

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
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllClients());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    async loadAllClients() {
        try {
            const data = await ClientAPI.getAll();
            this.renderClients(data.clients);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderClients(clients) {
        if (!clients || !Array.isArray(clients)) {
            this.tableBody.innerHTML = '<tr><td colspan="4">Нет данных о клиентах</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>Номер заявки</th>
                    <th>Бюджет</th>
                    <th>Нынешний автомобиль</th>
                    <th>Любимый автомобиль</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#clientsTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = clients.map(client => `
            <tr data-id="${client.app_number}">
                <td>${client.app_number}</td>
                <td>${client.budget}</td>
                <td>${client.current_car}</td>
                <td>${client.prefer_car}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${client.app_number}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${client.app_number}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const clientId = e.currentTarget.dataset.id;
                    this.showForm('update', clientId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const clientId = e.currentTarget.dataset.id;
                    this.deleteClient(clientId);
                });
            });
        }
    }

  showForm(formType, clientId = null) {
    const formTitle = {
      'add': 'Добавить клиента',
      'update': 'Обновить клиента',
      'get': 'Найти клиента',
      'delete': 'Удалить клиента'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="client-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>Номер заявки:</label>
          <input type="number" name="app_number" value="${clientId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getClientFormFields(clientId, formType === 'update');
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
            await this.addClient(data);
            break;
          case 'update':
            await this.updateClient(data.app_number, data);
            break;
          case 'get':
            await this.getClient(data.app_number);
            break;
          case 'delete':
            await this.deleteClient(data.app_number);
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

  getClientFormFields(clientId = null, isUpdate = false) {
    const appField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>Номер заявки:</label>
          <input type="number" name="app_number" value="${clientId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${appField}
      <div class="form-row">
        <div class="form-group">
          <label>Бюджет:</label>
          <input type="number" name="budget" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Нынешний автомобиль:</label>
          <input type="text" name="current_car" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Любимый автомобиль:</label>
          <input type="text" name="prefer_car" required>
        </div>
      </div>
    `;
  }

  async addClient(data) {
    try {
      await ClientAPI.create({
        app_number: data.app_number,
        budget: parseFloat(data.budget),
        current_car: data.current_car,
        prefer_car: data.prefer_car
      });
      await this.loadAllClients();
      this.formsContainer.innerHTML = '';
      alert('Клиент успешно добавлен');
    } catch (error) {
      throw error;
    }
  }

  async updateClient(app_number, data) {
    try {
      await ClientAPI.update(app_number, {
        budget: parseFloat(data.budget),
        current_car: data.current_car,
        prefer_car: data.prefer_car
      });
      await this.loadAllClients();
      this.formsContainer.innerHTML = '';
      alert('Данные клиента успешно обновлены');
    } catch (error) {
      throw error;
    }
  }

  async getClient(app_number) {
    try {
      const data = await ClientAPI.get(app_number);
      this.renderClients([data]);
      this.formsContainer.innerHTML = '';
    } catch (error) {
      console.error('Ошибка при получении клиента:', error);
      alert(`Ошибка: ${error.message}`);
    }
  }

  async deleteClient(app_number) {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) return;

    try {
      await ClientAPI.delete(app_number);
      await this.loadAllClients();
      this.formsContainer.innerHTML = '';
      alert('Клиент успешно удален');
    } catch (error) {
      throw error;
    }
  }
}

if (document.getElementById('clientsTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new ClientsManager();
  });
}