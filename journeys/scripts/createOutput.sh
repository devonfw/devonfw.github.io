BASEDIR=$(dirname "$0")
cd $BASEDIR/../
for d in $(find journeys -name 'target'); do 
    rsync -av $d'/generated-docs/' './target/generated-docs/'$(echo $d | sed s#/target#/#)
    rm -r $d
done

rm ../target/generated-docs/journeys/journey-pom-template.xml
rm -r ../target/generated-docs/scripts
rm -r ../target/generated-docs/website/pages/journeys/journeyData

#node scripts/fixImages.js ../target/generated-docs/journeys
node scripts/htmlToJson.js ../target/generated-docs/journeys ../target/generated-docs/journeys/journeyData

echo "Start Create Output.sh:"
echo "../target/generated-docs/journeys:"
ls ../target/generated-docs/journeys
printf "\n"

echo "../target/generated-docs/journeys/journeys"
ls ../target/generated-docs/journeys/journeys

echo "../target/generated-docs/journeys/journeyData"
ls ../target/generated-docs/journeys/journeyData
printf "\n"
echo "../target/generated-docs/journeys/journeyData/index"
ls ../target/generated-docs/journeys/journeyData/index

cp -avr devonfw_overview_small.drawio.svg ../target/generated-docs/journeys/journeyData/index
#cp -avr devonfw_overview_small.drawio.svg ../target/generated-docs/website/pages/journeys/


echo "AFTER Manually COPYING the image: ../target/generated-docs/journeys/journeys/journeyData/index"
ls ../target/generated-docs/journeys/journeys/journeyData/index

echo "../target/generated-docs/website/pages/journeys/ BEFORE copy of generated-docs/journeys"
printf "\n"
ls ../target/generated-docs/website/pages/journeys/
cp -avr ../target/generated-docs/journeys/ ../target/generated-docs/website/pages/journeys/

echo "../target/generated-docs/website/pages/journeys/ AFTER copy of generated-docs/journeys"
ls ../target/generated-docs/website/pages/journeys/



echo "../target/generated-docs/website/pages/journeys/journeyData AFTER copy of generated-docs/journeys"
ls ../target/generated-docs/website/pages/journeys/journeyData
echo "../target/generated-docs/website/pages/journeys/journeys AFTER copy of generated-docs/journeys"
ls ../target/generated-docs/website/pages/journeys/journeys
echo "../target/generated-docs/website/pages/journeys/journeyData/index AFTER copy of generated-docs/journeys"
ls ../target/generated-docs/website/pages/journeys/journeyData/index
echo "End Create Outpu.sh"