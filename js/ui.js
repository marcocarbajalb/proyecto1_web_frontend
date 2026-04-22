const PLACEHOLDER_IMAGE = 'assets/placeholder.svg';

const ui = {
    renderSeries(list) {
        const grid = document.getElementById('series-grid');

        if (list.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>No hay series para mostrar.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = list.map(serie => this.renderCard(serie)).join('');
    },

    renderCard(serie) {
        const imageUrl = serie.image_path
            ? `${CONFIG.API_BASE_URL}${serie.image_path}`
            : PLACEHOLDER_IMAGE;

        const progressPercent = Math.round((serie.current_episode / serie.total_episodes) * 100);
        const isComplete = serie.current_episode === serie.total_episodes;

        return `
            <article class="card" data-id="${serie.id}">
                <div class="card-image-wrapper">
                    <img class="card-image" src="${this.escape(imageUrl)}" alt="${this.escape(serie.name)}" loading="lazy">
                    ${isComplete ? '<span class="card-badge">Completa</span>' : ''}
                </div>

                <div class="card-body">
                    <h3 class="card-title">${this.escape(serie.name)}</h3>

                    <div class="card-progress">
                        <div class="card-progress-bar">
                            <div class="card-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="card-progress-text">
                            ${serie.current_episode} / ${serie.total_episodes}
                        </span>
                    </div>

                    <div class="card-actions">
                        <button class="btn-icon" data-action="edit" data-id="${serie.id}" aria-label="Editar">
                            Editar
                        </button>
                        <button class="btn-icon btn-icon-danger" data-action="delete" data-id="${serie.id}" aria-label="Eliminar">
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
    }
};