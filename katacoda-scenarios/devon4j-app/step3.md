### Build devon4j sample application

Build the java project



Please change the folder to &#39;sampleapp&#39;.

`cd sampleapp`{{execute T1}}
 
Use the following devon command to build the java project.

`devon mvn clean install -Dmaven.test.skip=true`{{execute T1}}

The maven command 'clean' will clear the target directory beforehand. 

We do not need to execute the test cases, so we can skip them by using the option '-Dmaven.test.skip=true'.

Once build is successful you will get bootified-war generated in server module target folder. In sampleapp check for path sampleapp/server/sampleapp-server-bootified.war

