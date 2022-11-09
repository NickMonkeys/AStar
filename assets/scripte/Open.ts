

import AStar from "../lib/AStar";
import MapCell, { ECellType } from "./MapCell";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Open extends cc.Component {

    @property(cc.Prefab)
    eCell: cc.Prefab = null;

    @property(cc.Node)
    eLayout: cc.Node = null;

    @property(cc.EditBox)
    eX: cc.EditBox = null;

    @property(cc.EditBox)
    eY: cc.EditBox = null;

    @property(cc.Node)
    eEditCheck: cc.Node = null;

    private star = new AStar();
    private mCells = {};

    private mSize: cc.Vec2 = null;
    private mStart: cc.Vec2 = null;
    private mEnd: cc.Vec2 = null;
    private mObstacles: cc.Vec2[] = [];
    private mType: 4|8 = 4; 
    private mEditType: 'start'|'end'|'obs' = null;
    private mLastPath: cc.Vec2[] = [];
    start () {
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

        this.createMap();
        this.setStart(start);
        this.setEnd(end);
        this.setObstacles(obstacles);

        this.runAStar();

        this.refreshUI();
    }

    runAStar() {
        this.star.init(this.mSize, this.mStart, this.mEnd, this.mObstacles);
        this.star.run(this.mType);
    }
    
    refreshUI() {
        this.mObstacles.forEach((ele) => {
            this.setCell(ele, ECellType.OBSTACLES);
        });
        this.mLastPath = this.star.getPath();
        this.mLastPath.forEach((ele) => {
            this.setCell(ele, ECellType.PATH);
        });
        this.setCell(this.mStart, ECellType.START);
        this.setCell(this.mEnd, ECellType.END);
    
        this.eLayout.width = 2 + (50 + 2) * this.mSize.x;
        if (this.mSize.x > 10) {
            this.eLayout.scale = 10 / this.mSize.x;
        } else if (this.mSize.y > 10) {
            this.eLayout.scale = 10 / this.mSize.y;
        }
    }

    createMap() {
        const x = Number(this.eX.string);
        const y = Number(this.eY.string);

        this.mSize = cc.v2(x, y);
        this.mCells = {};
        this.mStart = null;
        this.mEnd = null;
        this.mObstacles = [];

        this.eLayout.destroyAllChildren();
        for (let y = 0; y < this.mSize.y; y++){
            for (let x = 0; x < this.mSize.x; x++) {
                this.createCell(x, y);
            }
        }
    }

    // 创建cell
    createCell(x: number, y: number) {
        const node = cc.instantiate(this.eCell);
        node.parent = this.eLayout;
        this.mCells[`${x}_${y}`] = node.getComponent(MapCell);
        this.mCells[`${x}_${y}`].init(x, y, this.onCellClick.bind(this));
    }

    // 设置cell类型
    setCell(pos: cc.Vec2, type: ECellType) {
        this.mCells[`${pos.x}_${pos.y}`].setType(type);
    }

    // 设置开始节点
    setStart(pos: cc.Vec2) {
        if (this.mStart) {
            this.setCell(this.mStart, ECellType.NOMAL);
        }
        this.setCell(pos, ECellType.START);
        this.mStart = pos;
    }

    // 设置目标节点
    setEnd(pos: cc.Vec2) {
        if (this.mEnd) {
            this.setCell(this.mEnd, ECellType.NOMAL);
        }
        this.setCell(pos, ECellType.END);
        this.mEnd = pos;
    }

    // 设置障碍
    setObstacle(pos: cc.Vec2) {
        if (pos.x === this.mStart.x && pos.y === this.mStart.y) {
            return;
        }
        if (pos.x === this.mEnd.x && pos.y === this.mEnd.y) {
            return;
        }
        let idx = -1;
        for (let i = 0; i < this.mObstacles.length; i++) {
            const ele = this.mObstacles[i];
            if (pos.x === ele.x && pos.y === ele.y) {
                idx = i;
                break;
            }
        }
        if (idx >= 0) {
            this.setCell(pos, ECellType.NOMAL);
            this.mObstacles.splice(idx, 1);
        } else {
            this.setCell(pos, ECellType.OBSTACLES);
            this.mObstacles.push(pos);
        }
    }

    setPath(pos: cc.Vec2) {
        this.setCell(pos, ECellType.PATH);
    }

    clearPath() {
        this.mLastPath.forEach((ele, i) => {
            if (i ===0 || i === this.mLastPath.length - 1) {
                return;
            }
            this.setCell(ele, ECellType.NOMAL);
        })
        this.mLastPath.length = 0;
    }

    // 批量添加障碍物
    setObstacles(posArr: cc.Vec2[]) {
        posArr.forEach((ele) => {
            this.setObstacle(ele);
        });
    }

    // 点击进行一次单步寻路
    onClickNext() {
        this.star.next();
        this.refreshUI();
    }

    // 选择寻路类型
    onClickType(toggle: cc.Toggle, tag: string) {
        this.mType = Number(tag) as any;
    }

    // 点击进行执行寻路
    onClickRun() {
        this.clearPath();
        this.runAStar();
        this.refreshUI();
    }

    // 地图尺寸编辑完毕
    onSizeEditEnd() {
        this.createMap();
    }

    onCellEdit(event: cc.Event.EventTouch, tag: string) {
        if (this.mEditType === tag) {
            this.mEditType = null;
        } else {
            this.mEditType = tag as any;
        }
        if (this.mEditType) {
            this.eEditCheck.position = event.target.position;
            this.eEditCheck.active = true;
            let color = null;
            if (this.mEditType === 'start') {
                color = cc.color(125, 125, 226);
            } else if (this.mEditType === 'end') {
                color = cc.color(226, 125, 125);
            } else if (this.mEditType === 'obs') {
                color = cc.color(125, 125, 125);
            }
            this.eEditCheck.children[0].color = color;
        } else {
            this.eEditCheck.active = false;
        }
    }

    onCellClick(pos: cc.Vec2) {
        if (this.mEditType) {
            this.clearPath();
        }
        
        if (this.mEditType === 'start') {
            this.setStart(pos);
        } else if (this.mEditType === 'end') {
            this.setEnd(pos);
        } else if (this.mEditType === 'obs') {
            this.setObstacle(pos);
        }
    }
}
