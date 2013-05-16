module.exports = function fileValidate (file) {
  'use strict';
  var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png", ".pdf", ".doc", ".docx"];
  if (file.length > 0) {
    var fileValid = false;
    for (var j = 0; j < _validFileExtensions.length; j++) {
      var sCurExtension = _validFileExtensions[j];
      if (file.substr(file.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
        fileValid = true;
        var fileExt = sCurExtension.toLowerCase();
        break;
      }
    }
    if (!fileValid) {
      // alert("Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", "));
      return false;
    }
    return fileExt;
  }
  return false;
};
