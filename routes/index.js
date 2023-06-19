import {Router} from "express";
import projects from "../store/projects/projects.js";
import reviews from "../store/reviews/reviews.js";

const router = new Router();

router.get("/projects", (req, res, next) => {
    res.send(projects.json());
});

router.get("/reviews", (req, res, next) => {
    res.send(reviews.json());
});

export default router;