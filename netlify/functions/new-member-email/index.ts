import { Handler } from "@netlify/functions";
import { StatusCodes } from "http-status-codes";
import { createHmac } from "crypto";
import nodemailer from "nodemailer";
import striptags from "striptags";
import axios from "axios";
import config from "./config";

const {
  WEBCONNEX_SECRET,
  API_KEY,
  DISCORD_TOKEN,
  DISCORD_INVITECHANNEL_ID,
  SMTP_EMAIL,
  SMTP_PASSWORD,
  SMTP_DKIM,
} = process.env;

const smtp = nodemailer.createTransport({
  ...config.smtpServer,
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
  dkim: {
    domainName: "pcodenver.com",
    keySelector: "default",
    privateKey: SMTP_DKIM
  },
});

function verifyWebconnexSignature(body: string, received: string): boolean {
  const hmac = createHmac("sha256", WEBCONNEX_SECRET);
  hmac.update(body);
  const signature = hmac.digest("hex");
  return signature == received;
}

async function createDiscordInvite(reqData: any) {
  const resp = await axios.post(
    `https://discord.com/api/v9/channels/${DISCORD_INVITECHANNEL_ID}/invites`,
    {
      max_age: 604800,
      max_uses: 1,
      temporary: false,
      unique: true,
    },
    {
      headers: {
        Authorization: `Bot ${DISCORD_TOKEN}`,
        "X-Audit-Log-Reason": config.inviteReason(reqData),
      },
    }
  );

  if (resp.status != StatusCodes.OK) {
    throw new Error(`Discord response code ${resp.status}: ${resp.data}`);
  }

  return `https://discord.gg/${resp.data.code}`;
}

function sendEmail(body: string, toAddr: string, subject: string = config.emailSubject) {
  return smtp.sendMail({
    from: config.emailFrom || `"Psychedelic Club of Denver" <${SMTP_EMAIL}>`,
    to: toAddr,
    subject: subject,
    html: body,
    text: striptags(body),
  });
}

export const handler: Handler = async (event, context) => {
  if (
    !verifyWebconnexSignature(
      event.body,
      event.headers["x-webconnex-signature"]
    )
  ) {
    return {
      statusCode: StatusCodes.UNAUTHORIZED,
      body: "Invalid or missing X-Webconnex-Signature",
    };
  }

  const payload = JSON.parse(event.body);

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

  const reqData = payload.data;
  const invite = await createDiscordInvite(reqData);
  const emailBody = config.emailContent(reqData, invite);

  const emailTo = `"${reqData.billing.name.first} ${reqData.billing.name.last}" <${reqData.billing.email}>`
  const emailResp = await sendEmail(emailBody, emailTo);
  if (emailResp.rejected.length > 0) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: `Could not send email: ${emailResp}`,
    };
  }

  const loopbackBody = config.loopbackContent(reqData);
  const loopbackResp = await sendEmail(loopbackBody, config.loopbackTo, config.loopbackSubject);
  if (loopbackResp.rejected.length > 0) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: `Could not send loopback email: ${loopbackResp}`,
    };
  }

  return {
    statusCode: StatusCodes.OK,
    body: JSON.stringify({
      invite,
      emailBody,
      emailResp,
    }),
  };
};
