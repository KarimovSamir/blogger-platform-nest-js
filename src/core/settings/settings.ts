export const SETTINGS = {
    ADMIN_LOGIN: "admin",
    ADMIN_PASSWORD: "qwerty",
    PORT: process.env.PORT || 5001,
    MONGO_URL:
        process.env.MONGO_URL || '',
    DB_NAME: process.env.DB_NAME || '',
    // Access token
    AC_SECRET: process.env.AC_SECRET || '',
    AC_TIME: Number(process.env.AC_TIME),
    // Refresh token
    RT_SECRET: process.env.RT_SECRET || '',
    RT_TIME: Number(process.env.RT_TIME),

    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    MAIL_FROM: process.env.MAIL_FROM || '',
    FRONTEND_CONFIRM_URL:
        process.env.FRONTEND_CONFIRM_URL || '',
    FRONTEND_RECOVERY_CODE_URL:
        process.env.FRONTEND_RECOVERY_CODE_URL || '',
    APP_BASE_URL:
        process.env.APP_BASE_URL || '',
};
