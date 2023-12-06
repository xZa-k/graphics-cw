import express from "express";
const app = express();
const port = 3000;



console.log("Server starting..");

app.get("/api", (req: any, res: any) => {
  res.send("Hello World!");
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});