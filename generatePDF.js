const markdownpdf = require("markdown-pdf");
const fs = require("fs");

// Input and output file paths
const inputFile = "Documentation.md";
const outputFile = "Documentation_YourFullName.pdf"; // Replace with your name

// PDF options
const options = {
  remarkable: {
    html: true,
    breaks: true,
    typographer: true,
  },
  cssPath: 'pdf-style.css', // Path to custom CSS
  paperBorder: '1cm',
  paperOrientation: 'portrait',
  paperFormat: 'A4',
};

// First, let's create a CSS file for styling the PDF
const css = `
body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 100%;
  margin: 0;
  padding: 20px;
}

h1, h2, h3, h4, h5, h6 {
  color: #2563eb;
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

h1 {
  font-size: 32px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 10px;
}

h2 {
  font-size: 24px;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 8px;
}

h3 {
  font-size: 20px;
}

p, ul, ol {
  margin-bottom: 16px;
}

code {
  font-family: monospace;
  background-color: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 85%;
}

pre {
  font-family: monospace;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  margin-bottom: 16px;
}

blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

ul, ol {
  padding-left: 2em;
}

a {
  color: #0366d6;
  text-decoration: none;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

table, th, td {
  border: 1px solid #dfe2e5;
}

th, td {
  padding: 6px 13px;
}

thead {
  background-color: #f6f8fa;
}

tr:nth-child(even) {
  background-color: #f6f8fa;
}
`;

// Create the CSS file
fs.writeFileSync('pdf-style.css', css);

// Convert markdown to PDF
console.log(`Converting ${inputFile} to PDF...`);
markdownpdf(options)
  .from(inputFile)
  .to(outputFile, function () {
    console.log(`PDF created at ${outputFile}`);
  });