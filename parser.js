// parser.js
const { XMLParser } = require("fast-xml-parser");

function parseNormalBIML(bimlString) {
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "",
        parseNodeValue: false,
        parseAttributeValue: false,
    };

    const parser = new XMLParser(options);
    const ast = parser.parse(bimlString);
    return ast;
}

function parseBIML(content) {
    const ast = {};
    const phpMatches = content.match(/<\?php[\s\S]*?\?>/g);
    
    if (phpMatches) {
        phpMatches.forEach(code => {
            // AST içinde özel tag ile sakla
            ast['#php'] = code;
        });
        // PHP kodunu content’ten çıkar
        content = content.replace(/<\?php[\s\S]*?\?>/g, '');
    }

    // Kalan content’i normal BIML parse et
    const normalAST = parseNormalBIML(content);
    return { ...ast, ...normalAST };
}

module.exports = { parseBIML };