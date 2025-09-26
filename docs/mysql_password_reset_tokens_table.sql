-- Script SQL pour créer la table password_reset_tokens en MySQL
-- Compatible avec le repository MySQLResetPasswordRepository

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    hashed_token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes de recherche par token
CREATE INDEX idx_token_lookup ON password_reset_tokens(token);

-- Index pour optimiser les suppressions par user_id
CREATE INDEX idx_user_id_delete ON password_reset_tokens(user_id);

-- Optionnel : Table pour nettoyer automatiquement les tokens expirés
-- Cette requête peut être exécutée périodiquement par un cron job
-- DELETE FROM password_reset_tokens WHERE created_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE);




