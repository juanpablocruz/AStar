import { randomUUID } from "crypto";
import { exit } from "process";

let verbose = false
class Connection {
	_from: Node
	_to: Node
	_cost: number

	constructor(from: Node, to: Node, cost: number) {
		this._from = from
		this._to = to
		this._cost = cost
	}
}

function getConnectionString(path: Connection[], starts = "A,"){
	return starts + path.reverse().reduce((acc, it) => [...acc, it._to.label], [] as string[])
				.join(",")
}

class Node {
	heuristic: number
	id: string
	label: string
	connections: Connection[] = []

	constructor(heuristic: number, label: string) {
		this.heuristic = heuristic
		this.label = label
		this.id = randomUUID()
	}

	addConnection(connection: Connection) {
		this.connections.push(connection)
	}
}

let Stack: Connection[][] = []
let paths: Connection[] = []

function calcCost(path: Connection[]) {
	const totalCost = path.reduce((acc, item) => {		
		return acc + item._cost
	}, 0)
	return totalCost + path[0]._to.heuristic
}

function printStack() {
	let path = ""
	Stack.forEach((c) => {
		path += `[${getConnectionString(c)}](${calcCost(c)}), `
	})
	console.log({path});
}

function sortAlphabetically(a: Connection, b: Connection) {
	return a._to.label < b._to.label ? -1 : a._to.label > b._to.label ? 1 : 0
}

function search(from: Node, to: Node, currentPath: Connection[] = [], step=0) {
	if (from.id === to.id) {
		return currentPath
	}
	
	Stack = from.connections.sort(sortAlphabetically).reverse().reduce((acc, node) => {
		return [[node, ...currentPath], ...acc]
	}, Stack)

	let candidate = Stack[0] 
	let minCost = calcCost(candidate)
	let index = 0

	for (let i = 1; i < Stack.length; i++) {
		let currCost = calcCost(Stack[i])
		if (currCost < minCost) {
			minCost = currCost
			candidate = Stack[i]
			index = i
		}
	}
	if (verbose) {
		console.log(`Paso ${step+1}, expando: ${candidate[0]._to.label} (${minCost})`);
	}
	Stack.splice(index, 1)
	return search(candidate[0]._to, to, candidate,step+1)
}

function run() {
	const M = new Node(0, "M")
	const K = new Node(2, "K")
	const L = new Node(2, "L")
	const J = new Node(3, "J")
	const I = new Node(2, "I")
	const F = new Node(3, "F")
	const G = new Node(3, "G")
	const H = new Node(4, "H")
	const D = new Node(5, "D")
	const C = new Node(3, "C")
	const B = new Node(4, "B")
	const E = new Node(2, "E")
	const A = new Node(6, "A")

	A.addConnection(new Connection(A, B, 2))
	A.addConnection(new Connection(A, C, 2))
	A.addConnection(new Connection(A, D, 1))
	B.addConnection(new Connection(B, E, 2))
	B.addConnection(new Connection(B, F, 1))
	C.addConnection(new Connection(C, F, 1))
	C.addConnection(new Connection(C, G, 1))
	D.addConnection(new Connection(D, G, 1))
	D.addConnection(new Connection(D, H, 1))
	H.addConnection(new Connection(H, G, 1))
	G.addConnection(new Connection(G, K, 3))
	F.addConnection(new Connection(F, K, 2))
	F.addConnection(new Connection(F, J, 1))
	E.addConnection(new Connection(E, I, 1))
	I.addConnection(new Connection(I, L, 1))
	J.addConnection(new Connection(J, L, 2))
	K.addConnection(new Connection(K, M, 2))
	L.addConnection(new Connection(L, M, 1))

	const path = search(A, M)
	const pathString = getConnectionString(path)
	if (verbose) {
		printStack()
	}

	console.log(pathString);
}

function extractFlags() {
	let args = {
		verbose: false, 
		help: false
	}
	return process.argv.slice(2).reduce((acc, item) => {
		if (item === "-v") {
			return {...acc, verbose: true}
		}
		if (item === "-h") {
			return {...acc, help: true}
		}
		return acc
	},args)
}

const args = extractFlags()
if (args.help) {
	console.log(`
-h for this help screen
-v for verbose output
	`);
	exit(0)
}

if (args.verbose) {
	verbose = true
}

run()
