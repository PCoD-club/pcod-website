import { Handler } from "@netlify/functions";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { StatusCodes } from "http-status-codes";
import config from "./config";

const {
    API_KEY,
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY
} = process.env;

export const handler: Handler = async (event, context) => {
    if (event.headers["x-api-key"] != API_KEY) {
        return { statusCode: StatusCodes.UNAUTHORIZED, body: "Invalid API Key" };
    }

    const doc = new GoogleSpreadsheet(config.docId);

    console.log("a");
    await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replaceAll('\\n', '\n'),
    });
    console.log("b");
    await doc.loadInfo();
    console.log("c");
    const sheet = doc.sheetsById[config.sheetId];

    const payload = JSON.parse(event.body);
    const values = [payload.key, payload.value];
    const row = await sheet.addRow(values);
    console.log("d");

    return {
        statusCode: StatusCodes.OK,
        body: JSON.stringify({
            index: row.rowIndex,
            values: values
        }),
        headers: { "Content-Type": "application/json" }
    };
};
