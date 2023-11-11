import { Response } from 'express';

export default class httpResponse {
    private res: Response;
    private body: Object | null;
    private statusCode: number;
    private message: string;

    constructor(
        res: Response,
        body: Object | null,
        statusCode: number = 200,
        message: string = 'Success'
    ) {
        this.res = res;
        this.body = body;
        this.statusCode = statusCode;
        this.message = message;
    }

    public json() {
        this.res.status(this.statusCode);
        return this.res.json({
            body: this.body,
            messsage: this.message,
        });
    }
}
