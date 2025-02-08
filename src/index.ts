import dotenv from "dotenv"
dotenv.config()

import app from "./http-server.js";
import whatsapp from "./wa-server.js";

whatsapp.initialize();

const port = 9590;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});