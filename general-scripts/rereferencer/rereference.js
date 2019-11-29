'use strict';

const AsciidocFile = require('./asciidoc-file')
const HTMLFile = require('./html-file')

const path = require('path');
const dirTree = require('directory-tree');
const Mapper = require('./mapper');

/**
 * Get files array from a tree structure
 *
 * @param {{ children: Array<{ children: Array<{}>}>}} dirTree
 * @returns Array<{type: 'file'}> with the files inside dirTree
 */
function justFiles(dirTree) {

  const stack = [dirTree];
  let files = [];

  while (stack.length > 0) {
    let item = stack.pop();

    if (item && item.children) {
      for (const child of item.children) {
        stack.push(child);
      }
    } else if (item && item.path) {
      files.push(item);
    }
  }

  return files;
}

/**
 * Check whether the name of the files matches regex 
 * @param {Array<{name: string}>} files
 * @param {RegExp} regex
 * @returns Files whose name matches regex
 */
function filterFilesByRegexp(files, regex) {
  const NOT_FOUND = -1;
  let filteredFiles = [];

  for (const file of files) {
    if (file.name.search(regex) !== NOT_FOUND) {
      filteredFiles.push(file);
    }
  }

  return filteredFiles
}

/**
 * Searches for all the files in source that met the given extension
 * extension are like .here-the-extension
 *
 * @param {string} source
 * @param {string} extension
 * @returns List of files in source with the given extension
 */
function filesFromDir(source, extension) {
  const extensionRegex = new RegExp(`\\${extension}`);
  const normalizedSource = path.normalize(source);
  const folder = normalizedSource
    .replace(new RegExp(`\\${path.sep}$`), '')
    .replace(new RegExp(`${path.sep}$`), '');
  const filteredTree = dirTree(path.join(__dirname, folder), {
    extensions: extensionRegex,
  });
  const files = justFiles(filteredTree);

  return files;
}


function validNewReferences(gitReference, htmlFiles) {
  const devRef = Mapper.devonfwFromGit(gitReference);
  const fileRegex = new RegExp(`${devRef.file}_(.*).html`, 'gm');
  const matchingFiles = filterFilesByRegexp(htmlFiles, fileRegex);
  const newRefsMap = {};

  for (const matchingFile of matchingFiles) {
    const htmlFile = new HTMLFile(matchingFile.path);
    const exists = htmlFile.findDevonfwRef(devRef.id);
    if (exists) {
      devRef.setFile(htmlFile.base);
      newRefsMap[gitReference.toString()] = devRef.toString();
    }
  }

  if (!devRef.id) {
    const fileRegex = new RegExp(`${devRef.file}.html`, 'gm');
    const matchingFiles = filterFilesByRegexp(htmlFiles, fileRegex);
    if (matchingFiles.length > 0) {
      devRef.setFile(`${devRef.file}.html`);
      newRefsMap[gitReference.toString()] = devRef.toString();
    }
  }

  return newRefsMap;
}

if (process.argv.length > 3) {
  const asciidocFiles = filesFromDir(process.argv[2], '.asciidoc');
  const htmlFiles = filesFromDir(process.argv[3], '.html');
  const checks = {
    organization: 'devonfw',
  };
  const regex = /(https?):\/\/(github\.com)\/(devonfw)\/([\wnÑ-]*)\/(wiki)(\/(([\wnÑ\/\s-]*)\/)?([\wnÑ\/-]*)(#([\wnÑ-]*))?)?/gm;
  let allGitRefs = []
  let allNewRefs = {}
  let allNonUpdated = [];

  console.log('############# START #############\n');
  for (const file of asciidocFiles) {
    const asciidocFile = new AsciidocFile(file.path);
    const gitRefs = asciidocFile.findGitReferences(regex, checks);
    allGitRefs = allGitRefs.concat(gitRefs)
  }

  for (const gitRef of allGitRefs) {
    const devRefsMap = validNewReferences(gitRef, htmlFiles);
    allNewRefs = Object.assign(allNewRefs, devRefsMap)
  }

  for (const gitRef of Object.keys(allNewRefs)) {
    let updated = false;
    for (const file of htmlFiles) {
      const htmlFile = new HTMLFile(file.path);
      updated = updated || htmlFile.updateReferences(gitRef, allNewRefs[gitRef]);
    }

    if (!updated) {
      allNonUpdated.push(gitRef.toString())
    }
  }

  allNonUpdated = Array.from(new Set(allNonUpdated))

  console.log(`\nNew references (${Object.keys(allNewRefs).length}):`)
  console.log(Object.keys(allNewRefs).map((key) => `${key} --> ${allNewRefs[key]}`));
  console.log(`\nNon updated (${allNonUpdated.length}):`)
  console.log(allNonUpdated)



  const remaining = Object.keys(allNewRefs).filter((ref) => allNonUpdated.some(non => non == ref)).map((key) => `${key} --> ${allNewRefs[key]}`)
  console.log(`\nRemaining (${remaining.length}):`)
  console.log(remaining)

  console.log('############## END ##############');
}
