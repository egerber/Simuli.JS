import _ from 'lodash';

import Network from '../src/app/Components/Networks/Network';
import Components from '../src/app/Components/ComponentTypes';
import Selector from '../src/app/Selector/Selector';
import Event from '../src/app/Event/Event';
import Connection from '../src/app/Connection/Connection';
import Mapper from '../src/app/Mapper/Mapper';
import Session from '../src/app/Session/Session';

describe("Network",function(){

	//define session in order to prevent error from ComponentManager
	let session=new Session();


	it("Initialization", function(){
		expect(()=>new Network()).not.toThrow();
	});

	it("Create new Components",function(){
		let network=new Network();

		network.create("Component",10,[],{});
		expect(network.groups["Component"].length).toBe(10);

		network.create("Component",5,["Group0","Group1"],{});
		expect(network.groups["Group0"].length).toBe(5);
		expect(network.groups["Group1"].length).toBe(5);

	});

	it("Select - invalid type",function(){
		let network=new Network({
			slots_input:5
		});

		expect(network.select("Non_existing component")).toEqual([]);
	});

	it("Select - existing type",function(){
		let network=new Network({
			slots_input:15
		});
		
		expect(network.select("Input",2,(input)=>input.id>5,Selector.Max("id")).length).toBe(2);
	});

	it("Adding component through event",function(){
		let network=new Network({
			slots_input:5,
			events:[
				new Event({
					name:"add_component",
					condition:(state)=>!state.groups.hasOwnProperty("pool_1")||state.groups["pool_1"].length<10,
					action:(network)=>network.create("Component",1,["pool_1"],{})
				})
			],
		});
		
		for(let i=0;i<100;i++){
			network.tick();
		}

		expect(network.select("pool_1",-1).length).toBe(10);
	});

	it("Establish connection between groups",function(){

		//Approach 1: connect by specifying group names of src and target pool
		let network_spec={
			slots_input:5,
			init:function(network){
				network.create("Component",5,[],{})
			},
			connections:[
				new Connection({
					src:"Input",
					target:"Component",
					mapper:Mapper.Linear
				})
			]
		}

		let network=new Network(network_spec);

		expect(network.groups["Component"].map(component=>component.input_links.length)).toEqual([1,1,1,1,1]);//all synapses have an input component set
		
		//Approac 2: connect by specifying elements for both src and target group

		let random_inputs=network.select("Input",1,(el)=>true,Selector.Random());
		let random_components=network.select("Component",1,(el)=>true,Selector.Random());
		
		network.establish_connection(new Connection({
			src:random_inputs,
			target:random_components,
			mapper:Mapper.Linear
		}));

		expect(random_components[0].input_links).toEqual(random_inputs);


	});

	it("Deleting Inputs",function(){
		let network=new Network({
			slots_input:10,
			init: function(network){
				network.create("Component",10);
			},
			connections:[
				new Connection({
					src:"Input",
					target:"Component",
					mapper:Mapper.Linear
				})
			]
		})
	});


	
});

