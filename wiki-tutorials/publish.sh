#!/bin/bash

cd repo
git add -A
git config user.email "devonfw"
git config user.name "devonfw"
git commit -m "Updated tutorials"
git pull --rebase origin/master
git push