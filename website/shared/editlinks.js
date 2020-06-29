const editLinksModule = (function(window) {
  // Function definitions

  function getRepoName() {

    let rules = [
        {
            re: /guide-([^\/]+?)\.asciidoc/,
            value: 'devonfw-guide'
        },
        {
            re: /master-contributing\.asciidoc/,
            value: 'devonfw-guide'
        },
        {
            re: /master-database\.asciidoc/,
            value: 'devonfw-guide'
        },
        {
            re: /devonfw-ide-([^\/]+?)\.asciidoc/,
            value: 'ide'
        },
        {
            re: /(master-)?release-notes([^\/]+?)\.asciidoc/,
            value: undefined
        },
        {
            re: /User-Stories\.asciidoc/,
            value: undefined
        },
        {
            re: /dsf-how-to-use\.asciidoc/,
            value: undefined
        },
        {
            re: /(master-)?([^\/]+?)\.asciidoc/,
            index: 2
        }
    ]
    let repoName;
    rules.some(rule => {
        let matches = rule.re.exec(window.location.pathname);
        if(matches){
            if(rule.index !== undefined){
                repoName = matches[rule.index];
            } else {
                repoName = rule.value;
            }
            return true;
        }
        return false;
    });

    return repoName; 
  }

  function getFolderName() {

    let rules = [
        {
            re: /guide-([^\/]+?)\.asciidoc/,
            value: 'general/db'
        },
        {
            re: /master-contributing\.asciidoc/,
            value: 'general'
        },
        {
            re: /master-database\.asciidoc/,
            value: 'general/db'
        },
        {
            re: /devonfw-ide-([^\/]+?)\.asciidoc/,
            value: 'documentation'
        },
        {
            re: /(master-)?([^\/]+?)\.asciidoc/,
            value: 'documentation'
        }
    ]
    let folderName;
    rules.some(rule => {
        let matches = rule.re.exec(window.location.pathname);
        if(matches){
            if(rule.index !== undefined){
                folderName = matches[rule.index];
            } else {
                folderName = rule.value;
            }
            return true;
        }
        return false;
    });

    return folderName; 
  }

  function getBranchName() {

    let rules = [
        {
            re: /guide-([^\/]+?)\.asciidoc/,
            value: 'master'
        },
        {
            re: /master-contributing\.asciidoc/,
            value: 'master'
        },
        {
            re: /master-database\.asciidoc/,
            value: 'master'
        },
        {
            re: /devonfw-ide-([^\/]+?)\.asciidoc/,
            value: 'master'
        },
        {
            re: /master-cobigen\.asciidoc/,
            value: 'master'
        },
        {
            re: /master-production-line\.asciidoc/,
            value: 'master'
        },
        {
            re: /(master-)?([^\/]+?)\.asciidoc/,
            value: 'develop'
        }
    ]
    let branchName;
    rules.some(rule => {
        let matches = rule.re.exec(window.location.pathname);
        if(matches){
            if(rule.index !== undefined){
                branchName = matches[rule.index];
            } else {
                branchName = rule.value;
            }
            return true;
        }
        return false;
    });

    return branchName; 
  }

  function addEditLinks() {    
    let title = 'This will open the corresponding asciidoc file in the github editor and create a PullRequest for your changes when you save them. The changes will be reviewed before they are published on the website.';

    let repoName = getRepoName(); 

    if(repoName) {
        let folderName = getFolderName();
        let branchName = getBranchName();
        let urlPrefix = "https://github.com/devonfw/" + repoName + "/edit/" + branchName + "/" + folderName + "/";
        $('h3,h4,h5').each(function() {
            let headline = $( this );
            let id = headline.prop('id');
            let re = /^.+?\.asciidoc/;
            let matches = re.exec(id);
            let filename = matches[0];
            let url = urlPrefix + filename;
            var link = $('<a title="' + title + '" target="_blank" style="padding-left: 0.375em;" class="edit-link" href="' + url + '">&#x270E</a>');
            var anchorLink = headline.find("a");
            if(anchorLink.length){
                anchorLink.before(link);
            } else {
                headline.append(link);
            }
        });
    }
  }

  // List of functions accessibly by other scripts
  return {
    addEditLinks: addEditLinks
  };
})(window);

export const EditLinksModule = editLinksModule;
