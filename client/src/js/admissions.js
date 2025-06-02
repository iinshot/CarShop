import { AdmissionAPI } from './api.js';
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

class AdmissionsManager {
    constructor() {
        if (!document.getElementById('admissionsTable')) return;

        this.tableBody = document.getElementById('admissionsTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllAdmissions();
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
        exportBtn.addEventListener('click', () => exportToExcel('admissions'));

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
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllAdmissions());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    async loadAllAdmissions() {
        try {
            const data = await AdmissionAPI.getAll();
            this.renderAdmissions(data.admissions);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderAdmissions(admissions) {
        if (!admissions || !Array.isArray(admissions)) {
            this.tableBody.innerHTML = '<tr><td colspan="7">Нет данных о учетах</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>Номер учета</th>
                    <th>Дата привоза</th>
                    <th>Комплектация</th>
                    <th>Цвет</th>
                    <th>Марка</th>
                    <th>Модель</th>
                    <th>Год выпуска</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#admissionsTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = admissions.map(admission => `
            <tr data-id="${admission.id_number}">
                <td>${admission.id_number}</td>
                <td>${admission.admission_date}</td>
                <td>${admission.complectation}</td>
                <td>${admission.color}</td>
                <td>${admission.mark}</td>
                <td>${admission.model}</td>
                <td>${admission.year_create}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${admission.id_number}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${admission.id_number}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const admissionId = e.currentTarget.dataset.id;
                    this.showForm('update', admissionId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const admissionId = e.currentTarget.dataset.id;
                    this.deleteAdmission(admissionId);
                });
            });
        }
    }

  showForm(formType, admissionId = null) {
    const formTitle = {
      'add': 'Добавить учет',
      'update': 'Обновить учет',
      'get': 'Найти учет',
      'delete': 'Удалить учет'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="admission-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>Номер привоза:</label>
          <input type="number" name="id_number" value="${admissionId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getAdmissionFormFields(admissionId, formType === 'update');
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
            await this.addAdmission(data);
            break;
          case 'update':
            await this.updateAdmission(data.id_number, data);
            break;
          case 'get':
            await this.getAdmission(data.id_number);
            break;
          case 'delete':
            await this.deleteAdmission(data.id_number);
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

  getAdmissionFormFields(admissionId = null, isUpdate = false) {
    const idField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>Номер привоза:</label>
          <input type="number" name="id_number" value="${admissionId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${idField}
      <div class="form-row">
        <div class="form-group">
          <label>Дата учета:</label>
          <input type="date" name="admission_date" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Комплектация:</label>
          <input type="text" name="complectation" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Цвет:</label>
          <input type="text" name="color" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Марка:</label>
          <input type="text" name="mark" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Модель:</label>
          <input type="text" name="model" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Год производства:</label>
          <input type="number" name="year_create" required>
        </div>
      </div>
    `;
  }

  async addAdmission(data) {
    try {
      await AdmissionAPI.create({
        id_number: data.id_number,
        admission_date: data.admission_date,
        complectation: data.complectation,
        color: data.color,
        mark: data.mark,
        model: data.model,
        year_create: parseInt(data.year_create)
      });
      await this.loadAllAdmissions();
      this.formsContainer.innerHTML = '';
      alert('Учет успешно добавлен');
    } catch (error) {
      throw error;
    }
  }

  async updateAdmission(id_number, data) {
    try {
      await AdmissionAPI.update(id_number, {
        admission_date: data.admission_date,
        complectation: data.complectation,
        color: data.color,
        mark: data.mark,
        model: data.model,
        year_create: parseInt(data.year_create)
      });
      await this.loadAllAdmissions();
      this.formsContainer.innerHTML = '';
      alert('Данные учета успешно обновлены');
    } catch (error) {
      throw error;
    }
  }

  async getAdmission(id_number) {
    try {
      const data = await AdmissionAPI.get(id_number);
      this.renderAdmissions([data]);
      this.formsContainer.innerHTML = '';
    } catch (error) {
      console.error('Ошибка при получении учета:', error);
      alert(`Ошибка: ${error.message}`);
    }
  }

  async deleteAdmission(id_number) {
    if (!confirm('Вы уверены, что хотите удалить этот учет?')) return;

    try {
      await AdmissionAPI.delete(id_number);
      await this.loadAllAdmissions();
      this.formsContainer.innerHTML = '';
      alert('Учет успешно удален');
    } catch (error) {
      throw error;
    }
  }
}

if (document.getElementById('admissionsTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new AdmissionsManager();
  });
}