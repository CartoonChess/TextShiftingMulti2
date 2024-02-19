import fs from 'fs';
import path from 'path';

function getCustomClasses(directories) {
    let customClasses = {};

    directories.forEach(directory => {
        const files = fs.readdirSync(directory);
        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                customClasses = { ...customClasses, ...findCustomClasses([filePath]) };
            } else if (filePath.endsWith('.js')) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const classNames = fileContent.matchAll(/(?:\bclass\s)(\w+)(?:\s+\w+)*(?:\s*\{)/g);
                if (classNames) {
                    for (const className of classNames) {
                        customClasses[className[1]] = null;
                    }
                }
            }
        }
    });

    return customClasses;
}

function generateCustomClassesList() {
    const directories = ['./public/js'];
    const customClasses = getCustomClasses(directories);
    console.warn('Remove file generateCustomClassesList.js after git push.');
    
    // fs.writeFileSync('./public/customClasses.js', `module.exports = ${JSON.stringify(customClasses, null, 2)};`);
    fs.writeFileSync('./public/customClasses.js', `export default { ${JSON.stringify(customClasses, null, 2)}}`);
}

export { generateCustomClassesList };