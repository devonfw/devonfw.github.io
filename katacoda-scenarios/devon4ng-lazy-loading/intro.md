


The definition of each step of this tutorial can be found at https://github.com/devonfw-tutorials/tutorials/tree/main/devon4ng-lazy-loading. 

Feel free to report any errors to us or fix them yourself. Errors can be reported by creating an issue in the https://github.com/devonfw-tutorials/tutorials/issues[tutorials repository]. To fix the error fork the repository and create a pull request. Errors in the wiki can be reported and fixed in the https://github.com/devonfw-tutorials/tutorial-compiler[Tutorial-compiler repository].
You can find a description of what to look for when creating a pull request at the devonfw contribution guide: https://devonfw.com/website/pages/community/community.html#community.asciidoc_contributing-to-devonfw. If you want to create a tutorial you can start with the https://katacoda.com/devonfw/scenarios/create-your-own-tutorial[katacoda tutorial] and read the description for creating your own tutorials: https://github.com/devonfw-tutorials/tutorials/wiki/Development.

In single-page-applications as the application size increases its loading speed decreases (since typically the entire application is loaded at once). Lazy loading is a design pattern that defers initialization of objects until it is needed. Angular handles lazy loading through the routing module which redirects to requested pages. Those pages can be loaded at start or on demand. In this tutorial you will build a simple app to understand how lazyloading is implemented in Angular.


## Prerequisites

* Basic Angular knowledge


## Learning goals
In this tutorial you will learn how to:

* create an Angular application using the devon command

* look how all modules are loaded by an application at the begining (eager loading)

* implement lazy loading and understand its concept and advantages
