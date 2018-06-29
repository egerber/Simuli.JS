import DirectedGraph from '../src/Graph/DirectedGraph';
import _ from 'lodash';

describe("DirectedGraph",function(){

	it("adding_edge",function(){
		let graph=new DirectedGraph();
		graph.add_node(1);
		graph.add_node(2);
		graph.add_node(3);
		graph.add_edge(1,2,1);
		graph.add_edge(1,3,1);
		graph.add_edge(2,3,1);

		expect(_.values(graph.connections)).toContainEqual([1,2,1]);
		expect(_.values(graph.connections)).toContainEqual([1,3,1]);
		expect(_.values(graph.connections)).toContainEqual([2,3,1]);
	});

	it("removing_edge",function(){
		let graph=new DirectedGraph();
		graph.add_node(1);
		graph.add_node(2);
		graph.add_node(3);

		let id=graph.add_edge(1,2,1);
		graph.add_edge(1,3,1);
		graph.add_edge(2,3,1);

		graph.remove_edge(id);
		expect(_.values(graph.connections)).not.toContainEqual([1,2,1]);
	});

	it("remove node",function(){
		let graph=new DirectedGraph();
		graph.add_node(1);
		graph.add_node(2);
		graph.add_node(3);

		graph.add_edge(1,2,1);
		graph.add_edge(1,3,1);
		graph.add_edge(2,1,1);
		graph.add_edge(2,3,1);

		graph.remove_node(1);
		expect(_.values(graph.connections)).not.toContainEqual([1,2,1]);
		expect(_.values(graph.connections)).not.toContainEqual([1,3,1]);
		expect(_.values(graph.connections)).not.toContainEqual([2,1,1]);
	});

	it("changing order for un_delayed edges",function(){

		let graph=new DirectedGraph();
		graph.add_node(1);
		graph.add_node(2);
		graph.add_node(3);
		graph.add_node(4);
		graph.add_node(5);
		graph.add_edge(5,1,0);
		graph.add_edge(1,3,0);
		graph.add_edge(1,4,0);
		graph.add_edge(4,2,0);

		expect(graph.order).toEqual([5,1,4,2,3]);
	});

	it("changing order for delayed edges", function(){
		let graph=new DirectedGraph([1,2,3,4,5]);
		graph.add_node(1);
		graph.add_node(2);
		graph.add_node(3);
		graph.add_node(4);
		graph.add_node(5);
		graph.add_edge(5,1,1);
		graph.add_edge(1,3,0);
		graph.add_edge(1,4,0);
		graph.add_edge(4,2,0);

		expect(graph.order).toEqual([1,4,2,3,5]);

	})

	it("changing order when deleting edges", function(){
		let graph=new DirectedGraph([1,2,3]);
		graph.add_node(1);
		graph.add_node(2);
		graph.add_node(3);
		graph.add_edge(1,2,0);
		graph.add_edge(2,3,0);
		let id=graph.add_edge(3,1,0);

		graph.remove_edge(id);
		expect(graph.order).toEqual([1,2,3]);
	});
});
