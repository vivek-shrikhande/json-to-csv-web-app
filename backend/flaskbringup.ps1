Write-Output "Bringing up flask server!";

$env:FLASK_ENV = "development";
iex "flask run";
