# What is "Parallel test execution" ? 

Parallel test execution means how many *"Test Classes"* can run simultaneously. 

*"Test Class"*, as this is Junit Test class, it can have one and more test cases - *"Test case methods"*

![](images/parallel/TestStructure.png)

***

# How many parallel test classes can run ? 

By default, number of parallel test classes is set to 8.

It can be updated as you please, on demand, by command line: 

> mvn test site -Dtest=TS_Tag1 -Dthread.count=16

*-Dthread.count=16* - increase number of parallel Test Class execution to 16.  