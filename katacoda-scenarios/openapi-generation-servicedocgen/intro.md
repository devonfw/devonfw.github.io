


The definition of each step of this tutorial can be found at https://github.com/devonfw-tutorials/tutorials/tree/main/openapi-generation-servicedocgen. 

Feel free to report any errors to us or fix them yourself. Errors can be reported by creating an issue in the [tutorials repository](https://github.com/devonfw-tutorials/tutorials/issues). To fix the error fork the repository and create a pull request. Errors in the wiki can be reported and fixed in the [tutorial-compiler repository](https://github.com/devonfw-tutorials/tutorial-compiler).
You can find a description of what to look for when creating a pull request at the devonfw contribution guide: https://devonfw.com/website/pages/community/community.html#community.asciidoc_contributing-to-devonfw. If you want to create a tutorial you can start with the [katacoda tutorial](https://katacoda.com/devonfw/scenarios/create-your-own-tutorial) and read the description for creating your own tutorials: https://github.com/devonfw-tutorials/tutorials/wiki/Development.

This tutorial will teach you how to use the [ServicedocGen maven plugin](http://www.mojohaus.org/servicedocgen-maven-plugin/) to generate the OpenAPI specification and Swagger UI from your REST APIs.

The plugin analysis the REST APIs and the associated JavaDoc and then generates the OpenAPI specification as a static file. It is also able to create an HTML file that represents the Swagger UI and can be served by Quarkus to provide the Swagger UI in the browser.

For more information about OpenAPI and the ServicedocGen plugin, see the [devon4j documentation](https://github.com/devonfw/devon4j/blob/master/documentation/guide-openapi.asciidoc).


### Prerequisites

* Installed devonfw-ide (or at least Java and Maven installed)


### Learning goals

* You will learn how to generate OpenAPI specifications and Swagger UI from REST services using ServicedocGen maven plugin

