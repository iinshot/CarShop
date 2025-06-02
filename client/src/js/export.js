import { WorkerAPI, DirectorAPI, CompanyAPI, CarAPI,
AdmissionAPI, ClientAPI, ExpanseAPI, AccountantAPI,
DriverAPI, SellerAPI, LifeguardAPI, AuthAPI } from './api.js';

export async function exportToExcel(entity) {
    try {
        let response;
        switch(entity) {
            case 'cars':
                response = await CarAPI.getAll();
                break;
            case 'workers':
                response = await WorkerAPI.getAll();
                break;
            case 'directors':
                response = await DirectorAPI.getAll();
                break;
            case 'drivers':
                response = await DriverAPI.getAll();
                break;
            case 'companies':
                response = await CompanyAPI.getAll();
                break;
            case 'admissions':
                response = await AdmissionAPI.getAll();
                break;
            case 'accountants':
                response = await AccountantAPI.getAll();
                break;
            case 'sellers':
                response = await SellerAPI.getAll();
                break;
            case 'lifeguards':
                response = await LifeguardAPI.getAll();
                break;
            case 'clients':
                response = await ClientAPI.getAll();
                break;
            case 'expanses':
                response = await ExpanseAPI.getAll();
                break;
            default:
                throw new Error('Неизвестный тип сущности');
        }
        const data = response.cars || response.companies || response.directors ||
        response.workers || response.drivers || response.accountants || response.lifeguards ||
        response.sellers || response.admissions || response.clients || response.expanses ||
        response.rows || response.data || response;

        if (!Array.isArray(data)) {
            throw new Error('Данные не в формате массива');
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `${entity}.xlsx`);

    } catch (error) {
        console.error('Export error:', error);
        alert('Не удалось экспортировать данные: ' + error.message);
    }
}