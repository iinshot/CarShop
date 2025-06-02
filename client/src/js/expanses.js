import { ExpanseAPI } from './api.js';
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

class ExpansesManager {
    constructor() {
        if (!document.getElementById('expansesTable')) return;

        this.tableBody = document.getElementById('expansesTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllExpanses();
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
        exportBtn.addEventListener('click', () => exportToExcel('expanses'));

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
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllExpanses());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    async loadAllExpanses() {
        try {
            const data = await ExpanseAPI.getAll();
            this.renderExpanses(data.expanses);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderExpanses(expanses) {
        if (!expanses || !Array.isArray(expanses)) {
            this.tableBody.innerHTML = '<tr><td colspan="4">Нет данных о расходах</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>Номер расхода</th>
                    <th>Тип расхода</th>
                    <th>Сумма расхода</th>
                    <th>Наименование</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#expansesTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = expanses.map(expanse => `
            <tr data-id="${expanse.id_expanse}">
                <td>${expanse.id_expanse}</td>
                <td>${expanse.expanse_type}</td>
                <td>${expanse.expanse_sum}</td>
                <td>${expanse.expanse_name}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${expanse.id_expanse}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${expanse.id_expanse}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const expanseId = e.currentTarget.dataset.id;
                    this.showForm('update', expanseId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const expanseId = e.currentTarget.dataset.id;
                    this.deleteExpanse(expanseId);
                });
            });
        }
    }

    showForm(formType, expanseId = null) {
        const formTitle = {
            'add': 'Добавить расход',
            'update': 'Обновить расход',
            'get': 'Найти расход',
            'delete': 'Удалить расход'
        }[formType];

        let formHtml = `
          <div class="form-modal">
            <div class="form-header">
              <h3>${formTitle}</h3>
              <button class="close-btn">&times;</button>
            </div>
            <form id="${formType}Form" class="expanse-form">
        `;

        if (formType === 'get' || formType === 'delete') {
          formHtml += `
            <div class="form-group">
              <label>Номер расхода:</label>
              <input type="number" name="id_expanse" value="${expanseId || ''}" required>
            </div>
          `;
        } else {
          formHtml += this.getExpanseFormFields(expanseId, formType === 'update');
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
                await this.addExpanse(data);
                break;
              case 'update':
                await this.updateExpanse(data.id_expanse, data);
                break;
              case 'get':
                await this.getExpanse(data.id_expanse);
                break;
              case 'delete':
                await this.deleteExpanse(data.id_expanse);
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

    getExpanseFormFields(expanseId = null, isUpdate = false) {
        const idField = isUpdate ? `
          <div class="form-row">
            <div class="form-group">
              <label>Номер расхода:</label>
              <input type="number" name="id_expanse" value="${expanseId || ''}" required readonly>
            </div>
          </div>
        ` : '';

        return `
          ${idField}
          <div class="form-row">
            <div class="form-group">
              <label>Тип расхода:</label>
              <input type="text" name="expanse_type" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Сумма расхода:</label>
              <input type="numeric" name="expanse_sum" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Наименование:</label>
              <input type="text" name="expanse_name" required>
            </div>
          </div>
        `;
    }

    async addExpanse(data) {
        try {
          await ExpanseAPI.create({
            id_expanse: data.id_expanse,
            expanse_type: data.expanse_type,
            expanse_sum: parseFloat(data.expanse_sum),
            expanse_name: data.expanse_name
          });
          await this.loadAllExpanses();
          this.formsContainer.innerHTML = '';
          alert('Расход успешно добавлен');
        } catch (error) {
          throw error;
        }
    }

    async updateExpanse(id_expanse, data) {
        try {
          await ExpanseAPI.update(id_expanse, {
            expanse_type: data.expanse_type,
            expanse_sum: parseFloat(data.expanse_sum),
            expanse_name: data.expanse_name
          });
          await this.loadAllExpanses();
          this.formsContainer.innerHTML = '';
          alert('Данные расхода успешно обновлены');
        } catch (error) {
          throw error;
        }
    }

    async getExpanse(id_expanse) {
        try {
          const data = await ExpanseAPI.get(id_expanse);
          this.renderExpanses([data]);
          this.formsContainer.innerHTML = '';
        } catch (error) {
          console.error('Ошибка при получении расхода:', error);
          alert(`Ошибка: ${error.message}`);
        }
    }

    async deleteExpanse(id_expanse) {
        if (!confirm('Вы уверены, что хотите удалить этот расход?')) return;

        try {
          await ExpanseAPI.delete(id_expanse);
          await this.loadAllExpanses();
          this.formsContainer.innerHTML = '';
          alert('Расход успешно удален');
        } catch (error) {
          throw error;
        }
    }
}

if (document.getElementById('expansesTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new ExpansesManager();
  });
}