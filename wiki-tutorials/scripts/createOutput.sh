BASEDIR=$(dirname "$0")
cd $BASEDIR/../

for d in $(find tutorials -name 'target'); do
	cp -arv $d'/generated-docs/.' './target/generated-docs/'$(echo $d | sed "s:/target::g" | sed "s:/generated-docs::g")
	rm -r $d
done

for d in $(find target -name 'flattened-pom.xml'); do 
    rm $d
done

rm -r target/generated-docs/scripts

body='</body>'
bodyRep='<script src="index.js"></script></body>';
sed -i "s#$body#$bodyRep#" "target/generated-docs/index.html";

head='</head>'
headRep='<link rel="stylesheet" href="index.css"></head>';
sed -i "s#$head#$headRep#" "target/generated-docs/index.html";

node scripts/createTutorials.js target/generated-docs/tutorials.json
node scripts/createTags.js target/generated-docs/tags.json
node scripts/createIndex.js target/generated-docs/docs.json target/generated-docs/index.json
