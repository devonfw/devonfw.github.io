

An Angular application is component based like [devon4j](https://github.com/devonfw/devon4j), but different terminology is used as compared to devon4j. Primarily the term used is **module** instead of **component**.
To clarify this:

* A **component** describes an UI element containing HTML, CSS and JavaScript - structure, design and logic encapsulated inside a reusable container called component.

* A **module** describes an applications feature area. The application flight-app may have a module called booking.

An application developed using Angular consists of multiple modules. There are feature modules and special modules - *core* and *shared*. Angular or Angular Styleguide give no guidance on how to structure a module internally. This is where this architecture comes in.

We will refer a devon4ng application for better understanding. But before that, let us understand the Architectural Layers of a devon4ng application.



