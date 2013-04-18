/*
Data regarding terms such as shipping terms and payment terms are defined here.
*/

// Requirement due date options

exports.reqDue = [15, 30, 45]

exports.shippingTerms = {
    'FOB': 'description of shipping A'
  , 'CIF': 'description of B'
  , 'EX WORKS': 'description of C'
}

exports.paymentTerms = {
    'TT': 'description of payment A'
  , 'LC at Sight': 'description of B'
  , 'LC at destination': 'description of C'
  , 'Usuance LC': 'description of D'
}


exports.originCountries = {
    IND: 'India'
  , CHN: 'China'
}