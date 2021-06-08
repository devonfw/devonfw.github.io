

![architecture-modules.png](./assets/architecture-modules.png)

Every Angular application requires a module called app which is the main entrance to an application at runtime - this module gets bootstrapped. Angular Styleguide defines feature modules and two special modules - core and shared.

* A **feature** module is basically a vertical cut through both layers.

* The **shared** module consists of components shared across feature modules.

* The **core** module holds services shared across modules.

So core module is a module only having a services layer and shared module is a module only having a components layer.

The `SampleDataModule` which we visitied earlier is a typical example of a **feature** module

Let us refer the application again for examples on **core** module and **shared** module.



