Nexus service is used as a repository for MrChecker module deployment. Two types of deployment can be determined:
* the deployment of a **release** version
* the deployment of a **working** version (SNAPSHOT)

## Snapshots
In order to make a code change visible by other submodules the code needs to be build and deployed into Nexus with a correct version. Normally, working versions are deployed. A correct version is assured by incrementing the current version and appending it with “-SNAPSHOT” in a POM file, e.g.: 2.4.0 -> 2.4.1-SNAPSHOT. If another deployment is needed it’s possible to either overwrite a snapshot version or increment the current version number. 
Releases will be done periodically by a dedicated person.
**ATTENTION: As the code is shared it’s crucial that developers align on deployment versions in order not to overwrite one’s work.**

## Code deployment examples
The described structure and deployment types require to follow some rules while building modules and making deployments. 
Three scenarios should be considered.
1. Changing a logger’s version in the parent
As the logger is a dependency used in all submodules it is declared in the parent’s POM file. In this case procedure is as follows:
   * increase a version of the parent e.g. 2.4.0 -> 2.4.1-SNAPSHOT
   * build and push the code to Nexus
   * update the parent’s version in all submodules
   * increase a version of all submodules e.g. 1.7.0 -> 1.7.1-SNAPSHOT
   * increase a version of the mrchecker-core-module in all submodule 
   * build and push the code to Nexus for all submodules
2. Upgrading Junit version or changing the code in the mrchecker-core-module
   * Junit is declared in the mrchecker-core-module and used by all submodules. In this case procedure is as follows:
   * increase a version of the mrchecker-core-module e.g. 4.12.1.1 -> 4.12.1.2-SNAPSHOT
   * build and push the code to Nexus
   * increase a version of all submodules e.g. 1.7.0 -> 1.7.1-SNAPSHOT
   * increase a version of the mrchecker-core-module in all submodule 
   * build and push the code to Nexus for all submodules
3. Changing an exclusive dependency version or the code in the remaining submodule. In this case procedure is as follows:
   * increase a version of a submodule e.g. 2.4.1.1 -> 2.4.1.2-SNAPSHOT
   * build and push the code to Nexus

Maven build and deploy commands can be found in “_maven_build_cmd.txt_” files located in submodule directories.

## Deployment to Nexus vs. deployment to local maven repository
It’s also possible to work with and deploy to local maven repository instead od using Nexus. 
“_maven_build_cmd.txt_” file contains commands for code deployment:
* mvn -P release clean verify install deploy -DskipTests=true – deploys to Nexus
* mvn -s /d/eclipse/Allure_Test_Framework/m2/settings.xml clean install deploy -DskipTests=true – deploys to local maven repository

### Troubleshooting
* If unable to download SNAPSHOT from the server, Nexus repository an settings.xml should be added to local maven.
