const cheerio = require("cheerio");
var fs = require("fs");
const path = require("path");
const { argv } = require("process");

//journeysDir (htmlDir):  target/generated-docs/journeys
//./target/generated-docs/journeys/journeyData/${subfolder}

//INPUT: HTML File (check you're in the same folder as the html/right path + put the right name in line 7)
//In this example, the html file tested is Communication.html
/*OUTPUT: output_test_${htmlfilename}.json contains the structure of the html file. 
    + id.json contains section with the id "id" and its html Content*/
//Run on Terminal with command: node scraperOO_angepasst.js
function main(journeysDir, outputDir) {
const dirList = fs.readdirSync(journeysDir);
outputDir = path.join("./", outputDir);
dirList.forEach((file) => {
  let pathToFile = journeysDir + "\\" + file;
  try {
    stat = fs.statSync(pathToFile);
    if (stat.isFile()) {
      if (file.includes(".html")) {
        let data = fs.readFileSync(pathToFile);
        var $ = cheerio.load(data);
        class Section {
          wrap_element;
          id;
          title;
          htmlContent;
          subSections;
          //Num is an int storing the depth at which the section (currently being created) is located. Num = 0 is the very first section (Architecture)
          constructor(num, wrap_element, i, parent_id) {
            if (num == 0) {
              this.id = 1;
            } else {
              this.id = parent_id * 10 + (i + 1);
            }
            this.wrap_element = num == 0 ? null : wrap_element;
            // get section title
            if (num == 0) {
              this.title = $("h" + (num + 1)).text();
            } else {
              var title_found = false;
              var title_depth = num + 1;
              while (!title_found) {
                this.title = $(wrap_element)
                  .children("h" + title_depth)
                  .text();
                if (this.title != null) {
                  title_found = true;
                } else {
                  title_depth += 1;
                }
              }
            }

            if (this.id === 1) {
              //TODO (later): check if id is the same
              this.htmlContent = $.html($("#content"));
            } else {
              //TODO: clean code for htmlContent
              //limit htmlContent if there's an existing subsection (Ex: Application Architecture)
              /*
                            1) check if the current section has subsections. 
                            2.1) If it doesn't then retrieve html content directly
                            2.2) If it does, then use foreach to iterate through the children, and append the content if the class name is not .sect(k).
                            write a function for 2.2
                            */
              if (this.has_subsections(num + 1)) {
                this.htmlContent = this.retrieve_html_content(num + 1);
              } else {
                this.htmlContent = $.html(
                  $(wrap_element).children(".sectionbody")
                );
                if (this.htmlContent === null || this.htmlContent == "") {
                  this.htmlContent = "";
                  $(wrap_element)
                    .children()
                    .each((ind, ch) => {
                      //Prevent title from going in the html Content
                      if (ind > 0) {
                        this.htmlContent += $.html(ch);
                      }
                    });
                }
              }
            }
            //write id.json
            let content_json = {
              title: this.title,
              sections: this.htmlContent,
            };

            if (
              !fs.existsSync(
                `${outputDir}\\${path.parse(file).name}`
              )
            ) {
              fs.mkdir(
                `${outputDir}\\${path.parse(file).name}`,
                (err) => {
                  if (err) {
                    console.error(
                      "Error creating subdirectories while HTML -> JSON conversion: " +
                      err
                    );
                  }
                }
              );
            }

            fs.writeFile(
              `${outputDir}\\${path.parse(file).name}\\` +
              this.id.toString() +
              ".json",
              JSON.stringify(content_json),
              (err) => {
                if (err) {
                  console.error(
                    "Error writing html sections while HTML -> JSON conversion: " +
                    err
                  );
                }
              }
            );
            //sections
            this.subSections = [];
            if (num == 0) {
              $(`.sect${num + 1}`).each((index, child) => {
                let child_section = new Section(num + 1, child, index, this.id);
                this.subSections[index] = {
                  id: child_section.id,
                  title: child_section.title,
                  sections: child_section.subSections,
                };
              });
            } else {
              if ($(wrap_element).children(`.sect${num + 1}`).length > 0) {
                $(wrap_element)
                  .children(`.sect${num + 1}`)
                  .each((index, child) => {
                    let child_section = new Section(
                      num + 1,
                      child,
                      index,
                      this.id
                    );
                    this.subSections[index] = {
                      id: child_section.id,
                      title: child_section.title,
                      sections: child_section.subSections,
                    };
                  });
              } else {
                $(wrap_element)
                  .children(".sectionbody")
                  .children(`.sect${num + 1}`)
                  .each((index, child) => {
                    let child_section = new Section(
                      num + 1,
                      child,
                      index,
                      this.id
                    );
                    this.subSections[index] = {
                      id: child_section.id,
                      title: child_section.title,
                      sections: child_section.subSections,
                    };
                  });
              }
            }
          }

          retrieve_html_content(k) {
            //returns a sections' paragraph/list content only
            var content = "";
            $(this.wrap_element)
              .children(".sectionbody")
              .children()
              .each((index, child) => {
                if ($(child).attr("class") != `sect${k}`) {
                  content += $.html(child);
                }
              });
            if (content == "") {
              $(this.wrap_element)
                .children()
                .each((index, child) => {
                  if ($(child).attr("class") != `sect${k}`) {
                    if (index > 0) {
                      content += $.html(child);
                    }
                  }
                });
            }
            return content;
          }

          has_subsections(k) {
            return (
              $(this.wrap_element)
                .children(".sectionbody")
                .children(`.sect${k}`).length != 0 ||
              $(this.wrap_element).children(`.sect${k}`).length != 0
            );
          }

          export_to_json() {
            let output_test = {
              id: this.id,
              title: this.title,
              sections: this.subSections,
            };
            fs.writeFile(
              `${outputDir}\\${path.parse(file).name
              }\\output.json`,
              JSON.stringify(output_test),
              (err) => {
                if (err) {
                  throw err;
                }
                console.log(`HTML ${file}-> JSON conversion output saved.`);
              }
            );
          }
        }
        let test = new Section(0, null, 0, 0);
        test.export_to_json();
      }
    }
  } catch (error) {
    console.error("Error stating file:", error);
  }
});
}

if(process.argv.length >2) {
  main(process.argv[2], process.argv[3]);
}