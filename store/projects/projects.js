import fs from "fs";
import path from "path";
import {nanoid} from "nanoid";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class Projects {
    localPath = __dirname;

    json () {
        return JSON.parse(fs.readFileSync(path.join(this.localPath, "projects.json"), {encoding: "utf-8"}));
    }

    async add (title, description, preview, file) {
        const previewName = nanoid() + "." + preview.name.split(".").pop();
        const fileName = nanoid() + "." + preview.name.split(".").pop();

        try {
            await preview.mv(path.join(this.localPath, "previews", previewName));
            await file.mv(path.join(this.localPath, "files", fileName));
        } catch (e) {
            fs.unlinkSync(path.join(this.localPath, "previews", previewName));
            fs.unlinkSync(path.join(this.localPath, "files", fileName));
            throw new Error("Failed to upload files" + e);
        }

        const store = this.json();
        store.push({id: nanoid(), title, description, preview: previewName, file: fileName});

        fs.writeFileSync(path.join(this.localPath, "projects.json"), JSON.stringify(store));
    }

    remove (id) {
        const store = this.json();
        const index = store.findIndex(e => e.id === id);

        const previewName = store[index].preview;
        const fileName = store[index].file;

        try {
            fs.unlinkSync(path.join(this.localPath, "previews", previewName));
            fs.unlinkSync(path.join(this.localPath, "files", fileName));
        } catch { }

        store.splice(index, 1);

        fs.writeFileSync(path.join(this.localPath, "projects.json"), JSON.stringify(store));
    }
}

const projects = new Projects();

export default projects;