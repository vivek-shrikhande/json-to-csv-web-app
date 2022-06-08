set -e

# remove previous deployment zip
rm -rf package aws-lambda-deployment-package.zip

# install dependencies into package dir
pip install --target ./package json-flat

# create a zip containing dependencies (execute cd in subshell for neat flow)
(cd package && zip -r ../aws-lambda-deployment-package.zip .)

# add source code to the generated zip
zip -g aws-lambda-deployment-package.zip awslambda.py converter.py
