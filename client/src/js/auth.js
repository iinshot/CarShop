import { AuthAPI } from './api.js';

function showEmailConfirmationModal(email) {
    const modal = document.getElementById('emailConfirmationModal');
    document.getElementById('confirmationEmail').textContent = email;
    modal.style.display = 'flex';
    document.getElementById('registerForm').style.display = 'none';
}

function hideEmailConfirmationModal() {
    document.getElementById('emailConfirmationModal').style.display = 'none';
}

async function handleEmailConfirmation(e) {
    e.preventDefault();
    const code = e.target.confirmationCode.value;

    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
        alert('Код должен состоять из 6 цифр');
        return;
    }

    try {
        const email = document.querySelector('#registerForm input[name="email"]').value;
        const response = await AuthAPI.confirmEmail(email, code);

        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('userRole', 'user');
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;

    const regixs = {
        username: /^[a-zA-Z0-9_-]+$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+]).+$/,
        fio: /^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+$/,
        birthday: /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/
    };

    const validators = {
        username: (value) => {
            if (!value) return "Это поле обязательно для заполнения";
            if (value.length < 3) return "Логин должен содержать минимум 3 символа";
            if (value.length > 16) return "Логин должен содержать максимум 16 символов";
            if (!regixs.username.test(value)) return "Логин может содержать только латиницу, цифры, _ и -";
            return null;
        },

        email: (value) => {
            if (!value) return "Это поле обязательно для заполнения";
            if (value.length < 5) return "Email должен содержать минимум 5 символов";
            if (value.length > 254) return "Email должен содержать максимум 254 символа";
            if (!regixs.email.test(value)) return "Некорректный email";
            return null;
        },

        password: (value) => {
            if (!value) return "Это поле обязательно для заполнения";
            if (value.length < 8) return "Пароль должен содержать минимум 8 символов";
            if (value.length > 128) return "Пароль должен содержать максимум 128 символов";
            if (!/[a-z]/.test(value)) return "Пароль должен содержать строчную букву";
            if (!/[A-Z]/.test(value)) return "Пароль должен содержать заглавную букву";
            if (!/\d/.test(value)) return "Пароль должен содержать цифру";
            if (!/[!@#$%^&*()_+]/.test(value)) return "Пароль должен содержать специальный символ";
            return null;
        },

        repeated_password: (value, passwordValue) => {
            if (!value) return "Это поле обязательно для заполнения";
            if (value !== passwordValue) return "Пароли не совпадают";
            return null;
        },

        fio: (value) => {
            if (!value) return "Это поле обязательно для заполнения";
            if (!regixs.fio.test(value)) return "Введите ФИО полностью на кириллице (Пример: Иванов Иван Иванович)";
            return null;
        },

        birthday: (value) => {
            if (!value) return "Это поле обязательно для заполнения";
            if (!regixs.birthday.test(value)) return "Дата должна быть в формате ДД.ММ.ГГГГ";

            const [day, month, year] = value.split('.').map(Number);
            const birthDate = new Date(year, month - 1, day);
            const today = new Date();

            if (birthDate > today) return "Дата рождения не может быть в будущем";
            return null;
        }
    };

    function showError(input, message) {
        const errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains("error-message-valid")) {
            const newErrorElement = document.createElement("span");
            newErrorElement.className = "error-message-valid";
            input.parentNode.insertBefore(newErrorElement, input.nextSibling);
        }
        input.nextElementSibling.textContent = message;
        input.nextElementSibling.style.display = "block";
        input.classList.add("input-error-valid");
    }

    function hideError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains("error-message-valid")) {
            errorElement.style.display = "none";
        }
        input.classList.remove("input-error-valid");
    }

    function setValidation(input, validator, extraField = null) {
        const validate = () => {
            const value = input.value;
            const error = extraField ? validator(value, extraField.value) : validator(value);
            if (error) showError(input, error);
            else hideError(input);
        };
        input.addEventListener("input", validate);
        input.addEventListener("blur", validate);
    }

    // Получаем все поля формы
    const fields = {
        username: form.querySelector('[name="username"]'),
        email: form.querySelector('[name="email"]'),
        password: form.querySelector('[name="password"]'),
        repeated_password: form.querySelector('[name="repeated_password"]'),
        fio: form.querySelector('[name="fio"]'),
        birthday: form.querySelector('[name="birthday"]')
    };

    setValidation(fields.username, validators.username);
    setValidation(fields.email, validators.email);
    setValidation(fields.password, validators.password);
    setValidation(fields.repeated_password, (value) => validators.repeated_password(value, fields.password.value));
    setValidation(fields.fio, validators.fio);
    setValidation(fields.birthday, validators.birthday);

    // Проверяем все поля перед отправкой
    let isValid = true;

    // Валидация username
    const usernameError = validators.username(fields.username.value);
    if (usernameError) {
        showError(fields.username, usernameError);
        isValid = false;
    }

    // Валидация email
    const emailError = validators.email(fields.email.value);
    if (emailError) {
        showError(fields.email, emailError);
        isValid = false;
    }

    // Валидация password
    const passwordError = validators.password(fields.password.value);
    if (passwordError) {
        showError(fields.password, passwordError);
        isValid = false;
    }

    // Валидация repeated_password
    const repeatedPasswordError = validators.repeated_password(
        fields.repeated_password.value,
        fields.password.value
    );
    if (repeatedPasswordError) {
        showError(fields.repeated_password, repeatedPasswordError);
        isValid = false;
    }

    // Валидация fio
    const fioError = validators.fio(fields.fio.value);
    if (fioError) {
        showError(fields.fio, fioError);
        isValid = false;
    }

    // Валидация birthday
    const birthdayError = validators.birthday(fields.birthday.value);
    if (birthdayError) {
        showError(fields.birthday, birthdayError);
        isValid = false;
    }

    if (!isValid) {
        // Прокручиваем к первой ошибке
        const firstError = form.querySelector(".input-error-valid");
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Если все проверки пройдены, собираем данные для отправки
    const userData = {
        username: fields.username.value,
        email: fields.email.value,
        password: fields.password.value,
        repeated_password: fields.repeated_password.value,
        fio: fields.fio.value,
        birthday: fields.birthday.value
    };

    try {
        await AuthAPI.register(userData);
        showEmailConfirmationModal(userData.email);
    } catch (error) {
        alert(error.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('authToken')) {
        window.location.href = 'index.html';
    }

    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.auth-tab, .auth-form').forEach(el => {
                el.classList.remove('active');
            });
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}Form`).classList.add('active');
        });
    });

    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const data = await AuthAPI.login(formData.get('username'), formData.get('password'));
            localStorage.setItem('authToken', data.access_token);
            localStorage.setItem('userRole', formData.get('username') === 'LaReyna' ? 'admin' : 'user');
            window.location.href = 'index.html';
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
    document.getElementById('confirmEmailForm')?.addEventListener('submit', handleEmailConfirmation);
});