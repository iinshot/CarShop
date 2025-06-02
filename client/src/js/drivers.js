import { DriverAPI } from './api.js';
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

class DriversManager {
    constructor() {
        if (!document.getElementById('driversTable')) return;

        this.tableBody = document.getElementById('driversTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllDrivers();
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
        exportBtn.addEventListener('click', () => exportToExcel('drivers'));

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
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllDrivers());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    async loadAllDrivers() {
        try {
            const data = await DriverAPI.getAll();
            this.renderDrivers(data.drivers);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderDrivers(drivers) {
        if (!drivers || !Array.isArray(drivers)) {
            this.tableBody.innerHTML = '<tr><td colspan="4">Нет данных о водителях</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Номер машины</th>
                    <th>Любимые сухарики</th>
                    <th>VIN-номер</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#driversTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = drivers.map(driver => `
            <tr data-id="${driver.worker_id}">
                <td>${driver.worker_id}</td>
                <td>${driver.car_number}</td>
                <td>${driver.snacks}</td>
                <td>${driver.number_vin}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${driver.worker_id}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${driver.worker_id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const driverId = e.currentTarget.dataset.id;
                    this.showForm('update', driverId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const driverId = e.currentTarget.dataset.id;
                    this.deleteDriver(driverId);
                });
            });
        }
    }

  showForm(formType, driverId = null) {
    const formTitle = {
      'add': 'Добавить водителя',
      'update': 'Обновить водителя',
      'get': 'Найти водителя',
      'delete': 'Удалить водителя'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="driver-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>Номер водителя:</label>
          <input type="number" name="worker_id" value="${driverId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getDriverFormFields(driverId, formType === 'update');
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
            await this.addDriver(data);
            break;
          case 'update':
            await this.updateDriver(data.worker_id, data);
            break;
          case 'get':
            await this.getDriver(data.worker_id);
            break;
          case 'delete':
            await this.deleteDriver(data.worker_id);
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

  getDriverFormFields(driverId = null, isUpdate = false) {
    const idField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>Номер водителя:</label>
          <input type="number" name="worker_id" value="${driverId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${idField}
      <div class="form-row">
        <div class="form-group">
          <label>Номер машины:</label>
          <input type="text" name="car_number" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Любимые сухарики:</label>
          <input type="text" name="snacks" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>VIN-номер:</label>
          <input type="text" name="number_vin" required>
        </div>
      </div>
    `;
  }

  async addDriver(data) {
    try {
      await DriverAPI.create({
        worker_id: data.worker_id,
        car_number: data.car_number,
        snacks: data.snacks,
        number_vin: data.number_vin
      });
      await this.loadAllDrivers();
      this.formsContainer.innerHTML = '';
      alert('Водитель успешно добавлен');
    } catch (error) {
      throw error;
    }
  }

  async updateDriver(worker_id, data) {
    try {
      await DriverAPI.update(worker_id, {
        car_number: data.car_number,
        snacks: data.snacks,
        number_vin: data.number_vin
      });
      await this.loadAllDrivers();
      this.formsContainer.innerHTML = '';
      alert('Данные водителя успешно обновлены');
    } catch (error) {
      throw error;
    }
  }

  async getDriver(worker_id) {
    try {
      const data = await DriverAPI.get(worker_id);
      this.renderDrivers([data]);
      this.formsContainer.innerHTML = '';
    } catch (error) {
      console.error('Ошибка при получении водителя:', error);
      alert(`Ошибка: ${error.message}`);
    }
  }

  async deleteDriver(worker_id) {
    if (!confirm('Вы уверены, что хотите удалить этого водителя?')) return;

    try {
      await DriverAPI.delete(worker_id);
      await this.loadAllDrivers();
      this.formsContainer.innerHTML = '';
      alert('Водитель успешно удален');
    } catch (error) {
      throw error;
    }
  }
}

if (document.getElementById('driversTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new DriversManager();
  });
}