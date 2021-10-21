First, we have to clone the Devon4ng repository to access Angular Mock Service Sample.


Please change the folder to &#39;devonfw/workspaces/main&#39;.

`cd devonfw/workspaces/main`{{execute T1}}



Now clone the repository to your local directory.

`git clone https://github.com/devonfw/devon4ng.git`{{execute T1}}

Now we want to open the file periodicElement.ts. 

You can either click on this link, here: 

`devonfw/workspaces/main/devon4ng/samples/AngularMockService/src/app/models/periodicElement.ts`{{open}}

and it will open the file automatically or switch to the editor and open it yourself. 

Let’s consider a &#39;box of data&#39; represented in JSON. Physically this means a folder with some JSON/TS files in it. They are located in the app/mock folder. The example uses only one mock data file. The file is typed according to our data model.

The model is represented by the interfaces we make. These interfaces describe the data structures we will use in our application. In this example, there is one data model, corresponding with the &#39;type&#39; of data that was mocked. In the models folder you will find the .ts script file that describes chemical elements. The corresponding mock file defines a set is chemical element objects, in accordance to our interface definition.

![data-box.jpg](./assets/data-box.jpg)



