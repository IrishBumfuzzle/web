import dynamic from "next/dynamic";

import { Divider, Card, Stack, Box, Grid, Typography } from "@mui/material";

import { locationLabel } from "utils/formatEvent";

import ClubButton from "components/clubs/ClubButton";
import EventPoster from "components/events/EventPoster";
import AudienceChips from "components/events/AudienceChips";
import EventFallbackPoster from "components/events/EventFallbackPoster";

import Icon from "components/Icon";

const DateTime = dynamic(() => import("components/DateTime"), { ssr: false });
const AddToCalendarBtn = dynamic(
  () => import("components/events/AddToCalendarBtn"),
  { ssr: false },
);

export const getEventLocation = (event) => {
  if (["offline", "hybrid"].includes(event.mode)) {
    return event.location.length > 0
      ? event.location.map((l) => locationLabel(l).name).join(", ")
      : event.mode.charAt(0).toUpperCase() + event.mode.slice(1);
  } else {
    return "Online";
  }
};

export default function EventDetails({ event, showCode = false }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <Box sx={{ pt: "100%", position: "relative" }}>
            {event.poster ? (
              <EventPoster
                name={event.name}
                poster={event.poster}
                width={2000}
                height={2000}
              />
            ) : (
              <EventFallbackPoster
                name={event.name}
                clubid={event.clubid}
                width={200}
                height={300}
              />
            )}
          </Box>
        </Card>
      </Grid>

      <Grid item xs md>
        <Stack direction="column" p={1}>
          <Box display="flex">
            <Icon variant="calendar-today" sx={{ mr: 2, width: 16 }} />
            <Typography variant="body2">
              <DateTime dt={event.datetimeperiod[0]} />
            </Typography>
            <Box mx={1}>-</Box>
            <Typography variant="body2">
              <DateTime dt={event.datetimeperiod[1]} />
            </Typography>
          </Box>

          <Typography variant="h3" paragraph mt={1} mb={0}>
            {event.name}
          </Typography>
          {showCode ? (
            <Typography
              color="text.disabled"
              variant="subtitle2"
              fontFamily="monospace"
              mt={0}
              mb={1.5}
            >
              #{event.code}
            </Typography>
          ) : null}

          <Box my={1} />

          {event.collabclubs && event.collabclubs.length > 0 ? (
            <>
              <Typography variant="body2">
                <strong>Collaborating Clubs</strong>
              </Typography>
              <Box display="flex" flexWrap="wrap">
                <ClubButton clubid={event.clubid} />
                {event.collabclubs.map((clubid) => (
                  <ClubButton clubid={clubid} />
                ))}
              </Box>
            </>
          ) : (
            <ClubButton clubid={event.clubid} />
          )}

          <Box display="flex" mt={4} alignItems="center">
            <Icon variant="location-on-outline-rounded" sx={{ mr: 2 }} />
            <Typography variant="body1">{getEventLocation(event)}</Typography>
          </Box>

          <Box display="flex" mt={3} alignItems="center">
            <Icon variant="group-outline-rounded" sx={{ mr: 2 }} />
            <AudienceChips audience={event.audience} />
          </Box>

          <Box display="flex" mt={2} alignItems="center" ml={-0.5}>
            <AddToCalendarBtn event={event} />
          </Box>

          <Divider sx={{ borderStyle: "dashed", my: 3 }} />

          <Typography variant="body" sx={{ whiteSpace: "pre-wrap" }}>
            {event.description || "No description available."}
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  );
}
