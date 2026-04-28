CREATE TABLE IF NOT EXISTS users (
    id                                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login                                 VARCHAR(10) NOT NULL UNIQUE,
    email                                 VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash"                        VARCHAR(255) NOT NULL,
    "isEmailConfirmed"                    BOOLEAN NOT NULL DEFAULT FALSE,
    "emailConfirmation_confirmationCode"  VARCHAR(255),
    "emailConfirmation_expirationDate"    TIMESTAMP,
    "emailConfirmation_isConfirmed"       BOOLEAN NOT NULL DEFAULT FALSE,
    "passwordRecovery_recoveryCode"       VARCHAR(255),
    "passwordRecovery_expirationDate"     TIMESTAMP,
    "deletedAt"                           TIMESTAMP,
    "createdAt"                           TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt"                           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"      UUID NOT NULL,
    "deviceId"    UUID NOT NULL UNIQUE,
    ip            VARCHAR(50) NOT NULL,
    title         VARCHAR(255) NOT NULL,
    "lastActiveDate" TIMESTAMP NOT NULL,
    "expireAt"    TIMESTAMP NOT NULL,
    "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blogs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(15) NOT NULL,
    description   VARCHAR(500) NOT NULL,
    "websiteUrl"  VARCHAR(100) NOT NULL,
    "isMembership" BOOLEAN NOT NULL DEFAULT FALSE,
    "deletedAt"   TIMESTAMP,
    "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title              VARCHAR(30) NOT NULL,
    "shortDescription" VARCHAR(100) NOT NULL,
    content            VARCHAR(1000) NOT NULL,
    "blogId"           UUID NOT NULL REFERENCES blogs(id),
    "blogName"         VARCHAR(15) NOT NULL,
    "likesCount"       INTEGER NOT NULL DEFAULT 0,
    "dislikesCount"    INTEGER NOT NULL DEFAULT 0,
    "deletedAt"        TIMESTAMP,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt"        TIMESTAMP NOT NULL DEFAULT NOW()
);
