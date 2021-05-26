#!/bin/sh

mkdir /root/devonfw-settings/
cd /root/devonfw-settings/

git clone https://github.com/devonfw/ide-settings.git settings

TOOLS="DEVON_IDE_TOOLS=(java)"
echo $TOOLS > settings/devon.properties

NPM_CONFIG="unsafe-perm=true"
echo $NPM_CONFIG >> settings/devon/conf/npm/.npmrc

mv /root/devonfw-settings/settings/ /root/devonfw-settings/settings.git

cd /root/devonfw-settings/settings.git
git add -A
git config user.email "devonfw"
git config user.name "devonfw"
git commit -m "devonfw"
