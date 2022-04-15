export interface VenueData {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export type EventTypeData = "online" | "physical";

export interface EventData {
  id: string;
  title: string;
  eventUrl: string;
  eventType: EventTypeData;
  description: string;
  venue: VenueData;
  dateTime: string;
  endTime: string;
  going: number;
  image: ImageData;
}

export interface EventsListData {
  edges: { node: EventData }[];
}

export interface MembershipData {
  count: number;
}

export interface ImageData {
  baseUrl: string;
  id: string;
}

export interface GroupData {
  id: string;
  name: string;
  description: string;
  link: string;
  logo: ImageData;
  memberships: MembershipData;
  upcomingEvents: EventsListData;
}

export interface Response<T> {
  data: T;
  extensions?: Record<string, unknown>;
  errors?: {
    message: string;
    locations: { line: number; column: number }[];
  }[];
}

export type GroupResponse = Response<{ group: GroupData }>;
