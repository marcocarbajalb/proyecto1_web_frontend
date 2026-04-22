const state = {
    page: 1,
    limit: 9,
    q: '',
    sort: 'id',
    order: 'desc'
};

async function loadSeries() {
    ui.showLoading();
    try {
        const response = await api.listSeries(state);
        ui.renderSeries(response.data);
    } catch (err) {
        console.error(err);
        ui.showError('No se pudieron cargar las series.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadSeries();
});