# devonfw-website (next)

[![build status](https://travis-ci.com/devonfw/devonfw-official-website.svg?branch=master)](https://travis-ci.com/devonfw/devonfw-official-website)

Code for the devonfw website (beta)

## Dependencies

* [devonfw distribution](http://de-mucevolve02/files/devonfw/current/)

## Initial setup

* Open the console in your devonfw distribution (console.bat).
* Clone this project `git clone --recurse-submodules https://github.com/devonfw/devonfw-official-website.git`.
* Inside _/search-engine/_ run `npm install`.

Once all the steps are done, go to _/devonfw-official-website/_ and then:

```bash
mvn clean package -Ddocgen.images.dir=images,documentation -Doutput.format=html
```

After completing the last step:

Option 1:

* Install http-server from npm: `npm install -g http-server`
* run `cd target/generated-docs/`.
* run `http-server -o`. The default port used will be 8080 but a different one can be specified using the argument `-p port-number`.

Option 2: (recomended):

* run `python -m http.server -d target/generated-docs/  port-number`.


Now you will be able to go to http://localhost:port-number/website/pages/logo/page-logo.html.

## During development

During development you may need to run `mvn clean package -D...`. If you are using _Option 1_ then you will need to shutdown the server first, otherwise maven won't be able to delete the _target_ folder

### Configuration changes
The file website/config/devonfw-site-conf.js stores variables for multiple configurations, here are the two most relevant:

* *BASE_PATH*: const BASE_PATH = '/devonfw-official-website/';

Due to the fact that the website is deployed to https://www.devonfw.com/devonfw-official-website/index.html, the base path is set to *'/devonfw-official-website/'*. If you are serving the website on your local machine localhost:port/index.html the path must be set to *'/'* 

* *editSrc.searchValue*:

The tool devon-docgen used to generate the html uses the absolute path of the compiling machine as the source of the images, so when it is deployed, this url is wrong.

```
Failed to load resource: the server responded with a status of 404 ()
```

To overcome this problem, *editSrc.searchValue* contains a string that is replaced to *editSrc.imgFolderPath*'s value.

The current value of editSrc.searchValue is '/home/travis/build/devonfw/devonfw-official-website/target/generated-docs/', but it must be replaced to the absolute path in your machine, usually something like 'C:/projects/devonfw-official-website/target/generated-docs/'.
