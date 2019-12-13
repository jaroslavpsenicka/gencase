module.exports = {
	database: { 
		url: "mongodb://localhost:27017/datacase" 
	},
	elasticsearch: { 
		url: "http://localhost:9092/datacase" 
	},
	morgan: {
		enabled: true,
		options: {
			theme: 'dimmed'
		}
	},
	log4js: {
		appenders: { 
			console: { 
				type: 'stdout',
				layout: { 
					type: "colored" 
				} 
			}
		},
		categories: { 
			default: { 
				appenders: ['console'], 
				level: process.env.LOG_LEVEL || 'debug' 
			}
		}
	},
	express: {
		level: 'info',
		format: (req, res, format) => format(`:remote-addr :method :url ${JSON.stringify(req.body)} - :status`),
		statusRules: [{ from: 200, to: 399, level: 'info' }, { from: 400, to: 599, level: 'warn' }]
	}
};