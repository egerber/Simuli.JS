import Input from './Input';
import Synapse from './Synapse';
import Integrator from './Integrator';

var unitTypes=new Map();

unitTypes.set("Input",Input);
unitTypes.set("Synapse", Synapse);
unitTypes.set("Integrator", Integrator);

export default unitTypes;