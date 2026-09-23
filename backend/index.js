import express from 'express';
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("/{*splat}", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
});