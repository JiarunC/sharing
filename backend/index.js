import express from 'express';
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from 'node:child_process';
import readline from "readline";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = parseInt(process.env.PORT || '8080', 10);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const binaryPath = path.join(__dirname, '/bin/p15solver');
const child = spawn(binaryPath, ['--stream']);
child.on('exit', (code, signal) => {
    console.error(`p15solver exited with code ${code} / signal ${signal}`);
});
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("/{*splat}", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});

async function solve(board) {
    const rl = readline.createInterface({
        input: child.stdout,
        output: child.stdin
    });
    rl.setPrompt(`${board.join(' ')}\n`);
    rl.prompt();
    let response;

    return new Promise((resolve, reject) => {
        rl.on('line', (line) => {
            response = line;
            rl.close();
        })

        rl.on('close', () => {
            resolve(response);
        })
    })
}

app.post('/api/p15solver', async (req, res) => {
    console.log(req.body);

    let solution_string;
    await solve(req.body.board).then((response) => {
        solution_string = response;
    })
    let status = 'failure';
    let solution = "";
    let code = 220;

    if (!solution_string) {
        status = 'failure';
        code = 321;
    } else if (solution_string === "INVALID INPUT") {
        status = 'failure';
        code = 322;
    } else if (solution_string === "UNSOLVABLE") {
        status = 'failure';
        code = 323;
    } else {
        status = 'success';
        code = 200;
        solution = solution_string;
    }

    res.status(code).json({
        status: status,
        solution: solution,
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
});