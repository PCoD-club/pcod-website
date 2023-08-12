import { Handler } from "@netlify/functions";
import { StatusCodes } from "http-status-codes";
import nodemailer from "nodemailer";
import striptags from "striptags";
import axios from "axios";
import config from "./config";
import verify from "../webconnex";

const {
  NEW_MEMBER_EMAIL_SECRET,
  DISCORD_TOKEN,
  GOOGLE_SERVICE_ACCOUNT_CLIENTID,
  GOOGLE_PRIVATE_KEY
} = process.env;

const gmail = nodemailer.createTransport({
  ...config.smtpServer,
  auth: {
    type: "OAUTH2",
    user: config.emailLogin,
    serviceClient: GOOGLE_SERVICE_ACCOUNT_CLIENTID,
    privateKey: GOOGLE_PRIVATE_KEY.replaceAll('\\n', '\n')
  },
});

async function createDiscordInvite(reqData: any) {
  const resp = await axios.post(
    `https://discord.com/api/v9/channels/${config.inviteChannel}/invites`,
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
  return gmail.sendMail({
    from: config.emailFrom,
    replyTo: "",
    to: toAddr,
    subject: subject,
    html: body,
    text: striptags(body),
  });
}

export const handler: Handler = async (event, context) => {
  const [payload, webconnexFailure] = verify(event, NEW_MEMBER_EMAIL_SECRET);
  if (webconnexFailure) {
    return webconnexFailure;
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
