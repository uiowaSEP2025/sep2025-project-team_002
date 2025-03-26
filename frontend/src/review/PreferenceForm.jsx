import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { motion } from "framer-motion";
import InfoIcon from "@mui/icons-material/Info";
import Bugsnag from '@bugsnag/js';

const PreferenceForm = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [randomNumber, setRandomNumber] = useState(null);

  useEffect(() => {
    setRandomNumber(Math.floor(Math.random() * 100) + 1);
  }, []);

  return (
    <Box sx={{ textAlign: "center", p: 4 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
        <Typography variant="h4">Random Number Generator</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Your random number is: <strong>{randomNumber}</strong>
        </Typography>
      </motion.div>

      <Tooltip title="Click for a surprise!" arrow>
        <IconButton onClick={() => setOpen(true)}>
          <InfoIcon fontSize="large" />
        </IconButton>
      </Tooltip>


      <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={() => navigate("/")}>
        Go Home
      </Button>
    </Box>
  );
};

export default PreferenceForm;
