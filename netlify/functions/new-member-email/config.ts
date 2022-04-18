import endent from "endent";
import config from "#config";
const { sms_number } = config;

export default {
  smtpServer: { host: "mail.privateemail.com", port: 587, secure: false },
  emailSubject: "Psychedelic Club Discord",
  inviteReason: (reqData: any) =>
    `New member automated invite (GivingFuel order # ${reqData?.orderNumber})`,
  emailContent: (reqData: any, inviteUrl: string) =>
    endent`Hi there, ${reqData.billing.name.first}!
    <br/><br/>
    Thanks for joining the Psychedelic Club of Denver! You should have recently received an email outlining your membership perks, how your membership dues are spent, and some other information about being a member. This is an automated email to help get you into our private members-only Discord server.
    <br/><br/>
    <a href="https://discord.com" style="color: #B300FF;">Discord</a> is a community-based messaging app that enables rich communication among our members. Our Discord server is split into a few channels for more organized communication, i.e. there are some channels dedicated to freeform social discussion, some for announcing and discussing club events, volunteer opportunities, sharing psychedelic-related articles, etc. It's one of the most fun perks of being a Psychedelic Club member, and we're excited to invite you!
    <br/><br/>
    (If you're concerned about others seeing that you're a member of the Psychedelic Club Discord server, don't worry. Your Discord memberships are private, so nobody outside of other club members will see that you're a part of this community.)
    <br/><br/>
    To get signed up, follow the unique invite link below. If you don't have a Discord account yet, the link will bring you through the account creation process. Feel free to set your username to whatever you want; we suggest using something that members will recognize you by, but that's completely not required if you're uncomfortable with that. You can also change your nickname at any time by clicking on "Psychedelic Club of Denver" at the top of the channel list and selecting "Edit Server Profile".
    <br/><br/>
    Here's your unique invite link: <b><a href="${inviteUrl}" style="color: #B300FF;">${inviteUrl}</a></b>
    If that invite link doesn't work or you need help getting in, reply to this email or send us a text at <a href="sms://${sms_number.replace(
      /\D/g,
      ""
    )}" style="color: #B300FF;">${sms_number}</a>, and we'll help get you set up.
    <br/><br/>
    Once you're logged into the server, please read through the rules in the #welcome-and-rules channel (they should be shown when you first join). Then feel free to introduce yourself in #introductions if you'd like and take a look around! We also have a list of all of our public events, members-only events, and volunteer opportunities in the 'Events' section at the top of the channel list. Included in that events list should be a members-only potluck that we hold on the last Thursday of each month at 7PM at 700 Kalamath St; this is an awesome opportunity to get to know the members and to get more involved in the club. Thanks again for joining the Psychedelic Club of Denver, and we're so excited to get to know you!
    <br/><br/>
    <i>- Kess, Katie, Mat, and Zak</i>`,
};
