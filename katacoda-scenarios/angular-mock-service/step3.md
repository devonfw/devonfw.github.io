Now we want to open the file chemical-elements.service.ts. 

You can either click on this link, here: 

`devonfw/workspaces/main/devon4ng/samples/AngularMockService/src/app/services/chemical-elements.service.ts`{{open}}

and it will open the file automatically or switch to the editor and open it yourself. 

A service is an injectable logic that can be consumed by all the components that need it. It can carry manipulation functions and ,in our case, fetch data from a provider.
Inside the Angular App, an Injector gives access to each component to their required services. It’s good coding practice to use a distinct service to each data type you want to manipulate. The type is described in a interface.

Here we simply fetch and display the data of elements and their details.

![architecture.png](./assets/architecture.png)



