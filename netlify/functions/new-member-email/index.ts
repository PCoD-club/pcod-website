console.log(process.version);

import { Handler } from "@netlify/functions";
import { StatusCodes } from "http-status-codes";
import { createHmac } from "crypto";
import { Client } from "discord.js";
import nodemailer from "nodemailer";
import striptags from "striptags";
import config from "./config";

const {
  WEBCONNEX_SECRET,
  API_KEY,
  DISCORD_TOKEN,
  DISCORD_GUILD_ID,
  DISCORD_INVITECHANNEL_ID,
  SMTP_EMAIL,
  SMTP_PASSWORD,
} = process.env;

const smtp = nodemailer.createTransport({
  ...config.smtpServer,
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

function verifyWebconnexSignature(body: string, received: string): boolean {
  const hmac = createHmac("sha256", WEBCONNEX_SECRET);
  hmac.update(body);
  const signature = hmac.digest("hex");
  return signature == received;
}

async function createDiscordInvite(reqData: any): Promise<string> {
  const discord = new Client({ intents: [] });
  await discord.login(DISCORD_TOKEN);
  const guild = await discord.guilds.fetch(DISCORD_GUILD_ID);
  const invite = await guild.invites.create(DISCORD_INVITECHANNEL_ID, {
    maxAge: 7 * 24 * 3600,
    maxUses: 1,
    unique: true,
    reason: config.inviteReason(reqData),
  });
  discord.destroy();
  return invite.url;
}

function sendEmail(body: string, toAddr: string) {
  return smtp.sendMail({
    from: `"Psychedelic Club of Denver" <${SMTP_EMAIL}>`,
    to: toAddr,
    subject: config.emailSubject,
    html: body,
    text: striptags(body),
  });
}

export const handler: Handler = async (event, context) => {
  if (
    !verifyWebconnexSignature(
      event.body,
      event.headers["X-Webconnex-Signature"]
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

  const invite = await createDiscordInvite(payload.data);
  const emailBody = config.emailContent(payload.data, invite);

  const emailResp = await sendEmail(emailBody, payload.data.billing.email);
  if (emailResp.rejected) {
    console.error(`Email rejected: ${emailResp.response}`);
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: "Could not send email",
    };
  }

  return { statusCode: StatusCodes.NO_CONTENT };
};
