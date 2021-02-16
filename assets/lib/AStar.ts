enum NodeState {
    NONE,   // 没有加入列表
    OPEN,   // 在open表
    CLOSE,  // 在close表
}

class Node {
    private _x: number = 0;
    private _y: number = 0;
    public get x() {return this._x;}
    public get y() {return this._y;}
    /**
     * @param x 节点横坐标
     * @param y 节点纵坐标
     */
    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }
}

class AStarNode extends Node {
    public state: NodeState = NodeState.NONE;
    public parent: AStarNode = null;
    public get F() {return this.G + this.H;}
    public G: number = 0;
    public H: number = 0;
}

export default class AStar {

    private mSize: cc.Vec2 = null; // 寻路地图大小
    private mStart: cc.Vec2 = null; // 寻路起始点坐标
    private mEnd: cc.Vec2 = null; // 寻路目标点坐标
    private mObstacles: cc.Vec2[] = null; // 寻路障碍物坐标列表

    private mStartNode: AStarNode = null; // 起始点
    private mEndNode: AStarNode = null; // 目标点
    /**
     * 设置地图横纵最大值
     * @param size 地图大小
     * @param start 寻路起始点
     * @param end 寻路目标点
     * @param obstacles 障碍物
     */
    public init(size: cc.Vec2, start: cc.Vec2, end: cc.Vec2, obstacles: cc.Vec2[] = []) {
        this.mSize = size;
        this.mStart = start;
        this.mEnd = end;
        this.mObstacles = obstacles;
        obstacles.forEach((ele) => {
            this.setObstacles(ele.x, ele.y);
        });

        this.openList = [];
        this.closeList = [];
        this.nodePool = {};

        this.mStartNode  = this.createNode(this.mStart.x, this.mStart.y);
        this.mEndNode    = this.createNode(this.mEnd.x, this.mEnd.y);
        this.add2Open(this.mStartNode);
    }

    public clean() {
        this.mStartNode = null;
        this.mEndNode = null;
    }
    
    private obstacles: {[x_y: string]: boolean} = {};
    /**
     * 设置障碍物
     * @param x 障碍物横坐标
     * @param y 障碍物纵坐标
     */
    public setObstacles(x: number, y: number) {
        if (!this.checkNode(x, y)) return;
        this.obstacles[`${x}_${y}`] = true;
    }
    /**
     * 清除障碍物
     * @param x 障碍物横坐标
     * @param y 障碍物纵坐标
     */
    public clearObstacles(x: number, y: number) {
        delete this.obstacles[`${x}_${y}`];
    }
    /**
     * 检查是否有障碍物
     * @param x 障碍物横坐标
     * @param y 障碍物纵坐标
     */
    public checkObstacles(x: number, y: number) {
        return this.obstacles[`${x}_${y}`];
    }

    /**
     * 检查节点是否在地图内
     * @param x 节点横坐标
     * @param y 节点纵坐标
     */
    public checkNode(x: number, y: number) {
        return x >= 0 && y >= 0 && x <= this.mSize.x && y <= this.mSize.y;
    }

    /**
     * 将node添加到open表
     * @param node 目标node
     */
    private add2Open(node: AStarNode) {
        if (node.state !== NodeState.NONE) {
            cc.error('添加到open异常：', node);
            return;
        }
        node.state = NodeState.OPEN;
        this.openList.push(node);
    }

    /**
     * 将node添加到close表
     * @param node 目标node
     */
    private add2Close(node: AStarNode) {
        if (node.state !== NodeState.NONE) {
            cc.error('添加到close异常：', node);
            return;
        }
        node.state = NodeState.CLOSE;
        this.closeList.push(node);
    }

    /**
     * 取出open表最后一个node，并返回
     */
    private openPop() {
        const node = this.openList.pop();
        if (!node) return null;
        node.state = NodeState.NONE;
        return node;
    }

    ///////////////////////////// 寻路开始 ////////////////////
    private openList: AStarNode[] = [];
    private closeList: AStarNode[] = [];
    private nodePool: {[x_y: string]: AStarNode} = {};
    // 启动寻路
    public run() {
        console.log('##### 寻路开始 #####');
        console.log('出发点:', this.mStart);
        console.log('目标点:', this.mEnd);
        console.log('障碍物:', this.obstacles);
        
        const node = this.openPop();
        if (node == null) {
            console.log('无路可走了');
            return;
        }
        const nodes = this.getEffectiveNodes(node);
        if (nodes.length === 0) {
            console.log('回朔');
            this.run();
            return;
        }
        this.add2Close(node);
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] === this.mEndNode) {
                console.log('##### 寻路完成 #####');
                this.outPath()
                return;
            }
            this.add2Open(nodes[i]);
        }
        this.run();
    }

    // 寻找下一个点
    public next() {
        const node = this.openPop();
        if (node == null) {
            console.log('无路可走了');
            return;
        }
        const nodes = this.getEffectiveNodes(node);
        if (nodes.length === 0) {
            console.log('回朔');
            return;
        }
        this.add2Close(node);
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] === this.mEndNode) {
                console.log('##### 寻路完成 #####');
                this.outPath()
                return;
            }
            this.add2Open(nodes[i]);
        }
    }

    // 输出路径
    private outPath() {
        let node = this.mEndNode;
        while(node) {
            console.log(`x:${node.x}\ty:${node.y}`);
            node = node.parent;
        }
    }

    public getOpen() {
        return this.openList;
    }

    public getClose() {
        return this.closeList;
    }

    // 获取有效的节点，即可前进的子节点
    private getEffectiveNodes(node: AStarNode) {
        if (!node) return [];
        const up    = this.getEffectiveNode(node.x, node.y + 1);
        const down  = this.getEffectiveNode(node.x, node.y - 1);
        const left  = this.getEffectiveNode(node.x - 1, node.y);
        const right = this.getEffectiveNode(node.x + 1, node.y);
        const nodes: AStarNode[] = [];
        up      && nodes.push(up);
        down    && nodes.push(down);
        left    && nodes.push(left);
        right   && nodes.push(right);
        nodes.forEach((ele) => {
            this.initNode(ele, node);
            ele.parent = node;
        });
        nodes.sort((a, b) => b.F - a.F);
        return nodes;
    }

    private getEffectiveNode(x: number, y: number): AStarNode {
        if (!this.checkNode(x, y)) return null;
        if (this.checkObstacles(x, y)) return null;
        const node = this.getNode(x, y);
        if (!node || node.state !== NodeState.NONE) return null;
        return node;
    }

    private initNode(node: AStarNode, curr: AStarNode) {
        if (!this.mEndNode) return;
        node.H = Math.abs(node.x - this.mEndNode.x) + Math.abs(node.y - this.mEndNode.y);
        node.G = Math.abs(node.x - this.mStartNode.x) + Math.abs(node.y - this.mStartNode.y);
    }

    private getNode(x: number, y: number): AStarNode {
        if (!this.checkNode(x, y)) return;
        if (this.checkObstacles(x, y)) return;
        const key = this.getNodeKey(x, y);
        return this.nodePool[key] || this.createNode(x, y); 
    }
    private createNode(x: number, y: number) {
        const key = this.getNodeKey(x, y);
        this.nodePool[key] = new AStarNode(x, y);
        return this.nodePool[key];
    }

    private getNodeKey(x: number, y: number) {
        return `${x}_${y}`;
    }
}
