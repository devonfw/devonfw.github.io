To explain how lazy loading is implemented using angular, a basic sample app is going to be developed. This app will consist in a window named &#34;level 1&#34; that contains two buttons that redirects to other windows in a &#34;second level&#34;. It is a simple example, but useful to understand the relation between angular modules and lazy loading.

![levels-app](./assets/levels-app.png)

This graphic shows that modules acts as gates to access components &#34;inside&#34; them.

Because the objective of this guide is related mainly with logic, the html structure and scss styles are less relevant.

Before creating a devon4ng application, you first have to install the devonfw ide. You will find more information about devonfw on https://devonfw.com/website/pages/welcome/welcome.html.
Once you have setup devonfw ide, you are ready to create your devon4ng application. (Please wait until the devon setup completes and the command prompt appears in the integrated terminal here).


Please change the folder to &#39;devonfw/workspaces/main&#39;.

`cd devonfw/workspaces/main`{{execute T1}}


Use the 'ng create' command to create a new Angular project with the name level-app.
`devon ng create level-app --style=scss --routing=true --strict=false --skip-git=true`{{execute T1}}


