import { SellerAPI } from './api.js';
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

class SellersManager {

    constructor() {
        if (!document.getElementById('sellersTable')) return;

        this.tableBody = document.getElementById('sellersTableBody');
        this.formsContainer = document.getElementById('formsContainer');
        this.actionsContainer = document.querySelector('.entity-actions');

        this.init();
        this.setupUI();
    }

    init() {
        this.setupEventListeners();
        this.loadAllSellers();
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
        exportBtn.addEventListener('click', () => exportToExcel('sellers'));

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
        document.getElementById('getAllBtn')?.addEventListener('click', () => this.loadAllSellers());
        document.getElementById('showGetForm')?.addEventListener('click', () => this.showForm('get'));

        if (localStorage.getItem('userRole') === 'admin') {
            document.getElementById('showAddForm')?.addEventListener('click', () => this.showForm('add'));
            document.getElementById('showDeleteForm')?.addEventListener('click', () => this.showForm('delete'));
        }
    }

    async loadAllSellers() {
        try {
            const data = await SellerAPI.getAll();
            this.renderSellers(data.sellers);
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    }

    renderSellers(sellers) {
        if (!sellers || !Array.isArray(sellers)) {
            this.tableBody.innerHTML = '<tr><td colspan="3">Нет данных о продавцах</td></tr>';
            return;
        }

        const role = localStorage.getItem('userRole') || 'guest';
        const isAdmin = role === 'admin';

        const tableHeaders = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Тип продавца</th>
                    <th>Номер заявки клиента</th>
                    ${isAdmin ? '<th class="change-th">Изменение</th>' : ''}
                </tr>
            </thead>
        `;

        document.querySelector('#sellersTable thead').innerHTML = tableHeaders;

        this.tableBody.innerHTML = sellers.map(seller => `
            <tr data-id="${seller.worker_id}">
                <td>${seller.worker_id}</td>
                <td>${seller.seller_type}</td>
                <td>${seller.app_number}</td>
                ${isAdmin ? `
                <td class="actions-cell">
                    <button class="action-btn edit-btn" data-id="${seller.worker_id}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" data-id="${seller.worker_id}">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>` : ''}
            </tr>
        `).join('');

        if (isAdmin) {
            this.tableBody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const sellerId = e.currentTarget.dataset.id;
                    this.showForm('update', sellerId);
                });
            });

            this.tableBody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const sellerId = e.currentTarget.dataset.id;
                    this.deleteSeller(sellerId);
                });
            });
        }
    }

  showForm(formType, sellerId = null) {
    const formTitle = {
      'add': 'Добавить продавца',
      'update': 'Обновить продавца',
      'get': 'Найти продавца',
      'delete': 'Удалить продавца'
    }[formType];

    let formHtml = `
      <div class="form-modal">
        <div class="form-header">
          <h3>${formTitle}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <form id="${formType}Form" class="seller-form">
    `;

    if (formType === 'get' || formType === 'delete') {
      formHtml += `
        <div class="form-group">
          <label>Номер продавца:</label>
          <input type="number" name="worker_id" value="${sellerId || ''}" required>
        </div>
      `;
    } else {
      formHtml += this.getSellerFormFields(sellerId, formType === 'update');
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
            await this.addSeller(data);
            break;
          case 'update':
            await this.updateSeller(data.worker_id, data);
            break;
          case 'get':
            await this.getSeller(data.worker_id);
            break;
          case 'delete':
            await this.deleteSeller(data.worker_id);
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

  getSellerFormFields(sellerId = null, isUpdate = false) {
    const idField = isUpdate ? `
      <div class="form-row">
        <div class="form-group">
          <label>Номер продавца:</label>
          <input type="number" name="worker_id" value="${sellerId || ''}" required readonly>
        </div>
      </div>
    ` : '';

    return `
      ${idField}
      <div class="form-row">
        <div class="form-group">
          <label>Тип продавца:</label>
          <input type="text" name="seller_type" required>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Номер заявки клиента:</label>
          <input type="numeric" name="app_number" required>
        </div>
      </div>
    `;
  }

  async addSeller(data) {
    try {
      await SellerAPI.create({
        worker_id: data.worker_id,
        seller_type: data.seller_type,
        id_number: data.id_number
      });
      await this.loadAllSellers();
      this.formsContainer.innerHTML = '';
      alert('Продавец успешно добавлен');
    } catch (error) {
      throw error;
    }
  }

  async updateSeller(worker_id, data) {
    try {
      await SellerAPI.update(worker_id, {
        seller_type: data.seller_type,
        id_number: data.id_number
      });
      await this.loadAllSellers();
      this.formsContainer.innerHTML = '';
      alert('Данные продавца успешно обновлены');
    } catch (error) {
      throw error;
    }
  }

  async getSeller(worker_id) {
    try {
      const data = await SellerAPI.get(worker_id);
      this.renderSellers([data]);
      this.formsContainer.innerHTML = '';
    } catch (error) {
      console.error('Ошибка при получении продавца:', error);
      alert(`Ошибка: ${error.message}`);
    }
  }

  async deleteSeller(worker_id) {
    if (!confirm('Вы уверены, что хотите удалить этого продавца?')) return;

    try {
      await SellerAPI.delete(worker_id);
      await this.loadAllSellers();
      this.formsContainer.innerHTML = '';
      alert('Продавец успешно удален');
    } catch (error) {
      throw error;
    }
  }
}

if (document.getElementById('sellersTable')) {
  document.addEventListener('DOMContentLoaded', () => {
    new SellersManager();
  });
}