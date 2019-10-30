const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function iframeTemplate(link) {
  let template = `
    <iframe
      src="${link}"
      allowfullscreen
      frameborder="0">
    </iframe>
  `;
  return template;
}

function videoToIframe(file) {
  let $ = cheerio.load(fs.readFileSync(path.join(__dirname, file)));
  let fileToWriteIn = file;

  console.log(`--> processing file ${file}`);
  let videos = $('video');
  videos.each(function() {
    let src = $(this).attr('src');
    let hasLink = src.startsWith('http://') || src.startsWith('https://');

    if (hasLink) {
      let iframe = iframeTemplate(src);
      $(this).replaceWith(iframe);
    }
  });

  fs.writeFileSync(fileToWriteIn, $.html(), { encoding: 'utf-8' });
  console.log(`... file ${fileToWriteIn} processed!\n`);
}

if (process.argv.length > 2) {
  const file = ''; // argv2

  videoToIframe(process.argv[2]);
}
