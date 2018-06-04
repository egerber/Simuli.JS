import DirectedGraph from '../src/app/Graph/DirectedGraph';

describe("DirectedGraph",function(){
	it("add edges",function(){
		let graph=new DirectedGraph([10,20,30,40]);

		graph.add_edge(10,20);
		graph.add_edge(20,30);
		graph.add_edge(30,40);

		expect(graph.adj_list).toEqual({10:[20],20:[30],30:[40],40:[]});
	});

	it("ordering",function(){

		//acyclic case
		let graph=new DirectedGraph([1,2,3,4,5]);
		graph.add_edge(5,1);
		graph.add_edge(1,3);
		graph.add_edge(1,4);
		graph.add_edge(4,2);

		expect(graph.get_order()).toEqual([5,1,4,2,3]);

		//cyclic case
		graph=new DirectedGraph([1,2,3,4,5]);
		graph.add_edge(1,2);
		graph.add_edge(2,3);
		graph.add_edge(3,1);
		graph.add_edge(3,4);
		graph.add_edge(4,1);
		graph.add_edge(4,5);

		expect(graph.get_order()).toEqual([1,2,3,4,5]);
	})
});