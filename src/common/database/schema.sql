CREATE TABLE IF NOT EXISTS users (
    id                                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login                                 VARCHAR(10) NOT NULL UNIQUE,
    email                                 VARCHAR(255) NOT NULL UNIQUE,
    password_hash                         VARCHAR(255) NOT NULL,
    is_email_confirmed                    BOOLEAN NOT NULL DEFAULT FALSE,
    email_confirmation_code               VARCHAR(255),
    email_confirmation_expiration_date    TIMESTAMP,
    email_confirmation_is_confirmed       BOOLEAN NOT NULL DEFAULT FALSE,
    password_recovery_code                VARCHAR(255),
    password_recovery_expiration_date     TIMESTAMP,
    deleted_at                            TIMESTAMP,
    created_at                            TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at                            TIMESTAMP NOT NULL DEFAULT NOW()
);