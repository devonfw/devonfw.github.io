

## Health Check
However, you might face some errors while using CobiGen. So, we recommend to perform a Health Check for CobiGen Templates for better experience.

To get more information on Health Check for CobiGen Templates visit on https://devonfw.com/website/pages/docs/master-cobigen.asciidoc_eclipse-integration.html#cobigen-eclipse_usage.asciidoc_health-check

## Troubleshooting CLI
When generating code from a Java file, CobiGen makes use of Java reflection for generating templates. In order to do that, the CLI needs to find the compiled source code of your project.

If you find an error like Compiled class foo\bar\EmployeeEntity.java has not been found, it means you need to run &#34;mvn clean install&#34; on the input project so that a new target folder gets created with the needed compiled sources.

## Conclusion
From this tutorial you have learned the following:
* You can do CobiGen set up in your system.
* You can use the CobiGen CLI commands to generate the code.
* You can now integrate CobiGen with Eclipse and generate your crud services.
* Now you know how to use CobiGen in a particular project with Eclipse as well as CLI.

More information about CobiGen on https://devonfw.com/website/pages/docs/master-cobigen.asciidoc.html



