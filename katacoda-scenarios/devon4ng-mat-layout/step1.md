Before creating a devon4ng application, you first have to install the devonfw ide. You will find more information about devonfw on https://devonfw.com/website/pages/welcome/welcome.html.
Once you have setup devonfw ide, you are ready to create your first devon4ng project.(Please wait until the devon setup completes and the command prompt becomes ready for writing commands in the integrated terminal here).


Please change the folder to &#39;devonfw/workspaces/main&#39;.

`cd devonfw/workspaces/main`{{execute T1}}


Use the 'ng create' command to create a new Angular project with the name devon4ng-mat-layout.
`devon ng create devon4ng-mat-layout --style=scss --routing=true --strict=false`{{execute T1}}




Now you have to open another terminal. Click on the cd command twice and you will change to &#39;devonfw/workspaces/main/devon4ng-mat-layout&#39; in terminal 2 automatically. The first click will open a new terminal and the second one will change the directory. Alternatively you can click on the &#39;+&#39;, choose the option &#39;Open New Terminal&#39; and run the cd command afterwards. 


`cd devonfw/workspaces/main/devon4ng-mat-layout`{{execute T2}}


Now build and start the app
 

`devon ng serve --host 0.0.0.0 --disable-host-check`{{execute T2 }}

For your local projects you wouldn't add '--host 0.0.0.0' and '--disable-host-check' to the 'ng' command.


Now you can open the following link to use the app. 
https://[[HOST_SUBDOMAIN]]-4200-[[KATACODA_HOST]].environments.katacoda.com/
 

