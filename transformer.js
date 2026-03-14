// transformer.js
const BI_PREFIX_TAGS = new Set([
    "button","text-field","icon","shape","elevation",
    "circular-progress","ripple","switch","split-button",
    "icon-button","fab","radio","radi"
]);

function transformBody(ast) {
    let output = '';

    for (const tag in ast) {
        const val = ast[tag];

        if (tag === '#php') {
            output += val;
            continue;
        }

        if (tag === 'title' || tag === 'import') continue;

        const biTag = BI_PREFIX_TAGS.has(tag) ? `bi-${tag}` : tag;

        let attrs = '';
        let styleValue = '';
        let childrenHTML = '';
        let elevate = false;
        let elevateLevel = 1;

        for (const key in val) {

            if (key === '#text') {
                childrenHTML += val[key];
            }

            else if (typeof val[key] === 'object') {
                childrenHTML += transformBody({ [key]: val[key] });
            }

            else if (key === 'elevate') {
                elevate = true;
                elevateLevel = val[key] || 1;
            }

            else if (key === 'style') {
                styleValue = val[key];
            }

            else {
                const maybeTag = key.toLowerCase();
                const htmlTags = new Set([
                    'td','th','tr','thead','tbody','tfoot','ul','ol','li'
                ]);

                if (htmlTags.has(maybeTag)) {
                    childrenHTML += `<${maybeTag}>${val[key]}</${maybeTag}>`;
                } else {
                    attrs += ` ${key}="${val[key]}"`;
                }
            }
        }

        if (elevate) {
            const elevationStyle = `--bi-elevation-shadow-level:${elevateLevel};`;

            if (styleValue) {
                styleValue = elevationStyle + styleValue;
            } else {
                styleValue = elevationStyle;
            }

            childrenHTML = `<bi-elevation></bi-elevation>` + childrenHTML;
        }

        if (styleValue) {
            attrs += ` style="${styleValue}"`;
        }

        output += `<${biTag}${attrs}>${childrenHTML}</${biTag}>`;
    }

    return output;
}

function extractHeadNodes(ast) {
    let title = "BIML Page";
    const imports = [];

    for (const tag in ast) {
        const val = ast[tag];

        if (tag === "title" && val?.title) {
            title = val.title;
        }

        else if (tag === "import") {
            if (val?.src) imports.push(val.src);
            else if (typeof val === "string") imports.push(val);
        }
    }

    return { title, imports };
}

function extractImports(node) {
    const imports = [];
    if (!node || typeof node !== "object") return imports;

    for (const tag of Object.keys(node)) {
        const val = node[tag];

        if (tag === "import") {

            if (val && val["@_"] && val["@_"].src) {
                imports.push(val["@_"].src);
            }

            else if (typeof val === "string") {
                imports.push(val);
            }

            else if (val?.src) {
                imports.push(val.src);
            }

        }

        else if (typeof val === "object") {
            imports.push(...extractImports(val));
        }
    }

    return imports;
}

module.exports = {
    transformBody,
    extractImports,
    extractHeadNodes
};