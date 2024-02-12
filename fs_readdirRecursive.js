// Extend fs to allow recursive directory listing
// Note that this version requires async/await

// import fs from 'fs';
import fs from 'fs/promises';
import path from 'path';

async function readdirRecursive(dir, includeDirectories = true, includeFiles = true) {
    let fileList = [];
    // const files = await fs.promises.readdir(dir);
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        // const fileStat = await fs.promises.stat(filePath);
        const fileStat = await fs.stat(filePath);

        if (fileStat.isDirectory()) {
            if (includeDirectories) { fileList.push(filePath); }
            const subFiles = await readdirRecursive(filePath, includeDirectories, includeFiles);
            fileList = fileList.concat(subFiles);
        } else if (includeFiles) {
            fileList.push(filePath);
        }
    }

    return fileList;
}

fs.readdirRecursive = readdirRecursive;
export default fs;