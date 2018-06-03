import Input from './Input';
import Synapse from './Synapse';
import Integrator from './Integrator';
import Component from './Component';
import PatternGenerators from './PatternGenerators/PatternGenerators';
import PeriodicPattern from './PatternGenerators/PeriodicPattern';
import Network from './Networks/Network';

let Components={
	"Input":Input,
	"Synapse":Synapse,
	"Integrator":Integrator,
	"Component":Component,
	"PatternGenerators":PatternGenerators, //Useful?
	"PeriodicPattern":PeriodicPattern,
	"Network":Network
};

export default Components;