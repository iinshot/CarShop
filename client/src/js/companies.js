import { CompanyAPI } from './api.js';
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

class CompaniesManager {
  constructor() {
    if (!document.getElementById('companiesTable')) return;

    this.tableBody = document.getElementById('companiesTableBody');
    this.formsContainer = document.getElementById('formsContainer');
    this.actionsContainer = document.querySelector('.entity-actions');

    this.init();
    this.setupUI();
  }

  init() {
    this.setupEventListeners();
    this.loadAllCompanies();
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
        exportBtn.addEventListener('click', () => exportToExcel('companies'));

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
    document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllCompanies());
    document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

    if (localStorage.getItem('userRole') === 'admin') {
      document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
      document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
    }
  }

  async loadAllCompanies() {
    try {
      const data = await CompanyAPI.getAll();
      this.renderCompanies(data.companies);
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message);
    }
  }

  renderCompanies(companies) {
    if (!companies || !Array.isArray(companies)) {
      this.tableBody.innerHTML = '<tr><td colspan="3">Нет данных о компаниях</td></tr>';
      return;
    }

    const role = localStorage.getItem('userRole') || 'guest';
    const isAdmin = role === 'admin';

    const tableHeaders = `
      <thead>
        <tr>
          <th>ИНН</th>
          <th>Название</th>
          <th>Адрес</th>
          ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
        </tr>
      </thead>
    `;

    document.querySelector('#companiesTable thead').innerHTML = tableHeaders;

    this.tableBody.innerHTML = companies.map(company => `
      <tr data-id="${company.inn}">
        <td>${company.inn}</td>
        <td>${company.name_company}</td>
        <td>${company.address}</td>
        ${isAdmin ? `
        <td class="actions-cell">
          <button class="action-btn edit-btn" data-id="${company.inn}">
            <i class="fas fa-edit"></i> Изменить
          </button>
          <button class="action-btn delete-btn" data-id="${company.inn}">
            <i class="fas fa-trash"></i> Удалить
          </button>
        </td>` : ''}
      </tr>
    `).join('');

    if (isAdmin) {
      this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const companyId = e.currentTarget.dataset.id;
          this.showForm('update', companyId);
        });
      });

      this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const companyId = e.currentTarget.dataset.id;
          this.deleteCompany(companyId);
        });
      });
    }
  }

  showForm(formType, companyId = null) {
    const formTitle = {
      'add': 'Добавить компанию',
      'update': 'Обновить данные',
      'get': 'Найти компанию',
      'delete': 'Удалить компанию'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="company-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>ИНН компании:</label>
          <input type="number" name="inn" value="${companyId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getCompanyFormFields(companyId, formType === 'update');
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
            await this.addCompany(data);
            break;
          case 'update':
            await this.updateCompany(data.inn, data);
            break;
          case 'get':
            await this.getCompany(data.inn);
            break;
          case 'delete':
            await this.deleteCompany(data.inn);
            break;
        }
      } catch (error) {
        console.error('Ошибка:', error);
        alert(`Ошибка: ${error.message}`);
      }
    });
    this.formsContainer.scrollIntoView({
    behavior: 'smooth',
    block: 'start' // или 'center' если нужно по центру
    });
  }

  getCompanyFormFields(companyId = null, isUpdate = false) {
    const innField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>ИНН:</label>
          <input type="number" name="inn" value="${companyId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${innField}
      <div class="form-row">
        <div class="form-group">
          <label>Название компании:</label>
          <input type="text" name="name_company" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Адрес:</label>
          <input type="text" name="address" required>
        </div>
      </div>
    `;
  }

  async addCompany(data) {
    try {
      await CompanyAPI.create({
        name_company: data.name_company,
        address: data.address
      });
      this.loadAllCompanies();
      this.formsContainer.innerHTML = '';
      alert('Компания успешно добавлена');
    } catch (error) {
      throw error;
    }
  }

  async updateCompany(inn, data) {
    try {
      await CompanyAPI.update(inn, {
        name_company: data.name_company,
        address: data.address
      });
      this.loadAllCompanies();
      this.formsContainer.innerHTML = '';
      alert('Данные компании успешно обновлены');
    } catch (error) {
      throw error;
    }
  }

  async getCompany(inn) {
      try {
        const response = await fetch(`http://localhost:8000/companies/${inn}`);
        if (!response.ok) throw new Error('Компания не найдена');

        const company = await response.json();
        this.renderCompanies([company]);
        this.formsContainer.innerHTML = '';
      } catch (error) {
        console.error('Ошибка при получении компании:', error);
        alert(`Ошибка: ${error.message}`);
      }
  }

  async deleteCompany(inn) {
    if (!confirm('Вы уверены, что хотите удалить эту компанию?')) return;

    try {
      await CompanyAPI.delete(inn);
      this.loadAllCompanies();
      this.formsContainer.innerHTML = '';
      alert('Компания успешно удалена');
    } catch (error) {
      throw error;
    }
  }
}

if (document.getElementById('companiesTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new CompaniesManager();
  });
}