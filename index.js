const express = require("express");
const dotenv = require("dotenv");
const routes=require('./routes/index')
const telegram = require("./telegramBot/telegramBot");
const queue=require('./queueWorker/queue')
dotenv.config();


const main = () => {
  telegram.telegramBot();
  queue.queueProcess();
};

main();






const app = express();
const cors = require("cors");
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use("/", routes)

app.get("*", (req, res) => {
  res.status(404).send("Not Found");
});

const PORT = process.env.PORT || 3000;
const IP_ADRESS=process.env.IP_ADRESS||"localhost";
app.listen(PORT, IP_ADRESS, () => console.log(`Server is running on PORT,${PORT}`));
