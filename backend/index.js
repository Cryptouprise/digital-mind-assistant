
const express = require("express"); 
const app = express(); 
const cors = require("cors"); 
const bodyParser = require("body-parser"); 
require("dotenv").config();

const { processGHLWebhook, logJarvisAction, suggestTagFromCRM } = require("./services/jarvisEngine");

app.use(cors()); 
app.use(bodyParser.json());

app.post("/webhook/ghl", async (req, res) => { 
  const result = await processGHLWebhook(req.body); 
  res.status(200).json(result); 
});

app.post("/jarvis/suggest", async (req, res) => { 
  const suggestions = await suggestTagFromCRM(req.body); 
  res.status(200).json(suggestions); 
});

app.post("/jarvis/log", async (req, res) => { 
  const result = await logJarvisAction(req.body); 
  res.status(200).json(result); 
});

app.get("/health", (req, res) => { 
  res.status(200).send("Jarvis API is running"); 
});

const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => console.log(`Jarvis API running on port ${PORT}`));
