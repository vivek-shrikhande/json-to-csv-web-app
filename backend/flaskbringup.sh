echo "Bringing up flask server!"

set -e

python3 --version

pip3 --version

pip3 install -r requirements.txt

export FLASK_APP="main.py"

export FLASK_ENV="development"

flask run
