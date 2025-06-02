import { WorkerAPI } from './api.js';
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

  // Динамические кнопки в таблице
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

class WorkersManager {
    constructor() {
        if (!document.getElementById('workersTable')) return;

        this.tableBody = document.getElementById('workersTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.currentPage = 1;
        this.pageSize = 50;
        this.totalWorkers = 0;
        this.currentSearchTerm = '';
        this.allWorkers = [];

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllWorkers();
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
        exportBtn.addEventListener('click', () => exportToExcel('workers'));

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
        document.getElementById('searchButton')?.addEventListener('click', () => {
            this.currentSearchTerm = document.getElementById('fioSearch').value;
            this.currentPage = 1;
            this.loadAllWorkers();
        });

        document.getElementById('fioSearch')?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.currentSearchTerm = e.target.value;
                this.currentPage = 1;
                this.loadAllWorkers();
            }
        });

        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadAllWorkers();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.totalWorkers / this.pageSize);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.loadAllWorkers();
            }
        });
    }

    setupEventListeners() {
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllWorkers());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    updatePaginationControls() {
        const totalPages = Math.ceil(this.totalWorkers / this.pageSize);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        pageInfo.textContent = `Страница ${this.currentPage} из ${totalPages}`;
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= totalPages;
    }

    async loadAllWorkers() {
        try {
            const data = await WorkerAPI.getAll();

            this.allWorkers = data.workers;
            this.totalWorkers = this.allWorkers.length;

            let filteredWorkers = this.allWorkers;
            if (this.currentSearchTerm) {
                const searchTerm = this.currentSearchTerm.toLowerCase();
                filteredWorkers = this.allWorkers.filter(worker => {
                    const fullName = `${worker.surname} ${worker.firstname} ${worker.lastname || ''}`.toLowerCase();
                    return fullName.includes(searchTerm);
                });
                this.totalWorkers = filteredWorkers.length;
            }

            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            const paginatedWorkers = filteredWorkers.slice(startIndex, endIndex);

            this.renderWorkers(paginatedWorkers);
            this.updatePaginationControls();
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderWorkers(workers) {
        if (!workers || !Array.isArray(workers)) {
            this.tableBody.innerHTML = '<tr><td colspan="9">Нет данных о сотрудниках</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Зарплата</th>
                    <th>Должность</th>
                    <th>Опыт</th>
                    <th>ФИО</th>
                    <th>Телефон</th>
                    <th>Адрес</th>
                    <th>ID-расхода</th>
                    <th>ИНН директора</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#workersTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = workers.map(worker => `
            <tr data-id="${worker.worker_id}">
                <td>${worker.worker_id}</td>
                <td>${worker.salary}</td>
                <td>${worker.post}</td>
                <td>${worker.experience}</td>
                <td>${worker.surname} ${worker.firstname} ${worker.lastname || ''}</td>
                <td>${worker.phone_number}</td>
                <td>${worker.address}</td>
                <td>${worker.id_expanse}</td>
                <td>${worker.inn_director}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${worker.worker_id}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${worker.worker_id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const workerId = e.currentTarget.dataset.id;
                    this.showForm('update', workerId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const workerId = e.currentTarget.dataset.id;
                    this.deleteWorker(workerId);
                });
            });
        }
    }

  showForm(formType, workerId = null) {
    const formTitle = {
      'add': 'Добавить работника',
      'update': 'Обновить данные',
      'get': 'Найти работника',
      'delete': 'Удалить работника'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="worker-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>ID работника:</label>
          <input type="number" name="id" value="${workerId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getFullFormFields(workerId, formType === 'update');
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
            await this.addWorker(data);
            break;
          case 'update':
            await this.updateWorker(data.worker_id, data);
            break;
          case 'get':
            await this.getWorker(data.id);
            break;
          case 'delete':
            await this.deleteWorker(data.id);
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

  getFullFormFields(workerId = null, isUpdate = false) {
    const idField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>ID:</label>
          <input type="text" name="worker_id" value="${workerId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${idField}
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
          <label>Зарплата:</label>
          <input type="number" name="salary" min="20000" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Должность:</label>
          <input type="text" name="post" required>
        </div>

        <div class="form-group">
          <label>Опыт (месяцев):</label>
          <input type="number" name="experience" min="0" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Телефон:</label>
          <input type="tel" name="phone_number" required>
        </div>

        <div class="form-group">
          <label>Адрес:</label>
          <input type="text" name="address" required>
        </div>
      </div>
    `;
  }

  async addWorker(data) {
    const response = await fetch('http://localhost:8000/workers/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surname: data.surname,
        firstname: data.firstname,
        lastname: data.lastname,
        salary: parseInt(data.salary),
        post: data.post,
        experience: parseInt(data.experience),
        phone_number: data.phone_number,
        address: data.address
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || 'Ошибка добавления');
    }

    this.loadAllWorkers();
    this.formsContainer.innerHTML = '';
    alert('Работник успешно добавлен');
  }

  async updateWorker(id, data) {
    try {
      if (!id || isNaN(id)) {
        throw new Error("Неверный ID работника");
      }

      const salary = parseInt(data.salary);
      if (isNaN(salary) || salary < 20000) {
        throw new Error("Зарплата должна быть числом не менее 20000");
      }

      const experience = parseInt(data.experience);
      if (isNaN(experience)) {
        throw new Error("Опыт должен быть числом");
      }

      const requestBody = {
        surname: data.surname,
        firstname: data.firstname,
        lastname: data.lastname,
        salary: salary,
        post: data.post,
        experience: experience,
        phone_number: data.phone_number,
        address: data.address
      };

      delete requestBody.worker_id;

      const response = await fetch(`http://localhost:8000/workers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      await this.loadAllWorkers();
      this.formsContainer.innerHTML = '';
      alert('Данные успешно обновлены');
      return result;

    } catch (error) {
      console.error('Ошибка обновления работника:', error);
      alert(`Ошибка обновления: ${error.message}`);
      throw error;
    }
  }

    async getWorker(id) {
        const response = await fetch(`http://localhost:8000/workers/${id}`);
        if (!response.ok) throw new Error('Работник не найден');

        const worker = await response.json();
        this.renderWorkers([worker]);
        this.formsContainer.innerHTML = '';
    }

  async deleteWorker(id) {
    if (!confirm('Вы уверены, что хотите удалить этого работника?')) return;

    try {
      const response = await fetch(`http://localhost:8000/workers/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Не удалось удалить работника');
      }

      this.loadAllWorkers();
      this.formsContainer.innerHTML = '';
      alert('Работник успешно удален');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert(error.message);
    }
  }
}

if (document.getElementById('workersTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new WorkersManager();
  });
}