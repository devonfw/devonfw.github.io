# Changing the explore-section

The explore section can be changed in two ways:

1. Modify the documentation by clonig the repository locally
2. Modify the documentation using the pen-symbol (recomended for minor changes)

## Modify the documentation by cloning the repository locally

This process is recomended for greater changes and for adding/deleting nodes in the directory tree.

### 1. Modification of existing files

1. Clone the repository to your local workspace: 

   `git clone https://github.com/devonfw/devonfw.github.io`

2. Open the repository locally
3. GOTO `devonfw.github.io\website\pages\explore\dir-content`
4. Find the node you want to change. 

   In the folder dir-content the node will be listed as an asciidoc file.

5. Open the desired file.
6. Change the description of the node.

   This can be done by adapting the text in the section `[.directory]`

7. Add/delete internal links regarding other nodes 

   We accieve this by adding/deleting the links in the [.links-to-files] section. This can be done as follows: <<example.html#, Example-description>>. Note that the `html` file extension is required!

8. Add/delete internal links (from the devonfw website) 

   Add/delete the links to/from the section your link is related to ([.common-links], [.devon4j-links], [.devon4net-links], [.devon4ng-links] or [.devon4node-links]). 

   This can be done as follows: <</website/pages/docs/example-page.asciidoc.html#, Example-description>>.

9. Add/delete external links

   Add/delelte external links to/from the section your link is related to. 

   This can be done by simply copying and pasting them into the desired section.

10. Send a Pull request with the modified files

### 2. Adding/Deleting Nodes

#### Adding Nodes

Nodes can be added in the following manner:

1. In the `dir-content` folder, open the `input.txt` file.
2. Delete the content of the file.
3. Now add the titles of the nodes you want to add. 

   Note that there should only be one title per line. 

4. Run Powershell as Administrator
5. In Powershell goto the path `devonfw.github.io\website\pages\explore\dir-content`.
6. run `powershell -executionpolicy bypass -File .\generate.ps1`
7. This will generate the desired nodes as asciidoc files.

Now we need to add these nodes to the webpage-tree.

For each node you generated you will have to do the following:

1. Check which nodes point to the newly generated node, `new-node`.
2. In all of these nodes add `<<new_node.html#, NewNodeDescription>>` in the [.links-to-files] section.
3. Make sure that there is exactely one blank line before and after each link. 

   You may also compare your node to other nodes, if you are not sure.

4. Now modify the new node by adding the desired pointers to other nodes. This is done in the same manner.
5. Add a description to your node in the `[.directory]` section.
6. If you want to add external links to your node related to devon4j, devon4ng, devon4net or devon4node, add these in the correct sections provided in the node.
7. The section `[.common-links]` is used for all other links. 

#### Deleting a node

Deleting a node can be done in a similar way:

For each file you want to delete do the following:
1. Delete the actual node
2. Delete the pointers in all other nodes, that point to the deleted node 
3. Make sure that there is exactely one blank line before and after each pointer to another node. 

Now you are ready to send a pull request.

## Modify documentation using the pen-symbol
1. On GitHub goto the file you want to change
2. Click on the pen-symbol nex to the documentation
3. Modify the text
4. If asked select `Create a new branch for this commit and start a pull request`
5. Select a branch-name for the modification
6. Click on `Propose changes`


## Wiki

[devonfw Wiki](https://github.com/devonfw/devonfw.github.io)

