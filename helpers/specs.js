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
    "title": [
      'Copper Cathodes Grade A (Electrolytic Copper Grade)'
    , 'LME OR NON-LME AS PER REQUIREMENTS '
    , 'Dimension: 914mm x 914mm x 12mm (LME Standard)'
    , 'Weight of each sheet: 125kgs (+/- 1%) '
    , 'Net weight of each pallet: 2MTS (+/- 1%) '
    , 'Min. weight in each container:  20MTS approx.'
    , 'Gross weight of each container: 22.20MTS Approx.'
    , 'Packing:  Palletized banded by aluminum bands'
  ]
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

module.exports['polyethylene-pe'] = {
    "title": []
  , "columns": [ 'Type', 'Use' ]
  , "rows": [
      [ 'HDPE', 'Grades specially designed to meet demanding applications like high-pressure pipes, telecom ducts, carrier bags, woven sacks, and injection and blow moulded products.' ]
    , [ 'Octene & Butene grade LLDPE', 'Grades used extensively in specialty films, milk & edible oil packaging, lamination films, cast films, stretch films and other applications like rotational moulding and injection moulded products.' ]
    , [ 'LDPE', 'Grades find extensive use in heavy-duty films, lamination films, extrusion coating & moulding applications.' ]
  ]
}

module.exports['polypropylene-pp'] = {
    "title": ['Our main 3 grades of PP are given in the table that follows.']
  , "columns": [ 'Type', 'Use' ]
  , "rows": [
      [ 'Homopolymer', 'Available in a wide range of melt flows. Carefully designed to suit the requirements of various applications like injection and blow moulding, IPP and BOPP films, woven sacks, FIBC and fibres.' ]
    , [ 'Random Copolymer', 'Grades designed to meet critical requirements of injection and blow moulded clear containers, pipes and fittings and ISBM bottles.' ]
    , [ 'Impact Copolymer', 'Grades tailored to meet the requirements of various applications like automotive, appliances, furniture, paint pails, caps and closures, luggage, crates and compounding.' ]
  ]
}

module.exports['polyvinyl-chloride-pvc'] = {
    "title": ['Grades of PVC find application in various industries as given in the table below.']
  , "columns": [ 'Industry', 'Products' ]
  , "rows": [
      [ 'Agriculture', '(rigid pipes and fittings, flexible tubes, hoses)']
    , [ 'Building & Construction', '(doors, windows, partitions / floor / wall coverings)']
    , [ 'Packaging', '(bottles & containers, blister packaging)']
    , [ 'Electricals& Electronics', '(wires, cables, electrical conduits)']
    , [ 'HealthCare', '(blood bags, tubing, heart catheters, IV fluid bags)']
    , [ 'Consumer Goods', '(toys, sports goods and footwear)']
  ]
}