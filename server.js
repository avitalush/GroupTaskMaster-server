const mongoose = require("mongoose");
const { app } = require("./app")
const dotenv = require("dotenv");
dotenv.config();

const mongoURL = process.env.MONGO_URL;
const connectDB = () => {
   console.log(mongoURL);
   mongoose.connect(mongoURL)
      .then((con) => {
         console.log(`connected to db on ${mongoURL}`);
      }).catch((error) => {
         console.error("Error to connect to DB");
         console.error(error);
      });
};
connectDB();


const PORT = process.env.PORT || 1200;

app.listen(PORT, () => {
   console.log(`server is running on port:${PORT}`);
})