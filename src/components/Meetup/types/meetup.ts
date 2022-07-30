import * as Response from "./response";
import { DateTime } from "luxon";
import type { CalendarOptions } from "datebook";
import datebook from "datebook";
const { GoogleCalendar, ICalendar } = datebook;

export type MeetupImageType = "jpg" | "png" | "webp";

export class MeetupImage {
  id: string;
  base: URL;

  constructor(data: Response.ImageData) {
    this.id = data.id;
    this.base = new URL(`${this.id}/`, data.baseUrl);
  }

  url({
    size = [480, 480] as [number, number],
    format = "webp" as MeetupImageType,
  } = {}): URL {
    const [width, height] = size;
    const filename = `${width}x${height}.${format}`;
    return new URL(filename, this.base);
  }
}

export enum MeetupEventType {
  ONLINE,
  PHYSICAL,
}

export class MeetupVenue {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;

  constructor(data: Response.VenueData) {
    ({
      name: this.name,
      address: this.address,
      city: this.city,
      state: this.state,
      postalCode: this.zip,
    } = data);
  }

  toString() {
    return `${this.name}, ${this.address}, ${this.city} ${this.state} ${this.zip}`;
  }

  get gmaps(): URL {
    const gmaps = new URL("https://maps.google.com/");
    gmaps.searchParams.set("q", this.toString());
    return gmaps;
  }
  url = this.gmaps;
}

export class MeetupEvent {
  id: string;
  title: string;
  description: string;
  url: URL;
  type: MeetupEventType;
  venue: MeetupVenue;
  datetime: DateTime;
  endtime: DateTime;
  going: number;
  image: MeetupImage;

  constructor(data: Response.EventData) {
    ({
      id: this.id,
      title: this.title,
      description: this.description,
      going: this.going,
    } = data);

    this.url = new URL(data.eventUrl);
    this.type = MeetupEventType[data.eventType.toUpperCase()];
    this.venue = data.venue ? new MeetupVenue(data.venue) : undefined;
    this.datetime = DateTime.fromISO(data.dateTime);
    this.endtime = DateTime.fromISO(data.endTime);
    this.image = new MeetupImage(data.image);
  }

  get calendar(): CalendarOptions {
    return {
      title: this.title,
      location: this.venue?.toString(),
      description: this.description,
      start: this.datetime.toJSDate(),
      end: this.endtime.toJSDate(),
    };
  }

  get ical() {
    return new ICalendar(this.calendar);
  }

  get gcal() {
    return new GoogleCalendar(this.calendar);
  }
}

export default class MeetupGroup {
  id: string;
  name: string;
  description: string;
  url: URL;
  logo: MeetupImage;
  members: number;
  events: MeetupEvent[];

  constructor(data: Response.GroupData) {
    ({
      id: this.id,
      name: this.name,
      description: this.description,
      memberships: { count: this.members },
    } = data);

    this.url = new URL(data.link);
    this.logo = new MeetupImage(data.logo);
    this.events = data.upcomingEvents.edges.map((o) => new MeetupEvent(o.node));
  }
}
