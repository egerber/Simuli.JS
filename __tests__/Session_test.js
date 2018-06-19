import Session from '../src/Session/Session';
import ComponentManager from '../src/Manager/ComponentManager';
import _ from 'lodash';

describe("Session", function(){

	it("Initialize",function(){
		let session=new Session();
	});

	it("Initialize System", function(){

		let my_comp_schema={
			compute_output:(inputs,state)=>_.sum(inputs)
		};

		let system_schema={
			init_state:{var1:10},
			init:function(state){
				let new_components=state.members.add("my_component",3,"my_group");
				let input_cons=new_components.input_connections("feedforward");
				input_cons.remove();
			}
		};

		let session=new Session()
		.schema("my_component",my_comp_schema)
		.system(system_schema)
		.run(10);

	});

})