

import AStar from "../lib/AStar";
import MapCell, { ECellType } from "./MapCell";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Open extends cc.Component {

    @property(cc.Prefab)
    eCell: cc.Prefab = null;

    @property(cc.Node)
    eLayout: cc.Node = null;

    private star = new AStar();
    private mCells = {};

    private mSize: cc.Vec2 = null;
    private mStart: cc.Vec2 = null;
    private mEnd: cc.Vec2 = null;
    private mObstacles: cc.Vec2[] = [];
    start () {
        const size = cc.v2(10, 10);
        const start = cc.v2(1, 4);
        const end = cc.v2(9, 6);
        const obstacles = [
            cc.v2(5, 0),
            cc.v2(5, 1),
            cc.v2(5, 2),
            cc.v2(5, 3),
            cc.v2(5, 4),
            cc.v2(5, 5),
            cc.v2(5, 6),
            cc.v2(5, 7),
            cc.v2(5, 8),
        ];

        this.init(size, start, end, obstacles);
    }

    init(size: cc.Vec2, start: cc.Vec2, end: cc.Vec2, obstacles: cc.Vec2[] = []) {
        this.mSize = size;
        this.mStart = start;
        this.mEnd = end;
        this.mObstacles = obstacles;
        
        this.initData();
        this.initUI();
    }
    
    initData() {
        this.star.init(this.mSize, this.mStart, this.mEnd, this.mObstacles);
    }
    
    initUI() {
        
        this.mCells = {};
        this.eLayout.removeAllChildren();
        for (let y = 0; y < this.mSize.y; y++){
            for (let x = 0; x < this.mSize.x; x++) {
                this.createCell(x, y);
            }
        }
    
        this.mObstacles.forEach((ele) => {
            this.setCell(ele.x, ele.y, ECellType.OBSTACLES);
        });
        const path = this.star.getClose();
        path.forEach((ele) => {
            this.setCell(ele.x, ele.y, ECellType.PATH);
        });
        this.setCell(this.mStart.x, this.mStart.y, ECellType.START);
        this.setCell(this.mEnd.x, this.mEnd.y, ECellType.END);
    
        this.eLayout.width = 2 + (50 + 2) * this.mSize.x;
        if (this.mSize.x > 10) {
            this.eLayout.scale = 10 / this.mSize.x;
        } else if (this.mSize.y > 10) {
            this.eLayout.scale = 10 / this.mSize.y;
        }
    }

    // 创建cell
    createCell(x: number, y: number) {
        const node = cc.instantiate(this.eCell);
        node.parent = this.eLayout;
        this.mCells[`${x}_${y}`] = node.getComponent(MapCell);
        this.mCells[`${x}_${y}`].init(x, y);
    }

    // 设置cell类型
    setCell(x: number, y: number, type: ECellType) {
        this.mCells[`${x}_${y}`].setType(type);
    }

    // 点击进行一次单步寻路
    onClickNext() {
        this.star.next();
        this.initUI();
    }

    // 点击进行执行寻路
    onClickRun() {
        this.star.run();
        this.initUI();
    }
}
