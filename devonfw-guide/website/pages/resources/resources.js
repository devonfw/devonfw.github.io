import { UtilsModule } from '../../shared/utils.js';
import { renderModule } from './renderModule.js';

const resourcesModule = (function(window) {
  // Function definitions
  function loadResources(
    resourcesDestSelector = '#resources-page',
    handler = () => {},
  ) {
    const HTML_FILE = getHtmlFileName();
    const RESOURCES_SELECTOR = `${HTML_FILE} #content`;
    let aux = $('<div id="aux"></div>');
    aux.load(RESOURCES_SELECTOR, function() {
      let base = aux;
      let sections = base.find('[class*="section-"]');

      // Section 1
      let section1 = {title1: '', title2: '', text1: '', button: { href: '', text: ''}}
      let s1 = $(sections.get(0));
      section1.title1 = s1.find('.title1').text();
      section1.text1 = s1.find('.text1').text();
      section1.title2 = s1.find('.title2').text();
      section1.button.href = s1.find('.button a').attr('href');
      section1.button.text = s1.find('.button a').text();

      // Section 2
      let section2 = {title1: '', text1: []};
      let s2 = $(sections.get(1));
      section2.title1 = s2.find('.title1').text();
      s2.find('.text1 p').each((index, el) => {
        let text = $(el).text();
        section2.text1.push(text)
      });

      // Section 3
      let section3 = {title1: '', videoEl: {src: '', poster: '', text: ''}};
      let s3 = $(sections.get(2));
      section3.title1 = s3.find('.title1').text();
      section3.videoEl = s3.find('video');

      // Section 4
      let section4 = {title1: '', cards: []};
      let s4 = $(sections.get(3));
      section4.title1 = s4.find('.title1').text();

      s4.find('.card').each((index, element) => {
        let el = $(element);
        let card = {image: '', title: '', description: '', link: {href: '', text: ''}};

        card.image = el.find('img').attr('src');
        card.title = el.find('li:nth-child(2) p').text();
        card.description = el.find('li:nth-child(3) p').text();
        card.link.href = el.find('a').attr('href');
        card.link.text = el.find('a').text();
        section4.cards.push(card);
      });

      // Section 5
      let section5 = {title1: '', text1: ''};
      let s5 = $(sections.get(4));
      section5.title1 = s5.find('.title1').text();
      section5.text1 = s5.find('.text1').text();

      // Section 6
      let section6 = {title1: '', text1: '', subsection1: [{ title2: '', text2: '', links: []}]};
      let s6 = $(sections.get(5));
      section6.title1 = s6.find('.title1').text();
      section6.text1 = s6.find('.text1').text();
      s6.find('.subsection1').each((index, element) => {
        let el = $(element);
        let subsection = { title2: '', text2: '', links: []};

        subsection.title2 = el.find('.title2').text();
        subsection.text2 = el.find('.text2').text();
        el.find('.links a').each((index, linkEl) => {
          let link = { href: '', text: ''};
  
          link.href = $(linkEl).attr('href');
          link.text = $(linkEl).text();
          subsection.links.push(link)
        });

        section6.subsection1.push(subsection);
      });


      // Section 7
      let section7 = {title1: '', text1: '', links: []};
      let s7 = $(sections.get(6));
      section7.title1 = s7.find('.title1').text();
      section7.text1 = s7.find('.text1').text();
      s7.find('.links a').each((index, element) => {
        let el = $(element)
        let link = { href: '', text: ''};

        link.href = el.attr('href');
        link.text = el.text();
        section7.links.push(link)
      });

      // Section 8
      let section8 = {title1: '', text1: '', tableEl: null};
      let s8 = $(sections.get(7));
      section8.title1 = s8.find('.title1').text();
      section8.text1 = s8.find('.text1').text();
      section8.tableEl = s8.find('table');

      // Section 9
      let section9 = {title1: '', text1: '', tableEl: null};
      let s9 = $(sections.get(8));
      section9.title1 = s9.find('.title1').text();
      section9.text1 = s9.find('.text1').text();
      section9.tableEl = s9.find('table');


      const resourcesModel = {
        section1,
        section2,
        section3,
        section4,
        section5,
        section6,
        section7,
        section8,
        section9
      };
      console.log(resourcesModel);

      for(let i = 1; i < 10; i++) {
        let template = renderModule[`section${i}`];
        let model = resourcesModel[`section${i}`]
        renderModule.render(
          `#section-${i}`,
          template(model)
        )
      }

      UtilsModule.editSrc();
      handler();
    });
  }

  function getHtmlFileName() {
    return 'resources.html';
  }

  // List of functions accessibly by other scripts
  return {
    loadResources: loadResources,
  };
})(window);

export const ResourcesModule = resourcesModule;
