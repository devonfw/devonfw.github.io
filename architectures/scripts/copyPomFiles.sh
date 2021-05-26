BASEDIR=$(dirname "$0")
cd $BASEDIR/../solutions
for d in */; do 
dirname=$(echo "$d" | sed "s#/##");
if [ 'target' != $dirname ]; then
    cp solution-pom.xml "$dirname/pom.xml"; 
    e="s/§solutionId§/$dirname/"
    sed -i $e "$dirname/pom.xml";
    modules='</modules>'
    modulesRep="<module>$dirname</module></modules>";
    sed -i "s#$modules#$modulesRep#" "pom.xml";
fi
done