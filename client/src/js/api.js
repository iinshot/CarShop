const API_BASE_URL = 'http://localhost:8000';

class WorkerAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/workers/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных');
    return await response.json();
  }

  static async get(id) {
    const response = await fetch(`${API_BASE_URL}/workers/${id}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Работник не найден');
    return await response.json();
  }

  static async create(workerData) {
    const response = await fetch(`${API_BASE_URL}/workers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workerData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании');
    return await response.json();
  }

  static async update(id, workerData) {
    const response = await fetch(`${API_BASE_URL}/workers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workerData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении');
    return await response.json();
  }

  static async delete(id) {
    const response = await fetch(`${API_BASE_URL}/workers/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении');
    return await response.json();
  }
}

class DirectorAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/directors/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных директоров');
    return await response.json();
  }

  static async get(inn) {
    const response = await fetch(`${API_BASE_URL}/directors/${inn}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Директор не найден');
    return await response.json();
  }

  static async create(directorData) {
    const response = await fetch(`${API_BASE_URL}/directors/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(directorData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании директора');
    return await response.json();
  }

  static async update(inn, directorData) {
    const response = await fetch(`${API_BASE_URL}/directors/${inn}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(directorData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении директора');
    return await response.json();
  }

  static async delete(inn) {
    const response = await fetch(`${API_BASE_URL}/directors/${inn}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении директора');
    return await response.json();
  }
}

class CompanyAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/companies/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных компаний');
    return await response.json();
  }

  static async get(inn) {
    const response = await fetch(`${API_BASE_URL}/companies/${inn}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Компания не найдена');
    return await response.json();
  }

  static async create(companyData) {
    const response = await fetch(`${API_BASE_URL}/companies/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании компании');
    return await response.json();
  }

  static async update(inn, companyData) {
    const response = await fetch(`${API_BASE_URL}/companies/${inn}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении компании');
    return await response.json();
  }

  static async delete(inn) {
    const response = await fetch(`${API_BASE_URL}/companies/${inn}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении компании');
    return await response.json();
  }
}

class CarAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/cars/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных автомобиля');
    return await response.json();
  }

  static async get(number_vin) {
    const response = await fetch(`${API_BASE_URL}/cars/${number_vin}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Автомобиль не найден');
    return await response.json();
  }

  static async create(carData) {
    const response = await fetch(`${API_BASE_URL}/cars/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании автомобиля');
    return await response.json();
  }

  static async update(number_vin, carData) {
    const response = await fetch(`${API_BASE_URL}/cars/${number_vin}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(carData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении автомобиля');
    return await response.json();
  }

  static async delete(number_vin) {
    const response = await fetch(`${API_BASE_URL}/cars/${number_vin}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении автомобиля');
    return await response.json();
  }
}

class AdmissionAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/admissions/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных учета');
    return await response.json();
  }

  static async get(id_number) {
    const response = await fetch(`${API_BASE_URL}/admissions/${id_number}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Учет не найден');
    return await response.json();
  }

  static async create(admissionData) {
    const response = await fetch(`${API_BASE_URL}/admissions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(admissionData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании учета');
    return await response.json();
  }

  static async update(id_number, admissionData) {
    const response = await fetch(`${API_BASE_URL}/admissions/${id_number}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(admissionData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении учета');
    return await response.json();
  }

  static async delete(id_number) {
    const response = await fetch(`${API_BASE_URL}/admissions/${id_number}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении учета');
    return await response.json();
  }
}

class ClientAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/clients/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных клиента');
    return await response.json();
  }

  static async get(app_number) {
    const response = await fetch(`${API_BASE_URL}/clients/${app_number}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Клиент не найден');
    return await response.json();
  }

  static async create(clientData) {
    const response = await fetch(`${API_BASE_URL}/clients/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании клиента');
    return await response.json();
  }

  static async update(app_number, clientData) {
    const response = await fetch(`${API_BASE_URL}/clients/${app_number}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении клиента');
    return await response.json();
  }

  static async delete(app_number) {
    const response = await fetch(`${API_BASE_URL}/clients/${app_number}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении клиента');
    return await response.json();
  }
}

class ExpanseAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/expanses/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных расхода');
    return await response.json();
  }

  static async get(id_expanse) {
    const response = await fetch(`${API_BASE_URL}/expanses/${id_expanse}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Расход не найден');
    return await response.json();
  }

  static async create(expanseData) {
    const response = await fetch(`${API_BASE_URL}/expanses/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expanseData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании расхода');
    return await response.json();
  }

  static async update(id_expanse, expanseData) {
    const response = await fetch(`${API_BASE_URL}/expanses/${id_expanse}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expanseData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении расхода');
    return await response.json();
  }

  static async delete(id_expanse) {
    const response = await fetch(`${API_BASE_URL}/expanses/${id_expanse}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении расхода');
    return await response.json();
  }
}

class AccountantAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/accountants/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных бухгалтера');
    return await response.json();
  }

  static async get(worker_id) {
    const response = await fetch(`${API_BASE_URL}/accountants/${worker_id}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Бухгалтер не найден');
    return await response.json();
  }

  static async create(accountantData) {
    const response = await fetch(`${API_BASE_URL}/accountants/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountantData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании бухгалтера');
    return await response.json();
  }

  static async update(worker_id, accountantData) {
    const response = await fetch(`${API_BASE_URL}/accountants/${worker_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accountantData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении бухгалтера');
    return await response.json();
  }

  static async delete(worker_id) {
    const response = await fetch(`${API_BASE_URL}/accountants/${worker_id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении бухгалтера');
    return await response.json();
  }
}

class DriverAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/drivers/`,{
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных водителя');
    return await response.json();
  }

  static async get(worker_id) {
    const response = await fetch(`${API_BASE_URL}/drivers/${worker_id}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Водитель не найден');
    return await response.json();
  }

  static async create(driverData) {
    const response = await fetch(`${API_BASE_URL}/drivers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driverData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании водителя');
    return await response.json();
  }

  static async update(worker_id, driverData) {
    const response = await fetch(`${API_BASE_URL}/drivers/${worker_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driverData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении водителя');
    return await response.json();
  }

  static async delete(worker_id) {
    const response = await fetch(`${API_BASE_URL}/drivers/${worker_id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении водителя');
    return await response.json();
  }
}

class SellerAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/sellers/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных продавца');
    return await response.json();
  }

  static async get(worker_id) {
    const response = await fetch(`${API_BASE_URL}/sellers/${worker_id}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Продавец не найден');
    return await response.json();
  }

  static async create(sellerData) {
    const response = await fetch(`${API_BASE_URL}/sellers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sellerData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании продавца');
    return await response.json();
  }

  static async update(worker_id, sellerData) {
    const response = await fetch(`${API_BASE_URL}/sellers/${worker_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sellerData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении продавца');
    return await response.json();
  }

  static async delete(worker_id) {
    const response = await fetch(`${API_BASE_URL}/sellers/${worker_id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении продавца');
    return await response.json();
  }
}

class LifeguardAPI {
  static async getAll() {
    const response = await fetch(`${API_BASE_URL}/lifeguards/`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при получении данных охранника');
    return await response.json();
  }

  static async get(worker_id) {
    const response = await fetch(`${API_BASE_URL}/lifeguards/${worker_id}`,{
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Охранник не найден');
    return await response.json();
  }

  static async create(lifeguardData) {
    const response = await fetch(`${API_BASE_URL}/lifeguards/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lifeguardData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при создании охранника');
    return await response.json();
  }

  static async update(worker_id, lifeguardData) {
    const response = await fetch(`${API_BASE_URL}/lifeguards/${worker_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lifeguardData),
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при обновлении охранника');
    return await response.json();
  }

  static async delete(worker_id) {
    const response = await fetch(`${API_BASE_URL}/lifeguards/${worker_id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Ошибка при удалении охранника');
    return await response.json();
  }
}

let authToken = null;
let isAuthenticated = false;
let currentUserRole = null;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

class AuthAPI {

    static async confirmEmail(email, code) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/confirm-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка подтверждения email');
            }

            const data = await response.json();
            data.session_id = getCookie('session_id');
            return data;
        } catch (error) {
            console.error('Confirm email error:', error);
            throw error;
        }
    }

    static async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: userData.username,
              email: userData.email,
              password: userData.password,
              repeated_password: userData.repeated_password,
              fio: userData.fio,
              birthday: userData.birthday
            }),
            credentials: 'include'
        });

        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при регистрации');
        }

        return await response.json();
    }

    static async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Ошибка при авторизации');
        }

        const data = await response.json();
        authToken = data.access_token;
        isAuthenticated = true;
        currentUserRole = data.role || (username === 'LaReyna' ? 'admin' : 'user');

        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userRole', currentUserRole);

        return data;
    }

    static async logout() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Ошибка при выходе');
            }

            // Очистка локального хранилища
            authToken = null;
            isAuthenticated = false;
            currentUserRole = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');

            document.cookie = `session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

            await fetch(`${API_BASE_URL}/`, {
                credentials: 'include'
            });

            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    static getAuthHeader() {
        return {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        };
    }
}

export { WorkerAPI, DirectorAPI, CompanyAPI, CarAPI, AdmissionAPI, ClientAPI,
ExpanseAPI, AccountantAPI, DriverAPI, SellerAPI, LifeguardAPI, AuthAPI };