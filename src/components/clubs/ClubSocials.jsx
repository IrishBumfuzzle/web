"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { Button, Box } from "@mui/material";
import Icon from "components/Icon";

import { socialsData } from "utils/socialsData";
import { useMode } from "contexts/ModeContext";

export default function ClubSocials({ socials = {}, email = null }) {
  const [processedSocials, setProcessedSocials] = useState({});
  const { isDark } = useMode();

  useEffect(() => {
    const processed = {};
    Object.keys(socialsData)
      ?.filter((k) => socials[k])
      ?.forEach((k) => {
        var content = socials[k];
        if (content.endsWith("/")) content = content.slice(0, -1); // remove trailing slash
        content = content.split("/").slice(-1)[0]; // get only the relevant part of the URL
        content = content.split("?")[0]; // remove querystring
        if (content !== "") processed[k] = content; // only add if not empty

        // exceptions (because the URL is not the username)
        if (k == "website") processed[k] = "Website";
        if (k == "discord") processed[k] = "Discord";
        if (k == "youtube") processed[k] = "YouTube";
        if (k == "whatsapp") processed[k] = "WhatsApp";
      });
    setProcessedSocials(processed);
  }, [socials]);

  return (
    <Box>
      {email ? (
        <Button
          component={Link}
          href={`mailto:${email}`}
          target="_blank"
          rel="noreferrer"
          sx={{
            mx: 0.2,
            textTransform: "none",
            color: "text.secondary",
          }}
        >
          <Icon external variant={"mdi:email"} mr={1} />
          {email}
        </Button>
      ) : null}
      {Object.keys(socialsData)
        ?.filter((k) => socials[k])
        ?.map((item, index) => (
          <Button
            component={Link}
            href={socials[item]}
            target="_blank"
            rel="noreferrer"
            key={index}
            sx={{
              mx: 0.5,
              textTransform: "none",
              color: isDark
                ? socialsData[item].darkcolor
                : socialsData[item].color,
            }}
          >
            <Icon external variant={socialsData[item].icon} mr={1} />
            {processedSocials[item]}
          </Button>
        ))}
    </Box>
  );
}
