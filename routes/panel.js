import { Router } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import path from "path";
import projects from "../store/projects/projects.js";
import reviews from "../store/reviews/reviews.js";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tokenAge = 72 * 60 * 60;

const generateToken = () => {
    return jwt.sign({exp: Math.floor(Date.now() / 1000) + tokenAge, jwtid: Math.floor(Math.random() * 1000000)}, process.env.SECRET, { algorithm: 'HS256' });
}

const verifyToken = (token) => {
    return token && jwt.verify(token, process.env.SECRET, {ignoreExpiration: false});
}

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false
})

const checkAuth = (req, res, next) => {
    if (verifyToken(req.cookies.panel_token)) {
        next();
    } else {
        res.redirect("/panel/login");
    }
};

const router = new Router();

router.get("/", checkAuth, (req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "panel", "index.html"));
});

router.get("/login", (req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "panel", "login.html"));
});

router.post("/login",  loginLimiter, (req, res, next) => {
    if (process.env.PANEL_PASSWORD && req.body.password === process.env.PANEL_PASSWORD) {
        res.cookie("panel_token", generateToken(), {
            httpOnly: true,
            sameSite: true,
            expires: new Date(Date.now() + tokenAge * 1000),
            path: "/panel"});
        res.redirect("/panel");
    } else {
        res.sendStatus(400);
    }
});

router.get("/reviews", checkAuth, (req, res, next) => {
    res.send(reviews.json());
});

router.post("/reviews/add", checkAuth, async (req, res, next) => {
    if (!(req.body.name && req.body.company && req.body.rtl && req.body.content && req.files && req.files.avatar)) {
        res.send(400);
    } else {
        await reviews.add(req.body.name, req.body.company, req.files.avatar, req.body.rtl === "true", req.body.content);
        res.send(reviews.json());
    }
});

router.post("/reviews/delete", checkAuth, async (req, res, next) => {
    if (!req.body.id) {
        res.sendStatus(400);
    } else {
        await reviews.remove(req.body.id);
        res.send(reviews.json());
    }
});

router.get("/projects", checkAuth, (req, res, next) => {
    res.send(projects.json());
});

router.post("/projects/add", checkAuth, async (req, res, next) => {
    if (!(req.body.title && req.body.description && req.files && req.files.preview && req.files.file)) {
        res.send(400);
    } else {
        await projects.add(req.body.title, req.body.description, req.files.preview, req.files.file);
        res.send(projects.json());
    }
});

router.post("/projects/delete", checkAuth, async (req, res, next) => {
    if (!req.body.id) {
        res.sendStatus(400);
    } else {
        await projects.remove(req.body.id);
        res.send(projects.json());
    }
});

export default router;