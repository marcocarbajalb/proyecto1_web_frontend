const PLACEHOLDER_IMAGE = 'assets/placeholder.svg';

const ui = {
    renderSeries(response, onPageChange) {
        const grid = document.getElementById('series-grid');
        const list = response.data;

        if (list.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>No hay series para mostrar.</p>
                </div>
            `;
            this.renderPagination(response.pagination, onPageChange);
            return;
        }

        grid.innerHTML = list.map(serie => this.renderCard(serie)).join('');
        this.renderPagination(response.pagination, onPageChange);
    },

    renderCard(serie) {
        const imageUrl = serie.image_path
            ? `${CONFIG.API_BASE_URL}${serie.image_path}`
            : PLACEHOLDER_IMAGE;

        const progressPercent = Math.round((serie.current_episode / serie.total_episodes) * 100);
        const isComplete = serie.current_episode === serie.total_episodes;
        const rating = serie.rating ?? 0;

        const stars = Array.from({ length: 5 }, (_, i) => {
            const starValue = 5 - i;
            const filled = starValue <= rating;
            return `
                <button
                    class="star ${filled ? 'star-filled' : ''}"
                    data-action="rate"
                    data-id="${serie.id}"
                    data-rating="${starValue}"
                    aria-label="${starValue} estrella${starValue > 1 ? 's' : ''}"
                    title="${starValue} estrella${starValue > 1 ? 's' : ''}"
                >★</button>
            `;
        }).join('');

        return `
            <article class="card ${isComplete ? 'is-complete' : ''}" data-id="${serie.id}">
                <div class="card-image-wrapper">
                    <img class="card-image" src="${this.escape(imageUrl)}" alt="${this.escape(serie.name)}" loading="lazy">
                    ${isComplete ? '<span class="card-badge">Completa</span>' : ''}
                </div>

                <div class="card-body">
                    <h3 class="card-title">${this.escape(serie.name)}</h3>

                    <div class="card-rating" data-id="${serie.id}">
                        ${stars}
                    </div>

                    <div class="card-episode-controls">
                        <button class="btn-episode" data-action="decrease" data-id="${serie.id}" ${serie.current_episode === 0 ? 'disabled' : ''}>
                            −
                        </button>
                        <span class="card-episode-count">Episodio ${serie.current_episode}</span>
                        <button class="btn-episode" data-action="increase" data-id="${serie.id}" ${isComplete ? 'disabled' : ''}>
                            +
                        </button>
                    </div>

                    <div class="card-progress">
                        <div class="card-progress-bar">
                            <div class="card-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="card-progress-text">
                            <span>${serie.current_episode} / ${serie.total_episodes}</span>
                            <span>${progressPercent}%</span>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button class="btn-icon" data-action="edit" data-id="${serie.id}">
                            Editar
                        </button>
                        <button class="btn-icon btn-icon-danger" data-action="delete" data-id="${serie.id}">
                            Eliminar
                        </button>
                    </div>
                </div>
            </article>
        `;
    },

    escape(str) {
        const div = document.createElement('div');
        div.textContent = String(str ?? '');
        return div.innerHTML;
    },

    showError(message) {
        const grid = document.getElementById('series-grid');
        grid.innerHTML = `
            <div class="error-state">
                <p>${this.escape(message)}</p>
            </div>
        `;
    },

    showLoading() {
        const grid = document.getElementById('series-grid');
        grid.innerHTML = `
            <div class="loading-state">
                <p>Cargando...</p>
            </div>
        `;
    },

    openModal(mode, serie = null) {
        const overlay = document.getElementById('modal-serie');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('form-serie');
        const idInput = document.getElementById('form-id');
        const nameInput = document.getElementById('form-name');
        const currentInput = document.getElementById('form-current');
        const totalInput = document.getElementById('form-total');
        const imageInput = document.getElementById('form-image');

        form.reset();
        this.clearFormErrors();

        if (mode === 'create') {
            title.textContent = 'Nueva serie';
            idInput.value = '';
            currentInput.value = 0;
            totalInput.value = 1;
            overlay.classList.remove('modal-edit');
        } else {
            title.textContent = 'Editar serie';
            idInput.value = serie.id;
            nameInput.value = serie.name;
            currentInput.value = serie.current_episode;
            totalInput.value = serie.total_episodes;
            overlay.classList.add('modal-edit');
        }

        imageInput.value = '';
        overlay.classList.remove('hidden');
        nameInput.focus();
    },

    closeModal() {
        document.getElementById('modal-serie').classList.add('hidden');
        this.clearFormErrors();
    },

    getFormData() {
        return {
            id: document.getElementById('form-id').value,
            name: document.getElementById('form-name').value.trim(),
            current_episode: parseInt(document.getElementById('form-current').value, 10) || 0,
            total_episodes: parseInt(document.getElementById('form-total').value, 10) || 0,
            imageFile: document.getElementById('form-image').files[0] || null
        };
    },

    showFormErrors(details) {
        this.clearFormErrors();
        if (!details) return;

        for (const [field, message] of Object.entries(details)) {
            const el = document.getElementById(`error-${field}`);
            if (el) el.textContent = message;
        }
    },

    clearFormErrors() {
        document.querySelectorAll('.form-error').forEach(el => {
            el.textContent = '';
        });
    },

    updateCard(serie) {
        const existing = document.querySelector(`.card[data-id="${serie.id}"]`);
        if (!existing) return;

        const temp = document.createElement('div');
        temp.innerHTML = this.renderCard(serie);
        existing.replaceWith(temp.firstElementChild);
    },

    renderPagination(pagination, onPageChange) {
        const container = document.getElementById('pagination');

        if (pagination.total_pages <= 1) {
            container.innerHTML = '';
            return;
        }

        const { page, total_pages, total } = pagination;
        const prevDisabled = page <= 1 ? 'disabled' : '';
        const nextDisabled = page >= total_pages ? 'disabled' : '';

        container.innerHTML = `
            <button class="btn btn-secondary" data-page="${page - 1}" ${prevDisabled}>
                Anterior
            </button>
            <span class="pagination-info">
                Página ${page} de ${total_pages} · ${total} series
            </span>
            <button class="btn btn-secondary" data-page="${page + 1}" ${nextDisabled}>
                Siguiente
            </button>
        `;

        container.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const newPage = parseInt(btn.dataset.page, 10);
                onPageChange(newPage);
            });
        });
    }
};