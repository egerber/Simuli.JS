import ComponentSelection from '../src/Selection/ComponentSelection';
import Session from '../src/Session/Session';
import ConnectionManager from '../src/Manager/ConnectionManager';
import _ from 'lodash';


describe("ComponentSelection",function(){

	let session=new Session()
	.schema("component",{})
	.system({})
	.init()
	
	let system_state=session.components[0].state;

	//init few components
	system_state.members.add("component",5,"my_group");

	//modifies state.my_var
	it("Apply", function(){
		system_state.members.select("my_group").apply((state)=>state.my_var=10);
		expect(system_state.members.select("my_group")._selected_states.map(state=>state.my_var)).toEqual([10,10,10,10,10]);
	});

	it("connect feedforward",function(){
		let source=system_state.members.add("component",4,"source",{init_state:{count_connections:0}});
		let target=system_state.members.add("component",4,"target");

		source.connect({
			target:target,
			delayed:true,
			type:"feedforward",
			mapping:(i,j)=>i==j,
			callback_connected:(state_source,state_target)=>state_source.count_connections++
		});

		//callback worked
		expect(source._selected_states.map((state)=>state.count_connections)).toEqual([1,1,1,1]);

		//connections were established correctly
		let connections=[];
		for(let i=0;i<target.length;i++){
			let id=target._selected_ids[i];
			connections=connections.concat(ConnectionManager.get_in_connections(id,"feedforward"));
		}

		expect(connections.map(connection => connection[0])).toEqual(source._selected_ids);
		expect(connections.map(connection => connection[1])).toEqual(target._selected_ids);
		expect(connections.map(connection => connection[2])).toEqual([1,1,1,1]);

	});

	it("connect bidirectional",function(){
		let source=system_state.members.add("component",3,"source_bi",{init_state:{count_connections:0}});
		let target=system_state.members.add("component",3,"target_bi");

		source.connect({
			target:target,
			delayed:true,
			type:"bidirectional",
			mapping:(i,j)=>i==j,
			callback_connected:(state_source,state_target)=>state_source.count_connections++
		});

		//callback worked
		expect(source._selected_states.map((state)=>state.count_connections)).toEqual([1,1,1]);
		expect(source._selected_states.map((state)=>state.count_connections)).toEqual([1,1,1]);
		
		//connections were established correctly
		expect(source.elements.map(el=>el.input_connections("feedback").length)).toEqual(_.fill(Array(source.length),1));
		expect(source.elements.map(el=>el.input_connections("feedforward").length)).toEqual(_.fill(Array(source.length),0));
		expect(target.elements.map(comp=>comp.input_connections("feedforward").length)).toEqual(_.fill(Array(source.length),1));
		expect(target.elements.map(comp=>comp.input_connections("feedback").length)).toEqual(_.fill(Array(source.length),0));

	});

	it("remove",function(){
		//create elements first
		let new_components=system_state.members.add("component",2,"to_be_deleted");
		//check if elements were created
		let ids=new_components._selected_ids.slice();
		expect(ids.map(id=>session.components.hasOwnProperty(id))).toEqual([true,true]);
		//remove elements
		new_components.remove();
		//check if elements were removed
		expect(ids.map(id=>session.components.hasOwnProperty(id))).toEqual([false,false]);
	});

	it("filter",function(){
		let components=system_state.members.add("component",1,"filter",{init_state:{val:10}});
		let i=0;
		for(let component of components){
			if(i==0){
				component.apply(state=>state.val=100);
			}
		}

		let filtered=components.filter(state=>state.val==100)
		expect(filtered.length).toBe(1);
	});

	it("max",function(){
		let components=system_state.members.add("component",9,"max",{init_state:{val:0}});
		components.apply((state,index)=>state.val=index%2*index); //0,1,0,3,0,5,0,7

		let sorted=components.max((state)=>state.val,4);
		expect(sorted._selected_states.map(state=>state.val)).toEqual([7,5,3,1]);
	});

	it("min",function(){
		let components=system_state.members.add("component",9,"min",{init_state:{val:0}});
		components.apply((state,index)=>state.val=index%2*-1*index); //0,-1,0,-3,0,-5,0,-7

		let sorted=components.min((state)=>state.val,4);
		expect(sorted._selected_states.map(state=>state.val)).toEqual([-7,-5,-3,-1]);
	});

	it("sample",function(){
		let components=system_state.members.add("component",9,"sample",{init_state:{val:0}});
		let sample=components.sample(4);

		expect(sample.length).toBe(4);
	});

	it("union",function(){
		let components1=system_state.members.add("component",5,"union");
		let components2=system_state.members.add("component",5,"union");

		let union=components1.union(components2);
		expect(union.length).toBe(10);

		let union_self=components1.union(components1);
		expect(union_self.length).toBe(5);
	})
	

});