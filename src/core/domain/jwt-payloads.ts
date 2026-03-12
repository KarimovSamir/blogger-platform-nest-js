export type AccessPayload = {
    userId: string;
    iat?: number;
    exp?: number;
};

export type RefreshPayload = {
    userId: string;
    deviceId: string;
    iat?: number;
    exp?: number;
};
