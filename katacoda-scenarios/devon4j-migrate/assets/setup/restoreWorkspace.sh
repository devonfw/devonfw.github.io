#!/bin/bash 

if true; then
    rm -r /root/devonfw/workspaces 
fi

if ! git clone https://github.com/devonfw-tutorials/workspace-devon4j-migrate.git /root/devonfw/workspaces; then
    git clone https://github.com/devonfw-tutorials/workspace-devon4j-migrate.git /root/devonfw/workspaces 
fi

cd /root/devonfw/workspaces
git checkout  || true
cd ~/.
