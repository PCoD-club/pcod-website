import { Event } from "@netlify/functions/dist/function/event";
import { Response } from "@netlify/functions/dist/function/response";
import { createHmac } from "crypto";
import { StatusCodes } from "http-status-codes";

const {
    API_KEY
} = process.env;

function verifyWebconnexSignature(event: Event, secret: string): Response {
    console.log(btoa(event.body));
    const hmac = createHmac("sha256", secret);
    hmac.update(event.body);
    const signature = hmac.digest("hex");
    return signature == event.headers["x-webconnex-signature"] ? null : {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: "Invalid or missing X-Webconnex-Signature",
    };
}

function verifyWebconnexApiKey(payload: any): Response {
    const apiKeyReceived = payload?.meta?.appKey;
    if (!apiKeyReceived) {
        return {
            statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
            body: "Missing API Key",
        };
    }
    if (apiKeyReceived != API_KEY) {
        return { statusCode: StatusCodes.UNAUTHORIZED, body: "Invalid API Key" };
    }
    return null;
}

export default function verifyWebconnex(event: Event, secret: string): [any, Response] {
    var payload = null;
    var failure = verifyWebconnexSignature(event, secret);

    if (!failure) {
        payload = JSON.parse(event.body);
        failure = verifyWebconnexApiKey(payload);
    }

    return [payload, failure];

}