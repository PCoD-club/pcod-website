import { Handler } from "@netlify/functions";
import { StatusCodes } from "http-status-codes";
import { GoogleSpreadsheet } from "google-spreadsheet";
import verify from "../webconnex";
import config from "./config";

const {
    MEMBER_ROSTER_SECRET,
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

function donationAmount(transaction: any): number {
    return parseFloat(
        transaction.registrant?.data?.[0]?.repeater?.[0]?.amount?.value
        ?? transaction.total
    );
}

export const handler: Handler = async (event, context) => {
    const [payload, webconnexFailure] = verify(event, MEMBER_ROSTER_SECRET);
    if (webconnexFailure) {
        return webconnexFailure;
    }

    const doc = new GoogleSpreadsheet(config.docId);

    await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replaceAll('\\n', '\n'),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsById[config.sheetId];

    const transaction = payload.data;
    const values = [
        customerID(transaction),
        transaction.transactionId,
        transaction.billing.name.last,
        transaction.billing.name.first,
        transaction.billing.email,
        transaction.subscription.dateCreated.replace("Z", "").replace("T", " "),
        transaction.subscription.dateLast.replace("Z", "").replace("T", " "),
        donationAmount(transaction),
        transaction.billing.paymentMethod,
        billingAddress(transaction),
        transaction.customerId,
    ];
    const row = await sheet.addRow(values);

    return {
        statusCode: StatusCodes.OK,
        body: JSON.stringify({
            index: row.rowIndex,
            values: values
        }),
    };
};
