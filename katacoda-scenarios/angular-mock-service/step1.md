## Mock Data
Mock data is fake data which is artificially inserted into a piece of software. Mocking is essentially simulating the behaviour of real data in controlled ways. So in order to use mock data effectively, it is essential to have a good understanding of the software under test and more importantly how it uses its data. As with most things, there are both advantages and disadvantages to doing this.

One of the big advantages with mock data is that it makes it possible to simulate errors and circumstances that would otherwise be very difficult to create in a real world environment. A disadvantage however is that without good understanding of the software, it will be possible to manipulate data in ways which would never actually happen in the real world.

## Mock Service

Services are often the smoothest files to unit test. A mock service imitates a real REST or SOAP API – it contains definitions for operations that clients call, receives requests, and returns simulated responses.

When testing a component with service dependencies, the best practice is mocking them, in order to test the component in an isolated environment. In fact, our purpose is testing the component, not the services, that can be trouble, especially if they try to interact with a server.

Here, we will go through a angular-mock-service sample app.




![leaderboard.png](./assets/leaderboard.png)

The app presents 3 pages as follows:

* A leader board with the top 3 elements
A leader board can be understood as &#34;the most popular items in a set&#34;, &#34;the latest updated items&#34;, &#34;you favorite items&#34; etc.

![data-table.png](./assets/data-table.png)

* A data table with all the elements
A data table with CRUD operations is very useful (in our case we only view details or delete an item, but they illustrate two important things: the details view shows how to navigate and consume a parametric route, the delete action shows how to invoke service operations over the loaded data - this means that the component is reusable and when the data comes with an API, only the service will need it’s implementation changed)

![detail.png](./assets/detail.png)

* A details page that reads a route parameter and displays the details of the element.



