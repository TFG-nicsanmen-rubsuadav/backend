import app from "./app.js";
import { PORT } from "./config.js";

console.log(`Server running on http://localhost:${PORT}`);
app.listen(PORT);
