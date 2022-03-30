A service is an injectable logic that can be consumed by all the components that need it. It can carry manipulation functions and ,in our case, fetch data from a provider.
Inside the Angular App, an Injector gives access to each component to their required services. It’s good coding practice to use a distinct service to each data type you want to manipulate. The type is described in a interface.

Here we simply fetch and display the data of elements and their details.