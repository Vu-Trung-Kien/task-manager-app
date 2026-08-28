import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

//middleware
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server bat dau tren cong ${PORT}`);
})
