BASEDIR=$(dirname "$0")
cd $BASEDIR/../
for d in $(find solutions -name 'target'); do 
    rsync -av $d'/generated-docs/' './target/generated-docs/'$(echo $d | sed s#/target#/#)
    rm -r $d
done

for d in $(find target -name '.flattened-pom.xml'); do 
    rm $d
done

rm target/generated-docs/solutions/solution-pom.xml
rm -r target/generated-docs/scripts

body='</body>'
bodyRep='<script src="index.js"></script></body>';
sed -i "s#$body#$bodyRep#" "target/generated-docs/index.html";

head='</head>'
headRep='<link rel="stylesheet" href="index.css"></head>';
sed -i "s#$head#$headRep#" "target/generated-docs/index.html";

node scripts/fixImages.js target/generated-docs/solutions

node scripts/createSolutions.js target/generated-docs/solutions target/generated-docs/solutions.json 500
node scripts/createTags.js solutions target/generated-docs/tags.json
node scripts/createIndex.js target/generated-docs/solutions .html target/generated-docs/docs-json.json target/generated-docs/index.json