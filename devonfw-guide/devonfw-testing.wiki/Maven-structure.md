MrChecker implements the maven **parent-child pattern**:

![](https://raw.githubusercontent.com/wiki/devonfw/devonfw-testing/images/maven_structure/fig1.png)

In the project apart from the dependencies on the parent (blue line) there’s an extra dependency (red line). All submodules in their POM files refer to the mrchecker-core-module submodule as it provides the functionality used across the project. Summarizing up:
* all submodules refer to mrchecker-test-framework
* all submodules refer to mrchecker-core-module


## Basics
In the parent-child pattern there is one top module called parent and one or more submodules called children. The parent manages the whole project by a POM file. Every submodule contains its own POM file that refers to the parent's POM file and by doing so they have access to entities declared in the parent's POM file. The parent's POM file holds all entities (e.g. dependencies, constants, properties) common for all the children. 

## Resolving dependencies versions
The most important part of POM files is dependencies. If a child module needs some dependency that is declared in the parent’s POM file it has to declare it in its own POM file without a specific version because it's the parent who guarantees the version.
(**NOTE: It's possible to provide the version of a dependency. However, it is strongly recommended to avoid it in order not to break build process**).

Example:
* Junit dependency in the **parent’s** POM file

![](https://raw.githubusercontent.com/wiki/devonfw/devonfw-testing/images/maven_structure/fig2.png)
* Junit dependency in a **child’s** POM file

![](https://raw.githubusercontent.com/wiki/devonfw/devonfw-testing/images/maven_structure/fig3.png)

## Excluding dependencies
If a child module needs an exclusive dependency it should declare it in its POM file providing a specific version.
In some cases, it’s needed to exclude some dependencies from being downloaded by maven. For example, a project uses two dependencies that internally use two different versions of other dependencies. To avoid conflicts an exclusion can be used to tell maven not to download duplicated dependencies, example:

![](https://raw.githubusercontent.com/wiki/devonfw/devonfw-testing/images/maven_structure/fig4.png)

More information on parent-child structure can be found here: https://howtodoinjava.com/maven/maven-parent-child-pom-example/.



