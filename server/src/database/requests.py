# Бухгалтер

GET_AVAILABLE_ACCOUNTANTS = """
    SELECT w.worker_id 
    FROM workers w
    WHERE w.post = 'Бухгалтер'
    AND NOT EXISTS (
        SELECT 1 FROM accountant a 
        WHERE a.worker_id = w.worker_id
    )
"""

CREATE_ACCOUNTANT = """
    INSERT INTO accountant (worker_id, qual, kit, id_number)
    VALUES ($1, $2, $3, $4)
    RETURNING *
"""

GET_ALL_ACCOUNTANTS = "SELECT * FROM accountant;"

GET_ACCOUNTANT = "SELECT * FROM accountant WHERE worker_id = $1;"

UPDATE_ACCOUNTANT = """
    UPDATE accountant SET 
        qual = $1,
        kit = $2,
        id_number = $3
    WHERE worker_id = $4
    RETURNING *;
"""

DELETE_ACCOUNTANT = "DELETE FROM accountant WHERE worker_id = $1 RETURNING worker_id;"


# Журнал поставок

CREATE_ADMISSION = """
    INSERT INTO admission_journal (
        admission_date, complectation, color, mark, model, year_create
    ) 
    VALUES (
        $1, $2, $3, $4, $5, $6
    ) RETURNING *;
"""

GET_ALL_ADMISSIONS = "SELECT * FROM admission_journal"

GET_ADMISSION = "SELECT * FROM admission_journal WHERE id_number = $1;"

UPDATE_ADMISSION = """
    UPDATE admission_journal SET
        admission_date = $1, 
        complectation = $2,
        color = $3,
        mark = $4,
        model = $5, 
        year_create = $6
    WHERE id_number = $7
    RETURNING *;
"""

DELETE_ADMISSION = "DELETE FROM admission_journal WHERE id_number = $1 RETURNING id_number;"


# Автомобиль

CREATE_CAR = """
    INSERT INTO car (number_vin, complectation, color, mark, model, year_create, app_number) 
    VALUES (
        $1, $2, $3, $4, $5, $6, $7
    ) RETURNING *;
"""

GET_ALL_CARS = "SELECT * FROM car"

GET_CAR = "SELECT * FROM car WHERE number_vin = $1;"

UPDATE_CAR = """
    UPDATE car SET 
        complectation = $1,
        color = $2,
        mark = $3,
        model = $4, 
        year_create = $5,
        app_number = $6
    WHERE number_vin = $7
    RETURNING *;
"""

DELETE_CAR = "DELETE FROM car WHERE number_vin = $1 RETURNING number_vin;"


# Клиент

CREATE_CLIENT = """
    INSERT INTO client (budget, current_car, prefer_car) VALUES (
        $1, $2, $3
    ) RETURNING *;
"""

GET_ALL_CLIENTS = "SELECT * FROM client"

GET_CLIENT = "SELECT * FROM client WHERE app_number = $1;"

UPDATE_CLIENT = """
    UPDATE client SET 
        budget = $1,
        current_car = $2,
        prefer_car = $3
    WHERE app_number = $4
    RETURNING *;
"""

DELETE_CLIENT = "DELETE FROM client WHERE app_number = $1 RETURNING app_number;"


# Компания

CREATE_COMPANY = """
    INSERT INTO company (inn, name_company, address) VALUES ($1, $2, $3) RETURNING *;
"""

GET_ALL_COMPANIES = "SELECT * FROM company"

GET_COMPANY = "SELECT * FROM company WHERE inn = $1;"

UPDATE_COMPANY = """
    UPDATE company SET 
        name_company = $1,
        address = $2
    WHERE inn = $3
    RETURNING *;
"""

DELETE_COMPANY = "DELETE FROM company WHERE inn = $1 RETURNING inn;"


# Директор

CREATE_DIRECTOR = """
    INSERT INTO director (inn, profit, surname, firstname, lastname, inn_company) 
    VALUES (
        $1, $2, $3, $4, $5, $6
    ) RETURNING *;
"""

GET_ALL_DIRECTORS = "SELECT * FROM director"

GET_DIRECTOR = "SELECT * FROM director WHERE inn = $1;"

UPDATE_DIRECTOR = """
    UPDATE director SET 
        profit = $1,
        surname = $2,
        firstname = $3,
        lastname = $4, 
        inn_company = $5
    WHERE inn = $6
    RETURNING *;
"""

DELETE_DIRECTOR = "DELETE FROM director WHERE inn = $1 RETURNING inn;"


# Водитель

GET_AVAILABLE_DRIVERS = """
    SELECT w.worker_id 
    FROM workers w
    WHERE w.post = 'Водитель'
    AND NOT EXISTS (
        SELECT 1 FROM driver d 
        WHERE d.worker_id = w.worker_id
    )
"""

CREATE_DRIVER = """
    INSERT INTO driver (worker_id, car_number, snacks, number_vin)
    VALUES ($1, $2, $3, $4)
    RETURNING *
"""

GET_ALL_DRIVERS = "SELECT * FROM driver;"

GET_DRIVER = "SELECT * FROM driver WHERE worker_id = $1;"

