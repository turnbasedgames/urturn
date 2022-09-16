#!/bin/bash
# Takes jq filter that acts like a predicate function and exits non-zero if any package.json does not result in "true" for that jq filter.
# We can use this to run checks on all packages in our monorepo.

# Examples:
#
# Exit non-zero if any packages don't have the lint script defined
# ./every-package-json.sh ".script.lint == null"
# 
# Exit non-zero if any packages have over 10 scripts defined
# ./every-package-json.sh ".script | length >= 10"

JQ_FILTER=$1

for package in $(npx lerna list -l -a --ndjson --loglevel error | jq -r .location)
do
  if [[ $(jq "${JQ_FILTER}" < "${package}/package.json") != "true" ]]
  then
    echo "ERROR: Packege ${package} has an invalid package.json file which failed the json filter: ${JQ_FILTER}"
    exit 1
  fi
done 

exit 0
