import { Handler } from "@netlify/functions";
import { StatusCodes } from "http-status-codes";
import { GoogleSpreadsheet } from "google-spreadsheet";
import verify from "../webconnex";
import config from "./config";

const {
    MEMBER_ROSTER_SECRET,
    MEMBER_ROSTER_DOCID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY
} = process.env;

function customerID(transaction: any): string {
    return transaction.billing.email;
}

function billingAddress(transaction: any): string {
    const addr = transaction.billing.address;
    return [addr.street1, addr.street2, addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ");
}

export const handler: Handler = async (event, context) => {
    const [payload, webconnexFailure] = verify(event, MEMBER_ROSTER_SECRET);
    if (webconnexFailure) {
        return webconnexFailure;
    }

    const doc = new GoogleSpreadsheet(MEMBER_ROSTER_DOCID);

    await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo();
    const sheet = doc.sheetsById[config.sheetId];

    const transaction = payload.data;
    const values = [
        customerID(transaction),
        transaction.transactionID,
        transaction.billing.name.last,
        transaction.billing.name.first,
        transaction.billing.email,
        transaction.subscription.dateCreated,
        transaction.subscription.dateLast,
        transaction.subscription.amount,
        transaction.billing.paymentMethod,
        billingAddress(transaction)
    ];
    const row = await sheet.addRow(values);

    return {
        statusCode: StatusCodes.OK,
        body: JSON.stringify({
            index: row.rowIndex,
            values: values,
            row: row
        }),
    };
};
