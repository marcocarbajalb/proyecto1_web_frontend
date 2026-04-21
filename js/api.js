class ApiError extends Error {
    constructor(message, status, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

async function request(path, options = {}) {
    const response = await fetch(`${CONFIG.API_BASE_URL}${path}`, options);

    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(
            data.error || 'Error en la petición',
            response.status,
            data.details
        );
    }

    return data;
}

const api = {
    listSeries({ page = 1, limit = 10, q = '', sort = 'id', order = 'desc' } = {}) {
        const params = new URLSearchParams({ page, limit, sort, order });
        if (q) params.set('q', q);
        return request(`/series?${params}`);
    },

    getSeries(id) {
        return request(`/series/${id}`);
    },

    createSeries(data) {
        return request('/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    updateSeries(id, data) {
        return request(`/series/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    },

    deleteSeries(id) {
        return request(`/series/${id}`, { method: 'DELETE' });
    },

    uploadImage(id, file) {
        const formData = new FormData();
        formData.append('image', file);
        return request(`/series/${id}/image`, {
            method: 'POST',
            body: formData
        });
    },

    setRating(id, rating) {
        return request(`/series/${id}/rating`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating })
        });
    },

    deleteRating(id) {
        return request(`/series/${id}/rating`, { method: 'DELETE' });
    }
};