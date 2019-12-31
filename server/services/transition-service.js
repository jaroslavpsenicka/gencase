const StateMachine = require('javascript-state-machine');
const log4js = require('log4js');
const vm = require('vm');

const config = require('../config');
const Formatter = require('../formatters');

const logger = log4js.getLogger('transition-service')

const UPDATABLE_PROPERTIES = config.cases.updatableProperties;

/**
 * Returns list of allowed actions, based on 
 * - running actions
 * - transition conditions (when)
 * @param theCase relevant case
 * @param events list of corresponsing events  
 */
const getActions = (theCase, events) => {
  const runningActions = [];
  events.forEach(e => {
    if (e.type === 'ACTION_STARTED') runningActions.push(e.data.name);
    else runningActions.splice(runningActions.indexOf(e.data.name));
  });

  // calculate all possible transitions, 
  // allow already running actions to cancel 

  const sm = new StateMachine({
    init: theCase.state,
    transitions: theCase.model.spec.states.transitions
  });	
  const transitions = sm.transitions() || [];
  const potentialTransitions = transitions.map(tn => {
    return { 
      ...theCase.model.spec.states.transitions.find(t => t.name === tn),
      cancel: runningActions.includes(tn)
    }
  });

  // filter out already running transitions 
  // and those which do not conform to "when":" condition

  const context = vm.createContext({
    id: theCase.id,
    name: theCase.name,
    data: Formatter.toObject(theCase.data)
  });

  const conformingTransitions = potentialTransitions.filter(t => {
    return t.cancel || (t.when ? evaluate(t.when, context) : true);
  }); 

  // filter out transitions which are reading or writing data
  // of already running ones

  const lockedAttributes = collectLockedAttributes(potentialTransitions.filter(t => t.cancel));
  logger.debug(theCase.id, 'locked attributes:', lockedAttributes);
  return conformingTransitions.filter(t => {
    const foundAttrs = collectRequestAttributes(t).filter(a => lockedAttributes.includes(a));
    const passthrough = t.cancel || !foundAttrs || foundAttrs.length == 0;
    if (!passthrough) logger.debug(theCase.id, 'transition', t.name, 'avoided by:', foundAttrs);
    return passthrough;
  });
}; 

const evaluate = (script, context) => {
  const then = Date.now();
  try {
    const result = vm.runInContext(script, context);
    logger.debug('evaluating', script, 'in context', JSON.stringify(context), '->', result, '(' + (Date.now() - then) + 'ms)');
    return result;
  } catch (err) {
    logger.error('script evaluation failure', script, err);
  }
}

const collectRequestAttributes = (transition) => {
  const attrs = [];
  if (transition.request) {
    const pattern = /[^{]*\{\{([\w+\.]+)\}\}[^}]*/
    Object.keys(transition.request).forEach(a => {
      const match = pattern.exec(transition.request[a]);
      if (match) {
        if (match[1].startsWith('data.') || UPDATABLE_PROPERTIES.includes(match[1])) {
          if (!attrs.includes(match[1])) attrs.push(match[1]);
        }
      }
    });
  }

  return attrs;
}

const collectLockedAttributes = (runningTransitions) => {
  const attrs = [];
  runningTransitions.forEach(t => {
    if (t.response) Object.keys(t.response.data).forEach(a => attrs.push("data." + a))
    collectRequestAttributes(t).forEach(a => attrs.push(a));
  });

  return attrs;
}

/**
 * Decides whether given action can be executed on given case
 * @param theCase 
 * @param actionName  
 */
const canRunAction = (theCase, actionName) => {
  const sm = new StateMachine({
    init: theCase.state,
    transitions: theCase.model.spec.states.transitions
  });	

  const transitions = sm.transitions() || [];
  return (transitions.find(t => t === actionName));
}

module.exports = {
  getActions, canRunAction
}