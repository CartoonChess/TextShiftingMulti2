// Extend fs to allow recursive directory listing
// Note that this version requires async/await
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs/promises';
import path from 'path';
export default class FsExt {
    static readdirRecursive(dir, includeDirectories = true, includeFiles = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let fileList = [];
            const files = yield fs.readdir(dir);
            for (const file of files) {
                const filePath = path.join(dir.toString(), file);
                const fileStat = yield fs.stat(filePath);
                if (fileStat.isDirectory()) {
                    if (includeDirectories) {
                        fileList.push(filePath);
                    }
                    const subFiles = yield FsExt.readdirRecursive(filePath, includeDirectories, includeFiles);
                    fileList = fileList.concat(subFiles);
                }
                else if (includeFiles) {
                    fileList.push(filePath);
                }
            }
            return fileList;
        });
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
