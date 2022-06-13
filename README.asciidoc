:toc: right

# Next version of devonfw website

image:https://github.com/devonfw/devonfw.github.io/workflows/build-and-deploy/badge.svg[link="https://github.com/devonfw/devonfw.github.io/actions"] 

## Collaboration

In addition to the github issues, we are maintaining a project board on https://app.zenhub.com/workspaces/devonfw-website-5d847a381201de0001b6a798/board?repos=204906646[ZenHub] to track the current status.

## Development

### Initial setup

* Open the console in your devonfw distribution (console.bat).
* Clone this project `git clone --recurse-submodules --depth 1 https://github.com/devonfw/devonfw.github.io.git`.

### Build
* Inside `/devonfw.github.io/` run `mvn clean package -Doutput.format=html`.
** _Remark_: for your own trials, it might be worth, to go into `/devonfw.github.io/devonfw-guide/` and delete all *.wiki folders to speed up build as you might not want to generate the complete docs section of the website.

### Run
* Option 1:
** Install http-server from npm: `npm install -g http-server`
** run `http-server target/generated-docs/ -o`. The default port used will be 8080 but a different one can be specified using the argument `-p port-number`.
* Option 2:
** run `python -m http.server -d target/generated-docs/  port-number`.

Now you will be able to go to http://localhost:<port-number>/index.html.

### Adapt Styles

The entire stylesheet is maintained based on SASS in `asciidoctor-stylesheet/sass` folder with `devonfw.scss` file as an entry point. You can build the stylesheet only by running `mvn clean package` in the `asciidoctor-stylesheet` folder, which will generate the resulting CSS file to `asciidoctor-stylesheet/stylesheets/devonfw.css`.

Building the style locally, you can copy this file by hand to `/target/generated-docs/` of your cloned repository, where you might already have a version of the website running. Overwriting the already existing `devonfw.css` will result in a change of your locally served website.

Run the following command to overwrite `devonfw.css` (inside _devonfw.github.io/asciidoctor-stylesheet_):


```bash
~/asciidoctor-stylesheet$ cp target\stylesheets\devonfw.css ..\target\generated-docs\
```


NOTE: This process is automatically done if you execute a complete build of the repository. 

## Deployment

The deployment of the website is automatically done by the GitHub Action https://github.com/devonfw/devonfw.github.io/actions?workflow=build-and-deploy[build-and-deploy] on each commit.

