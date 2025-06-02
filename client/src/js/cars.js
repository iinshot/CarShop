import { CarAPI } from './api.js';
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

class CarsManager {
    constructor() {
        if (!document.getElementById('carsTable')) return;

        this.tableBody = document.getElementById('carsTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.currentPage = 1;
        this.pageSize = 50;
        this.totalСars = 0;
        this.currentSearchTerm = '';
        this.allCars = [];

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllCars();
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
        exportBtn.addEventListener('click', () => exportToExcel('cars'));

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
            this.currentSearchTerm = document.getElementById('vinSearch').value;
            this.currentPage = 1;
            this.loadAllCars();
        });

        document.getElementById('vinSearch')?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.currentSearchTerm = e.target.value;
                this.currentPage = 1;
                this.loadAllCars();
            }
        });

        document.getElementById('prevPage')?.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadAllCars();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', () => {
            const totalPages = Math.ceil(this.totalCars / this.pageSize);
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.loadAllCars();
            }
        });
    }

    setupEventListeners() {
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllCars());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    updatePaginationControls() {
        const totalPages = Math.ceil(this.totalCars / this.pageSize);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        pageInfo.textContent = `Страница ${this.currentPage} из ${totalPages}`;
        prevBtn.disabled = this.currentPage <= 1;
        nextBtn.disabled = this.currentPage >= totalPages;
    }

    async loadAllCars() {
        try {
            const data = await CarAPI.getAll();
            this.allCars = data.cars;
            this.totalCars = this.allCars.length;

            let filteredCars = this.allCars;
            if (this.currentSearchTerm) {
                const searchTerm = this.currentSearchTerm.toLowerCase();
                filteredCars = this.allCars.filter(car => {
                    const fullName = `${car.mark}`.toLowerCase();
                    return fullName.includes(searchTerm);
                });
                this.totalCars = filteredCars.length;
            }

            const startIndex = (this.currentPage - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            const paginatedCars = filteredCars.slice(startIndex, endIndex);

            this.renderCars(paginatedCars);
            this.updatePaginationControls();
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderCars(cars) {
        if (!cars || !Array.isArray(cars)) {
            this.tableBody.innerHTML = '<tr><td colspan="7">Нет данных об автомобилях</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>VIN-номер</th>
                    <th>Комплектация</th>
                    <th>Цвет</th>
                    <th>Марка</th>
                    <th>Модель</th>
                    <th>Год выпуска</th>
                    <th>Номер заявки</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#carsTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = cars.map(car => `
            <tr data-id="${car.number_vin}">
                <td>${car.number_vin}</td>
                <td>${car.complectation}</td>
                <td>${car.color}</td>
                <td>${car.mark}</td>
                <td>${car.model}</td>
                <td>${car.year_create}</td>
                <td>${car.app_number}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${car.number_vin}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${car.number_vin}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const carId = e.currentTarget.dataset.id;
                    this.showForm('update', carId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const carId = e.currentTarget.dataset.id;
                    this.deleteCar(carId);
                });
            });
        }
    }

  showForm(formType, carId = null) {
    const formTitle = {
      'add': 'Добавить автомобиль',
      'update': 'Обновить данные',
      'get': 'Найти автомобиль',
      'delete': 'Удалить автомобиль'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="car-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>VIN-номер:</label>
          <input type="text" name="number_vin" value="${carId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getCarFormFields(carId, formType === 'update');
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
            await this.addCar(data);
            break;
          case 'update':
            await this.updateCar(data.number_vin, data);
            break;
          case 'get':
            await this.getCar(data.number_vin);
            break;
          case 'delete':
            await this.deleteCar(data.number_vin);
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

  getCarFormFields(carId = null, isUpdate = false) {
    const vinField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>VIN-номер:</label>
          <input type="text" name="number_vin" value="${carId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${vinField}
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

  async addCar(data) {
    try {
      await CarAPI.create({
        number_vin: data.number_vin,
        complectation: data.complectation,
        color: data.color,
        mark: data.mark,
        model: data.model,
        year_create: parseInt(data.year_create),
        app_number: parseInt(data.app_number)
      });
      await this.loadAllCars();
      this.formsContainer.innerHTML = '';
      alert('Автомобиль успешно добавлен');
    } catch (error) {
      throw error;
    }
  }

  async updateCar(number_vin, data) {
    try {
      await CarAPI.update(number_vin, {
        complectation: data.complectation,
        color: data.color,
        mark: data.mark,
        model: data.model,
        year_create: parseInt(data.year_create),
        app_number: parseInt(data.app_number)
      });
      await this.loadAllCars();
      this.formsContainer.innerHTML = '';
      alert('Данные автомобиля успешно обновлены');
    } catch (error) {
      throw error;
    }
  }

  async getCar(number_vin) {
    try {
      const data = await CarAPI.get(number_vin);
      this.renderCars([data]);
      this.formsContainer.innerHTML = '';
    } catch (error) {
      console.error('Ошибка при получении автомобиля:', error);
      alert(`Ошибка: ${error.message}`);
    }
  }

  async deleteCar(number_vin) {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) return;

    try {
      await CarAPI.delete(number_vin);
      await this.loadAllCars();
      this.formsContainer.innerHTML = '';
      alert('Автомобиль успешно удален');
    } catch (error) {
      throw error;
    }
  }
}

if (document.getElementById('carsTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new CarsManager();
  });
}