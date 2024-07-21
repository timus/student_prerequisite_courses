import express from 'express';
import path from 'path';
import Datastore from 'nedb';
import indexRouter from './routes/index';
import bodyParser from 'body-parser';
import fs from 'fs';

const app = express();
const PORT = 3000;

// Ensure the 'data' directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up NeDB with the filename 'courses.db' in the root 'data' directory
const dbPath = path.join(dataDir, 'courses.db');
const db = new Datastore({ filename: dbPath, autoload: true });

// Apply body-parser middleware only to non-upload routes
app.use((req, res, next) => {
    if (req.path === '/upload') {
        next();
    } else {
        bodyParser.json()(req, res, next);
    }
});

// Dependency Injection
const services = {
    db
};

app.use('/', indexRouter(services));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
