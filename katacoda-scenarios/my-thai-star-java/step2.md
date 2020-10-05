Now you want to build the app in a second terminal. After all you can test the app.

To open a second terminal click on the plus sign. A drop-down list will open and you click on "Open New Terminal".  

The next step is to install globally Angular CLI. Don't worry a second terminal will open when you execute the command.
`npm install -g @angular/cli`{{execute T2}}

After a while you will be asked if you like to share anonymous usage data with the Angular Team at Google.
Either choose `y`{{execute T2}} or `n`{{execute T2}}
 
Now switch to the angular folder in jump-the-queue directory.
`cd my-thai-star/angular`{{execute T2}}

 
After that install the dependencies in the local folder.
`npm install`{{execute T2}}
 

After a while you will be asked if you like to share anonymous usage data with the Angular Team at Google.
Either choose `y`{{execute T2}} or `n`{{execute T2}}

This will take some time.

In the next step you need to change the Base URL for the REST Services. Open the IDE, wait until it is fully loaded and then open
`my-thai-star/angular/src/app/core/config/config.ts`{{open}}

Now change the restPathRoot to `https://[[HOST_SUBDOMAIN]]-8081-[[KATACODA_HOST]].environments.katacoda.com/mythaistar/`{{copy}}
And restServiceRoot to `https://[[HOST_SUBDOMAIN]]-8081-[[KATACODA_HOST]].environments.katacoda.com/mythaistar/services/rest/`{{copy}}


Last but not least switch back to terminal 2. Now you build and start the app.
`ng serve --host 0.0.0.0 --disable-host-check`{{execute T2}}

 
Wait until you see the message "Compiled successfully".
 
Now you can open the following link to use My Thai Star. 
https://[[HOST_SUBDOMAIN]]-4200-[[KATACODA_HOST]].environments.katacoda.com/
