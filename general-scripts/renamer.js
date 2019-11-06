const fs = require('fs');
const path = require('path');
const dirTree = require('directory-tree');
const crypto = require('crypto');

function justFiles(dirTree) {
  const stack = [dirTree];
  let files = [];

  while (stack.length > 0) {
    let item = stack.pop();

    if (item.children) {
      for (const child of item.children) {
        stack.push(child);
      }
    } else if (item.path) {
      files.push(item);
    }
  }

  return files;
}

function getFileRegex(file) {
  let regex = RegExp(
    `(include\\:\\:|link\\:)([^\\s]*\/){0,1}(${file.name})(\\${file.extension}){0,1}\\[`,
    'gm',
  );
  return regex;
}

function findReferences(file, fileToSearch = { name: '', extension: '' }) {
  let content = fs.readFileSync(file.path, 'utf-8');
  const contentLines = content.split('\n');
  let references = new Set();

  for (const line of contentLines) {
    //line.search('xref:')
    let regex = getFileRegex(fileToSearch);
    let matchList;
    while ((matchList = regex.exec(line)) != null) {
      console.log(
        `Found reference: ${matchList[0]}\n--> Match: ${matchList
          .slice(2)
          .join('')}\n`,
      );

      const matchedPath = matchList.slice(2).join('');
      references.add(matchedPath);
    }
  }
  console.log('references: ' + Array.from(references));
  console.log('');
  return Array.from(references);
}

function updateReferences(file, originalFilePath, newFileName) {
  let content = fs.readFileSync(file.path, 'utf-8');
  let regex = RegExp(`(include\\:\\:|link\\:)(${originalFilePath})\\[`, 'gm');

  let splitted = originalFilePath.split('/');
  splitted[splitted.length - 1] = newFileName;
  let newRef = splitted.join('/');

  let updatedContent = content.replace(regex, `$1${newRef}\[`);
  //console.log('new content: ' + updatedContent);
  //console.log('end of new content\n');
  fs.writeFileSync(file.path, updatedContent);
}

function getNewName(file) {
  const parsedPath = path.parse(file);
  const pathSplitted = path
    .join(parsedPath.dir, parsedPath.name)
    .split(path.sep);
  const name = pathSplitted.join('-');
  const hash = crypto
    .createHash('md5')
    .update(name)
    .digest('hex');
  console.log('hash for file: ' + hash);
  return parsedPath.name.slice(0, 1).toLowerCase() + hash + parsedPath.ext;
}

function rename(filesToRename) {
  for (const file of filesToRename) {
    const newName = getNewName(file);
    console.log('file to be renamed:' + file);
    console.log('new name:' + newName);
    console.log('');

    const dirname = path.dirname(file);
    fs.renameSync(file, path.join(dirname, newName));
  }
}

function renameFiles(filesFromTree, referenced) {
  let filesToRename = new Set();
  for (let file of filesFromTree) {
    console.log(
      '##################### PROCESING FILE #########################\n',
    );
    console.log('Current file: ' + file.path + '\n');

    const fileDir = path.dirname(file.path);
    const references = findReferences(file, referenced);
    for (const ref of references) {
      // get where the referenced file is located
      const refFilePath = path.join(fileDir, ref);
      const objFound = filesFromTree.find((file) => file.path == refFilePath);
      console.log(
        '--------------------- UPDATING REFERENCES -------------------\n',
      );

      updateReferences(file, ref, getNewName(refFilePath));

      if (objFound) {
        filesToRename.add(refFilePath);
      } else {
        const refWithExt = refFilePath + referenced.extension;
        console.warn(`referenced file not found: ${refFilePath}`);
        console.warn(`looking for: ${refWithExt}`);
        filesToRename.add(refWithExt);
      }
    }
  }

  console.log(
    '-------------------- RENAMING FILE --------------------------\n',
  );
  rename(filesToRename);
}

if (process.argv.length > 4) {
  const folderToSearchIn = process.argv[2];
  const filename = process.argv[3];
  const fileExt = process.argv[4];

  const extensionRegex = new RegExp(`\\${process.argv[4]}`);
  const normalizedFolder = path.normalize(folderToSearchIn);
  const folder = normalizedFolder
    .replace(new RegExp(`\\${path.sep}$`), '')
    .replace(new RegExp(`${path.sep}$`), '');

  const referencedFile = { name: filename, extension: fileExt };
  const filteredTree = dirTree(path.join(__dirname, folder), {
    extensions: extensionRegex,
  });
  const filesFromTree = justFiles(filteredTree);

  renameFiles(filesFromTree, referencedFile);
}
