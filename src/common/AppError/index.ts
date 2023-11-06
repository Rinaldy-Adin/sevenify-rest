import { getReasonPhrase } from "http-status-codes";

export default class AppError extends Error {
    status?: number;

    constructor(status: number = 500, message?: string) {
        super(message);
        this.status = status;
        if (!message)
            this.message = getReasonPhrase(status);
    }
}
