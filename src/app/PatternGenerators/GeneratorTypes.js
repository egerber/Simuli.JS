import CellularAutomaton from './CellularAutomaton';
import PeriodicPattern from './PeriodicPattern';

var generatorTypes=new Map();

generatorTypes.set("CellularAutomaton",CellularAutomaton);
generatorTypes.set("PeriodicPattern",PeriodicPattern);

export default generatorTypes;