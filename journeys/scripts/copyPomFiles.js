const replace = require("replace-in-file");
const fs = require("fs");
const path = require("path");
let parentDir = path.dirname(__dirname);
let targetDir = path.join(parentDir, "journeys");

if (!fs.existsSync(targetDir + "\\" + "title_of_journey_01")) {
  fs.mkdirSync(targetDir + "\\" + "title_of_journey_01");
}

fs.readdir(targetDir, (err, files) => {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  files.forEach((file) => {
    let path = targetDir + "\\" + file;
    try {
      stat = fs.statSync(path);

      if (stat.isDirectory()) {
        /*
        If the Directoryname contains at least one hashtag, the first one which is found will be replaced by two (or extended by one).
        What is this code good for ? --> Ask Jahn ( copyPomFile.sh sourcecode line 4)
        */
        let directoryname = file;
        if (directoryname.includes("#")) {
          let positionoffirsthashtag = file.indexof("#");
          let resultingDirectoryname = [
            a.slice(0, positionoffirsthashtag),
            "#",
            a.slice(positionoffirsthashtag),
          ].join("");
          fs.rename(directoryname, resultingDirectoryname, (error) => {
            if (error) {
              console.error("Directory renaming error.", error);
            } else {
              console.log("Directory renamed correctly");
            }
          });
        }

        // Copy journeys-pom.xml from journeys/journeys into all journeys/journeys/ subdirectories and rename it afterwards to pom.xml
        if (directoryname != "target") {
          try {
            fs.copyFileSync(
              targetDir + "/journey-pom-template.xml",
              targetDir + "/" + directoryname + "/pom.xml"
            );
          } catch (error) {
            console.error("Copying journeys-pom.xml file error: " + error);
          }

          // Copy journey-template.asciidoc from repository into all journeyssubdirecotires and rename them afterwards to index.asciidoc.
          try {
            fs.copyFileSync(
              parentDir + "/journey-template.asciidoc",
              targetDir + "/" + directoryname + "/index.asciidoc"
            );
          } catch (error) {
            console.error("Copying journeys-pom.xml file error:" + error);
          }

          // Change the placeholder artifactId of the given journeys pom-file, with the corresponding directory name of the journey.
          try {
            let artifactId = {
              files: targetDir + "/" + directoryname + "/pom.xml",
              from: /§journeyId§/,
              to: directoryname,
            };
            replace.sync(artifactId);
          } catch (error) {
            console.error(
              "Error occurred while changing journeys artifactId: ",
              error
            );
          }

          // Insert all pom.xml files of the Journeys (journeys/journeys/journeyTitleDirectory/pom.xml),
          // as a Module in the parent pom journeys/journeys/pom.xml
          try {
            let modulesRep = "<module>" + directoryname + "</module></modules>";
            let module = {
              files: targetDir + "/pom.xml",
              from: /\<\/modules>/,
              to: modulesRep,
            };
            replace.sync(module);
          } catch (error) {
            console.error("Error occurred while adding modules to pom:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error stating file: ", error);
    }
  });
});