import { DirectorAPI } from './api.js';
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

class DirectorsManager {
    constructor() {
        if (!document.getElementById('directorsTable')) return;

        this.tableBody = document.getElementById('directorsTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllDirectors();
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
        exportBtn.addEventListener('click', () => exportToExcel('directors'));

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
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllDirectors());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    async loadAllDirectors() {
        try {
            const data = await DirectorAPI.getAll();
            this.renderDirectors(data.directors);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderDirectors(directors) {
        if (!directors || !Array.isArray(directors)) {
            this.tableBody.innerHTML = '<tr><td colspan="4">Нет данных о директорах</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>ИНН</th>
                    <th>ФИО</th>
                    <th>Прибыль</th>
                    <th>ИНН компании</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#directorsTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = directors.map(director => `
            <tr data-id="${director.inn}">
                <td>${director.inn}</td>
                <td>${director.surname} ${director.firstname} ${director.lastname || ''}</td>
                <td>${director.profit}</td>
                <td>${director.inn_company}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${director.inn}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${director.inn}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const directorId = e.currentTarget.dataset.id;
                    this.showForm('update', directorId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const directorId = e.currentTarget.dataset.id;
                    this.deleteDirector(directorId);
                });
            });
        }
    }

    showForm(formType, directorId = null) {
        const formTitle = {
          'add': 'Добавить директора',
          'update': 'Обновить данные',
          'get': 'Найти директора',
          'delete': 'Удалить директора'
        }[formType];

        let formHtml = `
          <div class="form-modal">
            <div class="form-header">
              <h3>${formTitle}</h3>
              <button class="close-btn">&times;</button>
            </div>
            <form id="${formType}Form" class="director-form">
        `;

        if (formType === 'get' || formType === 'delete') {
          formHtml += `
            <div class="form-group">
              <label>ИНН директора:</label>
              <input type="number" name="inn" value="${directorId || ''}" required>
            </div>
          `;
        } else {
          formHtml += this.getDirectorFormFields(directorId, formType === 'update');
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
                await this.addDirector(data);
                break;
              case 'update':
                await this.updateDirector(data.inn, data);
                break;
              case 'get':
                await this.getDirector(data.inn);
                break;
              case 'delete':
                await this.deleteDirector(data.inn);
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

    getDirectorFormFields(directorId = null, isUpdate = false) {
        const innField = isUpdate ? `
          <div class="form-row">
            <div class="form-group">
              <label>ИНН:</label>
              <input type="number" name="inn" value="${directorId || ''}" required readonly>
            </div>
          </div>
        ` : '';

        return `
          ${innField}
          <div class="form-row">
            <div class="form-group">
              <label>Фамилия:</label>
              <input type="text" name="surname" required>
            </div>
            <div class="form-group">
              <label>Имя:</label>
              <input type="text" name="firstname" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Отчество:</label>
              <input type="text" name="lastname">
            </div>
            <div class="form-group">
              <label>Прибыль:</label>
              <input type="number" name="profit" required>
            </div>
          </div>
        `;
    }

    async addDirector(data) {
        try {
            await DirectorAPI.create({
                surname: data.surname,
                firstname: data.firstname,
                lastname: data.lastname,
                profit: parseFloat(data.profit),
                inn_company: parseInt(data.inn_company)
            });
            this.loadAllDirectors();
            this.formsContainer.innerHTML = '';
            alert('Директор успешно добавлен');
        }
        catch (error) {
            throw error;
        }
    }

    async updateDirector(inn, data) {
        try {
            await DirectorAPI.update(inn, {
                surname: data.surname,
                firstname: data.firstname,
                lastname: data.lastname,
                profit: parseFloat(data.profit),
                inn_company: parseInt(data.inn_company)
            });
            this.loadAllDirectors();
            this.formsContainer.innerHTML = '';
            alert('Данные директора успешно обновлены');
        } catch (error) {
            throw error;
        }
    }

    async getDirector(inn) {
        try {
            if (!inn || isNaN(Number(inn))) {
                throw new Error("ИНН должен быть числом");
            }

            const response = await fetch(`http://localhost:8000/directors/${inn}`);

            if (!response.ok) {
                let errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData?.message || errorData?.detail || errorMessage;
                } catch (jsonError) {
                console.warn("Не удалось распарсить JSON из ответа об ошибке:", jsonError);
                }
                throw new Error(errorMessage);
            }

            const director = await response.json();

            if (!director?.inn) {
                throw new Error("Получены некорректные данные директора");
            }

            this.renderDirectors([director]);
            this.formsContainer.innerHTML = '';
        }
        catch (error) {
            console.error('Ошибка при получении директора:', {
                error: error.message,
                inn,
                stack: error.stack
            });
            alert(`Ошибка при получении директора: ${error.message}`);
        }
    }

    async deleteDirector(inn) {
        if (!confirm('Вы уверены, что хотите удалить этого директора?')) return;

        try {
          await DirectorAPI.delete(inn);
          this.loadAllDirectors();
          this.formsContainer.innerHTML = '';
          alert('Директор успешно удален');
        } catch (error) {
            throw error;
        }
    }
}

if (document.getElementById('directorsTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new DirectorsManager();
  });
}