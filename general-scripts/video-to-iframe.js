const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

function iframeTemplate(videoId) {
  let template = `
            <iframe src="https://www.youtube.com/embed/${videoId}?loop=1&amp;modestbranding=1" frameborder="0" allowfullscreen="">
                <script>
                    function execute_YTvideo(){return youtube.query({ids:"channel==MINE",startDate:"2019-01-01",endDate:"2019-12-31",metrics:"views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained",dimensions:"day",sort:"day"}).then(function(e){},function(e){console.error("Execute error",e)})}
                </script>
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
    let splitted = src.split('/');
    if (splitted) {
      let videoId = splitted[splitted.length - 1];
      let iframe = iframeTemplate(videoId);
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
