import endent from "endent";
import config from "#config";
import { DateTime } from "luxon";
const { sms_number, timezone } = config;

export default {
  smtpServer: { host: "mail.privateemail.com", port: 587, secure: false },
  emailFrom: "\"Psychedelic Club of Denver\" <membership@pcodenver.com>",
  emailSubject: "Psychedelic Club Discord",
  inviteReason: (reqData: any) =>
    `New member automated invite (GivingFuel order # ${reqData?.orderNumber})`,
  emailContent: (reqData: any, inviteUrl: string) =>
    endent`Hi there, ${reqData.billing.name.first}!
    <br/><br/>
    Thanks for joining the Psychedelic Club of Denver! You should have recently received an email outlining your membership perks, how your membership dues are spent, and some other information about being a member. This is an automated email to help get you into our private members-only Discord server.<br/>
    <a href="https://discord.com" style="color: #B300FF;">Discord</a> is a community-based messaging app that enables rich communication among our members. It's one of the most fun perks of being a Psychedelic Club member, and we're excited to invite you! Here are just some of the ways we're fostering our community through Discord:<br/>
    <ul>
      <li>Freeform conversation among members</li>
      <li>Sharing Psychedelic news, articles, art, memes, etc.</li>
      <li>Announcements for upcoming club events, unofficial hangouts, volunteer opportunities, and unaffiliated psychedelic events</li>
      <li>Exercise your voting power in the club with occasional polls</li>
      <li>However else you want to use it, this is <b>your</b> community!</li>
    </ul>
    (If you're concerned about others seeing that you're a member, don't worry. Your Discord memberships are private, so nobody outside of other club members will see that you're in this community.)
    <br/><br/>
    To get signed up, follow the unique invite link below. If you don't have a Discord account yet, the link will bring you through the account creation process. Feel free to set your username to whatever you want; we suggest using something recognizable like your name, but that's completely not required if you're uncomfortable sharing your identity. You can also change your nickname at any time by clicking on "Psychedelic Club of Denver" at the top of the channel list and selecting "Edit Server Profile".
    <br/><br/>
    Here's your unique invite link: <br/><b><a href="${inviteUrl}" style="color: #B300FF;">${inviteUrl}</a></b><br/>
    If that invite link doesn't work or you need help getting in, reply to this email or send us a text at <a href="sms://${sms_number.replace(
      /\D/g,
      ""
    )}" style="color: #B300FF;">${sms_number}</a>, and we'll help get you set up.
    <br/><br/>
    Once you're logged into the server, please read through the rules (they should be shown when you first join). Then feel free to introduce yourself in #introductions if you'd like and take a look around!<br/>
    We also have a master list of all our upcoming events in the 'Events' section at the top of the channel list. Included in that list should be a members-only social that we hold on the last Thursday of each month at 7PM at 700 Kalamath St; this is an awesome opportunity to get to know the members and to get more involved in the club. Thanks again for joining the Psychedelic Club of Denver, and we're so excited to get to know you!
    <br/><br/>
    <i>- Kess, Katie, Amber, and Nate</i>
    <br/><br/>
    <img src="https://pcodenver.com/assets/logo64.png" width="48px" height="48px" alt="Psychedelic Club of Denver Logo" />`,
  loopbackSubject: "New Member Notification",
  loopbackTo: "\"Psychedelic Club of Denver Membership\" <membership@pcodenver.com>",
  loopbackContent: (reqData: any) =>
    endent`This is an automated email to notify you of a new Psychedelic Club member registration.
    <br/><br/>
    <b>Personal & Contact Info</b><br/>
    Name: <b>${reqData.billing.name.first} ${reqData.billing.name.last}</b><br/>
    Email: <a href="mailto:${reqData.billing.email}">${reqData.billing.email}</a><br/>
    Billing Address: ${reqData.billing.address.street1}, ${reqData.billing.address.city} ${reqData.billing.address.state} ${reqData.billing.address.postalCode}<br/>
    Phone Number: <a href="sms://${reqData.billing.phone}">${reqData.billing.phone}</a>
    <br/><br/>
    <b>Registration Details</b><br/>
    Registration Timestamp: ${DateTime.fromISO(reqData.registrationTimestamp, { zone: timezone }).toFormat("ccc, LLL dd, yyyy, hh:mm a")}<br/>
    Amount Paid: $${reqData.registrants[0].data[0].repeater[0].amount.value}<br/>
    Order Number: ${reqData.orderNumber}<br/>
    Recurring Schedule: ${JSON.stringify(reqData.registrants[0].data[0].repeater[0].schedule?.value) || "One-time donation"}
    <br/><br/>
    - This email created and delivered by friendly neighborhood machine elves
    <br/><br/>
    <img src="https://pcodenver.com/assets/logo64.png" width="48px" height="48px" alt="Psychedelic Club of Denver Logo" />`
};
