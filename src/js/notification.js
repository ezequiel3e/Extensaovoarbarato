class NotificationSystem {
    constructor() {
        this.container = document.getElementById('aviso-sistema');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'aviso-sistema';
            document.body.appendChild(this.container);
        }
        this.timeoutId = null;
        this.currentNotification = null;
    }

    show(message, type = 'info', duration = 5000) {
        // Limpa qualquer notificação existente
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        if (this.currentNotification) {
            this.currentNotification.remove();
        }

        // Cria o elemento de notificação
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = type;

        // Adiciona a notificação ao container
        this.container.innerHTML = ''; // Limpa notificações anteriores
        this.container.appendChild(notification);
        this.currentNotification = notification;

        // Configura o timeout para remover a notificação
        this.timeoutId = setTimeout(() => {
            this.hide();
        }, duration);

        // Adiciona evento de clique para fechar a notificação
        notification.addEventListener('click', () => {
            this.hide();
        });
    }

    hide() {
        if (this.currentNotification) {
            this.currentNotification.remove();
            this.currentNotification = null;
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }

    success(message, duration) {
        this.show(message, 'sucesso', duration);
    }

    error(message, duration) {
        this.show(message, 'erro', duration);
    }

    warning(message, duration) {
        this.show(message, 'alerta', duration);
    }
}

// Cria uma instância global do sistema de notificações
window.notificationSystem = new NotificationSystem();

// Exemplo de uso:
// notificationSystem.info('Buscando voos...');
// notificationSystem.success('Voos encontrados com sucesso!');
// notificationSystem.error('Erro ao buscar voos. Tente novamente.');
// notificationSystem.warning('Poucos assentos disponíveis.');