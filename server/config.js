module.exports = {
	database: { 
		url: process.env.MONGODB_URL || "mongodb://localhost:27017/datacase" 
	},
	elasticsearch: { 
		url: process.env.ELASTICSEARCH_URL || "http://localhost:9092/datacase" 
	},
	morgan: {
		enabled: false,
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
	},
	jwt: {
		secret: process.env.JWT_SECRET || "qwertyuiopasdfghjklzxcvbnm123456"
	},
	errors: {
		"Argument passed in must be a single String of 12 bytes or a string of 24 hex characters": {
			status: 400,
			message: "argument not valid"
		}
	},
	swagger: {
    basedir: __dirname, 
    files: ['./routes/**/*.js'],
		swaggerDefinition: {
			info: {    
				title: "DataCase API",
				version: "0.1.0"
			}
		}
	}
};