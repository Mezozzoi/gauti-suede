import fs from "fs";
import path from "path";
import {nanoid} from "nanoid";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Reviews {
    localPath = __dirname;

    json () {
        return JSON.parse(fs.readFileSync(path.join(this.localPath, "reviews.json"), {encoding: "utf-8"}));
    }

    async add (name, company, avatar, rtl, content) {
        const avatarName = nanoid() + "." + avatar.name.split(".").pop();

        try {
            await avatar.mv(path.join(this.localPath, "avatars", avatarName));
        } catch (e) {
            fs.unlinkSync(path.join(this.localPath, "avatars", avatarName));
            throw new Error("Failed to upload files" + e);
        }

        const store = this.json();
        store.push({id: nanoid(), name, company, avatar: avatarName, rtl, content});

        fs.writeFileSync(path.join(this.localPath, "reviews.json"), JSON.stringify(store));
    }

    remove (id) {
        const store = this.json();
        const index = store.findIndex(e => e.id === id);

        const avatarName = store[index].avatar;

        try {
            fs.unlinkSync(path.join(this.localPath, "avatars", avatarName));
        } catch { }

        store.splice(index, 1);

        fs.writeFileSync(path.join(this.localPath, "reviews.json"), JSON.stringify(store));
    }
}

const reviews = new Reviews();

export default reviews;