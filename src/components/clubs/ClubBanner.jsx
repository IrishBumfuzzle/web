"use client";

import { useState } from "react";

import Image from "next/image";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import { getFile } from "utils/files";
import { getPlaceholder } from "utils/placeholder";

export default function ClubBanner({
  name,
  banner,
  width,
  height,
  containerHeight = null,
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [img, setImg] = useState(
    banner
      ? getFile(banner)
      : getPlaceholder({ seed: name, w: width, h: height })
  );

  return (
    <Box
      sx={{
        position: "relative",
        pt: containerHeight ? containerHeight : isDesktop ? "20%" : "40%",
        "&:after": {
          top: 0,
          content: "''",
          width: "100%",
          height: "100%",
          position: "absolute",
        },
      }}
    >
      <Image
        alt={name}
        src={img}
        width={width}
        height={height}
        style={{
          top: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
        }}
        onError={() =>
          setImg(getPlaceholder({ seed: name, w: width, h: height }))
        }
      />
    </Box>
  );
}
