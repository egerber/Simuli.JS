import SynapseModel from './SynapseModel';
import MultiTimestepModel from './MultiTimestepModel';

var modelTypes=new Map();

modelTypes.set("SynapseModel", SynapseModel);
modelTypes.set("MultiTimestepModel", MultiTimestepModel);

export default modelTypes;