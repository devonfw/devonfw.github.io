

Now you should have a ideo how to create your own tutorials.

There is also a way to test your tutorials on your local machine. For this you have to clone the tutorial-compiler repository.

The directory with the tutorial-compiler has to be located next to the directory with the tutorials repository.

So go back to the root directory and clone the repository.

`cd /root`{{execute T1}}

`git clone https://github.com/devonfw-tutorials/tutorial-compiler.git`{{execute T1}}

The tutorial-compiler needs typescript to be installed to work. So install typescript on your machine.

`npm install typescript -g`{{execute T1}}

Now navigate into the tutorial-compiler directory and install the needed dependencies.

`cd tutorial-compiler`{{execute T1}}

`npm install`{{execute T1}}


# Test your tutorial locally
To run the tutorial-compiler execute the following command:

`bash localBuildRun.sh -e katacoda -p myTutorial`{{execute T1}}

This will execute your newly create tutorial in the &#39;katacoda&#39; environment. If you obmit the &#39;-e&#39; and &#39;-p&#39; paramter, all tutorials are executed in all environments.

The tutorial-compiler now generates the files needed for a katacoda tutorial. You can find the files in the &#39;build/output/katacoda/myTutorial&#39; directory of the tutorial compiler.
The step you added to your tutorial is shown in the following file:

`tutorial-compiler/build/output/katacoda/myTutorial/step1.md`{{open}}



