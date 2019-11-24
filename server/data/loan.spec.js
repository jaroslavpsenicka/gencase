module.exports = {  
  nameFormat: "{{clientName}}'s loan",
	descriptionFormat: '{{loanAmount}} CZK',
  overviewFormat: [{
    id: 'created',
    name: 'Created',
    value: '{{dateFormat createdAt "DD. MM YYYY"}} by {{createdBy}}' 
  }],
  entities: [{
    name: 'Base',
    description: 'Basic loan model.',
    attributes: [{
      type: "String",
      name: "caseId",
      id: true
    }, {
      type: "String",
      name: "clientName",
      input: true,
      notEmpty: true
    }, {
      type: "PersonalId",
      name: "personalId",
      input: true,
      notEmpty: true
    }, {
      type: "Number",
      name: "loanAmount",
      input: true,
      notEmpty: true,
      min: 1000,
      max: 1000000
    }, {
      type: "Number",
      name: "clientIdentificationStatus",
      options: [{ 
        key: 0, value: "Not idenfified"
      }, {
        key: 1, value: "Idenfified"
      }, {
        key: 2, value: "Idenfification aborted"
      }, {
        key: 3, value: "Idenfification failed"
      }]
    }, {
      type: "String",
      name: "clientId"
    }]
  }, {
    name: 'Approval',
    description: 'Loan approval model.',
    extends: 'Base',
    attributes: [{
      type: "String",
      name: "approvalBy"
    }, {
      type: "Date",
      name: "approvalAt"
    }, {
      type: "Number",
      name: "approvalStatus",
      options: [{ 
        key: 0, value: "Not yet done"
      }, {
        key: 1, value: "Approved"
      }, {
        key: 2, value: "Not approved"
      }, {
        key: 3, value: "Approval aborted"
      }, {
        key: 4, value: "Approval failed"
      }]
    }, {
      type: "String",
      name: "4eyesBy"
    }, {
      type: "Date",
      name: "4eyesAt"
    }, {
      type: "Number",
      name: "4eyesStatus",
      options: [{ 
        key: 0, value: "Not yet done"
      }, {
        key: 1, value: "Approved"
      }, {
        key: 2, value: "Not approved"
      }, {
        key: 3, value: "Approval aborted"
      }, {
        key: 4, value: "Approval failed"
      }]
    }]
  }],
  phases: [{
    name: 'Request and identification',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel massa tempor, eleifend erat non, euismod dolor. Cras non nibh mauris. In dapibus nunc in tortor vestibulum, nec fermentum nulla tincidunt. In et tincidunt erat, a laoreet mauris.',
    initial: true,
    dataModel: 'Base' 
  }, {
    name: 'Approval',
    description: 'In ac lobortis augue, eget dictum nisi. Morbi vitae iaculis mauris, viverra scelerisque lectus. Nam vulputate sit amet purus et facilisis.',
    dataModel: 'Approval' 
  }, {
    name: 'Completion',
    description: 'In tristique diam quis dolor suscipit, nec commodo quam venenatis. Proin odio erat, blandit vitae est in, commodo vehicula odio. Integer fermentum cursus felis, vel ornare orci sodales et. Praesent condimentum ipsum tellus, non tristique tellus maximus in.',
    dataModel: 'Approval' 
  }]
};