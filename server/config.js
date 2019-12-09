module.exports = {
	database: { 
		url: "mongodb://localhost:27017/datacase" 
	},
	elasticsearch: { 
		url: "http://localhost:9092/datacase" 
	},
	log4js: {
		appenders: { 
			console: { 
				type: 'console' 
			}
		},
		categories: { 
			default: { 
				appenders: ['console'], 
				level: 'info' 
			}
		}
	}
};