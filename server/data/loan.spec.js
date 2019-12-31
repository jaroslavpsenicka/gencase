/*
	Loan model

		States:

		| request   				| approval		| completion	 		|
		| ------------------+-------------+---------------- |
		| - new	<n>						- basic				- approved <f>	|
		| - identification		- 4eyes				- rejected <f>	|

		- request phase
			- new state (initial, created via REST)
				- unconditional transition to identification [human task] 
			- identification state (triggered by event)
				- transition to approval phase when identified [human task] 
				- transition to completion phase when cannot be identified [email task]
		- approval phase
			- basic approval state (inital)
				- transition to 4eyes state when approved [human task]
				- transition to completion phase when rejected [email]
			- 4eyes state	
				- transition to completion phase when approved [email]	
				- transition to completion phase when rejected [email]	
		- completion phase
			- approved state (final)
			- rejected state (final)

*/

module.exports = {  
  name: 'Test',
  nameFormat: "{{data.clientName}}'s loan",
	descriptionFormat: 'Lovely {{data.loanAmount}} CZK',
  overviewFormat: [{
    name: 'Loan amount',
    value: '{{data.loanAmount}} CZK' 
  }, {
    name: 'Created',
    value: '{{dateFormat createdAt "DD. MM YYYY"}} by {{createdBy}}' 
  }],
  detailFormat: [{
    name: 'Client',
    value: '{{data.clientName}}, {{data.personalId}}'
  }, {
    name: 'Loan amount',
    value: '{{data.loanAmount}} CZK'
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
      type: "Number",
      name: "moneyCheckStatus",
      default: 0,
      options: [{ 
        key: 0, value: "Not checked"
      }, {
        key: 1, value: "Checked"
      }, {
        key: 2, value: "Check aborted"
      }, {
        key: 3, value: "Check failed"
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
  states: {
    init: 'new',
    transitions: [{ 
      name: 'check', 
      label: 'fund check',
      from: 'new', 
      to: 'new',
      when: 'data.loanAmount > 500',
      url: 'http://localhost:8082/check',
      request: {
        caseId: '{{id}}',
        callbackUrl: 'http://localhost:8080/api/cases/{{id}}/actions/check/callback',
        amount: '{{data.loanAmount}}'
      }, 
      response: {
        data: {
          moneyCheckStatus: "{{result}}"
        }
      } 
    }, { 
      name: 'identification', 
      label: 'identification',
      from: 'new', 
      to: 'identification',
      url: 'http://localhost:8082/identify',
      request: {
        caseId: '{{id}}',
        callbackUrl: 'http://localhost:8080/api/cases/{{id}}/actions/identification/callback',
        client: '{{data.clientName}}',
        pid: '{{data.personalId}}',
        amount: '{{data.loanAmount}}'
      },
      response: {
        data: {
          "clientId": "{{cid}}"
        }
      } 
    }, { 
      name: 'toBasicApproval',
      label: 'approval',
      style: 'warning', 
      from: 'identification', 
      to: 'basicApproval' 
    }, { 
      name: 'cancelBasicApproval', 
      from: 'basicApproval', 
      to: 'identification' 
    }]
  },
  phases: [{
    name: 'Request and identification',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel massa tempor, eleifend erat non, euismod dolor. Cras non nibh mauris. In dapibus nunc in tortor vestibulum, nec fermentum nulla tincidunt. In et tincidunt erat, a laoreet mauris.',
    initial: true,
    states: ['new', 'identification'],
    dataModel: 'Base' 
  }, {
    name: 'Approval',
    description: 'In ac lobortis augue, eget dictum nisi. Morbi vitae iaculis mauris, viverra scelerisque lectus. Nam vulputate sit amet purus et facilisis.',
    states: ['basicApproval'],
    dataModel: 'Approval' 
  }, {
    name: 'Completion',
    description: 'In tristique diam quis dolor suscipit, nec commodo quam venenatis. Proin odio erat, blandit vitae est in, commodo vehicula odio. Integer fermentum cursus felis, vel ornare orci sodales et. Praesent condimentum ipsum tellus, non tristique tellus maximus in.',
    states: [],
    dataModel: 'Approval' 
  }]
};