UPDATE_DRIVER = """
    UPDATE driver SET 
        car_number = $1,
        snacks = $2,
        number_vin = $3
    WHERE worker_id = $4
    RETURNING *;
"""

DELETE_DRIVER = "DELETE FROM driver WHERE worker_id = $1 RETURNING worker_id;"


# Журнал расходов

CREATE_EXPANSE = """
    INSERT INTO expanse_journal (expanse_type, expanse_sum, expanse_name) VALUES (
        $1, $2, $3
    ) RETURNING *;
"""

GET_ALL_EXPANSES = "SELECT * FROM expanse_journal"

GET_EXPANSE = "SELECT * FROM expanse_journal WHERE id_expanse = $1;"

UPDATE_EXPANSE = """
    UPDATE expanse_journal SET 
        expanse_type = $1,
        expanse_sum = $2,
        expanse_name = $3
    WHERE id_expanse = $4
    RETURNING *;
"""

DELETE_EXPANSE = "DELETE FROM expanse_journal WHERE id_expanse = $1 RETURNING id_expanse;"


# Охрана

GET_AVAILABLE_LIFEGUARDS = """
    SELECT w.worker_id 
    FROM workers w
    WHERE w.post = 'Охранник'
    AND NOT EXISTS (
        SELECT 1 FROM lifeguards l 
        WHERE l.worker_id = w.worker_id
    )
"""

CREATE_LIFEGUARD = """
    INSERT INTO lifeguards (worker_id, uniform, kit, security_zone)
    VALUES ($1, $2, $3, $4)
    RETURNING *
"""

GET_ALL_LIFEGUARDS = "SELECT * FROM lifeguards;"

GET_LIFEGUARD = "SELECT * FROM lifeguards WHERE worker_id = $1;"

UPDATE_LIFEGUARD = """
    UPDATE lifeguards SET 
        uniform = $1,
        kit = $2,
        security_zone = $3
    WHERE worker_id = $4
    RETURNING *;
"""

DELETE_LIFEGUARD = "DELETE FROM lifeguards WHERE worker_id = $1 RETURNING worker_id;"


# Продавцы

GET_AVAILABLE_SELLERS = """
    SELECT w.worker_id 
    FROM workers w
    WHERE w.post = 'Продавец'
    AND NOT EXISTS (
        SELECT 1 FROM seller s 
        WHERE s.worker_id = w.worker_id
    )
"""

CREATE_SELLER = """
    INSERT INTO seller (worker_id, seller_type, app_number)
    VALUES ($1, $2, $3)
    RETURNING *
"""

GET_ALL_SELLERS = "SELECT * FROM seller;"

GET_SELLER = "SELECT * FROM seller WHERE worker_id = $1;"

UPDATE_SELLER = """
    UPDATE seller SET 
        seller_type = $1,
        app_number = $2
    WHERE worker_id = $3
    RETURNING *;
"""

DELETE_SELLER = "DELETE FROM seller WHERE worker_id = $1 RETURNING worker_id;"


# Сотрудники

CREATE_WORKER = """
    INSERT INTO workers (
        salary, post, experience, surname, firstname, 
        lastname, phone_number, address, id_expanse, inn_director
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    ) RETURNING *;
"""

GET_ALL_WORKERS = "SELECT * FROM workers"

GET_WORKER = "SELECT * FROM workers WHERE worker_id = $1;"

UPDATE_WORKER = """
    UPDATE workers SET 
        salary = $1,
        post = $2,
        experience = $3,
        surname = $4,
        firstname = $5,
        lastname = $6,
        phone_number = $7,
        address = $8,
        id_expanse = $9,
        inn_director = $10
    WHERE worker_id = $11
    RETURNING *;
"""

DELETE_WORKER = "DELETE FROM workers WHERE worker_id = $1 RETURNING worker_id;"


# Дополнительно

# Получение случайного номер поставки таблицы admission_journal
GET_RANDOM_ID_NUMBER = """
    SELECT id_number FROM admission_journal 
    ORDER BY RANDOM() 
    LIMIT 1
"""

# Получение случайного VIN-номер таблицы car
GET_RANDOM_NUMBER_VIN = """
    SELECT number_vin FROM car 
    ORDER BY RANDOM() 
    LIMIT 1
"""

# Получение случайной заявки клиент таблицы client
GET_RANDOM_APP_NUMBER = """
    SELECT app_number FROM client 
    ORDER BY RANDOM() 
    LIMIT 1
"""

# Получение случайного ИНН компании таблицы company
GET_RANDOM_INN = """
    SELECT inn FROM company 
    ORDER BY RANDOM() 
    LIMIT 1
"""

# Получение случайного ИНН директора таблицы director
GET_RANDOM_INN_DIRECTOR = """
    SELECT inn FROM director 
    ORDER BY RANDOM() 
    LIMIT 1
"""

# Получение случайного номер расхода таблицы expanse_journal
GET_RANDOM_ID_EXPANSE = """
    SELECT id_expanse FROM expanse_journal 
    ORDER BY RANDOM() 
    LIMIT 1
"""