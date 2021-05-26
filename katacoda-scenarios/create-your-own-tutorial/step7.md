Last but not least add a step. 

Each step consists of

* an explanation
* a function to execute (You can find a list with the currently available functions on https://github.com/devonfw-tutorials/tutorial-compiler/wiki/Functions)
* and an optional explanation of the results of the step.

In this tutorial we will add a simple step which creates a new file.


Switch to the IDE and open the file 'tutorials/myTutorial/index.asciidoc'.

`tutorials/myTutorial/index.asciidoc`{{open}}




Replace the content of the file with the following code.


Click on 'Copy to Editor' to change it automatically.

<pre class="file" data-filename="tutorials/myTutorial/index.asciidoc" data-target="replace" data-marker="">
= Title of my new tutorial
====
In this section you can write the description of the tutorial. This can consist of several lines.

The description should explain the tutorial in a few words and explain what is to be learned.
====

Before the &#39;[step]&#39; keyword the explanation is written.
The explanation can consist of multiple lines.
[step]
--
createFile(&#34;pathToTheFile/fileName.txt&#34;)
--</pre>

This is the syntax without additional text after the step. There is an alternative syntax to display a text after the step (e.g. for describing the results of a step). This will be shown in the next step.
