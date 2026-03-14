# BIML - Bi Markup Language

BIML is a **HTML-like, component-oriented DSL (Domain Specific Language)** designed for faster markup creation.  
When used with BiUI, you can quickly build interactive and styled pages.

---

## ⚡ Features

- Simple and clean markup: `<button color="primary" />`, `<tr><td>Cell</td></tr>`.
- Automatic BiUI conversion: only specific tags get `bi-` prefix.
- Output as PHP or HTML.
- CLI support: build & serve modes.
- Assets (CSS/JS) are automatically copied.
- AST order is preserved; text nodes and HTML elements render in order.
- `elevate` attribute automatically sets shadow level CSS.
- Works with user-provided CSS/JS assets.

---

## 🛠️ Installation

```bash
# Go to your project folder
cd path/to/project

# Install dependencies
npm install
````

> Node.js 25+ recommended. PHP 8+ required for serve mode.

---

## 📂 Folder Structure

```
biml/                # Folder for BIML files
  ├─ example.biml
  └─ assets/         # User CSS/JS/images
dist/                 # Build output
  ├─ assets/         # BiUI and user assets
  └─ example.html    # or example.php
```

---

## 🚀 Usage

### Build

> Note: In this version you can only use it by cloning the repository.

```bash
node cli.js build biml
```

* Compiles all `.biml` files in the `biml/` folder to HTML/PHP in `dist/`.
* BiUI assets (`biui.min.js`) and user assets are copied automatically.
* Previous build is cleared.

### Serve (Live Reload)

```bash
node cli.js serve biml 8080
```

* Watches the `biml/` folder for changes and rebuilds automatically.
* Serves files on PHP at `0.0.0.0:8080`.
* Live reload on changes.

---

## ⚙️ Example BIML

```xml
<title title="Hello World" />
<import src="tokens.css" />
<button variant="filled">Click Me</button>
<tr>
    a
    <td>b</td>
</tr>
<img src="https://placehold.co/600x400" style="border-radius: 15px;" elevate="5" />
<?php
echo "Hello PHP";
?>
```

* After build:

  * `<button>` is converted to BiUI format.
  * PHP tags remain unchanged.
  * You can use it.

---

## 💡 Notes

* You can provide your own CSS tokens via importing a css file from [here](https://bilal.affedilmez.com/Bi-UI/index.htm#generator).
---

## 🔗 Resources

* [BiUI Web](https://github.com/Bilal1545/Bi-UI-Web)