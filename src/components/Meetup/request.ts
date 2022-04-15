import Config from "#config";
import { GroupResponse } from "./types/response";

const defaultQuery = `query ($groupId: ID) {
  group(id: $groupId) {
    id
    name
    description
    link
    logo {
      baseUrl
      id
    }
    memberships {
      count
    }
    upcomingEvents(input: {}) {
      edges {
        node {
          id
          title
          eventUrl
          description
          eventType
          venue {
            name
            address
            city
            state
            postalCode
          }
          dateTime
          endTime
          going
          image {
            baseUrl
            id
          }
        }
      }
    }
  }
}`;

export default async (groupId: string = Config.meetup_gid) => {
  const response = await fetch("https://api.meetup.com/gql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: defaultQuery,
      variables: {
        groupId: groupId,
      },
    }),
  });

  return (await response.json()) as GroupResponse;
};
