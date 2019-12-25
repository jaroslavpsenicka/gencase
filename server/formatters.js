const Hashids = require('hashids/cjs');
const Handlebars = require('handlebars');
const HandlebarsDateFormat = require('handlebars-dateformat')

Handlebars.registerHelper('dateFormat', HandlebarsDateFormat);

const toObject = (map) => {
	const obj = {};
	map.forEach((v,k) => { obj[k] = v });
	return obj;
}

const toArray = (obj) => {
	const arr = [];
	Object.keys(obj).forEach(k => arr[k] = obj[k]);
	return arr;
}

const formatCaseList = (caseObject, model) => {
	return {
		...caseObject._doc,
		data: undefined, 
		name: model.nameFormat ? formatValue(model.nameFormat, caseObject) : caseObject.name,
		description: model.descriptionFormat ? formatValue(model.descriptionFormat, caseObject) : caseObject.description
	}
}

const formatCaseMetadata = (caseObject, model) => {
	return {
		...formatCaseList(caseObject, model),
		detail: model.detailFormat ? formatCaseDetail(caseObject, model) : []
	}
}

const formatCaseData = (caseObject, model) => {
	return toObject(caseObject.data);
}

const formatCaseOverview = (caseObject, model) => {
	return model.overviewFormat.map(f => {
		return {
			name: f.name,
			value: f.value && f.value.indexOf('{{') > -1 ? 
				Handlebars.compile(f.value)({...caseObject._doc, data: toObject(caseObject.data)}) : 
				caseObject[f.value]
		}
	});
}

const formatProcessUrl = (caseObject, url) => {
  return formatValue(url, caseObject);
}

const formatProcessBody = (caseObject, payload) => {
  const body = {};
 	Object.keys(payload).forEach(k => body[k] = formatValue(payload[k], caseObject));
	return body;
}

const formatCaseDetail = (caseObject, model) => {
	return model.detailFormat.map(f => {
		return {
			name: f.name,
			value: f.value && f.value.indexOf('{{') > -1 ? 
				Handlebars.compile(f.value)({...caseObject._doc, data: toObject(caseObject.data)}) : 
				caseObject[f.value]
		}
	});
}

const formatValue = (format, caseObject) => {
	return Handlebars.compile(format)({...caseObject._doc, data: toObject(caseObject.data)});
}

const formatObject = (format, object) => {
	return Handlebars.compile(format)(object);
}

module.exports = {
	toObject,
  formatCaseList, formatCaseData, formatCaseMetadata, formatCaseOverview,
  formatProcessUrl, formatProcessBody, formatObject
} 