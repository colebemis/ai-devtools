import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const PORT = 1234;

const app = express();

app.use(cors({ maxAge: 600 }));
app.use(bodyParser.json());

app.post("/", (req, res) => {
  console.log(req.body);
  res.send("OK");
});

app.listen(PORT, () => {
  console.log(`Devtools server listening on port ${PORT}`);
});
