# devonfw-website-tst

Code for the devonfw website

## Dependencies

* [devonfw distribution](http://de-mucevolve02/files/devonfw/current/)

## Initial setup

* Open the console in your devonfw distribution (console.bat).
* Clone this project.
* Install http-server from npm: `npm install -g http-server`
* Inside _/search-engine_ run `npm install`.

Once all the steps are done, go to _/devonfw-guide/_ and then:

```bash
mvn clean package -Ddocgen.images.dir=images,documentation -P !custom-style,generate-html-doc
```

After completing the last step:

* run `cd target/generated-docs/`.
* run `http-server -o`. The default port used will be 8080 but a different one can be specified using the argument `-p port-number`.

The last command will open a page on http://localhost:8080.