import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import _ from './config.js';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 3000;

const app = express();

import index from './routes/index.js';
import panel from './routes/panel.js';
import mail from './routes/mail.js';

app.set('trust proxy', true);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : "/tmp/"
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'dist')));
app.use("/favicon.ico", express.static(path.join(__dirname, 'public', 'favicon.ico')));
app.use("/avatars", express.static(path.join(__dirname, 'store', 'reviews', 'avatars')));
app.use("/projects/previews", express.static(path.join(__dirname, 'store', 'projects', 'previews')));
app.use("/projects/files", express.static(path.join(__dirname, 'store', 'projects', 'files')));

app.use("/", index);
app.use("/panel", panel);
app.use("/mail", mail);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`))

export default app;
