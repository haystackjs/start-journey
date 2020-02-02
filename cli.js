#! /usr/bin/env node
const program = require('commander');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const latestVersion = require('latest-version');

// Arguments
var pkgName;
program
    .arguments('<name>')
    .action(function (name) {
        pkgName = name;
    });
program.parse(process.argv);
if (typeof pkgName === 'undefined') {
    console.error('no name given');
    process.exit(1);
}

console.log('Get latest version...')
latestVersion('@haystackjs/journey')
    .then((v) => {
        function copyProcessed(src, dst) {
            const content = handlebars.compile(fs.readFileSync(src, 'utf-8'))({
                name: pkgName,
                version: v
            });
            fs.writeFileSync(dst, content);
        }

        console.log('Prepare project structure...');

        // Root
        // tslint.json
        fs.copyFileSync(path.join(__dirname, 'template', 'tslint.json'), 'tslint.json');
        // tsconfig.json
        copyProcessed(path.join(__dirname, 'template', 'tsconfig.json'), 'tsconfig.json');
        // package.json
        copyProcessed(path.join(__dirname, 'template', 'package.json'), 'package.json');
        // journey.json
        copyProcessed(path.join(__dirname, 'template', 'journey.json'), 'journey.json');

        // Library
        // package.json
        fs.mkdirSync('packages');
        fs.mkdirSync(path.join('packages', pkgName));
        fs.mkdirSync(path.join('packages', pkgName, 'src'));
        copyProcessed(path.join(__dirname, 'template', 'packages', 'library', 'package.json'),
            path.join('packages', pkgName, 'package.json'), pkgName);
        copyProcessed(path.join(__dirname, 'template', 'packages', 'library', 'src', 'index.ts'),
            path.join('packages', pkgName, 'src', 'index.ts'), pkgName);

        // Sample
        fs.mkdirSync(path.join('packages', 'sample'));
        fs.mkdirSync(path.join('packages', 'sample', 'src'));
        fs.copyFileSync(path.join(__dirname, 'template', 'packages', 'sample', 'package.json'),
            path.join('packages', 'sample', 'package.json'));
        copyProcessed(path.join(__dirname, 'template', 'packages', 'sample', 'src', 'index.tsx'),
            path.join('packages', 'sample', 'src', 'index.tsx'), pkgName);
        fs.copyFileSync(path.join(__dirname, 'template', 'packages', 'sample', 'src', 'index.css'),
            path.join('packages', 'sample', 'src', 'index.css'));
        fs.copyFileSync(path.join(__dirname, 'template', 'packages', 'sample', 'src', 'index.html'),
            path.join('packages', 'sample', 'src', 'index.html'));
    })
    .catch((e) => {
        console.warn(e);
    });