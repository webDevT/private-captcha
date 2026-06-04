# Private Captcha Static Website

Static HTML/CSS/JS project scaffold. Gulp is used only as a development and build tool.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

The compiled static website is generated into the `docs` folder and can be deployed to static hosting.

## Project Structure

```text
app/src/        HTML pages
app/includes/   Reusable HTML includes
app/sass/       SCSS source files
app/js/         Vanilla JavaScript source files
app/img/        SVG/images
docs/           Compiled static build
```