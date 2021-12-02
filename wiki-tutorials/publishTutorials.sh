#!/bin/bash
# start after the folder playbooks is created in the current repository
cd playbooks
SPECIFIED_TUTORIALS=()
for dir in */; do SPECIFIED_TUTORIALS+=("${dir::-1}"); done
echo "SPECIFIED_TUTORIALS:\n"
printf "%s\n" "${SPECIFIED_TUTORIALS[@]}"
# switches to tutorials repository https://github.com/devonfw-tutorials/tutorials

mkdir -p tutorials 
cd ../repo/tutorials
ONLINE_TUTORIALS=()
for dir in */; do ONLINE_TUTORIALS+=("${dir::-1}"); done
echo "ONLINE_TUTORIALS:\n"
printf "%s\n" "${ONLINE_TUTORIALS[@]}"

# delete tutorials, which are not specified anymore
for tutorial in "${ONLINE_TUTORIALS[@]}"; do
  if [[ ! " ${SPECIFIED_TUTORIALS[@]} " =~ " ${tutorial} " ]]; then
      rm -rf "${tutorial}"
      echo "deleted ${tutorial} as not specified anymore in tutorials repository"
  fi
done

# switches to tutorials compiler repository https://github.com/devonfw-tutorials/tutorial-compiler (build/output/wiki)
cd ../build/output/wiki
GENERATED_TUTORIALS=()
for dir in */; do GENERATED_TUTORIALS+=("${dir::-1}"); done
echo "GENERATED_TUTORIALS:\n"
printf "%s\n" "${GENERATED_TUTORIALS[@]}"
# back to tutorials compiler repository
cd ../../..

# delete tutorials, which are newly generated
for tutorial in "${ONLINE_TUTORIALS[@]}"; do
  if [[ ! " ${GENERATED_TUTORIALS[@]} " =~ " ${tutorial} " ]]; then
      rm -rf repo/"${tutorial}"
      echo "deleted ${tutorial} as this is up to be replaced by the build"
  fi
done

#copy all files from * in repo/tutorials (https://github.com/devonfw-tutorials/wiki-tutorials/tutorials)
cp -r build/output/wiki/*/ repo/tutorials
cd repo/
git add -A
git config user.email "devonfw"
git config user.name "devonfw"
git commit -m "Updated tutorials"
git pull --rebase origin/master
git push
