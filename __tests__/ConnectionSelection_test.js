import ComponentSelection from '../src/Selection/ComponentSelection';
import Session from '../src/Session/Session';
import ConnectionManager from '../src/Manager/ConnectionManager';

describe("ConnectionSelection",function(){

	let session=new Session()
	.schema("component",{})
	.system({})

	let system_state=session.components[0].state;

	it("remove",function(){
		let new_components=system_state.members.add("component",3,"remove");

		new_components.connect({target:new_components, delayed:true,mapping:(i,j)=>i==j,type:"feedforward"});

		new_components.input_connections("feedforward").remove();
		expect(new_components.input_connections("feedforward").length).toBe(0);

	});

	it("apply",function(){
		let new_components1=system_state.members.add("component",3,"remove",{init_state:{count_connections:0}});
		let new_components2=system_state.members.add("component",3,"remove",{init_state:{count_connections:0}});
		new_components1.connect({target:new_components2, delayed:true,mapping:(i,j)=>i==j,type:"feedforward"});

		let input_connections=new_components2.input_connections("feedforward");
		input_connections.apply((state_source,state_target)=>state_source.count_connections=1);
		expect(new_components1._selected_states.map(state=>state.count_connections)).toEqual([1,1,1]);
		expect(new_components2._selected_states.map(state=>state.count_connections)).toEqual([0,0,0]);
		
	});

	it("filter",function(){
		let new_components1=system_state.members.add("component",3,"remove",{init_state:{count_connections:0}});
		let new_components2=system_state.members.add("component",3,"remove",{init_state:{count_connections:0}});

		for(let component of new_components1){
			component.apply(state=>state.marked=true);
			break; //mark the first element
		}

		new_components1.connect({target:new_components2, delayed:true,mapping:(i,j)=>i==j,type:"feedforward"});
	 	let filtered=new_components2.input_connections("feedforward").filter( (state_source,state_target)=>state_source.marked);
	 	
		expect(filtered.length).toBe(1);

	});

	it("max",function(){

	});


});