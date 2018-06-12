import System from '../src/app/System/System';
import Components from '../src/app/Components/ComponentTypes';
import DynamicVariables from '../src/app/DynamicVariables/DynamicVariables';
import Competition from '../src/app/Competition/Competition';
import Mapper from '../src/app/Mapper/Mapper';
import Event from '../src/app/Event/Event';
import Connection from '../src/app/Connection/Connection';
import Selector from '../src/app/Selector/Selector';
import Session from '../src/app/Session/Session';
import _ from 'lodash';

describe("System",function(){

	it("Instantiation",function(){
		
		//define session in order to prevent error from ComponentFactory
		let session=new Session();

		let func=function(){
			let system=new System()
			.add_component("Input",{},"input_1")
			.add_component("Component",{},"comp_1")
			.add_component("Component",{},"comp_2")
			.connect("input_1","comp_1","feedforward",true)
			.connect("comp_1","comp_2","feedforward",true)
		}

		expect(func).not.toThrow();
	});

	it("Synapse Network, competition for reconnection",function(){
		
		let world_spec={
			slots_input:2,
			count_outputs:2,
			period:5
		};

		let synapse_spec={
			init_state:{
				reconnections:0
			}
		};

		let session=new Session()
			.define_component("Synapse",synapse_spec)

		let network_spec={
			init_state:{
				limit_reconnections:1,
			},
			slots_input:2,
			count_outputs:2,
			components:{
				"Synapse":synapse_spec
			},
			init:function(network){
				network.create("Synapse",2,[]);
			},
			connections:[
				new Connection({
					src:"Input",
					target:"Synapse",
					mapper:Mapper.Linear
				}),
				new Connection({
					src:"Synapse", 
					target:"Output",
					mapper:Mapper.Random
				})
			],
			events:[
				new Event({
					name:"compete_reconnect",
					condition:()=>true,
					action:function(network){
						this.competition(
							network.select("Synapse"),
							network.state.limit_reconnections,
							(component)=>{
								component.state.reconnections++;
								component.inputs=this.selector(network.select("Input"));
							}
							
						);
					},
					init:function(){
						this.competition=Competition.KBest((component)=>-1*component.state.score);
						this.selector=Selector.Random();
					},
					interval:10
				})
			]
		}

		let system=new System()
		.add_component("PeriodicPattern",world_spec,"input")
		.add_component("Network", network_spec,"network")
		.connect("input","network")
		.connect("network","input");
		
		for(let i=0;i<50;i++){
			system.tick();
		}

		let sum_reconnections=system.select("network").select("Synapse").reduce((sum,component)=>sum+component.state.reconnections,0);

		expect(sum_reconnections).toBe(5);//Both Synapses should have been reconnected 5 times in total together
		
	});

	
});
