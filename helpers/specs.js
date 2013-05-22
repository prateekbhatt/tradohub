'use strict';

// all specs objects are named after the products' 'url' and must have three properties:
// title, columns and rows

module.exports['aluminum-ingots'] = {
    "title": [
      "The composition is as follows in the table."
    , "Aluminum ingots of lower purity (98.5%, 97% and others) are also available on request."
  ]
  , "columns": [ "Item", "Standard", "Test Result" ]
  , "rows": [
      [ "Al", "99.7MIN", "99.7"]
    , [ "Si", "0.10MAX",  "0.10"]
    , [ "Fe", "0.16MAX",  "0.15"]
    , [ "Cu", "0.01MAX",  "0.01"]
    , [ "Mg", "0.03MAX",  "0.03"]
    , [ "Mn", "0.02MAX" , "0.015"]
    , [ "Zn", "0.03MAX",  "0.03"]
    , [ "Ti", "0.01MAX",  "0.01"]
    , [ "Others", "0.02M", "0.02"]
  ]
}

module.exports['copper-cathodes'] = {
    "title": []
  , "columns": [ "Element", "Symbol", "Value" ]
  , "rows": [
      [ 'Copper', 'Cu', '99% Min.' ]
    , [ 'Cobalt', 'Co', '0.2ppm Max.' ]
    , [ 'Lead', 'Pb', '0.2ppm Max.' ]
    , [ 'Iron', 'Fe', '2ppm Max.' ]
    , [ 'Aluminum', 'Al', '0.5ppm Max.' ]
    , [ 'Manganese', 'Mn', '0.1ppm Max.' ]
    , [ 'Nickel', 'Ni', '0.2ppm Max.' ]
    , [ 'Antimony', 'Sb', '0.1ppm Max.' ]
    , [ 'Arsenic', 'AS', '0.1ppm Max.' ]
    , [ 'Silica', 'Si', '0.3ppm Max.' ]
    , [ 'Bismuth', 'Bi', '0.1ppm Max.' ]
    , [ 'Tellurium', 'Te', '0.05ppm Max.' ]
    , [ 'Silver', 'Ag', '10ppm Max.' ]
    , [ 'Selenium', 'Se', '0.3ppm Max.' ]
    , [ 'Sulphur', 'S', '4ppm Max.' ]
    , [ 'Magnesium', 'MG', '0.4ppm Max.' ]
    , [ 'Oxygen', 'O2', '0' ]
  ]
}


module.exports['copper-rods'] = {
    "title": []
  , "columns": [ 'Size', 'Diameter', 'Ovality', 'Elec. Conductivity', 'Elongation', 'Residual Oxide Film', 'Oxygen, ppm', 'Coil ID/OD', 'Coil Weight' ]
  , "rows": [
      [ '8 mm.', '8mm+-0.38mm', '+-0.38mm', '>100% IACS',  '>30%', '<1000 Ao', '200-550', '928/1432', '2.25T/1T' ]
    , [ '11 mm.', '11mm+-0.38mm', '+-0.38mm', '>100% IACS',  '>30%', '<1000 Ao', '<400', '928/1432', '2.25T/1T' ]
    , [ '12.5 mm.', '12.5mm+-0.38mm', '+-0.38mm', '>100% IACS',  '>30%', '<1000 Ao', '<350',  '9287/1432', '2.25T/1T' ]
    , [ '16 mm.', '16mm+-0.38mm', '+-0.38mm', '>100% IACS',  '>30%', '<1000 Ao', '<350', '928/1432', '2.25T/1T' ]
  ]
}