#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const { https } = require('follow-redirects');
const { parseBIML } = require('./parser');
const { transformBody, extractHeadNodes, extractImports } = require('./transformer');

const args = process.argv.slice(2);
const mode = args[0]; // 'build' veya 'serve'
const inputDir = args[1] || 'biml';
const port = args[2] || 8080;
const outputDir = path.resolve('dist');

// BiUI assets download
async function fetchAssets(destDir) {
    await fs.ensureDir(destDir);

    const file = 'biui.min.js';
    const url = `https://github.com/Bilal1545/Bi-UI-Web/releases/latest/download/${file}`;
    const outPath = path.join(destDir, file);

    // Eğer dosya varsa, indirme yapma
    const exists = await fs.pathExists(outPath);
    if (!exists) {
        await new Promise((resolve, reject) => {
            const fileStream = fs.createWriteStream(outPath);
            https.get(url, res => {
                res.pipe(fileStream);
                fileStream.on('finish', () => fileStream.close(resolve));
            }).on('error', reject);
        });

        console.log(`✅ Downloaded BiUI asset: ${file}`);
    } else {
        console.log(`✅ BiUI asset already exists: ${file}`);
    }
}

// Build function
async function buildAll() {
    // 1. Temizle ve klasör oluştur
    await fs.remove(outputDir);
    await fs.ensureDir(outputDir);

    // 2. Assets klasörünü oluştur
    const assetsDest = path.join(outputDir, 'biml');
    await fs.ensureDir(assetsDest);

    // 3. BiUI assetleri indir
    await fetchAssets(assetsDest);

    // 4. Kullanıcının assets klasörünü kopyala (varsa)
    const userAssets = path.join(inputDir, 'biml');
    if (await fs.pathExists(userAssets)) {
        await fs.copy(userAssets, assetsDest, { overwrite: true });
        console.log(`✅ User assets copied to ${assetsDest}`);
    }

    // 5. BIML dosyalarını tara ve HTML/PHP üret
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.biml'));
    for (const file of files) {
        const filePath = path.join(inputDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const isPHP = content.includes('<?');
        const ext = isPHP ? '.php' : '.html';

        const ast = parseBIML(content);
        const { title } = extractHeadNodes(ast);
        const imports = extractImports(ast);
        const bodyHTML = transformBody(ast);

        let headHTML = `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="biml/style.css">
<title>${title}</title>`;

        imports.forEach(src => {
            if (src.endsWith('.css')) headHTML += `<link rel="stylesheet" href="${src}">\n`;
            else if (src.endsWith('.js')) headHTML += `<script src="${src}"></script>\n`;
        });

        const finalHTML = `<!DOCTYPE html>
<html lang="tr">
<head>
${headHTML}
</head>
<body>
${bodyHTML}
</body>
<script src="biml/biui.min.js"></script>
</html>`;

        const outFile = path.join(outputDir, path.basename(file, path.extname(file)) + ext);
        fs.writeFileSync(outFile, finalHTML);
        const bimlDist = path.join(outputDir, 'biml');
        await fs.ensureDir(bimlDist);

        const stylePath = path.join(bimlDist, 'style.css');

        if (!(await fs.pathExists(stylePath))) {
        await fs.writeFile(stylePath, `body, html {
    background: var(--bi-sys-color-background);
    color: var(--bi-sys-color-on-background);
}`);
        }
        // Kullanıcının klasöründeki diğer dosyaları dist'e kopyala
        const allFiles = fs.readdirSync(inputDir);
        for (const f of allFiles) {
            const fullPath = path.join(inputDir, f);
            const stat = fs.statSync(fullPath);

            // Skip BIML dosyaları ve assets klasörü (zaten ayrı kopyalandı)
            if (f.endsWith('.biml') || f === 'biml') continue;

            const destPath = path.join(outputDir, f);

            if (stat.isDirectory()) {
                await fs.copy(fullPath, destPath, { overwrite: true });
            } else {
                await fs.copyFile(fullPath, destPath);
            }
            console.log(`✅ Copied extra file/folder: ${f}`);
        }
        console.log(`✅ Built: ${outFile}`);
    }
}

// Serve + watch
async function serve() {
    await buildAll();

    chokidar.watch(inputDir, { ignoreInitial: true })
        .on('add', buildAll)
        .on('change', buildAll)
        .on('unlink', buildAll);

    console.log(`\nHosting on PHP: http://0.0.0.0:${port}`);
    process.chdir(outputDir);
    const phpServer = exec(`php -S 0.0.0.0:${port}`);
    phpServer.stdout.on('data', data => console.log(data));
    phpServer.stderr.on('data', data => console.error(data));
    phpServer.on('close', code => console.log(`PHP server exited with ${code}`));
}

// CLI entry
if (mode === 'build') {
    buildAll();
} else if (mode === 'serve') {
    serve();
} else {
    console.log('Usage: biml-tool build|serve <inputDir> <port>');
}