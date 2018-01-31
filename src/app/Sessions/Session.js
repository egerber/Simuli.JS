import Monitor from 'variable-monitor';
import modelTypes from '../Models/ModelTypes';
import generatorTypes from '../PatternGenerators/GeneratorTypes';
import unitTypes from '../Unit/UnitTypes';

export default class Session{

	constructor({
		name="session",
		iterations=1000,
		generator=null,
		components=null,
		model=null,
		monitor=null,
		seed=null,
	}){
		
		this.name=name;
		
		var generator_type=generatorTypes.get(generator.type);
		var model_type=modelTypes.get(model.type);

		var generator=new generator_type(generator.args);
		var model=new model_type(model.args); //needs to be defined as var first in order to resolve eval() expressions from monitor
		this.monitor=new Monitor(name);
		
		//adding logged variables to monitor
		for(let monitor_var of monitor){
			let var_reference ={
				name:monitor_var.name,
				obj:eval(monitor_var.obj),
				prop:monitor_var.prop,
				interval:monitor_var.interval,
				type:monitor_var.type,
				aggregation_func: eval(monitor_var.aggregation_func)
			};

			this.monitor.add(var_reference);
		}

		//create unit prototypes
		if(components!==null){
			for(var unit_name in components){
				var unit_type=unitTypes.get(unit_name);
				if(unit_type!==undefined){
					unit_type.create_prototype(components[unit_name]);
				}
			}
		}

		this.generator=generator;
		this.model=model;

		this.run(iterations);

	}

	run(iterations){

		for(let i=0;i<iterations;i++){
			var row_pattern = this.generator.next_row();
			this.monitor.tick();
        	var prediction = this.model.predict(row_pattern); 
        }
	}

	get data(){
		return this.monitor.dataset;
	}


}