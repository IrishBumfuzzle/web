import { Box } from "@mui/material";

import ClubsGrid from "components/clubs/ClubsGrid";
import { getStaticFile } from "utils/files";

export const metadata = {
  title: "Student Bodies @ IIIT-H",
};

export default async function StudentBodies() {
  const cc = {
    cid: "clubs",
    name: "Clubs Council",
    logo: getStaticFile("cc-logo.png"),
    banner: getStaticFile("cc-banner.png"),
    tagline: "Let's make college life fun!",
    studentBody: true,
    category: "other",
  };

  return (
    <Box>
      <ClubsGrid category="other" studentBody={true} staticClubs={[cc]} />
    </Box>
  );
}
