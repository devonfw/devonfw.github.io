BASEDIR=$(dirname "$0")
cd $BASEDIR/../
for d in $(find journeys -name 'target'); do 
    rsync -av $d'/generated-docs/' './target/generated-docs/'$(echo $d | sed s#/target#/#)
    rm -r $d
done

rm target/generated-docs/journeys/journey-pom-template.xml
rm -r target/generated-docs/scripts

node scripts/htmlToJson.js target/generated-docs/journeys target/generated-docs/journeys/journeyData