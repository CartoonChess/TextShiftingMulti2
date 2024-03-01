// Extend fs to allow recursive directory listing
// Note that this version requires async/await

import fs from 'fs/promises';
import path from 'path';

// Direct copy of fs's type
type PathLike = string | Buffer | URL

export default class FsExt {
    static async readdirRecursive(dir: PathLike, includeDirectories = true, includeFiles = true): Promise<string[]> {
        let fileList: string[] = [];
        const files = await fs.readdir(dir);

        for (const file of files) {
            const filePath = path.join(dir.toString(), file);
            const fileStat = await fs.stat(filePath);

            if (fileStat.isDirectory()) {
                if (includeDirectories) { fileList.push(filePath); }
                const subFiles = await FsExt.readdirRecursive(filePath, includeDirectories, includeFiles);
                fileList = fileList.concat(subFiles);
            } else if (includeFiles) {
                fileList.push(filePath);
            }
        }

        return fileList;
    }
}

// export default async function readdirRecursive(dir: PathLike, includeDirectories = true, includeFiles = true): Promise<string[]> {
//     // let fileList: PathLike[] = [];
//     // const dirString = dir.toString()
//     let fileList: string[] = [];
//     const files = await fs.readdir(dir);

//     for (const file of files) {
//         const filePath = path.join(dir.toString(), file);
//         const fileStat = await fs.stat(filePath);

//         if (fileStat.isDirectory()) {
//             if (includeDirectories) { fileList.push(filePath); }
//             const subFiles = await readdirRecursive(filePath, includeDirectories, includeFiles);
//             fileList = fileList.concat(subFiles);
//         } else if (includeFiles) {
//             fileList.push(filePath);
//         }
//     }

//     return fileList;
// }


// fs.readdirRecursive = readdirRecursive;
// export default fs;

// export {}