class Editor {
  constructor() {
    this.jsonEditor = ace.edit("editor-main-json");
    this.jsonEditor.setTheme("ace/theme/github");

    // remove the vertical ruler
    this.jsonEditor.setShowPrintMargin(false);
    this.jsonEditor.session.setMode("ace/mode/json");

    this.setErrorCheckCallback();
    this.setKeyBindings();

    this.isConverting = false;
    this.isIntented = false;
    this.currentResponseData = '';
    this.xhttp = new XMLHttpRequest();
  }

  setErrorCheckCallback() {
    this.jsonEditor.session.on("changeAnnotation", () => {
      for (const annotation of this.jsonEditor.session.getAnnotations()) {
        if (annotation.type === "error") {
          document.getElementById("button-convert").disabled = true;
          document.getElementById("button-indent").disabled = true;
          return;
        }
      }
      document.getElementById("button-convert").disabled = false;
      document.getElementById("button-indent").disabled = false;
    });
  }

  indent() {
    let value = JSON.parse(this.jsonEditor.getValue());
    if (this.isIndented) {
      value = JSON.stringify(value)
    } else {
      value = JSON.stringify(value, null, 4);
    }
    this.jsonEditor.setValue(value, 1);
    this.isIndented = !this.isIndented;
  }

  setKeyBindings() {
    this.jsonEditor.commands.addCommand({
      name: "Convert",
      bindKey: { win: "Ctrl-enter", mac: "Command-enter" },
      exec: () => {
        this.performAction();
      }
    });

    // Toggle Indentation
    this.jsonEditor.commands.addCommand({
      name: "Toggle Indentation",
      bindKey: { win: "Ctrl-I", mac: "Command-I" },
      exec: () => {
        this.indent();
      }
    });
  }

  islargeInput(input) {
    let inputSize = new Blob([input]).size;
    if (inputSize > MAX_INPUT_SIZE) {
      return true;
    } else {
      return false;
    }
  }

  performAction() {
    if (this.isConverting) {
      this.cancel();
    } else {
      this.convert();
    }
  }

  convert() {
    this.isConverting = true;
    document.getElementById("button-convert").textContent = "Cancel";

    try {
      let jsonInput = this.jsonEditor.getValue();

      if (this.islargeInput(jsonInput)) {
        document.getElementById("editor-main-csv-table").innerHTML = '<pre id="status-box">Content size (' + Math.round(inputSize / 10000) / 100 + ' MB) exceeds the allowed limit (2.56 MB)</pre>';
        return;
      }

      document.getElementById("editor-main-csv-table").innerHTML = '<pre id="status-box">Converting...</pre>';

      this.xhttp.onreadystatechange = (function () {

        if (this.xhttp.readyState == 4) {
          if (this.xhttp.status == 200) {  // when request is successfull

            this.currentResponseData = this.xhttp.responseText;

            let responseObject = JSON.parse(this.currentResponseData);
            let fieldNames = responseObject.field_names
            let rows = responseObject.rows
            let tableText = "<table id='output-table'>"

            if (fieldNames.length > 0) {
              // Put header
              tableText += "<tr>"
              tableText += "<th>Row</th>";

              fieldNames.forEach(element => {
                tableText += "<th>" + element + "</th>";
              });
              tableText += "</tr>";

              let lineNo = 1
              rows.forEach(row => {

                // Start a row
                tableText += "<tr>"
                tableText += "<td>" + lineNo + "</td>";

                lineNo++;

                // For each field name
                fieldNames.forEach(fieldName => {
                  // If field name key is present in row
                  if (row.hasOwnProperty(fieldName)) {
                    // Then put the value of that field name in <td>
                    tableText += "<td>" + row[fieldName] + "</td>";
                  } else {
                    // Else put nothing in <td>
                    tableText += "<td></td>";
                  }
                });
                // End the row
                tableText += "</tr>"
              });
            }
            tableText += '</table>';
            document.getElementById("editor-main-csv-table").innerHTML = tableText;
            document.getElementById("editor-button-panel-button-download").disabled = false;

          } else if (this.xhttp.status == 0) {  // when the request is aborted
            document.getElementById("editor-button-panel-button-download").disabled = true;
            document.getElementById("editor-main-csv-table").innerHTML = '';
            this.currentResponseData = null;

          } else {  // server side error
            let errorMessage;
            try {
              errorMessage = JSON.stringify(JSON.parse(this.xhttp.responseText), null, 4);
            } catch (error) {
              errorMessage = this.xhttp.responseText
            } finally {
              document.getElementById("editor-main-csv-table").innerHTML = '<pre style="margin: 0px; padding-left: 10px; padding-right: 10px; font-size: 12px;">' + errorMessage + '</pre>';
              document.getElementById("editor-button-panel-button-download").disabled = true;
              this.currentResponseData = null;
            }
          }

          // conversion is done
          this.isConverting = false;
          document.getElementById("button-convert").textContent = "Convert";
        }
      }).bind(this);

      this.xhttp.open("POST", CONVERT_URL, true);
      this.xhttp.setRequestHeader("Content-Type", "application/json");
      this.xhttp.send(jsonInput);

    } catch (error) {
      this.isConverting = false;
      document.getElementById("editor-main-csv-table").innerHTML = error.message;
      document.getElementById("button-convert").textContent = "Convert";
    }
  }

  cancel() {
    this.xhttp.abort();
    this.isConverting = false;
    document.getElementById("button-convert").textContent = "Convert";
  }

  download() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var downloadUrl = URL.createObjectURL(xhttp.response);
        var fileName = xhttp.getResponseHeader('Content-Disposition').split('"')[1];
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = downloadUrl;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }
    }
    xhttp.open("POST", DOWNLOAD_URL, true);
    xhttp.responseType = "blob";
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(this.currentResponseData);
  }
}

let editor = new Editor();