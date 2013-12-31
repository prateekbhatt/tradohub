/*
Data regarding terms such as shipping terms and payment terms are defined here.
*/

// Requirement due date options

module.exports.reqDue = [15, 30, 45]

module.exports.paymentTerms = {
    'RTGS': 'description of payment A'
  , 'Demand Draft': 'description of D'
}

module.exports.tradohubBank = {
    name: 'SAMPLE_BANK'
  , accName: 'COMPANY_NAME'
  , address: 'COMPANY_ADDRESS'
  , accNo: 'ACCOUNT_NUMBER'
  , ifscCode: 'BANK_IFSC_CODE'
}


module.exports.industry = [
  'Metals', 'Polymers', 'Engineering Plastics', 'Chemicals', 'Construction',
  'Food Processing'
];

module.exports.states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];