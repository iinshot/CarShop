import { LifeguardAPI } from './api.js';
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

class LifeguardsManager {
    constructor() {
        if (!document.getElementById('lifeguardsTable')) return;

        this.tableBody = document.getElementById('lifeguardsTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllLifeguards();
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
        exportBtn.addEventListener('click', () => exportToExcel('lifeguards'));

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
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllLifeguards());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    async loadAllLifeguards() {
        try {
            const data = await LifeguardAPI.getAll();
            this.renderLifeguards(data.lifeguards);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderLifeguards(lifeguards) {
        if (!lifeguards || !Array.isArray(lifeguards)) {
            this.tableBody.innerHTML = '<tr><td colspan="4">Нет данных о директорах</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Униформа</th>
                    <th>Арсенал</th>
                    <th>Охраняемая зона</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#lifeguardsTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = lifeguards.map(lifeguard => `
            <tr data-id="${lifeguard.worker_id}">
                <td>${lifeguard.worker_id}</td>
                <td>${lifeguard.uniform}</td>
                <td>${lifeguard.kit}</td>
                <td>${lifeguard.security_zone}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${lifeguard.worker_id}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${lifeguard.worker_id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const lifeguardId = e.currentTarget.dataset.id;
                    this.showForm('update', lifeguardId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const lifeguardId = e.currentTarget.dataset.id;
                    this.deleteLifeguard(lifeguardId);
                });
            });
        }
    }

  showForm(formType, lifeguardId = null) {
    const formTitle = {
      'add': 'Добавить охранника',
      'update': 'Обновить охранника',
      'get': 'Найти охранника',
      'delete': 'Удалить охранника'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="lifeguard-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>Номер охранника:</label>
          <input type="number" name="worker_id" value="${lifeguardId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getLifeguardFormFields(lifeguardId, formType === 'update');
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
            await this.addLifeguard(data);
            break;
          case 'update':
            await this.updateLifeguard(data.worker_id, data);
            break;
          case 'get':
            await this.getLifeguard(data.worker_id);
            break;
          case 'delete':
            await this.deleteLifeguard(data.worker_id);
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

  getLifeguardFormFields(lifeguardId = null, isUpdate = false) {
    const idField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>Номер охранника:</label>
          <input type="number" name="worker_id" value="${lifeguardId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${idField}
      <div class="form-row">
        <div class="form-group">
          <label>Униформа:</label>
          <input type="text" name="uniform" required>
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
          <label>Охраняемая зона:</label>
          <input type="text" name="security_zone" required>
        </div>
      </div>
    `;
  }

  async addLifeguard(data) {
    try {
      await LifeguardAPI.create({
        worker_id: data.worker_id,
        uniform: data.uniform,
        kit: data.kit,
        security_zone: data.security_zone
      });
      await this.loadAllLifeguards();
      this.formsContainer.innerHTML = '';
      alert('Охранник успешно добавлен');
    } catch (error) {
      throw error;
    }
  }

  async updateLifeguard(worker_id, data) {
    try {
      await LifeguardAPI.update(worker_id, {
        uniform: data.uniform,
        kit: data.kit,
        security_zone: data.security_zone
      });
      await this.loadAllLifeguards();
      this.formsContainer.innerHTML = '';
      alert('Данные охранника успешно обновлены');
    } catch (error) {
      throw error;
    }
  }

  async getLifeguard(worker_id) {
    try {
      const data = await LifeguardAPI.get(worker_id);
      this.renderLifeguards([data]);
      this.formsContainer.innerHTML = '';
    } catch (error) {
      console.error('Ошибка при получении охранника:', error);
      alert(`Ошибка: ${error.message}`);
    }
  }

  async deleteLifeguard(worker_id) {
    if (!confirm('Вы уверены, что хотите удалить этого охранника?')) return;

    try {
      await LifeguardAPI.delete(worker_id);
      await this.loadAllLifeguards();
      this.formsContainer.innerHTML = '';
      alert('Охранник успешно удален');
    } catch (error) {
      throw error;
    }
  }
}

if (document.getElementById('lifeguardsTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new LifeguardsManager();
  });
}