Cobigen is supposed to support both java 8 and java 11 even though we are moving to 11. Here is a short description of how to setup the execution enviromment for developing so that you can test both environments.

By default, cobigen development tools come with some installed JREs in /software/java (11) and /software/java/additionalJdk (7 and 8)

<img src="https://user-images.githubusercontent.com/15246597/79480851-f49c4180-800e-11ea-9f02-7adf6f9f2598.PNG" width="800">

In cobigen, there is a fixed setup of JAVASE-1.8 in maven, which leads to the odd that no matter which Java is currently used, eclipse keeps showing JAVASE-1.8. A temporary reconfiguration of JRE in build path will also be overwritten by a maven update.

<img src="https://user-images.githubusercontent.com/15246597/79479414-0250c780-800d-11ea-8916-ee1a68c5baa3.PNG" width="800">

Eclipse has a fixed list of execution environments, which is automatically matched with the current most suitable installed JRE, in our case JDK-8 by default. The matching JRE is the actual one, which is used to compile no matter which name eclipse shows

<img src="https://user-images.githubusercontent.com/15246597/79480846-f36b1480-800e-11ea-9e2c-6538bb74fe07.PNG" width="800">


As that, to move to 11, just setup the match JRE of JAVASE-1.8 to 11 or any version you need

