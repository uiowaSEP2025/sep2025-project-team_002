import React from "react";
import { Box, Typography, Rating } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const RatingRow = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
    <Typography variant="body2">{label}:</Typography>
    <Rating
      value={value / 2}
      precision={0.5}
      readOnly
      size="small"
      emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
    />
    <Typography variant="caption" sx={{ ml: 1 }}>
      {value}/10
    </Typography>
  </Box>
);

export default RatingRow;
