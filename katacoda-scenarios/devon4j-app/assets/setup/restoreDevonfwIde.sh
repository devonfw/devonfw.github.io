#!/bin/sh

mkdir devonfw
cd devonfw

mkdir -p /root/.devon/
touch /root/.devon/.license.agreement
echo "you accepted the devonfw-ide License.https://github.com/devonfw/ide/blob/master/documentation/LICENSE.asciidoc" >> /root/.devon/.license.agreement

wget -c https://bit.ly/2BCkFa9 -O - | tar -xz

bash setup /root/devonfw-settings/settings.git
