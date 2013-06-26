'use strict';

module.exports = function fileValidate (filename, fn) {

  // var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png", ".pdf", ".doc", ".docx"];
  var _validFileExtensions = [".jpg", ".jpeg"]
    , invalidExtensionError = new Error('Invalid File Extension. Allowed extensions are: ' + _validFileExtensions.join(", "))
    , invalidFileError = new Error('Invalid file. Name length is zero.')
    ;
  
  // check filename length property
  if (filename.length > 0) {

    var fileValid = false;
    
    for (var j = 0; j < _validFileExtensions.length; j++) {

      var currentExtension = _validFileExtensions[j];
      
      if (filename.substr(filename.length - currentExtension.length, currentExtension.length).toLowerCase() == currentExtension.toLowerCase()) {
        fileValid = true;
        var fileExt = currentExtension.toLowerCase();
        break;
      }
    }

    if (!fileValid) {
      return fn(invalidExtensionError, null);
    }
    return fn(null, fileExt);
  }
  return fn(invalidFileError, null);
};
