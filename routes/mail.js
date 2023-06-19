import {Router} from "express";
import nodemailer from "nodemailer";
import {limit} from "express-limit";

let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
});

const router = new Router();

const limitOptions = {
    max: 5,
    period: 24 * 60 * 60 * 1000
}

router.post("/send", limit(limitOptions), async (req, res, next) => {
    if (!(req.body.name && req.body.phone && req.body.email && req.body.message)) {
        res.sendStatus(400);
    } else {
        try {
            await transporter.sendMail({
                from: "Portfolio Host | " + req.body.name,
                to: process.env.EMAIL_USERNAME,
                subject: "Order",
                text:
                    `
                New incoming order from contact form:
                
                ${req.body.message}
                
                Contacts:
                 - phone: ${req.body.phone}
                 - email: ${req.body.email}
                `
            });

            res.sendStatus(200);
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    }
});

export default router;