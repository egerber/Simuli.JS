import ConnectionManager from '../src/Manager/ConnectionManager';
import Session from '../src/Session/Session';

describe("ConnectionManager",function(){

	let session=new Session()
	.schema("Component",{})
	.system({
		init:function(state){
			state.members.add("Component",10)
		}
	})

	it("add_connection",function(){
		let id1=ConnectionManager.add_connection(0,1,0,"feedforward");
		let id2=ConnectionManager.add_connection(1,2,1,"feedback");

		expect(session.computational_graph.graph_feedforward.connections[id1]).toEqual([0,1,0]);
		expect(session.computational_graph.graph_feedback.connections[id2]).toEqual([1,2,1]);
	});

	it("remove_connection",function(){

	});

	it("add_node", function(){

	});

	it("remove_node",function(){

	});

	it("get_in_connections",function(){

	});

	it("resolve_connections",function(){

	});

	it("get_out_connections",function(){

	});

});