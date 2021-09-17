const editLinksModule = (function(window) {
  // Function definitions

  function executeRules(rules) {
    let result;
    rules.some(rule => {
        let matches = rule.re.exec(window.location.pathname);
        if(matches){
            if(rule.index !== undefined){
                result = matches[rule.index];
            } else {
                result = rule.value;
            }
            return true;
        }
        return false;
    });

    return result;
  }

  function getRepoName() {

    let rules = [
        {
            re: /website\/pages\/welcome\/welcome\.html/,
            value: 'devonfw.github.io'
        },
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
    ];
    return executeRules(rules); 
  }

  function getFolderName() {

    let rules = [
        {
            re: /website\/pages\/welcome\/welcome\.html/,
            value: 'website/pages/welcome'
        },
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
    ];
    return executeRules(rules); 
  }

  function getBranchName() {

    let rules = [
        {
            re: /website\/pages\/welcome\/welcome\.html/,
            value: 'develop'
        },
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
    ];
    return executeRules(rules);
  }

  function addEditLinks(alwaysVisible = true) {    
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
            if(matches.length > 0) {
                let filename = matches[0];
                let url = urlPrefix + filename;
                let link = $('<a title="' + title + '" target="_blank" style="padding-left: 0.375em;" class="edit-link" href="' + url + '">&#x270E</a>');
                if(!alwaysVisible){
                    $("<style type='text/css'> .edit-link {   opacity: 0; }  *:hover > .edit-link, .edit-link:focus  {   opacity: 1; } </style>").appendTo("head");
                }
                let anchorLink = headline.find("a");
                if(anchorLink.length){
                    anchorLink.before(link);
                } else {
                    headline.append(link);
                }
            }
        });
    }
  }

  $('.search-bar').append('<i class="fa fa-search"></i>');
  // List of functions accessibly by other scripts
  return {
    addEditLinks: addEditLinks
  };
})(window);

export const EditLinksModule = editLinksModule;
