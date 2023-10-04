import { redirect } from "next/navigation";

import { getClient } from "gql/client";
import { GET_EVENT_ID_FROM_CODE } from "gql/queries/events";

export default async function EventByCode({ params }) {
  const { code } = params;

  const { data: { eventid } = {} } = await getClient().query(
    GET_EVENT_ID_FROM_CODE,
    { code },
  );

  return redirect(`/manage/events/${eventid}`);
}