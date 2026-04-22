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
        ui.showError('No se pudieron cargar las series. ¿Está corriendo el backend?');
    }
}

async function handleSave(event) {
    event.preventDefault();

    const data = ui.getFormData();
    const isEdit = data.id !== '';

    const payload = {
        name: data.name,
        current_episode: data.current_episode,
        total_episodes: data.total_episodes
    };

    try {
        const saved = isEdit
            ? await api.updateSeries(data.id, payload)
            : await api.createSeries(payload);

        if (data.imageFile) {
            try {
                await api.uploadImage(saved.id, data.imageFile);
            } catch (err) {
                alert(`La serie se guardó, pero la imagen no pudo subirse: ${err.message}`);
            }
        }

        ui.closeModal();
        await loadSeries();
    } catch (err) {
        if (err.status === 400 && err.details) {
            ui.showFormErrors(err.details);
        } else {
            alert(`Error al guardar: ${err.message}`);
        }
    }
}

async function handleDelete(id) {
    if (!confirm('¿Seguro que querés eliminar esta serie?')) return;

    try {
        await api.deleteSeries(id);
        await loadSeries();
    } catch (err) {
        alert(`Error al eliminar: ${err.message}`);
    }
}

async function handleEdit(id) {
    try {
        const serie = await api.getSeries(id);
        ui.openModal('edit', serie);
    } catch (err) {
        alert(`Error al cargar la serie: ${err.message}`);
    }
}

function bindEvents() {
    document.getElementById('btn-nueva-serie').addEventListener('click', () => {
        ui.openModal('create');
    });

    document.getElementById('modal-close').addEventListener('click', () => ui.closeModal());
    document.getElementById('btn-cancelar').addEventListener('click', () => ui.closeModal());

    document.getElementById('modal-serie').addEventListener('click', (event) => {
        if (event.target.id === 'modal-serie') ui.closeModal();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') ui.closeModal();
    });

    document.getElementById('form-serie').addEventListener('submit', handleSave);

    document.getElementById('series-grid').addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (!button) return;

        const { action, id } = button.dataset;

        if (action === 'edit') handleEdit(id);
        if (action === 'delete') handleDelete(id);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    loadSeries();
});