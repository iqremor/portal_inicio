export function showModal({ title, body, onConfirm, onCancel }) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${body}
            </div>
            <div class="modal-footer">
                <button class="btn-secondary modal-cancel">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
                <button class="btn-primary modal-start">
                    <i class="fas fa-play"></i>
                    Confirmar
                </button>
            </div>
        </div>
    `;

    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const confirmBtn = modal.querySelector('.modal-start');

    const closeModal = () => {
        modal.remove();
        if (onCancel) {
            onCancel();
        }
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    confirmBtn.addEventListener('click', () => {
        if (onConfirm) {
            onConfirm();
        }
        closeModal();
    });

    document.body.appendChild(modal);
}
