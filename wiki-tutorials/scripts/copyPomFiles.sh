BASEDIR=$(dirname "$0")
cd $BASEDIR/../tutorials
scriptdir="../scripts";

#Copy pom and index.asciidoc to tutorials folder 
cp $scriptdir/pom.xml "pom.xml"; 
cp $scriptdir/index.asciidoc "index.asciidoc"; 

for d in */; do
    dirname=$(echo "$d" | sed "s#/##");
    if [ 'target' != $dirname ]; then
	
		#Copy pom and index.asciidoc to wiki folder 
        cp $scriptdir/wiki-pom.xml "$dirname/pom.xml"; 
        cp $scriptdir/index.asciidoc "$dirname/index.asciidoc"; 
        e="s/§wikiId§/$dirname/"
        sed -i $e "$dirname/pom.xml";
		
		#Add modules to pom
        modules='</modules>'
        modulesRep="<module>$dirname</module></modules>";
        sed -i "s#$modules#$modulesRep#" "pom.xml";

        for p in $d*/; do
		
			#Copy pom to tutorial folder and rename wiki.asciidoc to index.asciidoc
            subdirname=$(echo "$p" | sed "s/\(.*\)\//\1/##");
            tutorialname=$(echo "$p" | sed "s/$d/##" | sed "s:\/::g");
            if [ 'target' != $tutorialname ]; then
                cp $scriptdir/tutorial-pom.xml "$subdirname/pom.xml"; 
				mv $subdirname/wiki.asciidoc "$subdirname/index.asciidoc";
                e="s/§wikiId§/$dirname/"
                sed -i $e "$subdirname/pom.xml";
                e="s/§tutorialId§/$tutorialname/"
                sed -i $e "$subdirname/pom.xml";
				
				#Add modules to wiki-pom
                modules='</modules>'
                modulesRep="<module>$tutorialname</module></modules>";
                sed -i "s#$modules#$modulesRep#" "$dirname/pom.xml";
            fi
			
        done
		
    fi
done 